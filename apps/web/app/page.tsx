import Link from "next/link";
import Image from "next/image";
import { FileText, Handshake, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailCaptureForm } from "@/components/features/marketing/email-capture-form";
import { TrackedCtaLink } from "@/components/features/marketing/tracked-cta-link";
import { RotatingWord } from "@/components/features/marketing/rotating-word";

const professions = [
  "freelancers",
  "consultants",
  "designers",
  "developers",
  "videographers",
  "photographers",
  "coaches",
];

export const metadata = {
  title: { absolute: "Sealed — Proposals, contracts, and invoices in one flow" },
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
    body: "The accepted proposal becomes an agreement, e-signed through DocuSeal. Status updates land in your dashboard automatically.",
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
              <TrackedCtaLink href="/sign-up" location="nav">
                Get started
              </TrackedCtaLink>
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
                <TrackedCtaLink href="/sign-up" location="hero">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </TrackedCtaLink>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>

          {/* Animated walkthrough of the proposal-to-signature flow */}
          <div className="relative hidden lg:block">
            <Image
              src="/proposal-flow-demo.gif"
              alt="Walkthrough of creating a proposal, sending it, the client accepting it, and the agreement going out for e-signature in Sealed"
              width={960}
              height={855}
              unoptimized
              priority
              className="w-full rounded-lg shadow-lg ring-1 ring-border"
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Proposal to signed agreement, in one flow.
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
            Built for <RotatingWord words={professions} /> who bill for their
            work.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            One place to see every open proposal, pending signature, and
            outstanding invoice — with the state of each enforced, so a
            contract can&apos;t be invoiced before it&apos;s signed.
          </p>
          <Button asChild size="lg" className="mt-8">
            <TrackedCtaLink href="/sign-up" location="cta_band">
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </TrackedCtaLink>
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
            <Link href="/vs/dubsado" className="hover:text-foreground">
              vs Dubsado
            </Link>
            <Link href="/vs/honeybook" className="hover:text-foreground">
              vs HoneyBook
            </Link>
            <Link href="/vs/bonsai" className="hover:text-foreground">
              vs Bonsai
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
