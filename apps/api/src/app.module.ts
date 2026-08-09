import { join } from "node:path";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaService } from "./prisma/prisma.service";
import { ClerkAuthGuard } from "./common/guards/clerk-auth.guard";
import { TenantGuard } from "./common/guards/tenant.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { RequestLoggerMiddleware } from "./common/middleware/request-logger.middleware";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { ProposalsModule } from "./modules/proposals/proposals.module";
import { AgreementsModule } from "./modules/agreements/agreements.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ActivityModule } from "./modules/activity/activity.module";
import { MarketingModule } from "./modules/marketing/marketing.module";
import { CspReportModule } from "./modules/csp-report/csp-report.module";
import { StripeModule } from "./integrations/stripe/stripe.module";
import { DocuSealModule } from "./integrations/docuseal/docuseal.module";
import { ResendModule } from "./integrations/resend/resend.module";
import { ClerkModule } from "./integrations/clerk/clerk.module";
import { HealthModule } from "./health/health.module";
import { StatsModule } from "./stats/stats.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // First match wins: monorepo root, then cwd (apps/api when running locally), then package dir.
      envFilePath: [
        join(__dirname, "..", "..", "..", "..", ".env"),
        join(process.cwd(), ".env"),
        join(__dirname, "..", "..", ".env"),
      ],
    }),
    // Baseline abuse protection, mainly for the public proposal/webhook
    // endpoints. Generous enough that normal dashboard usage never trips it.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    TenantsModule,
    UsersModule,
    ContactsModule,
    ProposalsModule,
    AgreementsModule,
    InvoicesModule,
    PaymentsModule,
    ActivityModule,
    MarketingModule,
    CspReportModule,
    StripeModule,
    DocuSealModule,
    ResendModule,
    ClerkModule,
    HealthModule,
    StatsModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware, RequestLoggerMiddleware)
      .forRoutes({path: "*", method: RequestMethod.ALL});
  }
}
