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

- [x] Stripe live keys + live-mode webhook DONE 2026-07-17: STRIPE_SECRET_KEY swapped to live in Railway; live-mode webhook endpoint created ("Your account", checkout.session.completed → sealedapi.techtrendwire.com/api/v1/webhooks/stripe); STRIPE_WEBHOOK_SECRET updated; unsigned POST correctly rejected 400 "Invalid Stripe webhook signature". Remaining: positive-path proof — first live payment (or `stripe trigger` in live mode) confirms the secret matches
- [ ] Dropbox Sign paid API plan → DROPBOX_SIGN_TEST_MODE=false (test mode watermarks docs + only sends to own email)
- [x] Resend DONE 2026-07-10: techtrendwire.com verified (root domain — covers sealed@ + future senders on the single free slot); RESEND_FROM_EMAIL=sealed@techtrendwire.com set in Railway. Proposal/invoice emails can now reach any client address
- [x] Clerk production instance DONE 2026-07-17 (verified: prod test event succeeded + real sign-in → dashboard 200s): pk_live on sign-in page, prod Frontend API live at clerk.sealed.techtrendwire.com (DNS verified), CLERK_SECRET_KEY swapped in Railway; prod-instance webhook re-registered (dev-instance hPRIXD doesn't carry over) at /api/v1/webhooks/clerk, new svix secret in Railway, unsigned POST correctly 400 "Missing svix headers". Remaining: (1) dashboard test event from prod instance to prove secret matches, (2) one real browser sign-in → dashboard to prove pk/sk are the same instance (dev-instance users don't carry over — fresh sign-up expected)
- [x] Custom domains LIVE 2026-07-10: web https://sealed.techtrendwire.com (Vercel), API https://sealedapi.techtrendwire.com (Railway); Hostinger DNS (2 CNAME + railway-verify TXT); CORS_ORIGIN/WEB_URL/NEXT_PUBLIC_APP_URL + NEXT_PUBLIC_API_URL updated and redeployed; ALL 3 WEBHOOKS re-pointed to sealedapi.techtrendwire.com (Dropbox Sign test passed, Clerk + Stripe URLs edited, same signing secrets). Old vercel.app/railway.app domains still serve as fallback

## Launch Runway (mailroom downtime)

- [x] Mobile responsiveness DONE 2026-07-17 (verified on device): sidebar → hamburger drawer below md (closes on nav/backdrop/Escape/route change), overflow-x-auto on all data tables, p-4 mobile padding, explicit viewport export (007dc68); Clerk popover transparency fixed by dropping @clerk/ui shadcn theme whose color vars were invalid HSL fragments (994183e)

- [x] Landing page LIVE 2026-07-10 at / (9f83527): hero + propose/sign/get-paid steps + sign-up CTAs; dashboard moved to /dashboard
- [x] Email capture LIVE 2026-07-10 (c8207e9 + 744c6d8): public POST /api/v1/marketing/subscribe → email_subscribers table (own Postgres), landing form with honeypot; verified in prod (200/400/CORS all correct); probe rows cleaned
- [~] First-10-users outreach — list started 2026-07-17: (1) Mars, (2) filmmaker friend (small-budget video gigs), (3) sister (AI-training startup, B2B proposals). All 3 messages SENT 2026-07-21 — first market contact. Next: follow up on replies, onboard each via docs/GETTING-STARTED.md. Trigger: first prospect with a real client ready to sign → buy Dropbox Sign paid plan

## Post-Launch Backlog (do NOT build before first real users)

- [ ] Proposal/agreement templates — deferred 2026-07-17: solves a repeat-volume problem that doesn't exist at 0 users; design from real user proposals post-launch. Cheaper first step if a prospect asks: "Duplicate proposal" action.

## Medium Priority

- [x] Audit state-transition POST endpoints — verified 2026-07-10: all transition endpoints (send/sign/accept/reject) already carry @HttpCode(200); item was stale
- [x] Compiled-artifact audit — verified 2026-07-10: no compiled .js/.d.ts tracked (only eslint configs + next-env.d.ts); item was stale

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
