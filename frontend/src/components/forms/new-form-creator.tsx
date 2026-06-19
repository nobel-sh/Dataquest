"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createForm, generateForm } from "@/lib/api";
import type { FormSchema } from "@/lib/types";
import { FormSchemaBuilder } from "@/components/forms/form-schema-editor/schema-builder";
import {
  inputClassName,
  secondaryButtonClassName,
} from "@/components/forms/form-schema-editor/styles";

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
  const [prompt, setPrompt] = useState("");
  const [draftSchema, setDraftSchema] = useState<FormSchema>(initialSchema);
  const [draftRevision, setDraftRevision] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationWarnings, setGenerationWarnings] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"error" | "success">("success");
  const normalizedSlug = slug.trim();
  const slugError = getSlugError(normalizedSlug);

  async function generateDraft() {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      setMessageKind("error");
      setMessage("Prompt is required.");
      return;
    }

    setIsGenerating(true);
    setMessage(null);

    try {
      const result = await generateForm(normalizedPrompt);
      setDraftSchema(result.schema);
      setDraftRevision((current) => current + 1);
      setGenerationWarnings(result.warnings);
      if (!normalizedSlug) {
        setSlug(slugFromTitle(result.schema.title));
      }
      setMessageKind("success");
      setMessage("Generated a draft schema. Review it before creating the form.");
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Failed to generate form.");
    } finally {
      setIsGenerating(false);
    }
  }

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
      initialSchema={draftSchema}
      key={draftRevision}
      message={message}
      messageKind={messageKind}
      metrics={[
        { label: "Version", value: "v1" },
        { label: "Draft fields", value: draftSchema.fields.length.toString() },
        { label: "Slug", value: normalizedSlug || "unset" },
      ]}
      metadataSlot={
        <section className="grid gap-4 border border-line bg-panel p-5">
          <div>
            <label className="text-base font-semibold" htmlFor="form-prompt">
              AI prompt
            </label>
            <textarea
              className={`${inputClassName} mt-2 min-h-[110px] resize-y`}
              id="form-prompt"
              maxLength={8000}
              placeholder="Create a student feedback survey for a university course."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <div className="mt-3 flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
              <p className="m-0 text-sm text-ink-muted">
                Generated schemas are drafts. Review and edit before creating.
              </p>
              <button
                className={secondaryButtonClassName}
                disabled={isGenerating}
                type="button"
                onClick={generateDraft}
              >
                {isGenerating ? "Generating" : "Generate draft"}
              </button>
            </div>
            {generationWarnings.length > 0 ? (
              <div className="mt-3 border border-line bg-[#181a20] px-4 py-3 text-sm text-ink-muted">
                {generationWarnings.map((warning) => (
                  <div key={warning}>{warning}</div>
                ))}
              </div>
            ) : null}
          </div>

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

function slugFromTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || "generated-form"
  );
}
