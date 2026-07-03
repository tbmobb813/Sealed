import { Module } from "@nestjs/common";
import { DropboxSignModule } from "../../integrations/dropbox-sign/dropbox-sign.module";
import { AgreementsController } from "./agreements.controller";
import { AgreementsService } from "./agreements.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [DropboxSignModule],
  controllers: [AgreementsController],
  providers: [AgreementsService, PrismaService],
  exports: [AgreementsService],
})
export class AgreementsModule {}
