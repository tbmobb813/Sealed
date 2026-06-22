import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Webhook } from "svix";
import { UsersService } from "../../modules/users/users.service";
import type { ClerkUserPayload, ClerkWebhookEvent } from "./clerk.types";

@Injectable()
export class ClerkService {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
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

  async handleEvent(event: ClerkWebhookEvent) {
    if (event.type === "user.created") {
      await this.handleUserCreated(event.data);
    }

    return { received: true, type: event.type };
  }

  private async handleUserCreated(data: ClerkUserPayload) {
    const email = data.email_addresses?.[0]?.email_address;

    if (!email) {
      throw new BadRequestException("Clerk user has no email address");
    }

    const name =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || email;

    await this.usersService.provisionFromClerk({
      clerkUserId: data.id,
      email,
      name,
    });
  }
}
