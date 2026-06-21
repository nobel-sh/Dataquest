"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBrand } from "@/components/app-brand";
import { listForms } from "@/lib/api";
import type { FormRecord } from "@/lib/types";

const linkButtonClassName =
  "inline-flex min-h-control items-center justify-center border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-ink-onDark";

const primaryLinkClassName =
  "inline-flex min-h-control items-center justify-center border border-accent bg-accent px-5 py-2 text-sm font-bold tracking-wide text-ink-button shadow-[0_8px_18px_rgba(161,66,244,0.22)] transition hover:border-accent-hover hover:bg-accent-hover";

export default function HomePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [recentForms, setRecentForms] = useState<FormRecord[]>([]);
  const [recentFormsError, setRecentFormsError] = useState<string | null>(null);
  const [isLoadingRecentForms, setIsLoadingRecentForms] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentForms() {
      try {
        const forms = await listForms();
        if (!cancelled) {
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

  function openForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSlug = slug.trim();
    if (normalizedSlug) {
      router.push(`/forms/${normalizedSlug}`);
    }
  }

  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <header className="mb-8 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <AppBrand bold={false} />
          <div className="text-ink-onDark/75">Schema-first forms, generated and edited safely.</div>
        </div>
        <nav className="flex gap-2 max-sm:w-full max-sm:flex-col">
          <Link className={linkButtonClassName} href="/forms">
            My forms
          </Link>
          <Link className={linkButtonClassName} href="/auth">
            Account
          </Link>
        </nav>
      </header>

      <section className="relative grid min-h-[560px] overflow-hidden border border-line bg-[#181a20] p-8 shadow-panel max-sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative grid max-w-[760px] content-between gap-10">
          <div>
            <div className="mb-5 inline-flex border border-line bg-panel px-3 py-2 text-xs uppercase text-ink-muted">
              AI-assisted form builder
            </div>
            <h1 className="m-0 font-display text-5xl leading-tight max-sm:text-4xl">
              Turn prompts into validated form schemas.
            </h1>
            <p className="mt-5 text-lg leading-8 text-ink-muted max-sm:text-base max-sm:leading-7">
              Dataquest keeps generation constrained to structured output, then gives you manual
              editing, versioning, and response collection without letting AI write arbitrary
              interface code.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="flex gap-3 max-sm:flex-col">
              <Link className={primaryLinkClassName} href="/forms/new">
                New form
              </Link>
              <Link className={linkButtonClassName} href="/forms">
                Open workspace
              </Link>
            </div>

            <form
              className="grid max-w-[640px] grid-cols-[1fr_auto] border border-line bg-panel max-sm:grid-cols-1"
              onSubmit={openForm}
            >
              <input
                className="min-h-control min-w-0 border-0 border-r border-line bg-[#30333d] px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted/70 focus:bg-[#333642] focus:shadow-focus max-sm:border-b max-sm:border-r-0"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="student-feedback"
                aria-label="Form slug"
              />
              <button
                className="min-h-control border-0 bg-[#30333d] px-5 py-3 font-semibold text-ink transition hover:bg-[#333642] hover:text-ink-onDark focus:shadow-focus"
                type="submit"
              >
                Open slug
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mt-5 border border-line bg-panel shadow-panel">
        <header className="flex items-center justify-between gap-4 border-b border-line p-5 max-sm:flex-col max-sm:items-start">
          <div>
            <h2 className="m-0 font-display text-2xl leading-tight">Recent surveys</h2>
            <div className="mt-1 text-sm text-ink-muted">The latest forms in your workspace.</div>
          </div>
          <Link className={linkButtonClassName} href="/forms">
            View all
          </Link>
        </header>

        <div className="bg-[#181a20] p-5">
          {isLoadingRecentForms ? (
            <div className="border border-line bg-panel p-4 text-ink-muted">Loading surveys...</div>
          ) : recentFormsError ? (
            <div className="border border-line bg-panel p-4 text-ink-muted">
              Login to see your recent surveys.
            </div>
          ) : recentForms.length === 0 ? (
            <div className="border border-line bg-panel p-4 text-ink-muted">
              No surveys yet. Create your first form to start collecting responses.
            </div>
          ) : (
            <div className="grid gap-2">
              {recentForms.map((form) => (
                <Link
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border border-line bg-panel p-4 transition hover:border-accent hover:bg-[#262932] max-md:grid-cols-2 max-sm:grid-cols-1"
                  href={`/forms/${form.slug}`}
                  key={form.id}
                >
                  <div className="min-w-0">
                    <div className="truncate font-display text-xl leading-tight">{form.title}</div>
                    <div className="mt-1 truncate text-sm text-ink-muted">/{form.slug}</div>
                  </div>
                  <RecentSurveyMeta label="Responses" value={form.response_count.toString()} />
                  <RecentSurveyMeta
                    label="Status"
                    value={form.accepting_responses ? "Open" : "Closed"}
                  />
                  <RecentSurveyMeta label="Access" value={form.requires_login ? "Login" : "Public"} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function RecentSurveyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[96px] border-l border-line pl-4 text-sm max-md:border-l-0 max-md:pl-0">
      <div className="font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs uppercase text-ink-muted">{label}</div>
    </div>
  );
}
