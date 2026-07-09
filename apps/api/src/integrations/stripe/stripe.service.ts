import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe | null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>("STRIPE_SECRET_KEY");
    this.stripe = apiKey ? new Stripe(apiKey) : null;
  }

  get client(): Stripe | null {
    return this.stripe;
  }

  async createPaymentLink(params: {
    amountCents: number;
    currency: string;
    invoiceId: string;
  }) {
    if (!this.stripe) {
      // The stub link is dev-only: silently emailing a dead payment URL to a
      // real client is worse than failing the send loudly.
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "Stripe is not configured — refusing to issue a stub payment link in production",
        );
      }
      return {
        id: `plink_${Date.now()}`,
        url: `https://pay.stripe.test/invoices/${params.invoiceId}`,
        priceId: undefined,
      };
    }

    // Payment links require a Price object — inline price_data is not supported.
    const price = await this.stripe.prices.create({
      currency: params.currency.toLowerCase(),
      unit_amount: params.amountCents,
      product_data: {
        name: `Invoice ${params.invoiceId}`,
      },
    });

    const appUrl =
      this.config.get<string>("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000";

    const paymentLink = await this.stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: params.invoiceId,
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${appUrl}/invoices/paid?invoiceId=${encodeURIComponent(params.invoiceId)}`,
        },
      },
    });

    if (!paymentLink.url) {
      throw new Error("Stripe did not return a payment link URL");
    }

    return {
      id: paymentLink.id,
      url: paymentLink.url,
      priceId: price.id,
    };
  }

  /**
   * Best-effort cleanup when a payment link was created but the invoice
   * send transaction failed — deactivates the link and archives the Price
   * so neither remains usable for a DRAFT invoice.
   */
  async deactivatePaymentLink(
    paymentLinkId: string,
    priceId?: string,
  ): Promise<void> {
    if (!this.stripe) {
      return;
    }

    await this.stripe.paymentLinks.update(paymentLinkId, { active: false });
    if (priceId) {
      await this.stripe.prices.update(priceId, { active: false });
    }
  }

  constructEvent(payload: Buffer, signature: string) {
    if (!this.stripe) {
      throw new Error("Stripe is not configured");
    }

    const webhookSecret = this.config.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Stripe webhook secret is not configured");
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
