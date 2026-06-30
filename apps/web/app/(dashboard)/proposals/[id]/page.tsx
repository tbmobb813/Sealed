import { notFound } from "next/navigation";
import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { ProposalActions } from "@/components/features/proposals/proposal-actions";
import { ProposalClientLink } from "@/components/features/proposals/proposal-client-link";
import { apiClient } from "@/lib/api-client";
import type { Proposal } from "@sealed/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let proposal: Proposal;

  try {
    const response = await apiClient<{ data: Proposal }>(
      `/proposals/${params.id}`,
    );
    proposal = response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes("not found") ||
        error.message === "API error: 404")
    ) {
      notFound();
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to load proposal.",
    );
  }

  return (
    <div>
      <PageHeader
        title={proposal.title}
        action={<StatusBadge status={proposal.status} />}
      />
      <div className="space-y-6">
        <ProposalClientLink
          publicToken={proposal.publicToken}
          status={proposal.status}
        />
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {proposal.lineItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    <MoneyDisplay amount={item.unitPrice} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoneyDisplay amount={item.total} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-right space-y-1">
            <p className="text-sm text-muted-foreground">
              Total:{" "}
              <MoneyDisplay
                amount={Number(proposal.totalAmount)}
                className="font-bold text-foreground"
              />
            </p>
          </div>
          {proposal.status === "DRAFT" && (
            <ProposalActions proposalId={proposal.id} />
          )}
          {proposal.status === "ACCEPTED" && (
            <Button asChild>
              <Link href={`/agreements/new?proposalId=${proposal.id}`}>
                Create Agreement
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
