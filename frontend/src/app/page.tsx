"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HomeHeader } from "@/components/home/home-header";
import { HomeHero } from "@/components/home/home-hero";
import { RecentSurveys } from "@/components/home/recent-surveys";
import { LinkButton } from "@/components/ui/primitives";
import { pageShellClassName } from "@/components/ui/styles";
import { listForms } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { FormRecord, User } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [recentForms, setRecentForms] = useState<FormRecord[]>([]);
  const [recentFormsError, setRecentFormsError] = useState<string | null>(null);
  const [isLoadingRecentForms, setIsLoadingRecentForms] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentForms() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          if (!cancelled) {
            setCurrentUser(null);
            setRecentForms([]);
          }
          return;
        }

        const forms = await listForms();
        if (!cancelled) {
          setCurrentUser(user);
          setRecentForms(forms.slice(0, 5));
        }
      } catch (error) {
        if (!cancelled) {
          setRecentFormsError(error instanceof Error ? error.message : "Failed to load surveys.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRecentForms(false);
        }
      }
    }

    void loadRecentForms();

    return () => {
      cancelled = true;
    };
  }, []);

  async function copyPublicLink(form: FormRecord) {
    const url = `${window.location.origin}/forms/${form.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedFormId(form.id);
    window.setTimeout(() => {
      setCopiedFormId((currentValue) => (currentValue === form.id ? null : currentValue));
    }, 1500);
  }

  function openForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSlug = slug.trim();
    if (normalizedSlug) {
      router.push(`/forms/${normalizedSlug}`);
    }
  }

  if (!isLoadingRecentForms && !currentUser && !recentFormsError) {
    return (
      <main className={pageShellClassName}>
        <HomeHeader />
        <HomeHero
          eyebrow="Dataquest Forms"
          title="Sign in to build and manage surveys."
          description="Create validated form schemas, edit questions manually, publish public links, and review responses from one workspace."
          slug={slug}
          slugAriaLabel="Public form slug"
          submitLabel="Open public form"
          actions={
            <>
              <LinkButton variant="primary" href="/auth">
                Sign in
              </LinkButton>
              <LinkButton variant="panel" href="/auth">
                Create account
              </LinkButton>
            </>
          }
          onSlugChange={setSlug}
          onSubmit={openForm}
        />
      </main>
    );
  }

  return (
    <main className={pageShellClassName}>
      <HomeHeader />
      <HomeHero
        eyebrow="AI-assisted form builder"
        title="Turn prompts into validated form schemas."
        description="Dataquest keeps generation constrained to structured output, then gives you manual editing, versioning, and response collection without letting AI write arbitrary interface code."
        slug={slug}
        slugAriaLabel="Form slug"
        submitLabel="Open slug"
        actions={
          <>
            <LinkButton variant="primary" href="/forms/new">
              New form
            </LinkButton>
            <LinkButton variant="panel" href="/forms">
              Open workspace
            </LinkButton>
          </>
        }
        onSlugChange={setSlug}
        onSubmit={openForm}
      />

      <RecentSurveys
        copiedFormId={copiedFormId}
        currentUser={currentUser}
        error={recentFormsError}
        forms={recentForms}
        isLoading={isLoadingRecentForms}
        onCopyPublicLink={(form) => void copyPublicLink(form)}
      />
    </main>
  );
}
