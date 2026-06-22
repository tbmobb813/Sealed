"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let ResendService = class ResendService {
    config;
    resend;
    constructor(config) {
        this.config = config;
        const apiKey = this.config.get("RESEND_API_KEY");
        this.resend = apiKey ? new resend_1.Resend(apiKey) : null;
    }
    async sendEmail(to, subject, html) {
        if (!this.resend) {
            console.warn("Resend not configured, skipping email to", to);
            return null;
        }
        return this.resend.emails.send({
            from: "Sealed <noreply@sealed.app>",
            to,
            subject,
            html,
        });
    }
    async sendProposalEmail(to, proposalTitle, publicUrl) {
        return this.sendEmail(to, `New proposal: ${proposalTitle}`, `<p>You have a new proposal: <strong>${proposalTitle}</strong></p>
       <p><a href="${publicUrl}">View proposal</a></p>`);
    }
};
exports.ResendService = ResendService;
exports.ResendService = ResendService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResendService);
//# sourceMappingURL=resend.service.js.map