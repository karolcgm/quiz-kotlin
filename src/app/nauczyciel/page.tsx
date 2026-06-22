import { TeacherHomeDashboard } from "@/components/teacher/TeacherHomeDashboard";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { loadTeacherDashboardData } from "@/lib/teacher/dashboardData";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const profile = await requireRole("teacher");
  const supabase = await createClient();
  const data = await loadTeacherDashboardData(supabase);

  return (
    <TeacherHomeDashboard
      displayName={profile.displayName ?? profile.email ?? "Nauczycielu"}
      data={data}
    />
  );
}
