import type { LessonDifficulty } from "@/types/lessonPackage";

/** Rodzaj pracy — spec §29 */
export type AssessmentKind = "worksheet" | "quiz" | "exit-ticket" | "exam";

export type DeliveryMode = "digital" | "paper" | "hybrid";

export type AssessmentVersionCode = "A" | "B" | "C";

export type ReasoningType = "procedure" | "concept" | "application";

/** Pojedyncza pozycja blueprintu — ta sama macierz umiejętności w wersjach A/B */
export interface BlueprintSlot {
  slotId: string;
  skillId: string;
  difficulty: LessonDifficulty;
  maxScore: number;
  generatorId: string;
  generatorVersion: number;
  reasoningType: ReasoningType;
  prompt: string;
}

export interface AssessmentBlueprint {
  id: string;
  version: number;
  title: string;
  subtitle?: string;
  kind: AssessmentKind;
  deliveryMode: DeliveryMode;
  curriculumId: string;
  sectionId: string;
  topicIds: string[];
  skillIds: string[];
  lessonPackageId?: string;
  estimatedMinutes: number;
  slots: BlueprintSlot[];
  /** Domyślne seedy wersji A/B — deterministyczne odtwarzanie */
  defaultVersionSeeds: Partial<Record<AssessmentVersionCode, number>>;
}

/** Pytanie widoczne dla ucznia — bez klucza (spec §26.2) */
export interface PublicSnapshotItem {
  slotId: string;
  position: number;
  skillId: string;
  difficulty: LessonDifficulty;
  maxScore: number;
  generatorId: string;
  generatorVersion: number;
  seed: number;
  expression: string;
  prompt: string;
}

export interface SnapshotAnswerSpec {
  validNextOperatorIndices: number[];
  firstStepOperatorIndex: number;
  firstStepLabel: string;
  finalValue: number;
}

export interface AnswerKeyItem {
  slotId: string;
  position: number;
  maxScore: number;
  rubric: string;
  answerSpec: SnapshotAnswerSpec;
}

/** Niezmienny snapshot wersji — checksum obejmuje pozycje, punkty i klucz */
export interface AssessmentVersionSnapshot {
  assessmentId: string;
  blueprintId: string;
  blueprintVersion: number;
  versionCode: AssessmentVersionCode;
  versionSeed: number;
  generatedAt: string;
  title: string;
  kind: AssessmentKind;
  maxScore: number;
  items: PublicSnapshotItem[];
  checksum: string;
}

export interface AssessmentVersionBundle {
  snapshot: AssessmentVersionSnapshot;
  answerKey: AnswerKeyItem[];
}

export interface SkillCoverageEntry {
  skillId: string;
  slotCount: number;
  maxScore: number;
  difficulties: Record<LessonDifficulty, number>;
}
