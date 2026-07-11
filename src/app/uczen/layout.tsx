import { StudentShell } from "@/components/shells/AppShells";
import { requireRole } from "@/lib/auth/session";
import { studentMainNav } from "@/data/dashboardNav";
import { StudentRewardExperience } from "@/components/rewards/StudentRewardExperience";
import { createClient } from "@/lib/supabase/server";
import type { RewardNotification } from "@/types/rewards";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await requireRole("student");
  const supabase = await createClient();
  const [{ data: rewardProfile }, { data: notifications }] = await Promise.all([
    supabase.from("student_reward_profiles").select("theme_id").eq("student_id", student.id).maybeSingle<{ theme_id: string }>(),
    supabase.from("student_reward_notifications").select("id, kind, reward_key, title, message").eq("student_id", student.id).is("seen_at", null).order("created_at", { ascending: true }).limit(5),
  ]);
  const theme = rewardProfile?.theme_id ?? "sky";

  return <StudentShell links={studentMainNav} className={`student-reward-shell theme-${theme}`}><div className="student-reward-theme"><StudentRewardExperience studentId={student.id} notifications={(notifications ?? []) as RewardNotification[]} />{children}</div></StudentShell>;
}
