import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@sealed/database";
import { assertMoneyInRange, MAX_MONEY_AMOUNT } from "./assert-money-in-range";

describe("assertMoneyInRange", () => {
  it("allows a typical amount", () => {
    expect(() =>
      assertMoneyInRange(new Prisma.Decimal("150.00"), "totalAmount"),
    ).not.toThrow();
  });

  it("allows exactly the maximum storable amount", () => {
    expect(() =>
      assertMoneyInRange(MAX_MONEY_AMOUNT, "totalAmount"),
    ).not.toThrow();
  });

  it("rejects an amount one cent past the maximum", () => {
    const overLimit = MAX_MONEY_AMOUNT.add("0.01");
    expect(() => assertMoneyInRange(overLimit, "totalAmount")).toThrow(
      BadRequestException,
    );
  });

  it("rejects the exact overflow reproduced against a live Decimal(12,2) column", () => {
    // 999999999999 * 1000 — the payload that triggered a live 500
    // ("numeric field overflow") before this guard existed.
    const overflowing = new Prisma.Decimal("999999999999").mul(1000);
    expect(() => assertMoneyInRange(overflowing, "subtotal")).toThrow(
      BadRequestException,
    );
  });

  it("rejects a large-magnitude negative amount too", () => {
    const overLimit = MAX_MONEY_AMOUNT.add("0.01").neg();
    expect(() => assertMoneyInRange(overLimit, "totalAmount")).toThrow(
      BadRequestException,
    );
  });
});
