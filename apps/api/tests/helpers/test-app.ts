import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { AllExceptionsFilter } from "../../src/common/filters/all-exceptions.filter";
import { createResendMockProvider } from "./resend-mock";
import { createDocuSealMockProvider } from "./docuseal-mock";

export const AUTH_HEADER = { Authorization: "Bearer demo" };

export async function createTestApp(): Promise<INestApplication> {
  process.env.INTEGRATION_TEST = "true";
  // Force demo auth in tests (not ??=): a real .env DEMO_MODE=false must not win.
  process.env.DEMO_MODE = "true";
  // Force the test key (not ??=): the service is mocked and the webhook
  // secret check reads this env var, so a real key from .env must never win.
  process.env.DOCUSEAL_API_KEY = "test_docuseal_key";
  process.env.DOCUSEAL_WEBHOOK_SECRET = "test_docuseal_webhook_secret";
  // Use Stripe stub in tests — placeholder keys in .env would hit the real API and fail.
  delete process.env.STRIPE_SECRET_KEY;
  // Avoid live Resend calls in CI — assertions use resendMock instead.
  delete process.env.RESEND_API_KEY;

  const resendProvider = createResendMockProvider();
  const docuSealProvider = createDocuSealMockProvider();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(resendProvider.provide)
    .useValue(resendProvider.useValue)
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
