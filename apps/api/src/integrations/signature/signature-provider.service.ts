import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DropboxSignService } from "../dropbox-sign/dropbox-sign.service";
import { DocuSealService } from "../docuseal/docuseal.service";

export type SignatureProviderName = "dropbox_sign" | "docuseal";

/**
 * Selects the active e-signature provider via SIGNATURE_PROVIDER
 * (default: dropbox_sign). Both providers stay registered so their
 * webhooks keep working for in-flight requests created before a switch —
 * the env var only controls which provider new requests go to.
 */
@Injectable()
export class SignatureProviderService {
  constructor(
    private readonly config: ConfigService,
    private readonly dropboxSignService: DropboxSignService,
    private readonly docuSealService: DocuSealService,
  ) {}

  get providerName(): SignatureProviderName {
    const configured = this.config.get<string>("SIGNATURE_PROVIDER");
    if (configured === "docuseal") return "docuseal";
    if (configured && configured !== "dropbox_sign") {
      throw new Error(`Unknown SIGNATURE_PROVIDER: ${configured}`);
    }
    return "dropbox_sign";
  }

  get displayName(): string {
    return this.providerName === "docuseal" ? "DocuSeal" : "Dropbox Sign";
  }

  private get active(): DropboxSignService | DocuSealService {
    return this.providerName === "docuseal"
      ? this.docuSealService
      : this.dropboxSignService;
  }

  createSignatureRequest(
    agreementId: string,
    signerEmail: string,
    agreementBody: string,
  ): Promise<{ signatureRequestId: string }> {
    return this.active.createSignatureRequest(
      agreementId,
      signerEmail,
      agreementBody,
    );
  }

  /** Cancels on the provider that created the request, not the active one. */
  cancelSignatureRequest(
    signatureRequestId: string,
    provider: SignatureProviderName = this.providerName,
  ): Promise<void> {
    const service =
      provider === "docuseal" ? this.docuSealService : this.dropboxSignService;
    return service.cancelSignatureRequest(signatureRequestId);
  }
}
