import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { ClerkService } from "./clerk.service";

@Controller("webhooks/clerk")
export class ClerkWebhookController {
  constructor(private readonly clerkService: ClerkService) {}

  @Public()
  @Post()
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string,
  ) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException("Missing svix headers");
    }

    const body = req.rawBody?.toString("utf8") ?? "";

    if (!body) {
      throw new BadRequestException("Missing request body");
    }

    const event = this.clerkService.verifyWebhook(body, {
      svixId,
      svixTimestamp,
      svixSignature,
    });

    return this.clerkService.handleEvent(event);
  }
}
