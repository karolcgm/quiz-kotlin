import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_DIVIDE_BY_DECIMAL_L1_GENERATOR_ID = "decimal-divide-by-decimal-l1-v1" as const;
export type DecimalDivideByDecimalL1Activity = "decimal-divide-by-decimal-shift";

export interface DecimalDivideByDecimalL1Task {
  generatorId: typeof DECIMAL_DIVIDE_BY_DECIMAL_L1_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalDivideByDecimalL1Activity;
  dividend: string;
  divisor: string;
  result: string;
  shifts: number;
}

const TASKS = [
  ["6", "0,2", "30", 1], ["4,5", "0,15", "30", 2], ["8,4", "0,4", "21", 1], ["0,9", "0,03", "30", 2], ["5", "0,25", "20", 2],
  ["7,2", "0,6", "12", 1], ["1,44", "0,12", "12", 2], ["3,6", "0,09", "40", 2], ["1,5", "0,4", "3,75", 1], ["0,75", "0,3", "2,5", 1],
] as const;

export function isDecimalDivideByDecimalL1Activity(activity: string): activity is DecimalDivideByDecimalL1Activity {
  return activity === "decimal-divide-by-decimal-shift";
}

export function createPublicDecimalDivideByDecimalL1Task(input: { seed: number; difficulty: LessonDifficulty; activity: DecimalDivideByDecimalL1Activity }): DecimalDivideByDecimalL1Task {
  const [dividend, divisor, result, shifts] = TASKS[input.seed % TASKS.length]!;
  return { generatorId: DECIMAL_DIVIDE_BY_DECIMAL_L1_GENERATOR_ID, generatorVersion: 1, seed: input.seed, difficulty: input.difficulty, activity: input.activity, dividend, divisor, result, shifts };
}

export function shiftDecimalCommaRight(value: string, positions = 1): string {
  const digits = value.replace(",", "");
  const comma = value.includes(",") ? value.indexOf(",") : digits.length;
  const target = comma + positions;
  const expanded = digits.padEnd(target, "0");
  const shifted = target >= expanded.length ? expanded : `${expanded.slice(0, target)},${expanded.slice(target)}`;
  return shifted.includes(",") ? shifted : shifted.replace(/^0+(?=\d)/u, "") || "0";
}
