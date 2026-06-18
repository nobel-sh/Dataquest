export default function NotFound() {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <section className="overflow-hidden rounded-2xl border border-line-error bg-panel shadow-panel">
        <div className="h-3 bg-danger" />
        <div className="px-6 py-5">
          <strong className="font-display text-xl">Form not found</strong>
          <div className="mt-1 text-ink-muted">Check the slug and try again.</div>
        </div>
      </section>
    </main>
  );
}
