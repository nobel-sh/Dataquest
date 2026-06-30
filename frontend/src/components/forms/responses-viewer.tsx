"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formResponsesExportUrl,
  listFormResponses,
  listFormVersions,
} from "@/lib/api";
import { surfaceClassName } from "@/components/ui/styles";
import { Alert, Panel } from "@/components/ui/primitives";
import { useStatusBubble } from "@/components/status-bubble";
import {
  ResponsesAnalytics,
  ResponsesEmptyState,
  ResponsesHeader,
  ResponsesList,
  ResponsesPagination,
  ResponsesSkeleton,
} from "@/components/forms/responses-sections";
import { buildResponsesAnalytics } from "@/components/forms/responses-analytics";
import { authenticatedFetch } from "@/lib/auth";
import { statusError } from "@/lib/http-error";
import type { FormRecord, FormResponse } from "@/lib/types";

type ResponsesViewerProps = {
  form: FormRecord;
};

const RESPONSES_PAGE_SIZE = 25;
const RESPONSES_FETCH_LIMIT = RESPONSES_PAGE_SIZE + 1;

export function ResponsesViewer({ form }: ResponsesViewerProps) {
  const { showStatus } = useStatusBubble();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [versionNumbersById, setVersionNumbersById] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const fields = form.latest_version.schema.fields;
  const visibleResponses = responses.slice(0, RESPONSES_PAGE_SIZE);
  const analytics = buildResponsesAnalytics(fields, visibleResponses);
  const offset = page * RESPONSES_PAGE_SIZE;
  const hasNextPage = responses.length > RESPONSES_PAGE_SIZE;

  useEffect(() => {
    setPage(0);
  }, [form.id]);

  useEffect(() => {
    let cancelled = false;

    async function loadResponses() {
      setIsLoading(true);
      setError(null);

      try {
        const [nextResponses, versions] = await Promise.all([
          listFormResponses(form.id, { limit: RESPONSES_FETCH_LIMIT, offset }),
          listFormVersions(form.id),
        ]);
        if (!cancelled) {
          setResponses(nextResponses);
          setVersionNumbersById(
            Object.fromEntries(
              versions.map((version) => [version.id, version.version_number]),
            ),
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load responses.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadResponses();

    return () => {
      cancelled = true;
    };
  }, [form.id, offset]);

  async function exportCsv() {
    setError(null);
    showStatus({ kind: "loading", title: "Exporting CSV", detail: "Preparing response data." });
    try {
      const response = await authenticatedFetch(formResponsesExportUrl(form.id), () => ({}));
      if (!response.ok) {
        throw statusError(response, `Failed to export responses: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${form.slug}-responses.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      showStatus(
        { kind: "success", title: "CSV exported", detail: `${form.slug}-responses.csv` },
        { autoDismissMs: 2800 },
      );
    } catch (exportError) {
      const detail =
        exportError instanceof Error ? exportError.message : "Failed to export responses.";
      setError(detail);
      showStatus({ kind: "error", title: "Export failed", detail }, { autoDismissMs: 5000 });
    }
  }

  return (
    <Panel>
      <ResponsesHeader
        fields={fields}
        form={form}
        latestSubmittedAt={analytics.latestSubmittedAt}
        responseCount={visibleResponses.length}
        onExportCsv={() => void exportCsv()}
      />

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
        <ResponsesSkeleton />
      ) : visibleResponses.length === 0 ? (
        <ResponsesEmptyState />
      ) : (
        <>
          <ResponsesAnalytics analytics={analytics} />
          <ResponsesList
            fields={fields}
            responses={visibleResponses}
            startIndex={offset}
            versionNumbersById={versionNumbersById}
          />
          <ResponsesPagination
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            page={page}
            pageSize={RESPONSES_PAGE_SIZE}
            shownCount={visibleResponses.length}
            onNext={() => setPage((current) => current + 1)}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
          />
        </>
      )}
    </Panel>
  );
}
