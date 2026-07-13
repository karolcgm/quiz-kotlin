import { createLessonStage } from "@/lib/lessons/createStage";
import type {
  LessonPackage,
  LessonStageKind,
  LessonModelId,
  PrintStageConfig,
  LessonLearningGoal,
} from "@/types/lessonPackage";

export interface LessonStageBlueprint {
  suffix: string;
  kind: LessonStageKind;
  title: string;
  minutes: number;
  headline: string;
  body?: string;
  modelId?: LessonModelId;
  modelSeed?: number;
  print?: PrintStageConfig;
  discussionPrompts?: string[];
  studentInstruction?: string;
  teacherInstruction?: string;
}

export interface BuildLessonInput {
  id: string;
  topicId: string;
  title: string;
  studentGoal: string;
  successCriteria: string[];
  learningGoals?: LessonLearningGoal[];
  skillIds: string[];
  prerequisiteSkillIds: string[];
  estimatedMinutes?: number;
  coreLesson: string;
  paperEvidence: string;
  overview: string;
  openingScript: string;
  closingScript: string;
  commonMisconceptions: string[];
  stageBlueprints: LessonStageBlueprint[];
  status?: LessonPackage["status"];
  sectionId?: string;
}

export function buildLessonPackage(input: BuildLessonInput): LessonPackage {
  const prefix = input.topicId.toLowerCase().replace(/\./g, "-");
  const stageNotes: Record<string, string> = {};

  const contentStages = input.stageBlueprints.map((blueprint) => {
    const stageId = `${prefix}-${blueprint.suffix}`;
    stageNotes[stageId] = blueprint.teacherInstruction ?? blueprint.headline;

    return createLessonStage({
      id: stageId,
      kind: blueprint.kind,
      title: blueprint.title,
      studentInstruction: blueprint.studentInstruction ?? "Patrz na tablicę i zapisuj w zeszyt.",
      teacherInstruction: blueprint.teacherInstruction ?? blueprint.headline,
      estimatedMinutes: blueprint.minutes,
      board: {
        layout: blueprint.modelId ? "model" : "narrative",
        headline: blueprint.headline,
        body: blueprint.body,
        modelId: blueprint.modelId,
        modelSeed: blueprint.modelSeed,
      },
      live: blueprint.modelId ? { enabled: true, kind: "exercise", minutes: blueprint.minutes } : undefined,
      student: {
        activityMode: blueprint.modelId ? "respond" : "view",
        instruction: blueprint.studentInstruction ?? blueprint.headline,
        modelId: blueprint.modelId,
        modelSeed: blueprint.modelSeed,
      },
      print: blueprint.print,
      discussionPrompts: blueprint.discussionPrompts ?? [],
    });
  });

  const bookStageId = `${prefix}-book`;
  const bookStage = createLessonStage({
    id: bookStageId,
    kind: "warmup",
    title: "Temat, cele i podręcznik",
    studentInstruction: "Poznaj temat i cele lekcji, a następnie otwórz stronę i zadanie wskazane przez nauczyciela.",
    teacherInstruction: "Przed rozpoczęciem pracy omów cele i kryteria sukcesu, potem ustaw stronę i numer zadania.",
    estimatedMinutes: 5,
    board: { layout: "model", headline: "Temat i plan lekcji", modelId: "exercise-board", modelSeed: 1 },
    student: { activityMode: "view", instruction: "Sprawdź, czego się dziś nauczysz, i otwórz wskazane zadanie." },
  });
  stageNotes[bookStageId] = "Omów cele i odpowiadające im kryteria sukcesu. Ustaw stronę oraz numer zadania.";
  const stages = contentStages[0]?.board.modelId === "exercise-board" ? contentStages : [bookStage, ...contentStages];

  const learningGoals = input.learningGoals ?? [{
    id: `${prefix}-goal-1`,
    studentGoal: input.studentGoal.startsWith("Uczeń ")
      ? `Na tej lekcji nauczę się najważniejszych umiejętności z tematu „${input.title}”.`
      : input.studentGoal,
    successCriteria: input.successCriteria,
    curriculumReferences: [],
  }];

  return {
    id: input.id,
    version: 1,
    curriculumId: "pl-math-5-2026-classic",
    sectionId: input.sectionId ?? "M5-S1",
    topicId: input.topicId,
    lessonNumber: 1,
    title: input.title,
    estimatedMinutes: input.estimatedMinutes ?? 45,
    studentGoal: input.studentGoal,
    successCriteria: input.successCriteria,
    learningGoals,
    prerequisiteSkillIds: input.prerequisiteSkillIds,
    skillIds: input.skillIds,
    stages,
    printableResourceIds: [],
    status: input.status ?? "draft",
    teacherGuide: {
      overview: input.overview,
      timingNotes: "Dostosuj tempo do klasy — skróć ćwiczenia lub wyzwanie.",
      materials: ["Tablica / projektor", "Tablety (opcjonalnie)", input.paperEvidence],
      openingScript: input.openingScript,
      closingScript: input.closingScript,
      exitTicketRubric: "Ocena za poprawność i uzasadnienie strategii.",
      paperWithoutDevices: input.paperEvidence,
      languageReview: `Manifest: ${input.coreLesson}.`,
      commonMisconceptions: input.commonMisconceptions,
      differentiation: {
        support: "Mniejsze liczby, więcej wspólnego przykładu na tablicy.",
        core: "Zakres programu klasy V.",
        challenge: "Dodatkowe zadanie z uzasadnieniem i sprawdzeniem sensu wyniku.",
      },
      stageNotes,
    },
  };
}
