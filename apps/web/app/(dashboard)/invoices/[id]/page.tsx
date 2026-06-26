import { notFound } from "next/navigation";
import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { apiClient } from "@/lib/api-client";
import type { Invoice } from "@sealed/types";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let invoice: Invoice;

  try {
    const response = await apiClient<{ data: Invoice }>(
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
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="font-medium text-lg">
            <MoneyDisplay amount={Number(invoice.totalAmount)} />
          </dd>
        </div>
        {invoice.dueDate && (
          <div>
            <dt className="text-sm text-muted-foreground">Due Date</dt>
            <dd className="font-medium">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
