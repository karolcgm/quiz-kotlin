import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_ESTIMATE_L1_GENERATOR_ID = "decimal-estimate-l1-v1" as const;

export type DecimalEstimateL1Activity = "decimal-estimate-round" | "decimal-estimate-sense";

export interface DecimalEstimateRoundTask {
  expression: string;
  roundedExpression: string;
  options: readonly string[];
  answer: string;
}

export interface DecimalEstimateSenseTask {
  expression: string;
  proposedResult: string;
  roundedExpression: string;
  answer: boolean;
}

const ROUND_TASKS: readonly DecimalEstimateRoundTask[] = [
  { expression: "2,1 · 3,9", roundedExpression: "2 · 4", options: ["6", "8", "12"], answer: "8" },
  { expression: "12,6 − 8,9", roundedExpression: "13 − 9", options: ["3", "4", "5"], answer: "4" },
  { expression: "6,8 + 2,3", roundedExpression: "7 + 2", options: ["7", "9", "11"], answer: "9" },
  { expression: "3,4 · 2,1", roundedExpression: "3 · 2", options: ["5", "6", "8"], answer: "6" },
  { expression: "18,7 − 6,2", roundedExpression: "19 − 6", options: ["11", "13", "15"], answer: "13" },
  { expression: "4,9 · 5,1", roundedExpression: "5 · 5", options: ["20", "25", "30"], answer: "25" },
  { expression: "9,8 + 6,4", roundedExpression: "10 + 6", options: ["14", "16", "18"], answer: "16" },
  { expression: "24,6 : 3,1", roundedExpression: "25 : 3", options: ["6", "8", "10"], answer: "8" },
  { expression: "0,48 · 5,2", roundedExpression: "0,5 · 5", options: ["0,25", "2,5", "25"], answer: "2,5" },
  { expression: "15,2 : 2,1", roundedExpression: "15 : 2", options: ["4", "8", "12"], answer: "8" },
];

const SENSE_TASKS: readonly DecimalEstimateSenseTask[] = [
  { expression: "0,48 · 5,2", proposedResult: "24,96", roundedExpression: "0,5 · 5 ≈ 2,5", answer: false },
  { expression: "3,4 · 2,1", proposedResult: "7,14", roundedExpression: "3 · 2 ≈ 6", answer: true },
  { expression: "12,6 − 8,9", proposedResult: "3,7", roundedExpression: "13 − 9 ≈ 4", answer: true },
  { expression: "7,2 : 0,6", proposedResult: "1,2", roundedExpression: "7 : 0,5 ≈ 14", answer: false },
  { expression: "4,4 : 0,2", proposedResult: "22", roundedExpression: "4 : 0,2 ≈ 20", answer: true },
  { expression: "6,8 + 2,3", proposedResult: "90", roundedExpression: "7 + 2 ≈ 9", answer: false },
  { expression: "4,9 · 5,1", proposedResult: "24,99", roundedExpression: "5 · 5 ≈ 25", answer: true },
  { expression: "18,7 − 6,2", proposedResult: "2,5", roundedExpression: "19 − 6 ≈ 13", answer: false },
  { expression: "24,6 : 3,1", proposedResult: "7,94", roundedExpression: "25 : 3 ≈ 8", answer: true },
  { expression: "2,1 · 3,9", proposedResult: "81,9", roundedExpression: "2 · 4 ≈ 8", answer: false },
];

export function isDecimalEstimateL1Activity(activity: string): activity is DecimalEstimateL1Activity {
  return activity === "decimal-estimate-round" || activity === "decimal-estimate-sense";
}

export function createPublicDecimalEstimateL1Task(input: { seed: number; difficulty: LessonDifficulty; activity: DecimalEstimateL1Activity }): DecimalEstimateRoundTask | DecimalEstimateSenseTask {
  const tasks = input.activity === "decimal-estimate-round" ? ROUND_TASKS : SENSE_TASKS;
  return tasks[input.seed % tasks.length]!;
}
