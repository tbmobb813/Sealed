export type AgreementStatus =
  | "DRAFT"
  | "SENT"
  | "SIGNED"
  | "DECLINED"
  | "CANCELED";

export interface Agreement {
  id: string;
  tenantId: string;
  proposalId: string;
  contactId: string;
  publicToken: string;
  title: string;
  body: string;
  status: AgreementStatus;
  signatureRequestId: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgreementInput {
  proposalId: string;
  contactId: string;
  title: string;
  body: string;
}
