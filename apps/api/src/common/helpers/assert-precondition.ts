import { ConflictException } from "@nestjs/common";
import { ErrorCodes } from "../constants/error-codes";

export type PreconditionDetails = {
  entityName: string;
  sourceId: string;
  currentStatus: string;
  requiredStatus: string;
};

export function assertPrecondition(
  condition: boolean,
  details: PreconditionDetails,
): void {
  if (condition) {
    return;
  }

  throw new ConflictException({
    code: ErrorCodes.PRECONDITION_NOT_MET,
    message: `Cannot proceed: ${details.entityName} must be in ${details.requiredStatus} status (currently ${details.currentStatus})`,
    details,
  });
}
