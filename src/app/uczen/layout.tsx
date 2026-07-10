import { StudentShell } from "@/components/shells/AppShells";
import { requireRole } from "@/lib/auth/session";
import { studentMainNav } from "@/data/dashboardNav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("student");

  return <StudentShell links={studentMainNav}>{children}</StudentShell>;
}
