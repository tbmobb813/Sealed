import Link from "next/link";
import { FileText, Handshake, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sealed — Proposals, contracts, and invoices in one flow",
  description:
    "Send a proposal, get it signed, get paid. Sealed chains the client paperwork together so nothing falls through the cracks.",
};

const steps = [
  {
    icon: FileText,
    title: "Propose",
    body: "Draft a proposal and send your client a link. They accept with a typed-name consent — no account required on their side.",
  },
  {
    icon: Handshake,
    title: "Sign",
    body: "The accepted proposal becomes an agreement, e-signed through Dropbox Sign. Status updates land in your dashboard automatically.",
  },
  {
    icon: Receipt,
    title: "Get paid",
    body: "Signed work turns into an invoice with a Stripe payment link attached. Payment marks it PAID on its own — no chasing, no spreadsheets.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-primary">Sealed</span>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Proposal to payment, sealed in one flow.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Sealed chains your client paperwork together — proposal, signed
            agreement, paid invoice — so each step unlocks the next and nothing
            falls through the cracks.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto grid gap-8 px-4 py-20 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="space-y-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold">
            Built for freelancers who bill for their work.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            One place to see every open proposal, pending signature, and
            outstanding invoice — with the state of each enforced, so a
            contract can&apos;t be invoiced before it&apos;s signed.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/sign-up">
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Sealed. Built by JNix.</span>
          <div className="flex gap-4">
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-foreground">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
