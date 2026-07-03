import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { StripeService } from "./stripe.service";
import { StripeWebhookController } from "./stripe.webhook.controller";
import { StripeWebhookService } from "./stripe.webhook.service";

@Module({
  imports: [ConfigModule],
  controllers: [StripeWebhookController],
  providers: [StripeService, StripeWebhookService, PrismaService],
  exports: [StripeService],
})
export class StripeModule {}
