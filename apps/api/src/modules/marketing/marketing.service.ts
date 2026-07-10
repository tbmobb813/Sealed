import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string, source = "landing") {
    const normalized = email.trim().toLowerCase();

    await this.prisma.emailSubscriber.upsert({
      where: { email: normalized },
      update: {},
      create: { email: normalized, source },
    });

    this.logger.log(`Email capture: ${normalized.slice(0, 1)}***`);
    return { ok: true };
  }
}
