import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge } from "@sealed/ui";
import { apiClient } from "@/lib/api-client";
import type { Agreement } from "@sealed/types";

export default async function AgreementsPage() {
  let agreements: Agreement[] = [];

  try {
    const response = await apiClient<{ data: Agreement[] }>("/agreements");
    agreements = response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load agreements.",
    );
  }

  return (
    <div>
      <PageHeader
        title="Agreements"
        description="Track e-signature status for your agreements"
      />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {agreements.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                  No agreements yet
                </td>
              </tr>
            ) : (
              agreements.map((agreement) => (
                <tr key={agreement.id} className="border-b">
                  <td className="px-4 py-3">
                    <Link
                      href={`/agreements/${agreement.id}`}
                      className="font-medium hover:underline"
                    >
                      {agreement.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={agreement.status} />
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
