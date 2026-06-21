import { PanelShell } from "@/components/layout/PanelShell";
import { requireRole } from "@/lib/auth/session";
import { studentMainNav } from "@/data/dashboardNav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("student");

  return <PanelShell links={studentMainNav}>{children}</PanelShell>;
}
