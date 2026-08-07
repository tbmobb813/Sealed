import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { DropboxSignService } from "./dropbox-sign.service";

const API_KEY = "test_api_key_abc123";

function configWith(values: Record<string, string | undefined>) {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

function sign(eventTime: string, eventType: string, apiKey = API_KEY): string {
  return crypto
    .createHmac("sha256", apiKey)
    .update(`${eventTime}${eventType}`)
    .digest("hex");
}

function freshTime(): string {
  return String(Math.floor(Date.now() / 1000));
}

describe("DropboxSignService.verifyWebhook", () => {
  it("accepts a correctly signed, fresh event", () => {
    const service = new DropboxSignService(
      configWith({ DROPBOX_SIGN_API_KEY: API_KEY }),
    );
    const eventTime = freshTime();
    const eventType = "signature_request_all_signed";

    expect(
      service.verifyWebhook({
        event: {
          event_time: eventTime,
          event_type: eventType,
          event_hash: sign(eventTime, eventType),
        },
      }),
    ).toBe(true);
  });

  it("rejects a payload whose event_type was tampered after signing", () => {
    const service = new DropboxSignService(
      configWith({ DROPBOX_SIGN_API_KEY: API_KEY }),
    );
    const eventTime = freshTime();
    // Hash was computed over the original type, not the one in the payload.
    const hashForOriginal = sign(eventTime, "signature_request_declined");

    expect(
      service.verifyWebhook({
        event: {
          event_time: eventTime,
          event_type: "signature_request_all_signed",
          event_hash: hashForOriginal,
        },
      }),
    ).toBe(false);
  });

  it("rejects a hash signed with the wrong key", () => {
    const service = new DropboxSignService(
      configWith({ DROPBOX_SIGN_API_KEY: API_KEY }),
    );
    const eventTime = freshTime();
    const eventType = "signature_request_all_signed";

    expect(
      service.verifyWebhook({
        event: {
          event_time: eventTime,
          event_type: eventType,
          event_hash: sign(eventTime, eventType, "attacker_controlled_key"),
        },
      }),
    ).toBe(false);
  });

  it("rejects a stale event beyond the replay window", () => {
    const service = new DropboxSignService(
      configWith({ DROPBOX_SIGN_API_KEY: API_KEY }),
    );
    // 10 minutes old — replay window is 300s.
    const eventTime = String(Math.floor(Date.now() / 1000) - 600);
    const eventType = "signature_request_all_signed";

    expect(
      service.verifyWebhook({
        event: {
          event_time: eventTime,
          event_type: eventType,
          event_hash: sign(eventTime, eventType),
        },
      }),
    ).toBe(false);
  });

  it("rejects when event_time, event_type, or event_hash is missing", () => {
    const service = new DropboxSignService(
      configWith({ DROPBOX_SIGN_API_KEY: API_KEY }),
    );
    const eventTime = freshTime();
    const eventType = "signature_request_all_signed";
    const eventHash = sign(eventTime, eventType);

    expect(
      service.verifyWebhook({ event: { event_type: eventType, event_hash: eventHash } }),
    ).toBe(false);
    expect(
      service.verifyWebhook({ event: { event_time: eventTime, event_hash: eventHash } }),
    ).toBe(false);
    expect(
      service.verifyWebhook({ event: { event_time: eventTime, event_type: eventType } }),
    ).toBe(false);
    expect(service.verifyWebhook({})).toBe(false);
  });

  it("rejects a malformed (non-hex) event_hash without throwing", () => {
    const service = new DropboxSignService(
      configWith({ DROPBOX_SIGN_API_KEY: API_KEY }),
    );
    const eventTime = freshTime();
    const eventType = "signature_request_all_signed";

    expect(() =>
      service.verifyWebhook({
        event: {
          event_time: eventTime,
          event_type: eventType,
          event_hash: "not-a-hex-string",
        },
      }),
    ).not.toThrow();
    expect(
      service.verifyWebhook({
        event: {
          event_time: eventTime,
          event_type: eventType,
          event_hash: "not-a-hex-string",
        },
      }),
    ).toBe(false);
  });

  it("rejects every event when the API key is not configured", () => {
    const service = new DropboxSignService(configWith({}));
    const eventTime = freshTime();
    const eventType = "signature_request_all_signed";

    expect(
      service.verifyWebhook({
        event: {
          event_time: eventTime,
          event_type: eventType,
          event_hash: sign(eventTime, eventType),
        },
      }),
    ).toBe(false);
  });
});
