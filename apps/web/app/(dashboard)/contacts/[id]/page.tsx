import { PageHeader } from "@/components/features/shared/page-header";
import { apiClient } from "@/lib/api-client";
import type { Contact } from "@sealed/types";

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let contact: Contact | null = null;

  try {
    const response = await apiClient<{ data: Contact }>(
      `/contacts/${params.id}`,
    );
    contact = response.data;
  } catch {
    // API may not be running
  }

  return (
    <div>
      <PageHeader
        title={contact ? contact.name : "Contact"}
      />
      {contact ? (
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
      ) : (
        <p className="text-muted-foreground">Contact not found</p>
      )}
    </div>
  );
}
