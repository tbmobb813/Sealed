"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  acceptProposal,
  type AcceptProposalState,
} from "@/app/(public)/p/[token]/actions";

function AcceptButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Accepting..." : "Accept Proposal"}
    </Button>
  );
}

export function AcceptProposalButton({ token }: { token: string }) {
  const router = useRouter();
  const acceptWithToken = acceptProposal.bind(null, token);
  const [state, formAction] = useFormState<AcceptProposalState, FormData>(
    acceptWithToken,
    {},
  );

  useEffect(() => {
    if (state.accepted) {
      router.refresh();
    }
  }, [state.accepted, router]);

  if (state.accepted) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 px-6 py-4 text-center">
        <p className="text-green-800 font-medium">
          Proposal accepted. Your service provider will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-center gap-3">
      <AcceptButton />
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}