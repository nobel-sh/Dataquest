import type { FieldType } from "@/lib/types";

export const fieldTypes: FieldType[] = [
  "text",
  "textarea",
  "number",
  "email",
  "phone",
  "date",
  "select",
  "radio",
  "checkbox",
  "rating",
];

export const optionFieldTypes = new Set<FieldType>(["select", "radio", "checkbox"]);
export const rangedFieldTypes = new Set<FieldType>(["number", "rating"]);
export const fieldIdPattern = /^[a-z][a-z0-9_]*$/;
