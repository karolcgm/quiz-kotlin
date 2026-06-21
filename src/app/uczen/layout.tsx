import { PanelShell } from "@/components/layout/PanelShell";
import { requireRole } from "@/lib/auth/session";
import { studentNavCategories } from "@/data/dashboardNav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("student");

  return <PanelShell categories={studentNavCategories}>{children}</PanelShell>;
}
