import { ConfigService } from "@nestjs/config";
import { DocuSealService } from "../../src/integrations/docuseal/docuseal.service";

let counter = 0;

/**
 * A real DocuSealService (so verifyWebhookSecret's timing-safe comparison
 * is genuinely exercised) with the network-calling methods stubbed out —
 * tests must never hit the live DocuSeal API.
 */
export function createDocuSealMockProvider() {
  const service = new DocuSealService(new ConfigService());

  jest
    .spyOn(service, "createSignatureRequest")
    .mockImplementation(async () => ({
      signatureRequestId: `${Date.now()}${++counter}`,
    }));

  // The webhook handler confirms real status before mutating state; the
  // stub mirrors the service's own stub-mode convention (id containing
  // "declined" → declined).
  jest
    .spyOn(service, "confirmSignatureRequestStatus")
    .mockImplementation(async (id: string) =>
      id.includes("declined") ? "declined" : "signed",
    );

  jest.spyOn(service, "cancelSignatureRequest").mockResolvedValue(undefined);

  return {
    provide: DocuSealService,
    useValue: service,
  };
}
