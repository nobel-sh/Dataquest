import { notFound } from "next/navigation";
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
        <div className="font-display text-xl font-bold tracking-wide text-ink-onDark">
          Dataquest Forms
        </div>
        <div className="text-ink-onDark/75">/{form.slug}</div>
      </div>
      <PublicForm form={form} />
    </main>
  );
}
