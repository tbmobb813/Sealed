import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { ProposalsService } from "./proposals.service";
import { CreateProposalDto, UpdateProposalDto } from "./dto/create-proposal.dto";
import { ProposalQueryDto } from "./dto/proposal-query.dto";
export declare class ProposalsController {
    private readonly proposalsService;
    constructor(proposalsService: ProposalsService);
    list(user: AuthenticatedUser, query: ProposalQueryDto): Promise<{
        data: ({
            contact: {
                id: string;
                tenantId: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                companyName: string | null;
                metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.ProposalStatus;
            createdAt: Date;
            updatedAt: Date;
            contactId: string;
            publicToken: string;
            title: string;
            description: string | null;
            lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
            subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
            taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            currency: string;
            sentAt: Date | null;
            viewedAt: Date | null;
            respondedAt: Date | null;
            expiresAt: Date | null;
            viewerIpAddress: string | null;
            viewerUserAgent: string | null;
            createdByUserId: string;
        })[];
    }>;
    getPublic(token: string): Promise<{
        data: {
            title: string;
            description: string | null;
            status: import("@sealed/database").$Enums.ProposalStatus;
            lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
            subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
            taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            currency: string;
            contactName: string;
            tenantName: string;
            expiresAt: Date | null;
        };
    }>;
    getOne(user: AuthenticatedUser, id: string): Promise<{
        data: {
            contact: {
                id: string;
                tenantId: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                companyName: string | null;
                metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.ProposalStatus;
            createdAt: Date;
            updatedAt: Date;
            contactId: string;
            publicToken: string;
            title: string;
            description: string | null;
            lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
            subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
            taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            currency: string;
            sentAt: Date | null;
            viewedAt: Date | null;
            respondedAt: Date | null;
            expiresAt: Date | null;
            viewerIpAddress: string | null;
            viewerUserAgent: string | null;
            createdByUserId: string;
        };
    }>;
    create(user: AuthenticatedUser, dto: CreateProposalDto): Promise<{
        data: {
            contact: {
                id: string;
                tenantId: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                companyName: string | null;
                metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.ProposalStatus;
            createdAt: Date;
            updatedAt: Date;
            contactId: string;
            publicToken: string;
            title: string;
            description: string | null;
            lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
            subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
            taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            currency: string;
            sentAt: Date | null;
            viewedAt: Date | null;
            respondedAt: Date | null;
            expiresAt: Date | null;
            viewerIpAddress: string | null;
            viewerUserAgent: string | null;
            createdByUserId: string;
        };
    }>;
    update(user: AuthenticatedUser, id: string, dto: UpdateProposalDto): Promise<{
        data: {
            contact: {
                id: string;
                tenantId: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                companyName: string | null;
                metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.ProposalStatus;
            createdAt: Date;
            updatedAt: Date;
            contactId: string;
            publicToken: string;
            title: string;
            description: string | null;
            lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
            subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
            taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            currency: string;
            sentAt: Date | null;
            viewedAt: Date | null;
            respondedAt: Date | null;
            expiresAt: Date | null;
            viewerIpAddress: string | null;
            viewerUserAgent: string | null;
            createdByUserId: string;
        };
    }>;
    send(user: AuthenticatedUser, id: string): Promise<{
        data: {
            contact: {
                id: string;
                tenantId: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string | null;
                companyName: string | null;
                metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
            };
        } & {
            id: string;
            tenantId: string;
            status: import("@sealed/database").$Enums.ProposalStatus;
            createdAt: Date;
            updatedAt: Date;
            contactId: string;
            publicToken: string;
            title: string;
            description: string | null;
            lineItems: import("@sealed/database/generated/client/runtime/library").JsonValue;
            subtotal: import("@sealed/database/generated/client/runtime/library").Decimal;
            taxAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            totalAmount: import("@sealed/database/generated/client/runtime/library").Decimal;
            currency: string;
            sentAt: Date | null;
            viewedAt: Date | null;
            respondedAt: Date | null;
            expiresAt: Date | null;
            viewerIpAddress: string | null;
            viewerUserAgent: string | null;
            createdByUserId: string;
        };
    }>;
}
//# sourceMappingURL=proposals.controller.d.ts.map