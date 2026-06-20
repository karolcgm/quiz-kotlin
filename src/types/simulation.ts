import type { GradeLevel, SubjectId } from "./curriculum";

export type SimulationStatus = "planned" | "mvp" | "ready";
export type SimulationAgeGroup = "early" | "middle" | "exam";
export type SimulationDifficulty = "easy" | "medium" | "advanced";
export type SimulationVisualKind =
  | "number-line"
  | "fraction"
  | "geometry"
  | "measurement"
  | "chart"
  | "algebra"
  | "game";
export type SimulationInteractionKind =
  | "slider"
  | "drag"
  | "input"
  | "compare"
  | "build"
  | "observe";

export interface Simulation {
  slug: string;
  title: string;
  shortDescription: string;
  subjectId: SubjectId;
  grades: GradeLevel[];
  sectionId: string;
  topicId: string;
  status: SimulationStatus;
  tags: string[];
  ageGroup: SimulationAgeGroup;
  difficulty: SimulationDifficulty;
  visualKind: SimulationVisualKind;
  interactionKind: SimulationInteractionKind;
  teacherHint: string;
  featured?: boolean;
  assessmentReady?: boolean;
  assessmentSkills?: string[];
}
