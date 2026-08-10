import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAgreementDto {
  @IsString()
  proposalId!: string;

  @IsString()
  contactId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(50000)
  body!: string;
}

export class UpdateAgreementDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  body?: string;
}
