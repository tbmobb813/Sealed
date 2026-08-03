import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserRole } from "@sealed/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.paymentsService.findAll(user.tenantId);
    return { data };
  }

  @Get(":id")
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.paymentsService.findOne(user.tenantId, id);
    return { data };
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto,
  ) {
    const data = await this.paymentsService.create(
      user.tenantId,
      user.id,
      dto,
    );
    return { data };
  }
}
