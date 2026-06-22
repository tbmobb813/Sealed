"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropboxSignModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const dropbox_sign_service_1 = require("./dropbox-sign.service");
const dropbox_sign_webhook_controller_1 = require("./dropbox-sign.webhook.controller");
let DropboxSignModule = class DropboxSignModule {
};
exports.DropboxSignModule = DropboxSignModule;
exports.DropboxSignModule = DropboxSignModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [dropbox_sign_webhook_controller_1.DropboxSignWebhookController],
        providers: [dropbox_sign_service_1.DropboxSignService],
        exports: [dropbox_sign_service_1.DropboxSignService],
    })
], DropboxSignModule);
//# sourceMappingURL=dropbox-sign.module.js.map