import type { Answers, AnswerValue, FormField } from "@/lib/types";

export function initialAnswers(fields: FormField[]): Answers {
  return Object.fromEntries(
    fields.map((field) => [field.id, field.type === "checkbox" ? [] : ""]),
  );
}

export function validateRequiredAnswers(
  requiredFields: string[],
  answers: Answers,
): Record<string, string> {
  return Object.fromEntries(
    requiredFields
      .filter((fieldId) => isEmptyAnswer(answers[fieldId]))
      .map((fieldId) => [fieldId, "This field is required."]),
  );
}

export function compactAnswers(answers: Answers): Answers {
  return Object.fromEntries(
    Object.entries(answers).filter(([, value]) => !isEmptyAnswer(value)),
  );
}

export function isEmptyAnswer(value: AnswerValue): boolean {
  return value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export function stringValue(value: AnswerValue): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
