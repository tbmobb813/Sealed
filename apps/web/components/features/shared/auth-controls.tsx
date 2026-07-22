"use client";

import dynamic from "next/dynamic";
import { canInitializeClerk } from "@/lib/demo";
import { DemoAuthControls } from "@/components/features/shared/demo-auth-controls";

const ClerkAuthControls = dynamic(
  () =>
    import("@/components/features/shared/clerk-auth-controls").then(
      (module) => module.ClerkAuthControls,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="text-sm text-muted-foreground">Loading auth…</div>
    ),
  },
);

export function AuthControls() {
  if (!canInitializeClerk()) {
    return <DemoAuthControls />;
  }

  return <ClerkAuthControls />;
}
