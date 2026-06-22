export interface Tenant {
  id: string;
  name: string;
  slug: string;
  brandColor: string | null;
  logoUrl: string | null;
  defaultCurrency: string;
  timezone: string;
  stripeAccountId: string | null;
  signatureProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  brandColor?: string;
  logoUrl?: string;
}
