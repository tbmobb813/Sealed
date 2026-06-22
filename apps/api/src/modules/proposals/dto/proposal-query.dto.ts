import { IsEnum, IsOptional } from "class-validator";
import { ProposalStatus } from "@sealed/database";

export class ProposalQueryDto {
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;
}
