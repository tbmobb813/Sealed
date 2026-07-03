import { Controller, Get } from "@nestjs/common";
import { CurrentUser, AuthenticatedUser } from "../common/decorators/current-user.decorator";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  async getDashboardStats(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.statsService.getDashboardStats(user.tenantId);
    return { data };
  }
}