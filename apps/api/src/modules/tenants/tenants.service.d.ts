import { PrismaService } from "../../prisma/prisma.service";
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): import("@sealed/database").Prisma.Prisma__TenantClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        brandColor: string | null;
        logoUrl: string | null;
        defaultCurrency: string;
        timezone: string;
        stripeAccountId: string | null;
        signatureProvider: string | null;
    } | null, null, import("@sealed/database/generated/client/runtime/library").DefaultArgs, import("@sealed/database").Prisma.PrismaClientOptions>;
    findBySlug(slug: string): import("@sealed/database").Prisma.Prisma__TenantClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        brandColor: string | null;
        logoUrl: string | null;
        defaultCurrency: string;
        timezone: string;
        stripeAccountId: string | null;
        signatureProvider: string | null;
    } | null, null, import("@sealed/database/generated/client/runtime/library").DefaultArgs, import("@sealed/database").Prisma.PrismaClientOptions>;
}
//# sourceMappingURL=tenants.service.d.ts.map