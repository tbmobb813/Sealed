import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
    event_metadata?: {
      related_signature_request_id?: string;
    };
  };
};

const WEBHOOK_ACK = "Hello API Event Received";

@Injectable()
export class DropboxSignWebhookService {
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

    if (eventType !== "signature_request_signed") {
      return WEBHOOK_ACK;
    }

    const signatureRequestId =
      body.event?.event_metadata?.related_signature_request_id;

    if (!signatureRequestId) {
      throw new BadRequestException("Missing signature request ID");
    }

    return this.prisma.$transaction(async (tx) => {
      const agreement = await tx.agreement.findFirst({
        where: { signatureRequestId },
      });

      if (!agreement) {
        throw new NotFoundException("Agreement not found");
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
        metadata: { title: agreement.title },
      });

      return WEBHOOK_ACK;
    });
  }
}
