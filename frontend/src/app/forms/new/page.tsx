import { AppHeader } from "@/components/app-header";
import { NewFormCreator } from "@/components/forms/new-form-creator";
import { LinkButton } from "@/components/ui/primitives";
import { pageShellClassName } from "@/components/ui/styles";

export default function NewFormPage() {
  return (
    <main className={pageShellClassName}>
      <AppHeader
        path="/forms/new"
        actions={
          <>
            <LinkButton variant="nav" href="/forms">
              My forms
            </LinkButton>
            <LinkButton variant="nav" href="/">
              Home
            </LinkButton>
          </>
        }
      />

      <NewFormCreator />
    </main>
  );
}
