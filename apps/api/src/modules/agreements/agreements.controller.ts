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
import { AgreementsService } from "./agreements.service";
import { CreateAgreementDto, UpdateAgreementDto } from "./dto/create-agreement.dto";

@Controller("agreements")
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.agreementsService.findAll(user.tenantId);
    return { data };
  }

  @Get(":id")
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.agreementsService.findOne(user.tenantId, id);
    return { data };
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.COLLABORATOR)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAgreementDto,
  ) {
    const data = await this.agreementsService.create(
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
    @Body() dto: UpdateAgreementDto,
  ) {
    const data = await this.agreementsService.update(
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
  async sendForSignature(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.agreementsService.sendForSignature(
      user.tenantId,
      user.id,
      id,
    );
    return { data };
  }

  // Manually declares an agreement signed without a counterparty signature
  // (e.g. a wet-ink signature recorded outside the e-sign flow) — restricted
  // to roles trusted to attest that, since it bypasses the DocuSeal
  // verification path entirely.
  @Post(":id/sign")
  @HttpCode(200)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async sign(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.agreementsService.markAsSigned(
      user.tenantId,
      user.id,
      id,
    );
    return { data };
  }
}
