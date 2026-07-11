/** Pakiet lekcyjny — kontrakt spec §21–22 */

export type LessonPackageStatus = "draft" | "review" | "published" | "retired";

export type LessonStageKind =
  | "warmup"
  | "predict"
  | "explore"
  | "discuss"
  | "worked-example"
  | "practice"
  | "challenge"
  | "exit-ticket";

export type LessonViewChannel = "board" | "student" | "print";

export type LessonDifficulty = "support" | "core" | "challenge";

export type LessonModelId = "order-director" | "place-value-factory" | "number-line-jumps" | "multiplication-grid" | "diagnostic-stations" | "exercise-board" | "class4-review" | "natural-numbers-lesson" | "mental-add-sub-lesson" | "mental-mul-div-lesson" | "order-of-operations-lesson";

/** Krótki, opcjonalny przebieg do poprowadzenia na tablicy podczas Live. */
export interface LiveStageConfig {
  enabled: boolean;
  kind: "presentation" | "exercise" | "quick-check";
  minutes: number;
}

export interface BoardStageConfig {
  layout: "narrative" | "model" | "split";
  headline: string;
  body?: string;
  modelId?: LessonModelId;
  modelSeed?: number;
  modelSeedPool?: number[];
  modelDifficulty?: LessonDifficulty;
  bullets?: string[];
}

export interface StudentStageConfig {
  activityMode: "view" | "respond" | "practice";
  instruction: string;
  modelId?: LessonModelId;
  modelSeed?: number;
  modelSeedPool?: number[];
  modelDifficulty?: LessonDifficulty;
}

export interface PrintWorksheetItem {
  id: string;
  questionId?: string;
  expression: string;
  prompt: string;
}

export interface PrintStageConfig {
  worksheetTitle: string;
  instructions: string;
  itemCount?: number;
  items?: PrintWorksheetItem[];
  showKey?: boolean;
  /** Pełny arkusz A4 w `/druk` */
  printableResourceId?: string;
}

export interface RevealStep {
  id: string;
  label: string;
  boardHeadline?: string;
  boardBody?: string;
}

export interface QuestionReference {
  id: string;
  generatorId?: string;
  seed?: number;
  difficulty?: LessonDifficulty;
}

export interface LessonStage {
  id: string;
  kind: LessonStageKind;
  title: string;
  studentInstruction: string;
  teacherInstruction: string;
  estimatedMinutes: number;
  live?: LiveStageConfig;
  board: BoardStageConfig;
  student?: StudentStageConfig;
  print?: PrintStageConfig;
  revealSteps: RevealStep[];
  questions: QuestionReference[];
  discussionPrompts: string[];
  accessibilityNotes: string[];
}

export interface TeacherGuide {
  overview: string;
  timingNotes: string;
  materials: string[];
  stageNotes: Record<string, string>;
  commonMisconceptions: string[];
  differentiation: {
    support: string;
    core: string;
    challenge: string;
  };
  openingScript: string;
  closingScript: string;
  exitTicketRubric: string;
  paperWithoutDevices: string;
  languageReview: string;
}

export interface LessonPackage {
  id: string;
  version: number;
  curriculumId: string;
  sectionId: string;
  topicId: string;
  lessonNumber: number;
  title: string;
  estimatedMinutes: number;
  studentGoal: string;
  successCriteria: string[];
  prerequisiteSkillIds: string[];
  skillIds: string[];
  stages: LessonStage[];
  teacherGuide: TeacherGuide;
  printableResourceIds: string[];
  status: LessonPackageStatus;
}

export const LESSON_STAGE_KIND_LABELS: Record<LessonStageKind, string> = {
  warmup: "Wejście",
  predict: "Przewiduj",
  explore: "Odkryj",
  discuss: "Nazwij",
  "worked-example": "Przykład",
  practice: "Ćwicz",
  challenge: "Wyzwanie",
  "exit-ticket": "Bilet",
};
