export class ProposalSentEvent {
  constructor(
    public readonly proposalId: string,
    public readonly tenantId: string,
    public readonly publicToken: string,
  ) {}
}
