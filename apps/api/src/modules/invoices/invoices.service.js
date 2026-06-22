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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@sealed/database");
const prisma_service_1 = require("../../prisma/prisma.service");
const state_transitions_1 = require("../../common/constants/state-transitions");
const emit_activity_event_1 = require("../../common/helpers/emit-activity-event");
let InvoicesService = class InvoicesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(tenantId) {
        return this.prisma.invoice.findMany({
            where: { tenantId },
            include: { contact: true, agreement: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(tenantId, id) {
        const invoice = await this.prisma.invoice.findFirst({
            where: { id, tenantId },
            include: { contact: true, agreement: true, payments: true },
        });
        if (!invoice) {
            throw new common_1.NotFoundException("Invoice not found");
        }
        return invoice;
    }
    async create(tenantId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const agreement = await tx.agreement.findFirst({
                where: { id: dto.agreementId, tenantId },
            });
            if (!agreement) {
                throw new common_1.NotFoundException("Agreement not found");
            }
            const contact = await tx.contact.findFirst({
                where: { id: dto.contactId, tenantId },
            });
            if (!contact) {
                throw new common_1.NotFoundException("Contact not found");
            }
            const count = await tx.invoice.count({ where: { tenantId } });
            const taxAmount = dto.taxAmount ?? 0;
            const totalAmount = dto.subtotal + taxAmount;
            const invoice = await tx.invoice.create({
                data: {
                    tenantId,
                    agreementId: dto.agreementId,
                    contactId: dto.contactId,
                    number: `INV-${String(count + 1).padStart(4, "0")}`,
                    subtotal: dto.subtotal,
                    taxAmount,
                    totalAmount,
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                    createdByUserId: userId,
                },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "invoice",
                objectId: invoice.id,
                eventType: "invoice.created",
                metadata: {
                    number: invoice.number,
                    totalAmount: invoice.totalAmount.toString(),
                },
            });
            return invoice;
        });
    }
    async update(tenantId, userId, id, dto) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.invoice.findFirst({
                where: { id, tenantId },
            });
            if (!existing) {
                throw new common_1.NotFoundException("Invoice not found");
            }
            const subtotal = dto.subtotal ?? Number(existing.subtotal);
            const taxAmount = dto.taxAmount ?? Number(existing.taxAmount);
            await tx.invoice.updateMany({
                where: { id, tenantId },
                data: {
                    subtotal: new database_1.Prisma.Decimal(subtotal),
                    taxAmount: new database_1.Prisma.Decimal(taxAmount),
                    totalAmount: new database_1.Prisma.Decimal(subtotal + taxAmount),
                    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                },
            });
            const invoice = await tx.invoice.findFirst({
                where: { id, tenantId },
                include: { contact: true, agreement: true, payments: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "invoice",
                objectId: id,
                eventType: "invoice.updated",
                metadata: {
                    number: invoice.number,
                    totalAmount: invoice.totalAmount.toString(),
                },
            });
            return invoice;
        });
    }
    async send(tenantId, userId, id) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findFirst({
                where: { id, tenantId },
                include: { contact: true, agreement: true, payments: true },
            });
            if (!invoice) {
                throw new common_1.NotFoundException("Invoice not found");
            }
            (0, state_transitions_1.assertTransition)(state_transitions_1.INVOICE_TRANSITIONS, invoice.status, "SENT", "invoice");
            await tx.invoice.updateMany({
                where: { id, tenantId },
                data: { status: "SENT", sentAt: new Date() },
            });
            const updated = await tx.invoice.findFirst({
                where: { id, tenantId },
                include: { contact: true, agreement: true, payments: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "invoice",
                objectId: id,
                eventType: "invoice.sent",
                metadata: {
                    number: updated.number,
                    totalAmount: updated.totalAmount.toString(),
                },
            });
            return updated;
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map