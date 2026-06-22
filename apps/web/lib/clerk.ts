import { auth } from "@clerk/nextjs/server";
import { isDemoMode } from "./demo";

export async function getClerkAuth(): Promise<Awaited<
  ReturnType<typeof auth>
> | null> {
  if (isDemoMode()) {
    return null;
  }

  return auth();
}
