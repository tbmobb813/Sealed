import { auth } from "@clerk/nextjs/server";
import { shouldInitializeClerk } from "./demo";

export async function getClerkAuth(): Promise<Awaited<
  ReturnType<typeof auth>
> | null> {
  if (!shouldInitializeClerk()) {
    return null;
  }

  return auth();
}
