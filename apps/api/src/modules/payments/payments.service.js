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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const emit_activity_event_1 = require("../../common/helpers/emit-activity-event");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(tenantId) {
        return this.prisma.payment.findMany({
            where: { tenantId },
            include: { invoice: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(tenantId, id) {
        const payment = await this.prisma.payment.findFirst({
            where: { id, tenantId },
            include: { invoice: true },
        });
        if (!payment) {
            throw new common_1.NotFoundException("Payment not found");
        }
        return payment;
    }
    async create(tenantId, userId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findFirst({
                where: { id: dto.invoiceId, tenantId },
            });
            if (!invoice) {
                throw new common_1.NotFoundException("Invoice not found");
            }
            const payment = await tx.payment.create({
                data: {
                    tenantId,
                    invoiceId: dto.invoiceId,
                    amount: dto.amount,
                    currency: dto.currency ?? "USD",
                    provider: dto.provider ?? "MANUAL",
                    status: "PENDING",
                },
                include: { invoice: true },
            });
            await (0, emit_activity_event_1.emitActivityEvent)(tx, {
                tenantId,
                actorId: userId,
                objectType: "payment",
                objectId: payment.id,
                eventType: "payment.created",
                metadata: {
                    amount: payment.amount.toString(),
                    invoiceId: payment.invoiceId,
                },
            });
            return payment;
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map