"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createForm } from "@/lib/api";
import type { FormSchema } from "@/lib/types";
import { FormSchemaBuilder } from "@/components/forms/form-schema-editor/schema-builder";
import { inputClassName } from "@/components/forms/form-schema-editor/styles";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const initialSchema: FormSchema = {
  title: "Untitled form",
  description: null,
  fields: [
    {
      id: "name",
      type: "text",
      label: "Name",
      required: true,
    },
  ],
};

export function NewFormCreator() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"error" | "success">("success");
  const normalizedSlug = slug.trim();
  const slugError = getSlugError(normalizedSlug);

  async function save(formSchema: FormSchema) {
    setMessage(null);

    if (slugError) {
      setMessageKind("error");
      setMessage(slugError);
      return;
    }

    try {
      const form = await createForm(normalizedSlug, formSchema);
      setMessageKind("success");
      setMessage("Form created.");
      router.refresh();
      router.push(`/forms/${form.slug}/edit`);
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Failed to create form.");
    }
  }

  return (
    <FormSchemaBuilder
      eyebrow="New form"
      initialSchema={initialSchema}
      message={message}
      messageKind={messageKind}
      metrics={[
        { label: "Version", value: "v1" },
        { label: "Starting fields", value: initialSchema.fields.length.toString() },
        { label: "Slug", value: normalizedSlug || "unset" },
      ]}
      metadataSlot={
        <section className="grid gap-4 border border-line bg-panel p-5">
          <div>
            <label className="text-base font-semibold" htmlFor="form-slug">
              Slug
            </label>
            <input
              className={`${inputClassName} mt-2`}
              id="form-slug"
              maxLength={120}
              placeholder="student-feedback"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            {slugError ? <p className="m-0 mt-2 text-sm text-danger">{slugError}</p> : null}
          </div>
        </section>
      }
      saveLabel="Create form"
      savingLabel="Creating"
      submitBlocked={Boolean(slugError)}
      onSave={save}
    />
  );
}

function getSlugError(slug: string): string | null {
  if (slug.length === 0) {
    return "Slug is required.";
  }

  if (slug.length > 120) {
    return "Slug must be 120 characters or fewer.";
  }

  if (!slugPattern.test(slug)) {
    return "Slug must use lowercase letters, numbers, and single hyphens between words.";
  }

  return null;
}
