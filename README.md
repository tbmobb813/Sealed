# Sealed

Multi-tenant proposal-to-payment platform built as a Turborepo monorepo.

## Stack

- **API:** NestJS + Prisma + PostgreSQL + Redis
- **Web:** Next.js 14 (App Router) + Clerk + shadcn/ui
- **Integrations:** Stripe, Dropbox Sign, Resend

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
cp .env.example apps/web/.env

# Run migrations and seed
pnpm db:migrate
pnpm db:seed

# Start dev servers (demo mode — no Clerk keys required)
# Set DEMO_MODE=true in apps/api/.env and NEXT_PUBLIC_DEMO_MODE=true in apps/web/.env.local
pnpm dev
```

- API: http://localhost:3001
- Web: http://localhost:3000

### Demo mode (no Clerk)

To run locally without Clerk keys:

```bash
# apps/api/.env
DEMO_MODE=true

# apps/web/.env.local
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then `docker compose up -d`, `pnpm db:seed`, and `pnpm dev`. The web app uses the seeded demo user (`demo@sealed.app`) automatically.

### Production auth (Clerk)

For real authentication, set `DEMO_MODE=false`, add Clerk keys from [clerk.com](https://dashboard.clerk.com), and map Clerk users to rows in your database.

## Project Structure

```
sealed/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── config/       # Shared ESLint & TypeScript configs
│   ├── types/        # Shared domain types
│   ├── database/     # Prisma client re-export
│   └── ui/           # Shared React components
└── docker-compose.yml
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start API and web in parallel |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |
