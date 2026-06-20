import type { TestSkill, TestWidgetAnswer } from "@/types/testWidget";

export type SubmissionStatus = "in_progress" | "submitted" | "graded";
export type SchoolMark = 1 | 2 | 3 | 4 | 5 | 6;

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  attemptNumber: number;
  status: SubmissionStatus;
  totalScore: number;
  maxScore: number;
  percentage: number;
  submittedAt: string | null;
}

export interface SubmissionAnswer {
  id: string;
  submissionId: string;
  testItemId: string;
  skill: TestSkill;
  answer: TestWidgetAnswer;
  isCorrect: boolean;
  score: number;
  maxScore: number;
}

export interface SkillScore {
  skill: TestSkill;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface SubmissionScore {
  submissionId: string;
  mark1To6: SchoolMark;
  generatedFeedbackText: string;
  manualFeedbackText: string | null;
  feedbackText: string;
  retakeAllowed: boolean;
  isTeacherOverride: boolean;
  gradedBy: string | null;
  gradedAt: string;
}
