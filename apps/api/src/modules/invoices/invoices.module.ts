import { Module } from "@nestjs/common";
import { ResendModule } from "../../integrations/resend/resend.module";
import { StripeModule } from "../../integrations/stripe/stripe.module";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [ResendModule, StripeModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, PrismaService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
