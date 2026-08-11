import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/features/marketing/tracked-cta-link";

export const metadata = {
  title: { absolute: "Sealed vs HoneyBook — Comparison" },
  description:
    "How Sealed compares to HoneyBook for proposals, e-signatures, and invoicing. Free to start, no card fees baked into every plan, no automation builder to learn first.",
};

const rows: Array<{
  label: string;
  sealed: string | boolean;
  honeybook: string | boolean;
}> = [
  { label: "Starting price", sealed: "Free", honeybook: "$36/mo (Starter), billed monthly" },
  { label: "Free tier (not just a trial)", sealed: true, honeybook: false },
  { label: "Send a proposal client can accept via link", sealed: true, honeybook: true },
  { label: "E-signed agreements", sealed: true, honeybook: true },
  { label: "Invoicing with a card payment link", sealed: true, honeybook: true },
  { label: "Enforced order (can't invoice an unsigned contract)", sealed: true, honeybook: false },
  { label: "Automation/workflow builder for onboarding sequences", sealed: false, honeybook: true },
  { label: "Card payment fees", sealed: "Standard Stripe rate", honeybook: "2.9% + 25¢ on every plan" },
];

export default function VsHoneyBookPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Sealed
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <TrackedCtaLink href="/sign-up" location="vs_honeybook_nav">
                Get started
              </TrackedCtaLink>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="container mx-auto px-4 py-16 text-center lg:py-24">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            Sealed vs HoneyBook
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            HoneyBook bundles a full automation builder, scheduling, and lead
            capture into every plan — starting at $36/mo before card fees.
            Sealed does the four things that get a deal from proposal to
            paid: propose, sign, invoice, get paid — enforced, in that order,
            for free.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto max-w-3xl overflow-x-auto rounded-lg ring-1 ring-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="p-4 font-medium">&nbsp;</th>
                  <th className="p-4 font-medium text-primary">Sealed</th>
                  <th className="p-4 font-medium text-muted-foreground">
                    HoneyBook
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b last:border-0">
                    <td className="p-4 text-muted-foreground">{row.label}</td>
                    <td className="p-4">
                      {typeof row.sealed === "boolean" ? (
                        row.sealed ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        row.sealed
                      )}
                    </td>
                    <td className="p-4">
                      {typeof row.honeybook === "boolean" ? (
                        row.honeybook ? (
                          <Check className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        row.honeybook
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-xs text-muted-foreground">
            HoneyBook pricing and feature placement change over time — figures
            above reflect published pricing pages as of this writing; check
            HoneyBook&apos;s own site for current numbers.
          </p>
        </section>

        <section className="container mx-auto grid max-w-4xl gap-8 px-4 pb-20 sm:grid-cols-2">
          <div className="rounded-lg bg-card p-8 ring-1 ring-border">
            <h2 className="text-lg font-semibold">
              HoneyBook is the better fit if...
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                You want lead capture forms, scheduling, and automated
                follow-up sequences in the same tool as your proposals.
              </li>
              <li>
                You&apos;re comfortable paying a monthly fee plus card
                processing fees from day one.
              </li>
              <li>
                You have the time to build out automations and want them
                to run your onboarding end to end.
              </li>
            </ul>
          </div>
          <div className="rounded-lg bg-card p-8 ring-2 ring-primary shadow-lg">
            <h2 className="text-lg font-semibold">
              Sealed is the better fit if...
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                You want proposal → signed agreement → paid invoice working
                today, not after building automations.
              </li>
              <li>
                You want the chain enforced — you can&apos;t accidentally
                invoice before a contract is signed.
              </li>
              <li>
                You want to start free and see if it fits before paying
                a monthly fee on top of card processing costs.
              </li>
            </ul>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-xl font-semibold">
              Send your next proposal in ten minutes.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Free to start. No credit card, no setup week.
            </p>
            <Button asChild size="lg" className="mt-6">
              <TrackedCtaLink href="/sign-up" location="vs_honeybook_cta_band">
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedCtaLink>
            </Button>
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
            <Link href="/vs/bonsai" className="hover:text-foreground">
              vs Bonsai
            </Link>
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
