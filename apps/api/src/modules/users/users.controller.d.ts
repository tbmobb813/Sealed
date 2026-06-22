import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: AuthenticatedUser): Promise<{
        data: {
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
        };
    }>;
    list(user: AuthenticatedUser): Promise<{
        data: {
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
        }[];
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map