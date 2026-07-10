import {
  generateOrderExpression,
  tokensToDisplay,
  type OrderExpressionProblem,
} from "@/lib/math/orderOfOperations";
import type { LessonDifficulty } from "@/types/lessonPackage";

export interface M514QuestionInstance {
  id: string;
  seed: number;
  difficulty: LessonDifficulty;
  expression: string;
  /** Opis pierwszego kroku dla klucza nauczyciela */
  firstStepLabel: string;
  finalValue: number;
  stageIds: string[];
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

function instance(
  id: string,
  seed: number,
  difficulty: LessonDifficulty,
  stageIds: string[],
): M514QuestionInstance {
  const problem = generateOrderExpression(seed, difficulty);
  return {
    id,
    seed,
    difficulty,
    expression: tokensToDisplay(problem.tokens),
    firstStepLabel: describeFirstStep(problem),
    finalValue: problem.finalValue,
    stageIds,
  };
}

/** 15 instancji — 4 support, 6 core, 5 challenge (WP-022) */
export const M514_QUESTION_INSTANCES: M514QuestionInstance[] = [
  instance("m514-q01", 401, "support", ["m5-1-4-s3"]),
  instance("m514-q02", 418, "support", ["m5-1-4-s3"]),
  instance("m514-q03", 435, "support", ["m5-1-4-s3", "m5-1-4-s6"]),
  instance("m514-q04", 452, "support", ["m5-1-4-s6"]),
  instance("m514-q05", 1042, "core", ["m5-1-4-s2", "m5-1-4-s5"]),
  instance("m514-q06", 1108, "core", ["m5-1-4-s6"]),
  instance("m514-q07", 1174, "core", ["m5-1-4-s6"]),
  instance("m514-q08", 1240, "core", ["m5-1-4-s6"]),
  instance("m514-q09", 1306, "core", ["m5-1-4-s6"]),
  instance("m514-q10", 1372, "core", ["m5-1-4-s8"]),
  instance("m514-q11", 2001, "challenge", ["m5-1-4-s7"]),
  instance("m514-q12", 2088, "challenge", ["m5-1-4-s7"]),
  instance("m514-q13", 2175, "challenge", ["m5-1-4-s7"]),
  instance("m514-q14", 2262, "challenge", ["m5-1-4-s7"]),
  instance("m514-q15", 2350, "challenge", ["m5-1-4-s7", "m5-1-4-s8"]),
];

export const M514_INSTANCES_BY_ID = new Map(M514_QUESTION_INSTANCES.map((q) => [q.id, q]));

export function getInstancesForStage(stageId: string): M514QuestionInstance[] {
  return M514_QUESTION_INSTANCES.filter((q) => q.stageIds.includes(stageId));
}

export function getInstanceSeedPool(stageId: string): number[] {
  return getInstancesForStage(stageId).map((q) => q.seed);
}
