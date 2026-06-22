import { Module } from "@nestjs/common";
import { AgreementsController } from "./agreements.controller";
import { AgreementsService } from "./agreements.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [AgreementsController],
  providers: [AgreementsService, PrismaService],
  exports: [AgreementsService],
})
export class AgreementsModule {}
