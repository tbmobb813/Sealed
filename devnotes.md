# Sealed — Dev Notes & Changelog

## Setup

```bash
# Start Postgres
docker-compose up -d

# Install deps (from WSL only — not mixed WSL/Windows)
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations + seed
pnpm db:migrate
pnpm db:seed

# Start dev servers (web :3000, API :3001)
pnpm dev
```

## Environment Quick Reference

| Variable | Location | Notes |
|---|---|---|
| `DEMO_MODE` | `apps/api/.env` | `true` = demo user, `false` = real Clerk auth |
| `NEXT_PUBLIC_DEMO_MODE` | `apps/web/.env` | Must match API setting |
| `CLERK_SECRET_KEY` | `apps/api/.env` | Required when `DEMO_MODE=false` |
| `CLERK_WEBHOOK_SECRET` | `apps/api/.env` | For `POST /api/v1/webhooks/clerk` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `apps/web/.env` | Required when demo mode off |
| `DROPBOX_SIGN_API_KEY` | `apps/api/.env` | Live Dropbox Sign integration |
| `DROPBOX_SIGN_WEBHOOK_SECRET` | `apps/api/.env` | HMAC verification for webhooks |
| `STRIPE_SECRET_KEY` | `apps/api/.env` | Enables real Stripe payment links |

## Key Architecture Notes

- Controller → Service → Prisma (controllers never call Prisma directly)
- Every mutation emits `ActivityEvent` inside `prisma.$transaction` via `emitActivityEvent()`
- State transitions validated with `assertTransition()`; invalid throws 409 `INVALID_STATE_TRANSITION`
- Tenant isolation via `TenantGuard`; all queries filter by `tenantId`
- Prisma schema: `apps/api/prisma/schema.prisma`; client outputs to `packages/database/generated/client`

## Debug Log

<!-- Date — Issue — Fix -->
