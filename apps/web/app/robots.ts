import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing"],
      // Dashboard requires auth anyway; the public proposal/invoice pages
      // carry a bearer-style token in the URL and shouldn't be indexed
      // (same rationale as the strict Referrer-Policy in next.config.mjs).
      disallow: ["/dashboard", "/contacts", "/proposals", "/agreements", "/invoices", "/settings", "/p/", "/invoices/paid"],
    },
    sitemap: "https://sealed.techtrendwire.com/sitemap.xml",
  };
}
