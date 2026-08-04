# Deployment

## Topology

| Piece | Host | How it deploys |
|---|---|---|
| `apps/web` (Next.js) | Vercel | GitHub Actions `deploy.yml` (Vercel CLI) on push to `main` |
| `apps/api` (NestJS) | Railway | Railway GitHub integration, builds `apps/api/Dockerfile` per `railway.json` |
| Postgres | Railway | Managed plugin in the same Railway project |

Migrations run automatically before each API deploy via `preDeployCommand`
(`prisma migrate deploy`) in `railway.json`. Healthcheck hits `GET /health`
(unprefixed — excluded from `/api/v1`).

## One-time setup

### 1. Railway (API + Postgres)

1. Create a Railway project → **Deploy from GitHub repo** → select this repo,
   branch `main`. Railway picks up `railway.json` at the repo root.
2. Add a **PostgreSQL** service to the project.
3. On the API service, set variables (see table below). For the database use
   a reference: `DATABASE_URL = ${{Postgres.DATABASE_URL}}`.
4. Generate a public domain for the API service (Settings → Networking).
   This becomes `NEXT_PUBLIC_API_URL` and the base for all webhook URLs.

### 2. Vercel (web)

1. `vercel link` from `apps/web` (or import the repo in the dashboard with
   **Root Directory = `apps/web`**). Framework preset: Next.js.
2. Set the project env vars in Vercel (Production) — see table below.
3. Add GitHub Actions secrets so `deploy.yml` can deploy:
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   (org/project IDs are in `.vercel/project.json` after `vercel link`).
   Until these secrets exist the deploy job skips with a notice.

### 3. Webhooks (after both URLs exist)

| Provider | URL | Secret env var |
|---|---|---|
| Stripe | `https://<api-domain>/api/v1/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` |
| DocuSeal (active) | `https://<api-domain>/api/v1/webhooks/docuseal` | `X-Webhook-Secret` header = `DOCUSEAL_WEBHOOK_SECRET` |
| Dropbox Sign (fallback) | `https://<api-domain>/api/v1/webhooks/dropbox-sign` | verified via `DROPBOX_SIGN_API_KEY` HMAC |
| Clerk | `https://<api-domain>/api/v1/webhooks/clerk` | `CLERK_WEBHOOK_SECRET` |

Register each in the provider dashboard, then copy the signing secret into
the Railway service variables.

## Environment variables

### API (Railway service)

| Variable | Value / source |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` reference |
| `DEMO_MODE` | `false` |
| `CLERK_SECRET_KEY` | Clerk **production** instance |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook endpoint signing secret |
| `STRIPE_SECRET_KEY` | Live key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | From the registered Stripe endpoint |
| `SIGNATURE_PROVIDER` | `docuseal` |
| `DOCUSEAL_API_KEY` | Production API key |
| `DOCUSEAL_WEBHOOK_SECRET` | Shared secret sent as `X-Webhook-Secret` |
| `DROPBOX_SIGN_API_KEY` | Production API key (fallback provider, only used if `SIGNATURE_PROVIDER=dropbox_sign`) |
| `DROPBOX_SIGN_TEST_MODE` | `false` |
| `RESEND_API_KEY` | Production key |
| `CORS_ORIGIN` | Web app origin, e.g. `https://app.example.com` |
| `WEB_URL` | Same as `CORS_ORIGIN` |

`PORT` is injected by Railway; `main.ts` already honors it.

### Web (Vercel project)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `false` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk **production** instance |
| `CLERK_SECRET_KEY` | Clerk production instance (server-side auth) |
| `NEXT_PUBLIC_API_URL` | Railway API domain, e.g. `https://api.example.com` |

## Post-deploy verification

1. `curl https://<api-domain>/health` → `{"status":"ok",...}`
2. Sign in on the web app (Clerk production instance).
3. Create contact → proposal → send → accept via public link.
4. Create agreement → send → sign a real DocuSeal request → webhook
   flips it to SIGNED (this closes the "webhook untested" launch blocker).
5. Create invoice → send → pay the Stripe link → webhook flips to PAID.

## Local Docker sanity check

```bash
docker build -f apps/api/Dockerfile -t sealed-api .
docker run --rm -p 3001:3001 --env-file apps/api/.env \
  -e DATABASE_URL=postgresql://sealed:sealed_dev@host.docker.internal:5432/sealed \
  sealed-api
curl localhost:3001/health
```
