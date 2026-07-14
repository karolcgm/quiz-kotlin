import type { LessonSessionSnapshotPayload } from "@/types/lessonSession";

export interface StudentLearningPlanItem {
  sessionId: string;
  lessonId: string;
  lessonVersion: number;
  lessonTitle: string;
  topicId: string;
  sectionId: string;
  taughtAt: string;
  score: number;
  maxScore: number;
  completedAttempts: number;
  latestReviewAt: string | null;
  inProgressReviewId: string | null;
  textbookPage: number | null;
  coveredExercises: string[];
}

export interface StudentLessonReviewAnswer {
  stageId: string;
  correct: boolean;
  answerLabel?: string;
  submittedAt: string;
}

export interface StudentLessonReviewView {
  reviewId: string;
  lessonId: string;
  lessonVersion: number;
  attemptNumber: number;
  status: "in_progress" | "completed";
  answers: Record<string, StudentLessonReviewAnswer>;
  score: number;
  maxScore: number;
  currentStageIndex: number;
  textbookPage: number | null;
  coveredExercises: string[];
  stageSnapshot: LessonSessionSnapshotPayload;
}
