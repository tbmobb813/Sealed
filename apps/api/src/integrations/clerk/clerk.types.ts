export type ClerkWebhookEvent = {
  type: string;
  data: ClerkUserPayload;
};

export type ClerkUserPayload = {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
};
