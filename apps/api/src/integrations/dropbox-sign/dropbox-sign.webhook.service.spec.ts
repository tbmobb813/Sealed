import { BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DropboxSignService } from "./dropbox-sign.service";
import { DropboxSignWebhookService } from "./dropbox-sign.webhook.service";

const WEBHOOK_ACK = "Hello API Event Received";

function makePayload(overrides: Record<string, unknown> = {}) {
  return {
    event: { event_type: "signature_request_all_signed" },
    signature_request: { signature_request_id: "sig_req_1" },
    ...overrides,
  };
}

describe("DropboxSignWebhookService", () => {
  let agreements: Record<string, unknown>[];
  let activityEvents: Record<string, unknown>[];
  let tx: {
    agreement: { findFirst: jest.Mock; update: jest.Mock };
    activityEvent: { create: jest.Mock };
  };
  let prisma: { $transaction: jest.Mock };
  let dropboxSignService: {
    verifyWebhook: jest.Mock;
    confirmSignatureRequestStatus: jest.Mock;
  };
  let service: DropboxSignWebhookService;

  beforeEach(() => {
    agreements = [
      {
        id: "agreement-1",
        tenantId: "tenant-1",
        createdByUserId: "user-1",
        title: "Test Agreement",
        status: "SENT",
        signatureRequestId: "sig_req_1",
      },
    ];
    activityEvents = [];

    tx = {
      agreement: {
        findFirst: jest.fn(({ where: { signatureRequestId } }) =>
          Promise.resolve(
            agreements.find((a) => a.signatureRequestId === signatureRequestId) ??
              null,
          ),
        ),
        update: jest.fn(({ where: { id }, data }) => {
          const record = agreements.find((a) => a.id === id);
          Object.assign(record as object, data);
          return Promise.resolve(record);
        }),
      },
      activityEvent: {
        create: jest.fn(({ data }) => {
          activityEvents.push(data);
          return Promise.resolve(data);
        }),
      },
    };

    prisma = {
      $transaction: jest.fn((callback: (tx: unknown) => Promise<unknown>) =>
        callback(tx),
      ),
    };

    dropboxSignService = {
      verifyWebhook: jest.fn().mockReturnValue(true),
      confirmSignatureRequestStatus: jest.fn().mockResolvedValue("signed"),
    };

    service = new DropboxSignWebhookService(
      dropboxSignService as unknown as DropboxSignService,
      prisma as unknown as PrismaService,
    );
  });

  it("rejects a payload with an invalid signature before touching the database", async () => {
    dropboxSignService.verifyWebhook.mockReturnValue(false);

    await expect(
      service.handleWebhook(makePayload(), "{}"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("acks unhandled event types without confirming status or touching the database", async () => {
    const result = await service.handleWebhook(
      makePayload({ event: { event_type: "signature_request_downloadable" } }),
      "{}",
    );

    expect(result).toBe(WEBHOOK_ACK);
    expect(dropboxSignService.confirmSignatureRequestStatus).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a signed event missing the signature_request_id", async () => {
    await expect(
      service.handleWebhook(
        makePayload({ signature_request: {} }),
        "{}",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("never trusts the webhook body alone — rejects when the confirmed API status disagrees with the event", async () => {
    dropboxSignService.confirmSignatureRequestStatus.mockResolvedValue("pending");

    await expect(
      service.handleWebhook(makePayload(), "{}"),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(agreements[0]).toMatchObject({ status: "SENT" });
  });

  it("acks unknown signature request ids instead of erroring (avoids a 404 enumeration side-channel)", async () => {
    agreements = [];

    const result = await service.handleWebhook(makePayload(), "{}");

    expect(result).toBe(WEBHOOK_ACK);
  });

  it("transitions SENT -> SIGNED and emits an activity event on a fresh signed webhook", async () => {
    await service.handleWebhook(makePayload(), "{}");

    expect(agreements[0]).toMatchObject({ status: "SIGNED", signatureStatus: "SIGNED" });
    expect(activityEvents).toHaveLength(1);
    expect(activityEvents[0]).toMatchObject({
      eventType: "agreement.signed",
      tenantId: "tenant-1",
    });
  });

  it("is idempotent on a duplicate signed webhook (already-SIGNED agreement) — acks without re-emitting", async () => {
    agreements[0].status = "SIGNED";

    const result = await service.handleWebhook(makePayload(), "{}");

    expect(result).toBe(WEBHOOK_ACK);
    expect(activityEvents).toHaveLength(0);
  });

  it("treats both signature_request_signed and signature_request_all_signed as the signed trigger", async () => {
    await service.handleWebhook(
      makePayload({ event: { event_type: "signature_request_signed" } }),
      "{}",
    );
    expect(agreements[0]).toMatchObject({ status: "SIGNED" });
  });

  it("rejects an invalid state transition instead of silently signing (e.g. a DECLINED agreement)", async () => {
    agreements[0].status = "DECLINED";

    await expect(service.handleWebhook(makePayload(), "{}")).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("transitions SENT -> DECLINED and emits an activity event on a declined webhook", async () => {
    dropboxSignService.confirmSignatureRequestStatus.mockResolvedValue("declined");

    await service.handleWebhook(
      makePayload({ event: { event_type: "signature_request_declined" } }),
      "{}",
    );

    expect(agreements[0]).toMatchObject({ status: "DECLINED", signatureStatus: "DECLINED" });
    expect(activityEvents[0]).toMatchObject({ eventType: "agreement.declined" });
  });
});
