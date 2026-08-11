import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

function contextWith(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it("allows the request when the route declares no required roles", () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const request = { user: { role: "MEMBER" } };

    expect(guard.canActivate(contextWith(request))).toBe(true);
  });

  it("allows the request when the required-roles list is empty", () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const request = { user: { role: "MEMBER" } };

    expect(guard.canActivate(contextWith(request))).toBe(true);
  });

  it("rejects when roles are required but the request has no user", () => {
    reflector.getAllAndOverride.mockReturnValue(["OWNER", "ADMIN"]);
    const request = {};

    expect(() => guard.canActivate(contextWith(request))).toThrow(
      ForbiddenException,
    );
  });

  it("rejects when the user's role is not in the required set", () => {
    reflector.getAllAndOverride.mockReturnValue(["OWNER", "ADMIN"]);
    const request = { user: { role: "MEMBER" } };

    expect(() => guard.canActivate(contextWith(request))).toThrow(
      ForbiddenException,
    );
  });

  it("allows when the user's role matches one of several required roles", () => {
    reflector.getAllAndOverride.mockReturnValue(["OWNER", "ADMIN"]);
    const request = { user: { role: "ADMIN" } };

    expect(guard.canActivate(contextWith(request))).toBe(true);
  });

  it("does not treat a substring or case-insensitive match as authorization", () => {
    reflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
    const request = { user: { role: "admin" } };

    expect(() => guard.canActivate(contextWith(request))).toThrow(
      ForbiddenException,
    );
  });
});
