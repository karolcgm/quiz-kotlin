import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_NATURAL_DIVIDE_L1_GENERATOR_ID = "decimal-natural-divide-l1-v1" as const;

export type DecimalNaturalDivideL1Activity = "decimal-natural-divide-mental" | "decimal-natural-divide-written" | "decimal-natural-divide-story";

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
  story?: string;
  storyQuestion?: string;
  answerUnit?: string;
  pictureKind?: "juice" | "ribbon" | "paint" | "apples";
}

export interface DecimalNaturalLongDivisionStep {
  partialDividendDisplay: string;
  productDisplay: string;
  nextDisplay: string;
  quotientDigit: string;
  end: number;
}

function decimalSeparatorPosition(value: string): number {
  const normalized = value.replace(".", ",");
  const separator = normalized.indexOf(",");
  return separator === -1 ? normalized.length : separator;
}

export function buildDecimalNaturalLongDivisionSteps(
  dividend: string,
  divisor: number,
  appendedZeros = 0,
): DecimalNaturalLongDivisionStep[] {
  if (!Number.isInteger(divisor) || divisor <= 0) throw new Error("Dzielnik musi być dodatnią liczbą naturalną.");
  if (!Number.isInteger(appendedZeros) || appendedZeros < 0) throw new Error("Liczba dopisanych zer nie może być ujemna.");

  const normalized = dividend.trim().replace(".", ",");
  const integerDigitCount = decimalSeparatorPosition(normalized);
  const baseDigits = normalized.replace(",", "");
  if (!/^\d+$/u.test(baseDigits)) throw new Error("Dzielna musi być nieujemną liczbą dziesiętną.");
  const digits = `${baseDigits}${"0".repeat(appendedZeros)}`;

  let start = 0;
  let partialDividend = Number(digits[0] ?? "0");
  while (start < integerDigitCount - 1 && partialDividend < divisor) {
    start += 1;
    partialDividend = partialDividend * 10 + Number(digits[start]);
  }

  const steps: DecimalNaturalLongDivisionStep[] = [];
  for (let end = start; end < digits.length; end += 1) {
    if (end > start) partialDividend = Number(steps.at(-1)!.nextDisplay);

    const quotientDigit = Math.floor(partialDividend / divisor);
    const product = quotientDigit * divisor;
    const remainder = partialDividend - product;
    const nextDisplay = end < digits.length - 1
      ? String(remainder * 10 + Number(digits[end + 1]))
      : String(remainder);

    steps.push({
      partialDividendDisplay: String(partialDividend),
      productDisplay: String(product),
      nextDisplay,
      quotientDigit: String(quotientDigit),
      end,
    });
  }

  return steps;
}

const MENTAL_TASKS = [
  ["8,4", 2, "4,2"], ["7,5", 3, "2,5"], ["6,4", 4, "1,6"], ["9,6", 3, "3,2"], ["2,4", 6, "0,4"],
  ["12,6", 2, "6,3"], ["4,8", 6, "0,8"], ["5,4", 9, "0,6"], ["3,6", 4, "0,9"], ["14,4", 8, "1,8"],
] as const;

const WRITTEN_TASKS = [
  ["4,2", 8, "0,525", 2], ["5,04", 6, "0,84", 0], ["7,5", 4, "1,875", 2], ["3,6", 8, "0,45", 1], ["6,3", 6, "1,05", 1],
  ["2,4", 5, "0,48", 1], ["9,6", 8, "1,2", 0], ["1,8", 4, "0,45", 1], ["4,05", 9, "0,45", 0], ["12,5", 8, "1,5625", 3],
] as const;

const STORY_TASKS = [
  ["6,4", 8, "0,8", 0, "Do 8 jednakowych butelek rozlano 6,4 l soku.", "Ile litrów soku jest w każdej butelce?", "l", "juice"],
  ["7,5", 3, "2,5", 0, "Wstążkę długości 7,5 m podzielono na 3 równe części.", "Jaką długość ma jedna część?", "m", "ribbon"],
  ["4,2", 6, "0,7", 0, "Do sześciu identycznych puszek przelano 4,2 l farby.", "Ile litrów farby jest w jednej puszce?", "l", "paint"],
  ["9,6", 8, "1,2", 0, "9,6 kg jabłek zapakowano do 8 takich samych skrzynek.", "Ile kilogramów jabłek jest w jednej skrzynce?", "kg", "apples"],
] as const;

export function isDecimalNaturalDivideL1Activity(activity: string): activity is DecimalNaturalDivideL1Activity {
  return activity === "decimal-natural-divide-mental" || activity === "decimal-natural-divide-written" || activity === "decimal-natural-divide-story";
}

export function createPublicDecimalNaturalDivideL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNaturalDivideL1Activity;
}): DecimalNaturalDivideL1Task {
  const tasks = input.activity === "decimal-natural-divide-mental" ? MENTAL_TASKS : input.activity === "decimal-natural-divide-story" ? STORY_TASKS : WRITTEN_TASKS;
  const [dividend, divisor, result, appendedZeros = 0, story, storyQuestion, answerUnit, pictureKind] = tasks[input.seed % tasks.length]!;
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
    prompt: input.activity === "decimal-natural-divide-mental" ? "Oblicz w pamięci." : input.activity === "decimal-natural-divide-story" ? "Rozwiąż zadanie tekstowe metodą dzielenia pisemnego." : "Wykonaj dzielenie pisemne.",
    story,
    storyQuestion,
    answerUnit,
    pictureKind: pictureKind as DecimalNaturalDivideL1Task["pictureKind"],
  };
}

export function validateDecimalNaturalDivideL1Answer(task: DecimalNaturalDivideL1Task, answer: string): boolean {
  return answer.trim().replace(".", ",") === task.result;
}
