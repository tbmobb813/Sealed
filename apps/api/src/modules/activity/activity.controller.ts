import { Controller, Get, Param, Query } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { ActivityService } from "./activity.service";

@Controller("activity")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query("objectType") objectType?: string,
    @Query("objectId") objectId?: string,
  ) {
    const data = await this.activityService.findAll(
      user.tenantId,
      objectType,
      objectId,
    );
    return { data };
  }

  @Get("object/:objectType/:objectId")
  async forObject(
    @CurrentUser() user: AuthenticatedUser,
    @Param("objectType") objectType: string,
    @Param("objectId") objectId: string,
  ) {
    const data = await this.activityService.findAll(
      user.tenantId,
      objectType,
      objectId,
    );
    return { data };
  }
}
