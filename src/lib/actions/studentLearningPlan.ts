"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { StudentLearningPlanItem, StudentLessonReviewView } from "@/types/studentLearningPlan";
import type { UnderstandingLevel } from "@/types/understanding";

export async function getStudentLearningPlan(): Promise<StudentLearningPlanItem[]> {
  await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_student_learning_plan");
  if (error || !Array.isArray(data)) return [];
  return (data as Array<Record<string, unknown>>).map((row) => ({
    sessionId: String(row.sessionId), lessonId: String(row.lessonId), lessonVersion: Number(row.lessonVersion),
    lessonTitle: String(row.lessonTitle ?? "Lekcja"), topicId: String(row.topicId ?? ""), sectionId: String(row.sectionId ?? ""),
    taughtAt: String(row.taughtAt), score: Number(row.score ?? 0), maxScore: Number(row.maxScore ?? 0),
    completedAttempts: Number(row.completedAttempts ?? 0), latestReviewAt: row.latestReviewAt ? String(row.latestReviewAt) : null,
    inProgressReviewId: row.inProgressReviewId ? String(row.inProgressReviewId) : null,
    textbookPage: row.textbookPage == null ? null : Number(row.textbookPage),
    coveredExercises: Array.isArray(row.coveredExercises) ? row.coveredExercises.map(String) : [],
  }));
}

export async function startStudentLessonReviewAction(formData: FormData) {
  await requireRole("student");
  const lessonId = formData.get("lessonId")?.toString();
  if (!lessonId) throw new Error("Brak lekcji.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_student_lesson_review", { target_lesson_id: lessonId });
  if (error || !data) throw new Error(error?.message ?? "Nie udało się rozpocząć zaliczenia.");
  redirect(`/uczen/plan/powtorka/${String((data as Record<string, unknown>).reviewId)}`);
}

export async function cancelStudentLessonReviewAction(formData: FormData) {
  await requireRole("student");
  const reviewId = formData.get("reviewId")?.toString();
  if (!reviewId) throw new Error("Brak rozpoczętego zaliczenia.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_student_lesson_review", { target_review_id: reviewId });
  if (error) throw new Error(error.message);
  revalidatePath("/uczen/plan");
}

export async function getStudentLessonReview(reviewId: string): Promise<StudentLessonReviewView | null> {
  await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_student_lesson_review", { target_review_id: reviewId });
  if (error || !data) return null;
  const review = data as StudentLessonReviewView;
  return {
    ...review,
    textbookPage: review.textbookPage == null ? null : Number(review.textbookPage),
    coveredExercises: Array.isArray(review.coveredExercises) ? review.coveredExercises.map(String) : [],
  };
}

export async function submitStudentLessonReviewAnswerAction(input: { reviewId: string; stageId: string; questionId: string; stageIndex: number; correct: boolean; answerLabel?: string; selectedOperatorIndex?: number }) {
  await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_student_lesson_review_answer", {
    target_review_id: input.reviewId, target_stage_id: input.stageId, target_question_id: input.questionId,
    client_attempt_id: crypto.randomUUID(), public_answer: { selectedOperatorIndex: input.selectedOperatorIndex ?? (input.correct ? 1 : 0), answerLabel: input.answerLabel ?? null },
    target_stage_index: input.stageIndex,
  });
  if (error) return { ok: false as const, error: error.message };
  const result = data as Record<string, unknown>;
  return { ok: true as const, correct: Boolean(result.correct), score: Number(result.score ?? 0), maxScore: Number(result.maxScore ?? 0) };
}

export async function resetStudentLessonReviewAction(reviewId: string) {
  await requireRole("student");
  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_student_lesson_review", { target_review_id: reviewId });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function finishStudentLessonReviewAction(reviewId: string, understandingLevel: UnderstandingLevel) {
  await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("finish_student_lesson_review", {
    target_review_id: reviewId,
    target_understanding_level: understandingLevel,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/uczen/plan"); revalidatePath("/uczen"); revalidatePath("/uczen/klaser");
  const result = data as Record<string, unknown>;
  return { ok: true as const, score: Number(result.score ?? 0), maxScore: Number(result.maxScore ?? 0) };
}
