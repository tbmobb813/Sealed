import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DropboxSignService {
  constructor(private readonly config: ConfigService) {}

  get apiKey(): string | undefined {
    return this.config.get<string>("DROPBOX_SIGN_API_KEY");
  }

  async createSignatureRequest(_agreementId: string, _signerEmail: string) {
    if (!this.apiKey) {
      throw new Error("Dropbox Sign is not configured");
    }

    // Integration stub — wire to Dropbox Sign API
    return { signatureRequestId: `sr_${Date.now()}` };
  }

  verifyWebhook(_payload: unknown, _signature: string): boolean {
    const secret = this.config.get<string>("DROPBOX_SIGN_WEBHOOK_SECRET");
    return Boolean(secret);
  }
}
