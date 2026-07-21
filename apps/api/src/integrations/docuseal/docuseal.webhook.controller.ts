import {
  Body,
  Controller,
  Header,
  Headers,
  HttpCode,
  Post,
} from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { DocuSealWebhookService } from "./docuseal.webhook.service";

/**
 * DocuSeal posts application/json. Authentication is a shared-secret
 * header configured in the DocuSeal webhook settings (header name
 * X-Webhook-Secret, value = DOCUSEAL_WEBHOOK_SECRET).
 */
@Controller("webhooks/docuseal")
export class DocuSealWebhookController {
  constructor(
    private readonly docuSealWebhookService: DocuSealWebhookService,
  ) {}

  @Public()
  @Post()
  @HttpCode(200)
  @Header("Content-Type", "text/plain")
  async handleWebhook(
    @Body() body: unknown,
    @Headers("x-webhook-secret") secretHeader: string | undefined,
  ) {
    return this.docuSealWebhookService.handleWebhook(body, secretHeader);
  }
}
