"use client";

import { useState } from "react";
import { reviewForm } from "@/lib/api";
import type { FormReviewSuggestion, FormSchema } from "@/lib/types";
import { fieldTargetId } from "@/components/forms/form-schema-editor/field-editor";
import { reviewSuggestionKey } from "@/components/forms/review-suggestions";
import { useStatusBubble } from "@/components/status-bubble";

type MessageKind = "error" | "success";

export function useReviewSuggestions(
  setMessage: (message: string | null) => void,
  setMessageKind: (kind: MessageKind) => void,
) {
  const { showStatus } = useStatusBubble();
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewSuggestions, setReviewSuggestions] = useState<FormReviewSuggestion[]>([]);
  const [dismissedSuggestionKeys, setDismissedSuggestionKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const visibleReviewSuggestions = reviewSuggestions.filter(
    (suggestion) => !dismissedSuggestionKeys.has(reviewSuggestionKey(suggestion)),
  );

  async function reviewDraft(formSchema: FormSchema, options: { quiet?: boolean } = {}) {
    setIsReviewing(true);
    if (!options.quiet) {
      setMessage(null);
      showStatus({ kind: "loading", title: "Reviewing draft", detail: "Checking form quality." });
    }

    try {
      const result = await reviewForm(formSchema);
      setReviewSuggestions(result.suggestions);
      setDismissedSuggestionKeys(new Set());
      if (!options.quiet) {
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
      }
    } catch (error) {
      if (!options.quiet) {
        setMessageKind("error");
        const detail = error instanceof Error ? error.message : "Failed to review form.";
        setMessage(detail);
        showStatus({ kind: "error", title: "Review failed", detail }, { autoDismissMs: 5000 });
      }
    } finally {
      setIsReviewing(false);
    }
  }

  function dismissReviewSuggestion(suggestion: FormReviewSuggestion) {
    setDismissedSuggestionKeys((current) => new Set(current).add(reviewSuggestionKey(suggestion)));
  }

  function jumpToReviewField(fieldId: string) {
    document.getElementById(fieldTargetId(fieldId))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return {
    dismissReviewSuggestion,
    isReviewing,
    jumpToReviewField,
    reviewDraft,
    reviewSuggestions,
    visibleReviewSuggestions,
  };
}
