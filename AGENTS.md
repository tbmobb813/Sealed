## Learned User Preferences

- Enforce API architecture patterns: mutations via services, transactional activity events, service-layer state transitions, and tenant-scoped queries
- Do not re-run bootstrap scaffolding (create-turbo, nest new, create-next-app, prisma init, shadcn init) — the monorepo already exists
- Add workspace dependencies from repo root with `pnpm --filter @sealed/api add` or `pnpm --filter @sealed/web add`
- Run `pnpm install` consistently from WSL or Windows on the same checkout, not both, to avoid pnpm store path mismatches

## Learned Workspace Facts

- Turborepo monorepo: `apps/api` (NestJS), `apps/web` (Next.js 14), `packages/database`, `packages/ui`, `packages/types`
- Mutations follow Controller → Service → Prisma; controllers never call Prisma directly
- Every mutation emits an ActivityEvent inside the same `prisma.$transaction` via `emitActivityEvent()`
- State transitions are validated in services with `assertTransition()`; invalid transitions throw `ConflictException` with code `INVALID_STATE_TRANSITION`
- Tenant isolation via `TenantGuard`; every query filters by `tenantId`; service methods accept `tenantId`
- tsconfig extends must use `@sealed/config/typescript/nestjs` without the `.json` suffix for Nest decorators to work
- Prisma schema at `apps/api/prisma/schema.prisma`; client outputs to `packages/database/generated/client`; run `pnpm db:generate` after install and `pnpm db:migrate` after Postgres is up
- Next.js 14 requires `next.config.mjs`, not `next.config.ts`
- `pnpm dev` runs web on `:3000` and API on `:3001`; API routes use global prefix `/api/v1`
- Clerk auth: web `NEXT_PUBLIC_DEMO_MODE=false` + `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`; API `DEMO_MODE=false` + `CLERK_SECRET_KEY` + `CLERK_WEBHOOK_SECRET`; guards use `@clerk/backend`
- Clerk users provision via lazy `ClerkAuthGuard` on first valid JWT and `POST /api/v1/webhooks/clerk` (`user.created`); seeded data belongs to demo user `user_demo_001` only
- Postgres via docker-compose at `localhost:5432`; web uses native `fetch` in `lib/api-client.ts`
