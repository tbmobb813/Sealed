export interface ActivityEventActor {
  id: string;
  name: string;
  email: string;
}

export interface ActivityEvent {
  id: string;
  tenantId: string;
  actorId: string | null;
  actorType: string;
  objectType: string;
  objectId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor?: ActivityEventActor | null;
}
