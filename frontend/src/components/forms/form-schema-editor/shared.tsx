export function ErrorList({ errors }: { errors: string[] }) {
  return (
    <div className="border border-line-error bg-error px-4 py-3 text-sm text-danger">
      {errors.map((error) => (
        <div key={error}>{error}</div>
      ))}
    </div>
  );
}
