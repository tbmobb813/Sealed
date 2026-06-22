import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
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

  async create(tenantId: string, userId: string, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: dto.invoiceId, tenantId },
      });

      if (!invoice) {
        throw new NotFoundException("Invoice not found");
      }

      const payment = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          currency: dto.currency ?? "USD",
          provider: dto.provider ?? "MANUAL",
          status: "PENDING",
        },
        include: { invoice: true },
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

      return payment;
    });
  }
}
