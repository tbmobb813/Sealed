"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ProposalStatus } from "@sealed/types";

export function ProposalClientLink({
  publicToken,
  status,
}: {
  publicToken: string;
  status: ProposalStatus;
}) {
  const [copied, setCopied] = useState(false);
  const path = `/p/${publicToken}`;

  if (status !== "SENT" && status !== "VIEWED") {
    return null;
  }

  async function copyLink() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div>
        <p className="text-sm font-medium">Waiting for client acceptance</p>
        <p className="text-sm text-muted-foreground mt-1">
          {status === "VIEWED"
            ? "Your client has opened the proposal. Share the link again if they still need to accept."
            : "Share this link with your client so they can review and accept the proposal."}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 text-sm">
          {path}
        </code>
        <div className="flex gap-2 shrink-0">
          <Button type="button" variant="secondary" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button asChild variant="outline">
            <Link href={path} target="_blank" rel="noopener noreferrer">
              Preview as client
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
