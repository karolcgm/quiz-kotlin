import type { StudentLearningPlanItem } from "@/types/studentLearningPlan";

export function mapStudentLearningPlanRow(row: Record<string, unknown>): StudentLearningPlanItem {
  const sourceKind = row.sourceKind === "assessment" ? "assessment" : "lesson";

  return {
    sourceKind,
    sessionId: String(row.sessionId ?? ""),
    lessonId: String(row.lessonId),
    lessonVersion: Number(row.lessonVersion ?? 1),
    lessonTitle: String(row.lessonTitle ?? (sourceKind === "assessment" ? "Test" : "Lekcja")),
    topicId: String(row.topicId ?? ""),
    sectionId: String(row.sectionId ?? ""),
    taughtAt: String(row.taughtAt),
    score: Number(row.score ?? 0),
    maxScore: Number(row.maxScore ?? 0),
    completedAttempts: Number(row.completedAttempts ?? 0),
    latestReviewAt: row.latestReviewAt ? String(row.latestReviewAt) : null,
    inProgressReviewId: row.inProgressReviewId ? String(row.inProgressReviewId) : null,
    textbookPage: row.textbookPage == null ? null : Number(row.textbookPage),
    coveredExercises: Array.isArray(row.coveredExercises) ? row.coveredExercises.map(String) : [],
    resultId: row.resultId ? String(row.resultId) : null,
    assignmentId: row.assignmentId ? String(row.assignmentId) : null,
  };
}
