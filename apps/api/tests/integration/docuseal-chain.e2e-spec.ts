import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "../../src/prisma/prisma.service";
import { cleanDatabase, seedTestFixtures } from "../helpers/db";
import { AUTH_HEADER, createTestApp } from "../helpers/test-app";
import { resetResendMock } from "../helpers/resend-mock";

const WEBHOOK_SECRET_HEADER = "x-webhook-secret";

describe("DocuSeal signature chain (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let contactId: string;

  beforeAll(async () => {
    // Suites run with --runInBand in one process — restore in afterAll so
    // the provider switch cannot leak into other suites.
    process.env.SIGNATURE_PROVIDER = "docuseal";
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    resetResendMock();
    const fixtures = await seedTestFixtures(prisma);
    contactId = fixtures.contact.id;
  });

  afterAll(async () => {
    delete process.env.SIGNATURE_PROVIDER;
    await app.close();
  });

  async function createSentAgreement() {
    const proposalResponse = await request(app.getHttpServer())
      .post("/api/v1/proposals")
      .set(AUTH_HEADER)
      .send({
        contactId,
        title: "DocuSeal Chain Test",
        lineItems: [{ description: "Service A", quantity: 1, unitPrice: 500 }],
      })
      .expect(201);
    const proposalId = proposalResponse.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/proposals/${proposalId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    const proposalDetails = await request(app.getHttpServer())
      .get(`/api/v1/proposals/${proposalId}`)
      .set(AUTH_HEADER)
      .expect(200);
    const publicToken = proposalDetails.body.data.publicToken;

    await request(app.getHttpServer())
      .get(`/api/v1/proposals/public/${publicToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/v1/proposals/public/${publicToken}/accept`)
      .expect(200);

    const agreementResponse = await request(app.getHttpServer())
      .post("/api/v1/agreements")
      .set(AUTH_HEADER)
      .send({
        proposalId,
        contactId,
        title: "DocuSeal Chain Agreement",
        body: "Terms and conditions.",
      })
      .expect(201);
    const agreementId = agreementResponse.body.data.id;

    const sendResponse = await request(app.getHttpServer())
      .post(`/api/v1/agreements/${agreementId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    return {
      agreementId,
      signatureRequestId: sendResponse.body.data.signatureRequestId as string,
      sendData: sendResponse.body.data,
    };
  }

  it("sends via DocuSeal and flips to SIGNED on submission.completed", async () => {
    const { agreementId, signatureRequestId, sendData } =
      await createSentAgreement();

    expect(signatureRequestId).toBeTruthy();
    expect(sendData.signatureProvider).toBe("docuseal");

    await request(app.getHttpServer())
      .post("/api/v1/webhooks/docuseal")
      .set(WEBHOOK_SECRET_HEADER, "test_docuseal_webhook_secret")
      .send({
        event_type: "submission.completed",
        data: { id: Number(signatureRequestId) },
      })
      .expect(200);

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
    });
    expect(agreement?.status).toBe("SIGNED");
    expect(agreement?.signatureStatus).toBe("SIGNED");
    expect(agreement?.signedAt).toBeTruthy();
  });

  it("is idempotent on duplicate completed events", async () => {
    const { agreementId, signatureRequestId } = await createSentAgreement();

    for (const eventType of ["form.completed", "submission.completed"]) {
      await request(app.getHttpServer())
        .post("/api/v1/webhooks/docuseal")
        .set(WEBHOOK_SECRET_HEADER, "test_docuseal_webhook_secret")
        .send({
          event_type: eventType,
          data: { submission_id: signatureRequestId },
        })
        .expect(200);
    }

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
    });
    expect(agreement?.status).toBe("SIGNED");
  });

  it("rejects a missing or wrong webhook secret", async () => {
    const { signatureRequestId } = await createSentAgreement();

    await request(app.getHttpServer())
      .post("/api/v1/webhooks/docuseal")
      .send({
        event_type: "submission.completed",
        data: { id: signatureRequestId },
      })
      .expect(400);

    await request(app.getHttpServer())
      .post("/api/v1/webhooks/docuseal")
      .set(WEBHOOK_SECRET_HEADER, "wrong_secret")
      .send({
        event_type: "submission.completed",
        data: { id: signatureRequestId },
      })
      .expect(400);
  });

  it("acks unknown submission IDs without mutating state", async () => {
    const { agreementId } = await createSentAgreement();

    await request(app.getHttpServer())
      .post("/api/v1/webhooks/docuseal")
      .set(WEBHOOK_SECRET_HEADER, "test_docuseal_webhook_secret")
      .send({
        event_type: "submission.completed",
        data: { id: "999999999" },
      })
      .expect(200);

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
    });
    expect(agreement?.status).toBe("SENT");
  });

  it("ignores irrelevant event types", async () => {
    const { agreementId, signatureRequestId } = await createSentAgreement();

    await request(app.getHttpServer())
      .post("/api/v1/webhooks/docuseal")
      .set(WEBHOOK_SECRET_HEADER, "test_docuseal_webhook_secret")
      .send({
        event_type: "form.viewed",
        data: { submission_id: signatureRequestId },
      })
      .expect(200);

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
    });
    expect(agreement?.status).toBe("SENT");
  });
});
