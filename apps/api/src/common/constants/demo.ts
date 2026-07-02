export const DEMO_MODE_TOKEN = "demo";
export const DEMO_CLERK_USER_ID = "user_demo_001";
/** Used by integration tests — never collides with the seeded demo user. */
export const TEST_CLERK_USER_ID = "user_test_001";

export function isDemoModeEnabled(value: string | undefined): boolean {
  return value === "true";
}
