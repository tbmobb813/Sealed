import { auth } from "@clerk/nextjs/server";
import { DEMO_MODE_TOKEN, canInitializeClerk } from "./demo";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface FetchOptions extends RequestInit {
  token?: string | null;
}

async function getToken(): Promise<string | null> {
  if (!canInitializeClerk()) {
    return DEMO_MODE_TOKEN;
  }

  const session = await auth();
  return session.getToken();
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token = options.token ?? (await getToken());

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? `API error: ${response.status}`);
  }

  return response.json();
}

export async function publicApiClient<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1${path}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
