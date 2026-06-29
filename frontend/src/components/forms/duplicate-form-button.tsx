"use client";

import { useRouter } from "next/navigation";
import { duplicateForm } from "@/lib/api";
import { useStatusBubble } from "@/components/status-bubble";
import { Button } from "@/components/ui/primitives";
import { DuplicateIcon } from "@/components/forms/dashboard-icons";

type DuplicateFormButtonProps = {
  formId: string;
  formSlug: string;
  className?: string;
  compact?: boolean;
};

export function DuplicateFormButton({
  formId,
  formSlug,
  className,
  compact = false,
}: DuplicateFormButtonProps) {
  const router = useRouter();
  const { showStatus } = useStatusBubble();

  async function duplicate() {
    showStatus({
      kind: "loading",
      title: "Duplicating form",
      detail: "Creating a copy with a new slug.",
    });

    try {
      const copy = await duplicateForm(formId);
      showStatus(
        {
          kind: "success",
          title: "Form duplicated",
          detail: `/${copy.slug}`,
        },
        { autoDismissMs: 2800 },
      );
      router.push(`/forms/${copy.slug}/edit`);
    } catch {
      showStatus(
        {
          kind: "error",
          title: "Duplicate failed",
          detail: "The form copy could not be created.",
        },
        { autoDismissMs: 5000 },
      );
    }
  }

  return (
    <Button
      className={className}
      variant={compact ? "secondary" : "nav"}
      title={`Duplicate ${formSlug}`}
      type="button"
      onClick={() => void duplicate()}
    >
      <span className="flex items-center gap-2">
        <DuplicateIcon />
        <span>{compact ? "Duplicate" : "Duplicate form"}</span>
      </span>
    </Button>
  );
}
