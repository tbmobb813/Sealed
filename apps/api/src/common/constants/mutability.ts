import { ConflictException } from "@nestjs/common";
import { ErrorCodes } from "./error-codes";

/**
 * Defines which statuses allow mutation for each entity type.
 *
 * This is the trust boundary. Once a resource transitions out of a mutable
 * status, it becomes immutable — only state transitions through dedicated
 * endpoints (e.g. /send, /accept, /sign) can change it.
 *
 * Rules:
 * - Proposals are mutable ONLY while DRAFT
 * - Agreements are mutable ONLY while DRAFT
 * - Invoices are mutable ONLY while DRAFT
 *
 * Once sent, signed, or paid — the record is frozen forever.
 */

type MutabilityMap = Record<string, string[]>;

export const PROPOSAL_MUTABLE_STATUSES: string[] = ["DRAFT"];
export const AGREEMENT_MUTABLE_STATUSES: string[] = ["DRAFT"];
export const INVOICE_MUTABLE_STATUSES: string[] = ["DRAFT"];

export const MUTABLE_STATUSES: MutabilityMap = {
  proposal: PROPOSAL_MUTABLE_STATUSES,
  agreement: AGREEMENT_MUTABLE_STATUSES,
  invoice: INVOICE_MUTABLE_STATUSES,
};

/**
 * Throws a 409 Conflict if the entity is not in a mutable state.
 *
 * Use this in service.update() methods immediately after loading the
 * existing record and confirming it exists.
 *
 * @example
 *   const existing = await tx.proposal.findFirst({...});
 *   if (!existing) throw new NotFoundException(...);
 *   assertMutable("proposal", existing.status);
 *
 * @example
 *   assertMutable("agreement", existing.signatureStatus);
 *   // ...safe to update
 */
export function assertMutable(
  entityName: keyof typeof MUTABLE_STATUSES | string,
  currentStatus: string,
): void {
  const allowed = MUTABLE_STATUSES[entityName] ?? [];

  if (!allowed.includes(currentStatus)) {
    throw new ConflictException({
      code: ErrorCodes.RESOURCE_IMMUTABLE,
      message: `Cannot modify ${entityName} in status ${currentStatus}. Only ${allowed.join(", ")} ${
        allowed.length === 1 ? "is" : "are"
      } editable.`,
      details: {
        entityName,
        currentStatus,
        mutableStatuses: allowed,
      },
    });
  }
}