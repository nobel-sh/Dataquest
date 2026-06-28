import { Button, Card, MetricTile, Skeleton } from "@/components/ui/primitives";
import { surfaceClassName } from "@/components/ui/styles";
import { formatAnswer, formatVersion } from "@/components/forms/responses-format";
import { formatDateTime } from "@/lib/format";
import type { FormField, FormRecord, FormResponse } from "@/lib/types";

type ResponsesHeaderProps = {
  fields: FormField[];
  form: FormRecord;
  responseCount: number;
  onExportCsv: () => void;
};

export function ResponsesHeader({
  fields,
  form,
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
      <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
        <MetricTile label="Total responses" value={responseCount.toString()} />
        <MetricTile
          label="Current version"
          value={`v${form.latest_version.version_number.toString()}`}
        />
        <MetricTile label="Fields" value={fields.length.toString()} />
      </div>
    </header>
  );
}

type ResponsesListProps = {
  fields: FormField[];
  responses: FormResponse[];
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

function ResponsesCards({ fields, responses, versionNumbersById }: ResponsesListProps) {
  return (
    <div className={`hidden ${surfaceClassName} p-5 max-lg:grid max-lg:gap-4 max-sm:p-4`}>
      {responses.map((response, index) => (
        <article className="min-w-0 border border-line bg-panel p-5 max-sm:p-4" key={response.id}>
          <div className="flex items-start justify-between gap-4 border-b border-line pb-3 max-sm:flex-col">
            <div className="font-display text-xl">Response {index + 1}</div>
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
