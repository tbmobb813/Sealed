import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge, MoneyDisplay } from "@sealed/ui";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Invoice } from "@sealed/types";

// The API includes the contact relation on list responses.
type InvoiceRow = Invoice & { contact?: { name: string } };

export default async function InvoicesPage() {
  let invoices: InvoiceRow[] = [];

  try {
    const response = await apiClient<{ data: InvoiceRow[] }>("/invoices");
    invoices = response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load invoices.",
    );
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage invoices and track payments"
      />
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Sent</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Due</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No invoices yet — invoices are created from signed agreements
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium hover:underline"
                    >
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {invoice.contact?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(invoice.sentAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoneyDisplay
                      amount={Number(invoice.totalAmount)}
                      currency={invoice.currency}
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
