"use client";

import { useEffect, useState } from "react";
import { DuplicateFormButton } from "@/components/forms/duplicate-form-button";
import { CopyPublicLinkButton } from "@/components/forms/copy-public-link-button";
import { LinkButton } from "@/components/ui/primitives";
import { getCurrentUser } from "@/lib/auth";

type FormPageActionsProps = {
  formId: string;
  ownerId?: string | null;
  slug: string;
};

export function FormPageActions({ formId, ownerId, slug }: FormPageActionsProps) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOwnerState() {
      if (!ownerId) {
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!cancelled) {
          setIsOwner(user?.id === ownerId);
        }
      } catch {
        if (!cancelled) {
          setIsOwner(false);
        }
      }
    }

    void loadOwnerState();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  if (!isOwner) {
    return null;
  }

  return (
    <>
      <CopyPublicLinkButton slug={slug} />
      <DuplicateFormButton compact formId={formId} formSlug={slug} />
      <LinkButton variant="nav" href={`/forms/${slug}/edit`}>
        Edit
      </LinkButton>
      <LinkButton variant="nav" href={`/forms/${slug}/responses`}>
        Responses
      </LinkButton>
    </>
  );
}
