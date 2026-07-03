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

      // Map fields explicitly — spreading the DTO would silently make any
      // future DTO field (e.g. status) writable through this endpoint.
      const agreement = await tx.agreement.create({
        data: {
          proposalId: dto.proposalId,
          contactId: dto.contactId,
          title: dto.title,
          body: dto.body,
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
    // External call happens outside the transaction: Dropbox Sign latency
    // would otherwise hold a DB connection and can exceed the interactive
    // transaction timeout, aborting the commit after the signature request
    // was already created (orphaning it and duplicating on retry).
    const agreement = await this.prisma.agreement.findFirst({
      where: { id, tenantId },
      include: { contact: true },
    });

    if (!agreement) throw new NotFoundException("Agreement not found");

    if (!agreement.contact) {
      throw new NotFoundException("Contact not found");
    }

    assertTransition(
      AGREEMENT_TRANSITIONS,
      agreement.status,
      "SENT",
      "agreement",
    );

    // Capture the identity we send to Dropbox Sign — the transaction must
    // confirm it is still current before we persist signatureRequestId.
    const contactId = agreement.contactId;
    const signerEmail = agreement.contact.email;

    let signatureRequestId: string;
    try {
      const result = await this.dropboxSignService.createSignatureRequest(
        agreement.id,
        signerEmail,
        agreement.body,
      );
      signatureRequestId = result.signatureRequestId;
    } catch (error) {
      const body = (error as { body?: { error?: { errorMsg?: string } } })
        ?.body;
      const message =
        body?.error?.errorMsg ??
        (error instanceof Error ? error.message : "Signature request failed");
      throwIntegrationError("Dropbox Sign", message);
    }

    return this.prisma
      .$transaction(async (tx) => {
        const current = await tx.agreement.findFirst({
          where: { id, tenantId },
          include: { contact: true },
        });

        if (!current) throw new NotFoundException("Agreement not found");

        if (!current.contact) {
          throw new NotFoundException("Contact not found");
        }

        // Reject if the contact was reassigned or their email changed after we
        // already created the signature request — signerEmail must match what
        // Dropbox Sign received.
        assertPrecondition(
          current.contactId === contactId &&
            current.contact.email === signerEmail,
          {
            entityName: "contact",
            sourceId: contactId,
            currentStatus: "changed",
            requiredStatus: "unchanged",
          },
        );

        // Re-check inside the transaction to guard against concurrent sends.
        assertTransition(
          AGREEMENT_TRANSITIONS,
          current.status,
          "SENT",
          "agreement",
        );

        await tx.agreement.updateMany({
          where: { id, tenantId },
          data: {
            status: "SENT",
            signatureStatus: "SENT",
            sentAt: new Date(),
            signatureRequestId,
            signatureProvider: "dropbox_sign",
            signerEmail,
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
      })
      .catch(async (error: unknown) => {
        // Signature request was created before the tx — cancel so we do not
        // leave an orphaned request for an agreement that stayed DRAFT.
        try {
          await this.dropboxSignService.cancelSignatureRequest(
            signatureRequestId,
          );
        } catch {
          // Best-effort cleanup; surface the original failure.
        }
        throw error;
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
        // "manual" distinguishes a tenant-user override from a provider-
        // verified signature — the audit trail must not conflate them.
        metadata: { title: updated.title, method: "manual" },
      });

      return updated;
    });
  }
}
