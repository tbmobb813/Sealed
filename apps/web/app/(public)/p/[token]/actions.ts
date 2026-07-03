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
  formData: FormData,
): Promise<AcceptProposalState> {
  const acceptedBy = formData.get("acceptedBy");

  if (typeof acceptedBy !== "string" || !acceptedBy.trim()) {
    return { error: "Please type your full name to accept." };
  }

  try {
    await publicApiClient(`/proposals/public/${token}/accept`, {
      method: "POST",
      body: JSON.stringify({
        acceptedBy: acceptedBy.trim().slice(0, 200),
      }),
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to accept proposal.",
    };
  }

  revalidatePath(`/p/${token}`);
  return { accepted: true };
}

export type RejectProposalState = {
  error?: string;
  rejected?: boolean;
};

export async function rejectProposal(
  token: string,
  _prevState: RejectProposalState,
  formData: FormData,
): Promise<RejectProposalState> {
  const reason = formData.get("reason");

  try {
    await publicApiClient(`/proposals/public/${token}/reject`, {
      method: "POST",
      body: JSON.stringify({
        ...(typeof reason === "string" && reason.trim()
          ? { reason: reason.trim().slice(0, 500) }
          : {}),
      }),
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to decline proposal.",
    };
  }

  revalidatePath(`/p/${token}`);
  return { rejected: true };
}