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
      .select("total_points, theme_id")
      .eq("student_id", student.id)
      .maybeSingle<{ total_points: number; theme_id: string }>(),
  ]);
  if (!review) notFound();
  return <SelfPacedLessonPlayer
    initialReview={review}
    initialThemeId={rewardProfile?.theme_id ?? "sky"}
    totalPoints={Number(rewardProfile?.total_points ?? 0)}
  />;
}
