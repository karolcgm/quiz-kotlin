export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SubjectId =
  | "math"
  | "polish"
  | "science"
  | "biology"
  | "geography"
  | "physics"
  | "chemistry"
  | "history"
  | "early-education";

export type CurriculumStage = "early" | "grades-4-8";

export interface Grade {
  id: GradeLevel;
  name: string;
  stage: CurriculumStage;
  description: string;
}

export interface Subject {
  id: SubjectId;
  name: string;
  description: string;
  grades: GradeLevel[];
}

export interface CurriculumSection {
  id: string;
  subjectId: SubjectId;
  grade: GradeLevel;
  title: string;
  description: string;
  topics: CurriculumTopic[];
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  simulationSlugs: string[];
}
