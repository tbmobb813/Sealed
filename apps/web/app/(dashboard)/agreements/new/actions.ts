"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Agreement } from "@sealed/types";

export type AgreementFormState = {
  error?: string;
};

export async function createAgreement(
  _prevState: AgreementFormState,
  formData: FormData,
): Promise<AgreementFormState> {
  const proposalId = formData.get("proposalId")?.toString() ?? "";
  const contactId = formData.get("contactId")?.toString() ?? "";
  const title = formData.get("title")?.toString().trim() ?? "";
  const body = formData.get("body")?.toString().trim() ?? "";

  if (!proposalId || !contactId || !title || !body) {
    return { error: "All fields are required." };
  }

  let agreement: Agreement;

  try {
    const response = await apiClient<{ data: Agreement }>("/agreements", {
      method: "POST",
      body: JSON.stringify({ proposalId, contactId, title, body }),
    });
    agreement = response.data;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create agreement.",
    };
  }

  revalidatePath("/agreements");
  revalidatePath("/dashboard");
  redirect(`/agreements/${agreement.id}`);
}