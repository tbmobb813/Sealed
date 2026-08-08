import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { AllExceptionsFilter } from "../../src/common/filters/all-exceptions.filter";
import { createResendMockProvider } from "./resend-mock";
import { createDropboxSignMockProvider } from "./dropbox-sign-mock";
import { createDocuSealMockProvider } from "./docuseal-mock";

export const AUTH_HEADER = { Authorization: "Bearer demo" };

export async function createTestApp(): Promise<INestApplication> {
  process.env.INTEGRATION_TEST = "true";
  // Force demo auth in tests (not ??=): a real .env DEMO_MODE=false must not win.
  process.env.DEMO_MODE = "true";
  // Force the test key (not ??=): the service is mocked and webhook HMACs
  // are built from this env var, so a real key from .env must never win.
  // Dropbox Sign has no separate webhook secret — verifyWebhook signs with
  // DROPBOX_SIGN_API_KEY itself.
  process.env.DROPBOX_SIGN_API_KEY = "test_dropbox_sign_key";
  // Same forcing rationale for DocuSeal — the service is mocked and the
  // webhook secret check reads this env var.
  process.env.DOCUSEAL_API_KEY = "test_docuseal_key";
  process.env.DOCUSEAL_WEBHOOK_SECRET = "test_docuseal_webhook_secret";
  // Use Stripe stub in tests — placeholder keys in .env would hit the real API and fail.
  delete process.env.STRIPE_SECRET_KEY;
  // Avoid live Resend calls in CI — assertions use resendMock instead.
  delete process.env.RESEND_API_KEY;

  const resendProvider = createResendMockProvider();
  const dropboxSignProvider = createDropboxSignMockProvider();
  const docuSealProvider = createDocuSealMockProvider();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(resendProvider.provide)
    .useValue(resendProvider.useValue)
    .overrideProvider(dropboxSignProvider.provide)
    .useValue(dropboxSignProvider.useValue)
    .overrideProvider(docuSealProvider.provide)
    .useValue(docuSealProvider.useValue)
    .compile();

  const app = moduleRef.createNestApplication({ rawBody: true });

  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "health", method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.init();
  return app;
}
