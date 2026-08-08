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
// Shipped as Content-Security-Policy-Report-Only rather than enforcing:
// this sandbox runs in demo mode, which never initializes Clerk's JS SDK
// (see shouldUseClerk()/canInitializeClerk() in lib/demo.ts), so the
// Clerk-specific directives below are transcribed from their docs, not
// verified against a real Clerk session here. Report-only means it can't
// break login even if a directive is off — check the browser console (or
// wire up a report-to endpoint) after deploying with real Clerk keys, then
// promote to Content-Security-Policy once confirmed violation-free.
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
            key: "Content-Security-Policy-Report-Only",
            value: buildContentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
