import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Sealed account.",
};

export default function SignInPage() {
  return <SignIn fallbackRedirectUrl="/dashboard" />;
}
