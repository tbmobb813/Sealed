import { chromium } from "playwright";

const shotDir = "/home/jsnni/.claude/jobs/69f17cd6/tmp/shots";
await import("node:fs/promises").then((fs) => fs.mkdir(shotDir, { recursive: true }));

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

async function shot(name) {
  await page.screenshot({ path: `${shotDir}/${name}.png`, fullPage: true });
  console.log(`screenshot: ${name}.png`);
}

// 1. Dashboard loads in demo mode, no login needed
await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
await shot("01-dashboard");
console.log("URL after dashboard nav:", page.url());

// 2. Go to proposals list, open the seeded proposal
await page.goto("http://localhost:3000/dashboard/proposals", { waitUntil: "networkidle" });
await shot("02-proposals-list");

await page.click("text=Website Redesign Proposal");
await page.waitForLoadState("networkidle");
await shot("03-proposal-detail");
console.log("Proposal detail URL:", page.url());

// 3. Send it (DRAFT -> SENT), which should surface a public link
const sendButton = page.locator('button:has-text("Send")');
if (await sendButton.count() > 0) {
  await sendButton.first().click();
  await page.waitForTimeout(1500);
  await shot("04-after-send");
} else {
  console.log("No Send button found on this view");
}

console.log("CONSOLE_ERRORS:", JSON.stringify(consoleErrors));
await browser.close();
