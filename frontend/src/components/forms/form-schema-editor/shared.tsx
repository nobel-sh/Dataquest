export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-line p-4 last:border-r-0 max-sm:border-b max-sm:border-r-0 max-sm:last:border-b-0">
      <div className="font-display text-2xl leading-none">{value}</div>
      <div className="mt-1 text-ink-muted">{label}</div>
    </div>
  );
}

export function ErrorList({ errors }: { errors: string[] }) {
  return (
    <div className="border border-line-error bg-error px-4 py-3 text-sm text-danger">
      {errors.map((error) => (
        <div key={error}>{error}</div>
      ))}
    </div>
  );
}
