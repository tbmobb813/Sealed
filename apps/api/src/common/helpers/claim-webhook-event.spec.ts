import { Prisma } from "@sealed/database";
import { claimWebhookEvent } from "./claim-webhook-event";

function makeTx() {
  const rows: Array<{ provider: string; externalEventId: string }> = [];

  return {
    webhookInboxEvent: {
      create: jest.fn(({ data }) => {
        const conflict = rows.some(
          (r) =>
            r.provider === data.provider &&
            r.externalEventId === data.externalEventId,
        );
        if (conflict) {
          throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
            code: "P2002",
            clientVersion: "5.0.0",
          });
        }
        rows.push({
          provider: data.provider,
          externalEventId: data.externalEventId,
        });
        return Promise.resolve({ id: `row-${rows.length}`, ...data });
      }),
    },
  } as unknown as Prisma.TransactionClient;
}

describe("claimWebhookEvent", () => {
  it("returns true and inserts a row on first delivery", async () => {
    const tx = makeTx();
    const claimed = await claimWebhookEvent(tx, {
      provider: "STRIPE",
      externalEventId: "evt_1",
      eventType: "checkout.session.completed",
    });

    expect(claimed).toBe(true);
    expect(
      (tx as unknown as { webhookInboxEvent: { create: jest.Mock } })
        .webhookInboxEvent.create,
    ).toHaveBeenCalledTimes(1);
  });

  it("returns false on duplicate (provider, externalEventId) delivery", async () => {
    const tx = makeTx();
    await claimWebhookEvent(tx, {
      provider: "STRIPE",
      externalEventId: "evt_1",
      eventType: "checkout.session.completed",
    });

    const claimed = await claimWebhookEvent(tx, {
      provider: "STRIPE",
      externalEventId: "evt_1",
      eventType: "checkout.session.completed",
    });

    expect(claimed).toBe(false);
  });

  it("returns true for the same externalEventId under a different provider", async () => {
    const tx = makeTx();
    await claimWebhookEvent(tx, {
      provider: "STRIPE",
      externalEventId: "evt_1",
      eventType: "checkout.session.completed",
    });

    const claimed = await claimWebhookEvent(tx, {
      provider: "CLERK",
      externalEventId: "evt_1",
      eventType: "user.created",
    });

    expect(claimed).toBe(true);
  });

  it("returns true for a different externalEventId under the same provider", async () => {
    const tx = makeTx();
    await claimWebhookEvent(tx, {
      provider: "STRIPE",
      externalEventId: "evt_1",
      eventType: "checkout.session.completed",
    });

    const claimed = await claimWebhookEvent(tx, {
      provider: "STRIPE",
      externalEventId: "evt_2",
      eventType: "checkout.session.completed",
    });

    expect(claimed).toBe(true);
  });
});
