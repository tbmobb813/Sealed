import { Body, Controller, Headers, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { DropboxSignWebhookService } from "./dropbox-sign.webhook.service";

@Controller("webhooks/dropbox-sign")
export class DropboxSignWebhookController {
  constructor(
    private readonly dropboxSignWebhookService: DropboxSignWebhookService,
  ) {}

  @Public()
  @Post()
  handleWebhook(
    @Body() body: unknown,
    @Headers("x-hellosign-signature") signature: string,
  ) {
    return this.dropboxSignWebhookService.handleWebhook(body, signature);
  }
}
