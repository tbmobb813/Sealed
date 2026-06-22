import { Controller, Get } from "@nestjs/common";
import { CurrentTenant } from "../../common/decorators/current-tenant.decorator";
import type { TenantInfo } from "../../common/decorators/current-tenant.decorator";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get("current")
  getCurrent(@CurrentTenant() tenant: TenantInfo) {
    return { data: tenant };
  }
}
