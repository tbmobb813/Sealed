import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@sealed/database";
import { Webhook } from "svix";
import { UsersService } from "../../modules/users/users.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ClerkService } from "./clerk.service";
import type { ClerkWebhookEvent } from "./clerk.types";

jest.mock("svix", () => ({ Webhook: jest.fn() }));

const MockedWebhook = Webhook as jest.MockedClass<typeof Webhook>;

const HEADERS = {
  svixId: "msg_1",
  svixTimestamp: "1700000000",
  svixSignature: "v1,fake",
};

function userCreatedEvent(overrides: Partial<ClerkWebhookEvent["data"]> = {}): ClerkWebhookEvent {
  return {
    type: "user.created",
    data: {
      id: "clerk_user_1",
      primary_email_address_id: "email_1",
      email_addresses: [{ id: "email_1", email_address: "jane@example.com" }],
      first_name: "Jane",
      last_name: "Doe",
      ...overrides,
    },
  };
}

describe("ClerkService", () => {
  let config: { get: jest.Mock };
  let usersService: { syncFromClerk: jest.Mock; deactivateByClerkId: jest.Mock };
  let inboxEvents: Array<{ provider: string; externalEventId: string }>;
  let tx: { webhookInboxEvent: { create: jest.Mock } };
  let prisma: { $transaction: jest.Mock };
  let service: ClerkService;
  let verify: jest.Mock;

  beforeEach(() => {
    config = {
      get: jest.fn((key: string) =>
        key === "CLERK_WEBHOOK_SECRET" ? "whsec_test" : undefined,
      ),
    };
    usersService = {
      syncFromClerk: jest.fn().mockResolvedValue(undefined),
      deactivateByClerkId: jest.fn().mockResolvedValue(undefined),
    };
    inboxEvents = [];
    tx = {
      webhookInboxEvent: {
        create: jest.fn(({ data }) => {
          const conflict = inboxEvents.some(
            (e) =>
              e.provider === data.provider &&
              e.externalEventId === data.externalEventId,
          );
          if (conflict) {
            throw new Prisma.PrismaClientKnownRequestError(
              "Unique constraint failed",
              { code: "P2002", clientVersion: "5.0.0" },
            );
          }
          inboxEvents.push({
            provider: data.provider,
            externalEventId: data.externalEventId,
          });
          return Promise.resolve({ id: `inbox-${inboxEvents.length}` });
        }),
      },
    };
    prisma = {
      $transaction: jest.fn((callback: (tx: unknown) => Promise<unknown>) =>
        callback(tx),
      ),
    };
    verify = jest.fn();
    MockedWebhook.mockImplementation(
      () => ({ verify }) as unknown as Webhook,
    );

    service = new ClerkService(
      config as unknown as ConfigService,
      usersService as unknown as UsersService,
      prisma as unknown as PrismaService,
    );
  });

  describe("verifyWebhook", () => {
    it("throws if CLERK_WEBHOOK_SECRET is not configured", () => {
      config.get.mockReturnValue(undefined);

      expect(() => service.verifyWebhook("{}", HEADERS)).toThrow(
        InternalServerErrorException,
      );
    });

    it("throws BadRequestException when svix signature verification fails", () => {
      verify.mockImplementation(() => {
        throw new Error("invalid signature");
      });

      expect(() => service.verifyWebhook("{}", HEADERS)).toThrow(
        BadRequestException,
      );
    });

    it("returns the verified event on a valid signature", () => {
      const event = userCreatedEvent();
      verify.mockReturnValue(event);

      expect(service.verifyWebhook(JSON.stringify(event), HEADERS)).toEqual(event);
    });
  });

  describe("handleEvent", () => {
    it("syncs the user on user.created, preferring the primary email address", async () => {
      await service.handleEvent(
        userCreatedEvent({
          primary_email_address_id: "email_2",
          email_addresses: [
            { id: "email_1", email_address: "old@example.com" },
            { id: "email_2", email_address: "primary@example.com" },
          ],
        }),
        "msg_1",
      );

      expect(usersService.syncFromClerk).toHaveBeenCalledWith(
        {
          clerkUserId: "clerk_user_1",
          email: "primary@example.com",
          name: "Jane Doe",
        },
        tx,
      );
    });

    it("falls back to the first email address when primary_email_address_id doesn't match any entry", async () => {
      await service.handleEvent(
        userCreatedEvent({
          primary_email_address_id: "missing",
          email_addresses: [{ id: "email_1", email_address: "fallback@example.com" }],
        }),
        "msg_2",
      );

      expect(usersService.syncFromClerk).toHaveBeenCalledWith(
        expect.objectContaining({ email: "fallback@example.com" }),
        tx,
      );
    });

    it("throws BadRequestException when the Clerk user has no email address", async () => {
      await expect(
        service.handleEvent(userCreatedEvent({ email_addresses: [] }), "msg_3"),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(usersService.syncFromClerk).not.toHaveBeenCalled();
    });

    it("syncs the user on user.updated the same way as user.created", async () => {
      const event = userCreatedEvent();
      event.type = "user.updated";

      await service.handleEvent(event, "msg_4");

      expect(usersService.syncFromClerk).toHaveBeenCalledTimes(1);
    });

    it("deactivates the user on user.deleted", async () => {
      await service.handleEvent(
        { type: "user.deleted", data: { id: "clerk_user_1" } },
        "msg_5",
      );

      expect(usersService.deactivateByClerkId).toHaveBeenCalledWith(
        "clerk_user_1",
        tx,
      );
    });

    it("acks unhandled event types without touching UsersService", async () => {
      const result = await service.handleEvent(
        { type: "session.created", data: { id: "clerk_user_1" } },
        "msg_6",
      );

      expect(result).toEqual({ received: true, type: "session.created" });
      expect(usersService.syncFromClerk).not.toHaveBeenCalled();
      expect(usersService.deactivateByClerkId).not.toHaveBeenCalled();
    });

    it("is idempotent on duplicate user.created delivery (same svix-id) — the inbox claim short-circuits the retry", async () => {
      const event = userCreatedEvent();

      await service.handleEvent(event, "msg_dup_created");
      await service.handleEvent(event, "msg_dup_created");

      expect(usersService.syncFromClerk).toHaveBeenCalledTimes(1);
      expect(usersService.syncFromClerk).toHaveBeenCalledWith(
        {
          clerkUserId: "clerk_user_1",
          email: "jane@example.com",
          name: "Jane Doe",
        },
        tx,
      );
    });

    it("is idempotent on duplicate user.deleted delivery (same svix-id) — the inbox claim short-circuits the retry", async () => {
      const event = { type: "user.deleted", data: { id: "clerk_user_1" } } as const;

      await expect(
        service.handleEvent(event, "msg_dup_deleted"),
      ).resolves.not.toThrow();
      await expect(
        service.handleEvent(event, "msg_dup_deleted"),
      ).resolves.not.toThrow();

      expect(usersService.deactivateByClerkId).toHaveBeenCalledTimes(1);
    });

    it("processes two distinct svix-id deliveries independently even for the same Clerk user", async () => {
      const event = userCreatedEvent();

      await service.handleEvent(event, "msg_a");
      await service.handleEvent(event, "msg_b");

      expect(usersService.syncFromClerk).toHaveBeenCalledTimes(2);
      expect(inboxEvents).toHaveLength(2);
    });
  });
});
