# Sealed

Multi-tenant proposal-to-payment platform built as a Turborepo monorepo.

## Stack

- **API:** NestJS + Prisma + PostgreSQL + Redis
- **Web:** Next.js 14 (App Router) + Clerk + shadcn/ui
- **Integrations:** Stripe, DocuSeal, Resend

## Core flow

The primary domain chain:

1. **Proposal** — create in the dashboard, send to the client
2. **Public review** — client opens `/p/:token`, views line items, accepts
3. **Agreement** — create from an accepted proposal, send for signature
4. **Invoice** — bill after the agreement is signed

State transitions and immutability rules are enforced in the API service layer. Every mutation emits an activity event in the same database transaction.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for Postgres + Redis)

### Setup

```bash
# Install dependencies
pnpm install

# Start local services
docker compose up -d

# Copy environment files
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Run migrations and seed
pnpm db:migrate
pnpm db:seed

# Start dev servers (demo mode — no Clerk keys required)
pnpm dev
```

- API: http://localhost:3001
- Web: http://localhost:3000

### Demo mode (no Clerk)

To run locally without Clerk keys, keep these aligned in both apps:

```bash
# apps/api/.env
DEMO_MODE=true

# apps/web/.env.local
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then `docker compose up -d`, `pnpm db:seed`, and `pnpm dev`. The web app authenticates as the seeded demo user (`demo@sealed.app`) via `Authorization: Bearer demo`.

### Production auth (Clerk)

For real authentication, set `DEMO_MODE=false` / `NEXT_PUBLIC_DEMO_MODE=false`, add Clerk keys from [clerk.com](https://dashboard.clerk.com), and map Clerk users to rows in your database.

## Project Structure

```
sealed/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── e2e/              # Playwright end-to-end tests
├── packages/
│   ├── config/       # Shared ESLint & TypeScript configs
│   ├── types/        # Shared domain types
│   ├── database/     # Prisma client re-export
│   └── ui/           # Shared React components
├── playwright.config.ts
└── docker-compose.yml
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start API and web in parallel |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run API unit and integration tests |
| `pnpm test:e2e` | Run Playwright E2E tests (see below) |
| `pnpm test:e2e:install` | Install Chromium for Playwright |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

## Testing

### API tests

```bash
# Unit tests (state transitions, immutability guards)
pnpm --filter @sealed/api test:unit

# Integration tests (full domain chain via HTTP)
pnpm --filter @sealed/api test:integration
```

### E2E tests (Playwright)

The E2E suite walks the full UI path: create proposal → send → accept on the public page → create agreement → verify activity log.

**Prerequisites:** Postgres running (`docker compose up -d`). Stop `pnpm dev` first if ports 3000/3001 are in use — Playwright starts its own API and web servers.

```bash
# One-time browser install
pnpm test:e2e:install

# Migrate, build web, start servers, run tests
pnpm test:e2e
```

E2E tests reset and seed the database before each run. CI runs them automatically after `pnpm build` on pull requests.

## CI

GitHub Actions runs lint, typecheck, build, API tests, and Playwright E2E on changes to `apps/`, `packages/`, and workflow files. Builds use `NEXT_PUBLIC_DEMO_MODE=true` with a Postgres service container.
