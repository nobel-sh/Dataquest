import { AppHeader } from "@/components/app-header";
import { FormsDashboard } from "@/components/forms/forms-dashboard";
import { LinkButton } from "@/components/ui/primitives";
import { pageShellClassName } from "@/components/ui/styles";

export default function FormsPage() {
  return (
    <main className={pageShellClassName}>
      <AppHeader
        path="/forms"
        actions={
          <LinkButton variant="nav" href="/">
            Home
          </LinkButton>
        }
      />

      <FormsDashboard />
    </main>
  );
}
