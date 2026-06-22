"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  createContact,
  type ContactFormState,
} from "@/app/(dashboard)/contacts/new/actions";

const inputClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const labelClassName = "text-sm font-medium";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Create Contact"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState<ContactFormState, FormData>(
    createContact,
    {},
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className={labelClassName}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className={inputClassName}
          placeholder="Jane Smith"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className={labelClassName}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClassName}
          placeholder="jane@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className={labelClassName}>
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={inputClassName}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="companyName" className={labelClassName}>
          Company
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          className={inputClassName}
          placeholder="Acme Inc."
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex gap-3">
        <SubmitButton />
        <Button type="button" variant="outline" asChild>
          <Link href="/contacts">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
