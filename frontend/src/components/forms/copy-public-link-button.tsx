"use client";

import { useStatusBubble } from "@/components/status-bubble";
import { Button } from "@/components/ui/primitives";

type CopyPublicLinkButtonProps = {
  slug: string;
  className?: string;
  compact?: boolean;
};

export function CopyPublicLinkButton({
  slug,
  className,
  compact = false,
}: CopyPublicLinkButtonProps) {
  const { showStatus } = useStatusBubble();

  async function copyLink() {
    const url = publicFormUrl(slug);

    try {
      await writeClipboardText(url);
      showStatus(
        {
          kind: "success",
          title: "Public link copied",
          detail: url,
        },
        { autoDismissMs: 2800 },
      );
    } catch {
      showStatus(
        {
          kind: "error",
          title: "Copy failed",
          detail: "Select and copy the public URL manually.",
        },
        { autoDismissMs: 5000 },
      );
    }
  }

  return (
    <Button
      className={className}
      variant={compact ? "secondary" : "nav"}
      type="button"
      onClick={copyLink}
    >
      Copy link
    </Button>
  );
}

function publicFormUrl(slug: string): string {
  if (typeof window === "undefined") {
    return `/forms/${slug}`;
  }

  return `${window.location.origin}/forms/${slug}`;
}

async function writeClipboardText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "true");
  textArea.style.position = "fixed";
  textArea.style.top = "-1000px";
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error("copy command failed");
  }
}
