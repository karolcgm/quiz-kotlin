import { createLessonStage } from "@/lib/lessons/createStage";
import { buildLessonStageRuntimeContract } from "@/lib/lessons/lessonRuntime";
import type {
  LessonPackage,
  LessonStageKind,
  LessonModelId,
  LiveStageConfig,
  PrintStageConfig,
  LessonLearningGoal,
  LessonEvidenceSource,
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
  const learningGoals = input.learningGoals ?? [{
    id: `${prefix}-goal-1`,
    studentGoal: input.studentGoal.startsWith("Uczeń ")
      ? `Nauczę się najważniejszych umiejętności z tematu „${input.title}”.`
      : input.studentGoal,
    successCriteria: input.successCriteria,
    curriculumReferences: [],
  }];
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
      case "understanding":
        return "Sprawdź wynik ostatniej samodzielnej próby, przeczytaj informację zwrotną i zapisz samoocenę.";
    }
  };

  const contentStages = input.stageBlueprints.map((blueprint) => {
    const stageId = `${prefix}-${blueprint.suffix}`;
    stageNotes[stageId] = blueprint.teacherInstruction ?? blueprint.headline;
    const hasPrintItems = Boolean(blueprint.print?.items?.length);
    const hasQuestions = Boolean(blueprint.questions?.length);

    const questions = (blueprint.questions ?? []).map((question, index) => ({
      ...question,
      skillIds: question.skillIds?.length
        ? question.skillIds
        : [input.skillIds[index % Math.max(input.skillIds.length, 1)] ?? "unknown-skill"],
    }));
    const print = blueprint.print ? {
      ...blueprint.print,
      items: blueprint.print.items?.map((item, index) => ({
        ...item,
        skillIds: item.skillIds?.length
          ? item.skillIds
          : questions[index]?.skillIds ?? [input.skillIds[index % Math.max(input.skillIds.length, 1)] ?? "unknown-skill"],
      })),
    } : undefined;
    const stage = createLessonStage({
      id: stageId,
      kind: blueprint.kind,
      title: blueprint.title,
      studentInstruction: blueprint.studentInstruction ?? (hasPrintItems
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
        // Elementy karty pracy należą wyłącznie do kanału druku. Na tablicy
        // zadanie pokazuje model interaktywny, bez technicznej listy expression/prompt.
        bullets: undefined,
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
        instruction: blueprint.studentInstruction ?? (hasPrintItems
          ? "Rozwiąż zadania po kolei. Wyjaśnij, dlaczego wybrana metoda pasuje do treści."
          : blueprint.headline),
        modelId: blueprint.modelId,
        modelSeed: blueprint.modelSeed,
      },
      print,
      discussionPrompts: blueprint.discussionPrompts ?? (blueprint.kind === "discuss"
        ? ["Jak wyjaśnisz tę zasadę własnymi słowami?", "Jaki kontrprzykład pokaże, kiedy nie wolno jej użyć?"]
        : []),
    }, questions);
    return {
      ...stage,
      runtime: buildLessonStageRuntimeContract({
        lessonId: input.id,
        lessonVersion: 1,
        lessonSkillIds: input.skillIds,
        stage,
      }),
    };
  });

  const bookStageId = `${prefix}-trace-0`;
  const rawBookStage = createLessonStage({
    id: bookStageId,
    kind: "warmup",
    title: "Cele lekcji (slajd 0)",
    studentInstruction: "Poznaj temat, cele lekcji i kryteria sukcesu.",
    teacherInstruction: "Omów matematyczny temat, cele, kryteria sukcesu i powiązanie z podstawą programową.",
    estimatedMinutes: 5,
    board: { layout: "model", headline: input.title, modelId: "exercise-board", modelSeed: 1 },
    live: { enabled: true, kind: "presentation", minutes: 5 },
    student: { activityMode: "view", instruction: "Sprawdź, czego się dziś nauczysz i po czym poznasz, że cel został osiągnięty." },
  });
  const bookStage = {
    ...rawBookStage,
    runtime: buildLessonStageRuntimeContract({
      lessonId: input.id,
      lessonVersion: 1,
      lessonSkillIds: input.skillIds,
      stage: rawBookStage,
    }),
  };
  stageNotes[bookStageId] = "Omów cele, odpowiadające im kryteria sukcesu i pełne brzmienie wymagań podstawy programowej.";
  const openingStages = contentStages[0]?.board.modelId === "exercise-board" ? contentStages : [bookStage, ...contentStages];
  const understandingStageId = `${prefix}-understanding`;
  const existingAssessmentStage = openingStages.find(
    (stage) => stage.kind === "understanding" || stage.id.endsWith("-understanding"),
  );
  const stagesBeforeAssessment = openingStages.filter(
    (stage) => stage.kind !== "understanding" && !stage.id.endsWith("-understanding"),
  );
  const evidenceStage = [...stagesBeforeAssessment].reverse().find(
    (stage) => stage.questions.length > 0 || Boolean(stage.print?.items?.length) || ["practice", "challenge", "exit-ticket"].includes(stage.kind),
  ) ?? null;
  const criteria = learningGoals.flatMap((goal) => goal.successCriteria).map((label, index) => ({
    id: `${understandingStageId}-criterion-${index + 1}`,
    skillId: input.skillIds[index % Math.max(input.skillIds.length, 1)] ?? "unknown-skill",
    label,
  }));
  const questionEvidence = (evidenceStage?.questions ?? []).map((question, index) => ({
    id: question.id,
    skillIds: question.skillIds?.length
      ? question.skillIds
      : [input.skillIds[index % Math.max(input.skillIds.length, 1)] ?? "unknown-skill"],
    maxScore: 1,
    sources: ["live", "self_paced"] as LessonEvidenceSource[],
  }));
  const paperEvidence = (evidenceStage?.print?.items ?? []).map((item, index) => ({
    id: item.id,
    skillIds: item.skillIds?.length
      ? item.skillIds
      : [input.skillIds[index % Math.max(input.skillIds.length, 1)] ?? "unknown-skill"],
    maxScore: item.maxScore ?? 1,
    sources: ["paper_manual"] as LessonEvidenceSource[],
  }));
  const rawUnderstandingStage = createLessonStage({
    id: understandingStageId,
    kind: "understanding",
    title: "Ocena umiejętności",
    studentInstruction: "Sprawdź wynik ostatniej samodzielnej próby, kryteria i następny krok. Potem wybierz i zapisz samoocenę.",
    teacherInstruction: "Pokaż uczniowi wyłącznie jego wynik i kryteria. Na tablicy wyświetl tylko anonimowy rozkład samooceny.",
    estimatedMinutes: existingAssessmentStage?.estimatedMinutes ?? 5,
    live: { enabled: true, kind: "quick-check", minutes: existingAssessmentStage?.live?.minutes ?? 5 },
    board: {
      layout: "narrative",
      headline: "Ocena ucznia — co już potrafię?",
      body: "Na tablicy widoczny jest wyłącznie anonimowy rozkład odpowiedzi klasy. Indywidualny wynik pozostaje prywatny.",
      bullets: input.successCriteria,
    },
    student: {
      activityMode: "view",
      instruction: existingAssessmentStage?.student?.instruction
        ?? "Przeczytaj prywatny wynik i kryteria, wybierz poziom zrozumienia, a następnie zapisz odpowiedź.",
    },
    print: {
      worksheetTitle: "Ocena umiejętności",
      instructions: "Nauczyciel wpisuje wynik ostatniego dowodu przy odpowiednich umiejętnościach. Samoocena nie zmienia punktów.",
    },
    understanding: {
      heading: "Ocena ucznia — co już potrafię?",
      evidenceStageId: evidenceStage?.id ?? null,
      criteria,
      evidenceItems: [...questionEvidence, ...paperEvidence],
      acceptedEvidenceSources: ["live", "self_paced", "paper_manual"],
      selfAssessmentAffectsScore: false,
    },
  });
  const understandingStage = {
    ...rawUnderstandingStage,
    runtime: buildLessonStageRuntimeContract({
      lessonId: input.id,
      lessonVersion: 1,
      lessonSkillIds: input.skillIds,
      stage: rawUnderstandingStage,
    }),
  };
  stageNotes[understandingStageId] = "Połącz ostatni dowód ze skillIds. Indywidualny wynik pokaż uczniowi i nauczycielowi, a na tablicy tylko anonimowy rozkład samooceny.";
  const stages = [...stagesBeforeAssessment, understandingStage];

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
