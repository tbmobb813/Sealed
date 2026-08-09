import { NotFoundException } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "./users.service";

function p2002() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "5.0.0",
  });
}

describe("UsersService", () => {
  let users: Record<string, unknown>[];
  let tenants: Record<string, unknown>[];
  let activityEvents: Record<string, unknown>[];
  let tx: {
    user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
    tenant: { findUnique: jest.Mock; create: jest.Mock };
    activityEvent: { create: jest.Mock };
  };
  let prisma: {
    user: { findFirst: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };
  let service: UsersService;

  function findUserByClerkId(clerkUserId: string) {
    return users.find((u) => u.clerkUserId === clerkUserId) ?? null;
  }

  beforeEach(() => {
    users = [];
    tenants = [];
    activityEvents = [];

    tx = {
      user: {
        findUnique: jest.fn(({ where: { clerkUserId } }) =>
          Promise.resolve(findUserByClerkId(clerkUserId)),
        ),
        create: jest.fn(({ data }) => {
          const record = { id: `user-${users.length + 1}`, status: "ACTIVE", ...data };
          users.push(record);
          return Promise.resolve(record);
        }),
        update: jest.fn(({ where: { id }, data }) => {
          const record = users.find((u) => u.id === id);
          Object.assign(record as object, data);
          return Promise.resolve(record);
        }),
      },
      tenant: {
        findUnique: jest.fn(({ where: { slug } }) =>
          Promise.resolve(tenants.find((t) => t.slug === slug) ?? null),
        ),
        create: jest.fn(({ data }) => {
          const record = { id: `tenant-${tenants.length + 1}`, ...data };
          tenants.push(record);
          return Promise.resolve(record);
        }),
      },
      activityEvent: {
        create: jest.fn(({ data }) => {
          activityEvents.push(data);
          return Promise.resolve(data);
        }),
      },
    };

    prisma = {
      user: {
        findFirst: jest.fn(({ where: { id, tenantId } }) =>
          Promise.resolve(
            users.find((u) => u.id === id && u.tenantId === tenantId) ?? null,
          ),
        ),
        findMany: jest.fn(({ where: { tenantId } }) =>
          Promise.resolve(users.filter((u) => u.tenantId === tenantId)),
        ),
        findUnique: jest.fn(({ where: { clerkUserId } }) =>
          Promise.resolve(findUserByClerkId(clerkUserId)),
        ),
        update: jest.fn(({ where: { id }, data }) => {
          const record = users.find((u) => u.id === id);
          Object.assign(record as object, data);
          return Promise.resolve(record);
        }),
      },
      $transaction: jest.fn((callback: (tx: unknown) => Promise<unknown>) =>
        callback(tx),
      ),
    };

    service = new UsersService(prisma as unknown as PrismaService);
  });

  describe("findById", () => {
    it("returns the user when scoped to the right tenant", async () => {
      users.push({ id: "user-1", tenantId: "tenant-1", email: "a@b.com" });

      const result = await service.findById("tenant-1", "user-1");

      expect(result).toMatchObject({ id: "user-1" });
    });

    it("throws NotFoundException when the user belongs to a different tenant", async () => {
      users.push({ id: "user-1", tenantId: "tenant-2", email: "a@b.com" });

      await expect(service.findById("tenant-1", "user-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe("provisionFromClerk", () => {
    it("creates a new tenant + user when none exists", async () => {
      const result = await service.provisionFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });

      expect(result).toMatchObject({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        role: "OWNER",
      });
      expect(tenants).toHaveLength(1);
      expect(users).toHaveLength(1);
    });

    it("returns the existing user when clerkUserId is already provisioned", async () => {
      users.push({
        id: "user-1",
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        tenant: { id: "tenant-1" },
      });

      const result = await service.provisionFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });

      expect(result).toMatchObject({ id: "user-1" });
      expect(tenants).toHaveLength(0);
      expect(tx.user.create).not.toHaveBeenCalled();
    });

    it("returns the concurrent winner instead of throwing when user.create races on the clerkUserId unique constraint", async () => {
      // Simulate two concurrent first requests: both miss the existing-user
      // check, then the loser's tx.user.create hits the unique constraint
      // because the winner has already committed.
      tx.user.create.mockImplementationOnce(() => {
        users.push({
          id: "winner-user",
          clerkUserId: "clerk_1",
          email: "jane@example.com",
          tenant: { id: "winner-tenant" },
        });
        throw p2002();
      });

      const result = await service.provisionFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });

      expect(result).toMatchObject({ id: "winner-user" });
    });

    it("rethrows non-P2002 errors from tenant/user creation", async () => {
      tx.user.create.mockImplementationOnce(() => {
        throw new Error("connection terminated");
      });

      await expect(
        service.provisionFromClerk({
          clerkUserId: "clerk_1",
          email: "jane@example.com",
          name: "Jane Doe",
        }),
      ).rejects.toThrow("connection terminated");
    });

    it("retries tenant slug generation on a concurrent slug collision instead of throwing", async () => {
      tx.tenant.create.mockImplementationOnce(() => {
        throw p2002();
      });

      const result = await service.provisionFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });

      expect(result).toMatchObject({ clerkUserId: "clerk_1" });
      expect(tx.tenant.create).toHaveBeenCalledTimes(2);
      expect(tenants).toHaveLength(1);
    });

    it("emits tenant.created and user.created activity events inside the same transaction as the creates", async () => {
      await service.provisionFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });

      expect(activityEvents).toHaveLength(2);
      expect(activityEvents[0]).toMatchObject({ eventType: "tenant.created" });
      expect(activityEvents[1]).toMatchObject({ eventType: "user.created" });
    });

    it("reuses the caller's transaction client instead of opening a nested transaction when tx is supplied", async () => {
      await service.provisionFromClerk(
        { clerkUserId: "clerk_1", email: "jane@example.com", name: "Jane Doe" },
        tx as unknown as Prisma.TransactionClient,
      );

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(users).toHaveLength(1);
    });
  });

  describe("syncFromClerk", () => {
    it("updates an existing user's email/name/status", async () => {
      users.push({
        id: "user-1",
        clerkUserId: "clerk_1",
        email: "old@example.com",
        name: "Old Name",
        status: "DISABLED",
      });

      const result = await service.syncFromClerk({
        clerkUserId: "clerk_1",
        email: "new@example.com",
        name: "New Name",
      });

      expect(result).toMatchObject({
        email: "new@example.com",
        name: "New Name",
        status: "ACTIVE",
      });
    });

    it("provisions a new user when none exists yet", async () => {
      const result = await service.syncFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });

      expect(result).toMatchObject({ clerkUserId: "clerk_1" });
      expect(tenants).toHaveLength(1);
    });

    it("is idempotent — syncing the same payload twice leaves a single user record", async () => {
      await service.syncFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });
      await service.syncFromClerk({
        clerkUserId: "clerk_1",
        email: "jane@example.com",
        name: "Jane Doe",
      });

      expect(users).toHaveLength(1);
    });
  });

  describe("deactivateByClerkId", () => {
    it("sets status DISABLED on an existing user", async () => {
      users.push({ id: "user-1", clerkUserId: "clerk_1", status: "ACTIVE" });

      const result = await service.deactivateByClerkId("clerk_1");

      expect(result).toMatchObject({ status: "DISABLED" });
    });

    it("returns null without throwing when clerkUserId matches nothing", async () => {
      const result = await service.deactivateByClerkId("missing");

      expect(result).toBeNull();
    });

    it("is idempotent — deactivating an already-disabled user doesn't throw", async () => {
      users.push({ id: "user-1", clerkUserId: "clerk_1", status: "DISABLED" });

      await expect(service.deactivateByClerkId("clerk_1")).resolves.toMatchObject({
        status: "DISABLED",
      });
      await expect(service.deactivateByClerkId("clerk_1")).resolves.toMatchObject({
        status: "DISABLED",
      });
    });
  });
});
