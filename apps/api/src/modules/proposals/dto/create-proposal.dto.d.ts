export declare class ProposalLineItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
}
export declare class CreateProposalDto {
    contactId: string;
    title: string;
    description?: string;
    lineItems: ProposalLineItemDto[];
    taxAmount?: number;
    expiresAt?: string;
}
export declare class UpdateProposalDto {
    title?: string;
    description?: string;
    lineItems?: ProposalLineItemDto[];
    taxAmount?: number;
    expiresAt?: string;
}
//# sourceMappingURL=create-proposal.dto.d.ts.map