import { StudentShell } from "@/components/shells/AppShells";
import { requireRole } from "@/lib/auth/session";
import { studentMainNav } from "@/data/dashboardNav";
import { StudentRewardExperience } from "@/components/rewards/StudentRewardExperience";
import { createClient } from "@/lib/supabase/server";
import type { RewardNotification } from "@/types/rewards";
import type { CSSProperties } from "react";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await requireRole("student");
  const supabase = await createClient();
  const [{ data: rewardProfile }, { data: notifications }] = await Promise.all([
    supabase.from("student_reward_profiles").select("theme_id, fanfare_id, slide_dim_percent").eq("student_id", student.id).maybeSingle<{ theme_id: string; fanfare_id: string; slide_dim_percent: number }>(),
    supabase.from("student_reward_notifications").select("id, kind, reward_key, title, message").eq("student_id", student.id).is("seen_at", null).order("created_at", { ascending: true }).limit(5),
  ]);
  const theme = rewardProfile?.theme_id ?? "sky";
  const slideDim = Math.max(0, Math.min(60, Number(rewardProfile?.slide_dim_percent ?? 30)));
  const slideStyle = {
    "--lesson-presentation-dim": String(slideDim / 100),
    "--lesson-frame-dim": String(Math.min(70, slideDim + 10) / 100),
  } as CSSProperties;

  return <StudentShell links={studentMainNav} className={`student-reward-shell theme-${theme}`}><div className="student-reward-theme" style={slideStyle}><StudentRewardExperience studentId={student.id} fanfareId={rewardProfile?.fanfare_id ?? "classic"} notifications={(notifications ?? []) as RewardNotification[]} />{children}</div></StudentShell>;
}
