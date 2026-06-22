import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { publicApiClient } from "@/lib/api-client";
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
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left text-sm font-medium">
                  Description
                </th>
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
                    <MoneyDisplay amount={item.unitPrice} />
                  </td>
                  <td className="py-3 text-right">
                    <MoneyDisplay amount={item.total} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                Subtotal: <MoneyDisplay amount={Number(proposal.subtotal)} />
              </p>
          { proposal.taxAmount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Tax: <MoneyDisplay amount={Number(proposal.taxAmount)} />
                </p>
              )}
              <p className="text-lg font-bold">
                Total: <MoneyDisplay amount={Number(proposal.totalAmount)} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {proposal.expiresAt && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          This proposal expires on{" "}
          {new Date(proposal.expiresAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
