"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  rejectProposal,
  type RejectProposalState,
} from "@/app/(public)/p/[token]/actions";

function ConfirmDeclineButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" disabled={pending}>
      {pending ? "Declining…" : "Confirm Decline"}
    </Button>
  );
}

export function DeclineProposalButton({ token }: { token: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const rejectWithToken = rejectProposal.bind(null, token);
  const [state, formAction] = useActionState<RejectProposalState, FormData>(
    rejectWithToken,
    {},
  );

  useEffect(() => {
    if (state.rejected) {
      router.refresh();
    }
  }, [state.rejected, router]);

  if (state.rejected) {
    return (
      <div className="rounded-lg bg-muted border px-6 py-4 text-center">
        <p className="font-medium">
          You have declined this proposal. Your service provider has been
          notified.
        </p>
      </div>
    );
  }

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setConfirming(true)}
      >
        Decline this proposal
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="flex w-full max-w-md flex-col items-center gap-3"
    >
      <textarea
        name="reason"
        maxLength={500}
        rows={3}
        placeholder="Reason (optional) — helps your service provider follow up"
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
        <ConfirmDeclineButton />
      </div>
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
