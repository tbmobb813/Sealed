"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";

export type InvoiceActionState = {
  error?: string;
};

export async function sendInvoice(
  invoiceId: string,
  _prevState: InvoiceActionState,
): Promise<InvoiceActionState> {
  try {
    await apiClient(`/invoices/${invoiceId}/send`, {
      method: "POST",
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to send invoice.",
    };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/");
  return {};
}
