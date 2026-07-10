export type PaperResultStatus = "draft" | "confirmed" | "absent";

export interface PaperResultItemInput {
  slotId: string;
  position: number;
  skillId: string;
  score: number;
  maxScore: number;
}

export interface PaperResultRow {
  id?: string;
  studentId: string;
  status: PaperResultStatus;
  totalScore: number | null;
  maxScore: number;
  percentage: number | null;
  mark: number | null;
  comment: string | null;
  versionCode: string;
  items: PaperResultItemInput[];
}

export interface PaperResultsStudent {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
}

export interface PaperResultsSlot {
  slotId: string;
  position: number;
  skillId: string;
  maxScore: number;
  label: string;
}
