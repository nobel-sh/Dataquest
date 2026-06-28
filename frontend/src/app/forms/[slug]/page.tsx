import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { PublicForm } from "@/components/public-form";
import { LinkButton } from "@/components/ui/primitives";
import { pageShellClassName } from "@/components/ui/styles";
import { getFormBySlug } from "@/lib/api";

type FormPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function FormPage({ params }: FormPageProps) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);

  if (!form) {
    notFound();
  }

  return (
    <main className={pageShellClassName}>
      <AppHeader
        path={`/${form.slug}`}
        actions={
          <>
            <LinkButton variant="nav" href={`/forms/${form.slug}/edit`}>
              Edit
            </LinkButton>
            <LinkButton variant="nav" href={`/forms/${form.slug}/responses`}>
              Responses
            </LinkButton>
          </>
        }
      />
      <PublicForm form={form} />
    </main>
  );
}
