import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { DropboxSignService } from "./dropbox-sign.service";
import { DropboxSignWebhookController } from "./dropbox-sign.webhook.controller";
import { DropboxSignWebhookService } from "./dropbox-sign.webhook.service";

@Module({
  imports: [ConfigModule],
  controllers: [DropboxSignWebhookController],
  providers: [DropboxSignService, DropboxSignWebhookService, PrismaService],
  exports: [DropboxSignService],
})
export class DropboxSignModule {}
