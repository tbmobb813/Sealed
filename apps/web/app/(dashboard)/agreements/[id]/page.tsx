import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge } from "@sealed/ui";
import { Button } from "@/components/ui/button";
import { AgreementActions } from "@/components/features/agreements";
import { apiClient } from "@/lib/api-client";
import type { Agreement } from "@sealed/types";

export default async function AgreementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let agreement: Agreement | null = null;

  try {
    const response = await apiClient<{ data: Agreement }>(
      `/agreements/${params.id}`,
    );
    agreement = response.data;
  } catch {
    // API may not be running
  }

  return (
    <div>
      <PageHeader
        title={agreement?.title ?? "Agreement"}
        action={agreement && <StatusBadge status={agreement.status} />}
      />
      {agreement ? (
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">
                {agreement.status.replace(/_/g, " ")}
              </dd>
            </div>
            {agreement.signedAt && (
              <div>
                <dt className="text-sm text-muted-foreground">Signed At</dt>
                <dd className="font-medium">
                  {new Date(agreement.signedAt).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>

          <div className="flex items-center gap-3">
            {(agreement.status === "DRAFT" ||
              agreement.status === "SENT") && (
              <AgreementActions
                agreementId={agreement.id}
                status={agreement.status}
              />
            )}
            {agreement.status === "SIGNED" && (
              <Button asChild>
                <Link href={`/invoices/new?agreementId=${agreement.id}`}>
                  Create Invoice
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Agreement not found</p>
      )}
    </div>
  );
}