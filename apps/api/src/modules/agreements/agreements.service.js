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
exports.AgreementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const state_transitions_1 = require("../../common/constants/state-transitions");
const emit_activity_event_1 = require("../../common/helpers/emit-activity-event");
let AgreementsService = class AgreementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(tenantId) {
        return this.prisma.agreement.findMany({
            where: { tenantId },
            include: { proposal: true, contact: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(tenantId, id) {
        const agreement = await this.prisma.agreement.findFirst({
            where: { id, tenantId },
            include: { proposal: true, contact: true },
        });
        if (!agreement) {
            throw new common_1.NotFoundException("Agreement not found");
        }
        return agreement;
    }
    create(tenantId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const proposal = await tx.proposal.findFirst({
                where: { id: dto.proposalId, tenantId },
            });
            if (!proposal) {
                throw new common_1.NotFoundException("Proposal not found");
            }
            const contact = await tx.contact.findFirst({
                where: { id: dto.contactId, tenantId },
            });
            if (!contact) {
                throw new common_1.NotFoundException("Contact not found");
            }
            const agreement = await tx.agreement.create({
                data: {
                    ...dto,
                    tenantId,
                    createdByUserId: userId,
                },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "agreement",
                objectId: agreement.id,
                eventType: "agreement.created",
                metadata: { title: agreement.title },
            });
            return agreement;
        });
    }
    async update(tenantId, userId, id, dto) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.agreement.findFirst({
                where: { id, tenantId },
            });
            if (!existing) {
                throw new common_1.NotFoundException("Agreement not found");
            }
            await tx.agreement.updateMany({
                where: { id, tenantId },
                data: dto,
            });
            const agreement = await tx.agreement.findFirst({
                where: { id, tenantId },
                include: { proposal: true, contact: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "agreement",
                objectId: id,
                eventType: "agreement.updated",
                metadata: { title: agreement.title },
            });
            return agreement;
        });
    }
    async sendForSignature(tenantId, userId, id) {
        return this.prisma.$transaction(async (tx) => {
            const agreement = await tx.agreement.findFirst({
                where: { id, tenantId },
                include: { proposal: true, contact: true },
            });
            if (!agreement) {
                throw new common_1.NotFoundException("Agreement not found");
            }
            (0, state_transitions_1.assertTransition)(state_transitions_1.AGREEMENT_TRANSITIONS, agreement.status, "SENT", "agreement");
            await tx.agreement.updateMany({
                where: { id, tenantId },
                data: { status: "SENT", sentAt: new Date() },
            });
            const updated = await tx.agreement.findFirst({
                where: { id, tenantId },
                include: { proposal: true, contact: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "agreement",
                objectId: id,
                eventType: "agreement.sent",
                metadata: { title: updated.title },
            });
            return updated;
        });
    }
};
exports.AgreementsService = AgreementsService;
exports.AgreementsService = AgreementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgreementsService);
//# sourceMappingURL=agreements.service.js.map