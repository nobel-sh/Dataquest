import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ResponsesViewer } from "@/components/forms/responses-viewer";
import { LinkButton } from "@/components/ui/primitives";
import { pageShellClassName } from "@/components/ui/styles";
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
    <main className={pageShellClassName}>
      <AppHeader
        path={`/${form.slug}/responses`}
        actions={
          <LinkButton variant="nav" href={`/forms/${form.slug}`}>
            View form
          </LinkButton>
        }
      />

      <ResponsesViewer form={form} />
    </main>
  );
}
