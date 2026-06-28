import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { FormSchemaEditor } from "@/components/forms/form-schema-editor";
import { LinkButton } from "@/components/ui/primitives";
import { pageShellClassName } from "@/components/ui/styles";
import { getFormBySlug } from "@/lib/api";

type EditFormPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);

  if (!form) {
    notFound();
  }

  return (
    <main className={pageShellClassName}>
      <AppHeader
        path={`/${form.slug}/edit`}
        actions={
          <>
            <LinkButton variant="nav" href={`/forms/${form.slug}`}>
              View form
            </LinkButton>
            <LinkButton variant="nav" href={`/forms/${form.slug}/responses`}>
              Responses
            </LinkButton>
          </>
        }
      />

      <FormSchemaEditor form={form} />
    </main>
  );
}
