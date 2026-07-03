export type ProposalStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface ProposalLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Proposal {
  id: string;
  tenantId: string;
  contactId: string;
  publicToken: string;
  title: string;
  description: string | null;
  lineItems: ProposalLineItem[];
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  status: ProposalStatus;
  sentAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  expiresAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProposalView {
  title: string;
  description: string | null;
  status: ProposalStatus;
  lineItems: ProposalLineItem[];
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  currency: string;
  contactName: string;
  tenantName: string;
  expiresAt: string | null;
}

export interface CreateProposalInput {
  contactId: string;
  title: string;
  description?: string;
  lineItems: Omit<ProposalLineItem, "total">[];
  taxAmount?: number;
  expiresAt?: string;
}
