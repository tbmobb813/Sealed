import { DropboxSignService } from "./dropbox-sign.service";
export declare class DropboxSignWebhookController {
    private readonly dropboxSignService;
    constructor(dropboxSignService: DropboxSignService);
    handleWebhook(body: unknown, signature: string): {
        received: boolean;
    };
}
//# sourceMappingURL=dropbox-sign.webhook.controller.d.ts.map