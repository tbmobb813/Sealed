import { Prisma, WebhookProvider } from "@sealed/database";

export type ClaimWebhookEventInput = {
  provider: WebhookProvider;
  externalEventId: string;
  eventType: string;
  tenantId?: string | null;
};

/**
 * Inserts a row into the webhook inbox ledger inside the caller's
 * transaction. Returns true the first time this (provider, externalEventId)
 * pair is seen — caller should proceed. Returns false on a unique-constraint
 * conflict — caller should ack as a no-op duplicate without running handler
 * logic.
 */
export async function claimWebhookEvent(
  tx: Prisma.TransactionClient,
  input: ClaimWebhookEventInput,
): Promise<boolean> {
  try {
    await tx.webhookInboxEvent.create({
      data: {
        provider: input.provider,
        externalEventId: input.externalEventId,
        eventType: input.eventType,
        tenantId: input.tenantId ?? null,
        processedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return false;
    }
    throw error;
  }
}
