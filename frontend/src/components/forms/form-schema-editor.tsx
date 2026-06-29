"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFormVersion, reviewForm } from "@/lib/api";
import type { FormRecord, FormReviewSuggestion, FormSchema } from "@/lib/types";
import { fieldTargetId } from "@/components/forms/form-schema-editor/field-editor";
import { FormSchemaBuilder } from "@/components/forms/form-schema-editor/schema-builder";
import { ReviewSuggestions, reviewSuggestionKey } from "@/components/forms/review-suggestions";
import { useStatusBubble } from "@/components/status-bubble";

type FormSchemaEditorProps = {
  form: FormRecord;
};

export function FormSchemaEditor({ form }: FormSchemaEditorProps) {
  const router = useRouter();
  const { showStatus } = useStatusBubble();
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"error" | "success">("success");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewSuggestions, setReviewSuggestions] = useState<FormReviewSuggestion[]>([]);
  const [dismissedSuggestionKeys, setDismissedSuggestionKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const visibleReviewSuggestions = reviewSuggestions.filter(
    (suggestion) => !dismissedSuggestionKeys.has(reviewSuggestionKey(suggestion)),
  );

  async function reviewDraft(formSchema: FormSchema) {
    setIsReviewing(true);
    setMessage(null);
    showStatus({ kind: "loading", title: "Reviewing draft", detail: "Checking form quality." });

    try {
      const result = await reviewForm(formSchema);
      setReviewSuggestions(result.suggestions);
      setDismissedSuggestionKeys(new Set());
      setMessageKind("success");
      setMessage(
        result.suggestions.length > 0
          ? "Reviewed the current draft."
          : "Reviewed the current draft. No suggestions found.",
      );
      showStatus(
        {
          kind: "success",
          title: "Review complete",
          detail:
            result.suggestions.length > 0
              ? `${result.suggestions.length.toString()} suggestions found.`
              : "No suggestions found.",
        },
        { autoDismissMs: 2800 },
      );
    } catch (error) {
      setMessageKind("error");
      const detail = error instanceof Error ? error.message : "Failed to review form.";
      setMessage(detail);
      showStatus({ kind: "error", title: "Review failed", detail }, { autoDismissMs: 5000 });
    } finally {
      setIsReviewing(false);
    }
  }

  function dismissReviewSuggestion(suggestion: FormReviewSuggestion) {
    setDismissedSuggestionKeys((current) => {
      const next = new Set(current);
      next.add(reviewSuggestionKey(suggestion));
      return next;
    });
  }

  function jumpToReviewField(fieldId: string) {
    document.getElementById(fieldTargetId(fieldId))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function save(formSchema: FormSchema) {
    setMessage(null);
    try {
      showStatus({ kind: "loading", title: "Saving version", detail: "Creating a new form version." });
      const updatedForm = await createFormVersion(form.id, formSchema);
      setMessageKind("success");
      setMessage(`Saved v${updatedForm.latest_version.version_number.toString()}.`);
      showStatus(
        {
          kind: "success",
          title: "Version saved",
          detail: `v${updatedForm.latest_version.version_number.toString()} is now current.`,
        },
        { autoDismissMs: 2800 },
      );
      router.refresh();
      router.push(`/forms/${updatedForm.slug}`);
    } catch (error) {
      setMessageKind("error");
      const detail = error instanceof Error ? error.message : "Failed to save form version.";
      setMessage(detail);
      showStatus({ kind: "error", title: "Save failed", detail }, { autoDismissMs: 5000 });
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
      isReviewing={isReviewing}
      reviewSuggestions={visibleReviewSuggestions}
      metadataSlot={
        <ReviewSuggestions
          suggestions={visibleReviewSuggestions}
          totalCount={reviewSuggestions.length}
          onDismiss={dismissReviewSuggestion}
          onJumpToField={jumpToReviewField}
        />
      }
      reviewLabel="Review draft"
      reviewingLabel="Reviewing"
      onReview={reviewDraft}
      saveLabel="Save new version"
      savingLabel="Saving"
      onSave={save}
    />
  );
}
