import { notFound } from "next/navigation";
import { SelfPacedLessonPlayer } from "@/components/student/SelfPacedLessonPlayer";
import { getStudentLessonReview } from "@/lib/actions/studentLearningPlan";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function StudentLessonReviewPage({ params }: { params: Promise<{ reviewId: string }> }) {
  await requireRole("student");
  const { reviewId } = await params;
  const review = await getStudentLessonReview(reviewId);
  if (!review) notFound();
  return <SelfPacedLessonPlayer initialReview={review} />;
}
