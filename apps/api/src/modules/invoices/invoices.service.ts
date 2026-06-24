import { assertMutable } from "../../common/constants/mutability";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  INVOICE_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { assertPrecondition } from "../../common/helpers/assert-precondition";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { throwIntegrationError } from "../../common/helpers/throw-integration-error";
import { StripeService } from "../../integrations/stripe/stripe.service";
import { CreateInvoiceDto, UpdateInvoiceDto } from "./dto/create-invoice.dto";

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  findAll(tenantId: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId },
      include: { contact: true, agreement: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { contact: true, agreement: true, payments: true },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return invoice;
  }

  async create(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { id: dto.agreementId, tenantId },
      });

      if (!agreement) {
        throw new NotFoundException("Agreement not found");
      }

      assertPrecondition(agreement.status === "SIGNED", {
        entityName: "agreement",
        sourceId: agreement.id,
        currentStatus: agreement.status,
        requiredStatus: "SIGNED",
      });

      const contact = await tx.contact.findFirst({
        where: { id: dto.contactId, tenantId },
      });

      if (!contact) {
        throw new NotFoundException("Contact not found");
      }

      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${tenantId}))`;

      const count = await tx.invoice.count({ where: { tenantId } });
      const taxAmount = dto.taxAmount ?? 0;
      const totalAmount = dto.subtotal + taxAmount;

      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          agreementId: dto.agreementId,
          contactId: dto.contactId,
          number: `INV-${String(count + 1).padStart(4, "0")}`,
          subtotal: dto.subtotal,
          taxAmount,
          totalAmount,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          createdByUserId: userId,
        },
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "invoice",
        objectId: invoice.id,
        eventType: "invoice.created",
        metadata: {
          number: invoice.number,
          totalAmount: invoice.totalAmount.toString(),
        },
      });

      return invoice;
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpdateInvoiceDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new NotFoundException("Invoice not found");
      }

      // 🔒 IMMUTABILITY GUARD
      // Invoices freeze on send. A sent invoice represents a real billable
      // amount and the audit trail must remain intact.
      assertMutable("invoice", existing.status);

      const subtotal =
        dto.subtotal !== undefined
          ? new Prisma.Decimal(dto.subtotal)
          : existing.subtotal;
      const taxAmount =
        dto.taxAmount !== undefined
          ? new Prisma.Decimal(dto.taxAmount)
          : existing.taxAmount;
      const totalAmount = subtotal.add(taxAmount);

      await tx.invoice.updateMany({
        where: { id, tenantId },
        data: {
          subtotal,
          taxAmount,
          totalAmount,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        },
      });

      const invoice = await tx.invoice.findFirst({
        where: { id, tenantId },
        include: { contact: true, agreement: true, payments: true },
      });

      if (!invoice) {
        throw new NotFoundException("Invoice not found");
      }

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "invoice",
        objectId: id,
        eventType: "invoice.updated",
        metadata: {
          number: invoice.number,
          totalAmount: invoice.totalAmount.toString(),
        },
      });

      return invoice;
    });
  }

  async send(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id, tenantId },
        include: { contact: true, agreement: true, payments: true },
      });

      if (!invoice) {
        throw new NotFoundException("Invoice not found");
      }

      assertTransition(INVOICE_TRANSITIONS, invoice.status, "SENT", "invoice");

      const amountCents = invoice.totalAmount
        .mul(100)
        .toDecimalPlaces(0)
        .toNumber();

      let stripePaymentLinkId: string;
      let stripePaymentLinkUrl: string;
      try {
        const paymentLink = await this.stripeService.createPaymentLink({
          amountCents,
          currency: invoice.currency,
          invoiceId: invoice.id,
        });
        stripePaymentLinkId = paymentLink.id;
        stripePaymentLinkUrl = paymentLink.url ?? "";
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Payment link creation failed";
        throwIntegrationError("Stripe", message);
      }

      await tx.invoice.updateMany({
        where: { id, tenantId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          stripePaymentLinkId,
          stripePaymentLinkUrl,
        },
      });

      const updated = await tx.invoice.findFirst({
        where: { id, tenantId },
        include: { contact: true, agreement: true, payments: true },
      });

      if (!updated) {
        throw new NotFoundException("Invoice not found");
      }

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "invoice",
        objectId: id,
        eventType: "invoice.sent",
        metadata: {
          number: updated.number,
          totalAmount: updated.totalAmount.toString(),
        },
      });

      return updated;
    });
  }
}
