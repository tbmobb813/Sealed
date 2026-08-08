# Pre-Launch Gaps

Issues discovered during development that must be resolved before any
real customer interaction. These are intentional deferrals — not bugs
to fix today, but blockers before money or signatures touch the system.

## Critical (Constitutional Violations)

### 1. Agreement creation does not validate source proposal status
- **Status:** ✅ Resolved.
- **File:** `apps/api/src/modules/agreements/agreements.service.ts`
- **Method:** `create()`
- **Fix:** `assertPrecondition` requires proposal `ACCEPTED`; throws 409
  `PRECONDITION_NOT_MET` with structured details.

### 2. Agreement send does not call signature provider
- **Status:** ✅ Resolved and verified end-to-end in prod (2026-07-21).
- **File:** `apps/api/src/modules/agreements/agreements.service.ts`
- **Method:** `sendForSignature()`
- **Fix:** Calls `SignatureProviderService.createSignatureRequest()`, which
  routes to the active provider (`SIGNATURE_PROVIDER` env), and stores
  `signatureRequestId` and `signatureProvider` before transitioning to SENT.
- **Provider:** DocuSeal is the live default (`apps/api/src/integrations/docuseal/`)
  — chosen over Dropbox Sign on cost ($20/mo unlimited vs $100/mo for 100
  requests). Real agreement sent, real signature, webhook auto-flipped
  agreement to SIGNED, verified against prod 2026-07-21.
- **Dropbox Sign:** remains registered as an env-switchable fallback
  (`apps/api/src/integrations/dropbox-sign/`) so in-flight requests created
  before the switch keep working. Its real API integration is fully built
  (real `@dropbox/sign` SDK calls, HMAC-verified webhook) and was itself
  verified end-to-end in production on 2026-07-10, before the DocuSeal
  switch — not a stub. `DropboxSignService.isStubMode` only short-circuits
  to a fake response in dev/CI (`DROPBOX_SIGN_STUB=true` or the test API
  key), matching the same dev-only pattern Stripe and DocuSeal use. Safe to
  switch `SIGNATURE_PROVIDER` back to `dropbox_sign` if needed.

## High (User-Facing Bugs)

### 3. Invoice creation does not validate source agreement status
- **Status:** ✅ Resolved.
- **File:** `apps/api/src/modules/invoices/invoices.service.ts`
- **Method:** `create()`
- **Fix:** `assertPrecondition` requires agreement `SIGNED`; throws 409
  `PRECONDITION_NOT_MET`.

### 4. Stripe payment link not generated on invoice send
- **Status:** ✅ Resolved and verified end-to-end in Stripe test mode (2026-07-03): real payment link on send, sandbox checkout paid, webhook flipped invoice to PAID with payment record.
- **File:** `apps/api/src/modules/invoices/invoices.service.ts`
- **Method:** `send()`
- **Fix:** Calls `StripeService.createPaymentLink()`, stores
  `stripePaymentLinkId` and `stripePaymentLinkUrl` on send.

### 9. Invoice number generation race condition
- **Status:** ✅ Resolved.
- **File:** `apps/api/src/modules/invoices/invoices.service.ts`
- **Fix:** `pg_advisory_xact_lock(hashtext(tenantId))` serializes per-tenant
  number generation inside the create transaction. `@@unique([tenantId, number])`
  was already present as a safety net.

## Medium (Cleanup)

### 5. Compiled .js and .d.ts files committed to repo
- **Status:** ✅ Resolved — verified 2026-07-10: no compiled `.js`/`.d.ts`
  tracked under `apps/api/src/` (only eslint configs and `next-env.d.ts`
  intentionally live outside `dist/`).

### 6. Send endpoints used to return 201 (now fixed for /send routes,
    but not validated across all endpoints)
- **Status:** ✅ Resolved — verified 2026-07-10: every state-transition
  POST endpoint (`send`, `sign`, `accept`, `reject`) already carries
  `@HttpCode(200)`; this item was stale by the time it was checked.

### 10. StateTransitionFilter orphaned dead code
- **Status:** N/A — file never existed in current tree; only
  `AllExceptionsFilter` is registered.

## Discovered During Smoke Testing

### 7. Day 1 immutability guard had wrong field name for agreements
- **Status:** ✅ Resolved.
- **Original bug:** `assertMutable("agreement", existing.signatureStatus)`
  where field is actually `existing.status`.
- **Effect:** All agreement updates were silently blocked with 409.
- **Caught by:** Manual smoke test (Step 7-10 sequence).
- **Lesson:** Guidance from external sources (including AI assistants)
  must be verified against actual schema before applying.

### 8. Agreement sendForSignature used non-existent field `signatureStatus`
- **Status:** ✅ Resolved.
- **File:** `apps/api/src/modules/agreements/agreements.service.ts`
- **Bug:** `sendForSignature` referenced `agreement.signatureStatus` in
  both `assertTransition` and `updateMany.data`. The Agreement model
  has only `status`, not `signatureStatus`.
- **Why it didn't immediately error:** Likely stale Prisma client.
  Regenerating via `pnpm db:generate` removed the silent fallback.
- **Lesson:** When fixing a field name in one method, grep the entire
  service file for the old name. State fields are usually referenced
  in multiple places (read in guards, written in transitions).
- **Caught by:** Step 10 of immutability smoke test returning 200 instead of 409.

## Security Test Coverage

### 11. Zero test coverage on auth/webhook security paths
- **Status:** ✅ Resolved 2026-08-07.
- **Issue:** `ClerkAuthGuard`, `TenantGuard`, `RolesGuard`, and the HMAC/
  shared-secret verification for all three webhooks (Stripe, Dropbox Sign,
  DocuSeal) had no tests at all — the exact paths where an untested edge
  case becomes an unauthorized read/write or a forged payment/signature
  event, not a visible bug. Flagged before any paid-vertical push, since a
  trust failure here (e.g. a client's deposit) is not recoverable the way a
  UI bug is.
- **Fix:** Added unit test coverage (78 tests total) against the real
  crypto/logic, not mocks of it:
  - `stripe.service.spec.ts`, `dropbox-sign.service.spec.ts`,
    `docuseal.service.spec.ts` — signature/secret verification: valid
    signature, tampered payload, wrong key/secret, replay/staleness
    (Dropbox Sign), malformed input handled without throwing, unconfigured
    secret.
  - `stripe.webhook.controller.spec.ts` — bad signature short-circuits to
    400 before the event handler runs.
  - `dropbox-sign.webhook.service.spec.ts`, `docuseal.webhook.service.spec.ts`
    — status re-confirmed against the provider API rather than trusting the
    webhook body, idempotent handling of duplicate/out-of-order deliveries,
    invalid state transitions rejected.
  - `tenant.guard.spec.ts` — tenant resolved strictly from
    `request.user.tenantId`, never from client-supplied body/params; only
    `{id, slug, name}` attached to `request.tenant`.
  - `roles.guard.spec.ts`, `clerk-auth.guard.spec.ts` — role enforcement,
    demo-mode token/user checks, disabled-user rejection, and the
    concurrent-provisioning race (a losing request re-checks for a
    sibling's already-provisioned user before failing).
  - `stripe.webhook.service.spec.ts` — also covers the ACH-specific
    idempotency fix from the same date (see git history): a
    `checkout.session.completed` with `payment_status !== "paid"` no longer
    marks the invoice PAID before the debit settles.
- **Cross-checked 2026-08-07:** ran the existing e2e suite
  (`tests/integration/*.e2e-spec.ts`) against a real local Postgres —
  336/336 tests pass (324 unit + 12 integration), no regressions from the
  ACH fix or the new security tests above.

## Workflow API (added during pre-launch remediation)

### Public proposal accept + signature webhook
- **Status:** ✅ Implemented and verified live in prod (2026-07-21).
- **Endpoints:**
  - `GET /proposals/public/:token` — auto-advances SENT → VIEWED
  - `POST /proposals/public/:token/accept` — VIEWED → ACCEPTED
  - `POST /webhooks/docuseal` — active provider webhook; shared-secret
    `X-Webhook-Secret` header (`DOCUSEAL_WEBHOOK_SECRET`), status always
    reconfirmed via `GET /submissions/{id}` before mutating, handles signed
    submission → SIGNED. Verified against prod: no header → 400, wrong
    secret → 400, correct secret → 200.
  - `POST /webhooks/dropbox-sign` — fallback provider webhook (HMAC-verified),
    kept registered for in-flight requests created before the DocuSeal switch.
- **Remaining before production:** none. Both providers' real API calls are
  live and verified in prod (DocuSeal 2026-07-21, Dropbox Sign 2026-07-10);
  `SIGNATURE_PROVIDER` can be switched between them freely.
