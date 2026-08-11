import {
  BadRequestException,
  ConflictException,
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

    try {
      await this.stripeWebhookService.handleEvent(event);
    } catch (err: unknown) {
      // ConflictException (INVALID_STATE_TRANSITION) is the one error this
      // handler can throw for a reason retrying will never fix — e.g. the
      // invoice already moved on through some other path. Ack it so Stripe
      // doesn't retry forever and eventually disable the endpoint.
      //
      // Anything else (a dropped DB connection, an unexpected exception) is
      // exactly what SHOULD make Stripe retry — swallowing those here would
      // silently drop the event with no path to reconciliation. Let them
      // propagate to the global exception filter, which defaults to 500.
      if (err instanceof ConflictException) {
        this.logger.warn(
          `Stripe webhook handler rejected ${event.type} as an invalid state transition — acking without retry: ${err.message}`,
        );
        return { received: true, type: event.type };
      }

      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Stripe webhook handler failed for ${event.type}: ${message}`,
      );
      throw err;
    }

    return { received: true, type: event.type };
  }
}
