import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_NATURAL_DIVIDE_L1_GENERATOR_ID = "decimal-natural-divide-l1-v1" as const;

export type DecimalNaturalDivideL1Activity = "decimal-natural-divide-mental" | "decimal-natural-divide-written";

export interface DecimalNaturalDivideL1Task {
  generatorId: typeof DECIMAL_NATURAL_DIVIDE_L1_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNaturalDivideL1Activity;
  dividend: string;
  divisor: number;
  result: string;
  appendedZeros: number;
  prompt: string;
}

const MENTAL_TASKS = [
  ["8,4", 2, "4,2"], ["7,5", 3, "2,5"], ["6,4", 4, "1,6"], ["9,6", 3, "3,2"], ["2,4", 6, "0,4"],
  ["12,6", 2, "6,3"], ["4,8", 6, "0,8"], ["5,4", 9, "0,6"], ["3,6", 4, "0,9"], ["14,4", 8, "1,8"],
] as const;

const WRITTEN_TASKS = [
  ["4,2", 8, "0,525", 2], ["5,04", 6, "0,84", 0], ["7,5", 4, "1,875", 2], ["3,6", 8, "0,45", 1], ["6,3", 6, "1,05", 1],
  ["2,4", 5, "0,48", 1], ["9,6", 8, "1,2", 0], ["1,8", 4, "0,45", 1], ["4,05", 9, "0,45", 0], ["12,5", 8, "1,5625", 3],
] as const;

export function isDecimalNaturalDivideL1Activity(activity: string): activity is DecimalNaturalDivideL1Activity {
  return activity === "decimal-natural-divide-mental" || activity === "decimal-natural-divide-written";
}

export function createPublicDecimalNaturalDivideL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNaturalDivideL1Activity;
}): DecimalNaturalDivideL1Task {
  const tasks = input.activity === "decimal-natural-divide-mental" ? MENTAL_TASKS : WRITTEN_TASKS;
  const [dividend, divisor, result, appendedZeros = 0] = tasks[input.seed % tasks.length]!;
  return {
    generatorId: DECIMAL_NATURAL_DIVIDE_L1_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    dividend,
    divisor,
    result,
    appendedZeros,
    prompt: input.activity === "decimal-natural-divide-mental" ? "Oblicz w pamięci." : "Wykonaj dzielenie pisemne.",
  };
}

export function validateDecimalNaturalDivideL1Answer(task: DecimalNaturalDivideL1Task, answer: string): boolean {
  return answer.trim().replace(".", ",") === task.result;
}
