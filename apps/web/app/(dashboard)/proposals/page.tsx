import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@sealed/ui";
import { apiClient } from "@/lib/api-client";
import type { Proposal } from "@sealed/types";

export default async function ProposalsPage() {
  let proposals: Proposal[] = [];

  try {
    const response = await apiClient<{ data: Proposal[] }>("/proposals");
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
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {proposals.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No proposals yet
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
                  <td className="px-4 py-3">
                    <StatusBadge status={proposal.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${Number(proposal.totalAmount).toFixed(2)}
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
