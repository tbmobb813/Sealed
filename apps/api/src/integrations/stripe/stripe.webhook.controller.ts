import { Controller, Headers, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { StripeService } from "./stripe.service";

@Controller("webhooks/stripe")
export class StripeWebhookController {
  constructor(private readonly stripeService: StripeService) {}

  @Public()
  @Post()
  handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature: string,
  ) {
    const payload = req.rawBody ?? Buffer.from("");
    const event = this.stripeService.constructEvent(payload, signature);

    return { received: true, type: event.type };
  }
}
