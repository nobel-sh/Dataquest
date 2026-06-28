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
import {
  ResponsesEmptyState,
  ResponsesHeader,
  ResponsesList,
  ResponsesSkeleton,
} from "@/components/forms/responses-sections";
import { authenticatedFetch } from "@/lib/auth";
import { statusError } from "@/lib/http-error";
import type { FormRecord, FormResponse } from "@/lib/types";

type ResponsesViewerProps = {
  form: FormRecord;
};

export function ResponsesViewer({ form }: ResponsesViewerProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [versionNumbersById, setVersionNumbersById] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fields = form.latest_version.schema.fields;

  useEffect(() => {
    let cancelled = false;

    async function loadResponses() {
      setIsLoading(true);
      setError(null);

      try {
        const [nextResponses, versions] = await Promise.all([
          listFormResponses(form.id),
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
  }, [form.id]);

  async function exportCsv() {
    setError(null);
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
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Failed to export responses.");
    }
  }

  return (
    <Panel>
      <ResponsesHeader
        fields={fields}
        form={form}
        responseCount={responses.length}
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
      ) : responses.length === 0 ? (
        <ResponsesEmptyState />
      ) : (
        <ResponsesList
          fields={fields}
          responses={responses}
          versionNumbersById={versionNumbersById}
        />
      )}
    </Panel>
  );
}
