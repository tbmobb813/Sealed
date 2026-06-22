import { Prisma } from "@sealed/database";

export type ActivityEventInput = {
  tenantId: string;
  actorId: string;
  objectType: string;
  objectId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
};

export async function emitActivityEvent(
  tx: Prisma.TransactionClient,
  input: ActivityEventInput,
): Promise<void> {
  await tx.activityEvent.create({
    data: {
      tenantId: input.tenantId,
      actorId: input.actorId,
      actorType: "user",
      objectType: input.objectType,
      objectId: input.objectId,
      eventType: input.eventType,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}
