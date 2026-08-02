import { Module } from "@nestjs/common";
import { SignatureModule } from "../../integrations/signature/signature.module";
import { AgreementsController } from "./agreements.controller";
import { AgreementsService } from "./agreements.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [SignatureModule],
  controllers: [AgreementsController],
  providers: [AgreementsService, PrismaService],
  exports: [AgreementsService],
})
export class AgreementsModule {}
