import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: resolve(root, ".env") });

const callbackUrl = process.argv[2];
if (!callbackUrl) {
  console.error(
    "Usage: node tests/manual/set-dropbox-callback.mjs <callbackUrl>",
  );
  process.exit(1);
}

const apiKey = process.env.DROPBOX_SIGN_API_KEY;
if (!apiKey) {
  console.error("DROPBOX_SIGN_API_KEY is not set in .env");
  process.exit(1);
}

const auth = Buffer.from(`${apiKey}:`).toString("base64");
const body = new URLSearchParams({ callback_url: callbackUrl });

const response = await fetch("https://api.hellosign.com/v3/account", {
  method: "POST",
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body,
});

const text = await response.text();
console.log(`HTTP ${response.status}`);
console.log(text);
