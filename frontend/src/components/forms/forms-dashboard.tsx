"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { listForms } from "@/lib/api";
import type { FormRecord } from "@/lib/types";

export function FormsDashboard() {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadForms() {
      setIsLoading(true);
      setError(null);

      try {
        const nextForms = await listForms();
        if (!cancelled) {
          setForms(nextForms);
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
  }, []);

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
          </div>
          <Link
            className="border border-accent bg-accent px-4 py-2 font-bold tracking-wide text-ink-button shadow-[0_8px_18px_rgba(161,66,244,0.22)] transition hover:border-accent-hover hover:bg-accent-hover"
            href="/forms/new"
          >
            New form
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
          <Metric label="Forms" value={isLoading ? "..." : forms.length.toString()} />
          <Metric label="Fields" value={isLoading ? "..." : totalFields.toString()} />
          <Metric label="Latest version" value={latestVersionLabel(forms)} />
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
              Create a form manually or generate a draft from an AI prompt.
            </p>
            <Link
              className="mt-4 inline-block border border-accent bg-accent px-4 py-2 font-bold tracking-wide text-ink-button transition hover:border-accent-hover hover:bg-accent-hover"
              href="/forms/new"
            >
              Create form
            </Link>
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

              <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_auto] items-stretch border-b border-line text-sm max-lg:grid-cols-3 max-sm:grid-cols-1">
                <Metric
                  label="Version"
                  value={`v${form.latest_version.version_number.toString()}`}
                />
                <Metric label="Fields" value={form.latest_version.schema.fields.length.toString()} />
                <Metric label="Created" value={formatDate(form.created_at)} />
                <div className="flex items-center gap-2 p-4 max-lg:col-span-3 max-sm:col-span-1 max-sm:flex-col max-sm:items-stretch">
                  <DashboardLink href={`/forms/${form.slug}`}>View</DashboardLink>
                  <DashboardLink href={`/forms/${form.slug}/edit`}>Edit</DashboardLink>
                  <DashboardLink href={`/forms/${form.slug}/responses`}>Responses</DashboardLink>
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

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}
