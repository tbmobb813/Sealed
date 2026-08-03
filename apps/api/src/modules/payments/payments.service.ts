import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  INVOICE_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { assertPrecondition } from "../../common/helpers/assert-precondition";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.payment.findMany({
      where: { tenantId },
      include: { invoice: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, tenantId },
      include: { invoice: true },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return payment;
  }

  // Records money already received (e.g. a check or bank transfer) and
  // reconciles the invoice: amountPaid accumulates and status advances to
  // PARTIALLY_PAID or PAID accordingly.
  async create(tenantId: string, userId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      // Serialize with any concurrent payment (manual or Stripe webhook)
      // against this invoice — amountPaid below is a read-modify-write and
      // a race would silently drop one side's contribution.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${dto.invoiceId}))`;

      const invoice = await tx.invoice.findFirst({
        where: { id: dto.invoiceId, tenantId },
      });

      if (!invoice) {
        throw new NotFoundException("Invoice not found");
      }

      const payableStatuses = ["SENT", "PARTIALLY_PAID", "OVERDUE"];
      assertPrecondition(payableStatuses.includes(invoice.status), {
        entityName: "invoice",
        sourceId: invoice.id,
        currentStatus: invoice.status,
        requiredStatus: payableStatuses.join(" | "),
      });

      const amount = new Prisma.Decimal(dto.amount);
      const outstanding = invoice.totalAmount.sub(invoice.amountPaid ?? 0);
      if (amount.gt(outstanding)) {
        throw new BadRequestException(
          `Payment of ${amount.toString()} exceeds outstanding balance of ${outstanding.toString()}`,
        );
      }

      const payment = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: dto.invoiceId,
          amount,
          currency: dto.currency ?? invoice.currency,
          provider: dto.provider ?? "MANUAL",
          status: "SUCCEEDED",
          succeededAt: new Date(),
        },
        include: { invoice: true },
      });

      const newAmountPaid = (invoice.amountPaid ?? new Prisma.Decimal(0)).add(amount);
      const nextStatus = newAmountPaid.gte(invoice.totalAmount)
        ? "PAID"
        : "PARTIALLY_PAID";

      if (invoice.status !== nextStatus) {
        assertTransition(INVOICE_TRANSITIONS, invoice.status, nextStatus, "invoice");
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          status: nextStatus,
          ...(nextStatus === "PAID" ? { paidAt: new Date() } : {}),
        },
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "payment",
        objectId: payment.id,
        eventType: "payment.created",
        metadata: {
          amount: payment.amount.toString(),
          invoiceId: payment.invoiceId,
        },
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "invoice",
        objectId: invoice.id,
        eventType: nextStatus === "PAID" ? "invoice.paid" : "invoice.partially_paid",
        metadata: {
          number: invoice.number,
          amountPaid: newAmountPaid.toString(),
        },
      });

      return payment;
    });
  }
}
