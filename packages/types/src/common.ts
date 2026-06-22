export type ObjectType =
  | "contact"
  | "proposal"
  | "agreement"
  | "invoice"
  | "payment";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
}
