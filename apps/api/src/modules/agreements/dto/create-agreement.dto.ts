import { IsOptional, IsString } from "class-validator";

export class CreateAgreementDto {
  @IsString()
  proposalId!: string;

  @IsString()
  contactId!: string;

  @IsString()
  title!: string;

  @IsString()
  body!: string;
}

export class UpdateAgreementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;
}
