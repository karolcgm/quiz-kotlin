import {
  areEquivalentDecimals,
  formatDecimal,
  multiplyDecimalValues,
  parseDecimalInput,
} from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_NATURAL_MULTIPLY_L1_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_NATURAL_MULTIPLY_L1_SKILL_ID = "M5-5.7-decimal-times-natural" as const;

export type DecimalNaturalMultiplyL1Activity = "decimal-natural-mental" | "decimal-natural-written";

export interface DecimalNaturalMultiplyL1Task {
  generatorId: typeof DECIMAL_NATURAL_MULTIPLY_L1_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNaturalMultiplyL1Activity;
  decimalFactor: string;
  naturalFactor: number;
  prompt: string;
  skillIds: readonly [typeof DECIMAL_NATURAL_MULTIPLY_L1_SKILL_ID];
}

export interface DecimalNaturalMultiplyValidation {
  correct: boolean;
  code: DecimalFeedbackCode | null;
  answerLabel: string;
}

type TaskData = Pick<DecimalNaturalMultiplyL1Task, "decimalFactor" | "naturalFactor" | "prompt">;

const MENTAL_TASKS: readonly TaskData[] = [
  { decimalFactor: "1,2", naturalFactor: 3, prompt: "Oblicz w pamięci." },
  { decimalFactor: "2,5", naturalFactor: 4, prompt: "Oblicz w pamięci." },
  { decimalFactor: "0,7", naturalFactor: 5, prompt: "Oblicz w pamięci." },
  { decimalFactor: "3,4", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "1,05", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "0,25", naturalFactor: 4, prompt: "Oblicz w pamięci." },
  { decimalFactor: "4,2", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "1,6", naturalFactor: 5, prompt: "Oblicz w pamięci." },
  { decimalFactor: "0,45", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "2,05", naturalFactor: 3, prompt: "Oblicz w pamięci." },
];

const WRITTEN_TASKS: readonly TaskData[] = [
  { decimalFactor: "2,35", naturalFactor: 3, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "4,08", naturalFactor: 5, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "1,27", naturalFactor: 6, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "3,45", naturalFactor: 4, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "2,09", naturalFactor: 7, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "5,16", naturalFactor: 3, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "0,84", naturalFactor: 9, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "6,25", naturalFactor: 8, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "7,04", naturalFactor: 6, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "1,58", naturalFactor: 7, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
];

export function createPublicDecimalNaturalMultiplyL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNaturalMultiplyL1Activity;
}): DecimalNaturalMultiplyL1Task {
  const tasks = input.activity === "decimal-natural-mental" ? MENTAL_TASKS : WRITTEN_TASKS;
  const data = tasks[input.seed % tasks.length]!;
  return {
    generatorId: DECIMAL_NATURAL_MULTIPLY_L1_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    ...data,
    skillIds: [DECIMAL_NATURAL_MULTIPLY_L1_SKILL_ID],
  };
}

export function decimalNaturalMultiplyExpectedAnswer(task: Pick<DecimalNaturalMultiplyL1Task, "decimalFactor" | "naturalFactor">): string {
  const left = parseDecimalInput(task.decimalFactor);
  const right = parseDecimalInput(String(task.naturalFactor));
  if (!left.ok || !right.ok) throw new Error("Nie można obliczyć iloczynu.");
  return formatDecimal(multiplyDecimalValues(left.value, right.value), { trimTrailingZeros: true });
}

export function validateDecimalNaturalMultiplyAnswer(input: {
  task: DecimalNaturalMultiplyL1Task;
  answer: string;
}): DecimalNaturalMultiplyValidation {
  const answerLabel = input.answer.trim() || "□";
  if (!input.answer.trim()) return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, answerLabel };
  const actual = parseDecimalInput(input.answer);
  const expected = parseDecimalInput(decimalNaturalMultiplyExpectedAnswer(input.task));
  if (!actual.ok || !expected.ok || !areEquivalentDecimals(actual.value, expected.value)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, answerLabel };
  }
  return { correct: true, code: null, answerLabel };
}

export function isDecimalNaturalMultiplyL1Activity(activity: string): activity is DecimalNaturalMultiplyL1Activity {
  return activity === "decimal-natural-mental" || activity === "decimal-natural-written";
}
