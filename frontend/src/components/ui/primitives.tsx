import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/classes";
import {
  cardClassName,
  compactInputClassName,
  errorAlertClassName,
  inputClassName,
  navButtonClassName,
  panelButtonClassName,
  panelClassName,
  primaryButtonClassName,
  primaryButtonLargeClassName,
  secondaryButtonClassName,
  skeletonBlockClassName,
  successAlertClassName,
} from "@/components/ui/styles";

type ButtonVariant = "primary" | "primaryLarge" | "secondary" | "panel" | "nav";

const buttonClassNames: Record<ButtonVariant, string> = {
  primary: primaryButtonClassName,
  primaryLarge: primaryButtonLargeClassName,
  secondary: secondaryButtonClassName,
  panel: panelButtonClassName,
  nav: navButtonClassName,
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = "secondary", ...props }: ButtonProps) {
  return <button className={cn(buttonClassNames[variant], className)} {...props} />;
}

type LinkButtonProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  href: string;
  variant?: ButtonVariant;
};

export function LinkButton({ className, href, variant = "panel", ...props }: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonClassNames[variant], className)}
      href={href as ComponentPropsWithoutRef<typeof Link>["href"]}
      {...props}
    />
  );
}

type PanelProps = ComponentPropsWithoutRef<"section">;

export function Panel({ className, ...props }: PanelProps) {
  return <section className={cn(panelClassName, className)} {...props} />;
}

type CardProps = ComponentPropsWithoutRef<"div"> & {
  asSection?: boolean;
};

export function Card({ asSection = false, className, ...props }: CardProps) {
  if (asSection) {
    return <section className={cn(cardClassName, className)} {...props} />;
  }

  return <div className={cn(cardClassName, className)} {...props} />;
}

type AlertProps = ComponentPropsWithoutRef<"div"> & {
  tone?: "success" | "error";
};

export function Alert({ className, tone = "error", ...props }: AlertProps) {
  return (
    <div
      className={cn(tone === "success" ? successAlertClassName : errorAlertClassName, className)}
      {...props}
    />
  );
}

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
  compact?: boolean;
};

export function TextInput({ className, compact = false, ...props }: TextInputProps) {
  return <input className={cn(compact ? compactInputClassName : inputClassName, className)} {...props} />;
}

type TextAreaProps = ComponentPropsWithoutRef<"textarea"> & {
  compact?: boolean;
};

export function TextArea({ className, compact = false, ...props }: TextAreaProps) {
  return (
    <textarea className={cn(compact ? compactInputClassName : inputClassName, className)} {...props} />
  );
}

type SelectInputProps = ComponentPropsWithoutRef<"select"> & {
  compact?: boolean;
};

export function SelectInput({ className, compact = false, ...props }: SelectInputProps) {
  return <select className={cn(compact ? compactInputClassName : inputClassName, className)} {...props} />;
}

type SkeletonProps = ComponentPropsWithoutRef<"div">;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn(skeletonBlockClassName, className)} {...props} />;
}

type FieldShellProps = {
  children: ReactNode;
  className?: string;
};

export function FieldShell({ children, className }: FieldShellProps) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

type MetricTileProps = {
  label: string;
  value: string;
};

export function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="min-w-0 border-r border-line p-4 last:border-r-0 max-sm:border-b max-sm:border-r-0 max-sm:last:border-b-0">
      <div className="break-words font-display text-2xl leading-none">{value}</div>
      <div className="mt-1 text-ink-muted">{label}</div>
    </div>
  );
}
