"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { CreateProposalInput, Proposal } from "@sealed/types";

export type ProposalFormState = {
  error?: string;
};

type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

function parseLineItems(raw: string): LineItemInput[] | null {
  try {
    const parsed = JSON.parse(raw) as LineItemInput[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }

    const valid = parsed.every(
      (item) =>
        item.description.trim().length > 0 &&
        item.quantity >= 1 &&
        item.unitPrice >= 0,
    );

    return valid ? parsed : null;
  } catch {
    return null;
  }
}

export async function createProposal(
  _prevState: ProposalFormState,
  formData: FormData,
): Promise<ProposalFormState> {
  const title = formData.get("title")?.toString().trim() ?? "";
  const contactId = formData.get("contactId")?.toString() ?? "";
  const description = formData.get("description")?.toString().trim();
  const taxAmountRaw = formData.get("taxAmount")?.toString().trim();
  const lineItemsRaw = formData.get("lineItems")?.toString() ?? "[]";

  if (!title || !contactId) {
    return { error: "Title and contact are required." };
  }

  const lineItems = parseLineItems(lineItemsRaw);
  if (!lineItems) {
    return {
      error: "Add at least one line item with a description, quantity, and price.",
    };
  }

  const taxAmount = taxAmountRaw ? Number(taxAmountRaw) : undefined;
  if (taxAmount !== undefined && (Number.isNaN(taxAmount) || taxAmount < 0)) {
    return { error: "Tax amount must be zero or greater." };
  }

  const input: CreateProposalInput = {
    contactId,
    title,
    lineItems,
    ...(description ? { description } : {}),
    ...(taxAmount !== undefined ? { taxAmount } : {}),
  };

  let proposal: Proposal;

  try {
    const response = await apiClient<{ data: Proposal }>("/proposals", {
      method: "POST",
      body: JSON.stringify(input),
    });
    proposal = response.data;
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create proposal.",
    };
  }

  revalidatePath("/proposals");
  revalidatePath("/");
  redirect(`/proposals/${proposal.id}`);
}
