import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { AllExceptionsFilter } from "../../src/common/filters/all-exceptions.filter";
import { createResendMockProvider } from "./resend-mock";

export const AUTH_HEADER = { Authorization: "Bearer demo" };

export async function createTestApp(): Promise<INestApplication> {
  process.env.INTEGRATION_TEST = "true";
  process.env.DEMO_MODE ??= "true";
  process.env.DROPBOX_SIGN_API_KEY ??= "test_dropbox_sign_key";
  process.env.DROPBOX_SIGN_WEBHOOK_SECRET ??= "test_dropbox_sign_webhook_secret";
  // Use Stripe stub in tests — placeholder keys in .env would hit the real API and fail.
  delete process.env.STRIPE_SECRET_KEY;
  // Avoid live Resend calls in CI — assertions use resendMock instead.
  delete process.env.RESEND_API_KEY;

  const { provide, useValue } = createResendMockProvider();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(provide)
    .useValue(useValue)
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
