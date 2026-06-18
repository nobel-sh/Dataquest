import type { Answers, FormRecord, FormResponse } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function getFormBySlug(slug: string): Promise<FormRecord | null> {
  const response = await fetch(`${API_BASE_URL}/forms/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load form: ${response.status}`);
  }

  return response.json();
}

export async function submitFormResponse(formId: string, answers: Answers): Promise<FormResponse> {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Failed to submit response: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : "Failed to submit response");
  }

  return response.json();
}
