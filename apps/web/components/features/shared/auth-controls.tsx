"use client";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { DEMO_USER, canInitializeClerk } from "@/lib/demo";

export function AuthControls() {
  if (!canInitializeClerk()) {
    return (
      <div className="space-y-1 text-sm">
        <p className="font-medium">{DEMO_USER.name}</p>
        <p className="text-muted-foreground">{DEMO_USER.email}</p>
        <p className="text-xs text-amber-600">Demo mode</p>
      </div>
    );
  }

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
