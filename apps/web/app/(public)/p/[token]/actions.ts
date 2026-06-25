"use server";

import { revalidatePath } from "next/cache";
import { publicApiClient } from "@/lib/api-client";

export type AcceptProposalState = {
  error?: string;
  accepted?: boolean;
};

export async function acceptProposal(
  token: string,
  _prevState: AcceptProposalState,
): Promise<AcceptProposalState> {
  try {
    await publicApiClient(`/proposals/public/${token}/accept`, {
      method: "POST",
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to accept proposal.",
    };
  }

  revalidatePath(`/p/${token}`);
  return { accepted: true };
}