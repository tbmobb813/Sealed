import { ConfigService } from "@nestjs/config";
import { DropboxSignService } from "../../src/integrations/dropbox-sign/dropbox-sign.service";

let counter = 0;

/**
 * A real DropboxSignService (so verifyWebhook's HMAC + freshness logic is
 * genuinely exercised) with the network-calling methods stubbed out — tests
 * must never hit the live Dropbox Sign API.
 */
export function createDropboxSignMockProvider() {
  const service = new DropboxSignService(new ConfigService());

  jest
    .spyOn(service, "createSignatureRequest")
    .mockImplementation(async () => ({
      signatureRequestId: `sig_test_${Date.now()}_${++counter}`,
    }));

  // The webhook handler confirms real status before mutating state; tests
  // only exercise the signed path.
  jest
    .spyOn(service, "confirmSignatureRequestStatus")
    .mockResolvedValue("signed");

  return {
    provide: DropboxSignService,
    useValue: service,
  };
}
