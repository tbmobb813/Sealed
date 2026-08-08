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
  // Dropbox Sign posts a multipart form with a single `json` field; bound
  // the parser so the public endpoint can't be used for upload DoS.
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: {
        files: 5,
        fileSize: 1024 * 1024,
        fields: 20,
        fieldSize: 1024 * 1024,
        // Dropbox Sign's payload is a single flat `json` field — it never
        // uses bracket-notation field names. Without this, multer defaults
        // to unlimited nesting depth (GHSA-72gw-mp4g-v24j): a single small
        // request with a deeply nested field name (`a[a][a]...`) can exhaust
        // CPU/memory building the resulting object. @nestjs/platform-express
        // 11.1.27's MulterOptions type predates this multer 2.2.0 option —
        // the `as` cast below is for the stale type only, multer's runtime
        // (verified in its source) honors the option regardless.
        fieldNestingDepth: 0,
      } as { files: number; fileSize: number; fields: number; fieldSize: number; fieldNestingDepth: number },
    }),
  )
  async handleWebhook(@Req() req: Request) {
    const body = req.body as Record<string, string | unknown>;
    let payload: unknown;
    let rawJson: string;

    if (typeof body.json === "string") {
      rawJson = body.json;
      try {
        payload = JSON.parse(rawJson);
      } catch {
        // Malformed payload — acknowledge so Dropbox Sign doesn't retry/disable the callback URL.
        return WEBHOOK_ACK;
      }
    } else {
      // Fallback for integration tests sending application/json
      payload = body;
      try {
        rawJson = JSON.stringify(body);
      } catch {
        // A pathological body (e.g. deeply nested, or otherwise
        // unstringifiable) — ack rather than let this throw uncaught.
        return WEBHOOK_ACK;
      }
    }

    return this.dropboxSignWebhookService.handleWebhook(payload, rawJson);
  }
}
