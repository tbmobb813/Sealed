import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackedCtaLink } from "@/components/features/marketing/tracked-cta-link";

export const metadata = {
  title: { absolute: "Sealed Alternatives — Compare Client Paperwork Tools" },
  description:
    "Comparing client management tools? See how Sealed stacks up against Dubsado, HoneyBook, and Bonsai for proposals, e-signatures, and invoicing.",
};

const competitors = [
  {
    slug: "dubsado",
    name: "Dubsado",
    summary:
      "A visual workflow builder with conditional logic, usually cited as a multi-day setup project. Starting around $20–35/mo, no free tier.",
  },
  {
    slug: "honeybook",
    name: "HoneyBook",
    summary:
      "Bundles lead capture, scheduling, and automation into every plan, starting at $36/mo plus a 2.9% + 25¢ fee on every card payment.",
  },
  {
    slug: "bonsai",
    name: "Bonsai",
    summary:
      "Adds time tracking, tax estimates, and expense tracking on top of proposals and invoicing, starting around $19–24/mo with more to configure up front.",
  },
];

export default function AlternativesPage() {
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
              <TrackedCtaLink href="/sign-up" location="alternatives_nav">
                Get started
              </TrackedCtaLink>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="container mx-auto px-4 py-16 text-center lg:py-24">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            Sealed alternatives &amp; comparisons
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Most client management tools bundle a lot in — workflow builders,
            scheduling, time tracking, tax tools. Sealed does the four things
            that matter for getting one deal from proposal to paid: propose,
            sign, invoice, get paid — enforced, in that order, for free. Here&apos;s
            how it stacks up against the alternatives.
          </p>
        </section>

        <section className="container mx-auto grid max-w-4xl gap-6 px-4 pb-20 sm:grid-cols-3">
          {competitors.map((c) => (
            <Link
              key={c.slug}
              href={`/vs/${c.slug}`}
              className="group flex flex-col rounded-lg bg-card p-6 ring-1 ring-border transition-colors hover:ring-primary"
            >
              <h2 className="text-lg font-semibold">
                Sealed vs {c.name}
              </h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">
                {c.summary}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Compare
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
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
              <TrackedCtaLink href="/sign-up" location="alternatives_cta_band">
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
            <Link href="/alternatives" className="hover:text-foreground">
              Alternatives
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
