import { ConflictException } from "@nestjs/common";
import {
  AGREEMENT_MUTABLE_STATUSES,
  INVOICE_MUTABLE_STATUSES,
  MUTABLE_STATUSES,
  PROPOSAL_MUTABLE_STATUSES,
  assertMutable,
} from "./mutability";
import { ErrorCodes } from "./error-codes";
import {
  AGREEMENT_TRANSITIONS,
  INVOICE_TRANSITIONS,
  PROPOSAL_TRANSITIONS,
} from "./state-transitions";
import { allStatusesInMap } from "../../../tests/helpers/transition-test-utils";

function expectImmutable(
  entityName: string,
  status: string,
  mutableStatuses: string[],
): void {
  try {
    assertMutable(entityName, status);
    throw new Error(`Expected ${entityName} in ${status} to be immutable`);
  } catch (error) {
    expect(error).toBeInstanceOf(ConflictException);
    const response = (error as ConflictException).getResponse() as {
      code: string;
      details: Record<string, unknown>;
    };
    expect(response.code).toBe(ErrorCodes.RESOURCE_IMMUTABLE);
    expect(response.details).toMatchObject({
      entityName,
      currentStatus: status,
      mutableStatuses,
    });
  }
}

describe.each([
  ["proposal", PROPOSAL_MUTABLE_STATUSES, PROPOSAL_TRANSITIONS],
  ["agreement", AGREEMENT_MUTABLE_STATUSES, AGREEMENT_TRANSITIONS],
  ["invoice", INVOICE_MUTABLE_STATUSES, INVOICE_TRANSITIONS],
] as const)("assertMutable (%s)", (entityName, mutableStatuses, transitions) => {
  it.each(mutableStatuses)("allows mutation while %s", (status) => {
    expect(() => assertMutable(entityName, status)).not.toThrow();
  });

  const immutableStatuses = allStatusesInMap(transitions).filter(
    (status) => !mutableStatuses.includes(status),
  );

  it.each(immutableStatuses)("rejects mutation while %s", (status) => {
    expectImmutable(entityName, status, mutableStatuses);
  });
});

describe("assertMutable (unknown entity)", () => {
  it("rejects mutation for entities without a mutability rule", () => {
    expectImmutable("contact", "DRAFT", []);
  });
});

describe("MUTABLE_STATUSES registry", () => {
  it("only registers known domain entities", () => {
    expect(Object.keys(MUTABLE_STATUSES).sort()).toEqual([
      "agreement",
      "invoice",
      "proposal",
    ]);
  });
});
