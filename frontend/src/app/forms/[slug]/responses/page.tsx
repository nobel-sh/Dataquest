import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formResponsesExportUrl,
  getFormBySlug,
  listFormResponses,
  listFormVersions,
} from "@/lib/api";
import type { AnswerValue, FieldOption, FormField, FormResponse } from "@/lib/types";

type ResponsesPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);

  if (!form) {
    notFound();
  }

  const [responses, versions] = await Promise.all([
    listFormResponses(form.id),
    listFormVersions(form.id),
  ]);
  const fields = form.latest_version.schema.fields;
  const versionNumbersById = Object.fromEntries(
    versions.map((version) => [version.id, version.version_number]),
  );

  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <div className="mb-7 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <div className="font-display text-xl font-bold tracking-wide text-ink-onDark">
            Dataquest Forms
          </div>
          <div className="text-ink-onDark/75">/{form.slug}/responses</div>
        </div>
        <div className="flex items-center gap-3 max-sm:flex-wrap">
          <a
            className="border border-line bg-panel px-3 py-2 text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
            href={formResponsesExportUrl(form.id)}
          >
            Export CSV
          </a>
          <Link
            className="border border-line bg-panel px-3 py-2 text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
            href={`/forms/${form.slug}`}
          >
            View form
          </Link>
        </div>
      </div>

      <section className="border border-line bg-panel shadow-panel">
        <header className="border-b border-line p-7 max-sm:p-5">
          <p className="m-0 text-sm uppercase text-ink-muted">Responses</p>
          <h1 className="m-0 mt-2 font-display text-[clamp(30px,4vw,46px)] leading-tight">
            {form.title}
          </h1>
          <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
            <Metric label="Total responses" value={responses.length.toString()} />
            <Metric
              label="Current version"
              value={`v${form.latest_version.version_number.toString()}`}
            />
            <Metric label="Fields" value={fields.length.toString()} />
          </div>
        </header>

        {responses.length === 0 ? (
          <div className="bg-[#181a20] p-7 max-sm:p-5">
            <div className="border border-line bg-panel p-5">
              <strong>No responses yet.</strong>
              <p className="m-0 mt-2 text-ink-muted">
                Submitted responses for this form will appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ResponsesTable
              fields={fields}
              responses={responses}
              versionNumbersById={versionNumbersById}
            />
            <ResponsesCards
              fields={fields}
              responses={responses}
              versionNumbersById={versionNumbersById}
            />
          </>
        )}
      </section>
    </main>
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

function ResponsesTable({
  fields,
  responses,
  versionNumbersById,
}: {
  fields: FormField[];
  responses: FormResponse[];
  versionNumbersById: Record<string, number>;
}) {
  return (
    <div className="bg-[#181a20] p-7 max-lg:hidden">
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
                  {formatDate(response.submitted_at)}
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
  versionNumbersById,
}: {
  fields: FormField[];
  responses: FormResponse[];
  versionNumbersById: Record<string, number>;
}) {
  return (
    <div className="hidden bg-[#181a20] p-5 max-lg:grid max-lg:gap-4">
      {responses.map((response, index) => (
        <article className="border border-line bg-panel p-5" key={response.id}>
          <div className="flex items-start justify-between gap-4 border-b border-line pb-3">
            <div className="font-display text-xl">Response {index + 1}</div>
            <div className="text-right text-sm text-ink-muted">
              <div>{formatVersion(response.form_version_id, versionNumbersById)}</div>
              <time dateTime={response.submitted_at}>{formatDate(response.submitted_at)}</time>
            </div>
          </div>
          <dl className="mt-4 grid gap-4">
            {fields.map((field) => (
              <div className="grid gap-1" key={field.id}>
                <dt className="text-sm font-semibold text-ink-muted">{field.label}</dt>
                <dd className="m-0">{formatAnswer(response.answers[field.id], field)}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

function formatAnswer(value: AnswerValue | undefined, field: FormField): string {
  if (value === undefined || value === null || value === "") {
    return "No answer";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "No answer";
    }
    return value.map((item) => optionLabel(item, field.options)).join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return optionLabel(String(value), field.options);
}

function formatVersion(
  versionId: string,
  versionNumbersById: Record<string, number> = {},
): string {
  const versionNumber = versionNumbersById[versionId];
  return versionNumber === undefined ? "Unknown" : `v${versionNumber.toString()}`;
}

function optionLabel(value: string, options: FieldOption[] | null | undefined): string {
  return options?.find((option) => option.value === value)?.label ?? value;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
