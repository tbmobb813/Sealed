import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProposalDto, UpdateProposalDto } from "./dto/create-proposal.dto";
import { ProposalQueryDto } from "./dto/proposal-query.dto";
export declare class ProposalsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildLineItems;
    private calcTotals;
    findAll(tenantId: string, query: ProposalQueryDto): Prisma.PrismaPromise<({
        contact: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: Prisma.JsonValue;
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
        lineItems: Prisma.JsonValue;
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        currency: string;
        sentAt: Date | null;
        viewedAt: Date | null;
        respondedAt: Date | null;
        expiresAt: Date | null;
        viewerIpAddress: string | null;
        viewerUserAgent: string | null;
        createdByUserId: string;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        contact: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: Prisma.JsonValue;
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
        lineItems: Prisma.JsonValue;
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        currency: string;
        sentAt: Date | null;
        viewedAt: Date | null;
        respondedAt: Date | null;
        expiresAt: Date | null;
        viewerIpAddress: string | null;
        viewerUserAgent: string | null;
        createdByUserId: string;
    }>;
    findByPublicToken(token: string): Promise<{
        title: string;
        description: string | null;
        status: import("@sealed/database").$Enums.ProposalStatus;
        lineItems: Prisma.JsonValue;
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        currency: string;
        contactName: string;
        tenantName: string;
        expiresAt: Date | null;
    }>;
    create(tenantId: string, userId: string, dto: CreateProposalDto): Promise<{
        contact: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: Prisma.JsonValue;
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
        lineItems: Prisma.JsonValue;
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        currency: string;
        sentAt: Date | null;
        viewedAt: Date | null;
        respondedAt: Date | null;
        expiresAt: Date | null;
        viewerIpAddress: string | null;
        viewerUserAgent: string | null;
        createdByUserId: string;
    }>;
    update(tenantId: string, userId: string, id: string, dto: UpdateProposalDto): Promise<{
        contact: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: Prisma.JsonValue;
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
        lineItems: Prisma.JsonValue;
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        currency: string;
        sentAt: Date | null;
        viewedAt: Date | null;
        respondedAt: Date | null;
        expiresAt: Date | null;
        viewerIpAddress: string | null;
        viewerUserAgent: string | null;
        createdByUserId: string;
    }>;
    send(tenantId: string, userId: string, id: string): Promise<{
        contact: {
            id: string;
            tenantId: string;
            email: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            companyName: string | null;
            metadata: Prisma.JsonValue;
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
        lineItems: Prisma.JsonValue;
        subtotal: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        currency: string;
        sentAt: Date | null;
        viewedAt: Date | null;
        respondedAt: Date | null;
        expiresAt: Date | null;
        viewerIpAddress: string | null;
        viewerUserAgent: string | null;
        createdByUserId: string;
    }>;
}
//# sourceMappingURL=proposals.service.d.ts.map