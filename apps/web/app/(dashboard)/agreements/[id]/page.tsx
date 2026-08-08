import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { StatusBadge } from "@sealed/ui";
import { Button } from "@/components/ui/button";
import { AgreementActions } from "@/components/features/agreements";
import { apiClient } from "@/lib/api-client";
import type { Agreement } from "@sealed/types";

export default async function AgreementDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  let agreement: Agreement;

  try {
    const response = await apiClient<{ data: Agreement }>(
      `/agreements/${params.id}`,
    );
    agreement = response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes("not found") ||
        error.message === "API error: 404")
    ) {
      notFound();
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to load agreement.",
    );
  }

  return (
    <div>
      <PageHeader
        title={agreement.title}
        action={<StatusBadge status={agreement.status} />}
      />
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
          {(agreement.status === "DRAFT" || agreement.status === "SENT") && (
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
    </div>
  );
}
