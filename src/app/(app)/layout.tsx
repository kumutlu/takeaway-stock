import AppShell from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { appUser } = await requireUser();
  return (
    <AppShell role={appUser.role} projectName={appUser.project.name} projectCode={appUser.project.code}>
      {children}
    </AppShell>
  );
}
