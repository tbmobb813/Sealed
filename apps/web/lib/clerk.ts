import { auth } from "@clerk/nextjs/server";
import { canInitializeClerk } from "./demo";

export async function getClerkAuth(): Promise<Awaited<
  ReturnType<typeof auth>
> | null> {
  if (!canInitializeClerk()) {
    return null;
  }

  return auth();
}
