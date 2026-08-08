"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createAgreement,
  type AgreementFormState,
} from "@/app/(dashboard)/agreements/new/actions";

const inputClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const labelClassName = "text-sm font-medium";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create Agreement"}
    </Button>
  );
}

interface AgreementFormProps {
  proposalId: string;
  contactId: string;
  defaultTitle: string;
}

export function AgreementForm({
  proposalId,
  contactId,
  defaultTitle,
}: AgreementFormProps) {
  const [state, formAction] = useActionState<AgreementFormState, FormData>(
    createAgreement,
    {},
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="proposalId" value={proposalId} />
      <input type="hidden" name="contactId" value={contactId} />

      <div className="space-y-2">
        <label htmlFor="title" className={labelClassName}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className={inputClassName}
          defaultValue={defaultTitle}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className={labelClassName}>
          Agreement Terms
        </label>
        <textarea
          id="body"
          name="body"
          rows={12}
          required
          className={`${inputClassName} min-h-48 py-2`}
          placeholder="Enter the full terms and conditions of this agreement…"
        />
      </div>

      <p aria-live="polite" className="text-sm text-destructive">{state.error ?? null}</p>

      <div className="flex gap-3">
        <SubmitButton />
        <Button type="button" variant="outline" asChild>
          <Link href="/agreements">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}