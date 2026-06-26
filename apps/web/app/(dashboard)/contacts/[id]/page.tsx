import { notFound } from "next/navigation";
import { PageHeader } from "@/components/features/shared/page-header";
import { apiClient } from "@/lib/api-client";
import type { Contact } from "@sealed/types";

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let contact: Contact;

  try {
    const response = await apiClient<{ data: Contact }>(
      `/contacts/${params.id}`,
    );
    contact = response.data;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.toLowerCase().includes("not found") ||
        error.message === "API error: 404")
    ) {
      notFound();
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to load contact.",
    );
  }

  return (
    <div>
      <PageHeader title={contact.name} />
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="font-medium">{contact.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Phone</dt>
          <dd className="font-medium">{contact.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Company</dt>
          <dd className="font-medium">{contact.companyName ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
