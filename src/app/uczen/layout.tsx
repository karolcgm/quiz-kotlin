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
    supabase.from("student_reward_profiles").select("theme_id, fanfare_id, slide_brightness_offset, background_brightness_offset").eq("student_id", student.id).maybeSingle<{ theme_id: string; fanfare_id: string; slide_brightness_offset: number; background_brightness_offset: number }>(),
    supabase.from("student_reward_notifications").select("id, kind, reward_key, title, message").eq("student_id", student.id).is("seen_at", null).order("created_at", { ascending: true }).limit(5),
  ]);
  const theme = rewardProfile?.theme_id ?? "sky";
  const slideOffset = Math.max(-50, Math.min(50, Number(rewardProfile?.slide_brightness_offset ?? 0)));
  const backgroundOffset = Math.max(-50, Math.min(50, Number(rewardProfile?.background_brightness_offset ?? 0)));
  const slideStyle = {
    "--lesson-presentation-dim": String(Math.max(0, Math.min(.85, .30 - slideOffset / 100))),
    "--lesson-frame-dim": String(Math.max(0, Math.min(.85, .40 - slideOffset / 100))),
    "--reward-wallpaper-brightness": String(Math.max(.5, Math.min(1.5, 1 + backgroundOffset / 100))),
  } as CSSProperties;

  return <StudentShell links={studentMainNav} className={`student-reward-shell theme-${theme}`}><div className="student-reward-theme" style={slideStyle}><StudentRewardExperience studentId={student.id} fanfareId={rewardProfile?.fanfare_id ?? "classic"} notifications={(notifications ?? []) as RewardNotification[]} />{children}</div></StudentShell>;
}
