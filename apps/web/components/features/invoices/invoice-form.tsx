"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createInvoice,
  type InvoiceFormState,
} from "@/app/(dashboard)/invoices/new/actions";

const inputClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const labelClassName = "text-sm font-medium";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create Invoice"}
    </Button>
  );
}

interface InvoiceFormProps {
  agreementId: string;
  contactId: string;
  defaultSubtotal: number;
  defaultTaxAmount: number;
}

export function InvoiceForm({
  agreementId,
  contactId,
  defaultSubtotal,
  defaultTaxAmount,
}: InvoiceFormProps) {
  const [state, formAction] = useFormState<InvoiceFormState, FormData>(
    createInvoice,
    {},
  );

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      <input type="hidden" name="agreementId" value={agreementId} />
      <input type="hidden" name="contactId" value={contactId} />

      <div className="space-y-2">
        <label htmlFor="subtotal" className={labelClassName}>
          Subtotal
        </label>
        <input
          id="subtotal"
          name="subtotal"
          type="number"
          min="0"
          step="0.01"
          required
          className={inputClassName}
          defaultValue={defaultSubtotal.toFixed(2)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="taxAmount" className={labelClassName}>
          Tax Amount
        </label>
        <input
          id="taxAmount"
          name="taxAmount"
          type="number"
          min="0"
          step="0.01"
          className={inputClassName}
          defaultValue={defaultTaxAmount.toFixed(2)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="dueDate" className={labelClassName}>
          Due Date <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          className={inputClassName}
        />
      </div>

      <p aria-live="polite" className="text-sm text-destructive">{state.error ?? null}</p>

      <div className="flex gap-3">
        <SubmitButton />
        <Button type="button" variant="outline" asChild>
          <Link href="/invoices">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}