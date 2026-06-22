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

  async createPaymentIntent(amount: number, currency = "usd") {
    if (!this.stripe) {
      throw new Error("Stripe is not configured");
    }

    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
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
