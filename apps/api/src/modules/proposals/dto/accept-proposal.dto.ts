import { IsOptional, IsString, MaxLength } from "class-validator";

export class AcceptProposalDto {
  /** Typed name of the person accepting — recorded in the activity trail. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  acceptedBy?: string;
}
