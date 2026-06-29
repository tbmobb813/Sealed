import {
  Controller,
  Get,
  Head,
  Header,
  HttpCode,
  Post,
  Req,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { DropboxSignWebhookService } from "./dropbox-sign.webhook.service";

const WEBHOOK_ACK = "Hello API Event Received";

@Controller("webhooks/dropbox-sign")
export class DropboxSignWebhookController {
  constructor(
    private readonly dropboxSignWebhookService: DropboxSignWebhookService,
  ) {}

  // Dropbox Sign dashboard "Test" probes with GET/HEAD before saving the URL.
  @Public()
  @Get()
  verifyCallbackUrl(@Res() res: Response) {
    res.status(200).setHeader("Content-Type", "text/plain").end(WEBHOOK_ACK);
  }

  @Public()
  @Head()
  verifyCallbackUrlHead(@Res() res: Response) {
    res.status(200).setHeader("Content-Type", "text/plain").end();
  }

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
