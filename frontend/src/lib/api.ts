import { authenticatedFetch } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/config";
import type {
  Answers,
  FormRecord,
  FormResponse,
  FormSchema,
  FormVersion,
  GenerateFormResult,
} from "@/lib/types";

export function formResponsesExportUrl(formId: string): string {
  return `${getApiBaseUrl()}/forms/${formId}/responses/export?format=csv`;
}

export async function getFormBySlug(slug: string): Promise<FormRecord | null> {
  const response = await authenticatedFetch(
    `${getApiBaseUrl()}/forms/slug/${encodeURIComponent(slug)}`,
    () => ({
      cache: "no-store",
    }),
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load form: ${response.status}`);
  }

  return response.json();
}

export async function createForm(slug: string, formSchema: FormSchema): Promise<FormRecord> {
  const response = await authenticatedFetch(`${getApiBaseUrl()}/forms`, () => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug, schema: formSchema }),
  }));

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Failed to create form: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return response.json();
}

export async function listForms(includeArchived = false): Promise<FormRecord[]> {
  const searchParams = new URLSearchParams();
  if (includeArchived) {
    searchParams.set("include_archived", "true");
  }
  const query = searchParams.toString();
  const response = await authenticatedFetch(
    `${getApiBaseUrl()}/forms${query ? `?${query}` : ""}`,
    () => ({
      cache: "no-store",
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to load forms: ${response.status}`);
  }

  return response.json();
}

export async function updateFormSettings(
  formId: string,
  settings: {
    accepting_responses?: boolean;
    requires_login?: boolean;
    archived?: boolean;
  },
): Promise<FormRecord> {
  const response = await authenticatedFetch(
    `${getApiBaseUrl()}/forms/${formId}/settings`,
    () => ({
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    }),
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Failed to update form settings: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return response.json();
}

export async function generateForm(prompt: string): Promise<GenerateFormResult> {
  const response = await authenticatedFetch(`${getApiBaseUrl()}/forms/generate`, () => ({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  }));

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Failed to generate form: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return response.json();
}

export async function submitFormResponse(formId: string, answers: Answers): Promise<FormResponse> {
  const response = await authenticatedFetch(
    `${getApiBaseUrl()}/forms/${formId}/responses`,
    () => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    }),
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Failed to submit response: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : "Failed to submit response");
  }

  return response.json();
}

export async function listFormResponses(formId: string): Promise<FormResponse[]> {
  const response = await authenticatedFetch(
    `${getApiBaseUrl()}/forms/${formId}/responses`,
    () => ({
      cache: "no-store",
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to load responses: ${response.status}`);
  }

  return response.json();
}

export async function listFormVersions(formId: string): Promise<FormVersion[]> {
  const response = await authenticatedFetch(
    `${getApiBaseUrl()}/forms/${formId}/versions`,
    () => ({
      cache: "no-store",
    }),
  );

  if (!response.ok) {
    throw new Error(`Failed to load form versions: ${response.status}`);
  }

  return response.json();
}

export async function createFormVersion(
  formId: string,
  formSchema: FormSchema,
): Promise<FormRecord> {
  const response = await authenticatedFetch(
    `${getApiBaseUrl()}/forms/${formId}/versions`,
    () => ({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ schema: formSchema }),
    }),
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `Failed to save form version: ${response.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  return response.json();
}
