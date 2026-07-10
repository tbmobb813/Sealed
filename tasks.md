# Sealed — Active Tasks

**PRODUCTION VERIFIED END-TO-END 2026-07-10** — full workflow on deployed stack (Vercel web + Railway API + Postgres): Clerk sign-in → contact → proposal (sent + accepted) → agreement (sent via Dropbox Sign, really signed, webhook → SIGNED) → invoice (sent with Stripe payment link, paid with test card, webhook → PAID in 64ms). All in sandbox/test tiers; go-live hardening list below.

## Pre-Launch Blockers

- [x] Full workflow verified in REAL mode (Clerk auth, no demo bypass) 2026-07-03: first sign-in auto-provisioned tenant/user → contact → proposal (DRAFT→SENT→VIEWED→ACCEPTED via public /p/ link with typed-name consent) → agreement (DRAFT→SENT via Dropbox Sign→SIGNED via manual mark) → invoice (DRAFT→SENT with real Stripe link→PAID via webhook, $150 payment recorded). Per-tenant INV numbering confirmed.
- [x] UI bug: "Create Proposal" stuck on "Creating..." — could NOT reproduce (2026-07-08): verified create → redirect → detail render in BOTH demo mode and real Clerk mode; no web code changed since the bug was filed, so it was likely a stale dev server / HMR state on 2026-07-03. Reopen if seen again.
- [~] Deployment (2026-07-09): Railway LIVE — API at https://sealedapi-production.up.railway.app; CORS_ORIGIN/WEB_URL now set to https://sealed-api.vercel.app. Vercel project `sealed-api` fixed (was importing apps/api with NestJS preset → build error): Framework=Next.js, Root Directory=apps/web, env vars NEXT_PUBLIC_API_URL + NEXT_PUBLIC_DEMO_MODE=false added. Remaining: user adds NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY + CLERK_SECRET_KEY (prod) in Vercel; first successful web deploy; register Stripe/Dropbox Sign/Clerk webhooks against the Railway domain; VERCEL_* GitHub secrets optional (Vercel Git integration deploys on push). GitHub Actions still blocked on account billing. Vercel↔GitHub connection was broken (pushes ignored, Redeploy 500) — RESOLVED 2026-07-09 by user disconnect/reconnect in Vercel Git settings; queued builds flushed and web is LIVE at https://sealed-api.vercel.app (build green, /sign-in 200). END-TO-END VERIFIED 2026-07-09: user signed in via Clerk on Vercel web, tenant auto-provisioned, dashboard API calls (stats/contacts/proposals/agreements/invoices) all 200 with tenantId scoping against Railway. Notes: (1) Clerk keys are DEV-instance (accounts.dev, "Development mode" badge) — swap both Vercel and Railway to a Clerk production instance before real launch; (2) transient 503 "Failed to provision user from Clerk" on /activity during first-ever request burst (provisioning race) — benign once provisioned, but consider serializing provisioning. Remaining: register Stripe/Dropbox Sign/Clerk webhooks against Railway domain, live signature + payment tests.
- [x] Dropbox Sign signed-webhook VERIFIED END-TO-END in production (2026-07-10): real signature on agreement 711f4eaf → all_signed webhook HMAC-verified + status-confirmed → agreement flipped to SIGNED automatically. Fixes shipped en route: a54f9f2 (handle signature_request_all_signed — the `signed` event races isComplete on single-signer requests and is correctly rejected; all_signed is the reliable trigger; signed handler now idempotent), 4ff0f6d (Resend SDK returns {error} without throwing — errors now logged). Env: DROPBOX_SIGN_TEST_MODE=true (free API plan requires test_mode; paid plan before real launch), NEXT_PUBLIC_APP_URL fixed from localhost:3000 → https://sealed-api.vercel.app. Known test-tier limits: Resend onboarding@resend.dev + Dropbox Sign test mode both deliver only to own account email — verify Resend domain + set RESEND_FROM_EMAIL + paid Dropbox Sign plan for real customers. Stripe webhook also live in sandbox (we_1TrQQy..., checkout.session.completed, secret rotated in Railway; invalid-signature now 400 per fix 4705e00). Clerk webhook live (endpoint hPRIXD, user.created/updated/deleted, secret in Railway): unsigned POST → 400 Missing svix headers; dashboard user.deleted test event delivered SUCCEEDED (Svix signature verified in prod). ALL THREE WEBHOOKS registered + verified 2026-07-09.

- [x] Dropbox Sign end-to-end wired: testMode env-driven, signatureStatus synced on send, declined webhook handled
- [x] Real Stripe payment link generation verified end-to-end (2026-07-03): send → payment link → sandbox checkout paid → webhook → invoice PAID + payment record. Gotcha: `stripe listen` must be authenticated to the same sandbox account as `STRIPE_SECRET_KEY` (use `--api-key`), or events/`whsec` go to the wrong account.
  - File: `apps/api/src/modules/invoices/invoices.service.ts`

## Go-Live Hardening (before real customers / real money)

- [ ] Stripe live keys + live-mode webhook endpoint (webhooks don't carry over from sandbox)
- [ ] Dropbox Sign paid API plan → DROPBOX_SIGN_TEST_MODE=false (test mode watermarks docs + only sends to own email)
- [ ] Resend: verify a sending domain + set RESEND_FROM_EMAIL (onboarding@resend.dev only reaches own email)
- [ ] Clerk production instance → swap keys in Vercel AND Railway together
- [ ] Custom domain (optional): replace sealed-api.vercel.app → update CORS_ORIGIN/WEB_URL/NEXT_PUBLIC_APP_URL

## Launch Runway (mailroom downtime)

- [x] Landing page LIVE 2026-07-10 at / (9f83527): hero + propose/sign/get-paid steps + sign-up CTAs; dashboard moved to /dashboard
- [x] Email capture LIVE 2026-07-10 (c8207e9 + 744c6d8): public POST /api/v1/marketing/subscribe → email_subscribers table (own Postgres), landing form with honeypot; verified in prod (200/400/CORS all correct); probe rows cleaned
- [ ] First-10-users outreach

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
