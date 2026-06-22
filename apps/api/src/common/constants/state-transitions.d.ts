type TransitionMap = Record<string, string[]>;
export declare const PROPOSAL_TRANSITIONS: TransitionMap;
export declare const AGREEMENT_TRANSITIONS: TransitionMap;
export declare const INVOICE_TRANSITIONS: TransitionMap;
export declare function assertTransition(transitions: TransitionMap, current: string, next: string, entityName: string): void;
export {};
//# sourceMappingURL=state-transitions.d.ts.map