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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const emit_activity_event_1 = require("../../common/helpers/emit-activity-event");
let ContactsService = class ContactsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(tenantId) {
        return this.prisma.contact.findMany({
            where: { tenantId },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(tenantId, id) {
        const contact = await this.prisma.contact.findFirst({
            where: { id, tenantId },
        });
        if (!contact) {
            throw new common_1.NotFoundException("Contact not found");
        }
        return contact;
    }
    create(tenantId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const contact = await tx.contact.create({
                data: { ...dto, tenantId },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "contact",
                objectId: contact.id,
                eventType: "contact.created",
                metadata: { name: contact.name, email: contact.email },
            });
            return contact;
        });
    }
    async update(tenantId, userId, id, dto) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.contact.findFirst({
                where: { id, tenantId },
            });
            if (!existing) {
                throw new common_1.NotFoundException("Contact not found");
            }
            await tx.contact.updateMany({
                where: { id, tenantId },
                data: dto,
            });
            const contact = await tx.contact.findFirst({
                where: { id, tenantId },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "contact",
                objectId: id,
                eventType: "contact.updated",
                metadata: { name: contact.name, email: contact.email },
            });
            return contact;
        });
    }
    async remove(tenantId, userId, id) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.contact.findFirst({
                where: { id, tenantId },
            });
            if (!existing) {
                throw new common_1.NotFoundException("Contact not found");
            }
            await tx.contact.deleteMany({
                where: { id, tenantId },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "contact",
                objectId: id,
                eventType: "contact.deleted",
                metadata: { name: existing.name, email: existing.email },
            });
            return existing;
        });
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map