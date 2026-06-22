import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, objectType?: string, objectId?: string) {
    return this.prisma.activityEvent.findMany({
      where: {
        tenantId,
        ...(objectType ? { objectType } : {}),
        ...(objectId ? { objectId } : {}),
      },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
