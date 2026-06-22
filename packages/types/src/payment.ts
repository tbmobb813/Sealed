export type PaymentProvider = "STRIPE" | "MANUAL" | "OTHER";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  succeededAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
}
