import { Injectable } from "@nestjs/common";
import { DocuSealService } from "../docuseal/docuseal.service";

export type SignatureProviderName = "docuseal";

/**
 * Thin wrapper around the e-signature provider (DocuSeal). Kept as a
 * separate seam — rather than injecting DocuSealService directly into
 * agreements.service.ts — so a future second provider doesn't require
 * touching agreement send/cancel logic again.
 */
@Injectable()
export class SignatureProviderService {
  constructor(private readonly docuSealService: DocuSealService) {}

  get providerName(): SignatureProviderName {
    return "docuseal";
  }

  get displayName(): string {
    return "DocuSeal";
  }

  createSignatureRequest(
    agreementId: string,
    signerEmail: string,
    agreementBody: string,
  ): Promise<{ signatureRequestId: string }> {
    return this.docuSealService.createSignatureRequest(
      agreementId,
      signerEmail,
      agreementBody,
    );
  }

  cancelSignatureRequest(signatureRequestId: string): Promise<void> {
    return this.docuSealService.cancelSignatureRequest(signatureRequestId);
  }
}
