import { notFound } from "next/navigation";
import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { ProposalActions } from "@/components/features/proposals/proposal-actions";
import { ProposalClientLink } from "@/components/features/proposals/proposal-client-link";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Proposal } from "@sealed/types";

type ProposalDetail = Proposal & { contact?: { name: string; email: string } };
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let proposal: ProposalDetail;

  try {
    const response = await apiClient<{ data: ProposalDetail }>(
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
        <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">Contact</dt>
            <dd className="font-medium">
              {proposal.contact?.name ?? "—"}
              {proposal.contact?.email && (
                <span className="block text-sm text-muted-foreground">
                  {proposal.contact.email}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Sent</dt>
            <dd className="font-medium">{formatDate(proposal.sentAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Viewed by client</dt>
            <dd className="font-medium">{formatDate(proposal.viewedAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              {proposal.status === "ACCEPTED"
                ? "Accepted"
                : proposal.status === "REJECTED"
                  ? "Declined"
                  : "Expires"}
            </dt>
            <dd className="font-medium">
              {proposal.status === "ACCEPTED" || proposal.status === "REJECTED"
                ? formatDate(proposal.respondedAt)
                : formatDate(proposal.expiresAt)}
            </dd>
          </div>
        </dl>
        <div className="overflow-x-auto rounded-lg border">
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
