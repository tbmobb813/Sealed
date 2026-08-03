import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserRole } from "@sealed/database";

export interface AuthenticatedUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  tenantId: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
