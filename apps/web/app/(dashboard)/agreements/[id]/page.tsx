import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge } from "@sealed/ui";
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
        action={agreement && <StatusBadge status={agreement.signatureStatus} />}
      />
      {agreement ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Signature Status</dt>
            <dd className="font-medium capitalize">
              {agreement.signatureStatus.replace(/_/g, " ")}
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
      ) : (
        <p className="text-muted-foreground">Agreement not found</p>
      )}
    </div>
  );
}
