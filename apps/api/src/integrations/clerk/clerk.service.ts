import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@sealed/database";
import { Webhook } from "svix";
import { claimWebhookEvent } from "../../common/helpers/claim-webhook-event";
import { UsersService } from "../../modules/users/users.service";
import { PrismaService } from "../../prisma/prisma.service";
import type { ClerkUserPayload, ClerkWebhookEvent } from "./clerk.types";

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  verifyWebhook(
    body: string,
    headers: {
      svixId: string;
      svixTimestamp: string;
      svixSignature: string;
    },
  ): ClerkWebhookEvent {
    const webhookSecret = this.config.get<string>("CLERK_WEBHOOK_SECRET");

    if (!webhookSecret) {
      throw new InternalServerErrorException("Webhook secret not configured");
    }

    const wh = new Webhook(webhookSecret);

    try {
      return wh.verify(body, {
        "svix-id": headers.svixId,
        "svix-timestamp": headers.svixTimestamp,
        "svix-signature": headers.svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      throw new BadRequestException("Invalid signature");
    }
  }

  async handleEvent(event: ClerkWebhookEvent, svixId: string) {
    return this.prisma.$transaction(async (tx) => {
      const isNew = await claimWebhookEvent(tx, {
        provider: "CLERK",
        externalEventId: svixId,
        eventType: event.type,
      });
      if (!isNew) {
        this.logger.log(
          `Clerk event ${svixId} already processed — skipping (inbox dedup)`,
        );
        return { received: true, type: event.type };
      }

      switch (event.type) {
        case "user.created":
          await this.handleUserUpsert(event.data, tx);
          break;
        case "user.updated":
          await this.handleUserUpsert(event.data, tx);
          break;
        case "user.deleted":
          await this.usersService.deactivateByClerkId(event.data.id, tx);
          break;
        default:
          break;
      }

      return { received: true, type: event.type };
    });
  }

  private async handleUserUpsert(
    data: ClerkUserPayload,
    tx: Prisma.TransactionClient,
  ) {
    const primaryEmailId = data.primary_email_address_id;
    const email =
      (primaryEmailId
        ? data.email_addresses?.find((e) => e.id === primaryEmailId)?.email_address
        : undefined) ?? data.email_addresses?.[0]?.email_address;

    if (!email) {
      throw new BadRequestException("Clerk user has no email address");
    }

    const name =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || email;

    await this.usersService.syncFromClerk(
      {
        clerkUserId: data.id,
        email,
        name,
      },
      tx,
    );
  }
}
