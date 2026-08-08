import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { StripeWebhookController } from "./stripe.webhook.controller";
import { StripeService } from "./stripe.service";
import { StripeWebhookService } from "./stripe.webhook.service";

describe("StripeWebhookController", () => {
  let stripeService: { constructEvent: jest.Mock };
  let webhookService: { handleEvent: jest.Mock };
  let controller: StripeWebhookController;

  beforeEach(() => {
    stripeService = { constructEvent: jest.fn() };
    webhookService = { handleEvent: jest.fn().mockResolvedValue(undefined) };
    controller = new StripeWebhookController(
      stripeService as unknown as StripeService,
      webhookService as unknown as StripeWebhookService,
    );
  });

  function req(rawBody?: Buffer): Request & { rawBody?: Buffer } {
    return { rawBody } as Request & { rawBody?: Buffer };
  }

  it("rejects with 400 and never touches the event handler when signature verification fails", async () => {
    stripeService.constructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature for payload");
    });

    await expect(
      controller.handleWebhook(req(Buffer.from("{}")), "bad-signature"),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(webhookService.handleEvent).not.toHaveBeenCalled();
  });

  it("processes the event and acks 200 when the signature is valid", async () => {
    const event = { type: "checkout.session.completed", data: { object: {} } };
    stripeService.constructEvent.mockReturnValue(event);

    const result = await controller.handleWebhook(
      req(Buffer.from("{}")),
      "good-signature",
    );

    expect(webhookService.handleEvent).toHaveBeenCalledWith(event);
    expect(result).toEqual({ received: true, type: event.type });
  });

  it("still acks 200 if the verified event's handler throws (avoids infinite Stripe retries)", async () => {
    const event = { type: "checkout.session.completed", data: { object: {} } };
    stripeService.constructEvent.mockReturnValue(event);
    webhookService.handleEvent.mockRejectedValue(new Error("boom"));

    const result = await controller.handleWebhook(
      req(Buffer.from("{}")),
      "good-signature",
    );

    expect(result).toEqual({ received: true, type: event.type });
  });

  it("passes an empty buffer to signature verification when rawBody is missing, so it fails closed rather than skipping verification", async () => {
    stripeService.constructEvent.mockImplementation(() => {
      throw new Error("No signature found");
    });

    await expect(
      controller.handleWebhook(req(undefined), "some-signature"),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(stripeService.constructEvent).toHaveBeenCalledWith(
      Buffer.from(""),
      "some-signature",
    );
  });
});
