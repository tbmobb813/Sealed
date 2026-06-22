import { auth } from "@clerk/nextjs/server";

export async function getClerkAuth() {
  return auth();
}
