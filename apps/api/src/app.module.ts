import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { PrismaService } from "./prisma/prisma.service";
import { ClerkAuthGuard } from "./common/guards/clerk-auth.guard";
import { TenantGuard } from "./common/guards/tenant.guard";
import { StateTransitionFilter } from "./common/filters/state-transition.filter";
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    {
      provide: APP_FILTER,
      useClass: StateTransitionFilter,
    },
  ],
})
export class AppModule {}
