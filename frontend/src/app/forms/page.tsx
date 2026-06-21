import Link from "next/link";
import { AppBrand } from "@/components/app-brand";
import { FormsDashboard } from "@/components/forms/forms-dashboard";
import { SessionMenu } from "@/components/session-menu";

export default function FormsPage() {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <div className="mb-7 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <AppBrand />
          <div className="text-ink-onDark/75">/forms</div>
        </div>
        <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
          <Link
            className="border border-line bg-panel px-3 py-2 text-sm text-ink transition hover:border-accent hover:text-ink-onDark"
            href="/"
          >
            Home
          </Link>
          <SessionMenu />
        </div>
      </div>

      <FormsDashboard />
    </main>
  );
}
