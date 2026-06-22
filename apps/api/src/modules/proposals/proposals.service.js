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
exports.ProposalsService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@sealed/database");
const prisma_service_1 = require("../../prisma/prisma.service");
const state_transitions_1 = require("../../common/constants/state-transitions");
const emit_activity_event_1 = require("../../common/helpers/emit-activity-event");
let ProposalsService = class ProposalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildLineItems(items) {
        return items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
        }));
    }
    calcTotals(lineItems, taxAmount = 0) {
        const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return { subtotal, taxAmount, totalAmount: subtotal + taxAmount };
    }
    findAll(tenantId, query) {
        return this.prisma.proposal.findMany({
            where: {
                tenantId,
                ...(query.status ? { status: query.status } : {}),
            },
            include: { contact: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(tenantId, id) {
        const proposal = await this.prisma.proposal.findFirst({
            where: { id, tenantId },
            include: { contact: true },
        });
        if (!proposal) {
            throw new common_1.NotFoundException("Proposal not found");
        }
        return proposal;
    }
    async findByPublicToken(token) {
        const proposal = await this.prisma.proposal.findUnique({
            where: { publicToken: token },
            include: {
                contact: true,
                tenant: true,
            },
        });
        if (!proposal) {
            throw new common_1.NotFoundException("Proposal not found");
        }
        return {
            title: proposal.title,
            description: proposal.description,
            status: proposal.status,
            lineItems: proposal.lineItems,
            subtotal: proposal.subtotal,
            taxAmount: proposal.taxAmount,
            totalAmount: proposal.totalAmount,
            currency: proposal.currency,
            contactName: proposal.contact.name,
            tenantName: proposal.tenant.name,
            expiresAt: proposal.expiresAt,
        };
    }
    create(tenantId, userId, dto) {
        const lineItems = this.buildLineItems(dto.lineItems);
        const { subtotal, taxAmount, totalAmount } = this.calcTotals(dto.lineItems, dto.taxAmount ?? 0);
        return this.prisma.$transaction(async (tx) => {
            const contact = await tx.contact.findFirst({
                where: { id: dto.contactId, tenantId },
            });
            if (!contact) {
                throw new common_1.NotFoundException("Contact not found");
            }
            const proposal = await tx.proposal.create({
                data: {
                    tenantId,
                    contactId: dto.contactId,
                    title: dto.title,
                    description: dto.description,
                    lineItems,
                    subtotal,
                    taxAmount,
                    totalAmount,
                    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                    createdByUserId: userId,
                },
                include: { contact: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "proposal",
                objectId: proposal.id,
                eventType: "proposal.created",
                metadata: {
                    title: proposal.title,
                    totalAmount: proposal.totalAmount.toString(),
                },
            });
            return proposal;
        });
    }
    async update(tenantId, userId, id, dto) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.proposal.findFirst({
                where: { id, tenantId },
                include: { contact: true },
            });
            if (!existing) {
                throw new common_1.NotFoundException("Proposal not found");
            }
            let subtotal = existing.subtotal;
            let taxAmount = dto.taxAmount ?? existing.taxAmount;
            let totalAmount = existing.totalAmount;
            let lineItems = existing.lineItems;
            if (dto.lineItems) {
                const totals = this.calcTotals(dto.lineItems, Number(taxAmount));
                subtotal = new database_1.Prisma.Decimal(totals.subtotal);
                taxAmount = new database_1.Prisma.Decimal(totals.taxAmount);
                totalAmount = new database_1.Prisma.Decimal(totals.totalAmount);
                lineItems = this.buildLineItems(dto.lineItems);
            }
            await tx.proposal.updateMany({
                where: { id, tenantId },
                data: {
                    title: dto.title,
                    description: dto.description,
                    lineItems,
                    subtotal,
                    taxAmount,
                    totalAmount,
                    expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                },
            });
            const proposal = await tx.proposal.findFirst({
                where: { id, tenantId },
                include: { contact: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "proposal",
                objectId: id,
                eventType: "proposal.updated",
                metadata: {
                    title: proposal.title,
                    totalAmount: proposal.totalAmount.toString(),
                },
            });
            return proposal;
        });
    }
    async send(tenantId, userId, id) {
        return this.prisma.$transaction(async (tx) => {
            const proposal = await tx.proposal.findFirst({
                where: { id, tenantId },
                include: { contact: true },
            });
            if (!proposal) {
                throw new common_1.NotFoundException("Proposal not found");
            }
            (0, state_transitions_1.assertTransition)(state_transitions_1.PROPOSAL_TRANSITIONS, proposal.status, "SENT", "proposal");
            await tx.proposal.updateMany({
                where: { id, tenantId },
                data: {
                    status: "SENT",
                    sentAt: new Date(),
                },
            });
            const updated = await tx.proposal.findFirst({
                where: { id, tenantId },
                include: { contact: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "proposal",
                objectId: id,
                eventType: "proposal.sent",
                metadata: {
                    title: updated.title,
                    totalAmount: updated.totalAmount.toString(),
                },
            });
            return updated;
        });
    }
};
exports.ProposalsService = ProposalsService;
exports.ProposalsService = ProposalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProposalsService);
//# sourceMappingURL=proposals.service.js.map