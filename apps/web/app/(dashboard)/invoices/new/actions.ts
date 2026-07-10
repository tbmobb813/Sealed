"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { Invoice } from "@sealed/types";

export type InvoiceFormState = {
  error?: string;
};

export async function createInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const agreementId = formData.get("agreementId")?.toString() ?? "";
  const contactId = formData.get("contactId")?.toString() ?? "";
  const subtotalRaw = formData.get("subtotal")?.toString().trim() ?? "";
  const taxAmountRaw = formData.get("taxAmount")?.toString().trim() ?? "0";
  const dueDateRaw = formData.get("dueDate")?.toString().trim();

  if (!agreementId || !contactId) {
    return { error: "Agreement and contact are required." };
  }

  const subtotal = Number(subtotalRaw);
  const taxAmount = Number(taxAmountRaw);

  if (Number.isNaN(subtotal) || subtotal < 0) {
    return { error: "Subtotal must be zero or greater." };
  }

  if (Number.isNaN(taxAmount) || taxAmount < 0) {
    return { error: "Tax amount must be zero or greater." };
  }

  let invoice: Invoice;

  try {
    const response = await apiClient<{ data: Invoice }>("/invoices", {
      method: "POST",
      body: JSON.stringify({
        agreementId,
        contactId,
        subtotal,
        taxAmount,
        ...(dueDateRaw ? { dueDate: dueDateRaw } : {}),
      }),
    });
    invoice = response.data;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create invoice.",
    };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoice.id}`);
}