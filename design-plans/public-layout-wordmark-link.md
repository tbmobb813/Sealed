# Public-layout wordmark links home, matching sibling surfaces

Written against: b1f211f

## Evidence chain

- Surface: `apps/web/app/(public)/layout.tsx` — the header wordmark rendered on every client-facing page: `/p/[token]` (public proposal view) and `/invoices/paid` routes
- Problem: The header wordmark is an inert `<span className="text-xl font-bold text-primary">Sealed</span>`, while the visually identical wordmark is a link to `/` on the pricing page and on the auth layout. A client viewing a proposal — the product's highest-value external visitor — has no route from the page to learn what Sealed is.
- Design evidence: Exemplars in the same surface family at b1f211f: `apps/web/app/pricing/page.tsx` header (`<Link href="/" className="text-xl font-bold text-primary">Sealed</Link>`) and `apps/web/app/(auth)/layout.tsx` (wordmark as `Link` to `/`). Same element, same classes, inconsistent interactivity.
- Owner: `apps/web/app/(public)/layout.tsx` (header, line 9 at the written-against commit)
- Scope and affected surfaces: all routes under `apps/web/app/(public)/` — `p/[token]` and `invoices/paid`
- Uncertainty: The inert span could theoretically be deliberate (avoiding navigation away mid-acceptance), but no documentation records that intent, and the accept action is a prominent primary button unlikely to be abandoned for a small header link. If the product owner asserts the no-nav intent, this plan is void (see stop conditions).

## Design decision

Wrap the public-layout wordmark in `next/link` with `href="/"`, exactly matching the pricing-page exemplar. This makes the wordmark's behavior consistent across every surface that renders it and gives proposal-viewing clients a path to the landing page (a secondary acquisition channel: clients of freelancers are themselves prospective users).

## Reuse

- `next/link` `Link` component (already used throughout `apps/web`)
- Exemplar: `apps/web/app/pricing/page.tsx` header wordmark — copy its exact element shape: `<Link href="/" className="text-xl font-bold text-primary">Sealed</Link>`

No new primitive required. (Three headers now duplicate this wordmark pattern; do NOT extract a shared header component in this plan — that is scope widening.)

## Changes

1. `apps/web/app/(public)/layout.tsx`
   - Change: Add `import Link from "next/link";` and replace the header `<span className="text-xl font-bold text-primary">Sealed</span>` with `<Link href="/" className="text-xl font-bold text-primary">Sealed</Link>`.
   - Preserve: Header structure, border, container classes, `bg-muted/30` page background, and all `children` rendering.
   - Verify: On a public proposal page, the "Sealed" wordmark is clickable and navigates to `/`.

## Scope

- Inherit: `/p/[token]` and `/invoices/paid` (all `(public)` group routes)
- Verify: public proposal page in both pre-accept (SENT/VIEWED with Accept button) and post-accept states — wordmark must not visually change, only become interactive
- Exclude: the landing-page header wordmark (a span on `/` is self-referential and left as-is); extracting a shared header component; any auth or dashboard surface

## Validation

- Product: A client opens a proposal link, clicks the Sealed wordmark, and lands on the marketing homepage in the same tab; browser back returns to the proposal with state intact (GET view auto-advance is idempotent — status remains VIEWED).
- Interface: `/p/<valid token>` and the invalid-token "Proposal Not Found" state; mobile and desktop widths.
- System: Wordmark element shape now identical to the pricing exemplar; no parallel wordmark pattern introduced.
- Repository: `grep -n "Sealed</span>" "apps/web/app/(public)/layout.tsx"` → no matches; `grep -n 'Link href="/"' "apps/web/app/(public)/layout.tsx"` → one match.

## Stop conditions

- Stop if the product owner states that client-facing pages must not offer navigation away from the proposal (deliberate no-exit design) — record that decision instead of changing the element.
- Stop if `(public)/layout.tsx` has gained a navigation header since b1f211f that already resolves this.

## Design documentation

- After acceptance and validation: none (no design documentation system exists). If one is created later, record: "The Sealed header wordmark always links to `/` on every surface except the landing page itself."
