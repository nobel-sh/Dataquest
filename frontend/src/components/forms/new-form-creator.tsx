"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createForm, generateForm, improveForm } from "@/lib/api";
import type { FormSchema } from "@/lib/types";
import { FormSchemaBuilder } from "@/components/forms/form-schema-editor/schema-builder";
import { ReviewSuggestions } from "@/components/forms/review-suggestions";
import { useReviewSuggestions } from "@/components/forms/use-review-suggestions";
import { useStatusBubble } from "@/components/status-bubble";
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
  const { showStatus } = useStatusBubble();
  const [slug, setSlug] = useState("");
  const [prompt, setPrompt] = useState("");
  const [draftSchema, setDraftSchema] = useState<FormSchema>(initialSchema);
  const [draftRevision, setDraftRevision] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationWarnings, setGenerationWarnings] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"error" | "success">("success");
  const {
    dismissReviewSuggestion,
    isReviewing,
    jumpToReviewField,
    reviewDraft,
    reviewSuggestions,
    visibleReviewSuggestions,
  } = useReviewSuggestions(setMessage, setMessageKind);
  const normalizedSlug = slug.trim();
  const slugError = getSlugError(normalizedSlug);
  const hasGeneratedDraft = draftRevision > 0;

  async function generateDraft() {
    const normalizedPrompt = prompt.trim();

    if (!normalizedPrompt) {
      setMessageKind("error");
      setMessage("Prompt is required.");
      return;
    }

    setIsGenerating(true);
    setMessage(null);
    showStatus({ kind: "loading", title: "Generating draft", detail: "Creating a validated schema." });

    try {
      const result = await generateForm(normalizedPrompt);
      setDraftSchema(result.schema);
      setDraftRevision((current) => current + 1);
      setGenerationWarnings(result.warnings);
      void reviewDraft(result.schema, { quiet: true });
      if (!normalizedSlug) {
        setSlug(slugFromText(result.schema.title, "generated-form"));
      }
      setMessageKind("success");
      setMessage("Generated a draft schema. Review it before creating the form.");
      showStatus(
        {
          kind: "success",
          title: "Draft generated",
          detail: `${result.schema.fields.length.toString()} fields ready to review.`,
        },
        { autoDismissMs: 2800 },
      );
    } catch (error) {
      setMessageKind("error");
      const detail = error instanceof Error ? error.message : "Failed to generate form.";
      setMessage(detail);
      showStatus({ kind: "error", title: "Generation failed", detail }, { autoDismissMs: 5000 });
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
      showStatus({ kind: "loading", title: "Creating form", detail: "Saving the first version." });
      const form = await createForm(normalizedSlug, formSchema);
      setMessageKind("success");
      setMessage("Form created.");
      showStatus(
        { kind: "success", title: "Form created", detail: `/${form.slug}` },
        { autoDismissMs: 2800 },
      );
      router.refresh();
      router.push(`/forms/${form.slug}/edit`);
    } catch (error) {
      setMessageKind("error");
      const detail = error instanceof Error ? error.message : "Failed to create form.";
      setMessage(detail);
      showStatus({ kind: "error", title: "Create failed", detail }, { autoDismissMs: 5000 });
    }
  }

  async function improveDraft(formSchema: FormSchema, instruction: string) {
    setMessage(null);
    showStatus({ kind: "loading", title: "Improving draft", detail: "Updating the schema." });
    try {
      const result = await improveForm(formSchema, instruction);
      setMessageKind("success");
      setMessage("Improved the draft schema. Review it before creating the form.");
      showStatus(
        {
          kind: "success",
          title: "Draft improved",
          detail: `${result.schema.fields.length.toString()} fields ready to review.`,
        },
        { autoDismissMs: 2800 },
      );
      void reviewDraft(result.schema, { quiet: true });
      return result;
    } catch (error) {
      setMessageKind("error");
      const detail = error instanceof Error ? error.message : "Failed to improve draft.";
      setMessage(detail);
      showStatus({ kind: "error", title: "Improve failed", detail }, { autoDismissMs: 5000 });
      throw error;
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
      reviewSuggestions={visibleReviewSuggestions}
      metadataSlot={
        <Card asSection className="grid gap-4 p-5">
          <ReviewSuggestions
            suggestions={visibleReviewSuggestions}
            totalCount={reviewSuggestions.length}
            onDismiss={dismissReviewSuggestion}
            onJumpToField={jumpToReviewField}
          />

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
              onChange={(event) => setSlug(slugInputFromText(event.target.value))}
            />
            {slugError ? <p className="m-0 mt-2 text-sm text-danger">{slugError}</p> : null}
          </div>
        </Card>
      }
      bottomSlot={!hasGeneratedDraft ? (
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
        </Card>
      ) : undefined}
      saveLabel="Create form"
      savingLabel="Creating"
      reviewLabel="Review draft"
      reviewingLabel="Reviewing"
      submitBlocked={Boolean(slugError)}
      onImprove={improveDraft}
      onReview={reviewDraft}
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

function slugFromText(value: string, fallback = ""): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || fallback
  );
}

function slugInputFromText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}
