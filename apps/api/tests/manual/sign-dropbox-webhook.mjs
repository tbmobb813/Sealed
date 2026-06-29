import { config } from "dotenv";
import * as crypto from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: resolve(root, ".env") });

const signatureRequestId = process.argv[2];
if (!signatureRequestId) {
  console.error(
    "Usage: node tests/manual/sign-dropbox-webhook.mjs <signatureRequestId>",
  );
  process.exit(1);
}

const apiKey = process.env.DROPBOX_SIGN_API_KEY;
if (!apiKey) {
  console.error("DROPBOX_SIGN_API_KEY is not set in .env");
  process.exit(1);
}

const eventType = "signature_request_signed";
const eventTime = Math.floor(Date.now() / 1000).toString();
const eventHash = crypto
  .createHmac("sha256", apiKey)
  .update(`${eventTime}${eventType}`)
  .digest("hex");

console.log(
  JSON.stringify(
    {
      event: {
        event_time: eventTime,
        event_type: eventType,
        event_hash: eventHash,
        event_metadata: {
          related_signature_request_id: signatureRequestId,
        },
      },
    },
    null,
    2,
  ),
);
