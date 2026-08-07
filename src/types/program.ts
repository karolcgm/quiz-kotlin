/** Programy klasowe — kontrakty domenowe. */

export type CurriculumVersionId =
  | "pl-math-4-2026-classic"
  | "pl-math-5-2026-classic"
  | "pl-math-5-2027-reforma26"
  | "pl-math-6-2026-classic";

export type TopicKind = "regular" | "review" | "exam" | "optional" | "diagnostic";

export type TopicContentStatus = "metadata-only" | "draft" | "review" | "published" | "retired";

export type TopicPlanStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "review_needed"
  | "skipped";

/** Status wpisu w DB (WP-014) — `review` w Postgres, `review_needed` w UI programu */
export type TopicPlanEntryStatus = "planned" | "in_progress" | "completed" | "review" | "skipped";

export type ClassCurriculumPlanStatus = "draft" | "active" | "archived";

export interface ClassCurriculumPlanRow {
  id: string;
  school_id: string;
  class_id: string;
  teacher_id: string;
  curriculum_id: string;
  curriculum_version: number;
  school_year: string;
  subject: string;
  status: ClassCurriculumPlanStatus;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TopicPlanEntryRow {
  id: string;
  plan_id: string;
  school_id: string;
  section_id: string;
  topic_id: string;
  position: number;
  planned_start: string | null;
  planned_end: string | null;
  status: TopicPlanEntryStatus;
  completed_at: string | null;
  completed_by: string | null;
  teacher_note: string | null;
  created_at: string;
  updated_at: string;
}

export type CurriculumTopicRequirement = "required" | "recommended" | "optional" | "extension";

export interface ProgramTopic {
  id: string;
  title: string;
  hoursLabel: string;
  coreLesson: string;
  paperEvidence: string;
  kind: TopicKind;
  requirement: CurriculumTopicRequirement;
  contentStatus: TopicContentStatus;
  skillIds: string[];
  prerequisiteTopicIds: string[];
}

export interface ProgramSection {
  id: string;
  number: number;
  title: string;
  hoursLabel: string;
  goal: string;
  topics: ProgramTopic[];
}

export interface ProgramCurriculum {
  id: CurriculumVersionId;
  version: number;
  title: string;
  grade: 4 | 5 | 6;
  subject: "math";
  schoolYearLabel: string;
  effectiveFrom: string;
  sections: ProgramSection[];
  totalTopics: number;
}

export interface TopicPlanEntry {
  topicId: string;
  status: TopicPlanStatus;
  scheduledWeek?: number;
  notes?: string;
}
