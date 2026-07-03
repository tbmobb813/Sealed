import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
import { ProposalsService } from "./proposals.service";
import { CreateProposalDto, UpdateProposalDto } from "./dto/create-proposal.dto";
import { ProposalQueryDto } from "./dto/proposal-query.dto";
import { RejectProposalDto } from "./dto/reject-proposal.dto";
import { AcceptProposalDto } from "./dto/accept-proposal.dto";

@Controller("proposals")
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ProposalQueryDto,
  ) {
    const data = await this.proposalsService.findAll(user.tenantId, query);
    return { data };
  }

  // Static routes before :id — GET public/:token also advances SENT → VIEWED.
  @Public()
  @Get("public/:token")
  async getPublic(@Param("token") token: string) {
    const data = await this.proposalsService.findByPublicToken(token);
    return { data };
  }

  @Public()
  @Post("public/:token/accept")
  @HttpCode(200)
  async acceptPublic(
    @Param("token") token: string,
    @Body() dto: AcceptProposalDto,
  ) {
    const data = await this.proposalsService.acceptByPublicToken(
      token,
      dto.acceptedBy?.trim() || undefined,
    );
    return { data };
  }

  @Public()
  @Post("public/:token/reject")
  @HttpCode(200)
  async rejectPublic(
    @Param("token") token: string,
    @Body() dto: RejectProposalDto,
  ) {
    const data = await this.proposalsService.rejectByPublicToken(
      token,
      dto.reason?.trim() || undefined,
    );
    return { data };
  }

  @Get(":id")
  async getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.proposalsService.findOne(user.tenantId, id);
    return { data };
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProposalDto,
  ) {
    const data = await this.proposalsService.create(
      user.tenantId,
      user.id,
      dto,
    );
    return { data };
  }

  @Patch(":id")
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateProposalDto,
  ) {
    const data = await this.proposalsService.update(
      user.tenantId,
      user.id,
      id,
      dto,
    );
    return { data };
  }

  @Post(":id/send")
  @HttpCode(200)
  async send(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    const data = await this.proposalsService.send(user.tenantId, user.id, id);
    return { data };
  }

}
