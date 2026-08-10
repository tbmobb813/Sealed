import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Create your account",
  description: "Create your free Sealed account — proposals, contracts, and invoices in one flow.",
};

export default function SignUpPage() {
  return <SignUp fallbackRedirectUrl="/dashboard" />;
}
