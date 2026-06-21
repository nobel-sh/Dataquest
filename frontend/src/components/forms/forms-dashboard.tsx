"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { listForms, updateFormSettings } from "@/lib/api";
import { clearAccessToken, getCurrentUser } from "@/lib/auth";
import type { FormRecord, User } from "@/lib/types";

export function FormsDashboard() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"active" | "archived">("active");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingFormId, setUpdatingFormId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadForms() {
      setIsLoading(true);
      setError(null);

      try {
        const [user, nextForms] = await Promise.all([
          getCurrentUser(),
          listForms(view === "archived"),
        ]);
        if (!cancelled) {
          setCurrentUser(user);
          setForms(filterFormsForView(nextForms, view));
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load forms.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadForms();

    return () => {
      cancelled = true;
    };
  }, [view]);

  function logout() {
    clearAccessToken();
    setCurrentUser(null);
    setForms([]);
    setError("Logged out. Login again to view your forms.");
  }

  async function toggleAcceptingResponses(form: FormRecord) {
    setUpdatingFormId(form.id);
    setError(null);

    try {
      const updatedForm = await updateFormSettings(form.id, {
        accepting_responses: !form.accepting_responses,
      });
      setForms((currentForms) =>
        currentForms.map((currentForm) =>
          currentForm.id === updatedForm.id ? updatedForm : currentForm,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Failed to update form settings.",
      );
    } finally {
      setUpdatingFormId(null);
    }
  }

  async function toggleRequiresLogin(form: FormRecord) {
    setUpdatingFormId(form.id);
    setError(null);

    try {
      const updatedForm = await updateFormSettings(form.id, {
        requires_login: !form.requires_login,
      });
      setForms((currentForms) =>
        currentForms.map((currentForm) =>
          currentForm.id === updatedForm.id ? updatedForm : currentForm,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Failed to update form settings.",
      );
    } finally {
      setUpdatingFormId(null);
    }
  }

  async function archiveForm(form: FormRecord) {
    setUpdatingFormId(form.id);
    setError(null);

    try {
      const updatedForm = await updateFormSettings(form.id, { archived: true });
      setForms((currentForms) =>
        currentForms.filter((currentForm) => currentForm.id !== updatedForm.id),
      );
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Failed to archive form.");
    } finally {
      setUpdatingFormId(null);
    }
  }

  async function unarchiveForm(form: FormRecord) {
    setUpdatingFormId(form.id);
    setError(null);

    try {
      const updatedForm = await updateFormSettings(form.id, { archived: false });
      setForms((currentForms) =>
        currentForms.filter((currentForm) => currentForm.id !== updatedForm.id),
      );
    } catch (unarchiveError) {
      setError(
        unarchiveError instanceof Error ? unarchiveError.message : "Failed to unarchive form.",
      );
    } finally {
      setUpdatingFormId(null);
    }
  }

  const totalFields = useMemo(
    () => forms.reduce((sum, form) => sum + form.latest_version.schema.fields.length, 0),
    [forms],
  );

  return (
    <section className="border border-line bg-panel shadow-panel">
      <header className="border-b border-line p-7 max-sm:p-5">
        <div className="flex items-start justify-between gap-4 max-sm:flex-col">
          <div>
            <p className="m-0 text-sm uppercase text-ink-muted">Workspace</p>
            <h1 className="m-0 mt-2 font-display text-[clamp(30px,4vw,46px)] leading-tight">
              My Forms
            </h1>
            <div className="mt-2 text-sm text-ink-muted">
              {currentUser ? currentUser.email : "Login required"}
            </div>
          </div>
          <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
            {currentUser ? (
              <button
                className="border border-line bg-[#30333d] px-4 py-2 font-semibold text-ink transition hover:border-accent hover:bg-[#333642]"
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            ) : (
              <Link
                className="border border-line bg-[#30333d] px-4 py-2 font-semibold text-ink transition hover:border-accent hover:bg-[#333642]"
                href="/auth"
              >
                Login
              </Link>
            )}
            <Link
              className="border border-accent bg-accent px-4 py-2 font-bold tracking-wide text-ink-button shadow-[0_8px_18px_rgba(161,66,244,0.22)] transition hover:border-accent-hover hover:bg-accent-hover"
              href="/forms/new"
            >
              New form
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
          <Metric label="Forms" value={isLoading ? "..." : forms.length.toString()} />
          <Metric label="Fields" value={isLoading ? "..." : totalFields.toString()} />
          <Metric label="Latest version" value={latestVersionLabel(forms)} />
        </div>
        <div className="mt-4 inline-grid grid-cols-2 border border-line text-sm">
          <button
            className={`px-4 py-2 transition ${
              view === "active" ? "bg-accent text-ink-button" : "bg-[#30333d] text-ink"
            }`}
            type="button"
            onClick={() => setView("active")}
          >
            Active
          </button>
          <button
            className={`border-l border-line px-4 py-2 transition ${
              view === "archived" ? "bg-accent text-ink-button" : "bg-[#30333d] text-ink"
            }`}
            type="button"
            onClick={() => setView("archived")}
          >
            Archived
          </button>
        </div>
      </header>

      {error ? (
        <div className="bg-[#181a20] p-7 max-sm:p-5">
          <div className="border border-line-error bg-error p-5">
            <div>{error}</div>
            <Link className="mt-3 inline-block underline" href="/auth">
              Login or register
            </Link>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="bg-[#181a20] p-7 max-sm:p-5">Loading forms...</div>
      ) : forms.length === 0 ? (
        <div className="bg-[#181a20] p-7 max-sm:p-5">
          <div className="border border-line bg-panel p-5">
            <strong>No forms yet.</strong>
            <p className="m-0 mt-2 text-ink-muted">
              {view === "active"
                ? "Create a form manually or generate a draft from an AI prompt."
                : "Archived forms will appear here."}
            </p>
            {view === "active" ? (
              <Link
                className="mt-4 inline-block border border-accent bg-accent px-4 py-2 font-bold tracking-wide text-ink-button transition hover:border-accent-hover hover:bg-accent-hover"
                href="/forms/new"
              >
                Create form
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 bg-[#181a20] p-7 max-sm:p-5">
          {forms.map((form) => (
            <article className="border border-line bg-panel" key={form.id}>
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line p-5 max-md:grid-cols-1">
                <div>
                  <h2 className="m-0 font-display text-2xl leading-tight">{form.title}</h2>
                  {form.description ? (
                    <p className="m-0 mt-2 max-w-[760px] text-ink-muted">{form.description}</p>
                  ) : null}
                </div>
                <div className="text-sm text-ink-muted md:text-right">
                  <div>/{form.slug}</div>
                  <time dateTime={form.updated_at}>Updated {formatDate(form.updated_at)}</time>
                </div>
              </div>

              <div className="grid grid-cols-[repeat(4,minmax(0,1fr))_auto] items-stretch border-b border-line text-sm max-xl:grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                <Metric
                  label="Version"
                  value={`v${form.latest_version.version_number.toString()}`}
                />
                <Metric label="Fields" value={form.latest_version.schema.fields.length.toString()} />
                <Metric
                  label="Responses"
                  value={form.accepting_responses ? "Open" : "Closed"}
                />
                <Metric label="Access" value={form.requires_login ? "Login" : "Public"} />
                <div className="flex items-center gap-2 p-4 max-xl:col-span-4 max-lg:col-span-2 max-sm:col-span-1 max-sm:flex-col max-sm:items-stretch">
                  {view === "active" ? (
                    <>
                      <button
                        className={`border px-3 py-2 text-center text-sm transition ${
                          form.accepting_responses
                            ? "border-line-error bg-error text-ink"
                            : "border-line-success bg-success text-ink"
                        }`}
                        disabled={updatingFormId === form.id}
                        type="button"
                        onClick={() => void toggleAcceptingResponses(form)}
                      >
                        {form.accepting_responses ? "Close" : "Open"}
                      </button>
                      <button
                        className="border border-line bg-[#30333d] px-3 py-2 text-center text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
                        disabled={updatingFormId === form.id}
                        type="button"
                        onClick={() => void toggleRequiresLogin(form)}
                      >
                        {form.requires_login ? "Make public" : "Require login"}
                      </button>
                      <button
                        className="border border-line-error bg-error px-3 py-2 text-center text-sm text-ink transition hover:border-danger"
                        disabled={updatingFormId === form.id}
                        type="button"
                        onClick={() => void archiveForm(form)}
                      >
                        Archive
                      </button>
                    </>
                  ) : (
                    <button
                      className="border border-line-success bg-success px-3 py-2 text-center text-sm text-ink transition hover:border-line-success"
                      disabled={updatingFormId === form.id}
                      type="button"
                      onClick={() => void unarchiveForm(form)}
                    >
                      Unarchive
                    </button>
                  )}
                  {view === "active" ? (
                    <>
                      <DashboardLink href={`/forms/${form.slug}`}>View</DashboardLink>
                      <DashboardLink href={`/forms/${form.slug}/edit`}>Edit</DashboardLink>
                      <DashboardLink href={`/forms/${form.slug}/responses`}>Responses</DashboardLink>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-line p-4 last:border-r-0 max-sm:border-b max-sm:border-r-0 max-sm:last:border-b-0">
      <div className="font-display text-2xl leading-none">{value}</div>
      <div className="mt-1 text-ink-muted">{label}</div>
    </div>
  );
}

function DashboardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      className="border border-line bg-[#30333d] px-3 py-2 text-center text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
      href={href as Route}
    >
      {children}
    </Link>
  );
}

function latestVersionLabel(forms: FormRecord[]): string {
  if (forms.length === 0) {
    return "none";
  }

  return `v${Math.max(...forms.map((form) => form.latest_version.version_number)).toString()}`;
}

function filterFormsForView(forms: FormRecord[], view: "active" | "archived"): FormRecord[] {
  return forms.filter((form) => form.archived === (view === "archived"));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}
