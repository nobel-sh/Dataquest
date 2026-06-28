import type { AnswerValue, FieldOption, FormField } from "@/lib/types";

export function formatAnswer(value: AnswerValue | undefined, field: FormField): string {
  if (value === undefined || value === null || value === "") {
    return "No answer";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "No answer";
    }
    return value.map((item) => optionLabel(item, field.options)).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return optionLabel(String(value), field.options);
}

export function formatVersion(
  versionId: string,
  versionNumbersById: Record<string, number> = {},
): string {
  const versionNumber = versionNumbersById[versionId];
  return versionNumber === undefined ? "Unknown" : `v${versionNumber.toString()}`;
}

function optionLabel(value: string, options: FieldOption[] | null | undefined): string {
  return options?.find((option) => option.value === value)?.label ?? value;
}
