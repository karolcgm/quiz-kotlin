import { PanelShell } from "@/components/layout/PanelShell";
import { requireRole } from "@/lib/auth/session";
import { teacherNavCategories } from "@/data/dashboardNav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole("teacher");

  return <PanelShell categories={teacherNavCategories}>{children}</PanelShell>;
}
