"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoneyDisplay } from "@sealed/ui";
import {
  createProposal,
  type ProposalFormState,
} from "@/app/(dashboard)/proposals/new/actions";
import type { Contact } from "@sealed/types";

const inputClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const labelClassName = "text-sm font-medium";

type LineItemRow = {
  description: string;
  quantity: string;
  unitPrice: string;
};

const emptyLineItem = (): LineItemRow => ({
  description: "",
  quantity: "1",
  unitPrice: "0",
});

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create Proposal"}
    </Button>
  );
}

export function ProposalForm({ contacts }: { contacts: Contact[] }) {
  const [state, formAction] = useFormState<ProposalFormState, FormData>(
    createProposal,
    {},
  );
  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyLineItem()]);

  const serializedLineItems = useMemo(
    () =>
      JSON.stringify(
        lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      ),
    [lineItems],
  );

  const subtotal = lineItems.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);

  function updateLineItem(
    index: number,
    field: keyof LineItemRow,
    value: string,
  ) {
    setLineItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function addLineItem() {
    setLineItems((current) => [...current, emptyLineItem()]);
  }

  function removeLineItem(index: number) {
    setLineItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="max-w-lg space-y-4">
        <p className="text-muted-foreground">
          Add a contact before creating a proposal.
        </p>
        <Button asChild>
          <Link href="/contacts/new">Add Contact</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="title" className={labelClassName}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className={inputClassName}
            placeholder="Website redesign proposal"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="contactId" className={labelClassName}>
            Contact
          </label>
          <select
            id="contactId"
            name="contactId"
            required
            className={inputClassName}
            defaultValue=""
          >
            <option value="" disabled>
              Select a contact
            </option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
                {contact.companyName ? ` (${contact.companyName})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="description" className={labelClassName}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className={`${inputClassName} min-h-24 py-2`}
            placeholder="Optional summary for the client"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Line Items</h2>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            Add Line Item
          </Button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_100px_120px_auto]"
            >
              <div className="space-y-2">
                <label
                  htmlFor={`line-item-${index}-description`}
                  className={labelClassName}
                >
                  Description
                </label>
                <input
                  id={`line-item-${index}-description`}
                  type="text"
                  required
                  className={inputClassName}
                  value={item.description}
                  onChange={(event) =>
                    updateLineItem(index, "description", event.target.value)
                  }
                  placeholder="Design and development"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`line-item-${index}-quantity`}
                  className={labelClassName}
                >
                  Qty
                </label>
                <input
                  id={`line-item-${index}-quantity`}
                  type="number"
                  min="1"
                  step="1"
                  required
                  className={inputClassName}
                  value={item.quantity}
                  onChange={(event) =>
                    updateLineItem(index, "quantity", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`line-item-${index}-unit-price`}
                  className={labelClassName}
                >
                  Unit Price
                </label>
                <input
                  id={`line-item-${index}-unit-price`}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className={inputClassName}
                  value={item.unitPrice}
                  onChange={(event) =>
                    updateLineItem(index, "unitPrice", event.target.value)
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            defaultValue="0"
          />
        </div>

        <div className="flex items-end justify-end gap-1 text-sm text-muted-foreground">
          Subtotal: <MoneyDisplay amount={subtotal} />
        </div>
      </div>

      <input type="hidden" name="lineItems" value={serializedLineItems} />

      <p aria-live="polite" className="text-sm text-destructive">{state.error ?? null}</p>

      <div className="flex gap-3">
        <SubmitButton />
        <Button type="button" variant="outline" asChild>
          <Link href="/proposals">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
