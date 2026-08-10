import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/features/marketing/tracked-cta-link";

export const metadata = {
  title: { absolute: "Sealed vs Dubsado — Comparison" },
  description:
    "How Sealed compares to Dubsado for proposals, e-signatures, and invoicing. Free to start, no setup week, no workflow builder to learn first.",
};

const rows: Array<{
  label: string;
  sealed: string | boolean;
  dubsado: string | boolean;
}> = [
  { label: "Starting price", sealed: "Free", dubsado: "~$20–35/mo (Starter)" },
  { label: "Free tier (not just a trial)", sealed: true, dubsado: false },
  { label: "Send a proposal client can accept via link", sealed: true, dubsado: "Premier plan only" },
  { label: "E-signed agreements", sealed: true, dubsado: true },
  { label: "Invoicing with a card payment link", sealed: true, dubsado: true },
  { label: "Enforced order (can't invoice an unsigned contract)", sealed: true, dubsado: false },
  { label: "Visual workflow builder with conditional logic", sealed: false, dubsado: true },
  { label: "Typical setup time", sealed: "Minutes", dubsado: "Often cited as a multi-day/week setup project" },
];

export default function VsDubsadoPage() {
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
              <TrackedCtaLink href="/sign-up" location="vs_dubsado_nav">
                Get started
              </TrackedCtaLink>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="container mx-auto px-4 py-16 text-center lg:py-24">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            Sealed vs Dubsado
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Dubsado has forty things you don&apos;t need yet — a visual workflow
            builder, conditional logic, lead capture forms, scheduling.
            Sealed has the four that matter for getting one deal from
            proposal to paid: propose, sign, invoice, get paid — enforced,
            in that order, for free.
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
                    Dubsado
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
                      {typeof row.dubsado === "boolean" ? (
                        row.dubsado ? (
                          <Check className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        row.dubsado
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-xs text-muted-foreground">
            Dubsado pricing and feature placement change over time — figures
            above reflect published pricing pages as of this writing; check
            Dubsado&apos;s own site for current numbers.
          </p>
        </section>

        <section className="container mx-auto grid max-w-4xl gap-8 px-4 pb-20 sm:grid-cols-2">
          <div className="rounded-lg bg-card p-8 ring-1 ring-border">
            <h2 className="text-lg font-semibold">
              Dubsado is the better fit if...
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                You need a visual workflow builder with branching logic for
                complex client onboarding sequences.
              </li>
              <li>
                You run lead-capture forms and scheduling through the same
                tool as your proposals.
              </li>
              <li>
                You have the time to invest in a longer setup process to get
                full value from the customization.
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
                today, not after a setup project.
              </li>
              <li>
                You want the chain enforced — you can&apos;t accidentally
                invoice before a contract is signed.
              </li>
              <li>
                You want to start free and see if it fits before paying
                anything.
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
              <TrackedCtaLink href="/sign-up" location="vs_dubsado_cta_band">
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
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
