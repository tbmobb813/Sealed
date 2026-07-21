import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pricing — Sealed",
  description:
    "Start free. Upgrade when your client work does. Simple flat pricing for freelancers who bill for their work.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Everything you need to run your first clients through the flow.",
    cta: "Start free",
    highlighted: false,
    features: [
      "2 active proposals at a time",
      "Client accept/decline links — no account needed on their side",
      "Agreements with e-signature",
      "Invoices with Stripe payment links",
      "Live status dashboard",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    blurb: "For freelancers running their whole client pipeline through Sealed.",
    cta: "Get started",
    highlighted: true,
    features: [
      "Unlimited active proposals",
      "Unlimited contacts, agreements, and invoices",
      "Full activity history",
      "Priority support",
      "Every feature we ship next",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Sealed
          </Link>
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

      <main id="main-content">
        <section className="container mx-auto px-4 py-16 text-center lg:py-24">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            Simple pricing, sealed flat.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
            Start free, upgrade when your client work does. No per-document
            fees, no percentage of your invoices.
          </p>
        </section>

        <section className="container mx-auto grid max-w-4xl gap-8 px-4 pb-20 sm:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-lg bg-card p-8 ring-1 ${
                tier.highlighted
                  ? "shadow-lg ring-2 ring-primary"
                  : "ring-border"
              }`}
            >
              <h2 className="text-lg font-semibold">{tier.name}</h2>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-medium tracking-tight">
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.cadence}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground text-pretty">
                {tier.blurb}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                variant={tier.highlighted ? "default" : "outline"}
                className="mt-8"
              >
                <Link href="/sign-up">
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </section>

        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-xl font-semibold">Early user?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Sealed just launched. Sign up now and Pro is free while we grow —
              your feedback is the price.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/sign-up">
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
