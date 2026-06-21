import type { AuthToken, User } from "@/lib/types";

const AUTH_TOKEN_KEY = "dataquest_access_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(email: string, password: string): Promise<AuthToken> {
  return authRequest("/auth/register", email, password);
}

export async function login(email: string, password: string): Promise<AuthToken> {
  return authRequest("/auth/login", email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    clearAccessToken();
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load current user: ${response.status}`);
  }

  return response.json();
}

async function authRequest(path: string, email: string, password: string): Promise<AuthToken> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Authentication failed: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return response.json();
}
