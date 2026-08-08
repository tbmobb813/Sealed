import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { publicApiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { AcceptProposalButton } from "@/components/features/proposals/accept-proposal-button";
import { DeclineProposalButton } from "@/components/features/proposals/decline-proposal-button";
import type { PublicProposalView } from "@sealed/types";

export default async function PublicProposalPage(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;
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
      <article
        id="main-content"
        className="rounded-lg bg-card px-6 py-10 shadow-sm ring-1 ring-border sm:px-12 sm:py-14"
      >
        <header className="border-b pb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {proposal.tenantName}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {proposal.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-muted-foreground">
              Prepared for {proposal.contactName}
            </p>
            <StatusBadge status={proposal.status} />
          </div>
        </header>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">
              Proposal line items with quantity, unit price, and total
            </caption>
            <thead>
              <tr className="border-b">
                <th
                  scope="col"
                  className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Qty
                </th>
                <th
                  scope="col"
                  className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {proposal.lineItems.map((item, index) => (
                <tr key={index} className="border-b border-border/60">
                  <td className="py-3.5">{item.description}</td>
                  <td className="py-3.5 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right">
                    <MoneyDisplay amount={item.unitPrice} currency={proposal.currency} />
                  </td>
                  <td className="py-3.5 text-right">
                    <MoneyDisplay amount={item.total} currency={proposal.currency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-right">
            <div className="flex items-baseline justify-between gap-8 text-sm text-muted-foreground">
              <dt>Subtotal</dt>
              <dd>
                <MoneyDisplay amount={Number(proposal.subtotal)} currency={proposal.currency} />
              </dd>
            </div>
            {Number(proposal.taxAmount) > 0 && (
              <div className="flex items-baseline justify-between gap-8 text-sm text-muted-foreground">
                <dt>Tax</dt>
                <dd>
                  <MoneyDisplay amount={Number(proposal.taxAmount)} currency={proposal.currency} />
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-8 border-t-2 border-foreground/80 pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd>
                <MoneyDisplay amount={Number(proposal.totalAmount)} currency={proposal.currency} />
              </dd>
            </div>
          </dl>
        </div>

        {proposal.status === "SENT" || proposal.status === "VIEWED" ? (
          <div className="mt-10 flex flex-col items-center gap-3 border-t pt-8">
            <AcceptProposalButton token={params.token} />
            <DeclineProposalButton token={params.token} />
            {proposal.expiresAt && (
              <p className="mt-2 text-sm text-muted-foreground">
                This proposal expires on {formatDate(proposal.expiresAt)}
              </p>
            )}
          </div>
        ) : null}
      </article>

      {proposal.expiresAt &&
        proposal.status !== "SENT" &&
        proposal.status !== "VIEWED" && (
          <p className="text-sm text-muted-foreground text-center mt-6">
            This proposal expires on {formatDate(proposal.expiresAt)}
          </p>
        )}

      {proposal.status === "ACCEPTED" ? (
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