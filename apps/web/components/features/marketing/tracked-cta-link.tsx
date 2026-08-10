"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { ComponentProps, MouseEvent } from "react";

type TrackedCtaLinkProps = ComponentProps<typeof Link> & {
  location: string;
  tier?: string;
};

export function TrackedCtaLink({
  location,
  tier,
  onClick,
  ...props
}: TrackedCtaLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        track("cta_click", tier ? { location, tier } : { location });
        onClick?.(e);
      }}
    />
  );
}
