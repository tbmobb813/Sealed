import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  assertTransition,
  AGREEMENT_TRANSITIONS,
} from "../../common/constants/state-transitions";
import { emitActivityEvent } from "../../common/helpers/emit-activity-event";
import { DropboxSignService } from "./dropbox-sign.service";

type DropboxSignWebhookPayload = {
  event?: {
    event_type?: string;
  };
  signature_request?: {
    signature_request_id?: string;
  };
};

const WEBHOOK_ACK = "Hello API Event Received";

@Injectable()
export class DropboxSignWebhookService {
  private readonly logger = new Logger(DropboxSignWebhookService.name);

  constructor(
    private readonly dropboxSignService: DropboxSignService,
    private readonly prisma: PrismaService,
  ) {}

  async handleWebhook(payload: unknown, _rawJson: string) {
    const valid = this.dropboxSignService.verifyWebhook(
      payload as DropboxSignWebhookPayload,
    );
    if (!valid) {
      throw new BadRequestException("Invalid webhook signature");
    }

    const body = payload as DropboxSignWebhookPayload;
    const eventType = body.event?.event_type;

    // signature_request_signed can arrive before the API reflects
    // isComplete (single-signer race) and gets rejected by the status
    // confirmation below; signature_request_all_signed fires exactly when
    // isComplete flips, so treat both as the "signed" trigger.
    if (
      eventType !== "signature_request_signed" &&
      eventType !== "signature_request_all_signed" &&
      eventType !== "signature_request_declined"
    ) {
      return WEBHOOK_ACK;
    }

    const signatureRequestId =
      body.signature_request?.signature_request_id;

    if (!signatureRequestId) {
      throw new BadRequestException("Missing signature request ID");
    }

    // The webhook HMAC does not cover signature_request_id, so confirm the
    // real status with the Dropbox Sign API before mutating legal state.
    const status = await this.dropboxSignService.confirmSignatureRequestStatus(
      signatureRequestId,
    );
    const expected =
      eventType === "signature_request_declined" ? "declined" : "signed";
    if (status !== expected) {
      throw new BadRequestException(
        "Webhook event does not match signature request status",
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
        where: { signatureRequestId },
      });

      // Ack unknown IDs: a non-2xx makes Dropbox Sign retry and eventually
      // disable the callback URL, and a 404 is an enumeration side-channel.
      if (!agreement) {
        this.logger.warn(
          `Signed event for unknown signature request ${signatureRequestId}`,
        );
        return WEBHOOK_ACK;
      }

      // Both signed and all_signed events (plus retries) map here — ack
      // duplicates instead of throwing INVALID_STATE_TRANSITION.
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
        metadata: { title: agreement.title, method: "dropbox_sign" },
      });

      return WEBHOOK_ACK;
    });
  }

  private async handleDeclined(signatureRequestId: string) {
    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { signatureRequestId },
      });

      if (!agreement) {
        this.logger.warn(
          `Declined event for unknown signature request ${signatureRequestId}`,
        );
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
