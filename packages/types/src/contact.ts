export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}
