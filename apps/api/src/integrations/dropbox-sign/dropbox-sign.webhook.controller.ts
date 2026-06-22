import { Body, Controller, Headers, Post } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { DropboxSignService } from "./dropbox-sign.service";

@Controller("webhooks/dropbox-sign")
export class DropboxSignWebhookController {
  constructor(private readonly dropboxSignService: DropboxSignService) {}

  @Public()
  @Post()
  handleWebhook(
    @Body() body: unknown,
    @Headers("x-hellosign-signature") signature: string,
  ) {
    const valid = this.dropboxSignService.verifyWebhook(body, signature);
    return { received: valid };
  }
}
