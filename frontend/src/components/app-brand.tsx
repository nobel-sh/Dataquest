import Link from "next/link";

export function AppBrand() {
  return (
    <Link
      className="font-display text-[1.75rem] tracking-wide text-ink-onDark transition hover:text-accent"
      href="/"
    >
      Dataquest Forms
    </Link>
  );
}
