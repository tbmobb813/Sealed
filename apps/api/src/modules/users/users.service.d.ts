import { PrismaService } from "../../prisma/prisma.service";
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        clerkUserId: string;
        email: string;
        name: string;
        role: import("@sealed/database").$Enums.UserRole;
        status: import("@sealed/database").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByTenant(tenantId: string): import("@sealed/database").Prisma.PrismaPromise<{
        id: string;
        tenantId: string;
        clerkUserId: string;
        email: string;
        name: string;
        role: import("@sealed/database").$Enums.UserRole;
        status: import("@sealed/database").$Enums.UserStatus;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
//# sourceMappingURL=users.service.d.ts.map