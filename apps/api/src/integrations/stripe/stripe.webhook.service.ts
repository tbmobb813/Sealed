import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import Stripe from "stripe";
import {
  assertTransition,
  INVOICE_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        return;
      case "checkout.session.async_payment_succeeded":
        await this.handleAsyncPaymentSucceeded(
          event.data.object as Stripe.Checkout.Session,
        );
        return;
      case "checkout.session.async_payment_failed":
        await this.handleAsyncPaymentFailed(
          event.data.object as Stripe.Checkout.Session,
        );
        return;
    }

    this.logger.log(`Unhandled Stripe event: ${event.type}`);
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const invoiceId = session.metadata?.invoiceId;
    if (!invoiceId) {
      this.logger.warn(
        `checkout.session.completed missing invoiceId in metadata: ${session.id}`,
      );
      return;
    }

    // Delayed payment methods (e.g. ACH direct debit via us_bank_account)
    // complete checkout immediately but the debit itself settles days
    // later and can still fail (insufficient funds, closed account, ...).
    // Stripe reflects that with payment_status "unpaid" here — only a
    // "paid" status means money has actually landed. Anything else is
    // resolved later by async_payment_succeeded/async_payment_failed.
    if (session.payment_status !== "paid") {
      await this.recordPendingPayment(session, invoiceId);
      return;
    }

    await this.applySuccessfulPayment(session, invoiceId);
  }

  private async handleAsyncPaymentSucceeded(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const invoiceId = session.metadata?.invoiceId;
    if (!invoiceId) {
      this.logger.warn(
        `checkout.session.async_payment_succeeded missing invoiceId in metadata: ${session.id}`,
      );
      return;
    }

    await this.applySuccessfulPayment(session, invoiceId);
  }

  private async handleAsyncPaymentFailed(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const invoiceId = session.metadata?.invoiceId;
    if (!invoiceId) {
      this.logger.warn(
        `checkout.session.async_payment_failed missing invoiceId in metadata: ${session.id}`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { providerPaymentId: session.id },
      });

      if (!payment) {
        this.logger.warn(
          `checkout.session.async_payment_failed for unrecorded session ${session.id} (invoice ${invoiceId})`,
        );
        return;
      }

      if (payment.status !== "PENDING") {
        this.logger.log(
          `Stripe session ${session.id} already resolved as ${payment.status} — skipping failure`,
        );
        return;
      }

      const invoice = await tx.invoice.findFirst({ where: { id: invoiceId } });
      if (!invoice) {
        this.logger.warn(
          `checkout.session.async_payment_failed for unknown invoice ${invoiceId} (session ${session.id})`,
        );
        return;
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failedAt: new Date() },
      });

      await emitActivityEvent(tx, {
        tenantId: invoice.tenantId,
        actorId: invoice.createdByUserId,
        objectType: "invoice",
        objectId: invoiceId,
        eventType: "invoice.payment_failed",
        metadata: {
          number: invoice.number,
          amount: payment.amount.toString(),
        },
      });

      this.logger.warn(
        `Stripe payment failed to settle for invoice ${invoiceId} (session ${session.id})`,
      );
    });
  }

  /**
   * Records a checkout session whose payment hasn't settled yet
   * (payment_status !== "paid") as a PENDING payment, without touching the
   * invoice. async_payment_succeeded/async_payment_failed resolve it later.
   */
  private async recordPendingPayment(
    session: Stripe.Checkout.Session,
    invoiceId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const alreadyRecorded = await tx.payment.findUnique({
        where: { providerPaymentId: session.id },
      });
      if (alreadyRecorded) {
        return;
      }

      const invoice = await tx.invoice.findFirst({ where: { id: invoiceId } });
      if (!invoice) {
        this.logger.warn(
          `checkout.session.completed for unknown invoice ${invoiceId} (session ${session.id})`,
        );
        return;
      }

      const amount = session.amount_total
        ? new Prisma.Decimal(session.amount_total).div(100)
        : invoice.totalAmount;

      await tx.payment.create({
        data: {
          tenantId: invoice.tenantId,
          invoiceId: invoice.id,
          provider: "STRIPE",
          providerPaymentId: session.id,
          amount,
          currency: session.currency?.toUpperCase() ?? invoice.currency,
          status: "PENDING",
        },
      });

      this.logger.log(
        `Invoice ${invoiceId} payment pending settlement (session ${session.id}, payment_status=${session.payment_status})`,
      );
    });
  }

  private async applySuccessfulPayment(
    session: Stripe.Checkout.Session,
    invoiceId: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // providerPaymentId is unique — an already-succeeded session means this
      // event was processed; ack the retry without double-applying it.
      const existingPayment = await tx.payment.findUnique({
        where: { providerPaymentId: session.id },
      });
      if (existingPayment?.status === "SUCCEEDED") {
        this.logger.log(`Stripe session ${session.id} already processed — skipping`);
        return;
      }

      // Serialize with any concurrent payment (manual or another Stripe
      // event) against this invoice — amountPaid below is a
      // read-modify-write and a race would silently drop one side's
      // contribution. Same lock key as the manual-payment path.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${invoiceId}))`;

      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId },
      });

      if (!invoice) {
        // Ack unknown IDs: a non-2xx makes Stripe retry and eventually
        // disable the webhook endpoint, and a 404 is an enumeration side-channel.
        this.logger.warn(
          `Stripe payment success for unknown invoice ${invoiceId} (session ${session.id})`,
        );
        return;
      }

      if (invoice.status === "PAID") {
        this.logger.log(`Invoice ${invoiceId} already marked PAID — skipping`);
        return;
      }

      const paidNow = session.amount_total
        ? new Prisma.Decimal(session.amount_total).div(100)
        : invoice.totalAmount;

      // Accumulate onto whatever's already been recorded (e.g. a manual
      // partial payment) rather than overwriting — mirrors the manual
      // payment path so the two channels can't clobber each other.
      const amountPaid = (invoice.amountPaid ?? new Prisma.Decimal(0)).add(paidNow);
      const nextStatus = amountPaid.gte(invoice.totalAmount) ? "PAID" : "PARTIALLY_PAID";

      if (invoice.status !== nextStatus) {
        assertTransition(INVOICE_TRANSITIONS, invoice.status, nextStatus, "invoice");
      }

      // Record the payment itself — invoice status and the payments table
      // must agree on where the money came from. A pending ACH record
      // created earlier is resolved in place rather than duplicated.
      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: { status: "SUCCEEDED", succeededAt: new Date() },
        });
      } else {
        await tx.payment.create({
          data: {
            tenantId: invoice.tenantId,
            invoiceId: invoice.id,
            provider: "STRIPE",
            providerPaymentId: session.id,
            amount: paidNow,
            currency: session.currency?.toUpperCase() ?? invoice.currency,
            status: "SUCCEEDED",
            succeededAt: new Date(),
          },
        });
      }

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: nextStatus,
          amountPaid,
          ...(nextStatus === "PAID" ? { paidAt: new Date() } : {}),
        },
      });

      await emitActivityEvent(tx, {
        tenantId: invoice.tenantId,
        actorId: invoice.createdByUserId,
        objectType: "invoice",
        objectId: invoiceId,
        eventType: nextStatus === "PAID" ? "invoice.paid" : "invoice.partially_paid",
        metadata: {
          number: invoice.number,
          amountPaid: amountPaid.toString(),
        },
      });

      this.logger.log(`Invoice ${invoiceId} now ${nextStatus} via Stripe webhook`);
    });
  }
}
