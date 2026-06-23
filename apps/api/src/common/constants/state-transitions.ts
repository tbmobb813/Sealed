import { ConflictException } from "@nestjs/common";
import { ErrorCodes } from "./error-codes";

type TransitionMap = Record<string, string[]>;

export const PROPOSAL_TRANSITIONS: TransitionMap = {
  DRAFT: ["SENT"],
  SENT: ["VIEWED", "EXPIRED"],
  VIEWED: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED: [],
  REJECTED: [],
  EXPIRED: [],
};

export const AGREEMENT_TRANSITIONS: TransitionMap = {
  DRAFT: ["SENT", "CANCELED"],
  SENT: ["SIGNED", "DECLINED", "CANCELED"],
  SIGNED: [],
  DECLINED: [],
  CANCELED: [],
};

export const INVOICE_TRANSITIONS: TransitionMap = {
  DRAFT: ["SENT", "VOID"],
  SENT: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "VOID"],
  PAID: [],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "VOID"],
  VOID: [],
};

export function assertTransition(
  transitions: TransitionMap,
  current: string,
  next: string,
  entityName: string,
): void {
  const allowed = transitions[current] ?? [];

  if (!allowed.includes(next)) {
    throw new ConflictException({
      code: ErrorCodes.INVALID_STATE_TRANSITION,
      message: `Cannot transition ${entityName} from ${current} to ${next}`,
      details: {
        entityName,
        currentStatus: current,
        attemptedStatus: next,
        allowedTransitions: allowed,
      },
    });
  }
}
