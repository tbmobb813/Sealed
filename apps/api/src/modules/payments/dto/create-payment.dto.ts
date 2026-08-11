import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from "class-validator";
import { PaymentProvider } from "@sealed/database";

export class CreatePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: "currency must be a 3-letter ISO 4217 code" })
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}
