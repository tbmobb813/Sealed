"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Contact, CreateContactInput } from "@sealed/types";

export type ContactFormState = {
  error?: string;
};

export async function createContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const phone = formData.get("phone")?.toString().trim();
  const companyName = formData.get("companyName")?.toString().trim();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  const input: CreateContactInput = {
    name,
    email,
    ...(phone ? { phone } : {}),
    ...(companyName ? { companyName } : {}),
  };

  let contact: Contact;

  try {
    const response = await apiClient<{ data: Contact }>("/contacts", {
      method: "POST",
      body: JSON.stringify(input),
    });
    contact = response.data;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create contact.",
    };
  }

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  redirect(`/contacts/${contact.id}`);
}
