"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFormVersion } from "@/lib/api";
import type { FormRecord, FormSchema } from "@/lib/types";
import { FormSchemaBuilder } from "@/components/forms/form-schema-editor/schema-builder";
import { ReviewSuggestions } from "@/components/forms/review-suggestions";
import { useReviewSuggestions } from "@/components/forms/use-review-suggestions";
import { useStatusBubble } from "@/components/status-bubble";

type FormSchemaEditorProps = {
  form: FormRecord;
};

export function FormSchemaEditor({ form }: FormSchemaEditorProps) {
  const router = useRouter();
  const { showStatus } = useStatusBubble();
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
