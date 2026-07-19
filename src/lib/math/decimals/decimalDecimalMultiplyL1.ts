import {
  areEquivalentDecimals,
  formatDecimal,
  multiplyDecimalValues,
  parseDecimalInput,
} from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_DECIMAL_MULTIPLY_L1_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_DECIMAL_MULTIPLY_L1_SKILL_ID = "M5-5.8-multiply-decimals" as const;

export type DecimalDecimalMultiplyL1Activity =
  | "decimal-decimal-mental"
  | "decimal-decimal-written"
  | "decimal-decimal-story";

export type DecimalDecimalStoryPicture = "garden" | "apples" | "fabric" | "panel";

export interface DecimalDecimalMultiplyL1Task {
  generatorId: typeof DECIMAL_DECIMAL_MULTIPLY_L1_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalDecimalMultiplyL1Activity;
  leftFactor: string;
  rightFactor: string;
  prompt: string;
  story?: string;
  storyQuestion?: string;
  answerUnit?: string;
  pictureKind?: DecimalDecimalStoryPicture;
  skillIds: readonly [typeof DECIMAL_DECIMAL_MULTIPLY_L1_SKILL_ID];
}

export interface DecimalDecimalWrittenTrace {
  leftDigits: string;
  rightDigits: string;
  decimalPlaces: number;
  partialProducts: readonly { digit: string; shift: number; value: string }[];
  rawProduct: string;
  result: string;
}

type TaskData = Pick<DecimalDecimalMultiplyL1Task, "leftFactor" | "rightFactor" | "prompt" | "story" | "storyQuestion" | "answerUnit" | "pictureKind">;

const MENTAL_TASKS: readonly TaskData[] = [
  { leftFactor: "0,2", rightFactor: "0,3", prompt: "Oblicz w pamięci." },
  { leftFactor: "0,4", rightFactor: "1,5", prompt: "Oblicz w pamięci." },
  { leftFactor: "1,2", rightFactor: "0,5", prompt: "Oblicz w pamięci." },
  { leftFactor: "2,5", rightFactor: "0,4", prompt: "Oblicz w pamięci." },
  { leftFactor: "0,75", rightFactor: "0,2", prompt: "Oblicz w pamięci." },
  { leftFactor: "1,1", rightFactor: "0,6", prompt: "Oblicz w pamięci." },
  { leftFactor: "0,25", rightFactor: "0,8", prompt: "Oblicz w pamięci." },
  { leftFactor: "3,2", rightFactor: "0,5", prompt: "Oblicz w pamięci." },
  { leftFactor: "0,09", rightFactor: "0,4", prompt: "Oblicz w pamięci." },
  { leftFactor: "1,25", rightFactor: "0,4", prompt: "Oblicz w pamięci." },
] as const;

const WRITTEN_TASKS: readonly TaskData[] = [
  { leftFactor: "1,2", rightFactor: "0,35", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "2,35", rightFactor: "1,4", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "4,08", rightFactor: "2,5", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "0,84", rightFactor: "1,6", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "3,25", rightFactor: "0,48", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "1,27", rightFactor: "2,4", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "0,56", rightFactor: "3,5", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "6,04", rightFactor: "1,25", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "2,08", rightFactor: "0,75", prompt: "Wykonaj mnożenie pisemne." },
  { leftFactor: "7,5", rightFactor: "1,08", prompt: "Wykonaj mnożenie pisemne." },
] as const;

const STORY_TASKS: readonly TaskData[] = [
  { leftFactor: "2,4", rightFactor: "1,5", prompt: "Rozwiąż zadanie tekstowe.", story: "Prostokątna rabata ma długość 2,4 m i szerokość 1,5 m.", storyQuestion: "Jakie pole ma rabata?", answerUnit: "m²", pictureKind: "garden" },
  { leftFactor: "1,75", rightFactor: "4,8", prompt: "Rozwiąż zadanie tekstowe.", story: "Kupiono 1,75 kg jabłek. Jeden kilogram kosztuje 4,80 zł.", storyQuestion: "Ile zapłacono za jabłka?", answerUnit: "zł", pictureKind: "apples" },
  { leftFactor: "3,2", rightFactor: "6,5", prompt: "Rozwiąż zadanie tekstowe.", story: "Do dekoracji potrzeba 3,2 m tkaniny. Jeden metr kosztuje 6,50 zł.", storyQuestion: "Ile kosztuje potrzebna tkanina?", answerUnit: "zł", pictureKind: "fabric" },
  { leftFactor: "1,25", rightFactor: "0,8", prompt: "Rozwiąż zadanie tekstowe.", story: "Prostokątny panel ma długość 1,25 m i szerokość 0,8 m.", storyQuestion: "Jakie pole ma panel?", answerUnit: "m²", pictureKind: "panel" },
] as const;

function decimalPlaces(display: string): number {
  return display.split(",")[1]?.length ?? 0;
}

function integerDigits(display: string): string {
  const digits = display.replace(",", "").replace(/^0+(?=\d)/u, "");
  return digits || "0";
}

export function decimalDecimalMultiplyExpectedAnswer(task: Pick<DecimalDecimalMultiplyL1Task, "leftFactor" | "rightFactor">): string {
  const left = parseDecimalInput(task.leftFactor);
  const right = parseDecimalInput(task.rightFactor);
  if (!left.ok || !right.ok) throw new Error("Nie można obliczyć iloczynu.");
  return formatDecimal(multiplyDecimalValues(left.value, right.value), { trimTrailingZeros: true });
}

export function decimalDecimalWrittenTrace(task: Pick<DecimalDecimalMultiplyL1Task, "leftFactor" | "rightFactor">): DecimalDecimalWrittenTrace {
  const leftDigits = integerDigits(task.leftFactor);
  const rightDigits = integerDigits(task.rightFactor);
  const leftNumber = Number(leftDigits);
  const partialProducts = [...rightDigits].reverse().map((digit, shift) => ({
    digit,
    shift,
    value: String(leftNumber * Number(digit)),
  }));
  return {
    leftDigits,
    rightDigits,
    decimalPlaces: decimalPlaces(task.leftFactor) + decimalPlaces(task.rightFactor),
    partialProducts,
    rawProduct: String(leftNumber * Number(rightDigits)),
    result: decimalDecimalMultiplyExpectedAnswer(task),
  };
}

export function createPublicDecimalDecimalMultiplyL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalDecimalMultiplyL1Activity;
}): DecimalDecimalMultiplyL1Task {
  const tasks = input.activity === "decimal-decimal-mental"
    ? MENTAL_TASKS
    : input.activity === "decimal-decimal-story"
      ? STORY_TASKS
      : WRITTEN_TASKS;
  const baseSeed = input.activity === "decimal-decimal-mental" ? 558100 : input.activity === "decimal-decimal-written" ? 558200 : 558300;
  const index = ((input.seed - baseSeed) % tasks.length + tasks.length) % tasks.length;
  return {
    generatorId: DECIMAL_DECIMAL_MULTIPLY_L1_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    ...tasks[index]!,
    skillIds: [DECIMAL_DECIMAL_MULTIPLY_L1_SKILL_ID],
  };
}

export function validateDecimalDecimalMultiplyAnswer(input: {
  task: DecimalDecimalMultiplyL1Task;
  answer: string;
}): { correct: boolean; code: DecimalFeedbackCode | null; answerLabel: string } {
  const answerLabel = input.answer.trim() || "□";
  if (!input.answer.trim()) return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, answerLabel };
  const actual = parseDecimalInput(input.answer);
  const expected = parseDecimalInput(decimalDecimalMultiplyExpectedAnswer(input.task));
  if (!actual.ok || !expected.ok || !areEquivalentDecimals(actual.value, expected.value)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.productPlaces, answerLabel };
  }
  return { correct: true, code: null, answerLabel };
}

export function isDecimalDecimalMultiplyL1Activity(activity: string): activity is DecimalDecimalMultiplyL1Activity {
  return activity === "decimal-decimal-mental" || activity === "decimal-decimal-written" || activity === "decimal-decimal-story";
}
