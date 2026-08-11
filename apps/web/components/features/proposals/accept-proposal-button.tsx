"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  acceptProposal,
  type AcceptProposalState,
} from "@/app/(public)/p/[token]/actions";

function ConfirmAcceptButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Accepting…" : "Confirm Acceptance"}
    </Button>
  );
}

export function AcceptProposalButton({ token }: { token: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const acceptWithToken = acceptProposal.bind(null, token);
  const [state, formAction] = useActionState<AcceptProposalState, FormData>(
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

  if (!confirming) {
    return (
      <Button size="lg" onClick={() => setConfirming(true)}>
        Accept Proposal
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex w-full max-w-md flex-col items-center gap-3"
    >
      <label htmlFor="acceptedBy" className="text-sm text-muted-foreground">
        Type your full name to accept this proposal
      </label>
      <input
        id="acceptedBy"
        name="acceptedBy"
        autoComplete="name"
        required
        maxLength={200}
        placeholder="Jane Smith"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
        <ConfirmAcceptButton />
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
