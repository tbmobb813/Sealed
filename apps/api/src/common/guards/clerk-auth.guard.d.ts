import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
export declare class ClerkAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly config;
    private readonly prisma;
    constructor(reflector: Reflector, config: ConfigService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=clerk-auth.guard.d.ts.map