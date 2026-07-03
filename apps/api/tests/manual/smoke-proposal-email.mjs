import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
config({ path: resolve(root, ".env") });

const recipientEmail = process.argv[2];
const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3001/api/v1";
const authToken = "demo";

if (!recipientEmail) {
  console.error(
    "Usage: node tests/manual/smoke-proposal-email.mjs <recipientEmail>",
  );
  console.error("");
  console.error("Prerequisites:");
  console.error("  - API running (pnpm dev)");
  console.error("  - RESEND_API_KEY set in .env");
  console.error("  - DEMO_MODE=true");
  process.exit(1);
}

async function api(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${authToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!response.ok) {
    console.error(`HTTP ${response.status} ${init.method ?? "GET"} ${path}`);
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }

  return body;
}

const contact = await api("/contacts", {
  method: "POST",
  body: JSON.stringify({
    name: "Email Smoke Test",
    email: recipientEmail,
    companyName: "Smoke Test Co",
  }),
});

const proposal = await api("/proposals", {
  method: "POST",
  body: JSON.stringify({
    contactId: contact.data.id,
    title: "Resend Smoke Test Proposal",
    description: "Automated smoke test for proposal email delivery",
    lineItems: [{ description: "Test service", quantity: 1, unitPrice: 100 }],
  }),
});

await api(`/proposals/${proposal.data.id}/send`, { method: "POST" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const publicUrl = `${appUrl}/p/${proposal.data.publicToken}`;

console.log("Proposal sent.");
console.log(`  Contact:  ${recipientEmail}`);
console.log(`  Proposal: ${proposal.data.id}`);
console.log(`  Public:   ${publicUrl}`);
console.log("");
console.log(
  "Check your inbox and API logs for [ResendService] Proposal email sent to...",
);
