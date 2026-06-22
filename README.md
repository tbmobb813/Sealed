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

# Start dev servers
pnpm dev
```

- API: http://localhost:3001
- Web: http://localhost:3000

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
