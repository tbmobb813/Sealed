import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  PROPOSAL_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { assertMutable } from "../../common/constants/mutability";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { ResendService } from "../../integrations/resend/resend.service";
import { CreateProposalDto, UpdateProposalDto } from "./dto/create-proposal.dto";
import { ProposalQueryDto } from "./dto/proposal-query.dto";
import type { ProposalLineItemDto } from "./dto/create-proposal.dto";

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resend: ResendService,
  ) {}

  private buildLineItems(items: ProposalLineItemDto[]) {
    return items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: new Prisma.Decimal(item.quantity)
        .mul(new Prisma.Decimal(item.unitPrice))
        .toNumber(),
    }));
  }

  private calcTotals(lineItems: ProposalLineItemDto[], taxAmount: Prisma.Decimal) {
    const subtotal = lineItems.reduce(
      (sum, item) =>
        sum.add(
          new Prisma.Decimal(item.quantity).mul(new Prisma.Decimal(item.unitPrice))
        ),
      new Prisma.Decimal(0),
    );
    const total = subtotal.add(taxAmount);
    return { subtotal, taxAmount, totalAmount: total };
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

  /**
   * Transitions a SENT/VIEWED proposal to EXPIRED when past its expiry.
   * Returns true if the proposal was expired (caller must not proceed).
   */
  private async expireIfPastDue(
    tx: Prisma.TransactionClient,
    proposal: { id: string; tenantId: string; createdByUserId: string; status: string; title: string; expiresAt: Date | null },
  ): Promise<boolean> {
    const expirable = proposal.status === "SENT" || proposal.status === "VIEWED";
    if (!expirable || !proposal.expiresAt || proposal.expiresAt > new Date()) {
      return false;
    }

    assertTransition(PROPOSAL_TRANSITIONS, proposal.status, "EXPIRED", "proposal");

    await tx.proposal.update({
      where: { id: proposal.id },
      data: { status: "EXPIRED" },
    });

    await emitActivityEvent(tx, {
      tenantId: proposal.tenantId,
      actorId: proposal.createdByUserId,
      objectType: "proposal",
      objectId: proposal.id,
      eventType: "proposal.expired",
      metadata: { title: proposal.title },
    });

    return true;
  }

  async findByPublicToken(token: string) {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findUnique({
        where: { publicToken: token },
        include: {
          contact: true,
          tenant: true,
        },
      });

      if (!proposal) {
        throw new NotFoundException("Proposal not found");
      }

      let current = proposal;

      if (await this.expireIfPastDue(tx, current)) {
        const refreshed = await tx.proposal.findUnique({
          where: { id: current.id },
          include: { contact: true, tenant: true },
        });
        if (!refreshed) {
          throw new NotFoundException("Proposal not found");
        }
        current = refreshed;
      } else if (current.status === "SENT") {
        assertTransition(
          PROPOSAL_TRANSITIONS,
          current.status,
          "VIEWED",
          "proposal",
        );

        await tx.proposal.update({
          where: { id: current.id },
          data: {
            status: "VIEWED",
            viewedAt: new Date(),
          },
        });

        await emitActivityEvent(tx, {
          tenantId: current.tenantId,
          actorId: current.createdByUserId,
          objectType: "proposal",
          objectId: current.id,
          eventType: "proposal.viewed",
          metadata: { title: current.title },
        });

        const refreshed = await tx.proposal.findUnique({
          where: { id: current.id },
          include: { contact: true, tenant: true },
        });

        if (!refreshed) {
          throw new NotFoundException("Proposal not found");
        }

        current = refreshed;
      }

      return {
        title: current.title,
        description: current.description,
        status: current.status,
        lineItems: current.lineItems,
        subtotal: current.subtotal,
        taxAmount: current.taxAmount,
        totalAmount: current.totalAmount,
        currency: current.currency,
        contactName: current.contact.name,
        tenantName: current.tenant.name,
        expiresAt: current.expiresAt,
      };
    });
  }

  async acceptByPublicToken(token: string) {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findUnique({
        where: { publicToken: token },
        include: { contact: true },
      });

      if (!proposal) {
        throw new NotFoundException("Proposal not found");
      }

      // An expired proposal must not be acceptable, no matter how the
      // client reached the accept button.
      if (await this.expireIfPastDue(tx, proposal)) {
        assertTransition(PROPOSAL_TRANSITIONS, "EXPIRED", "ACCEPTED", "proposal");
      }

      assertTransition(
        PROPOSAL_TRANSITIONS,
        proposal.status,
        "ACCEPTED",
        "proposal",
      );

      await tx.proposal.update({
        where: { id: proposal.id },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      });

      await emitActivityEvent(tx, {
        tenantId: proposal.tenantId,
        actorId: proposal.createdByUserId,
        objectType: "proposal",
        objectId: proposal.id,
        eventType: "proposal.accepted",
        metadata: { title: proposal.title },
      });

      const updated = await tx.proposal.findUnique({
        where: { id: proposal.id },
        include: { contact: true },
      });

      if (!updated) {
        throw new NotFoundException("Proposal not found");
      }

      return updated;
    });
  }

  create(tenantId: string, userId: string, dto: CreateProposalDto) {
    const lineItems = this.buildLineItems(dto.lineItems);
    const taxAmount = new Prisma.Decimal(dto.taxAmount ?? 0);
    const { subtotal, totalAmount } = this.calcTotals(dto.lineItems, taxAmount);

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
      let taxAmount =
        dto.taxAmount !== undefined
          ? new Prisma.Decimal(dto.taxAmount)
          : existing.taxAmount;
      let totalAmount = existing.totalAmount;
      let lineItems = existing.lineItems;

      if (dto.lineItems) {
        const totals = this.calcTotals(dto.lineItems, taxAmount);
        subtotal = totals.subtotal;
        taxAmount = totals.taxAmount;
        totalAmount = totals.totalAmount;
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
    const { updated, tenantName } = await this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findFirst({
        where: { id, tenantId },
        include: { contact: true },
      });

      if (!proposal) {
        throw new NotFoundException("Proposal not found");
      }

      const tenant = await tx.tenant.findUnique({
        where: { id: proposal.tenantId },
        select: { name: true },
      });

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

      return { updated, tenantName: tenant?.name };
    });

    // Email only after the transaction commits — otherwise a rollback would
    // leave the client holding a link to a proposal that was never sent.
    void this.resend.sendProposalLink({
      toEmail: updated.contact.email,
      toName: updated.contact.name,
      proposalTitle: updated.title,
      tenantName: tenantName ?? "Your service provider",
      publicToken: updated.publicToken,
    });

    return updated;
  }
}
