export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "VOID"
  | "OVERDUE";

export interface Invoice {
  id: string;
  tenantId: string;
  agreementId: string;
  contactId: string;
  publicToken: string;
  number: string;
  lineItems: unknown[];
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  currency: string;
  status: InvoiceStatus;
  dueDate: string | null;
  sentAt: string | null;
  paidAt: string | null;
  stripePaymentLinkUrl: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  agreementId: string;
  contactId: string;
  subtotal: number;
  taxAmount?: number;
  dueDate?: string;
}
