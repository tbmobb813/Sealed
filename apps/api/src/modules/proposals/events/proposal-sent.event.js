"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalSentEvent = void 0;
class ProposalSentEvent {
    proposalId;
    tenantId;
    publicToken;
    constructor(proposalId, tenantId, publicToken) {
        this.proposalId = proposalId;
        this.tenantId = tenantId;
        this.publicToken = publicToken;
    }
}
exports.ProposalSentEvent = ProposalSentEvent;
//# sourceMappingURL=proposal-sent.event.js.map