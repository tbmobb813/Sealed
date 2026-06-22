"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./prisma/prisma.service");
const clerk_auth_guard_1 = require("./common/guards/clerk-auth.guard");
const tenant_guard_1 = require("./common/guards/tenant.guard");
const state_transition_filter_1 = require("./common/filters/state-transition.filter");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const users_module_1 = require("./modules/users/users.module");
const contacts_module_1 = require("./modules/contacts/contacts.module");
const proposals_module_1 = require("./modules/proposals/proposals.module");
const agreements_module_1 = require("./modules/agreements/agreements.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const payments_module_1 = require("./modules/payments/payments.module");
const activity_module_1 = require("./modules/activity/activity.module");
const stripe_module_1 = require("./integrations/stripe/stripe.module");
const dropbox_sign_module_1 = require("./integrations/dropbox-sign/dropbox-sign.module");
const resend_module_1 = require("./integrations/resend/resend.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            contacts_module_1.ContactsModule,
            proposals_module_1.ProposalsModule,
            agreements_module_1.AgreementsModule,
            invoices_module_1.InvoicesModule,
            payments_module_1.PaymentsModule,
            activity_module_1.ActivityModule,
            stripe_module_1.StripeModule,
            dropbox_sign_module_1.DropboxSignModule,
            resend_module_1.ResendModule,
        ],
        providers: [
            prisma_service_1.PrismaService,
            {
                provide: core_1.APP_GUARD,
                useClass: clerk_auth_guard_1.ClerkAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_guard_1.TenantGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: state_transition_filter_1.StateTransitionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map