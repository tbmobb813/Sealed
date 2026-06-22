import { PageHeader } from "@/components/features/shared/page-header";
import { ContactForm } from "@/components/features/contacts/contact-form";

export default function NewContactPage() {
  return (
    <div>
      <PageHeader title="New Contact" description="Add a new contact" />
      <ContactForm />
    </div>
  );
}
