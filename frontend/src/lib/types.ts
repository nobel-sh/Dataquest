export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "rating";

export type FieldOption = {
  label: string;
  value: string;
};

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  description?: string | null;
  placeholder?: string | null;
  options?: FieldOption[] | null;
  min?: number | null;
  max?: number | null;
};

export type FormSchema = {
  title: string;
  description?: string | null;
  fields: FormField[];
};

export type GenerateFormResult = {
  schema: FormSchema;
  warnings: string[];
};

export type FormVersion = {
  id: string;
  form_id: string;
  version_number: number;
  schema: FormSchema;
  created_at: string;
};

export type FormRecord = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
  latest_version: FormVersion;
};

export type AnswerValue = string | number | boolean | string[] | null;
export type Answers = Record<string, AnswerValue>;

export type FormResponse = {
  id: string;
  form_id: string;
  form_version_id: string;
  answers: Answers;
  submitted_at: string;
};

export type User = {
  id: string;
  email: string;
};

export type AuthToken = {
  access_token: string;
  token_type: "bearer";
  user: User;
};
