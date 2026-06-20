export type AssignmentStatus = "draft" | "published" | "closed";

export interface Assignment {
  id: string;
  testId: string;
  teacherId: string;
  schoolId: string;
  classId: string | null;
  title: string;
  dueAt: string | null;
  maxAttempts: number;
  status: AssignmentStatus;
  publishedAt: string | null;
}

export interface AssignmentRecipient {
  assignmentId: string;
  studentId: string;
}
