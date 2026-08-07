/** Pakiet lekcyjny — kontrakt spec §21–22 */

import type { LessonQuestionFeedbackPolicy } from "@/types/diagnosticFeedback";
import type { LessonStageRuntimeContract } from "@/types/lessonRuntime";

export type LessonPackageStatus = "draft" | "review" | "published" | "retired";

export type LessonStageKind =
  | "warmup"
  | "predict"
  | "explore"
  | "discuss"
  | "worked-example"
  | "practice"
  | "challenge"
  | "exit-ticket"
  | "understanding";

export type LessonViewChannel = "board" | "student" | "print";

export type LessonDifficulty = "support" | "core" | "challenge";

export type LessonModelId = "grade4-reading-information-two-lab" | "grade4-reading-information-one-lab" | "grade4-story-problems-one-lab" | "grade4-powers-lab" | "grade4-remainder-division-lab" | "grade4-times-more-less-lab" | "grade4-mul-div-continued-lab" | "grade4-times-ten-lab" | "grade4-mul-div-lab" | "grade4-more-less-lab" | "grade4-add-sub-lab" | "solid-review-lab" | "solid-recognition-lab" | "pyramid-lab" | "prism-volume-lab" | "prism-surface-area-lab" | "prism-nets-lab" | "right-prism-lab" | "cuboid-cube-lab" | "order-director" | "place-value-factory" | "number-line-jumps" | "multiplication-grid" | "diagnostic-stations" | "exercise-board" | "geometry-lab" | "plane-figures-review-lab" | "calendar-time-lab" | "everyday-units-lab" | "map-scale-lab" | "rounding-lab" | "calculator-lab" | "information-reading-lab" | "distance-motion-lab" | "decimal-notation-l1" | "decimal-mental-arithmetic-l6" | "integer-numbers-lab" | "integer-add-subtract-lab" | "integer-mul-div-lab" | "integer-review-lab" | "rectangle-square-area-lab" | "area-unit-conversion-lab" | "parallelogram-area-lab" | "rhombus-area-lab" | "triangle-area-lab" | "trapezoid-area-lab" | "composite-area-lab" | "area-review-lab" | "volume-units-lab" | "cuboid-volume-lab" | "liters-milliliters-lab" | "volume-review-lab" | "algebra-expressions-lab" | "class4-review" | "section-one-review-lesson" | "section-two-review-lesson" | "natural-numbers-lesson" | "mental-add-sub-lesson" | "mental-mul-div-lesson" | "order-of-operations-lesson" | "estimation-lesson" | "written-add-sub-lesson" | "written-multiplication-lesson" | "written-division-lesson" | "written-story-problems-lesson" | "multiples-lesson" | "divisors-lesson" | "divisibility-animals-lesson" | "prime-composite-lesson" | "prime-factorization-lesson" | "gcd-lcm-factor-lesson" | "fraction-lesson";

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
  illustrationSrc?: string;
  illustrationAlt?: string;
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
  skillIds?: string[];
  maxScore?: number;
  expression: string;
  prompt: string;
  answerLayout?: "standard" | "fraction-stack" | "fraction-axis";
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
  skillIds?: string[];
  /** Wyłącznie publiczna polityka; treść rozwiązania pozostaje w answerSpec. */
  feedbackPolicy?: LessonQuestionFeedbackPolicy;
}

export type LessonEvidenceSource = "live" | "self_paced" | "paper_manual";

export interface UnderstandingCriterionConfig {
  id: string;
  skillId: string;
  label: string;
}

export interface UnderstandingEvidenceItemConfig {
  id: string;
  skillIds: string[];
  maxScore: number;
  sources: LessonEvidenceSource[];
}

export interface UnderstandingStageConfig {
  heading: "Ocena ucznia — co już potrafię?";
  evidenceStageId: string | null;
  criteria: UnderstandingCriterionConfig[];
  evidenceItems: UnderstandingEvidenceItemConfig[];
  acceptedEvidenceSources: LessonEvidenceSource[];
  selfAssessmentAffectsScore: false;
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
  understanding?: UnderstandingStageConfig;
  revealSteps: RevealStep[];
  questions: QuestionReference[];
  discussionPrompts: string[];
  accessibilityNotes: string[];
  /** Kontrakt kanałów dodawany przez wspólny builder. */
  runtime?: LessonStageRuntimeContract;
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

export interface LessonLearningGoal {
  id: string;
  /** Cel zapisany w pierwszej osobie, językiem ucznia. */
  studentGoal: string;
  /** Obserwowalne kryteria sukcesu przypisane wyłącznie do tego celu. */
  successCriteria: string[];
  /** Numery wymagań z podstawy programowej, np. „Klasy IV–VI, I.1”. */
  curriculumReferences: string[];
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
  learningGoals: LessonLearningGoal[];
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
  understanding: "Ocena umiejętności",
};
