import { notFound } from "next/navigation";
import { PageHeader } from "@/components/features/shared/page-header";
import { AgreementForm } from "@/components/features/agreements/agreement-form";
import { apiClient } from "@/lib/api-client";
import type { Proposal } from "@sealed/types";

export default async function NewAgreementPage(
  props: {
    searchParams: Promise<{ proposalId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const proposalId = searchParams.proposalId;

  if (!proposalId) {
    notFound();
  }

  let proposal: Proposal | null = null;

  try {
    const response = await apiClient<{ data: Proposal }>(
      `/proposals/${proposalId}`,
    );
    proposal = response.data;
  } catch {
    notFound();
  }

  if (proposal.status !== "ACCEPTED") {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="New Agreement"
        description={`Creating agreement for proposal: ${proposal.title}`}
      />
      <AgreementForm
        proposalId={proposal.id}
        contactId={proposal.contactId}
        defaultTitle={`Agreement — ${proposal.title}`}
      />
    </div>
  );
}