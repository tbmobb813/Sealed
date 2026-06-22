import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    list(user: AuthenticatedUser): Promise<{
        data: ({
            invoice: {
                number: string;
                id: string;
                tenantId: string;
                status: import("@sealed/database").$Enums.InvoiceStatus;
                createdAt: Date;
                updatedAt: Date;
                contactId: string;
                publicToken: string;
                lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
                subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
                taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
                totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
                currency: string;
                sentAt: Date | null;
                createdByUserId: string;
                agreementId: string;
                amountPaid: import("@sealed/database/generated/client/runtime/library").Decimal;
                issueDate: Date;
                dueDate: Date | null;
                stripePaymentLinkUrl: string | null;
                stripePaymentLinkId: string | null;
                paidAt: Date | null;
                voidedAt: Date | null;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.PaymentStatus;
            createdAt: Date;
            currency: string;
            invoiceId: string;
            provider: import("@sealed/database").$Enums.PaymentProvider;
            providerPaymentId: string | null;
            amount: import("@sealed/database/generated/client/runtime/library").Decimal;
            succeededAt: Date | null;
            failedAt: Date | null;
            refundedAt: Date | null;
            failureReason: string | null;
        })[];
    }>;
    getOne(user: AuthenticatedUser, id: string): Promise<{
        data: {
            invoice: {
                number: string;
                id: string;
                tenantId: string;
                status: import("@sealed/database").$Enums.InvoiceStatus;
                createdAt: Date;
                updatedAt: Date;
                contactId: string;
                publicToken: string;
                lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
                subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
                taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
                totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
                currency: string;
                sentAt: Date | null;
                createdByUserId: string;
                agreementId: string;
                amountPaid: import("@sealed/database/generated/client/runtime/library").Decimal;
                issueDate: Date;
                dueDate: Date | null;
                stripePaymentLinkUrl: string | null;
                stripePaymentLinkId: string | null;
                paidAt: Date | null;
                voidedAt: Date | null;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.PaymentStatus;
            createdAt: Date;
            currency: string;
            invoiceId: string;
            provider: import("@sealed/database").$Enums.PaymentProvider;
            providerPaymentId: string | null;
            amount: import("@sealed/database/generated/client/runtime/library").Decimal;
            succeededAt: Date | null;
            failedAt: Date | null;
            refundedAt: Date | null;
            failureReason: string | null;
        };
    }>;
    create(user: AuthenticatedUser, dto: CreatePaymentDto): Promise<{
        data: {
            invoice: {
                number: string;
                id: string;
                tenantId: string;
                status: import("@sealed/database").$Enums.InvoiceStatus;
                createdAt: Date;
                updatedAt: Date;
                contactId: string;
                publicToken: string;
                lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
                subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
                taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
                totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
                currency: string;
                sentAt: Date | null;
                createdByUserId: string;
                agreementId: string;
                amountPaid: import("@sealed/database/generated/client/runtime/library").Decimal;
                issueDate: Date;
                dueDate: Date | null;
                stripePaymentLinkUrl: string | null;
                stripePaymentLinkId: string | null;
                paidAt: Date | null;
                voidedAt: Date | null;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.PaymentStatus;
            createdAt: Date;
            currency: string;
            invoiceId: string;
            provider: import("@sealed/database").$Enums.PaymentProvider;
            providerPaymentId: string | null;
            amount: import("@sealed/database/generated/client/runtime/library").Decimal;
            succeededAt: Date | null;
            failedAt: Date | null;
            refundedAt: Date | null;
            failureReason: string | null;
        };
    }>;
}
//# sourceMappingURL=payments.controller.d.ts.map