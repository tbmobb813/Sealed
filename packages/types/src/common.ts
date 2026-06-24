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
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
  requestId: string;
}

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
}
