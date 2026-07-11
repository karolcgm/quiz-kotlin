export type UnderstandingLevel = "understood" | "partial" | "not_understood";

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
