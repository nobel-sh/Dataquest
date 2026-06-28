import type { ReactNode } from "react";
import { AppBrand } from "@/components/app-brand";
import { SessionMenu } from "@/components/session-menu";

type AppHeaderProps = {
  path?: string;
  actions?: ReactNode;
};

export function AppHeader({ actions, path }: AppHeaderProps) {
  return (
    <div className="mb-7 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
      <div className="min-w-0">
        <AppBrand />
        {path ? <div className="break-all text-ink-onDark/75">{path}</div> : null}
      </div>
      <div className="grid gap-2 max-sm:w-full sm:flex sm:items-center">
        {actions}
        <SessionMenu />
      </div>
    </div>
  );
}
