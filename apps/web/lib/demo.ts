export const DEMO_MODE_TOKEN = "demo";

export const DEMO_USER = {
  name: "Demo User",
  email: "demo@sealed.app",
};

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function shouldInitializeClerk(): boolean {
  return shouldUseClerk() && (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim().length ?? 0) > 0;
}

export function shouldUseClerk(): boolean {
  return !isDemoMode();
}
