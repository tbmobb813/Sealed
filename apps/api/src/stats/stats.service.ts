import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface DashboardStats {
  openProposals: number;
  pendingAgreements: number;
  outstandingInvoices: number;
  activeProposals: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    const [
      openProposals,
      pendingAgreements,
      outstandingInvoices,
      activeProposals,
    ] = await Promise.all([
      this.prisma.proposal.count({
        where: { tenantId, status: "DRAFT" },
      }),
      this.prisma.agreement.count({
        where: { tenantId, status: { in: ["DRAFT", "SENT"] } },
      }),
      this.prisma.invoice.count({
        where: {
          tenantId,
          status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
        },
      }),
      this.prisma.proposal.count({
        where: {
          tenantId,
          status: { in: ["SENT", "VIEWED", "ACCEPTED"] },
        },
      }),
    ]);

    return {
      openProposals,
      pendingAgreements,
      outstandingInvoices,
      activeProposals,
    };
  }
}