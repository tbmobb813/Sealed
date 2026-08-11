import {
  BadRequestException,
  ConflictException,
  ExecutionContext,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { verifyToken } from "@clerk/backend";
import { PrismaService } from "../../prisma/prisma.service";
import { UsersService } from "../../modules/users/users.service";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { DEMO_MODE_TOKEN, DEMO_CLERK_USER_ID, TEST_CLERK_USER_ID } from "../constants/demo";

jest.mock("@clerk/backend", () => ({
  verifyToken: jest.fn(),
}));

const mockedVerifyToken = verifyToken as jest.Mock;

function contextWith(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("ClerkAuthGuard", () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let config: { get: jest.Mock };
  let prisma: { user: { findFirst: jest.Mock } };
  let usersService: { provisionFromClerkId: jest.Mock };
  let guard: ClerkAuthGuard;

  const ACTIVE_USER = {
    id: "user-1",
    clerkUserId: "clerk_abc",
    email: "jane@acme.test",
    name: "Jane",
    tenantId: "tenant-1",
    role: "MEMBER",
    status: "ACTIVE",
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    config = { get: jest.fn() };
    prisma = { user: { findFirst: jest.fn() } };
    usersService = { provisionFromClerkId: jest.fn() };
    mockedVerifyToken.mockReset();

    guard = new ClerkAuthGuard(
      reflector as unknown as Reflector,
      config as unknown as ConfigService,
      prisma as unknown as PrismaService,
      usersService as unknown as UsersService,
    );
  });

  afterEach(() => {
    delete process.env.INTEGRATION_TEST;
  });

  it("allows public routes without inspecting the Authorization header", async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const request = { headers: {} };

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(mockedVerifyToken).not.toHaveBeenCalled();
  });

  it("rejects a missing Authorization header", async () => {
    const request = { headers: {} };

    await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("rejects an Authorization header without the Bearer scheme", async () => {
    const request = { headers: { authorization: "Basic xyz" } };

    await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  describe("demo mode", () => {
    beforeEach(() => {
      config.get.mockImplementation((key: string) =>
        key === "DEMO_MODE" ? "true" : undefined,
      );
    });

    it("rejects a bearer token that is not the demo token", async () => {
      const request = { headers: { authorization: "Bearer not-the-demo-token" } };

      await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("rejects when the demo user has not been seeded", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      const request = { headers: { authorization: `Bearer ${DEMO_MODE_TOKEN}` } };

      await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("attaches the seeded demo user and looks it up by the demo clerk id outside integration tests", async () => {
      prisma.user.findFirst.mockResolvedValue(ACTIVE_USER);
      const request: Record<string, unknown> = {
        headers: { authorization: `Bearer ${DEMO_MODE_TOKEN}` },
      };

      await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { clerkUserId: DEMO_CLERK_USER_ID },
      });
      expect(request.user).toEqual({
        id: ACTIVE_USER.id,
        clerkUserId: ACTIVE_USER.clerkUserId,
        email: ACTIVE_USER.email,
        name: ACTIVE_USER.name,
        tenantId: ACTIVE_USER.tenantId,
        role: ACTIVE_USER.role,
      });
    });

    it("looks up the test clerk id instead when INTEGRATION_TEST=true, never colliding with the real demo user", async () => {
      process.env.INTEGRATION_TEST = "true";
      prisma.user.findFirst.mockResolvedValue({
        ...ACTIVE_USER,
        clerkUserId: TEST_CLERK_USER_ID,
      });
      const request = { headers: { authorization: `Bearer ${DEMO_MODE_TOKEN}` } };

      await guard.canActivate(contextWith(request));

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { clerkUserId: TEST_CLERK_USER_ID },
      });
    });
  });

  describe("real (non-demo) mode", () => {
    beforeEach(() => {
      config.get.mockImplementation((key: string) => {
        if (key === "DEMO_MODE") return undefined;
        if (key === "CLERK_SECRET_KEY") return "sk_test_clerk";
        return undefined;
      });
    });

    it("rejects when Clerk is not configured", async () => {
      config.get.mockImplementation((key: string) =>
        key === "CLERK_SECRET_KEY" ? undefined : undefined,
      );
      const request = { headers: { authorization: "Bearer sometoken" } };

      await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockedVerifyToken).not.toHaveBeenCalled();
    });

    it("rejects a token that fails Clerk verification", async () => {
      mockedVerifyToken.mockRejectedValue(new Error("bad token"));
      const request = { headers: { authorization: "Bearer forged" } };

      await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("attaches the user and tenant scope on a valid token for a known user", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_abc" });
      prisma.user.findFirst.mockResolvedValue(ACTIVE_USER);
      const request: Record<string, unknown> = {
        headers: { authorization: "Bearer valid" },
      };

      await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
      expect(request.user).toEqual({
        id: ACTIVE_USER.id,
        clerkUserId: ACTIVE_USER.clerkUserId,
        email: ACTIVE_USER.email,
        name: ACTIVE_USER.name,
        tenantId: ACTIVE_USER.tenantId,
        role: ACTIVE_USER.role,
      });
    });

    it("verifies the token's authorized-party claim against CORS_ORIGIN, guarding against subdomain cookie leaking", async () => {
      config.get.mockImplementation((key: string) => {
        if (key === "DEMO_MODE") return undefined;
        if (key === "CLERK_SECRET_KEY") return "sk_test_clerk";
        if (key === "CORS_ORIGIN") return "https://app.sealed.test";
        return undefined;
      });
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_abc" });
      prisma.user.findFirst.mockResolvedValue(ACTIVE_USER);
      const request: Record<string, unknown> = {
        headers: { authorization: "Bearer valid" },
      };

      await guard.canActivate(contextWith(request));

      expect(mockedVerifyToken).toHaveBeenCalledWith("valid", {
        secretKey: "sk_test_clerk",
        authorizedParties: ["https://app.sealed.test"],
      });
    });

    it("falls back to the localhost dev origin for authorizedParties when CORS_ORIGIN is unset", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_abc" });
      prisma.user.findFirst.mockResolvedValue(ACTIVE_USER);
      const request: Record<string, unknown> = {
        headers: { authorization: "Bearer valid" },
      };

      await guard.canActivate(contextWith(request));

      expect(mockedVerifyToken).toHaveBeenCalledWith("valid", {
        secretKey: "sk_test_clerk",
        authorizedParties: ["http://localhost:3000"],
      });
    });

    it("rejects a disabled (non-ACTIVE) user even with a valid token", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_abc" });
      prisma.user.findFirst.mockResolvedValue({ ...ACTIVE_USER, status: "DISABLED" });
      const request = { headers: { authorization: "Bearer valid" } };

      await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("provisions a first-time user from Clerk when none exists locally", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_new" });
      prisma.user.findFirst.mockResolvedValue(null);
      usersService.provisionFromClerkId.mockResolvedValue({
        ...ACTIVE_USER,
        clerkUserId: "clerk_new",
      });
      const request: Record<string, unknown> = {
        headers: { authorization: "Bearer valid" },
      };

      await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
      expect(usersService.provisionFromClerkId).toHaveBeenCalledWith(
        "clerk_new",
        "sk_test_clerk",
      );
      expect(request.user).toMatchObject({ clerkUserId: "clerk_new" });
    });

    it("surfaces a provisioning BadRequestException as Unauthorized rather than 503", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_new" });
      prisma.user.findFirst.mockResolvedValue(null);
      usersService.provisionFromClerkId.mockRejectedValue(
        new BadRequestException("Clerk user has no email address"),
      );
      const request = { headers: { authorization: "Bearer valid" } };

      await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("propagates a non-BadRequest HttpException from provisioning unchanged", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_new" });
      prisma.user.findFirst.mockResolvedValue(null);
      const conflict = new ConflictException("duplicate tenant slug");
      usersService.provisionFromClerkId.mockRejectedValue(conflict);
      const request = { headers: { authorization: "Bearer valid" } };

      await expect(guard.canActivate(contextWith(request))).rejects.toBe(conflict);
    });

    it("degrades to 503 (not silently authenticated) when provisioning fails for an unknown reason", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_new" });
      prisma.user.findFirst.mockResolvedValue(null);
      usersService.provisionFromClerkId.mockRejectedValue(new Error("network blip"));
      const request = { headers: { authorization: "Bearer valid" } };

      await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it("recovers when a concurrent request already provisioned the user (double-checks before failing)", async () => {
      mockedVerifyToken.mockResolvedValue({ sub: "clerk_new" });
      // First lookup: nobody yet. Provisioning fails (lost the race).
      // Second lookup (the guard's re-check): the sibling request's
      // provisioning has since landed.
      prisma.user.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...ACTIVE_USER, clerkUserId: "clerk_new" });
      usersService.provisionFromClerkId.mockRejectedValue(new Error("unique constraint"));
      const request: Record<string, unknown> = {
        headers: { authorization: "Bearer valid" },
      };

      await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
      expect(request.user).toMatchObject({ clerkUserId: "clerk_new" });
    });
  });
});
