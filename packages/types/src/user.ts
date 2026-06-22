export type UserRole = "OWNER" | "ADMIN" | "COLLABORATOR" | "VIEWER";
export type UserStatus = "ACTIVE" | "INVITED" | "DISABLED";

export interface User {
  id: string;
  tenantId: string;
  clerkUserId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}
