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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = __importDefault(require("stripe"));
let StripeService = class StripeService {
    config;
    stripe;
    constructor(config) {
        this.config = config;
        const apiKey = this.config.get("STRIPE_SECRET_KEY");
        this.stripe = apiKey ? new stripe_1.default(apiKey) : null;
    }
    get client() {
        return this.stripe;
    }
    async createPaymentIntent(amount, currency = "usd") {
        if (!this.stripe) {
            throw new Error("Stripe is not configured");
        }
        return this.stripe.paymentIntents.create({
            amount,
            currency,
        });
    }
    constructEvent(payload, signature) {
        if (!this.stripe) {
            throw new Error("Stripe is not configured");
        }
        const webhookSecret = this.config.get("STRIPE_WEBHOOK_SECRET");
        if (!webhookSecret) {
            throw new Error("Stripe webhook secret is not configured");
        }
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map