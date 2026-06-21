"use client";

import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { AppBrand } from "@/components/app-brand";
import { listForms } from "@/lib/api";
import { getCurrentUser, logoutSession } from "@/lib/auth";
import type { FormRecord, User } from "@/lib/types";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  async function logout() {
    await logoutSession();
    setCurrentUser(null);
    setRecentForms([]);
  }

  function openForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSlug = slug.trim();
    if (normalizedSlug) {
      router.push(`/forms/${normalizedSlug}`);
    }
  }

  if (!isLoadingRecentForms && !currentUser && !recentFormsError) {
    return <LoggedOutHome openForm={openForm} setSlug={setSlug} slug={slug} />;
  }

  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <header className="mb-8 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <AppBrand bold={false} />
        </div>
        <nav className="flex items-center gap-2 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
          {currentUser ? (
            <div className="flex items-center border border-line bg-panel max-sm:grid max-sm:grid-cols-[1fr_auto]">
              <div className="max-w-[220px] truncate px-3 py-2 text-sm text-ink-muted">
                {currentUser.email}
              </div>
              <button
                className="min-h-control border-0 border-l border-line bg-[#30333d] px-3 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-ink-onDark"
                type="button"
                onClick={() => void logout()}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link className={linkButtonClassName} href="/auth">
              Sign in
            </Link>
          )}
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
            <RecentSurveySkeleton />
          ) : recentFormsError ? (
            <div className="border border-line bg-panel p-4 text-ink-muted">
              {recentFormsError}
            </div>
          ) : !currentUser ? (
            <div className="grid gap-4 border border-line bg-panel p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="font-display text-xl">Sign in to see recent surveys.</div>
                <div className="mt-1 text-sm text-ink-muted">
                  Your workspace forms and response counts will appear here.
                </div>
              </div>
              <Link className={primaryLinkClassName} href="/auth">
                Sign in
              </Link>
            </div>
          ) : recentForms.length === 0 ? (
            <div className="border border-line bg-panel p-4 text-ink-muted">
              No surveys yet. Create your first form to start collecting responses.
            </div>
          ) : (
            <div className="grid gap-2">
              {recentForms.map((form) => (
                <article
                  className="grid grid-cols-[1fr_auto] gap-4 border border-line bg-panel p-4 transition hover:border-accent hover:bg-[#262932] max-lg:grid-cols-1"
                  key={form.id}
                >
                  <div className="grid min-w-0 gap-3">
                    <Link
                      className="min-w-0 transition hover:text-accent"
                      href={`/forms/${form.slug}`}
                    >
                      <div className="truncate font-display text-xl leading-tight">{form.title}</div>
                    </Link>
                    <div className="mt-1 truncate text-sm text-ink-muted">/{form.slug}</div>
                    <div className="flex flex-wrap gap-2">
                      <StatusChip isOpen={form.accepting_responses} />
                      <AccessChip requiresLogin={form.requires_login} />
                      <RecentSurveyMeta
                        label="Responses"
                        value={form.response_count.toString()}
                      />
                      <RecentSurveyMeta label="Updated" value={formatDate(form.updated_at)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 max-lg:justify-start max-sm:grid max-sm:grid-cols-3">
                    <SurveyAction href={`/forms/${form.slug}`} label="Open" />
                    <SurveyAction href={`/forms/${form.slug}/edit`} label="Edit" />
                    <SurveyAction href={`/forms/${form.slug}/responses`} label="Responses" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function LoggedOutHome({
  openForm,
  setSlug,
  slug,
}: {
  openForm: (event: FormEvent<HTMLFormElement>) => void;
  setSlug: Dispatch<SetStateAction<string>>;
  slug: string;
}) {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <header className="mb-8 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <AppBrand bold={false} />
        </div>
        <nav className="flex items-center gap-2 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
          <Link className={linkButtonClassName} href="/auth">
            Sign in
          </Link>
        </nav>
      </header>

      <section className="relative grid min-h-[560px] overflow-hidden border border-line bg-[#181a20] p-8 shadow-panel max-sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative grid max-w-[760px] content-between gap-10">
          <div>
            <div className="mb-5 inline-flex border border-line bg-panel px-3 py-2 text-xs uppercase text-ink-muted">
              Dataquest Forms
            </div>
            <h1 className="m-0 font-display text-5xl leading-tight max-sm:text-4xl">
              Sign in to build and manage surveys.
            </h1>
            <p className="mt-5 text-lg leading-8 text-ink-muted max-sm:text-base max-sm:leading-7">
              Create validated form schemas, edit questions manually, publish public links, and
              review responses from one workspace.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="flex gap-3 max-sm:flex-col">
              <Link className={primaryLinkClassName} href="/auth">
                Sign in
              </Link>
              <Link className={linkButtonClassName} href="/auth">
                Create account
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
                aria-label="Public form slug"
              />
              <button
                className="min-h-control border-0 bg-[#30333d] px-5 py-3 font-semibold text-ink transition hover:bg-[#333642] hover:text-ink-onDark focus:shadow-focus"
                type="submit"
              >
                Open public form
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function RecentSurveyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-[#30333d] px-3 py-2 text-sm">
      <div className="font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs uppercase text-ink-muted">{label}</div>
    </div>
  );
}

function StatusChip({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold ${isOpen
        ? "border-line-success bg-success text-ink"
        : "border-line-error bg-error text-ink"
        }`}
    >
      <span className={isOpen ? "size-2 bg-[#7ec07c]" : "size-2 bg-[#e06c75]"} />
      {isOpen ? "Open" : "Closed"}
    </div>
  );
}

function AccessChip({ requiresLogin }: { requiresLogin: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 border border-line bg-[#30333d] px-3 py-2 text-sm font-semibold">
      {requiresLogin ? <LockIcon /> : <PublicIcon />}
      {requiresLogin ? "Login" : "Public"}
    </div>
  );
}

function SurveyAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="inline-flex min-h-control items-center justify-center border border-line bg-[#30333d] px-3 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-ink-onDark"
      href={href as Route}
    >
      {label}
    </Link>
  );
}

function RecentSurveySkeleton() {
  return (
    <div className="grid gap-2" aria-label="Loading recent surveys">
      {[0, 1, 2].map((index) => (
        <div className="grid gap-4 border border-line bg-panel p-4" key={index}>
          <div className="h-6 w-2/5 animate-pulse bg-[#30333d]" />
          <div className="h-4 w-1/4 animate-pulse bg-[#30333d]" />
          <div className="flex flex-wrap gap-2">
            <div className="h-12 w-24 animate-pulse bg-[#30333d]" />
            <div className="h-12 w-24 animate-pulse bg-[#30333d]" />
            <div className="h-12 w-28 animate-pulse bg-[#30333d]" />
            <div className="h-12 w-28 animate-pulse bg-[#30333d]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M5 11h14v10H5z" />
    </svg>
  );
}

function PublicIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
