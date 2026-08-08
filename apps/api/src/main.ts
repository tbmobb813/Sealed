import { NestFactory } from "@nestjs/core";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  // rawBody: true registers express.json with a verify callback that sets
  // req.rawBody on every JSON request — required for webhook HMAC verification.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.use(helmet());
  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
    // Fail loudly rather than silently booting with a localhost-only
    // default — a misconfigured prod deploy should refuse to start, not
    // come up quietly unreachable from the real frontend.
    throw new Error(
      "CORS_ORIGIN must be set in production — refusing to start with a localhost-only default",
    );
  }
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  app.enableCors({
    // Webhook probes (DocuSeal, Stripe, etc.) omit Origin — allow through.
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, origin === corsOrigin);
    },
    credentials: true,
  });

  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  const port = process.env.API_PORT ?? process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
