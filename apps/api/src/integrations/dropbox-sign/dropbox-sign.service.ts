import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as api from "@dropbox/sign";
import * as models from "@dropbox/sign";
import { Readable } from "stream";

type DropboxSignEventPayload = {
  event?: {
    event_time?: string;
    event_type?: string;
    event_hash?: string;
  };
};

@Injectable()
export class DropboxSignService {
  private readonly client: api.SignatureRequestApi;

  constructor(private readonly config: ConfigService) {
    this.client = new api.SignatureRequestApi();
    this.client.username = this.apiKey ?? "";
  }

  get apiKey(): string | undefined {
    return this.config.get<string>("DROPBOX_SIGN_API_KEY");
  }

  /** E2E/CI uses a fake key — never call the live Dropbox Sign API. */
  private get isStubMode(): boolean {
    if (process.env.NODE_ENV === "production") return false;
    if (this.config.get<string>("DROPBOX_SIGN_STUB") === "true") return true;
    return this.apiKey === "test_dropbox_sign_key";
  }

  /** Max age of a webhook event before it is rejected as a replay. */
  private static readonly WEBHOOK_MAX_AGE_SECONDS = 300;

  verifyWebhook(payload: DropboxSignEventPayload): boolean {
    const apiKey = this.apiKey;
    if (!apiKey) return false;

    const eventTime = payload.event?.event_time;
    const eventType = payload.event?.event_type;
    const eventHash = payload.event?.event_hash;

    if (!eventTime || !eventType || !eventHash) return false;

    // The HMAC only covers event_time + event_type, so an old captured hash
    // could be replayed with a tampered payload. Reject stale events.
    const ageSeconds = Math.abs(Date.now() / 1000 - Number(eventTime));
    if (!Number.isFinite(ageSeconds) || ageSeconds > DropboxSignService.WEBHOOK_MAX_AGE_SECONDS) {
      return false;
    }

    const expected = crypto
      .createHmac("sha256", apiKey)
      .update(`${eventTime}${eventType}`)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(eventHash, "hex"),
      );
    } catch {
      return false;
    }
  }

  /**
   * Confirms the actual status of a signature request against the Dropbox
   * Sign API. The webhook HMAC does not cover signature_request_id, so the
   * webhook body alone must never be trusted to flip an agreement to SIGNED.
   */
  async confirmSignatureRequestStatus(
    signatureRequestId: string,
  ): Promise<"signed" | "declined" | "pending"> {
    if (!this.apiKey) {
      throw new Error("Dropbox Sign is not configured");
    }

    if (this.isStubMode) {
      return signatureRequestId.includes("declined") ? "declined" : "signed";
    }

    const response = await this.client.signatureRequestGet(signatureRequestId);
    const request = response.body.signatureRequest;

    if (request?.isDeclined) return "declined";
    if (request?.isComplete) return "signed";
    return "pending";
  }

  async createSignatureRequest(
    agreementId: string,
    signerEmail: string,
    agreementBody: string,
  ) {
    if (!this.apiKey) {
      throw new Error("Dropbox Sign is not configured");
    }

    if (this.isStubMode) {
      return { signatureRequestId: `sig_stub_${agreementId}_${Date.now()}` };
    }

    // Create an in-memory readable stream from the agreement body text.
    // Dropbox Sign accepts any Node.js readable stream in the files array.
    const fileStream = Readable.from(Buffer.from(agreementBody, "utf8"));
    // The SDK uses the stream's path property as the filename if present.
    (fileStream as any).path = "agreement.txt";

    const signer: models.SubSignatureRequestSigner = {
      name: signerEmail,
      emailAddress: signerEmail,
      order: 0,
    };

    const signatureRequestSendRequest: models.SignatureRequestSendRequest = {
      title: `Agreement ${agreementId}`,
      subject: "Please sign this agreement",
      message: "Please review and sign this agreement.",
      signers: [signer],
      files: [fileStream as any],
      testMode: this.config.get<string>("DROPBOX_SIGN_TEST_MODE") !== "false",
      metadata: {
        agreementId,
      },
    };

    const response = await this.client.signatureRequestSend(
      signatureRequestSendRequest,
    );

    const signatureRequestId =
      response.body.signatureRequest?.signatureRequestId;

    if (!signatureRequestId) {
      throw new Error("Dropbox Sign did not return a signature request ID");
    }

    return { signatureRequestId };
  }
}