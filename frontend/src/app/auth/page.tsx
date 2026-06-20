import { AuthPanel } from "@/components/auth/auth-panel";

export default function AuthPage() {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-page py-8 pb-14 max-sm:w-[calc(100%-24px)] max-sm:pt-5">
      <div className="mb-7">
        <div className="font-display text-xl font-bold tracking-wide text-ink-onDark">
          Dataquest Forms
        </div>
        <div className="text-ink-onDark/75">/auth</div>
      </div>

      <AuthPanel />
    </main>
  );
}
