# Pre-Launch Gaps

Issues discovered during development that must be resolved before any
real customer interaction. These are intentional deferrals — not bugs
to fix today, but blockers before money or signatures touch the system.

## Critical (Constitutional Violations)

### 1. Agreement creation does not validate source proposal status
- **File:** `apps/api/src/modules/agreements/agreements.service.ts`
- **Method:** `create()`
- **Issue:** Agreements can be created from proposals in any status
  (DRAFT, SENT, VIEWED, REJECTED, EXPIRED, ACCEPTED).
- **Expected behavior:** Agreement creation must require source proposal
  to be in `ACCEPTED` status. Throw 409 `INVALID_STATE_TRANSITION`
  with `requires: ["ACCEPTED"]` if not.
- **Severity:** Constitutional. Violates "no out-of-order workflow" rule.

### 2. Agreement send does not call signature provider
- **File:** `apps/api/src/modules/agreements/agreements.service.ts`
- **Method:** `sendForSignature()`
- **Issue:** Method updates status to SENT but never calls
  `DropboxSignService.createSignatureRequest()`. No real signature
  request is created.
- **Expected behavior:** sendForSignature must call the signature
  provider, store `signatureRequestId`, and only transition to SENT
  on successful API response. On provider failure, transaction rolls back.
- **Severity:** High. The product literally does not perform its core
  function.

## High (User-Facing Bugs)

### 3. Invoice creation does not validate source agreement status
- **File:** `apps/api/src/modules/invoices/invoices.service.ts`
- **Method:** `create()`
- **Issue:** Invoices can be created from agreements in any status,
  including DRAFT and DECLINED.
- **Expected behavior:** Invoice creation must require source agreement
  to be in `SIGNED` status.
- **Severity:** High. Allows billing without legal foundation.

### 4. Stripe payment link not generated on invoice send
- **File:** `apps/api/src/modules/invoices/invoices.service.ts`
- **Method:** `send()`
- **Issue:** Method updates status to SENT but never creates a Stripe
  payment link or stores `stripePaymentLinkUrl`.
- **Severity:** High. Invoices cannot be paid.

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