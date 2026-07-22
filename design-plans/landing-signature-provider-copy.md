# Landing page names the correct e-signature provider (DocuSeal)

Written against: b1f211f

## Evidence chain

- Surface: `apps/web/app/page.tsx` — the "Sign" entry of the `steps` array, rendered in the three-step section of the landing route `/`
- Problem: The copy reads "The accepted proposal becomes an agreement, e-signed through Dropbox Sign." The live product sends signatures through DocuSeal (`SIGNATURE_PROVIDER=docuseal` in the production API environment; verified end-to-end 2026-07-21). A visitor who reads this page and later signs an agreement receives a DocuSeal-branded email and signing experience, contradicting the landing copy.
- Design evidence: `docs/GETTING-STARTED.md` step 4 was corrected 2026-07-21 for the identical stale reference ("powered by Dropbox Sign" → "powered by DocuSeal"), establishing the accepted wording. `tasks.md` records the provider switch and end-to-end verification.
- Owner: `apps/web/app/page.tsx` (`steps[1].body`, line 21 at the written-against commit)
- Scope and affected surfaces: landing page `/` only; `grep -rn "Dropbox Sign" apps/web --include="*.tsx"` at b1f211f returns exactly this one line
- Uncertainty: none

## Design decision

Replace the provider name in the "Sign" step copy: "e-signed through Dropbox Sign" → "e-signed through DocuSeal". This aligns the landing page with the live product experience and the already-corrected onboarding documentation. Keep the provider name (rather than removing it) because the sentence's purpose is credibility — naming the legally-binding e-sign provider — and GETTING-STARTED.md keeps the name for the same reason.

## Reuse

- Exemplar: `docs/GETTING-STARTED.md` step 4 — "powered by DocuSeal — legally binding"

No new primitive required; this is a one-string copy change.

## Changes

1. `apps/web/app/page.tsx`
   - Change: In the `steps` array, second entry (`title: "Sign"`), replace the substring `Dropbox Sign` with `DocuSeal` so the body reads: "The accepted proposal becomes an agreement, e-signed through DocuSeal. Status updates land in your dashboard automatically."
   - Preserve: All other copy, order, icons, and styling of the steps section.
   - Verify: Rendered landing page at `/` shows "e-signed through DocuSeal" in the "02 Sign" card.

## Scope

- Inherit: landing route `/` (only consumer of the `steps` array)
- Verify: none beyond the landing page
- Exclude: `apps/api` DropboxSign integration code and its comments (functional fallback, not user-facing copy); `docs/` (already corrected); dashboard surfaces (no provider naming found)

## Validation

- Product: A visitor reads the landing three-step section; the named signature provider matches what a real client experiences when signing.
- Interface: `/` at desktop and mobile widths; the steps section renders in a 3-column grid ≥sm and stacked below.
- System: Confirm no other rendered surface in `apps/web` still names Dropbox Sign.
- Repository: `grep -rn "Dropbox Sign" apps/web --include="*.tsx"` → no matches after the change.

## Stop conditions

- Stop if `SIGNATURE_PROVIDER` in production is no longer `docuseal` (provider switched back) — the correct name must follow the live provider.
- Stop if the steps copy has been rewritten since b1f211f such that the substring no longer exists; re-evaluate against the new copy.

## Design documentation

- After acceptance and validation: none (no design documentation system exists; `docs/GETTING-STARTED.md` already records the provider).
