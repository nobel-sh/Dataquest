"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFormVersion } from "@/lib/api";
import type { FormRecord, FormSchema } from "@/lib/types";
import { FormSchemaBuilder } from "@/components/forms/form-schema-editor/schema-builder";

type FormSchemaEditorProps = {
  form: FormRecord;
};

export function FormSchemaEditor({ form }: FormSchemaEditorProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"error" | "success">("success");

  async function save(formSchema: FormSchema) {
    setMessage(null);
    try {
      const updatedForm = await createFormVersion(form.id, formSchema);
      setMessageKind("success");
      setMessage(`Saved v${updatedForm.latest_version.version_number.toString()}.`);
      router.refresh();
      router.push(`/forms/${updatedForm.slug}`);
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Failed to save form version.");
    }
  }

  return (
    <FormSchemaBuilder
      eyebrow="Form editor"
      initialSchema={form.latest_version.schema}
      message={message}
      messageKind={messageKind}
      metrics={[
        { label: "Current version", value: `v${form.latest_version.version_number}` },
        { label: "Fields", value: form.latest_version.schema.fields.length.toString() },
        { label: "Slug", value: form.slug },
      ]}
      saveLabel="Save new version"
      savingLabel="Saving"
      onSave={save}
    />
  );
}
