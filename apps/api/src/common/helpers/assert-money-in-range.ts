import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { ErrorCodes } from "../constants/error-codes";

/**
 * Largest absolute value a Decimal(12, 2) column can store (10 integer
 * digits + 2 decimal digits). Computed amounts (line-item totals, subtotal,
 * tax, grand total) must stay under this before reaching Prisma — past it,
 * Postgres throws an uncaught "numeric field overflow" that surfaces as a
 * raw 500 instead of a clean validation error.
 */
export const MAX_MONEY_AMOUNT = new Prisma.Decimal("9999999999.99");

export function assertMoneyInRange(amount: Prisma.Decimal, label: string): void {
  if (amount.abs().lte(MAX_MONEY_AMOUNT)) {
    return;
  }

  throw new BadRequestException({
    code: ErrorCodes.VALIDATION_ERROR,
    message: `${label} exceeds the maximum supported amount (${MAX_MONEY_AMOUNT.toString()})`,
    details: { field: label, max: MAX_MONEY_AMOUNT.toString() },
  });
}
