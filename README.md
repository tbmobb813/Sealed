# Sealed

**Live:** [sealed.techtrendwire.com](https://sealed.techtrendwire.com) — free during early access.

**Sealed turns "I'll send over a proposal" into a signed, paid deal —
one link, no spreadsheet of who-signed-what, no manually chasing anyone.**

Right now, a freelancer or small studio runs one deal through three
disconnected tools: the proposal is a Google Doc, the contract lives in a
separate e-sign app, the invoice lives in yet another. Nothing connects
them, so nothing stops a client from getting invoiced for work they never
actually signed off on, and nothing tells the freelancer when a "sent"
proposal just quietly went nowhere.

Sealed replaces all three tools with one flow the client experiences as a
single link, and each step is *mechanically* gated behind the one before
it:

**Proposal → client accepts → signs the agreement → pays the invoice.**

Concretely: you can't create an agreement until the proposal shows
ACCEPTED, and you can't create an invoice until the agreement shows
SIGNED — the API rejects the attempt. The client never makes an account;
they open a link, and every action they take (viewed it, accepted it,
signed it, paid it) updates the freelancer's dashboard automatically,
in real time, via webhook — not by anyone refreshing their inbox.

**What changes for the person using it:** no more "did they ever sign
that?" three weeks later, no more invoicing work that was never actually
agreed to, and no more three separate tools to keep in sync by hand.

Built as a Turborepo monorepo.

## Stack

- **API:** NestJS + Prisma + PostgreSQL + Redis (shared rate-limit storage for public endpoints across replicas)
- **Web:** Next.js 16 (App Router) + Clerk + shadcn/ui
- **Integrations:** DocuSeal for e-signatures, Stripe for payment links, Resend for transactional email

## Core flow

The primary domain chain, state-machine enforced end to end:

1. **Proposal** — create in the dashboard, send to the client
2. **Public review** — client opens `/p/:token` (no login), views line items, accepts or declines
3. **Agreement** — can only be created from an ACCEPTED proposal; sent for e-signature via DocuSeal, flips to SIGNED automatically on webhook
4. **Invoice** — can only be created from a SIGNED agreement; sent with a live Stripe payment link, flips to PAID automatically on webhook

Every mutation emits an activity event in the same database transaction, so the dashboard's status is never a guess — it's driven by real webhook events (view, accept, sign, pay), not something a freelancer has to manually update.

See [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md) for the user-facing walkthrough of this same flow.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 11+ (see `packageManager` in root `package.json`)
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

- API: [http://localhost:3001]
- Web: [http://localhost:3000]

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

sealed/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── docs/             # Getting-started guide, deployment/architecture notes, outreach material
├── e2e/              # Playwright end-to-end tests
├── packages/
│   ├── config/       # Shared ESLint & TypeScript configs
│   ├── types/        # Shared domain types
│   ├── database/     # Prisma client re-export
│   └── ui/           # Shared React components
├── PRE_LAUNCH_GAPS.md  # Pre-launch blockers found during dev/pentest, with resolution status
├── playwright.config.ts
└── docker-compose.yml

## Scripts

| Script | Description |
| -------- | ------------- |
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
