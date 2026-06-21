import { notFound } from "next/navigation";
import Link from "next/link";
import { AppBrand } from "@/components/app-brand";
import { PublicForm } from "@/components/public-form";
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
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <div className="mb-7 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <AppBrand />
        <div className="flex items-center gap-3 text-ink-onDark/75 max-sm:flex-wrap">
          <span>/{form.slug}</span>
          <Link
            className="border border-line bg-panel px-3 py-2 text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
            href={`/forms/${form.slug}/edit`}
          >
            Edit
          </Link>
          <Link
            className="border border-line bg-panel px-3 py-2 text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
            href={`/forms/${form.slug}/responses`}
          >
            Responses
          </Link>
        </div>
      </div>
      <PublicForm form={form} />
    </main>
  );
}
