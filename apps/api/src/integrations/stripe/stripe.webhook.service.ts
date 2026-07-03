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
    if (event.type === "checkout.session.completed") {
      await this.handleCheckoutSessionCompleted(
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

    await this.prisma.$transaction(async (tx) => {
      // providerPaymentId is unique — an already-recorded session means this
      // event was processed; ack the retry without double-applying it.
      const alreadyProcessed = await tx.payment.findUnique({
        where: { providerPaymentId: session.id },
      });
      if (alreadyProcessed) {
        this.logger.log(`Stripe session ${session.id} already processed — skipping`);
        return;
      }

      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId },
      });

      if (!invoice) {
        // Ack unknown IDs: a non-2xx makes Stripe retry and eventually
        // disable the webhook endpoint, and a 404 is an enumeration side-channel.
        this.logger.warn(
          `checkout.session.completed for unknown invoice ${invoiceId} (session ${session.id})`,
        );
        return;
      }

      if (invoice.status === "PAID") {
        this.logger.log(`Invoice ${invoiceId} already marked PAID — skipping`);
        return;
      }

      assertTransition(
        INVOICE_TRANSITIONS,
        invoice.status,
        "PAID",
        "invoice",
      );

      const amountPaid = session.amount_total
        ? new Prisma.Decimal(session.amount_total).div(100)
        : invoice.totalAmount;

      // Record the payment itself — invoice status and the payments table
      // must agree on where the money came from.
      await tx.payment.create({
        data: {
          tenantId: invoice.tenantId,
          invoiceId: invoice.id,
          provider: "STRIPE",
          providerPaymentId: session.id,
          amount: amountPaid,
          currency: session.currency?.toUpperCase() ?? invoice.currency,
          status: "SUCCEEDED",
          succeededAt: new Date(),
        },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          amountPaid,
        },
      });

      await emitActivityEvent(tx, {
        tenantId: invoice.tenantId,
        actorId: invoice.createdByUserId,
        objectType: "invoice",
        objectId: invoiceId,
        eventType: "invoice.paid",
        metadata: {
          number: invoice.number,
          amountPaid: amountPaid.toString(),
        },
      });

      this.logger.log(`Invoice ${invoiceId} marked PAID via Stripe webhook`);
    });
  }
}
