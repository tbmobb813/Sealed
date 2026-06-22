import { ConfigService } from "@nestjs/config";
export declare class ResendService {
    private readonly config;
    private readonly resend;
    constructor(config: ConfigService);
    sendEmail(to: string, subject: string, html: string): Promise<import("resend").CreateEmailResponse | null>;
    sendProposalEmail(to: string, proposalTitle: string, publicUrl: string): Promise<import("resend").CreateEmailResponse | null>;
}
//# sourceMappingURL=resend.service.d.ts.map