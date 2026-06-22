import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { verifyToken } from "@clerk/backend";
import {
  DEMO_CLERK_USER_ID,
  DEMO_MODE_TOKEN,
  isDemoModeEnabled,
} from "../constants/demo";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing authorization token");
    }

    const token = authHeader.slice(7);

    if (isDemoModeEnabled(this.config.get<string>("DEMO_MODE"))) {
      if (token !== DEMO_MODE_TOKEN) {
        throw new UnauthorizedException("Invalid demo token");
      }

      return this.attachDemoUser(request);
    }

    const secretKey = this.config.get<string>("CLERK_SECRET_KEY");

    if (!secretKey) {
      throw new UnauthorizedException("Clerk is not configured");
    }

    let clerkUserId: string;
    try {
      const payload = await verifyToken(token, { secretKey });
      clerkUserId = payload.sub;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }

    const user = await this.prisma.user.findFirst({
      where: { clerkUserId },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
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

  private async attachDemoUser(request: {
    user?: {
      id: string;
      clerkUserId: string;
      email: string;
      name: string;
      tenantId: string;
      role: string;
    };
  }): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { clerkUserId: DEMO_CLERK_USER_ID },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Demo user not found — run pnpm db:seed",
      );
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
}
