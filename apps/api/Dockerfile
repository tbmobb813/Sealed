# Build from the repo root so the pnpm workspace is available:
#   docker build -f apps/api/Dockerfile .
# Railway does this automatically via railway.json (dockerfilePath).

FROM node:24-slim AS base
# Prisma engines require OpenSSL at runtime
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@11.9.0
WORKDIR /app

FROM base AS build
# Manifests first so dependency install is cached across source changes
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages packages
RUN pnpm db:generate
RUN pnpm exec turbo build --filter=@sealed/api

# Copying /app wholesale keeps pnpm's symlinked node_modules intact.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3001
CMD ["node", "apps/api/dist/src/main"]
