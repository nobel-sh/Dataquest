"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createForm, generateForm, reviewForm } from "@/lib/api";
import type { FormReviewSuggestion, FormSchema } from "@/lib/types";
import { FormSchemaBuilder } from "@/components/forms/form-schema-editor/schema-builder";
import { Button, Card, TextArea, TextInput } from "@/components/ui/primitives";

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
  const [isReviewing, setIsReviewing] = useState(false);
  const [generationWarnings, setGenerationWarnings] = useState<string[]>([]);
  const [reviewSuggestions, setReviewSuggestions] = useState<FormReviewSuggestion[]>([]);
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
      void reviewDraft(result.schema, { quiet: true });
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

  async function reviewDraft(formSchema: FormSchema, options: { quiet?: boolean } = {}) {
    setIsReviewing(true);
    if (!options.quiet) {
      setMessage(null);
    }

    try {
      const result = await reviewForm(formSchema);
      setReviewSuggestions(result.suggestions);
      if (!options.quiet) {
        setMessageKind("success");
        setMessage(
          result.suggestions.length > 0
            ? "Reviewed the current draft."
            : "Reviewed the current draft. No suggestions found.",
        );
      }
    } catch (error) {
      if (!options.quiet) {
        setMessageKind("error");
        setMessage(error instanceof Error ? error.message : "Failed to review form.");
      }
    } finally {
      setIsReviewing(false);
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
      isReviewing={isReviewing}
      metadataSlot={
        <Card asSection className="grid gap-4 p-5">
          <div>
            <label className="text-base font-semibold" htmlFor="form-prompt">
              AI prompt
            </label>
            <TextArea
              className="mt-2 min-h-[110px] resize-y"
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
              <Button
                variant="secondary"
                disabled={isGenerating}
                type="button"
                onClick={generateDraft}
              >
                {isGenerating ? "Generating" : "Generate draft"}
              </Button>
            </div>
            {generationWarnings.length > 0 ? (
              <div className="mt-3 border border-line bg-[#181a20] px-4 py-3 text-sm text-ink-muted">
                {generationWarnings.map((warning) => (
                  <div key={warning}>{warning}</div>
                ))}
              </div>
            ) : null}
          </div>

          <ReviewSuggestions suggestions={reviewSuggestions} />

          <div>
            <label className="text-base font-semibold" htmlFor="form-slug">
              Slug
            </label>
            <TextInput
              className="mt-2"
              id="form-slug"
              maxLength={120}
              placeholder="student-feedback"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            {slugError ? <p className="m-0 mt-2 text-sm text-danger">{slugError}</p> : null}
          </div>
        </Card>
      }
      saveLabel="Create form"
      savingLabel="Creating"
      reviewLabel="Review draft"
      reviewingLabel="Reviewing"
      submitBlocked={Boolean(slugError)}
      onReview={reviewDraft}
      onSave={save}
    />
  );
}

function ReviewSuggestions({ suggestions }: { suggestions: FormReviewSuggestion[] }) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <section className="border border-line bg-[#181a20] px-4 py-4">
      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
        <h2 className="m-0 font-display text-xl">Review suggestions</h2>
        <span className="text-sm uppercase text-ink-muted">{suggestions.length} found</span>
      </div>
      <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-sm">
        {suggestions.map((suggestion, index) => (
          <li
            className="grid gap-1 border border-line bg-panel px-3 py-3"
            key={`${suggestion.field_id ?? "form"}-${suggestion.severity}-${index.toString()}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className={reviewBadgeClassName(suggestion.severity)}>
                {suggestion.severity}
              </span>
              {suggestion.field_id ? (
                <code className="text-xs text-ink-muted">{suggestion.field_id}</code>
              ) : null}
            </div>
            <p className="m-0 text-ink-muted">{suggestion.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function reviewBadgeClassName(severity: FormReviewSuggestion["severity"]): string {
  const baseClassName = "border px-2 py-1 text-xs uppercase";

  if (severity === "error") {
    return `${baseClassName} border-line-error bg-error text-danger`;
  }

  if (severity === "warning") {
    return `${baseClassName} border-[#fdd663] bg-[#3a3420] text-[#fdd663]`;
  }

  return `${baseClassName} border-line-success bg-success text-line-success`;
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
