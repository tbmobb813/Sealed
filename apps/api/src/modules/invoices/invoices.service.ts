import { assertMutable } from "../../common/constants/mutability";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  INVOICE_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { assertMoneyInRange } from "../../common/helpers/assert-money-in-range";
import { assertPrecondition } from "../../common/helpers/assert-precondition";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { throwIntegrationError } from "../../common/helpers/throw-integration-error";
import { ResendService } from "../../integrations/resend/resend.service";
import { StripeService } from "../../integrations/stripe/stripe.service";
import { CreateInvoiceDto, UpdateInvoiceDto } from "./dto/create-invoice.dto";

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly resend: ResendService,
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

      // Compute the max numerically — a string orderBy on `number` sorts
      // "INV-9999" above "INV-10000" and would reissue duplicates.
      const [row] = await tx.$queryRaw<{ max: number | null }[]>`
        SELECT MAX(CAST(SUBSTRING(number FROM 5) AS INTEGER)) AS max
        FROM invoices
        WHERE tenant_id = ${tenantId}
      `;
      const nextNumber = (row?.max ?? 0) + 1;
      const subtotalDecimal = new Prisma.Decimal(dto.subtotal);
      const taxAmountDecimal = new Prisma.Decimal(dto.taxAmount ?? 0);
      const totalAmount = subtotalDecimal.add(taxAmountDecimal);
      // Reject before hitting the DB — a Decimal(12,2) overflow at insert
      // time surfaces as an uncaught 500, not a clean validation error.
      assertMoneyInRange(subtotalDecimal, "subtotal");
      assertMoneyInRange(totalAmount, "totalAmount");

      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          agreementId: dto.agreementId,
          contactId: dto.contactId,
          number: `INV-${String(nextNumber).padStart(4, "0")}`,
          subtotal: subtotalDecimal,
          taxAmount: taxAmountDecimal,
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
      assertMoneyInRange(subtotal, "subtotal");
      assertMoneyInRange(totalAmount, "totalAmount");

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
    // External call happens outside the transaction: Stripe latency would
    // otherwise hold a DB connection and can exceed the interactive
    // transaction timeout, aborting the commit after the link was created.
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { contact: true },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (!invoice.contact) {
      throw new NotFoundException("Contact not found");
    }

    assertTransition(INVOICE_TRANSITIONS, invoice.status, "SENT", "invoice");

    const amountCents = invoice.totalAmount
      .mul(100)
      .toDecimalPlaces(0)
      .toNumber();

    let stripePaymentLinkId: string;
    let stripePaymentLinkUrl: string;
    let stripePriceId: string | undefined;
    try {
      const paymentLink = await this.stripeService.createPaymentLink({
        amountCents,
        currency: invoice.currency,
        invoiceId: invoice.id,
      });
      if (!paymentLink.id || !paymentLink.url) {
        throw new Error("Payment link creation returned incomplete data");
      }
      stripePaymentLinkId = paymentLink.id;
      stripePaymentLinkUrl = paymentLink.url;
      stripePriceId = paymentLink.priceId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Payment link creation failed";
      throwIntegrationError("Stripe", message);
    }

    const { updated, tenantName } = await this.prisma
      .$transaction(async (tx) => {
        const current = await tx.invoice.findFirst({
          where: { id, tenantId },
          include: { contact: true },
        });

        if (!current) {
          throw new NotFoundException("Invoice not found");
        }

        if (!current.contact) {
          throw new NotFoundException("Contact not found");
        }

        // Re-check inside the transaction to guard against concurrent sends.
        assertTransition(
          INVOICE_TRANSITIONS,
          current.status,
          "SENT",
          "invoice",
        );

        const tenant = await tx.tenant.findUnique({
          where: { id: current.tenantId },
          select: { name: true },
        });

        await tx.invoice.updateMany({
          where: { id, tenantId },
          data: {
            status: "SENT",
            sentAt: new Date(),
            stripePaymentLinkId,
            stripePaymentLinkUrl,
          },
        });

        const sent = await tx.invoice.findFirst({
          where: { id, tenantId },
          include: { contact: true, agreement: true, payments: true },
        });

        if (!sent) {
          throw new NotFoundException("Invoice not found");
        }

        if (!sent.contact) {
          throw new NotFoundException("Contact not found");
        }

        await emitActivityEvent(tx, {
          tenantId,
          actorId: userId,
          objectType: "invoice",
          objectId: id,
          eventType: "invoice.sent",
          metadata: {
            number: sent.number,
            totalAmount: sent.totalAmount.toString(),
          },
        });

        return { updated: sent, tenantName: tenant?.name };
      })
      .catch(async (error: unknown) => {
        // Link was created before the tx — deactivate so clients cannot pay a
        // DRAFT invoice if the commit failed (concurrent send, state race, etc.).
        try {
          await this.stripeService.deactivatePaymentLink(
            stripePaymentLinkId,
            stripePriceId,
          );
        } catch {
          // Best-effort cleanup; surface the original failure.
        }
        throw error;
      });

    // Email only after the transaction commits — otherwise a rollback would
    // send a payment request for an invoice that was never marked SENT.
    const contact = updated.contact;
    if (contact) {
      void this.resend.sendInvoiceLink({
        toEmail: contact.email,
        toName: contact.name,
        invoiceNumber: updated.number,
        tenantName: tenantName ?? "Your service provider",
        totalAmount: `$${updated.totalAmount.toString()}`,
        paymentUrl: updated.stripePaymentLinkUrl ?? "",
      });
    }

    return updated;
  }
}
