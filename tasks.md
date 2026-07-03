# Sealed — Active Tasks

## Pre-Launch Blockers

- [x] Full workflow verified in REAL mode (Clerk auth, no demo bypass) 2026-07-03: first sign-in auto-provisioned tenant/user → contact → proposal (DRAFT→SENT→VIEWED→ACCEPTED via public /p/ link with typed-name consent) → agreement (DRAFT→SENT via Dropbox Sign→SIGNED via manual mark) → invoice (DRAFT→SENT with real Stripe link→PAID via webhook, $150 payment recorded). Per-tenant INV numbering confirmed.
- [ ] UI bug: "Create Proposal" submit stays on "Creating..." and never redirects (proposal IS created; agreement/invoice forms redirect fine). File: proposals/new page.
- [ ] Dropbox Sign signed-webhook path untested locally (used manual "Mark as Signed"); needs tunnel or prod URL + real HMAC verification before launch.

- [x] Dropbox Sign end-to-end wired: testMode env-driven, signatureStatus synced on send, declined webhook handled
- [x] Real Stripe payment link generation verified end-to-end (2026-07-03): send → payment link → sandbox checkout paid → webhook → invoice PAID + payment record. Gotcha: `stripe listen` must be authenticated to the same sandbox account as `STRIPE_SECRET_KEY` (use `--api-key`), or events/`whsec` go to the wrong account.
  - File: `apps/api/src/modules/invoices/invoices.service.ts`

## Medium Priority

- [ ] Audit state-transition POST endpoints (`/accept`, `/reject`, `/void`) for correct HTTP status codes (should return 200, not 201)
- [ ] Remove compiled `.js` and `.d.ts` artifacts from source history; add to `.gitignore`

## In Progress

## Completed

- [x] Agreement creation validates source proposal status (ACCEPTED)
- [x] Agreement sendForSignature wired to DropboxSignService
- [x] Invoice creation validates source agreement status (SIGNED)
- [x] Stripe payment link stub wired on invoice send
- [x] Invoice number race condition fixed with pg_advisory_xact_lock
- [x] StateTransition immutability guard field name corrected
- [x] Public proposal accept endpoint + Dropbox Sign webhook handler
- [x] Dropbox Sign API integration (signature requests + webhook handling)
- [x] Decimal support for monetary values on invoices and proposals
- [x] Dashboard layout dynamic rendering + StatsModule
