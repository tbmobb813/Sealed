import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { DocuSealService } from "./docuseal.service";
import { DocuSealWebhookController } from "./docuseal.webhook.controller";
import { DocuSealWebhookService } from "./docuseal.webhook.service";

@Module({
  imports: [ConfigModule],
  controllers: [DocuSealWebhookController],
  providers: [DocuSealService, DocuSealWebhookService, PrismaService],
  exports: [DocuSealService],
})
export class DocuSealModule {}
