// Clerk's Frontend API — the domain its JS SDK talks to for session/auth
// calls. Prod uses the custom domain (clerk.sealed.techtrendwire.com, see
// tasks.md 2026-07-17); dev/preview Clerk instances live under
// *.clerk.accounts.dev. Both are listed unconditionally — an unused allowed
// source in a CSP isn't a vulnerability, it just permits a legitimate,
// Clerk-owned domain that happens not to be in play for this environment.
const CLERK_FRONTEND_API_DOMAINS =
  "https://clerk.sealed.techtrendwire.com https://*.clerk.accounts.dev";

// Per Clerk's documented CSP requirements
// (https://clerk.com/docs/security/clerk-csp) for Next.js App Router.
// 'unsafe-eval' is only needed in dev (HMR/eval-based source maps) — see
// "Development environments require adding 'unsafe-eval' to script-src".
//
// Promoted to enforcing 2026-08-09 after a real-browser pass against the
// live prod Clerk session (pk_live, clerk.sealed.techtrendwire.com):
// sign-in, dashboard, contacts, proposals (incl. an accepted one),
// agreements (incl. a signed one), invoices (incl. a paid one), and the
// public /invoices/paid confirmation page all loaded with zero CSP
// violations in the console under the (then) Report-Only policy. Had
// been shipped Report-Only since this sandbox runs in demo mode, which
// never initializes Clerk's JS SDK (see shouldUseClerk()/
// canInitializeClerk() in lib/demo.ts), so the Clerk-specific directives
// were originally transcribed from Clerk's docs, unverified. The
// `report-uri` below (added same day) keeps collecting evidence going
// forward — if a real violation shows up in enforcing mode, check there
// or the browser console before loosening a directive.
function buildContentSecurityPolicy() {
  const isProd = process.env.NODE_ENV === "production";
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"]),
    "https://challenges.cloudflare.com",
    "https://*.protect.clerk.com",
    CLERK_FRONTEND_API_DOMAINS,
  ].join(" ");

  // Diagnostic-only sink for Report-Only violations — see
  // apps/api/src/modules/csp-report/csp-report.controller.ts. Feeds the
  // manual promotion check below rather than gating it automatically.
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const reportUri = `${apiUrl}/api/v1/csp-report`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `connect-src 'self' https://*.protect.clerk.com ${CLERK_FRONTEND_API_DOMAINS}`,
    `frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com ${CLERK_FRONTEND_API_DOMAINS}`,
    `img-src 'self' data: https://img.clerk.com`,
    `style-src 'self' 'unsafe-inline'`,
    `worker-src 'self' blob:`,
    `font-src 'self' data:`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `report-uri ${reportUri}`,
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sealed/ui", "@sealed/types"],
  // This repo already has its own AI-agent instructions at .claude/CLAUDE.md
  // — don't let `next dev` inject a second, conflicting AGENTS.md/CLAUDE.md
  // at the app root.
  agentRules: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking protection — this app is never legitimately
          // embedded in a frame by another origin (the public proposal/
          // invoice-paid pages are visited directly via emailed links).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // The public proposal/invoice pages carry a bearer-style token
          // in the URL — a strict referrer policy stops that token from
          // leaking to third-party sites via the Referer header when a
          // client clicks an outbound link from those pages.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
