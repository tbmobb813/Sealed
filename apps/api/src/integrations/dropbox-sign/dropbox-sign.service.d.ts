import { ConfigService } from "@nestjs/config";
export declare class DropboxSignService {
    private readonly config;
    constructor(config: ConfigService);
    get apiKey(): string | undefined;
    createSignatureRequest(_agreementId: string, _signerEmail: string): Promise<{
        signatureRequestId: string;
    }>;
    verifyWebhook(_payload: unknown, _signature: string): boolean;
}
//# sourceMappingURL=dropbox-sign.service.d.ts.map