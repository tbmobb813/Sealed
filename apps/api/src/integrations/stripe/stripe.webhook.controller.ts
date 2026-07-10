import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { StripeService } from "./stripe.service";
import { StripeWebhookService } from "./stripe.webhook.service";

@Controller("webhooks/stripe")
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly stripeWebhookService: StripeWebhookService,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature: string,
  ) {
    const payload = req.rawBody ?? Buffer.from("");
    let event;
    try {
      event = this.stripeService.constructEvent(payload, signature);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Rejected Stripe webhook: ${message}`);
      throw new BadRequestException("Invalid Stripe webhook signature");
    }

    // Always ack a verified event with 200 — a non-2xx makes Stripe retry
    // and eventually disable the endpoint. Permanent failures (e.g. invalid
    // state transition) would retry forever without ever succeeding.
    try {
      await this.stripeWebhookService.handleEvent(event);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Stripe webhook handler failed for ${event.type}: ${message}`,
      );
    }

    return { received: true, type: event.type };
  }
}
