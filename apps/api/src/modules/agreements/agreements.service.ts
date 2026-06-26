import { assertMutable } from "../../common/constants/mutability";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  AGREEMENT_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { assertPrecondition } from "../../common/helpers/assert-precondition";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { throwIntegrationError } from "../../common/helpers/throw-integration-error";
import { DropboxSignService } from "../../integrations/dropbox-sign/dropbox-sign.service";
import { CreateAgreementDto, UpdateAgreementDto } from "./dto/create-agreement.dto";

@Injectable()
export class AgreementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dropboxSignService: DropboxSignService,
  ) {}

  findAll(tenantId: string) {
    return this.prisma.agreement.findMany({
      where: { tenantId },
      include: { proposal: true, contact: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tenantId: string, id: string) {
    const agreement = await this.prisma.agreement.findFirst({
      where: { id, tenantId },
      include: { proposal: true, contact: true },
    });

    if (!agreement) {
      throw new NotFoundException("Agreement not found");
    }

    return agreement;
  }

  create(tenantId: string, userId: string, dto: CreateAgreementDto) {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findFirst({
        where: { id: dto.proposalId, tenantId },
      });

      if (!proposal) {
        throw new NotFoundException("Proposal not found");
      }

      assertPrecondition(proposal.status === "ACCEPTED", {
        entityName: "proposal",
        sourceId: proposal.id,
        currentStatus: proposal.status,
        requiredStatus: "ACCEPTED",
      });

      const contact = await tx.contact.findFirst({
        where: { id: dto.contactId, tenantId },
      });

      if (!contact) {
        throw new NotFoundException("Contact not found");
      }

      const agreement = await tx.agreement.create({
        data: {
          ...dto,
          tenantId,
          createdByUserId: userId,
        },
      });

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "agreement",
        objectId: agreement.id,
        eventType: "agreement.created",
        metadata: { title: agreement.title },
      });

      return agreement;
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpdateAgreementDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.agreement.findFirst({
        where: { id, tenantId },
      });

      if (!existing) {
        throw new NotFoundException("Agreement not found");
      }

      // 🔒 IMMUTABILITY GUARD
      // Agreements freeze the moment they are sent for signature.
      // A signed agreement is a legal artifact and must never change.

      assertMutable("agreement", existing.status);

      await tx.agreement.updateMany({
        where: { id, tenantId },
        data: dto,
      });

      const agreement = await tx.agreement.findFirst({
        where: { id, tenantId },
        include: { proposal: true, contact: true },
      });

      if (!agreement) {
        throw new NotFoundException("Agreement not found");
      }

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "agreement",
        objectId: id,
        eventType: "agreement.updated",
        metadata: { title: agreement.title },
      });

      return agreement;
    });
  }

  async sendForSignature(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { id, tenantId },
        include: { proposal: true, contact: true },
      });
      
      if (!agreement) throw new NotFoundException("Agreement not found");
      
      assertTransition(
        AGREEMENT_TRANSITIONS,
        agreement.status,
        "SENT",
        "agreement",
      );

      let signatureRequestId: string;
      try {
        const result = await this.dropboxSignService.createSignatureRequest(
          agreement.id,
          agreement.contact.email,
        );
        signatureRequestId = result.signatureRequestId;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Signature request failed";
        throwIntegrationError("Dropbox Sign", message);
      }

      await tx.agreement.updateMany({
        where: { id, tenantId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          signatureRequestId,
          signatureProvider: "dropbox_sign",
          signerEmail: agreement.contact.email,
        },
      });

      const updated = await tx.agreement.findFirst({
        where: { id, tenantId },
        include: { proposal: true, contact: true },
      });

      if (!updated) {
        throw new NotFoundException("Agreement not found");
      }

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "agreement",
        objectId: id,
        eventType: "agreement.sent",
        metadata: { title: updated.title },
      });

      return updated;
    });
  }

  async markAsSigned(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { id, tenantId },
        include: { proposal: true, contact: true },
      });

      if (!agreement) throw new NotFoundException("Agreement not found");

      assertTransition(
        AGREEMENT_TRANSITIONS,
        agreement.status,
        "SIGNED",
        "agreement",
      );

      await tx.agreement.updateMany({
        where: { id, tenantId },
        data: {
          status: "SIGNED",
          signedAt: new Date(),
        },
      });

      const updated = await tx.agreement.findFirst({
        where: { id, tenantId },
        include: { proposal: true, contact: true },
      });

      if (!updated) throw new NotFoundException("Agreement not found");

      await emitActivityEvent(tx, {
        tenantId,
        actorId: userId,
        objectType: "agreement",
        objectId: id,
        eventType: "agreement.signed",
        metadata: { title: updated.title },
      });

      return updated;
    });
  }
}
