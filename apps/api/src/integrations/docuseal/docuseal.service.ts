import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

type DocuSealSubmission = {
  id?: number | string;
  status?: string;
  submitters?: Array<{ submission_id?: number | string }>;
};

@Injectable()
export class DocuSealService {
  constructor(private readonly config: ConfigService) {}

  get apiKey(): string | undefined {
    return this.config.get<string>("DOCUSEAL_API_KEY");
  }

  private get baseUrl(): string {
    return (
      this.config.get<string>("DOCUSEAL_API_URL") ?? "https://api.docuseal.com"
    );
  }

  /** E2E/CI uses a fake key — never call the live DocuSeal API. */
  private get isStubMode(): boolean {
    if (process.env.NODE_ENV === "production") return false;
    if (this.config.get<string>("DOCUSEAL_STUB") === "true") return true;
    return this.apiKey === "test_docuseal_key";
  }

  /**
   * The webhook payload carries no HMAC over its body, so the only
   * transport-level check is a shared-secret header configured in the
   * DocuSeal webhook settings. Actual state changes are additionally
   * confirmed against the API (see confirmSignatureRequestStatus).
   */
  verifyWebhookSecret(headerValue: string | undefined): boolean {
    const secret = this.config.get<string>("DOCUSEAL_WEBHOOK_SECRET");
    if (!secret || !headerValue) return false;

    const expected = Buffer.from(secret);
    const received = Buffer.from(headerValue);
    if (expected.length !== received.length) return false;
    return crypto.timingSafeEqual(expected, received);
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "X-Auth-Token": this.apiKey ?? "",
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      let message = `DocuSeal API ${method} ${path} failed (${response.status})`;
      try {
        const data = (await response.json()) as { error?: string };
        if (data?.error) message = data.error;
      } catch {
        // Non-JSON error body — keep the generic message.
      }
      throw new Error(message);
    }

    return response.json();
  }

  /**
   * Confirms the actual status of a submission against the DocuSeal API.
   * The webhook body must never be trusted on its own to flip an
   * agreement to SIGNED — the shared-secret header does not cover the
   * submission ID in the payload.
   */
  async confirmSignatureRequestStatus(
    signatureRequestId: string,
  ): Promise<"signed" | "declined" | "pending"> {
    if (!this.apiKey) {
      throw new Error("DocuSeal is not configured");
    }

    if (this.isStubMode) {
      return signatureRequestId.includes("declined") ? "declined" : "signed";
    }

    const submission = (await this.request(
      "GET",
      `/submissions/${signatureRequestId}`,
    )) as DocuSealSubmission;

    if (submission?.status === "declined") return "declined";
    if (submission?.status === "completed") return "signed";
    return "pending";
  }

  async createSignatureRequest(
    agreementId: string,
    signerEmail: string,
    agreementBody: string,
  ): Promise<{ signatureRequestId: string }> {
    if (!this.apiKey) {
      throw new Error("DocuSeal is not configured");
    }

    if (this.isStubMode) {
      return { signatureRequestId: `sub_stub_${agreementId}_${Date.now()}` };
    }

    const submission = (await this.request("POST", "/submissions/html", {
      name: `Agreement ${agreementId}`,
      documents: [
        {
          name: `Agreement ${agreementId}`,
          html: this.renderAgreementHtml(agreementBody),
        },
      ],
      send_email: true,
      submitters: [{ email: signerEmail, role: "Signer" }],
      metadata: { agreementId },
    })) as DocuSealSubmission;

    // /submissions/html returns the submission object; some endpoints
    // return the submitters array instead — accept either shape.
    const signatureRequestId =
      submission?.id ?? submission?.submitters?.[0]?.submission_id;

    if (signatureRequestId === undefined || signatureRequestId === null) {
      throw new Error("DocuSeal did not return a submission ID");
    }

    return { signatureRequestId: String(signatureRequestId) };
  }

  /**
   * Best-effort cleanup when a submission was created but the agreement
   * send transaction failed — avoids orphaned signature requests.
   */
  async cancelSignatureRequest(signatureRequestId: string): Promise<void> {
    if (!this.apiKey || this.isStubMode) {
      return;
    }

    await this.request("DELETE", `/submissions/${signatureRequestId}`);
  }

  /**
   * Agreement bodies are plain text; DocuSeal field tags in the HTML
   * define where the signer signs and dates.
   */
  private renderAgreementHtml(agreementBody: string): string {
    const escaped = agreementBody
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return [
      '<div style="font-family: serif; font-size: 12px; white-space: pre-wrap;">',
      escaped,
      "</div>",
      '<div style="margin-top: 40px;">',
      '<signature-field name="Signature" role="Signer" style="width: 200px; height: 60px; display: inline-block;"></signature-field>',
      '<date-field name="Date signed" role="Signer" style="width: 120px; height: 24px; display: inline-block; margin-left: 24px;"></date-field>',
      "</div>",
    ].join("\n");
  }
}
