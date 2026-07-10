import { TeacherShell } from "@/components/shells/AppShells";
import { requireRole } from "@/lib/auth/session";
import { getTeacherContextNav } from "@/data/dashboardNav";
import { getTeacherContext } from "@/lib/teacher/context";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole("teacher");
  const context = await getTeacherContext();
  const classId = context.selected.mode === "class" ? context.selected.class.id : undefined;

  return <TeacherShell links={getTeacherContextNav(classId)} context={context}>{children}</TeacherShell>;
}
