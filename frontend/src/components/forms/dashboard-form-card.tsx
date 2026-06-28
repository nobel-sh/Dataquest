import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { MetricTile } from "@/components/ui/primitives";
import { iconButtonClassName } from "@/components/ui/styles";
import {
  ArchiveIcon,
  CloseIcon,
  EditIcon,
  EyeIcon,
  LockIcon,
  OpenIcon,
  RestoreIcon,
  RowsIcon,
} from "@/components/forms/dashboard-icons";
import { formatMediumDate } from "@/lib/format";
import type { FormRecord } from "@/lib/types";

type DashboardFormCardProps = {
  form: FormRecord;
  isUpdating: boolean;
  view: "active" | "archived";
  onArchive: (form: FormRecord) => void;
  onToggleAcceptingResponses: (form: FormRecord) => void;
  onToggleRequiresLogin: (form: FormRecord) => void;
  onUnarchive: (form: FormRecord) => void;
};

export function DashboardFormCard({
  form,
  isUpdating,
  view,
  onArchive,
  onToggleAcceptingResponses,
  onToggleRequiresLogin,
  onUnarchive,
}: DashboardFormCardProps) {
  return (
    <article className="min-w-0 border border-line bg-panel">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-line p-5 max-md:grid-cols-1">
        <div className="min-w-0">
          <h2 className="m-0 break-words font-display text-2xl leading-tight">{form.title}</h2>
          {form.description ? (
            <p className="m-0 mt-2 max-w-[760px] break-words text-ink-muted">
              {form.description}
            </p>
          ) : null}
        </div>
        <div className="min-w-0 text-sm text-ink-muted md:text-right">
          <div className="break-all">/{form.slug}</div>
          <time dateTime={form.updated_at}>Updated {formatMediumDate(form.updated_at)}</time>
        </div>
      </div>

      <div className="grid grid-cols-4 items-stretch border-b border-line text-sm max-lg:grid-cols-2 max-[520px]:grid-cols-1">
        <MetricTile label="Version" value={`v${form.latest_version.version_number.toString()}`} />
        <MetricTile label="Fields" value={form.latest_version.schema.fields.length.toString()} />
        <MetricTile label="Responses" value={form.accepting_responses ? "Open" : "Closed"} />
        <MetricTile label="Access" value={form.requires_login ? "Login" : "Public"} />
      </div>

      <div className="flex items-center justify-between gap-3 p-4 max-lg:flex-col max-lg:items-stretch">
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          {view === "active" ? (
            <>
              <DashboardLink href={`/forms/${form.slug}`} icon={<EyeIcon />} label="View" />
              <DashboardLink href={`/forms/${form.slug}/edit`} icon={<EditIcon />} label="Edit" />
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
                disabled={isUpdating}
                onClick={() => onToggleAcceptingResponses(form)}
              />
              <ActionButton
                icon={<LockIcon />}
                label={form.requires_login ? "Make public" : "Require login"}
                disabled={isUpdating}
                onClick={() => onToggleRequiresLogin(form)}
              />
              <ActionButton
                icon={<ArchiveIcon />}
                label="Archive"
                tone="danger"
                disabled={isUpdating}
                onClick={() => onArchive(form)}
              />
            </>
          ) : (
            <ActionButton
              icon={<RestoreIcon />}
              label="Unarchive"
              tone="success"
              disabled={isUpdating}
              onClick={() => onUnarchive(form)}
            />
          )}
        </div>
      </div>
    </article>
  );
}

function DashboardLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
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
  icon: ReactNode;
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
