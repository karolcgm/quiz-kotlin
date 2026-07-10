import { TeacherShell } from "@/components/shells/AppShells";
import { requireRole } from "@/lib/auth/session";
import { teacherMainNav } from "@/data/dashboardNav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole("teacher");

  return <TeacherShell links={teacherMainNav}>{children}</TeacherShell>;
}
