import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "../../src/prisma/prisma.service";
import { ErrorCodes } from "../../src/common/constants/error-codes";
import { expectActivityEvents, getActivityEvents } from "../helpers/activity";
import { cleanDatabase, seedTestFixtures } from "../helpers/db";
import { AUTH_HEADER, createTestApp } from "../helpers/test-app";

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

    await request(app.getHttpServer())
      .post(`/api/v1/agreements/${agreementId}/send`)
      .set(AUTH_HEADER)
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

    await request(app.getHttpServer())
      .post(`/api/v1/invoices/${invoiceId}/send`)
      .set(AUTH_HEADER)
      .expect(200);

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
