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
  if (generatorId === "class4-review-v1" || generatorId === "section-one-review-v1" || generatorId === "section-two-review-v1" || generatorId === "natural-numbers-v1" || generatorId === "mental-add-sub-v1" || generatorId === "mental-mul-div-v1" || generatorId === "order-of-operations-v1" || generatorId === "estimation-v1" || generatorId === "written-add-sub-v1" || generatorId === "written-multiplication-v1" || generatorId === "written-division-v1" || generatorId === "written-story-problems-v1" || generatorId === "multiples-v1" || generatorId === "divisors-v1" || generatorId === "divisibility-animals-v1" || generatorId === "prime-composite-v1" || generatorId === "prime-factorization-v1" || generatorId === "gcd-lcm-factor-v1" || generatorId === "fraction-lesson-l1-v1" || generatorId === "decimal-notation-l1-v1" || generatorId === "geometry-triangle-types-v1" || generatorId === "geometry-triangle-construction-v1") {
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
  const sectionNumber = lesson.sectionId.match(/M5-S(\d+)/)?.[1] ?? "—";

  // Jeżeli lekcja ma wyznaczony scenariusz Live, do sesji trafia wyłącznie
  // jego krótki fragment. Reszta lekcji pozostaje w przewodniku i podręczniku.
  const configuredLiveStages = lesson.stages.filter((stage) => stage.live?.enabled);
  const sourceStages = configuredLiveStages.length > 0 ? configuredLiveStages : lesson.stages;

  const stages = sourceStages.map((stage, stageIndex) => {
    const questions: LessonSessionStageQuestion[] = stage.questions.map((ref, questionIndex) => {
      // Stacje powtórkowe dostają świeże przykłady przy każdym uruchomieniu sesji.
      // Ziarno trafia do publicznego snapshotu, więc nauczyciel i uczeń widzą
      // ten sam wariant zadania, ale klucz odpowiedzi pozostaje tylko w panelu.
      const seed = ref.generatorId === "class4-review-v1" || ref.generatorId === "section-one-review-v1" || ref.generatorId === "section-two-review-v1" || ref.generatorId === "natural-numbers-v1" || ref.generatorId === "mental-add-sub-v1" || ref.generatorId === "mental-mul-div-v1" || ref.generatorId === "order-of-operations-v1" || ref.generatorId === "estimation-v1" || ref.generatorId === "written-add-sub-v1" || ref.generatorId === "written-multiplication-v1" || ref.generatorId === "written-division-v1" || ref.generatorId === "written-story-problems-v1" || ref.generatorId === "multiples-v1" || ref.generatorId === "divisors-v1" || ref.generatorId === "divisibility-animals-v1" || ref.generatorId === "prime-composite-v1" || ref.generatorId === "prime-factorization-v1" || ref.generatorId === "gcd-lcm-factor-v1"
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
      lessonMetric: stageIndex === 0 ? `Matematyka · klasa V · dział ${sectionNumber}` : undefined,
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
