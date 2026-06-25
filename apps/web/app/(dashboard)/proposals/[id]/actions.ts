"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";

export type ProposalActionState = {
  error?: string;
};

export async function sendProposal(
  proposalId: string,
  _prevState: ProposalActionState,
): Promise<ProposalActionState> {
  try {
    await apiClient(`/proposals/${proposalId}/send`, {
      method: "POST",
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to send proposal.",
    };
  }

  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath("/proposals");
  revalidatePath("/");
  return {};
}