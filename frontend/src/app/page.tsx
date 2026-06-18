"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  function openForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedSlug = slug.trim();
    if (normalizedSlug) {
      router.push(`/forms/${normalizedSlug}`);
    }
  }

  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <div className="mb-7 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <div className="font-display text-xl tracking-wide text-ink-onDark">
            Dataquest Forms
          </div>
          <div className="text-ink-onDark/75">Open a published form by slug.</div>
        </div>
      </div>

      <section className="overflow-hidden bg-panel shadow-panel">
        <div className="p-7 max-sm:p-5">
          <h1 className="text-center m-0 font-display text-[clamp(30px,4vw,46px)] leading-tight">
            Open Form
          </h1>

          <p className="mt-8 max-w-[720px] leading-6 text-ink-muted">
            Enter a form slug to load its current schema and submit a response.
          </p>
          <form
            className="mt-4 flex gap-2.5 max-sm:flex-col max-sm:items-stretch"
            onSubmit={openForm}
          >
            <input
              className="min-h-control w-full max-w-[360px] border border-line bg-[#30333d] px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted/70 hover:border-[#5f6368] focus:border-accent focus:bg-[#333642] focus:shadow-focus max-sm:max-w-none"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="student-feedback"
              aria-label="Form slug"
            />
            <button
              className="min-h-control border border-accent bg-accent px-6 py-2 font-bold tracking-wide text-ink-button shadow-[0_8px_18px_rgba(161,66,244,0.22)] transition hover:border-accent-hover hover:bg-accent-hover focus:shadow-focus"
              type="submit"
            >
              Open
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
