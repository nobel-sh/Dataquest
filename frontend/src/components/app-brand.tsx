import Link from "next/link";

type AppBrandProps = {
  bold?: boolean;
};

export function AppBrand({ bold = true }: AppBrandProps) {
  return (
    <Link
      className={`font-display text-xl tracking-wide text-ink-onDark transition hover:text-accent ${
        bold ? "font-bold" : ""
      }`}
      href="/"
    >
      Dataquest Forms
    </Link>
  );
}
