"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  sendInvoice,
  type InvoiceActionState,
} from "@/app/(dashboard)/invoices/[id]/actions";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send to Client"}
    </Button>
  );
}

export function InvoiceActions({ invoiceId }: { invoiceId: string }) {
  const sendWithId = sendInvoice.bind(null, invoiceId);
  const [state, formAction] = useFormState<InvoiceActionState, FormData>(
    sendWithId,
    {},
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <SendButton />
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
