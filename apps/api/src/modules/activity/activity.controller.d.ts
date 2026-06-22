import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { ActivityService } from "./activity.service";
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    list(user: AuthenticatedUser, objectType?: string, objectId?: string): Promise<{
        data: ({
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
        })[];
    }>;
    forObject(user: AuthenticatedUser, objectType: string, objectId: string): Promise<{
        data: ({
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
        })[];
    }>;
}
//# sourceMappingURL=activity.controller.d.ts.map