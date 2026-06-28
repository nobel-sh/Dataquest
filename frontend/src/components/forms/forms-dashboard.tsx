"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { surfaceClassName } from "@/components/ui/styles";
import {
  Alert,
  Button,
  Card,
  LinkButton,
  MetricTile,
  Panel,
} from "@/components/ui/primitives";
import { DashboardFormCard } from "@/components/forms/dashboard-form-card";
import { DashboardSkeleton } from "@/components/forms/dashboard-skeleton";
import {
  filterFormsForView,
  latestVersionLabel,
  type DashboardView,
} from "@/components/forms/dashboard-utils";
import { listForms, updateFormSettings } from "@/lib/api";
import { getCurrentUser, logoutSession } from "@/lib/auth";
import type { FormRecord, User } from "@/lib/types";

export function FormsDashboard() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>("active");
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
            <DashboardFormCard
              form={form}
              isUpdating={updatingFormId === form.id}
              key={form.id}
              view={view}
              onArchive={archiveForm}
              onToggleAcceptingResponses={toggleAcceptingResponses}
              onToggleRequiresLogin={toggleRequiresLogin}
              onUnarchive={unarchiveForm}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
