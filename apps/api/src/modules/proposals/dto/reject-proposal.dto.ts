import { IsOptional, IsString, MaxLength } from "class-validator";

export class RejectProposalDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
