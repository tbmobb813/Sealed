import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PrismaService } from "../../src/prisma/prisma.service";
import { ErrorCodes } from "../../src/common/constants/error-codes";
import { expectActivityEvents, getActivityEvents } from "../helpers/activity";
import { cleanDatabase, seedTestFixtures } from "../helpers/db";
import { AUTH_HEADER, createTestApp } from "../helpers/test-app";

describe("Contacts (integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    await seedTestFixtures(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it("lists contacts for the tenant", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/v1/contacts")
      .set(AUTH_HEADER)
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      name: "Jane Client",
      email: "jane@example.com",
    });
  });

  it("creates, updates, and deletes a contact", async () => {
    const createResponse = await request(app.getHttpServer())
      .post("/api/v1/contacts")
      .set(AUTH_HEADER)
      .send({
        name: "Jane Smith",
        email: "jane2@example.com",
        phone: "+12125550100",
        companyName: "Acme Corp",
      })
      .expect(201);

    const contactId = createResponse.body.data.id;

    await request(app.getHttpServer())
      .get(`/api/v1/contacts/${contactId}`)
      .set(AUTH_HEADER)
      .expect(200);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/v1/contacts/${contactId}`)
      .set(AUTH_HEADER)
      .send({ companyName: "Acme Corp (Updated)" })
      .expect(200);

    expect(updateResponse.body.data.companyName).toBe("Acme Corp (Updated)");

    await request(app.getHttpServer())
      .delete(`/api/v1/contacts/${contactId}`)
      .set(AUTH_HEADER)
      .expect(200)
      .expect((response) => {
        expect(response.body.data).toEqual({ id: contactId });
      });

    const notFound = await request(app.getHttpServer())
      .get(`/api/v1/contacts/${contactId}`)
      .set(AUTH_HEADER)
      .expect(404);

    expect(notFound.body.code).toBe(ErrorCodes.RESOURCE_NOT_FOUND);

    const events = await getActivityEvents(app);
    expectActivityEvents(events, [
      {
        objectType: "contact",
        objectId: contactId,
        eventType: "contact.created",
        metadata: { name: "Jane Smith", email: "jane2@example.com" },
      },
      {
        objectType: "contact",
        objectId: contactId,
        eventType: "contact.updated",
        metadata: { name: "Jane Smith", email: "jane2@example.com" },
      },
      {
        objectType: "contact",
        objectId: contactId,
        eventType: "contact.deleted",
        metadata: { name: "Jane Smith", email: "jane2@example.com" },
      },
    ]);
  });
});
