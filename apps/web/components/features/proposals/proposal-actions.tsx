"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { sendProposal, type ProposalActionState } from "@/app/(dashboard)/proposals/[id]/actions";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send to Client"}
    </Button>
  );
}

export function ProposalActions({ proposalId }: { proposalId: string }) {
  const sendWithId = sendProposal.bind(null, proposalId);
  const [state, formAction] = useActionState<ProposalActionState, FormData>(
    sendWithId,
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <SendButton />
      <p aria-live="polite" className="text-sm text-destructive">{state.error ?? null}</p>
    </form>
  );
}