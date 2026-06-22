"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const backend_1 = require("@clerk/backend");
const public_decorator_1 = require("../decorators/public.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let ClerkAuthGuard = class ClerkAuthGuard {
    reflector;
    config;
    prisma;
    constructor(reflector, config, prisma) {
        this.reflector = reflector;
        this.config = config;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw new common_1.UnauthorizedException("Missing authorization token");
        }
        const token = authHeader.slice(7);
        const secretKey = this.config.get("CLERK_SECRET_KEY");
        if (!secretKey) {
            throw new common_1.UnauthorizedException("Clerk is not configured");
        }
        try {
            const payload = await (0, backend_1.verifyToken)(token, { secretKey });
            const clerkUserId = payload.sub;
            const user = await this.prisma.user.findFirst({
                where: { clerkUserId },
                include: { tenant: true },
            });
            if (!user) {
                throw new common_1.UnauthorizedException("User not found");
            }
            request.user = {
                id: user.id,
                clerkUserId: user.clerkUserId,
                email: user.email,
                name: user.name,
                tenantId: user.tenantId,
                role: user.role,
            };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
};
exports.ClerkAuthGuard = ClerkAuthGuard;
exports.ClerkAuthGuard = ClerkAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], ClerkAuthGuard);
//# sourceMappingURL=clerk-auth.guard.js.map