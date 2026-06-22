"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVOICE_TRANSITIONS = exports.AGREEMENT_TRANSITIONS = exports.PROPOSAL_TRANSITIONS = void 0;
exports.assertTransition = assertTransition;
const common_1 = require("@nestjs/common");
exports.PROPOSAL_TRANSITIONS = {
    DRAFT: ["SENT"],
    SENT: ["VIEWED", "EXPIRED"],
    VIEWED: ["ACCEPTED", "REJECTED", "EXPIRED"],
    ACCEPTED: [],
    REJECTED: [],
    EXPIRED: [],
};
exports.AGREEMENT_TRANSITIONS = {
    DRAFT: ["SENT", "CANCELED"],
    SENT: ["SIGNED", "DECLINED", "CANCELED"],
    SIGNED: [],
    DECLINED: [],
    CANCELED: [],
};
exports.INVOICE_TRANSITIONS = {
    DRAFT: ["SENT", "VOID"],
    SENT: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"],
    PARTIALLY_PAID: ["PAID", "OVERDUE", "VOID"],
    PAID: [],
    OVERDUE: ["PARTIALLY_PAID", "PAID", "VOID"],
    VOID: [],
};
function assertTransition(transitions, current, next, entityName) {
    const allowed = transitions[current] ?? [];
    if (!allowed.includes(next)) {
        throw new common_1.ConflictException({
            code: "INVALID_STATE_TRANSITION",
            message: `Cannot transition ${entityName} from ${current} to ${next}`,
            details: { current, attempted: next, allowed },
        });
    }
}
//# sourceMappingURL=state-transitions.js.map