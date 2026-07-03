import { Module } from "@nestjs/common";
import { ResendModule } from "../../integrations/resend/resend.module";
import { ProposalsController } from "./proposals.controller";
import { ProposalsService } from "./proposals.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  imports: [ResendModule],
  controllers: [ProposalsController],
  providers: [ProposalsService, PrismaService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
