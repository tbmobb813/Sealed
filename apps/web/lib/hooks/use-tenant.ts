"use client";

import { useUser } from "@clerk/nextjs";

export function useTenant() {
  const { user } = useUser();

  return {
    tenantId: user?.publicMetadata?.tenantId as string | undefined,
    tenantSlug: user?.publicMetadata?.tenantSlug as string | undefined,
  };
}
