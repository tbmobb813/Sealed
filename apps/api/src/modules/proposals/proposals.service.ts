import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  PROPOSAL_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { assertMutable } from "../../common/constants/mutability";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { CreateProposalDto, UpdateProposalDto } from "./dto/create-proposal.dto";
import { ProposalQueryDto } from "./dto/proposal-query.dto";
import type { ProposalLineItemDto } from "./dto/create-proposal.dto";

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildLineItems(items: ProposalLineItemDto[]) {
    return items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));
  }

  private calcTotals(lineItems: ProposalLineItemDto[], taxAmount = 0) {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    return { subtotal, taxAmount, totalAmount: subtotal + taxAmount };
  }

  findAll(tenantId: string, query: ProposalQueryDto) {
    return this.prisma.proposal.findMany({
      where: {
        tenantId,
        ...(query.status ? { status: query.status } : {}),
      },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const proposal = await this.prisma.proposal.findFirst({
      where: { id, tenantId },
      include: { contact: true },
    });

    if (!proposal) {
      throw new NotFoundException("Proposal not found");
    }

    return proposal;
  }

  async findByPublicToken(token: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { publicToken: token },
      include: {
        contact: true,
        tenant: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException("Proposal not found");
    }

    return {
      title: proposal.title,
      description: proposal.description,
      status: proposal.status,
      lineItems: proposal.lineItems,
      subtotal: proposal.subtotal,
      taxAmount: proposal.taxAmount,
      totalAmount: proposal.totalAmount,
      currency: proposal.currency,
      contactName: proposal.contact.name,
      tenantName: proposal.tenant.name,
      expiresAt: proposal.expiresAt,
    };
  }

  create(tenantId: string, userId: string, dto: CreateProposalDto) {
    const lineItems = this.buildLineItems(dto.lineItems);
    const { subtotal, taxAmount, totalAmount } = this.calcTotals(
      dto.lineItems,
      dto.taxAmount ?? 0,
    );

    return this.prisma.$transaction(async (tx) => {
      const contact = await tx.contact.findFirst({
        where: { id: dto.contactId, tenantId },
      });

      if (!contact) {
        throw new NotFoundException("Contact not found");
      }

      const proposal = await tx.proposal.create({
        data: {
          tenantId,
          contactId: dto.contactId,
          title: dto.title,
          description: dto.description,
          lineItems,
          subtotal,
          taxAmount,
          totalAmount,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
          createdByUserId: userId,
        },
        include: { contact: true },
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "proposal",
        objectId: proposal.id,
        eventType: "proposal.created",
        metadata: {
          title: proposal.title,
          totalAmount: proposal.totalAmount.toString(),
        },
      });

      return proposal;
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpdateProposalDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.proposal.findFirst({
        where: { id, tenantId },
        include: { contact: true },
      });

      if (!existing) {
        throw new NotFoundException("Proposal not found");
      }

      // 🔒 IMMUTABILITY GUARD
      // Only DRAFT proposals can be edited. Once sent, the proposal is locked.
      assertMutable("proposal", existing.status);

      let subtotal = existing.subtotal;
      let taxAmount = dto.taxAmount ?? existing.taxAmount;
      let totalAmount = existing.totalAmount;
      let lineItems = existing.lineItems;

      if (dto.lineItems) {
        const totals = this.calcTotals(dto.lineItems, Number(taxAmount));
        subtotal = new Prisma.Decimal(totals.subtotal);
        taxAmount = new Prisma.Decimal(totals.taxAmount);
        totalAmount = new Prisma.Decimal(totals.totalAmount);
        lineItems = this.buildLineItems(dto.lineItems);
      }

      await tx.proposal.updateMany({
        where: { id, tenantId },
        data: {
          title: dto.title,
          description: dto.description,
          lineItems: lineItems as Prisma.InputJsonValue,
          subtotal,
          taxAmount,
          totalAmount,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        },
      });

      const proposal = await tx.proposal.findFirst({
        where: { id, tenantId },
        include: { contact: true },
      });

      if (!proposal) {
        throw new NotFoundException("Proposal not found");
      }

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "proposal",
        objectId: id,
        eventType: "proposal.updated",
        metadata: {
          title: proposal.title,
          totalAmount: proposal.totalAmount.toString(),
        },
      });

      return proposal;
    });
  }

  async send(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findFirst({
        where: { id, tenantId },
        include: { contact: true },
      });

      if (!proposal) {
        throw new NotFoundException("Proposal not found");
      }

      assertTransition(
        PROPOSAL_TRANSITIONS,
        proposal.status,
        "SENT",
        "proposal",
      );

      await tx.proposal.updateMany({
        where: { id, tenantId },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      const updated = await tx.proposal.findFirst({
        where: { id, tenantId },
        include: { contact: true },
      });

      if (!updated) {
        throw new NotFoundException("Proposal not found");
      }

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "proposal",
        objectId: id,
        eventType: "proposal.sent",
        metadata: {
          title: updated.title,
          totalAmount: updated.totalAmount.toString(),
        },
      });

      return updated;
    });
  }
}
