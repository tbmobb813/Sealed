import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
export declare class StripeService {
    private readonly config;
    private readonly stripe;
    constructor(config: ConfigService);
    get client(): Stripe | null;
    createPaymentIntent(amount: number, currency?: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    constructEvent(payload: Buffer, signature: string): Stripe.Event;
}
//# sourceMappingURL=stripe.service.d.ts.map