export const DEMO_MODE_TOKEN = "demo";

export const DEMO_USER = {
  name: "Demo User",
  email: "demo@sealed.app",
};

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function shouldInitializeClerk(): boolean {
  return shouldUseClerk() && Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());
}

export function shouldUseClerk(): boolean {
  return !isDemoMode();
}
