import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
}

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);
