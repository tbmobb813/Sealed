import { ConflictException } from "@nestjs/common";
import {
  AGREEMENT_TRANSITIONS,
  INVOICE_TRANSITIONS,
  PROPOSAL_TRANSITIONS,
  assertTransition,
} from "./state-transitions";
import { ErrorCodes } from "./error-codes";
import {
  allStatusesInMap,
  invalidTransitions,
  validTransitions,
} from "../../../tests/helpers/transition-test-utils";

function expectInvalidTransition(
  transitions: typeof PROPOSAL_TRANSITIONS,
  current: string,
  next: string,
  entityName: string,
): void {
  try {
    assertTransition(transitions, current, next, entityName);
    throw new Error(`Expected transition from ${current} to ${next} to fail`);
  } catch (error) {
    expect(error).toBeInstanceOf(ConflictException);
    const response = (error as ConflictException).getResponse() as {
      code: string;
      details: Record<string, unknown>;
    };
    expect(response.code).toBe(ErrorCodes.INVALID_STATE_TRANSITION);
    expect(response.details).toMatchObject({
      entityName,
      currentStatus: current,
      attemptedStatus: next,
      allowedTransitions: transitions[current] ?? [],
    });
  }
}

describe.each([
  ["proposal", PROPOSAL_TRANSITIONS],
  ["agreement", AGREEMENT_TRANSITIONS],
  ["invoice", INVOICE_TRANSITIONS],
] as const)("assertTransition (%s)", (entityName, transitions) => {
  it.each(validTransitions(transitions))(
    "allows $current → $next",
    ({ current, next }) => {
      expect(() =>
        assertTransition(transitions, current, next, entityName),
      ).not.toThrow();
    },
  );

  it.each(invalidTransitions(transitions))(
    "rejects $current → $next",
    ({ current, next }) => {
      expectInvalidTransition(transitions, current, next, entityName);
    },
  );

  it("rejects unknown current status", () => {
    expectInvalidTransition(
      transitions,
      "UNKNOWN_STATUS",
      "SENT",
      entityName,
    );
  });

  it("covers every status referenced in the map", () => {
    const statuses = allStatusesInMap(transitions);
    expect(statuses.length).toBeGreaterThan(0);

    for (const status of statuses) {
      expect(transitions).toHaveProperty(status);
    }
  });
});
