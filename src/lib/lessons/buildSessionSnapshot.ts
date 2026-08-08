import {
  generateOrderExpression,
  tokensToDisplay,
  type OrderExpressionProblem,
} from "@/lib/math/orderOfOperations";
import type { LessonPackage } from "@/types/lessonPackage";
import type {
  LessonSessionAnswerKeyPayload,
  LessonSessionSnapshotPayload,
  LessonSessionStageQuestion,
} from "@/types/lessonSession";

const SELF_CONTAINED_GENERATOR_IDS = new Set([
  "grade4-decimal-system-l1-v1",
  "grade4-section-one-review-l1-v1",
  "grade4-reading-information-one-l1-v1",
  "grade4-reading-information-two-l1-v1",
  "grade4-story-problems-one-l1-v1",
  "grade4-story-problems-two-l1-v1",
  "grade4-order-of-operations-l1-v1",
  "grade4-number-line-l1-v1",
  "grade4-powers-l1-v1",
  "grade4-remainder-division-l1-v1",
  "grade4-times-more-less-l1-v1",
  "grade4-mul-div-continued-l1-v1",
  "grade4-times-ten-l1-v1",
  "grade4-mul-div-l1-v1",
  "grade4-more-less-l1-v1",
  "grade4-add-sub-l1-v1",
  "interactive-lesson-series-v1",
  "class4-review-v1",
  "section-one-review-v1",
  "section-two-review-v1",
  "natural-numbers-v1",
  "mental-add-sub-v1",
  "mental-mul-div-v1",
  "order-of-operations-v1",
  "estimation-v1",
  "written-add-sub-v1",
  "written-multiplication-v1",
  "written-division-v1",
  "written-story-problems-v1",
  "multiples-v1",
  "divisors-v1",
  "divisibility-animals-v1",
  "prime-composite-v1",
  "prime-factorization-v1",
  "gcd-lcm-factor-v1",
  "fraction-lesson-l1-v1",
  "decimal-notation-l1-v1",
  "number-line-jumps-v1",
  "decimal-mental-l6-v1",
  "geometry-triangle-types-v1",
  "geometry-triangle-construction-v1",
  "geometry-triangle-angle-sum-v1",
  "geometry-plane-figures-theory-v1",
  "algebra-expressions-l1-v1",
  "integer-numbers-l1-v1",
  "integer-add-subtract-l1-v1",
  "integer-mul-div-l1-v1",
  "integer-review-l1-v1",
]);

const RANDOMIZED_GENERATOR_IDS = new Set([
  "grade4-decimal-system-l1-v1",
  "grade4-section-one-review-l1-v1",
  "grade4-reading-information-one-l1-v1",
  "grade4-reading-information-two-l1-v1",
  "grade4-story-problems-one-l1-v1",
  "grade4-story-problems-two-l1-v1",
  "grade4-order-of-operations-l1-v1",
  "grade4-number-line-l1-v1",
  "grade4-powers-l1-v1",
  "grade4-remainder-division-l1-v1",
  "grade4-times-more-less-l1-v1",
  "grade4-mul-div-continued-l1-v1",
  "grade4-times-ten-l1-v1",
  "grade4-mul-div-l1-v1",
  "grade4-more-less-l1-v1",
  "grade4-add-sub-l1-v1",
  "class4-review-v1",
  "section-one-review-v1",
  "section-two-review-v1",
  "natural-numbers-v1",
  "mental-add-sub-v1",
  "mental-mul-div-v1",
  "order-of-operations-v1",
  "estimation-v1",
  "written-add-sub-v1",
  "written-multiplication-v1",
  "written-division-v1",
  "written-story-problems-v1",
  "multiples-v1",
  "divisors-v1",
  "divisibility-animals-v1",
  "prime-composite-v1",
  "prime-factorization-v1",
  "gcd-lcm-factor-v1",
]);

function curriculumCode(reference: string): string {
  return reference.split(" — ", 1)[0]?.trim() ?? reference.trim();
}

function describeFirstStep(problem: OrderExpressionProblem): string {
  const index = problem.validNextOperatorIndices[0];
  if (index === undefined) return "brak działań";
  const token = problem.tokens[index];
  if (token.type !== "operator") return "—";
  const left = problem.tokens[index - 1];
  const right = problem.tokens[index + 1];
  const leftVal = left?.type === "number" ? left.value : "?";
  const rightVal = right?.type === "number" ? right.value : "?";
  return `najpierw ${leftVal} ${token.value} ${rightVal}`;
}

function buildQuestion(
  questionInstanceId: string,
  seed: number,
  difficulty: "support" | "core" | "challenge",
  skillId: string,
  generatorId = "order-director-v1",
): {
  publicQuestion: LessonSessionStageQuestion;
  answerEntry: LessonSessionAnswerKeyPayload["questions"][number];
} {
  if (SELF_CONTAINED_GENERATOR_IDS.has(generatorId)) {
    return {
      publicQuestion: {
        questionInstanceId,
        generatorId,
        seed,
        difficulty,
        expression: "",
        prompt: generatorId === "decimal-notation-l1-v1"
          ? "Wykonaj zadanie w interaktywnym laboratorium zapisu dziesiętnego."
          : "Wykonaj zadanie w interaktywnym widgetcie.",
        maxScore: 1,
        skillIds: [skillId],
      },
      answerEntry: {
        questionInstanceId,
        stageId: "",
        skillId,
        maxScore: 1,
        answerSpec: {
          firstStepOperatorIndex: 1,
          firstStepLabel: "poprawnie wykonane zadanie",
          validNextOperatorIndices: [1],
          finalValue: 1,
        },
      },
    };
  }
  const problem = generateOrderExpression(seed, difficulty);
  const firstStepOperatorIndex = problem.validNextOperatorIndices[0] ?? -1;

  return {
    publicQuestion: {
      questionInstanceId,
      generatorId: "order-director-v1",
      seed,
      difficulty,
      expression: tokensToDisplay(problem.tokens),
      prompt: "Wskaż pierwsze działanie do wykonania.",
      maxScore: 1,
      skillIds: [skillId],
    },
    answerEntry: {
      questionInstanceId,
      stageId: "",
      skillId,
      maxScore: 1,
      answerSpec: {
        firstStepOperatorIndex,
        firstStepLabel: describeFirstStep(problem),
        validNextOperatorIndices: problem.validNextOperatorIndices,
        finalValue: problem.finalValue,
      },
    },
  };
}

/** Buduje snapshot sesji i klucz odpowiedzi z pakietu lekcji (bez PII). */
export function buildLessonSessionSnapshot(lesson: LessonPackage): {
  stageSnapshot: LessonSessionSnapshotPayload;
  answerKey: LessonSessionAnswerKeyPayload;
} {
  const answerQuestions: LessonSessionAnswerKeyPayload["questions"] = [];
  const primarySkillId = lesson.skillIds[0] ?? "unknown-skill";
  const curriculumCodes = Array.from(new Set(
    lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map(curriculumCode)),
  ));
  const sectionMatch = lesson.sectionId.match(/M(\d+)-S(\d+)/);
  const classNumber = sectionMatch?.[1] ?? "—";
  const sectionNumber = sectionMatch?.[2] ?? "—";

  // Jeżeli lekcja ma wyznaczony scenariusz Live, do sesji trafia wyłącznie
  // jego krótki fragment. Reszta lekcji pozostaje w przewodniku i podręczniku.
  const configuredLiveStages = lesson.stages.filter((stage) => stage.live?.enabled);
  const sourceStages = configuredLiveStages.length > 0 ? configuredLiveStages : lesson.stages;

  const stages = sourceStages.map((stage, stageIndex) => {
    const questions: LessonSessionStageQuestion[] = stage.questions.map((ref, questionIndex) => {
      // Stacje powtórkowe dostają świeże przykłady przy każdym uruchomieniu sesji.
      // Ziarno trafia do publicznego snapshotu, więc nauczyciel i uczeń widzą
      // ten sam wariant zadania, ale klucz odpowiedzi pozostaje tylko w panelu.
      const seed = ref.generatorId && RANDOMIZED_GENERATOR_IDS.has(ref.generatorId)
        ? Math.floor(Math.random() * 2_000_000_000) + 1
        : (ref.seed ?? 1);
      const difficulty = ref.difficulty ?? "core";
      const questionId = ref.id;
      const skillId = ref.skillIds?.[0] ?? lesson.skillIds[questionIndex % Math.max(lesson.skillIds.length, 1)] ?? primarySkillId;
      const built = buildQuestion(questionId, seed, difficulty, skillId, ref.generatorId);
      built.publicQuestion.skillIds = ref.skillIds?.length ? ref.skillIds : [skillId];
      if (ref.feedbackPolicy) built.publicQuestion.feedbackPolicy = ref.feedbackPolicy;
      answerQuestions.push({
        ...built.answerEntry,
        stageId: stage.id,
      });
      return built.publicQuestion;
    });

    return {
      id: stage.id,
      kind: stage.kind,
      title: stage.title,
      estimatedMinutes: stage.estimatedMinutes,
      liveKind: stage.live?.kind,
      liveMinutes: stage.live?.minutes,
      boardHeadline: stage.board.headline,
      boardBody: stage.board.body,
      boardBullets: stage.board.bullets,
      illustrationSrc: stage.board.illustrationSrc,
      illustrationAlt: stage.board.illustrationAlt,
      modelId: stage.board.modelId,
      modelSeed: stage.board.modelSeed,
      modelSeedPool: stage.board.modelSeedPool,
      modelDifficulty: stage.board.modelDifficulty,
      studentActivityMode: stage.student?.activityMode,
      studentInstruction: stage.student?.instruction ?? stage.studentInstruction,
      studentModelId: stage.student?.modelId,
      studentModelSeed: stage.student?.modelSeed,
      studentModelSeedPool: stage.student?.modelSeedPool,
      studentModelDifficulty: stage.student?.modelDifficulty,
      questions,
      understanding: stage.understanding,
      lessonTitle: stageIndex === 0 ? lesson.title : undefined,
      lessonMetric: stageIndex === 0 ? `Matematyka · klasa ${classNumber} · dział ${sectionNumber}` : undefined,
      lessonTiming: stageIndex === 0 ? `${lesson.estimatedMinutes} min · L${lesson.lessonNumber}` : undefined,
      curriculumCodes: stageIndex === 0 ? curriculumCodes : undefined,
      learningGoals: stageIndex === 0 ? lesson.learningGoals : undefined,
      revealSteps: stage.revealSteps.map((step) => ({
        id: step.id,
        label: step.label,
        boardHeadline: step.boardHeadline,
        boardBody: step.boardBody,
      })),
      runtime: stage.runtime,
    };
  });

  return {
    stageSnapshot: {
      lessonId: lesson.id,
      lessonVersion: lesson.version,
      curriculumId: lesson.curriculumId,
      sectionId: lesson.sectionId,
      skillIds: lesson.skillIds,
      title: lesson.title,
      topicId: lesson.topicId,
      studentGoal: lesson.studentGoal,
      stages,
    },
    answerKey: { questions: answerQuestions },
  };
}
