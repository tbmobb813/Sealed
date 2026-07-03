import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Proposal } from "@sealed/types";

// The API includes the contact relation on list responses.
type ProposalRow = Proposal & { contact?: { name: string } };

export default async function ProposalsPage() {
  let proposals: ProposalRow[] = [];

  try {
    const response = await apiClient<{ data: ProposalRow[] }>("/proposals");
    proposals = response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load proposals.",
    );
  }

  return (
    <div>
      <PageHeader
        title="Proposals"
        description="Create and send proposals to clients"
        action={
          <Button asChild>
            <Link href="/proposals/new">New Proposal</Link>
          </Button>
        }
      />
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Sent</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Expires</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No proposals yet.{" "}
                  <Link href="/proposals/new" className="underline">
                    Create your first proposal
                  </Link>
                </td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr key={proposal.id} className="border-b">
                  <td className="px-4 py-3">
                    <Link
                      href={`/proposals/${proposal.id}`}
                      className="font-medium hover:underline"
                    >
                      {proposal.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {proposal.contact?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(proposal.sentAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(proposal.expiresAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoneyDisplay
                      amount={Number(proposal.totalAmount)}
                      currency={proposal.currency}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
