# Sealed — Active Tasks

## Pre-Launch Blockers

- [x] Full workflow verified in REAL mode (Clerk auth, no demo bypass) 2026-07-03: first sign-in auto-provisioned tenant/user → contact → proposal (DRAFT→SENT→VIEWED→ACCEPTED via public /p/ link with typed-name consent) → agreement (DRAFT→SENT via Dropbox Sign→SIGNED via manual mark) → invoice (DRAFT→SENT with real Stripe link→PAID via webhook, $150 payment recorded). Per-tenant INV numbering confirmed.
- [x] UI bug: "Create Proposal" stuck on "Creating..." — could NOT reproduce (2026-07-08): verified create → redirect → detail render in BOTH demo mode and real Clerk mode; no web code changed since the bug was filed, so it was likely a stale dev server / HMR state on 2026-07-03. Reopen if seen again.
- [~] Deployment (2026-07-09): Railway LIVE — API at https://sealedapi-production.up.railway.app; CORS_ORIGIN/WEB_URL now set to https://sealed-api.vercel.app. Vercel project `sealed-api` fixed (was importing apps/api with NestJS preset → build error): Framework=Next.js, Root Directory=apps/web, env vars NEXT_PUBLIC_API_URL + NEXT_PUBLIC_DEMO_MODE=false added. Remaining: user adds NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY (prod) in Vercel; first successful web deploy; register Stripe/Dropbox Sign/Clerk webhooks against the Railway domain; VERCEL_* GitHub secrets optional (Vercel Git integration deploys on push). GitHub Actions still blocked on account billing. Vercel↔GitHub connection was broken (pushes ignored, Redeploy 500) — RESOLVED 2026-07-09 by user disconnect/reconnect in Vercel Git settings; queued builds flushed and web is LIVE at https://sealed-api.vercel.app (build green, /sign-in 200). END-TO-END VERIFIED 2026-07-09: user signed in via Clerk on Vercel web, tenant auto-provisioned, dashboard API calls (stats/contacts/proposals/agreements/invoices) all 200 with tenantId scoping against Railway. Notes: (1) Clerk keys are DEV-instance (accounts.dev, "Development mode" badge) — swap both Vercel and Railway to a Clerk production instance before real launch; (2) transient 503 "Failed to provision user from Clerk" on /activity during first-ever request burst (provisioning race) — benign once provisioned, but consider serializing provisioning. Remaining: register Stripe/Dropbox Sign/Clerk webhooks against Railway domain, live signature + payment tests.
- [~] Dropbox Sign webhook (2026-07-09): Account callback registered to https://sealedapi-production.up.railway.app/api/v1/webhooks/dropbox-sign; dashboard Test event delivered and HMAC-verified by prod API ("Hello API Event Received" ack confirmed). Remaining: one real signature_request_signed flow end-to-end (agreement → sign → SIGNED). Stripe webhook also live in sandbox (we_1TrQQy..., checkout.session.completed, secret rotated in Railway; invalid-signature now 400 per fix 4705e00). Clerk webhook live (endpoint hPRIXD, user.created/updated/deleted, secret in Railway): unsigned POST → 400 Missing svix headers; dashboard user.deleted test event delivered SUCCEEDED (Svix signature verified in prod). ALL THREE WEBHOOKS registered + verified 2026-07-09.

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
