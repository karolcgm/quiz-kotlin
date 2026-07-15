import type { LessonEvidenceSource, UnderstandingCriterionConfig } from "@/types/lessonPackage";

export type UnderstandingLevel = "understood" | "partial" | "not_understood";

export type UnderstandingCriterionStatus = "mastered" | "needs_work" | "no_evidence";

export interface UnderstandingEvidenceScore {
  evidenceId: string;
  skillIds: string[];
  score: number;
  maxScore: number;
  source: LessonEvidenceSource;
}

export interface UnderstandingCriterionResult extends UnderstandingCriterionConfig {
  status: UnderstandingCriterionStatus;
  score: number;
  maxScore: number;
}

export interface UnderstandingAssessmentResult {
  source: LessonEvidenceSource | null;
  score: number;
  maxScore: number;
  criteria: UnderstandingCriterionResult[];
  correctFeedback: string;
  improvementFeedback: string;
  nextStep: string;
}

export interface LessonUnderstandingStudentRow {
  studentId: string;
  displayName: string;
  understandingLevel: UnderstandingLevel | null;
  updatedAt: string | null;
}

export interface LessonUnderstandingSessionStats {
  totalStudents: number;
  submittedCount: number;
  understoodCount: number;
  partialCount: number;
  notUnderstoodCount: number;
  needsReviewCount: number;
  needsReviewPercent: number;
  students: LessonUnderstandingStudentRow[];
}

export interface TeacherLessonUnderstandingRow {
  checkId: string;
  studentId: string;
  displayName: string;
  classId: string;
  className: string;
  groupName: string;
  lessonId: string;
  lessonTitle: string;
  sectionId: string;
  topicId: string;
  sourceType: "live" | "review";
  understandingLevel: UnderstandingLevel;
  checkedAt: string;
}
