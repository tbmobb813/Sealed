## Learned User Preferences

- Enforce API architecture patterns: mutations via services, transactional activity events, service-layer state transitions, and tenant-scoped queries
- Do not re-run bootstrap scaffolding (create-turbo, nest new, create-next-app, prisma init, shadcn init) — the monorepo already exists
- Add workspace dependencies from repo root with `pnpm --filter @sealed/api add` or `pnpm --filter @sealed/web add`
- Run `pnpm install` consistently from WSL or Windows on the same checkout, not both, to avoid pnpm store path mismatches
- Keep `DEMO_MODE` (API) and `NEXT_PUBLIC_DEMO_MODE` (web) aligned — both `true` for demo, both `false` for Clerk

## Learned Workspace Facts

- Turborepo monorepo: `apps/api` (NestJS), `apps/web` (Next.js 14), `packages/database`, `packages/ui`, `packages/types`
- Mutations follow Controller → Service → Prisma; controllers never call Prisma directly
- Every mutation emits an ActivityEvent inside the same `prisma.$transaction` via `emitActivityEvent()`
- State transitions are validated in services with `assertTransition()`; invalid transitions throw `ConflictException` with code `INVALID_STATE_TRANSITION`
- Tenant isolation via `TenantGuard`; every query filters by `tenantId`; service methods accept `tenantId`
- tsconfig extends must use `@sealed/config/typescript/nestjs` without the `.json` suffix for Nest decorators to work
- Prisma schema at `apps/api/prisma/schema.prisma`; client outputs to `packages/database/generated/client`; run `pnpm db:generate` after install and `pnpm db:migrate` after Postgres is up; `pnpm db:seed` loads demo tenant data
- Next.js 14 requires `next.config.mjs`, not `next.config.ts`; `shouldUseClerk()` gates middleware when not in demo mode; `canInitializeClerk()` gates ClerkProvider and server auth (requires publishable key)
- `pnpm dev` runs web on `:3000` and API on `:3001`; API routes use global prefix `/api/v1`; Postgres via docker-compose at `localhost:5432`
- Demo mode: both `.env.example` files default `DEMO_MODE=true` / `NEXT_PUBLIC_DEMO_MODE=true`; web sends `Authorization: Bearer demo` to map `user_demo_001`
- Clerk auth: web `NEXT_PUBLIC_DEMO_MODE=false` + keys; API `DEMO_MODE=false` + `CLERK_SECRET_KEY` + `CLERK_WEBHOOK_SECRET`; guards use `@clerk/backend`; users provision via lazy `ClerkAuthGuard` and `POST /api/v1/webhooks/clerk` (`user.created`/`updated`/`deleted`); seeded data belongs to demo user only
- GitHub Actions: Node 24; `pnpm/action-setup@v4` reads pnpm from root `packageManager` (no separate `version`); workflows use `paths` filters on `apps/**`, `packages/**`, lockfile, and `turbo.json`; CI builds with `NEXT_PUBLIC_DEMO_MODE=true`; deploy with `false` + Clerk secret (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or `CLERK_PUBLISHABLE_KEY`); `turbo.json` `globalEnv` passes `NEXT_PUBLIC_*` to web build
- Web uses native `fetch` in `lib/api-client.ts`; `@sealed/ui` uses React 18 types aligned with `@sealed/web`
