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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgreementsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const agreements_service_1 = require("./agreements.service");
const create_agreement_dto_1 = require("./dto/create-agreement.dto");
let AgreementsController = class AgreementsController {
    agreementsService;
    constructor(agreementsService) {
        this.agreementsService = agreementsService;
    }
    async list(user) {
        const data = await this.agreementsService.findAll(user.tenantId);
        return { data };
    }
    async getOne(user, id) {
        const data = await this.agreementsService.findOne(user.tenantId, id);
        return { data };
    }
    async create(user, dto) {
        const data = await this.agreementsService.create(user.tenantId, user.id, dto);
        return { data };
    }
    async update(user, id, dto) {
        const data = await this.agreementsService.update(user.tenantId, user.id, id, dto);
        return { data };
    }
    async sendForSignature(user, id) {
        const data = await this.agreementsService.sendForSignature(user.tenantId, user.id, id);
        return { data };
    }
};
exports.AgreementsController = AgreementsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgreementsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgreementsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_agreement_dto_1.CreateAgreementDto]),
    __metadata("design:returntype", Promise)
], AgreementsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_agreement_dto_1.UpdateAgreementDto]),
    __metadata("design:returntype", Promise)
], AgreementsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(":id/send"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgreementsController.prototype, "sendForSignature", null);
exports.AgreementsController = AgreementsController = __decorate([
    (0, common_1.Controller)("agreements"),
    __metadata("design:paramtypes", [agreements_service_1.AgreementsService])
], AgreementsController);
//# sourceMappingURL=agreements.controller.js.map