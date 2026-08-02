import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  AGREEMENT_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { DocuSealService } from "./docuseal.service";

type DocuSealWebhookPayload = {
  event_type?: string;
  data?: {
    // Submission webhooks carry the submission id as `id`; form webhooks
    // carry it as `submission_id`.
    id?: number | string;
    submission_id?: number | string;
  };
};

const WEBHOOK_ACK = "ok";

@Injectable()
export class DocuSealWebhookService {
  private readonly logger = new Logger(DocuSealWebhookService.name);

  constructor(
    private readonly docuSealService: DocuSealService,
    private readonly prisma: PrismaService,
  ) {}

  async handleWebhook(payload: unknown, secretHeader: string | undefined) {
    if (!this.docuSealService.verifyWebhookSecret(secretHeader)) {
      throw new BadRequestException("Invalid webhook secret");
    }

    const body = payload as DocuSealWebhookPayload;
    const eventType = body.event_type;

    // submission.completed fires when all signers are done;
    // form.completed/form.declined fire per submitter. Single-signer flow
    // means either can be the first signal — status confirmation below
    // makes acting on any of them safe.
    if (
      eventType !== "submission.completed" &&
      eventType !== "form.completed" &&
      eventType !== "form.declined"
    ) {
      return WEBHOOK_ACK;
    }

    const rawId = body.data?.submission_id ?? body.data?.id;
    if (rawId === undefined || rawId === null) {
      throw new BadRequestException("Missing submission ID");
    }
    const signatureRequestId = String(rawId);

    // The shared-secret header does not cover the payload body, so confirm
    // the real status with the DocuSeal API before mutating legal state.
    const status = await this.docuSealService.confirmSignatureRequestStatus(
      signatureRequestId,
    );
    const expected = eventType === "form.declined" ? "declined" : "signed";
    if (status !== expected) {
      throw new BadRequestException(
        "Webhook event does not match submission status",
      );
    }

    if (expected === "signed") {
      return this.handleSigned(signatureRequestId);
    }

    return this.handleDeclined(signatureRequestId);
  }

  private async handleSigned(signatureRequestId: string) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { signatureRequestId, signatureProvider: "docuseal" },
      });

      // Ack unknown IDs: a non-2xx makes DocuSeal retry, and a 404 is an
      // enumeration side-channel.
      if (!agreement) {
        this.logger.warn(
          `Signed event for unknown submission ${signatureRequestId}`,
        );
        return WEBHOOK_ACK;
      }

      // form.completed + submission.completed (plus retries) map here —
      // ack duplicates instead of throwing INVALID_STATE_TRANSITION.
      if (agreement.status === "SIGNED") {
        return WEBHOOK_ACK;
      }

      assertTransition(
        AGREEMENT_TRANSITIONS,
        agreement.status,
        "SIGNED",
        "agreement",
      );

      await tx.agreement.update({
        where: { id: agreement.id },
        data: {
          status: "SIGNED",
          signatureStatus: "SIGNED",
          signedAt: new Date(),
        },
      });

      await emitActivityEvent(tx, {
        tenantId: agreement.tenantId,
        actorId: agreement.createdByUserId,
        objectType: "agreement",
        objectId: agreement.id,
        eventType: "agreement.signed",
        metadata: { title: agreement.title, method: "docuseal" },
      });

      return WEBHOOK_ACK;
    });
  }

  private async handleDeclined(signatureRequestId: string) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { signatureRequestId, signatureProvider: "docuseal" },
      });

      if (!agreement) {
        this.logger.warn(
          `Declined event for unknown submission ${signatureRequestId}`,
        );
        return WEBHOOK_ACK;
      }

      if (agreement.status === "DECLINED") {
        return WEBHOOK_ACK;
      }

      assertTransition(
        AGREEMENT_TRANSITIONS,
        agreement.status,
        "DECLINED",
        "agreement",
      );

      await tx.agreement.update({
        where: { id: agreement.id },
        data: {
          status: "DECLINED",
          signatureStatus: "DECLINED",
          declinedAt: new Date(),
        },
      });

      await emitActivityEvent(tx, {
        tenantId: agreement.tenantId,
        actorId: agreement.createdByUserId,
        objectType: "agreement",
        objectId: agreement.id,
        eventType: "agreement.declined",
        metadata: { title: agreement.title },
      });

      return WEBHOOK_ACK;
    });
  }
}
