import { Button, Card, MetricTile, Skeleton, TextInput } from "@/components/ui/primitives";
import { surfaceClassName } from "@/components/ui/styles";
import { formatAnswer, formatVersion } from "@/components/forms/responses-format";
import { formatDateTime } from "@/lib/format";
import type { FormField, FormRecord, FormResponse } from "@/lib/types";
import type {
  FieldAnalytics,
  ResponsesAnalytics as ResponsesAnalyticsData,
} from "./responses-analytics";

type ResponsesHeaderProps = {
  fields: FormField[];
  form: FormRecord;
  latestSubmittedAt: string | null;
  responseCount: number;
  onExportCsv: () => void;
};

export function ResponsesHeader({
  fields,
  form,
  latestSubmittedAt,
  responseCount,
  onExportCsv,
}: ResponsesHeaderProps) {
  return (
    <header className="border-b border-line p-7 max-sm:p-5">
      <div className="flex items-start justify-between gap-4 max-sm:flex-col">
        <div className="min-w-0">
          <p className="m-0 text-sm uppercase text-ink-muted">Responses</p>
          <h1 className="m-0 mt-2 break-words font-display text-[clamp(30px,4vw,46px)] leading-tight">
            {form.title}
          </h1>
        </div>
        <Button className="max-sm:w-full" type="button" onClick={onExportCsv}>
          Export CSV
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-4 border border-line text-sm max-lg:grid-cols-2 max-sm:grid-cols-1">
        <MetricTile label="Page responses" value={responseCount.toString()} />
        <MetricTile
          label="Latest response"
          value={latestSubmittedAt ? formatDateTime(latestSubmittedAt) : "None"}
        />
        <MetricTile
          label="Current version"
          value={`v${form.latest_version.version_number.toString()}`}
        />
        <MetricTile label="Fields" value={fields.length.toString()} />
      </div>
    </header>
  );
}

export function ResponsesAnalytics({ analytics }: { analytics: ResponsesAnalyticsData }) {
  return (
    <section className={`${surfaceClassName} border-b border-line p-7 max-sm:p-5`}>
      <div className="mb-4">
        <h2 className="m-0 font-display text-2xl">Analytics</h2>
        <p className="m-0 mt-1 text-sm text-ink-muted">
          Quick summaries from response values on this page.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {analytics.fieldAnalytics.map((fieldAnalytics) => (
          <FieldAnalyticsCard
            analytics={fieldAnalytics}
            key={fieldAnalytics.field.id}
          />
        ))}
      </div>
    </section>
  );
}

type ResponsesSearchProps = {
  resultCount: number;
  searchTerm: string;
  totalCount: number;
  onSearchTermChange: (value: string) => void;
};

export function ResponsesSearch({
  resultCount,
  searchTerm,
  totalCount,
  onSearchTermChange,
}: ResponsesSearchProps) {
  return (
    <section className={`${surfaceClassName} border-b border-line px-7 py-5 max-sm:px-5`}>
      <label className="text-sm font-semibold" htmlFor="response-search">
        Search this page
      </label>
      <div className="mt-2 flex items-center gap-3 max-sm:grid">
        <TextInput
          id="response-search"
          placeholder="Search answers, version, or date"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
        <span className="text-sm text-ink-muted">
          {searchTerm.trim()
            ? `${resultCount.toString()} of ${totalCount.toString()} shown`
            : `${totalCount.toString()} shown`}
        </span>
      </div>
    </section>
  );
}

function FieldAnalyticsCard({ analytics }: { analytics: FieldAnalytics }) {
  return (
    <Card className="grid min-w-0 gap-4 p-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 break-words font-display text-xl">{analytics.field.label}</h3>
          <span className="border border-line bg-[#30333d] px-2 py-1 text-xs uppercase text-ink-muted">
            {analytics.field.type}
          </span>
        </div>
        <p className="m-0 mt-1 text-sm text-ink-muted">
          {analytics.answeredCount.toString()} answered
        </p>
      </div>
      {analytics.kind === "numeric" ? <NumericAnalytics analytics={analytics} /> : null}
      {analytics.kind === "options" ? <OptionsAnalytics analytics={analytics} /> : null}
      {analytics.kind === "text" ? <TextAnalytics analytics={analytics} /> : null}
    </Card>
  );
}

function NumericAnalytics({
  analytics,
}: {
  analytics: Extract<FieldAnalytics, { kind: "numeric" }>;
}) {
  return (
    <div className="grid grid-cols-3 border border-line text-sm">
      <MetricTile label="Average" value={formatNumber(analytics.average)} />
      <MetricTile label="Min" value={formatNumber(analytics.min)} />
      <MetricTile label="Max" value={formatNumber(analytics.max)} />
    </div>
  );
}

function OptionsAnalytics({
  analytics,
}: {
  analytics: Extract<FieldAnalytics, { kind: "options" }>;
}) {
  const visibleCounts = analytics.counts.slice(0, 5);

  if (visibleCounts.length === 0) {
    return <p className="m-0 text-sm text-ink-muted">No options selected yet.</p>;
  }

  return (
    <div className="grid gap-2">
      {visibleCounts.map((option) => (
        <div className="grid gap-1" key={option.value}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 break-words">{option.label}</span>
            <span className="text-ink-muted">{option.count.toString()}</span>
          </div>
          <div className="h-2 border border-line bg-[#181a20]">
            <div
              className="h-full bg-accent"
              style={{
                width: `${optionPercent(option.count, analytics.answeredCount).toString()}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TextAnalytics({
  analytics,
}: {
  analytics: Extract<FieldAnalytics, { kind: "text" }>;
}) {
  if (analytics.samples.length === 0) {
    return <p className="m-0 text-sm text-ink-muted">No text answers yet.</p>;
  }

  return (
    <div className="grid gap-2">
      {analytics.samples.map((sample) => (
        <blockquote
          className="m-0 border-l-2 border-accent bg-[#181a20] px-3 py-2 text-sm text-ink-muted"
          key={sample}
        >
          {sample}
        </blockquote>
      ))}
    </div>
  );
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function optionPercent(count: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 100);
}

type ResponsesListProps = {
  fields: FormField[];
  responses: FormResponse[];
  startIndex?: number;
  versionNumbersById: Record<string, number>;
};

export function ResponsesList(props: ResponsesListProps) {
  return (
    <>
      <ResponsesTable {...props} />
      <ResponsesCards {...props} />
    </>
  );
}

function ResponsesTable({ fields, responses, versionNumbersById }: ResponsesListProps) {
  return (
    <div className={`${surfaceClassName} p-7 max-lg:hidden`}>
      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[#272a33] text-ink-muted">
            <tr>
              <th className="border-b border-r border-line px-4 py-3 font-semibold">Submitted</th>
              <th className="border-b border-r border-line px-4 py-3 font-semibold">Version</th>
              {fields.map((field) => (
                <th
                  className="border-b border-r border-line px-4 py-3 font-semibold"
                  key={field.id}
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr
                className="bg-panel align-top odd:bg-[#202124] even:bg-[#24262d]"
                key={response.id}
              >
                <td className="whitespace-nowrap border-r border-line px-4 py-3 text-ink-muted">
                  {formatDateTime(response.submitted_at)}
                </td>
                <td className="whitespace-nowrap border-r border-line px-4 py-3 text-ink-muted">
                  {formatVersion(response.form_version_id, versionNumbersById)}
                </td>
                {fields.map((field) => (
                  <td className="border-r border-line px-4 py-3" key={field.id}>
                    {formatAnswer(response.answers[field.id], field)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResponsesCards({
  fields,
  responses,
  startIndex = 0,
  versionNumbersById,
}: ResponsesListProps) {
  return (
    <div className={`hidden ${surfaceClassName} p-5 max-lg:grid max-lg:gap-4 max-sm:p-4`}>
      {responses.map((response, index) => (
        <article className="min-w-0 border border-line bg-panel p-5 max-sm:p-4" key={response.id}>
          <div className="flex items-start justify-between gap-4 border-b border-line pb-3 max-sm:flex-col">
            <div className="font-display text-xl">Response {startIndex + index + 1}</div>
            <div className="text-right text-sm text-ink-muted max-sm:text-left">
              <div>{formatVersion(response.form_version_id, versionNumbersById)}</div>
              <time dateTime={response.submitted_at}>{formatDateTime(response.submitted_at)}</time>
            </div>
          </div>
          <dl className="mt-4 grid gap-4">
            {fields.map((field) => (
              <div className="grid min-w-0 gap-1" key={field.id}>
                <dt className="text-sm font-semibold text-ink-muted">{field.label}</dt>
                <dd className="m-0 break-words">
                  {formatAnswer(response.answers[field.id], field)}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

type ResponsesPaginationProps = {
  hasNextPage: boolean;
  isLoading: boolean;
  page: number;
  pageSize: number;
  shownCount: number;
  onNext: () => void;
  onPrevious: () => void;
};

export function ResponsesPagination({
  hasNextPage,
  isLoading,
  page,
  pageSize,
  shownCount,
  onNext,
  onPrevious,
}: ResponsesPaginationProps) {
  const start = page * pageSize + 1;
  const end = page * pageSize + shownCount;

  return (
    <div
      className={`${surfaceClassName} flex items-center justify-between gap-3 px-7 pb-7 max-sm:flex-col max-sm:items-stretch max-sm:px-5 max-sm:pb-5`}
    >
      <div className="text-sm text-ink-muted">
        Showing {shownCount === 0 ? "0" : `${start.toString()}-${end.toString()}`}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button disabled={isLoading || page === 0} type="button" onClick={onPrevious}>
          Previous
        </Button>
        <Button disabled={isLoading || !hasNextPage} type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

export function ResponsesEmptyState() {
  return (
    <div className={`${surfaceClassName} p-7 max-sm:p-5`}>
      <Card className="p-5">
        <strong>No responses yet.</strong>
        <p className="m-0 mt-2 text-ink-muted">
          Submitted responses for this form will appear here.
        </p>
      </Card>
    </div>
  );
}

export function ResponsesSearchEmptyState() {
  return (
    <div className={`${surfaceClassName} p-7 max-sm:p-5`}>
      <Card className="p-5">
        <strong>No matching responses.</strong>
        <p className="m-0 mt-2 text-ink-muted">
          Try a different search term or move to another page.
        </p>
      </Card>
    </div>
  );
}

export function ResponsesSkeleton() {
  return (
    <div className={`grid gap-4 ${surfaceClassName} p-7 max-sm:p-5`} aria-label="Loading responses">
      {[0, 1, 2].map((index) => (
        <Card className="p-5" key={index}>
          <div className="flex items-start justify-between gap-4 border-b border-line pb-3 max-sm:flex-col">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="mt-4 grid gap-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
