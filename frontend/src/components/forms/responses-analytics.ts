import type { AnswerValue, FormField, FormResponse } from "@/lib/types";

export type FieldAnalytics =
  | {
      kind: "numeric";
      field: FormField;
      answeredCount: number;
      average: number;
      min: number;
      max: number;
    }
  | {
      kind: "options";
      field: FormField;
      answeredCount: number;
      counts: Array<{ label: string; value: string; count: number }>;
    }
  | {
      kind: "text";
      field: FormField;
      answeredCount: number;
      samples: string[];
    };

export type ResponsesAnalytics = {
  latestSubmittedAt: string | null;
  fieldAnalytics: FieldAnalytics[];
};

export function buildResponsesAnalytics(
  fields: FormField[],
  responses: FormResponse[],
): ResponsesAnalytics {
  return {
    latestSubmittedAt: latestSubmittedAt(responses),
    fieldAnalytics: fields.map((field) => buildFieldAnalytics(field, responses)),
  };
}

function latestSubmittedAt(responses: FormResponse[]): string | null {
  return responses.reduce<string | null>((latest, response) => {
    if (!latest || new Date(response.submitted_at) > new Date(latest)) {
      return response.submitted_at;
    }
    return latest;
  }, null);
}

function buildFieldAnalytics(field: FormField, responses: FormResponse[]): FieldAnalytics {
  const values = responses
    .map((response) => response.answers[field.id])
    .filter((value) => !isEmptyAnswer(value));

  if (field.type === "number" || field.type === "rating") {
    const numericValues = values.filter(isNumber);
    return {
      kind: "numeric",
      field,
      answeredCount: numericValues.length,
      average: average(numericValues),
      min: numericValues.length > 0 ? Math.min(...numericValues) : 0,
      max: numericValues.length > 0 ? Math.max(...numericValues) : 0,
    };
  }

  if (field.type === "select" || field.type === "radio" || field.type === "checkbox") {
    return {
      kind: "options",
      field,
      answeredCount: values.length,
      counts: optionCounts(field, values),
    };
  }

  return {
    kind: "text",
    field,
    answeredCount: values.length,
    samples: values.filter(isString).slice(-3).reverse(),
  };
}

function optionCounts(
  field: FormField,
  values: AnswerValue[],
): Array<{ label: string; value: string; count: number }> {
  const countsByValue = new Map<string, number>();

  for (const value of values) {
    const selectedValues = Array.isArray(value) ? value : [value];
    for (const selectedValue of selectedValues) {
      if (typeof selectedValue !== "string") {
        continue;
      }
      countsByValue.set(selectedValue, (countsByValue.get(selectedValue) ?? 0) + 1);
    }
  }

  const knownOptions =
    field.options?.map((option) => ({
      label: option.label,
      value: option.value,
      count: countsByValue.get(option.value) ?? 0,
    })) ?? [];

  const knownValues = new Set(knownOptions.map((option) => option.value));
  const unknownOptions = [...countsByValue.entries()]
    .filter(([value]) => !knownValues.has(value))
    .map(([value, count]) => ({ label: value, value, count }));

  return [...knownOptions, ...unknownOptions].sort((first, second) => second.count - first.count);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isEmptyAnswer(value: AnswerValue | undefined): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function isNumber(value: AnswerValue): value is number {
  return typeof value === "number";
}

function isString(value: AnswerValue): value is string {
  return typeof value === "string";
}
