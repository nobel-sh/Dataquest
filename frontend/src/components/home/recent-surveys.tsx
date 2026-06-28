import Link from "next/link";
import type { Route } from "next";
import { LinkButton, Skeleton } from "@/components/ui/primitives";
import { controlButtonClassName } from "@/components/ui/styles";
import { formatShortDate } from "@/lib/format";
import type { FormRecord, User } from "@/lib/types";

type RecentSurveysProps = {
  copiedFormId: string | null;
  currentUser: User | null;
  error: string | null;
  forms: FormRecord[];
  isLoading: boolean;
  onCopyPublicLink: (form: FormRecord) => void;
};

export function RecentSurveys({
  copiedFormId,
  currentUser,
  error,
  forms,
  isLoading,
  onCopyPublicLink,
}: RecentSurveysProps) {
  return (
    <section className="mt-5 border border-line bg-panel shadow-panel">
      <header className="flex items-center justify-between gap-4 border-b border-line p-5 max-sm:flex-col max-sm:items-start">
        <div>
          <h2 className="m-0 font-display text-2xl leading-tight">Recent surveys</h2>
          <div className="mt-1 text-sm text-ink-muted">The latest forms in your workspace.</div>
        </div>
        <LinkButton variant="panel" className="max-sm:w-full" href="/forms">
          View all
        </LinkButton>
      </header>

      <div className="bg-[#181a20] p-5">
        {isLoading ? (
          <RecentSurveySkeleton />
        ) : error ? (
          <div className="border border-line bg-panel p-4 text-ink-muted">{error}</div>
        ) : !currentUser ? (
          <RecentSurveyLoginPrompt />
        ) : forms.length === 0 ? (
          <div className="border border-line bg-panel p-4 text-ink-muted">
            No surveys yet. Create your first form to start collecting responses.
          </div>
        ) : (
          <div className="grid gap-2">
            {forms.map((form) => (
              <RecentSurveyRow
                copiedFormId={copiedFormId}
                form={form}
                key={form.id}
                onCopyPublicLink={onCopyPublicLink}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RecentSurveyLoginPrompt() {
  return (
    <div className="grid gap-4 border border-line bg-panel p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <div className="font-display text-xl">Sign in to see recent surveys.</div>
        <div className="mt-1 text-sm text-ink-muted">
          Your workspace forms and response counts will appear here.
        </div>
      </div>
      <LinkButton variant="primary" href="/auth">
        Sign in
      </LinkButton>
    </div>
  );
}

function RecentSurveyRow({
  copiedFormId,
  form,
  onCopyPublicLink,
}: {
  copiedFormId: string | null;
  form: FormRecord;
  onCopyPublicLink: (form: FormRecord) => void;
}) {
  return (
    <article
      className="grid min-w-0 grid-cols-[1fr_auto] gap-4 border border-line bg-panel p-4 transition hover:border-accent hover:bg-[#262932] max-lg:grid-cols-1"
      key={form.id}
    >
      <div className="grid min-w-0 gap-3">
        <Link className="min-w-0 transition hover:text-accent" href={`/forms/${form.slug}`}>
          <div className="truncate font-display text-xl leading-tight max-sm:text-[1.1rem]">
            {form.title}
          </div>
        </Link>
        <div className="break-all text-sm text-ink-muted">/{form.slug}</div>
        <div className="flex flex-wrap gap-2 max-sm:gap-1.5">
          <StatusChip isOpen={form.accepting_responses} />
          <AccessChip requiresLogin={form.requires_login} />
          <ResponsesLink count={form.response_count} href={`/forms/${form.slug}/responses`} />
          <RecentSurveyMeta label="Updated" value={formatShortDate(form.updated_at)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end max-lg:justify-start">
        <SurveyAction href={`/forms/${form.slug}`} label="Open" />
        <SurveyAction href={`/forms/${form.slug}/edit`} label="Edit" />
        <button
          className={controlButtonClassName}
          type="button"
          onClick={() => onCopyPublicLink(form)}
        >
          {copiedFormId === form.id ? "Copied" : "Copy link"}
        </button>
      </div>
    </article>
  );
}

function RecentSurveyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border border-line bg-[#30333d] px-3 py-2 text-sm max-sm:px-2.5 max-sm:py-2">
      <div className="break-words font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs uppercase text-ink-muted">{label}</div>
    </div>
  );
}

function ResponsesLink({ count, href }: { count: number; href: string }) {
  return (
    <Link
      className={`${controlButtonClassName} min-w-0 gap-2 max-sm:px-2.5 max-sm:py-2`}
      href={href as Route}
    >
      <span>{count}</span>
      <span className="text-ink-muted">responses</span>
    </Link>
  );
}

function StatusChip({ isOpen }: { isOpen: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-semibold ${
        isOpen ? "border-line-success bg-success text-ink" : "border-line-error bg-error text-ink"
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
    <Link className={controlButtonClassName} href={href as Route}>
      {label}
    </Link>
  );
}

function RecentSurveySkeleton() {
  return (
    <div className="grid gap-2" aria-label="Loading recent surveys">
      {[0, 1, 2].map((index) => (
        <div className="grid gap-4 border border-line bg-panel p-4" key={index}>
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-28" />
            <Skeleton className="h-12 w-28" />
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
