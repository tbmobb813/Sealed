import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import type { Contact } from "@sealed/types";

export default async function ContactsPage() {
  let contacts: Contact[] = [];

  try {
    const response = await apiClient<{ data: Contact[] }>("/contacts");
    contacts = response.data;
  } catch {
    // API may not be running during scaffold
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="Manage your clients and leads"
        action={
          <Button asChild>
            <Link href="/contacts/new">Add Contact</Link>
          </Button>
        }
      />
      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No contacts yet
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id} className="border-b">
                  <td className="px-4 py-3">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="font-medium hover:underline"
                    >
                      {contact.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contact.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {contact.companyName ?? "—"}
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
