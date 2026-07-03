export const DEMO_MODE_TOKEN = "demo";
export const DEMO_CLERK_USER_ID = "user_demo_001";
/** Used by integration tests — never collides with the seeded demo user. */
export const TEST_CLERK_USER_ID = "user_test_001";

export function isDemoModeEnabled(value: string | undefined): boolean {
  // Demo mode is a full auth bypass with a hardcoded token — never allow it
  // in production regardless of env configuration.
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return value === "true";
}
