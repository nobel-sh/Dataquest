import type { FormReviewSuggestion } from "@/lib/types";

type ReviewSuggestionsProps = {
  suggestions: FormReviewSuggestion[];
  totalCount: number;
  onDismiss: (suggestion: FormReviewSuggestion) => void;
  onJumpToField: (fieldId: string) => void;
};

export function ReviewSuggestions({
  suggestions,
  totalCount,
  onDismiss,
  onJumpToField,
}: ReviewSuggestionsProps) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <section className="border border-line bg-[#181a20] px-4 py-4">
      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
        <h2 className="m-0 font-display text-xl">Review suggestions</h2>
        <span className="text-sm uppercase text-ink-muted">
          {suggestions.length} active / {totalCount} found
        </span>
      </div>
      {suggestions.length === 0 ? (
        <p className="m-0 mt-3 text-sm text-ink-muted">
          All review suggestions are dismissed. Run review again to refresh them.
        </p>
      ) : (
        <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-sm">
          {suggestions.map((suggestion) => (
            <li
              className="grid gap-3 border border-line bg-panel px-3 py-3"
              key={reviewSuggestionKey(suggestion)}
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
              <div className="flex flex-wrap gap-2">
                {suggestion.field_id ? (
                  <button
                    className="border border-line bg-[#30333d] px-3 py-2 text-xs uppercase text-ink transition hover:bg-[#3b3e49]"
                    type="button"
                    onClick={() => {
                      if (suggestion.field_id) {
                        onJumpToField(suggestion.field_id);
                      }
                    }}
                  >
                    Jump to field
                  </button>
                ) : null}
                <button
                  className="border border-line bg-[#30333d] px-3 py-2 text-xs uppercase text-ink-muted transition hover:bg-[#3b3e49] hover:text-ink"
                  type="button"
                  onClick={() => onDismiss(suggestion)}
                >
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function reviewSuggestionKey(suggestion: FormReviewSuggestion): string {
  return [suggestion.field_id ?? "form", suggestion.severity, suggestion.message].join("|");
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
