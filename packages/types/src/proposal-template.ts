export interface ProposalTemplate {
  id: string;
  tenantId: string;
  name: string;
  title: string;
  description: string | null;
  lineItems: unknown[];
  createdAt: string;
  updatedAt: string;
}
