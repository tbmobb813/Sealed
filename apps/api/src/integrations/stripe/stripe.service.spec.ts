import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { StripeService } from "./stripe.service";

const API_KEY = "sk_test_dummy_key_for_hmac_only";
const WEBHOOK_SECRET = "whsec_test_secret_abc123";

function configWith(values: Record<string, string | undefined>) {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

function payloadFor(type: string): Buffer {
  return Buffer.from(
    JSON.stringify({
      id: "evt_test_1",
      type,
      data: { object: { id: "cs_test_1" } },
    }),
  );
}

function signatureFor(payload: Buffer, secret = WEBHOOK_SECRET): string {
  return Stripe.webhooks.generateTestHeaderString({
    payload: payload.toString(),
    secret,
  });
}

describe("StripeService.constructEvent", () => {
  it("accepts a correctly signed payload", () => {
    const service = new StripeService(
      configWith({
        STRIPE_SECRET_KEY: API_KEY,
        STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
      }),
    );
    const payload = payloadFor("checkout.session.completed");

    const event = service.constructEvent(payload, signatureFor(payload));
    expect(event.type).toBe("checkout.session.completed");
  });

  it("rejects a payload that was tampered with after signing", () => {
    const service = new StripeService(
      configWith({
        STRIPE_SECRET_KEY: API_KEY,
        STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
      }),
    );
    const originalPayload = payloadFor("checkout.session.completed");
    const signature = signatureFor(originalPayload);
    const tamperedPayload = payloadFor("checkout.session.async_payment_failed");

    expect(() =>
      service.constructEvent(tamperedPayload, signature),
    ).toThrow();
  });

  it("rejects a signature produced with the wrong webhook secret", () => {
    const service = new StripeService(
      configWith({
        STRIPE_SECRET_KEY: API_KEY,
        STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
      }),
    );
    const payload = payloadFor("checkout.session.completed");
    const wrongSignature = signatureFor(payload, "whsec_attacker_controlled");

    expect(() => service.constructEvent(payload, wrongSignature)).toThrow();
  });

  it("rejects a missing or malformed signature header", () => {
    const service = new StripeService(
      configWith({
        STRIPE_SECRET_KEY: API_KEY,
        STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
      }),
    );
    const payload = payloadFor("checkout.session.completed");

    expect(() => service.constructEvent(payload, "")).toThrow();
    expect(() => service.constructEvent(payload, "not-a-valid-signature")).toThrow();
  });

  it("throws when Stripe is not configured (no secret key)", () => {
    const service = new StripeService(configWith({}));
    const payload = payloadFor("checkout.session.completed");

    expect(() => service.constructEvent(payload, signatureFor(payload))).toThrow(
      "Stripe is not configured",
    );
  });

  it("throws when the webhook secret is not configured", () => {
    const service = new StripeService(
      configWith({ STRIPE_SECRET_KEY: API_KEY }),
    );
    const payload = payloadFor("checkout.session.completed");

    expect(() => service.constructEvent(payload, signatureFor(payload))).toThrow(
      "Stripe webhook secret is not configured",
    );
  });
});
