# Sealed — Architecture Overview

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | NestJS |
| Database | PostgreSQL via Prisma |
| Auth | Clerk (demo mode available) |
| E-Signatures | DocuSeal (live, provider-switched; Dropbox Sign fallback) |
| Payments | Stripe |
| Monorepo | Turborepo + pnpm workspaces |

## Domain Model (high-level flow)

```
Client → Proposal → (ACCEPTED) → Agreement → (SIGNED) → Invoice → (SENT, payment link)
```

State gates are enforced via `assertPrecondition()` — no skipping steps.

## Key Modules (API)

- `proposals` — draft/send/accept lifecycle
- `agreements` — created from accepted proposal; sent via the active signature provider
- `invoices` — created from signed agreement; sent with Stripe payment link
- `clients` — tenant-scoped client records
- `activity` — append-only event log for every mutation
- `signature` — `SignatureProviderService` facade; routes to the active provider via `SIGNATURE_PROVIDER` env
- `docuseal` — e-signature provider integration (live default)
- `dropbox-sign` — e-signature provider integration (fallback, kept registered for in-flight requests)
- `stripe` — payment link provider integration
- `webhooks/clerk` — user provisioning
- `webhooks/docuseal` — signature completion callback (active provider)
- `webhooks/dropbox-sign` — signature completion callback (fallback provider)

## Authentication Modes

**Demo mode** (`DEMO_MODE=true`): web sends `Authorization: Bearer demo`; API maps to `user_demo_001`. No Clerk keys required.

**Clerk mode** (`DEMO_MODE=false`): full JWT auth via `@clerk/backend`. Users provisioned lazily via `ClerkAuthGuard` and `POST /api/v1/webhooks/clerk`.
