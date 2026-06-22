export type ClerkWebhookEvent = {
  type: string;
  data: ClerkUserPayload;
};

export type ClerkUserPayload = {
  id: string;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{ id: string; email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
};
