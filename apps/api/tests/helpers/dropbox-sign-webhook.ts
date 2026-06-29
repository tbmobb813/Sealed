import * as crypto from "crypto";

export function buildDropboxSignWebhookPayload(
  apiKey: string,
  signatureRequestId: string,
  eventType = "signature_request_signed",
) {
  const eventTime = Math.floor(Date.now() / 1000).toString();
  const eventHash = crypto
    .createHmac("sha256", apiKey)
    .update(`${eventTime}${eventType}`)
    .digest("hex");

  return {
    event: {
      event_time: eventTime,
      event_type: eventType,
      event_hash: eventHash,
      event_metadata: {
        related_signature_request_id: signatureRequestId,
      },
    },
  };
}
