import { PageHeader } from "@/components/features/shared/page-header";
import { ProposalForm } from "@/components/features/proposals/proposal-form";
import { apiClient } from "@/lib/api-client";
import type { Contact } from "@sealed/types";

export default async function NewProposalPage() {
  let contacts: Contact[] = [];

  try {
    const response = await apiClient<{ data: Contact[] }>("/contacts");
    contacts = response.data;
  } catch {
    // API may not be running
  }

  return (
    <div>
      <PageHeader title="New Proposal" description="Create a new proposal" />
      <ProposalForm contacts={contacts} />
    </div>
  );
}
