import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../../modules/users/users.module";
import { ClerkService } from "./clerk.service";
import { ClerkWebhookController } from "./clerk.webhook.controller";

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [ClerkWebhookController],
  providers: [ClerkService],
})
export class ClerkModule {}
