import { BadRequestException, ConflictException } from "@nestjs/common";
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

  it("acks 200 without rethrowing when the handler rejects with ConflictException (a permanent, retry-can't-fix-it failure)", async () => {
    const event = { type: "checkout.session.completed", data: { object: {} } };
    stripeService.constructEvent.mockReturnValue(event);
    webhookService.handleEvent.mockRejectedValue(
      new ConflictException("Cannot transition invoice from PAID to PAID"),
    );

    const result = await controller.handleWebhook(
      req(Buffer.from("{}")),
      "good-signature",
    );

    expect(result).toEqual({ received: true, type: event.type });
  });

  it("rethrows (so Stripe retries) when the handler rejects with anything other than ConflictException", async () => {
    // A dropped DB connection or any other unexpected failure must NOT be
    // acked 200 — that would silently drop the event with no path to
    // reconciliation. Only a genuinely permanent business-rule rejection
    // (ConflictException) should stop Stripe from retrying.
    const event = { type: "checkout.session.completed", data: { object: {} } };
    stripeService.constructEvent.mockReturnValue(event);
    webhookService.handleEvent.mockRejectedValue(new Error("connection terminated"));

    await expect(
      controller.handleWebhook(req(Buffer.from("{}")), "good-signature"),
    ).rejects.toThrow("connection terminated");
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
