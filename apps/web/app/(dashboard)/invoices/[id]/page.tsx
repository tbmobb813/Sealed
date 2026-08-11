import { notFound } from "next/navigation";
import { PageHeader } from "@/components/features/shared/page-header";
import { InvoiceActions } from "@/components/features/invoices";
import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Invoice } from "@sealed/types";

type InvoiceDetail = Invoice & { contact?: { name: string; email: string } };

export default async function InvoiceDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  let invoice: InvoiceDetail;

  try {
    const response = await apiClient<{ data: InvoiceDetail }>(
      `/invoices/${params.id}`,
    );
    invoice = response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes("not found") ||
        error.message === "API error: 404")
    ) {
      notFound();
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to load invoice.",
    );
  }

  return (
    <div>
      <PageHeader
        title={invoice.number}
        action={<StatusBadge status={invoice.status} />}
      />
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="font-medium text-lg">
            <MoneyDisplay
              amount={Number(invoice.totalAmount)}
              currency={invoice.currency}
            />
          </dd>
        </div>
        {Number(invoice.amountPaid) > 0 && (
          <div>
            <dt className="text-sm text-muted-foreground">Paid</dt>
            <dd className="font-medium text-lg">
              <MoneyDisplay
                amount={Number(invoice.amountPaid)}
                currency={invoice.currency}
              />
            </dd>
          </div>
        )}
        <div>
          <dt className="text-sm text-muted-foreground">Contact</dt>
          <dd className="font-medium">
            {invoice.contact?.name ?? "—"}
            {invoice.contact?.email && (
              <span className="block text-sm text-muted-foreground">
                {invoice.contact.email}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Sent</dt>
          <dd className="font-medium">{formatDate(invoice.sentAt)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">
            {invoice.status === "PAID" ? "Paid on" : "Due Date"}
          </dt>
          <dd className="font-medium">
            {invoice.status === "PAID"
              ? formatDate(invoice.paidAt)
              : formatDate(invoice.dueDate)}
          </dd>
        </div>
      </dl>

      {invoice.stripePaymentLinkUrl &&
        invoice.status !== "PAID" &&
        invoice.status !== "VOID" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Payment link:{" "}
            <a
              href={invoice.stripePaymentLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {invoice.stripePaymentLinkUrl}
            </a>
          </p>
        )}

      {invoice.status === "DRAFT" && (
        <div className="mt-6">
          <InvoiceActions invoiceId={invoice.id} />
        </div>
      )}
    </div>
  );
}
