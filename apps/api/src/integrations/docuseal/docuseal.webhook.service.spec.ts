import { BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DocuSealService } from "./docuseal.service";
import { DocuSealWebhookService } from "./docuseal.webhook.service";

const WEBHOOK_ACK = "ok";
const SECRET = "test_shared_secret";

function makePayload(overrides: Record<string, unknown> = {}) {
  return {
    event_type: "submission.completed",
    data: { id: 42 },
    ...overrides,
  };
}

describe("DocuSealWebhookService", () => {
  let agreements: Record<string, unknown>[];
  let activityEvents: Record<string, unknown>[];
  let tx: {
    agreement: { findFirst: jest.Mock; update: jest.Mock };
    activityEvent: { create: jest.Mock };
  };
  let prisma: { $transaction: jest.Mock };
  let docuSealService: {
    verifyWebhookSecret: jest.Mock;
    confirmSignatureRequestStatus: jest.Mock;
  };
  let service: DocuSealWebhookService;

  beforeEach(() => {
    agreements = [
      {
        id: "agreement-1",
        tenantId: "tenant-1",
        createdByUserId: "user-1",
        title: "Test Agreement",
        status: "SENT",
        signatureRequestId: "42",
        signatureProvider: "docuseal",
      },
    ];
    activityEvents = [];

    tx = {
      agreement: {
        findFirst: jest.fn(({ where: { signatureRequestId, signatureProvider } }) =>
          Promise.resolve(
            agreements.find(
              (a) =>
                a.signatureRequestId === signatureRequestId &&
                a.signatureProvider === signatureProvider,
            ) ?? null,
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

    docuSealService = {
      verifyWebhookSecret: jest.fn().mockReturnValue(true),
      confirmSignatureRequestStatus: jest.fn().mockResolvedValue("signed"),
    };

    service = new DocuSealWebhookService(
      docuSealService as unknown as DocuSealService,
      prisma as unknown as PrismaService,
    );
  });

  it("rejects a request with a wrong/missing shared secret before touching the database", async () => {
    docuSealService.verifyWebhookSecret.mockReturnValue(false);

    await expect(
      service.handleWebhook(makePayload(), SECRET),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("acks unhandled event types without confirming status", async () => {
    const result = await service.handleWebhook(
      makePayload({ event_type: "submission.created" }),
      SECRET,
    );

    expect(result).toBe(WEBHOOK_ACK);
    expect(docuSealService.confirmSignatureRequestStatus).not.toHaveBeenCalled();
  });

  it("rejects a completed event missing the submission id", async () => {
    await expect(
      service.handleWebhook(makePayload({ data: {} }), SECRET),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("accepts the submission id from either `data.id` or `data.submission_id`", async () => {
    await service.handleWebhook(
      makePayload({ data: { submission_id: 42 } }),
      SECRET,
    );

    expect(agreements[0]).toMatchObject({ status: "SIGNED" });
  });

  it("never trusts the webhook body alone — rejects when the confirmed API status disagrees with the event", async () => {
    docuSealService.confirmSignatureRequestStatus.mockResolvedValue("pending");

    await expect(
      service.handleWebhook(makePayload(), SECRET),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(agreements[0]).toMatchObject({ status: "SENT" });
  });

  it("acks unknown submission ids instead of erroring", async () => {
    agreements = [];

    const result = await service.handleWebhook(makePayload(), SECRET);

    expect(result).toBe(WEBHOOK_ACK);
  });

  it("scopes the agreement lookup to signatureProvider=docuseal so a legacy non-DocuSeal agreement with the same numeric id can't be hit", async () => {
    // Protects historical rows from a since-removed provider integration —
    // signatureProvider is free text on the Agreement model, not an enum.
    agreements[0].signatureProvider = "dropbox_sign";

    const result = await service.handleWebhook(makePayload(), SECRET);

    expect(result).toBe(WEBHOOK_ACK);
    expect(agreements[0]).toMatchObject({ status: "SENT" });
  });

  it("transitions SENT -> SIGNED and emits an activity event on a fresh completed webhook", async () => {
    await service.handleWebhook(makePayload(), SECRET);

    expect(agreements[0]).toMatchObject({ status: "SIGNED", signatureStatus: "SIGNED" });
    expect(activityEvents).toHaveLength(1);
    expect(activityEvents[0]).toMatchObject({
      eventType: "agreement.signed",
      tenantId: "tenant-1",
    });
  });

  it("is idempotent on a duplicate completed webhook (form.completed then submission.completed) — acks without re-emitting", async () => {
    agreements[0].status = "SIGNED";

    const result = await service.handleWebhook(
      makePayload({ event_type: "form.completed" }),
      SECRET,
    );

    expect(result).toBe(WEBHOOK_ACK);
    expect(activityEvents).toHaveLength(0);
  });

  it("rejects an invalid state transition instead of silently signing", async () => {
    agreements[0].status = "DECLINED";

    await expect(service.handleWebhook(makePayload(), SECRET)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("transitions SENT -> DECLINED and emits an activity event on a form.declined webhook", async () => {
    docuSealService.confirmSignatureRequestStatus.mockResolvedValue("declined");

    await service.handleWebhook(
      makePayload({ event_type: "form.declined" }),
      SECRET,
    );

    expect(agreements[0]).toMatchObject({ status: "DECLINED", signatureStatus: "DECLINED" });
    expect(activityEvents[0]).toMatchObject({ eventType: "agreement.declined" });
  });

  it("is idempotent on a duplicate declined webhook", async () => {
    agreements[0].status = "DECLINED";
    docuSealService.confirmSignatureRequestStatus.mockResolvedValue("declined");

    const result = await service.handleWebhook(
      makePayload({ event_type: "form.declined" }),
      SECRET,
    );

    expect(result).toBe(WEBHOOK_ACK);
    expect(activityEvents).toHaveLength(0);
  });
});
