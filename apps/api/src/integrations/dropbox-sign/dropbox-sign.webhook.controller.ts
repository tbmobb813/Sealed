import {
  Controller,
  Header,
  HttpCode,
  Post,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { DropboxSignWebhookService } from "./dropbox-sign.webhook.service";

@Controller("webhooks/dropbox-sign")
export class DropboxSignWebhookController {
  constructor(
    private readonly dropboxSignWebhookService: DropboxSignWebhookService,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  @Header("Content-Type", "text/plain")
  @UseInterceptors(AnyFilesInterceptor())
  async handleWebhook(@Req() req: Request) {
    const body = req.body as Record<string, string | unknown>;
    let payload: unknown;
    let rawJson: string;

    if (typeof body.json === "string") {
      rawJson = body.json;
      payload = JSON.parse(rawJson);
    } else {
      // Fallback for integration tests sending application/json
      payload = body;
      rawJson = JSON.stringify(body);
    }

    return this.dropboxSignWebhookService.handleWebhook(payload, rawJson);
  }
}
