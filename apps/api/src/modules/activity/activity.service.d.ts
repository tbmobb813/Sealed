import { PrismaService } from "../../prisma/prisma.service";
export declare class ActivityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string, objectType?: string, objectId?: string): import("@sealed/database").Prisma.PrismaPromise<({
        actor: {
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
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        metadata: import("@sealed/database/generated/client/runtime/library").JsonValue;
        actorId: string | null;
        actorType: string;
        objectType: string;
        objectId: string;
        eventType: string;
    })[]>;
}
//# sourceMappingURL=activity.service.d.ts.map