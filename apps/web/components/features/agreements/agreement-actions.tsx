"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  sendAgreement,
  signAgreement,
  type AgreementActionState,
} from "@/app/(dashboard)/agreements/actions";
import type { AgreementStatus } from "@sealed/types";

function ActionButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function AgreementActions({
  agreementId,
  status,
}: {
  agreementId: string;
  status: AgreementStatus;
}) {
  const sendWithId = sendAgreement.bind(null, agreementId);
  const signWithId = signAgreement.bind(null, agreementId);

  const [sendState, sendAction] = useFormState<AgreementActionState, FormData>(
    sendWithId,
    {},
  );
  const [signState, signAction] = useFormState<AgreementActionState, FormData>(
    signWithId,
    {},
  );

  return (
    <div className="flex items-center gap-3">
      {status === "DRAFT" && (
        <form action={sendAction}>
          <ActionButton label="Send for Signature" pendingLabel="Sending…" />
          <p aria-live="polite" className="text-sm text-destructive mt-2">{sendState.error ?? null}</p>
        </form>
      )}
      {status === "SENT" && (
        <form action={signAction}>
          <ActionButton label="Mark as Signed" pendingLabel="Signing…" />
          <p aria-live="polite" className="text-sm text-destructive mt-2">{signState.error ?? null}</p>
        </form>
      )}
    </div>
  );
}