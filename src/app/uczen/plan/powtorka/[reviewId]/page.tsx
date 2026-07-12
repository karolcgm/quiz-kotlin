import { notFound } from "next/navigation";
import { SelfPacedLessonPlayer } from "@/components/student/SelfPacedLessonPlayer";
import { getStudentLessonReview } from "@/lib/actions/studentLearningPlan";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentLessonReviewPage({ params }: { params: Promise<{ reviewId: string }> }) {
  const student = await requireRole("student");
  const { reviewId } = await params;
  const supabase = await createClient();
  const [review, { data: rewardProfile }] = await Promise.all([
    getStudentLessonReview(reviewId),
    supabase.from("student_reward_profiles")
      .select("theme_id, slide_brightness_offset, background_brightness_offset")
      .eq("student_id", student.id)
      .maybeSingle<{ theme_id: string; slide_brightness_offset: number; background_brightness_offset: number }>(),
  ]);
  if (!review) notFound();
  return <SelfPacedLessonPlayer
    initialReview={review}
    initialThemeId={rewardProfile?.theme_id ?? "sky"}
    slideBrightnessOffset={Number(rewardProfile?.slide_brightness_offset ?? 0)}
  />;
}
