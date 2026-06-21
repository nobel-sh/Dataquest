import Link from "next/link";
import { notFound } from "next/navigation";
import { AppBrand } from "@/components/app-brand";
import { ResponsesViewer } from "@/components/forms/responses-viewer";
import { SessionMenu } from "@/components/session-menu";
import { getFormBySlug } from "@/lib/api";

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

  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <div className="mb-7 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <AppBrand />
          <div className="text-ink-onDark/75">/{form.slug}/responses</div>
        </div>
        <div className="flex items-center gap-3 max-sm:flex-wrap">
          <Link
            className="border border-line bg-panel px-3 py-2 text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
            href={`/forms/${form.slug}`}
          >
            View form
          </Link>
          <SessionMenu />
        </div>
      </div>

      <ResponsesViewer form={form} />
    </main>
  );
}
