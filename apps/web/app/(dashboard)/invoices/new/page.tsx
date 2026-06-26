import { notFound } from "next/navigation";
import { PageHeader } from "@/components/features/shared/page-header";
import { InvoiceForm } from "@/components/features/invoices/invoice-form";
import { apiClient } from "@/lib/api-client";
import type { Agreement, Proposal } from "@sealed/types";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: { agreementId?: string };
}) {
  const agreementId = searchParams.agreementId;

  if (!agreementId) {
    notFound();
  }

  let agreement: Agreement | null = null;
  let proposal: Proposal | null = null;

  try {
    const [agreementRes, ] = await Promise.all([
      apiClient<{ data: Agreement }>(`/agreements/${agreementId}`),
    ]);
    agreement = agreementRes.data;
  } catch {
    notFound();
  }

  if (agreement.status !== "SIGNED") {
    notFound();
  }

  try {
    const proposalRes = await apiClient<{ data: Proposal }>(
      `/proposals/${agreement.proposalId}`,
    );
    proposal = proposalRes.data;
  } catch {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="New Invoice"
        description={`Creating invoice for agreement: ${agreement.title}`}
      />
      <InvoiceForm
        agreementId={agreement.id}
        contactId={agreement.contactId}
        defaultSubtotal={Number(proposal.totalAmount)}
        defaultTaxAmount={Number(proposal.taxAmount)}
      />
    </div>
  );
}