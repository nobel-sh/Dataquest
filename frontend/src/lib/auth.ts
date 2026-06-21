import type { AuthToken, User } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/config";

let refreshSessionPromise: Promise<AuthToken | null> | null = null;

export async function register(email: string, password: string): Promise<AuthToken> {
  return authRequest("/auth/register", email, password);
}

export async function login(email: string, password: string): Promise<AuthToken> {
  return authRequest("/auth/login", email, password);
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionUser = await fetchCurrentUser();
  if (sessionUser) {
    return sessionUser;
  }

  const refreshedSession = await refreshSession();
  if (!refreshedSession) {
    return null;
  }

  return fetchCurrentUser();
}

export async function refreshSession(): Promise<AuthToken | null> {
  if (refreshSessionPromise) {
    return refreshSessionPromise;
  }

  refreshSessionPromise = (async () => {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  })();

  try {
    return await refreshSessionPromise;
  } finally {
    refreshSessionPromise = null;
  }
}

export async function logoutSession(): Promise<void> {
  await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  initFactory: () => RequestInit,
): Promise<Response> {
  const initialResponse = await fetch(input, {
    ...initFactory(),
    credentials: "include",
  });

  if (initialResponse.status !== 401 && initialResponse.status !== 403) {
    return initialResponse;
  }

  const refreshedSession = await refreshSession();
  if (!refreshedSession) {
    return initialResponse;
  }

  const retryResponse = await fetch(input, {
    ...initFactory(),
    credentials: "include",
  });
  return retryResponse;
}

async function authRequest(path: string, email: string, password: string): Promise<AuthToken> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Authentication failed: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return response.json();
}

async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch(`${getApiBaseUrl()}/auth/me`, {
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load current user: ${response.status}`);
  }

  return response.json();
}
