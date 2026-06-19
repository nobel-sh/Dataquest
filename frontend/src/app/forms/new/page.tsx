import Link from "next/link";
import { NewFormCreator } from "@/components/forms/new-form-creator";

export default function NewFormPage() {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <div className="mb-7 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <div className="font-display text-xl font-bold tracking-wide text-ink-onDark">
            Dataquest Forms
          </div>
          <div className="text-ink-onDark/75">/forms/new</div>
        </div>
        <Link
          className="border border-line bg-panel px-3 py-2 text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
          href="/"
        >
          Home
        </Link>
      </div>

      <NewFormCreator />
    </main>
  );
}
