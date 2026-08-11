"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function ClerkAuthControls() {
  return (
    <div className="space-y-3">
      <Show when="signed-out">
        <div className="flex flex-col gap-2">
          <SignInButton mode="redirect">
            <button
              type="button"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="redirect">
            <button
              type="button"
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign up
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        {/*
          No declarative post-sign-out redirect prop exists on UserButton in
          this Clerk version (confirmed against the installed @clerk/shared
          types — the old afterSignOutUrl/signOutForceRedirectUrl props are
          gone; redirect is now only settable imperatively via
          useClerk().signOut({ redirectUrl })). Dropping it is safe: proxy.ts
          already redirects unauthenticated users to /sign-in on their next
          navigation.
        */}
        <UserButton />
      </Show>
    </div>
  );
}
