import { createLessonStage } from "@/lib/lessons/createStage";
import type {
  LessonPackage,
  LessonStageKind,
  LessonModelId,
  LiveStageConfig,
  PrintStageConfig,
  LessonLearningGoal,
  QuestionReference,
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
  illustrationSrc?: string;
  illustrationAlt?: string;
  live?: LiveStageConfig;
  questions?: QuestionReference[];
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
  const didacticBody = (blueprint: LessonStageBlueprint) => {
    if (blueprint.body) return blueprint.body;
    if (blueprint.print?.items?.length) return blueprint.print.instructions;
    switch (blueprint.kind) {
      case "warmup":
      case "predict":
        return "Najpierw odpowiedz samodzielnie. Potem porównaj pomysł z drugą osobą i nazwij wiedzę, która może się dziś przydać.";
      case "explore":
        return "Zacznij od obserwacji i próby na konkretnym przykładzie. Zapisz, co się zmienia, co pozostaje stałe i jaki wniosek z tego wynika.";
      case "discuss":
        return "Wyjaśnij zasadę własnymi słowami. Podaj przykład, kontrprzykład i pytanie, które pozwoli sprawdzić, czy zasada została dobrze zrozumiana.";
      case "worked-example":
        return "Prześledź rozwiązanie krok po kroku. Przy każdym kroku dopowiedz, dlaczego jest dozwolony i jak można skontrolować otrzymany wynik.";
      case "practice":
      case "challenge":
        return "Rozwiąż przykład, pokaż tok rozumowania i porównaj co najmniej dwie możliwe strategie. Na końcu sprawdź sens odpowiedzi.";
      case "exit-ticket":
        return "Rozwiąż samodzielnie bez podpowiedzi. Zapisz wynik, krótkie uzasadnienie oraz sposób sprawdzenia odpowiedzi.";
    }
  };

  const contentStages = input.stageBlueprints.map((blueprint) => {
    const stageId = `${prefix}-${blueprint.suffix}`;
    stageNotes[stageId] = blueprint.teacherInstruction ?? blueprint.headline;
    const taskBullets = blueprint.print?.items?.map((item) => `${item.expression} — ${item.prompt}`);
    const hasQuestions = Boolean(blueprint.questions?.length);

    return createLessonStage({
      id: stageId,
      kind: blueprint.kind,
      title: blueprint.title,
      studentInstruction: blueprint.studentInstruction ?? (taskBullets?.length
        ? "Przeczytaj uważnie każde zadanie. Zapisz tok rozumowania, obliczenia i odpowiedź pełnym zdaniem."
        : "Przeczytaj slajd, nazwij najważniejszą zasadę i zapisz przykład w zeszycie."),
      teacherInstruction: blueprint.teacherInstruction ?? blueprint.headline,
      estimatedMinutes: blueprint.minutes,
      board: {
        layout: blueprint.modelId ? "model" : "narrative",
        headline: blueprint.headline,
        body: didacticBody(blueprint),
        modelId: blueprint.modelId,
        modelSeed: blueprint.modelSeed,
        bullets: taskBullets,
        illustrationSrc: blueprint.illustrationSrc,
        illustrationAlt: blueprint.illustrationAlt,
      },
      live: blueprint.live ?? {
        enabled: true,
        kind: hasQuestions || blueprint.modelId ? "exercise" : "presentation",
        minutes: blueprint.minutes,
      },
      student: {
        activityMode: hasQuestions ? "respond" : blueprint.modelId && blueprint.modelId !== "exercise-board" ? "practice" : "view",
        instruction: blueprint.studentInstruction ?? (taskBullets?.length
          ? "Rozwiąż zadania po kolei. Wyjaśnij, dlaczego wybrana metoda pasuje do treści."
          : blueprint.headline),
        modelId: blueprint.modelId,
        modelSeed: blueprint.modelSeed,
      },
      print: blueprint.print,
      discussionPrompts: blueprint.discussionPrompts ?? (blueprint.kind === "discuss"
        ? ["Jak wyjaśnisz tę zasadę własnymi słowami?", "Jaki kontrprzykład pokaże, kiedy nie wolno jej użyć?"]
        : []),
    }, blueprint.questions ?? []);
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
    live: { enabled: true, kind: "presentation", minutes: 5 },
    student: { activityMode: "view", instruction: "Sprawdź, czego się dziś nauczysz, i otwórz wskazane zadanie." },
  });
  stageNotes[bookStageId] = "Omów cele i odpowiadające im kryteria sukcesu. Ustaw stronę oraz numer zadania.";
  const openingStages = contentStages[0]?.board.modelId === "exercise-board" ? contentStages : [bookStage, ...contentStages];
  const understandingStageId = `${prefix}-understanding`;
  const hasClosingStage = openingStages.at(-1)?.id === understandingStageId;
  const understandingStage = createLessonStage({
    id: understandingStageId,
    kind: "exit-ticket",
    title: "Podsumowanie i samoocena",
    studentInstruction: "Podsumuj temat własnymi słowami, sprawdź kryteria sukcesu i zaznacz, jak dobrze rozumiesz lekcję.",
    teacherInstruction: "Wróć do kryteriów sukcesu. Poproś uczniów o jedno zdanie podsumowania i szczerą samoocenę.",
    estimatedMinutes: 5,
    live: { enabled: true, kind: "quick-check", minutes: 5 },
    board: {
      layout: "narrative",
      headline: "Podsumowanie — potrafię to zrobić",
      body: input.closingScript,
      bullets: input.successCriteria,
    },
    student: {
      activityMode: "view",
      instruction: "Przeczytaj kryteria sukcesu i wybierz poziom zrozumienia.",
    },
  });
  if (!hasClosingStage) stageNotes[understandingStageId] = "Podsumuj kryteria sukcesu i zbierz samoocenę uczniów.";
  const stages = hasClosingStage ? openingStages : [...openingStages, understandingStage];

  const learningGoals = input.learningGoals ?? [{
    id: `${prefix}-goal-1`,
    studentGoal: input.studentGoal.startsWith("Uczeń ")
      ? `Nauczę się najważniejszych umiejętności z tematu „${input.title}”.`
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
    status: input.status ?? "published",
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
