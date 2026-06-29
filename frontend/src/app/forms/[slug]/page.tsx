import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { FormPageActions } from "@/components/forms/form-page-actions";
import { PublicForm } from "@/components/public-form";
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
        actions={<FormPageActions ownerId={form.owner_id} slug={form.slug} />}
      />
      <PublicForm form={form} />
    </main>
  );
}
