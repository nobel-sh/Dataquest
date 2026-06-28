import type { FormRecord } from "@/lib/types";

export type DashboardView = "active" | "archived";

export function latestVersionLabel(forms: FormRecord[]): string {
  if (forms.length === 0) {
    return "none";
  }

  return `v${Math.max(...forms.map((form) => form.latest_version.version_number)).toString()}`;
}

export function filterFormsForView(forms: FormRecord[], view: DashboardView): FormRecord[] {
  return forms.filter((form) => form.archived === (view === "archived"));
}
