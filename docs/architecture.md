# Sealed — Architecture Overview

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | NestJS |
| Database | PostgreSQL via Prisma |
| Auth | Clerk (demo mode available) |
| E-Signatures | Dropbox Sign |
| Payments | Stripe |
| Monorepo | Turborepo + pnpm workspaces |

## Domain Model (high-level flow)

```
Client → Proposal → (ACCEPTED) → Agreement → (SIGNED) → Invoice → (SENT, payment link)
```

State gates are enforced via `assertPrecondition()` — no skipping steps.

## Key Modules (API)

- `proposals` — draft/send/accept lifecycle
- `agreements` — created from accepted proposal; sent via Dropbox Sign
- `invoices` — created from signed agreement; sent with Stripe payment link
- `clients` — tenant-scoped client records
- `activity` — append-only event log for every mutation
- `dropbox-sign` — e-signature provider integration
- `stripe` — payment link provider integration
- `webhooks/clerk` — user provisioning
- `webhooks/dropbox-sign` — signature completion callback

## Authentication Modes

**Demo mode** (`DEMO_MODE=true`): web sends `Authorization: Bearer demo`; API maps to `user_demo_001`. No Clerk keys required.

**Clerk mode** (`DEMO_MODE=false`): full JWT auth via `@clerk/backend`. Users provisioned lazily via `ClerkAuthGuard` and `POST /api/v1/webhooks/clerk`.
