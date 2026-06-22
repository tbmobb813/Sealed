"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitActivityEvent = emitActivityEvent;
async function emitActivityEvent(tx, input) {
    await tx.activityEvent.create({
        data: {
            tenantId: input.tenantId,
            actorId: input.actorId,
            actorType: "user",
            objectType: input.objectType,
            objectId: input.objectId,
            eventType: input.eventType,
            metadata: (input.metadata ?? {}),
        },
    });
}
//# sourceMappingURL=emit-activity-event.js.map