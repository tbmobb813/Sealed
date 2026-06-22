import { auth } from "@clerk/nextjs/server";
import { isDemoMode } from "./demo";

export async function getClerkAuth() {
  if (isDemoMode()) {
    return null;
  }

  return auth();
}
