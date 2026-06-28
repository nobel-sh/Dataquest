import type { FormEvent, ReactNode } from "react";
import { formSlugButtonClassName, formSlugInputClassName } from "@/components/ui/styles";

type HomeHeroProps = {
  actions: ReactNode;
  description: string;
  eyebrow: string;
  slug: string;
  slugAriaLabel: string;
  submitLabel: string;
  title: string;
  onSlugChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function HomeHero({
  actions,
  description,
  eyebrow,
  slug,
  slugAriaLabel,
  submitLabel,
  title,
  onSlugChange,
  onSubmit,
}: HomeHeroProps) {
  return (
    <section className="relative grid min-h-[560px] overflow-hidden border border-line bg-[radial-gradient(circle_at_18%_0%,rgba(138,180,248,0.12),transparent_30rem),linear-gradient(145deg,#181a20_0%,#1b1d23_58%,#202126_100%)] p-8 shadow-panel max-sm:min-h-[520px] max-sm:p-5">
      <div className="relative grid max-w-[760px] content-between gap-10">
        <div>
          <div className="mb-5 inline-flex border border-line bg-panel px-3 py-2 text-xs uppercase text-ink-muted">
            {eyebrow}
          </div>
          <h1 className="m-0 font-display text-5xl leading-tight max-sm:text-4xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-ink-muted max-sm:text-base max-sm:leading-7">
            {description}
          </p>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-3 sm:flex">{actions}</div>
          <form
            className="grid max-w-[640px] grid-cols-[1fr_auto] border border-line bg-panel max-sm:grid-cols-1"
            onSubmit={onSubmit}
          >
            <input
              aria-label={slugAriaLabel}
              className={formSlugInputClassName}
              placeholder="student-feedback"
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
            />
            <button className={formSlugButtonClassName} type="submit">
              {submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
