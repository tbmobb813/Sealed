import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { publicApiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { AcceptProposalButton } from "@/components/features/proposals/accept-proposal-button";
import { DeclineProposalButton } from "@/components/features/proposals/decline-proposal-button";
import type { PublicProposalView } from "@sealed/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicProposalPage({
  params,
}: {
  params: { token: string };
}) {
  let proposal: PublicProposalView | null = null;

  try {
    const response = await publicApiClient<{ data: PublicProposalView }>(
      `/proposals/public/${params.token}`,
    );
    proposal = response.data;
  } catch {
    // API may not be running
  }

  if (!proposal) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Proposal Not Found</h1>
        <p className="text-muted-foreground mt-2">
          This proposal may have expired or the link is invalid.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">{proposal.tenantName}</p>
        <h1 className="text-3xl font-bold mt-1">{proposal.title}</h1>
        <p className="text-muted-foreground mt-2">
          Prepared for {proposal.contactName}
        </p>
        <div className="mt-4">
          <StatusBadge status={proposal.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-sm font-medium">Description</th>
                <th className="pb-3 text-right text-sm font-medium">Qty</th>
                <th className="pb-3 text-right text-sm font-medium">Price</th>
                <th className="pb-3 text-right text-sm font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.lineItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">
                    <MoneyDisplay amount={item.unitPrice} currency={proposal.currency} />
                  </td>
                  <td className="py-3 text-right">
                    <MoneyDisplay amount={item.total} currency={proposal.currency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                Subtotal: <MoneyDisplay amount={Number(proposal.subtotal)} currency={proposal.currency} />
              </p>
              {Number(proposal.taxAmount) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Tax: <MoneyDisplay amount={Number(proposal.taxAmount)} currency={proposal.currency} />
                </p>
              )}
              <p className="text-lg font-bold">
                Total: <MoneyDisplay amount={Number(proposal.totalAmount)} currency={proposal.currency} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {proposal.expiresAt && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          This proposal expires on{" "}
          {formatDate(proposal.expiresAt)}
        </p>
      )}

      {proposal.status === "SENT" || proposal.status === "VIEWED" ? (
        <div className="mt-8 flex flex-col items-center gap-4">
          <AcceptProposalButton token={params.token} />
          <DeclineProposalButton token={params.token} />
        </div>
      ) : proposal.status === "ACCEPTED" ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-6 py-4 text-center mt-8">
          <p className="text-green-800 font-medium">
            You have accepted this proposal.
          </p>
        </div>
      ) : proposal.status === "REJECTED" ? (
        <div className="rounded-lg bg-muted border px-6 py-4 text-center mt-8">
          <p className="font-medium">You have declined this proposal.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Contact {proposal.tenantName} if you would like a revised proposal.
          </p>
        </div>
      ) : proposal.status === "EXPIRED" ? (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-6 py-4 text-center mt-8">
          <p className="text-amber-800 font-medium">
            This proposal has expired.
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Contact {proposal.tenantName} to request a new one.
          </p>
        </div>
      ) : null}
    </div>
  );
}