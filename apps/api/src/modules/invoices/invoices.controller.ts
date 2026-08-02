import {
  Body,
  Controller,
  HttpCode,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { UserRole } from "@sealed/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto, UpdateInvoiceDto } from "./dto/create-invoice.dto";

@Controller("invoices")
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.invoicesService.findAll(user.tenantId);
    return { data };
  }

  @Get(":id")
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.invoicesService.findOne(user.tenantId, id);
    return { data };
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COLLABORATOR)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvoiceDto,
  ) {
    const data = await this.invoicesService.create(
      user.tenantId,
      user.id,
      dto,
    );
    return { data };
  }

  @Patch(":id")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COLLABORATOR)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    const data = await this.invoicesService.update(
      user.tenantId,
      user.id,
      id,
      dto,
    );
    return { data };
  }

  @Post(":id/send")
  @HttpCode(200)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COLLABORATOR)
  async send(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.invoicesService.send(user.tenantId, user.id, id);
    return { data };
  }
}
