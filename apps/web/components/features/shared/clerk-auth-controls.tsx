"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function ClerkAuthControls() {
  return (
    <div className="space-y-3">
      <SignedOut>
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
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/sign-in" />
      </SignedIn>
    </div>
  );
}
