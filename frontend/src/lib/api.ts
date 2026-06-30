import { authenticatedFetch } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/config";
import { responseError, statusError } from "@/lib/http-error";
import type {
  Answers,
  FormRecord,
  FormReviewResult,
  FormResponse,
  FormSchema,
  FormVersion,
  GenerateFormResult,
} from "@/lib/types";

export function formResponsesExportUrl(formId: string): string {
  return `${getApiBaseUrl()}/forms/${formId}/responses/export?format=csv`;
}

export async function getFormBySlug(slug: string): Promise<FormRecord | null> {
  return apiJson<FormRecord | null>(
    `/forms/slug/${encodeURIComponent(slug)}`,
    () => ({ cache: "no-store" }),
    "Failed to load form",
    null,
  );
}

export async function createForm(slug: string, formSchema: FormSchema): Promise<FormRecord> {
  return apiJson(
    "/forms",
    () => ({
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ slug, schema: formSchema }),
    }),
    "Failed to create form",
  );
}

export async function listForms(includeArchived = false): Promise<FormRecord[]> {
  const searchParams = new URLSearchParams();
  if (includeArchived) {
    searchParams.set("include_archived", "true");
  }

  const query = searchParams.toString();
  return apiJson(
    `/forms${query ? `?${query}` : ""}`,
    () => ({ cache: "no-store" }),
    "Failed to load forms",
  );
}

export async function updateFormSettings(
  formId: string,
  settings: {
    accepting_responses?: boolean;
    requires_login?: boolean;
    archived?: boolean;
  },
): Promise<FormRecord> {
  return apiJson(
    `/forms/${formId}/settings`,
    () => ({
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(settings),
    }),
    "Failed to update form settings",
  );
}

export async function generateForm(prompt: string): Promise<GenerateFormResult> {
  return apiJson(
    "/forms/generate",
    () => ({
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ prompt }),
    }),
    "Failed to generate form",
  );
}

export async function reviewForm(formSchema: FormSchema): Promise<FormReviewResult> {
  return apiJson(
    "/forms/review",
    () => ({
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ schema: formSchema }),
    }),
    "Failed to review form",
  );
}

export async function submitFormResponse(formId: string, answers: Answers): Promise<FormResponse> {
  return apiJson(
    `/forms/${formId}/responses`,
    () => ({
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ answers }),
    }),
    "Failed to submit response",
  );
}

export async function listFormResponses(formId: string): Promise<FormResponse[]> {
  return apiJson(
    `/forms/${formId}/responses`,
    () => ({ cache: "no-store" }),
    "Failed to load responses",
  );
}

export async function listFormVersions(formId: string): Promise<FormVersion[]> {
  return apiJson(
    `/forms/${formId}/versions`,
    () => ({ cache: "no-store" }),
    "Failed to load form versions",
  );
}

export async function createFormVersion(
  formId: string,
  formSchema: FormSchema,
): Promise<FormRecord> {
  return apiJson(
    `/forms/${formId}/versions`,
    () => ({
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ schema: formSchema }),
    }),
    "Failed to save form version",
  );
}

export async function duplicateForm(formId: string): Promise<FormRecord> {
  return apiJson(
    `/forms/${formId}/duplicate`,
    () => ({
      method: "POST",
    }),
    "Failed to duplicate form",
  );
}

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function apiJson<T>(
  path: string,
  initFactory: () => RequestInit,
  fallbackMessage: string,
  notFoundValue?: T,
): Promise<T> {
  const response = await authenticatedFetch(`${getApiBaseUrl()}${path}`, initFactory);

  if (response.status === 404 && arguments.length === 4) {
    return notFoundValue as T;
  }

  if (!response.ok) {
    const message = `${fallbackMessage}: ${response.status}`;
    throw response.headers.get("content-type")?.includes("application/json")
      ? await responseError(response, message)
      : statusError(response, message);
  }

  return response.json();
}
