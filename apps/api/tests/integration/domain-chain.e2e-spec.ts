import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "../../src/prisma/prisma.service";
import { ErrorCodes } from "../../src/common/constants/error-codes";
import { expectActivityEvents, getActivityEvents } from "../helpers/activity";
import { cleanDatabase, seedTestFixtures } from "../helpers/db";
import { AUTH_HEADER, createTestApp } from "../helpers/test-app";
import { buildDropboxSignWebhookPayload } from "../helpers/dropbox-sign-webhook";

describe("Domain chain (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let contactId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    const fixtures = await seedTestFixtures(prisma);
    contactId = fixtures.contact.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("runs proposal → agreement → invoice with immutability guards", async () => {
    const proposalResponse = await request(app.getHttpServer())
      .post("/api/v1/proposals")
      .set(AUTH_HEADER)
      .send({
        contactId,
        title: "Day 4 Smoke Test",
        lineItems: [{ description: "Service A", quantity: 2, unitPrice: 500 }],
        taxAmount: 100,
      })
      .expect(201);

    const proposalId = proposalResponse.body.data.id;

    const proposalDetails = await request(app.getHttpServer())
      .get(`/api/v1/proposals/${proposalId}`)
      .set(AUTH_HEADER)
      .expect(200);

    expect(proposalDetails.body.data).toMatchObject({
      subtotal: "1000",
      taxAmount: "100",
      totalAmount: "1100",
      status: "DRAFT",
    });

    await request(app.getHttpServer())
      .post(`/api/v1/proposals/${proposalId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    const proposalImmutable = await request(app.getHttpServer())
      .patch(`/api/v1/proposals/${proposalId}`)
      .set(AUTH_HEADER)
      .send({ title: "Should be blocked" })
      .expect(409);

    expect(proposalImmutable.body.code).toBe(ErrorCodes.RESOURCE_IMMUTABLE);

    const publicToken = proposalDetails.body.data.publicToken;

    const publicView = await request(app.getHttpServer())
      .get(`/api/v1/proposals/public/${publicToken}`)
      .expect(200);

    expect(publicView.body.data.status).toBe("VIEWED");

    await request(app.getHttpServer())
      .post(`/api/v1/proposals/public/${publicToken}/accept`)
      .expect(200);

    const agreementResponse = await request(app.getHttpServer())
      .post("/api/v1/agreements")
      .set(AUTH_HEADER)
      .send({
        proposalId,
        contactId,
        title: "Day 4 Smoke Test Agreement",
        body: "Terms and conditions.",
      })
      .expect(201);

    const agreementId = agreementResponse.body.data.id;

    const agreementSendResponse = await request(app.getHttpServer())
      .post(`/api/v1/agreements/${agreementId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    const signatureRequestId =
      agreementSendResponse.body.data.signatureRequestId;
    expect(signatureRequestId).toBeTruthy();

    await request(app.getHttpServer())
      .post("/api/v1/webhooks/dropbox-sign")
      .send(
        buildDropboxSignWebhookPayload(
          process.env.DROPBOX_SIGN_API_KEY ?? "test_dropbox_sign_key",
          signatureRequestId,
        ),
      )
      .expect(200);

    const agreementImmutable = await request(app.getHttpServer())
      .patch(`/api/v1/agreements/${agreementId}`)
      .set(AUTH_HEADER)
      .send({ title: "Should be blocked" })
      .expect(409);

    expect(agreementImmutable.body.code).toBe(ErrorCodes.RESOURCE_IMMUTABLE);

    const invoiceResponse = await request(app.getHttpServer())
      .post("/api/v1/invoices")
      .set(AUTH_HEADER)
      .send({
        agreementId,
        contactId,
        subtotal: 1100,
        taxAmount: 0,
      })
      .expect(201);

    const invoiceId = invoiceResponse.body.data.id;

    const invoiceDetails = await request(app.getHttpServer())
      .get(`/api/v1/invoices/${invoiceId}`)
      .set(AUTH_HEADER)
      .expect(200);

    expect(invoiceDetails.body.data.number).toMatch(/^INV-\d{4}$/);

    const invoiceSendResponse = await request(app.getHttpServer())
      .post(`/api/v1/invoices/${invoiceId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    expect(invoiceSendResponse.body.data.stripePaymentLinkUrl).toBeTruthy();

    const invoiceImmutable = await request(app.getHttpServer())
      .patch(`/api/v1/invoices/${invoiceId}`)
      .set(AUTH_HEADER)
      .send({ subtotal: 9999 })
      .expect(409);

    expect(invoiceImmutable.body.code).toBe(ErrorCodes.RESOURCE_IMMUTABLE);

    const events = await getActivityEvents(app);
    expectActivityEvents(events, [
      {
        objectType: "proposal",
        objectId: proposalId,
        eventType: "proposal.created",
      },
      {
        objectType: "proposal",
        objectId: proposalId,
        eventType: "proposal.sent",
      },
      {
        objectType: "proposal",
        objectId: proposalId,
        eventType: "proposal.viewed",
      },
      {
        objectType: "proposal",
        objectId: proposalId,
        eventType: "proposal.accepted",
      },
      {
        objectType: "agreement",
        objectId: agreementId,
        eventType: "agreement.created",
      },
      {
        objectType: "agreement",
        objectId: agreementId,
        eventType: "agreement.sent",
      },
      {
        objectType: "agreement",
        objectId: agreementId,
        eventType: "agreement.signed",
      },
      {
        objectType: "invoice",
        objectId: invoiceId,
        eventType: "invoice.created",
      },
      {
        objectType: "invoice",
        objectId: invoiceId,
        eventType: "invoice.sent",
      },
    ]);
  });

  it("rejects agreement creation from a non-ACCEPTED proposal", async () => {
    const proposalResponse = await request(app.getHttpServer())
      .post("/api/v1/proposals")
      .set(AUTH_HEADER)
      .send({
        contactId,
        title: "Guard test proposal",
        lineItems: [{ description: "Service", quantity: 1, unitPrice: 100 }],
      })
      .expect(201);

    const proposalId = proposalResponse.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/proposals/${proposalId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    const response = await request(app.getHttpServer())
      .post("/api/v1/agreements")
      .set(AUTH_HEADER)
      .send({
        proposalId,
        contactId,
        title: "Should fail",
        body: "Terms.",
      })
      .expect(409);

    expect(response.body.code).toBe(ErrorCodes.PRECONDITION_NOT_MET);
  });

  it("rejects invoice creation from a non-SIGNED agreement", async () => {
    const proposalResponse = await request(app.getHttpServer())
      .post("/api/v1/proposals")
      .set(AUTH_HEADER)
      .send({
        contactId,
        title: "Invoice guard proposal",
        lineItems: [{ description: "Service", quantity: 1, unitPrice: 100 }],
      })
      .expect(201);

    const proposalId = proposalResponse.body.data.id;
    const publicToken = proposalResponse.body.data.publicToken;

    await request(app.getHttpServer())
      .post(`/api/v1/proposals/${proposalId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

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
        title: "Unsigned agreement",
        body: "Terms.",
      })
      .expect(201);

    const agreementId = agreementResponse.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/agreements/${agreementId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    const response = await request(app.getHttpServer())
      .post("/api/v1/invoices")
      .set(AUTH_HEADER)
      .send({
        agreementId,
        contactId,
        subtotal: 100,
        taxAmount: 0,
      })
      .expect(409);

    expect(response.body.code).toBe(ErrorCodes.PRECONDITION_NOT_MET);
  });

  it("returns 404 for a missing proposal", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/proposals/00000000-0000-0000-0000-000000000000")
      .set(AUTH_HEADER)
      .expect(404);

    expect(response.body.code).toBe(ErrorCodes.RESOURCE_NOT_FOUND);
  });

  it("rejects invalid state transition when sending an already-sent proposal", async () => {
    const proposalResponse = await request(app.getHttpServer())
      .post("/api/v1/proposals")
      .set(AUTH_HEADER)
      .send({
        contactId,
        title: "Transition test",
        lineItems: [{ description: "Service", quantity: 1, unitPrice: 100 }],
      })
      .expect(201);

    const proposalId = proposalResponse.body.data.id;

    await request(app.getHttpServer())
      .post(`/api/v1/proposals/${proposalId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

    const response = await request(app.getHttpServer())
      .post(`/api/v1/proposals/${proposalId}/send`)
      .set(AUTH_HEADER)
      .expect(409);

    expect(response.body.code).toBe(ErrorCodes.INVALID_STATE_TRANSITION);
  });
});
