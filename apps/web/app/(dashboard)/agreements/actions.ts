"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/lib/api-client";

export type AgreementActionState = {
  error?: string;
};

export async function sendAgreement(
  agreementId: string,
  _prevState: AgreementActionState,
): Promise<AgreementActionState> {
  try {
    await apiClient(`/agreements/${agreementId}/send`, {
      method: "POST",
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to send agreement.",
    };
  }

  revalidatePath(`/agreements/${agreementId}`);
  revalidatePath("/agreements");
  revalidatePath("/dashboard");
  return {};
}

export async function signAgreement(
  agreementId: string,
  _prevState: AgreementActionState,
): Promise<AgreementActionState> {
  try {
    await apiClient(`/agreements/${agreementId}/sign`, {
      method: "POST",
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to sign agreement.",
    };
  }

  revalidatePath(`/agreements/${agreementId}`);
  revalidatePath("/agreements");
  revalidatePath("/dashboard");
  return {};
}
