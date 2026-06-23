import { join } from "node:path";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "./prisma/prisma.service";
import { ClerkAuthGuard } from "./common/guards/clerk-auth.guard";
import { TenantGuard } from "./common/guards/tenant.guard";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { ProposalsModule } from "./modules/proposals/proposals.module";
import { AgreementsModule } from "./modules/agreements/agreements.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ActivityModule } from "./modules/activity/activity.module";
import { StripeModule } from "./integrations/stripe/stripe.module";
import { DropboxSignModule } from "./integrations/dropbox-sign/dropbox-sign.module";
import { ResendModule } from "./integrations/resend/resend.module";
import { ClerkModule } from "./integrations/clerk/clerk.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, "..", "..", "..", "..", ".env"),
        join(process.cwd(), ".env"),
        join(__dirname, "..", "..", ".env"),
      ],
    }),
    TenantsModule,
    UsersModule,
    ContactsModule,
    ProposalsModule,
    AgreementsModule,
    InvoicesModule,
    PaymentsModule,
    ActivityModule,
    StripeModule,
    DropboxSignModule,
    ResendModule,
    ClerkModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
