import { auth } from "@clerk/nextjs/server";
import { shouldUseClerk } from "./demo";

export async function getClerkAuth(): Promise<Awaited<
  ReturnType<typeof auth>
> | null> {
  if (!shouldUseClerk()) {
    return null;
  }

  return auth();
}
