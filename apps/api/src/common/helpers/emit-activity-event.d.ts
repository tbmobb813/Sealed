import { Prisma } from "@sealed/database";
export type ActivityEventInput = {
    tenantId: string;
    actorId: string;
    objectType: string;
    objectId: string;
    eventType: string;
    metadata?: Record<string, unknown>;
};
export declare function emitActivityEvent(tx: Prisma.TransactionClient, input: ActivityEventInput): Promise<void>;
//# sourceMappingURL=emit-activity-event.d.ts.map