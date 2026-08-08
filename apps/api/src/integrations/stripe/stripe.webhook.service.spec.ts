import { Prisma } from "@sealed/database";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";
import { StripeWebhookService } from "./stripe.webhook.service";

function makeSession(
  overrides: Partial<Stripe.Checkout.Session>,
): Stripe.Checkout.Session {
  return {
    id: "cs_test_123",
    amount_total: 15000,
    currency: "usd",
    metadata: { invoiceId: "invoice-1" },
    payment_status: "paid",
    ...overrides,
  } as Stripe.Checkout.Session;
}

describe("StripeWebhookService", () => {
  let service: StripeWebhookService;
  let payments: Record<string, unknown>[];
  let invoice: Record<string, unknown>;
  let tx: {
    payment: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
    invoice: { findFirst: jest.Mock; update: jest.Mock };
    $executeRaw: jest.Mock;
    activityEvent: { create: jest.Mock };
  };
  let prisma: { $transaction: jest.Mock };

  beforeEach(() => {
    payments = [];
    invoice = {
      id: "invoice-1",
      tenantId: "tenant-1",
      createdByUserId: "user-1",
      number: "INV-1",
      status: "SENT",
      totalAmount: new Prisma.Decimal(150),
      amountPaid: new Prisma.Decimal(0),
      currency: "USD",
    };

    tx = {
      payment: {
        findUnique: jest.fn(({ where: { providerPaymentId } }) =>
          Promise.resolve(
            payments.find((p) => p.providerPaymentId === providerPaymentId) ??
              null,
          ),
        ),
        create: jest.fn(({ data }) => {
          const record = { id: `payment-${payments.length + 1}`, ...data };
          payments.push(record);
          return Promise.resolve(record);
        }),
        update: jest.fn(({ where: { id }, data }) => {
          const record = payments.find((p) => p.id === id);
          Object.assign(record as object, data);
          return Promise.resolve(record);
        }),
      },
      invoice: {
        findFirst: jest.fn(() => Promise.resolve(invoice)),
        update: jest.fn(({ data }) => {
          Object.assign(invoice, data);
          return Promise.resolve(invoice);
        }),
      },
      $executeRaw: jest.fn(() => Promise.resolve()),
      activityEvent: { create: jest.fn(() => Promise.resolve()) },
    };

    prisma = {
      $transaction: jest.fn((callback: (tx: unknown) => Promise<void>) =>
        callback(tx),
      ),
    };

    service = new StripeWebhookService(prisma as unknown as PrismaService);
  });

  it("marks the invoice paid immediately for a synchronous (card) payment", async () => {
    await service.handleEvent({
      type: "checkout.session.completed",
      data: { object: makeSession({ payment_status: "paid" }) },
    } as Stripe.Event);

    expect(invoice.status).toBe("PAID");
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({ status: "SUCCEEDED" });
  });

  it("does not mark the invoice paid for a pending ACH debit", async () => {
    await service.handleEvent({
      type: "checkout.session.completed",
      data: { object: makeSession({ payment_status: "unpaid" }) },
    } as Stripe.Event);

    // The whole point of the fix: an unsettled async payment method must
    // not flip the invoice to PAID or create a SUCCEEDED payment record.
    expect(invoice.status).toBe("SENT");
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({ status: "PENDING" });
  });

  it("marks the invoice paid once the pending ACH debit settles", async () => {
    await service.handleEvent({
      type: "checkout.session.completed",
      data: { object: makeSession({ payment_status: "unpaid" }) },
    } as Stripe.Event);

    await service.handleEvent({
      type: "checkout.session.async_payment_succeeded",
      data: { object: makeSession({ payment_status: "paid" }) },
    } as Stripe.Event);

    expect(invoice.status).toBe("PAID");
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({ status: "SUCCEEDED" });
  });

  it("marks the pending payment FAILED and leaves the invoice unpaid when an ACH debit fails", async () => {
    await service.handleEvent({
      type: "checkout.session.completed",
      data: { object: makeSession({ payment_status: "unpaid" }) },
    } as Stripe.Event);

    await service.handleEvent({
      type: "checkout.session.async_payment_failed",
      data: { object: makeSession({ payment_status: "unpaid" }) },
    } as Stripe.Event);

    expect(invoice.status).toBe("SENT");
    expect(invoice.amountPaid).toEqual(new Prisma.Decimal(0));
    expect(payments).toHaveLength(1);
    expect(payments[0]).toMatchObject({ status: "FAILED" });
    expect(payments[0]).toHaveProperty("failedAt");
  });

  it("is idempotent on duplicate webhook delivery for the same session", async () => {
    const paidSession = makeSession({ payment_status: "paid" });

    await service.handleEvent({
      type: "checkout.session.completed",
      data: { object: paidSession },
    } as Stripe.Event);
    await service.handleEvent({
      type: "checkout.session.completed",
      data: { object: paidSession },
    } as Stripe.Event);

    expect(payments).toHaveLength(1);
    expect(invoice.amountPaid).toEqual(new Prisma.Decimal(150));
  });
});
