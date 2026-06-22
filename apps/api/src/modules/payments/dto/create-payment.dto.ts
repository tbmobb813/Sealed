import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PaymentProvider } from "@sealed/database";

export class CreatePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}
