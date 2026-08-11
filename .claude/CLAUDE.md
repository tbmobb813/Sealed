# Sealed — Project-Specific Claude Instructions

## What This Project Is

Turborepo monorepo SaaS app for client agreement and invoice management.
- `apps/api` — NestJS backend (port 3001), prefix `/api/v1`
- `apps/web` — Next.js 14 App Router frontend (port 3000)
- `packages/database` — Prisma client + schema
- `packages/ui` — Shared shadcn/ui components
- `packages/types` — Shared TypeScript types

## Architecture Rules (enforced — do not break)

- Mutations flow: Controller → Service → Prisma. Controllers never call Prisma directly.
- Every mutation emits `ActivityEvent` inside `prisma.$transaction` via `emitActivityEvent()`.
- State transitions use `assertTransition()`; invalid state throws 409 `INVALID_STATE_TRANSITION`.
- Preconditions use `assertPrecondition()`; unmet throws 409 `PRECONDITION_NOT_MET`.
- All queries are tenant-scoped via `tenantId`; `TenantGuard` enforces this at the controller layer.

## Workspace Commands

```bash
# Add dep to API
pnpm --filter @sealed/api add <package>

# Add dep to web
pnpm --filter @sealed/web add <package>

# Database
pnpm db:generate   # after schema changes
pnpm db:migrate    # after Postgres is up
pnpm db:seed       # load demo tenant data

# Dev
pnpm dev           # web :3000 + API :3001
```

## External Integrations

### E-Signatures
- DocuSeal is the only provider; `SignatureProviderService` at `apps/api/src/integrations/signature/` is the only entry point services should use
- `apps/api/src/integrations/docuseal/`, webhook `POST /api/v1/webhooks/docuseal` (shared-secret `X-Webhook-Secret` header = `DOCUSEAL_WEBHOOK_SECRET`, status always confirmed via `GET /submissions/{id}` before mutating). Env: `DOCUSEAL_API_KEY`, `DOCUSEAL_WEBHOOK_SECRET`, optional `DOCUSEAL_API_URL`
- Dropbox Sign (the original provider) was fully removed 2026-08-08 — no in-flight signature requests depended on it at removal time
### Stripe
- Payment links on invoice send
- `StripeService` at `apps/api/src/integrations/stripe/`
- Activated when `STRIPE_SECRET_KEY` is set
- **Pre-production:** Confirm real link creation is live

## Do Not Do

- Do not re-run `create-turbo`, `nest new`, `create-next-app`, `prisma init`, or `shadcn init`
- Do not run `pnpm install` from both WSL and Windows on the same checkout
- Do not use `next.config.ts` — must be `next.config.mjs`
- Do not write tsconfig extends with `.json` suffix for NestJS packages

## Current State

See `tasks.md` for open items and `PRE_LAUNCH_GAPS.md` for pre-launch blockers.
See `devnotes.md` for environment setup and debug log.
