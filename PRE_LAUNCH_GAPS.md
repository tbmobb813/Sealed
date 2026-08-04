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
  before the switch keep working. Its real API integration is still a stub —
  not a blocker since it is not the active provider, but do not switch
  `SIGNATURE_PROVIDER` back to `dropbox_sign` without finishing it first.

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
- **Files:** Throughout `apps/api/src/`
- **Issue:** Build artifacts checked into source control.
- **Fix:** Add to `.gitignore`, remove from history, ensure
  `pnpm build` only outputs to `dist/`.
- **Severity:** Low (cosmetic), but affects diff quality and
  build reproducibility.

### 6. Send endpoints used to return 201 (now fixed for /send routes,
    but not validated across all endpoints)
- **Status:** Resolved for proposal, agreement, invoice `/send` routes
  via `@HttpCode(200)`.
- **Remaining:** Audit other state-transition POST endpoints
  (e.g., `/accept`, `/reject`, `/void`) for the same issue.

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
- **Remaining before production:** none for the active (DocuSeal) path. Real
  Dropbox Sign API calls are still stubbed — only relevant if
  `SIGNATURE_PROVIDER` is switched back.
