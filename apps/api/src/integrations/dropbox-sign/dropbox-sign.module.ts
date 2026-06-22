import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DropboxSignService } from "./dropbox-sign.service";
import { DropboxSignWebhookController } from "./dropbox-sign.webhook.controller";

@Module({
  imports: [ConfigModule],
  controllers: [DropboxSignWebhookController],
  providers: [DropboxSignService],
  exports: [DropboxSignService],
})
export class DropboxSignModule {}
