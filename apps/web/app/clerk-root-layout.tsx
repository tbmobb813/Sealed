"use client";

import { ClerkProvider } from "@clerk/nextjs";

// Clerk's shadcn theme reads our CSS variables directly as color values, but
// globals.css defines them as Tailwind HSL fragments ("0 0% 100%"), which is
// not a valid CSS color — surfaces like the UserButton popover rendered
// transparent. Clerk's default appearance is self-contained, so use that.
export function ClerkRootLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
