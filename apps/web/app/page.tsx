import Link from "next/link";
import { FileText, Handshake, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailCaptureForm } from "@/components/features/marketing/email-capture-form";

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
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="container mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <h1 className="max-w-xl font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
              Proposal to payment, sealed in one flow.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              Sealed chains your client paperwork together — proposal, signed
              agreement, paid invoice — so each step unlocks the next and
              nothing falls through the cracks.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Static preview of the client-facing proposal page */}
          <div aria-hidden="true" className="relative hidden lg:block">
            <div className="rounded-lg bg-card p-8 shadow-lg ring-1 ring-border">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Meridian Web Studio
              </p>
              <p className="mt-2 font-serif text-2xl font-medium tracking-tight">
                Website redesign &amp; launch
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prepared for Daniela Reyes
              </p>
              <div className="mt-6 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Design system &amp; templates</span>
                  <span className="tabular-nums">$2,400.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Build &amp; CMS setup</span>
                  <span className="tabular-nums">$3,150.00</span>
                </div>
                <div className="flex justify-between border-t-2 border-foreground/80 pt-2 font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">$5,550.00</span>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <span className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground">
                  Accept Proposal
                </span>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              What your client sees — no account required on their side.
            </p>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto grid gap-10 px-4 py-20 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-3xl text-primary/40">
                      0{index + 1}
                    </span>
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                  <p className="text-sm text-muted-foreground text-pretty">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-medium tracking-tight sm:text-3xl">
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

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-xl font-semibold">Not ready yet?</h2>
            <p className="mx-auto mt-2 mb-6 max-w-md text-sm text-muted-foreground">
              Leave your email and we&apos;ll let you know as Sealed grows —
              no spam, just launch updates.
            </p>
            <EmailCaptureForm />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Sealed. Built by JNix.</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              Pricing
            </Link>
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
