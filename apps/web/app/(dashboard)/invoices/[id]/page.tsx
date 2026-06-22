import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { apiClient } from "@/lib/api-client";
import type { Invoice } from "@sealed/types";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let invoice: Invoice | null = null;

  try {
    const response = await apiClient<{ data: Invoice }>(
      `/invoices/${params.id}`,
    );
    invoice = response.data;
  } catch {
    // API may not be running
  }

  return (
    <div>
      <PageHeader
        title={invoice?.number ?? "Invoice"}
        action={invoice && <StatusBadge status={invoice.status} />}
      />
      {invoice ? (
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
      ) : (
        <p className="text-muted-foreground">Invoice not found</p>
      )}
    </div>
  );
}
