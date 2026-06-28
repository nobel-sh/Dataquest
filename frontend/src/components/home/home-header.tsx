import { AppBrand } from "@/components/app-brand";
import { SessionMenu } from "@/components/session-menu";

export function HomeHeader() {
  return (
    <header className="mb-8 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
      <AppBrand />
      <div className="flex items-center gap-2 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
        <SessionMenu />
      </div>
    </header>
  );
}
