import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "../../modules/users/users.module";
import { PrismaService } from "../../prisma/prisma.service";
import { ClerkService } from "./clerk.service";
import { ClerkWebhookController } from "./clerk.webhook.controller";

@Module({
  imports: [ConfigModule, UsersModule],
  controllers: [ClerkWebhookController],
  providers: [ClerkService, PrismaService],
})
export class ClerkModule {}
