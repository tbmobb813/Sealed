import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantGuard } from "./tenant.guard";

function contextWith(
  request: Record<string, unknown>,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("TenantGuard", () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let prisma: { tenant: { findUnique: jest.Mock } };
  let guard: TenantGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    prisma = { tenant: { findUnique: jest.fn() } };
    guard = new TenantGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );
  });

  it("allows public routes without checking tenant context", async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const request: Record<string, unknown> = {};

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
    expect(request.tenant).toBeUndefined();
  });

  it("rejects a request with no authenticated user", async () => {
    const request = {};

    await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it("rejects a user with no tenantId", async () => {
    const request = { user: { id: "user-1" } };

    await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
  });

  it("rejects when the user's tenantId does not resolve to a real tenant", async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);
    const request = { user: { id: "user-1", tenantId: "tenant-ghost" } };

    await expect(guard.canActivate(contextWith(request))).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: "tenant-ghost" },
    });
  });

  it("looks up the tenant by the authenticated user's own tenantId, not any client-supplied value", async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: "tenant-1",
      slug: "acme",
      name: "Acme",
      secretInternalField: "should-not-leak",
    });
    // Even if something upstream stuffed a different tenantId onto the
    // request body/params, the guard must only ever trust request.user.
    const request: Record<string, unknown> = {
      user: { id: "user-1", tenantId: "tenant-1" },
      body: { tenantId: "tenant-someone-elses" },
      params: { tenantId: "tenant-someone-elses" },
    };

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
      where: { id: "tenant-1" },
    });
    expect(request.tenant).toEqual({
      id: "tenant-1",
      slug: "acme",
      name: "Acme",
    });
  });

  it("attaches only id/slug/name to request.tenant, not the full row", async () => {
    prisma.tenant.findUnique.mockResolvedValue({
      id: "tenant-1",
      slug: "acme",
      name: "Acme",
      billingEmail: "billing@acme.test",
      stripeCustomerId: "cus_secret",
    });
    const request: Record<string, unknown> = { user: { id: "user-1", tenantId: "tenant-1" } };

    await guard.canActivate(contextWith(request));

    expect(request.tenant).toEqual({ id: "tenant-1", slug: "acme", name: "Acme" });
    expect(request.tenant).not.toHaveProperty("stripeCustomerId");
  });
});
