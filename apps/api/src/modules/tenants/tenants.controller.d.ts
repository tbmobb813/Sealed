import type { TenantInfo } from "../../common/decorators/current-tenant.decorator";
import { TenantsService } from "./tenants.service";
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getCurrent(tenant: TenantInfo): {
        data: TenantInfo;
    };
}
//# sourceMappingURL=tenants.controller.d.ts.map