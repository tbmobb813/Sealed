import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AUTH_HEADER } from "./test-app";

export type ActivityEventRecord = {
  objectType: string;
  objectId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
};

export async function getActivityEvents(
  app: INestApplication,
): Promise<ActivityEventRecord[]> {
  const response = await request(app.getHttpServer())
    .get("/api/v1/activity")
    .set(AUTH_HEADER)
    .expect(200);

  return response.body.data;
}

export function expectActivityEvent(
  events: ActivityEventRecord[],
  expected: ActivityEventRecord,
): void {
  const match = events.find(
    (event) =>
      event.objectType === expected.objectType &&
      event.objectId === expected.objectId &&
      event.eventType === expected.eventType,
  );

  expect(match).toBeDefined();

  if (expected.metadata) {
    expect(match?.metadata).toMatchObject(expected.metadata);
  }
}

export function expectActivityEvents(
  events: ActivityEventRecord[],
  expectedEvents: ActivityEventRecord[],
): void {
  for (const expected of expectedEvents) {
    expectActivityEvent(events, expected);
  }
}
