import { ConfigService } from "@nestjs/config";
import { DocuSealService } from "./docuseal.service";

const SECRET = "test_shared_secret_abc123";

function configWith(values: Record<string, string | undefined>) {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

describe("DocuSealService.verifyWebhookSecret", () => {
  it("accepts the exact configured secret", () => {
    const service = new DocuSealService(
      configWith({ DOCUSEAL_WEBHOOK_SECRET: SECRET }),
    );
    expect(service.verifyWebhookSecret(SECRET)).toBe(true);
  });

  it("rejects a wrong secret of the same length", () => {
    const service = new DocuSealService(
      configWith({ DOCUSEAL_WEBHOOK_SECRET: SECRET }),
    );
    const wrongSameLength = "x".repeat(SECRET.length);
    expect(service.verifyWebhookSecret(wrongSameLength)).toBe(false);
  });

  it("rejects a header value of a different length without throwing", () => {
    const service = new DocuSealService(
      configWith({ DOCUSEAL_WEBHOOK_SECRET: SECRET }),
    );
    expect(() => service.verifyWebhookSecret("short")).not.toThrow();
    expect(service.verifyWebhookSecret("short")).toBe(false);
    expect(service.verifyWebhookSecret(SECRET + "extra")).toBe(false);
  });

  it("rejects a missing header", () => {
    const service = new DocuSealService(
      configWith({ DOCUSEAL_WEBHOOK_SECRET: SECRET }),
    );
    expect(service.verifyWebhookSecret(undefined)).toBe(false);
  });

  it("rejects an empty-string header", () => {
    const service = new DocuSealService(
      configWith({ DOCUSEAL_WEBHOOK_SECRET: SECRET }),
    );
    expect(service.verifyWebhookSecret("")).toBe(false);
  });

  it("rejects every request when no secret is configured", () => {
    const service = new DocuSealService(configWith({}));
    expect(service.verifyWebhookSecret(SECRET)).toBe(false);
    expect(service.verifyWebhookSecret("")).toBe(false);
  });
});
