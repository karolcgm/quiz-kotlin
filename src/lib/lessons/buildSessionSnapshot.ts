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
): {
  publicQuestion: LessonSessionStageQuestion;
  answerEntry: LessonSessionAnswerKeyPayload["questions"][number];
} {
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

  const stages = lesson.stages.map((stage) => {
    const questions: LessonSessionStageQuestion[] = stage.questions.map((ref) => {
      const seed = ref.seed ?? 1;
      const difficulty = ref.difficulty ?? "core";
      const questionId = ref.id;
      const built = buildQuestion(questionId, seed, difficulty, primarySkillId);
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
      boardHeadline: stage.board.headline,
      boardBody: stage.board.body,
      boardBullets: stage.board.bullets,
      modelId: stage.board.modelId,
      modelSeed: stage.board.modelSeed,
      modelSeedPool: stage.board.modelSeedPool,
      modelDifficulty: stage.board.modelDifficulty,
      studentActivityMode: stage.student?.activityMode,
      studentInstruction: stage.student?.instruction ?? stage.studentInstruction,
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
      title: lesson.title,
      topicId: lesson.topicId,
      studentGoal: lesson.studentGoal,
      stages,
    },
    answerKey: { questions: answerQuestions },
  };
}
