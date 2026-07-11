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
  if (generatorId === "class4-review-v1") {
    return {
      publicQuestion: {
        questionInstanceId,
        generatorId,
        seed,
        difficulty,
        expression: "",
        prompt: "Wykonaj działanie w interaktywnym widgetcie.",
        maxScore: 1,
      },
      answerEntry: {
        questionInstanceId,
        stageId: "",
        skillId,
        maxScore: 1,
        answerSpec: {
          firstStepOperatorIndex: 1,
          firstStepLabel: "poprawnie wykonany widget",
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

  // Jeżeli lekcja ma wyznaczony scenariusz Live, do sesji trafia wyłącznie
  // jego krótki fragment. Reszta lekcji pozostaje w przewodniku i podręczniku.
  const configuredLiveStages = lesson.stages.filter((stage) => stage.live?.enabled);
  const sourceStages = configuredLiveStages.length > 0 ? configuredLiveStages : lesson.stages;

  const stages = sourceStages.map((stage) => {
    const questions: LessonSessionStageQuestion[] = stage.questions.map((ref) => {
      // Stacje powtórkowe dostają świeże przykłady przy każdym uruchomieniu sesji.
      // Ziarno trafia do publicznego snapshotu, więc nauczyciel i uczeń widzą
      // ten sam wariant zadania, ale klucz odpowiedzi pozostaje tylko w panelu.
      const seed = ref.generatorId === "class4-review-v1"
        ? Math.floor(Math.random() * 2_000_000_000) + 1
        : (ref.seed ?? 1);
      const difficulty = ref.difficulty ?? "core";
      const questionId = ref.id;
      const built = buildQuestion(questionId, seed, difficulty, primarySkillId, ref.generatorId);
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
      revealSteps: stage.revealSteps.map((step) => ({
        id: step.id,
        label: step.label,
        boardHeadline: step.boardHeadline,
        boardBody: step.boardBody,
      })),
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
