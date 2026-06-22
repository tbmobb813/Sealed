import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.usersService.findById(user.tenantId, user.id);
    return { data };
  }

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.usersService.findByTenant(user.tenantId);
    return { data };
  }
}
