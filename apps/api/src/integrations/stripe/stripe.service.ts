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
      return {
        id: `plink_${Date.now()}`,
        url: `https://pay.stripe.test/invoices/${params.invoiceId}`,
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
          url: `${appUrl}/invoices/paid?invoiceId=${params.invoiceId}`,
        },
      },
    });

    return {
      id: paymentLink.id,
      url: paymentLink.url,
    };
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
