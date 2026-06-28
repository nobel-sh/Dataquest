"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import {
  iconButtonClassName,
  surfaceClassName,
} from "@/components/ui/styles";
import {
  Alert,
  Button,
  Card,
  LinkButton,
  MetricTile,
  Panel,
  Skeleton,
} from "@/components/ui/primitives";
import { listForms, updateFormSettings } from "@/lib/api";
import { getCurrentUser, logoutSession } from "@/lib/auth";
import { formatMediumDate } from "@/lib/format";
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

  async function logout() {
    await logoutSession();
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
    <Panel>
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
          <div className="grid gap-2 max-sm:w-full sm:flex">
            {currentUser ? (
              <Button
                variant="secondary"
                type="button"
                onClick={logout}
              >
                Logout
              </Button>
            ) : (
              <LinkButton variant="secondary" href="/auth">
                Login
              </LinkButton>
            )}
            <LinkButton variant="primary" href="/forms/new">
              New form
            </LinkButton>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
          <MetricTile label="Forms" value={isLoading ? "..." : forms.length.toString()} />
          <MetricTile label="Fields" value={isLoading ? "..." : totalFields.toString()} />
          <MetricTile label="Latest version" value={latestVersionLabel(forms)} />
        </div>
        <div className="mt-4 grid grid-cols-2 border border-line text-sm sm:inline-grid">
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
        <div className={`${surfaceClassName} p-7 max-sm:p-5`}>
          <Alert>
            <div>{error}</div>
            <Link className="mt-3 inline-block underline" href="/auth">
              Login or register
            </Link>
          </Alert>
        </div>
      ) : null}

      {isLoading ? (
        <DashboardSkeleton />
      ) : forms.length === 0 ? (
        <div className={`${surfaceClassName} p-7 max-sm:p-5`}>
          <Card className="p-5">
            <strong>No forms yet.</strong>
            <p className="m-0 mt-2 text-ink-muted">
              {view === "active"
                ? "Create a form manually or generate a draft from an AI prompt."
                : "Archived forms will appear here."}
            </p>
            {view === "active" ? (
              <LinkButton variant="primary" className="mt-4" href="/forms/new">
                Create form
              </LinkButton>
            ) : null}
          </Card>
        </div>
      ) : (
        <div className={`grid gap-4 ${surfaceClassName} p-7 max-sm:p-5`}>
          {forms.map((form) => (
            <article className="min-w-0 border border-line bg-panel" key={form.id}>
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line p-5 max-md:grid-cols-1">
                <div className="min-w-0">
                  <h2 className="m-0 break-words font-display text-2xl leading-tight">
                    {form.title}
                  </h2>
                  {form.description ? (
                    <p className="m-0 mt-2 max-w-[760px] break-words text-ink-muted">
                      {form.description}
                    </p>
                  ) : null}
                </div>
                <div className="min-w-0 text-sm text-ink-muted md:text-right">
                  <div className="break-all">/{form.slug}</div>
                  <time dateTime={form.updated_at}>
                    Updated {formatMediumDate(form.updated_at)}
                  </time>
                </div>
              </div>

              <div className="grid grid-cols-4 items-stretch border-b border-line text-sm max-lg:grid-cols-2 max-[520px]:grid-cols-1">
                <MetricTile
                  label="Version"
                  value={`v${form.latest_version.version_number.toString()}`}
                />
                <MetricTile
                  label="Fields"
                  value={form.latest_version.schema.fields.length.toString()}
                />
                <MetricTile
                  label="Responses"
                  value={form.accepting_responses ? "Open" : "Closed"}
                />
                <MetricTile label="Access" value={form.requires_login ? "Login" : "Public"} />
              </div>

              <div className="flex items-center justify-between gap-3 p-4 max-lg:flex-col max-lg:items-stretch">
                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                  {view === "active" ? (
                    <>
                      <DashboardLink
                        href={`/forms/${form.slug}`}
                        icon={<EyeIcon />}
                        label="View"
                      />
                      <DashboardLink
                        href={`/forms/${form.slug}/edit`}
                        icon={<EditIcon />}
                        label="Edit"
                      />
                      <DashboardLink
                        href={`/forms/${form.slug}/responses`}
                        icon={<RowsIcon />}
                        label="Responses"
                      />
                    </>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end max-lg:justify-start">
                  {view === "active" ? (
                    <>
                      <ActionButton
                        icon={form.accepting_responses ? <CloseIcon /> : <OpenIcon />}
                        label={form.accepting_responses ? "Close responses" : "Open responses"}
                        tone={form.accepting_responses ? "danger" : "success"}
                        disabled={updatingFormId === form.id}
                        onClick={() => void toggleAcceptingResponses(form)}
                      />
                      <ActionButton
                        icon={<LockIcon />}
                        label={form.requires_login ? "Make public" : "Require login"}
                        disabled={updatingFormId === form.id}
                        onClick={() => void toggleRequiresLogin(form)}
                      />
                      <ActionButton
                        icon={<ArchiveIcon />}
                        label="Archive"
                        tone="danger"
                        disabled={updatingFormId === form.id}
                        onClick={() => void archiveForm(form)}
                      />
                    </>
                  ) : (
                    <ActionButton
                      icon={<RestoreIcon />}
                      label="Unarchive"
                      tone="success"
                      disabled={updatingFormId === form.id}
                      onClick={() => void unarchiveForm(form)}
                    />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}

function DashboardLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      aria-label={label}
      className={`${iconButtonClassName} min-h-control min-w-control px-3 py-2 max-sm:min-w-0`}
      href={href as Route}
      title={label}
    >
      {icon}
    </Link>
  );
}

function ActionButton({
  disabled,
  icon,
  label,
  tone = "neutral",
  onClick,
}: {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "success" | "danger";
  onClick: () => void;
}) {
  const toneClassName =
    tone === "success"
      ? "border-line-success bg-success hover:border-line-success"
      : tone === "danger"
        ? "border-line-error bg-error hover:border-danger"
        : "border-line bg-[#30333d] hover:border-accent";

  return (
    <button
      aria-label={label}
      className={`flex min-h-control items-center justify-center gap-2 border px-3 py-2 text-sm text-ink transition ${toneClassName}`}
      disabled={disabled}
      title={label}
      type="button"
      onClick={onClick}
    >
      {icon}
      <span className="max-sm:sr-only">{label}</span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className={`grid gap-4 ${surfaceClassName} p-7 max-sm:p-5`} aria-label="Loading forms">
      {[0, 1, 2].map((index) => (
        <Card key={index}>
          <div className="grid gap-3 border-b border-line p-5">
            <Skeleton className="h-7 w-2/5 max-sm:w-3/4" />
            <Skeleton className="h-4 w-3/5 max-sm:w-full" />
          </div>
          <div className="grid grid-cols-4 border-b border-line max-lg:grid-cols-2 max-[520px]:grid-cols-1">
            {[0, 1, 2, 3].map((metric) => (
              <div className="border-r border-line p-4 last:border-r-0 max-lg:border-b max-lg:[&:nth-child(2n)]:border-r-0 max-[520px]:border-r-0" key={metric}>
                <Skeleton className="h-6 w-12" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            <Skeleton className="h-control w-12" />
            <Skeleton className="h-control w-12" />
            <Skeleton className="h-control w-12" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ArchiveIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 11h6" />
      <path d="M8 7V4h8v3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 7l10 10" />
      <path d="M17 7 7 17" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 20h16" />
      <path d="M6 16 16.5 5.5 19 8 8.5 18.5 6 19z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <path d="M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M5 11h14v10H5z" />
    </svg>
  );
}

function OpenIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h10a6 6 0 1 1-5.2 9" />
      <path d="M4 7l4-4" />
      <path d="M4 7l4 4" />
    </svg>
  );
}

function RowsIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
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
