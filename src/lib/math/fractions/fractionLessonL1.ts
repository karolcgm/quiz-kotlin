import type { LessonDifficulty } from "@/types/lessonPackage";
import type { FractionValue } from "@/types/fractions";
import {
  fractionLessonL2ActivityFromStageId,
  type FractionLessonL2Activity,
} from "@/lib/math/fractions/fractionLessonL2";
import {
  fractionQuotientActivityFromStageId,
  type FractionQuotientActivity,
} from "@/lib/math/fractions/fractionQuotientLesson";
import {
  fractionEquivalenceActivityFromStageId,
  type FractionEquivalenceActivity,
} from "@/lib/math/fractions/fractionEquivalenceLesson";
import {
  fractionComparisonActivityFromStageId,
  type FractionComparisonActivity,
} from "@/lib/math/fractions/fractionComparisonLesson";
import {
  fractionSameDenominatorActivityFromStageId,
  type FractionSameDenominatorActivity,
} from "@/lib/math/fractions/fractionSameDenominatorLesson";
import {
  fractionSameDenominatorMixedActivityFromStageId,
  type FractionSameDenominatorMixedActivity,
} from "@/lib/math/fractions/fractionSameDenominatorMixedLesson";
import {
  fractionDifferentDenominatorMeasureActivityFromStageId,
  type FractionDifferentDenominatorMeasureActivity,
} from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import {
  fractionDifferentDenominatorAdvancedActivityFromStageId,
  type FractionDifferentDenominatorAdvancedActivity,
} from "@/lib/math/fractions/fractionDifferentDenominatorAdvancedLesson";
import {
  fractionOperationsActivityFromStageId,
  type FractionOperationsActivity,
} from "@/lib/math/fractions/fractionOperationsLesson";

export const FRACTION_L1_DENOMINATORS = [2, 3, 4, 6, 8] as const;

export type FractionLessonL1Activity =
  | "same-whole"
  | "model-notation"
  | "parts-meaning"
  | "number-line"
  | "independent";

export type FractionLessonActivity =
  | FractionLessonL1Activity
  | FractionLessonL2Activity
  | FractionQuotientActivity
  | FractionEquivalenceActivity
  | FractionComparisonActivity
  | FractionDifferentDenominatorMeasureActivity
  | FractionDifferentDenominatorAdvancedActivity
  | FractionOperationsActivity
  | FractionSameDenominatorMixedActivity
  | FractionSameDenominatorActivity;

export interface FractionLessonL1PublicTask {
  generatorId: "fraction-lesson-l1-v1";
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionLessonL1Activity;
  prompt: string;
  target: FractionValue;
  allowedDenominators: readonly number[];
  axis: {
    minimum: 0;
    maximum: 1;
    subdivisions: number;
  };
  skillIds: readonly ["M5-3.1-part-whole", "M5-3.1-number-line"];
}

const DENOMINATORS_BY_DIFFICULTY: Record<LessonDifficulty, readonly number[]> = {
  support: [2, 3, 4],
  core: [3, 4, 6, 8],
  challenge: [4, 6, 8],
};

function deterministicIndex(seed: number, salt: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed zadania ułamkowego musi być liczbą całkowitą.");
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) % length;
}

function promptFor(activity: FractionLessonL1Activity, target: FractionValue): string {
  const value = `${target.numerator}/${target.denominator}`;
  switch (activity) {
    case "same-whole":
      return "Podziel pizzę i pasek na tyle samo równych części. Nierównego cięcia nie zatwierdzaj.";
    case "model-notation":
      return "Zmieniaj model i zapis w obu kierunkach. Każda zmiana ma zachować tę samą wartość.";
    case "parts-meaning":
      return "Wskaż, co w modelu opisuje licznik, a co mianownik.";
    case "number-line":
      return `Ustaw punkt ${value} na osi od 0 do 1.`;
    case "independent":
      return `Zbuduj ${value} jednocześnie jako pizzę, pasek i punkt na osi.`;
  }
}

/**
 * Publiczny generator L1. Moduł nie zna prywatnego answerSpec i może bezpiecznie
 * wejść do bundla klienta; zadanie pokazuje uczniowi jedynie jawny cel modelowania.
 */
export function createPublicFractionLessonL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionLessonL1Activity;
}): FractionLessonL1PublicTask {
  const denominators = DENOMINATORS_BY_DIFFICULTY[input.difficulty];
  const denominator = denominators[deterministicIndex(input.seed, 0x53101, denominators.length)]!;
  const numerator = input.difficulty === "support"
    ? Math.max(1, Math.floor(denominator / 2))
    : input.difficulty === "challenge"
      ? Math.max(1, denominator - 1 - deterministicIndex(input.seed, 0x53102, 2))
      : 1 + deterministicIndex(input.seed, 0x53103, denominator - 1);
  const target = { numerator: Math.min(numerator, denominator), denominator };

  return {
    generatorId: "fraction-lesson-l1-v1",
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity, target),
    target,
    allowedDenominators: [...FRACTION_L1_DENOMINATORS],
    axis: { minimum: 0, maximum: 1, subdivisions: denominator },
    skillIds: ["M5-3.1-part-whole", "M5-3.1-number-line"],
  };
}

/** Zachowana nazwa adaptera jest używana przez wspólne rendery `fraction-lesson`. */
export function fractionLessonL1ActivityFromStageId(stageId: string): FractionLessonActivity {
  const operationsActivity = fractionOperationsActivityFromStageId(stageId);
  if (operationsActivity) return operationsActivity;
  const differentDenominatorAdvancedActivity = fractionDifferentDenominatorAdvancedActivityFromStageId(stageId);
  if (differentDenominatorAdvancedActivity) return differentDenominatorAdvancedActivity;
  const differentDenominatorActivity = fractionDifferentDenominatorMeasureActivityFromStageId(stageId);
  if (differentDenominatorActivity) return differentDenominatorActivity;
  const sameDenominatorMixedActivity = fractionSameDenominatorMixedActivityFromStageId(stageId);
  if (sameDenominatorMixedActivity) return sameDenominatorMixedActivity;
  const sameDenominatorActivity = fractionSameDenominatorActivityFromStageId(stageId);
  if (sameDenominatorActivity) return sameDenominatorActivity;
  const comparisonActivity = fractionComparisonActivityFromStageId(stageId);
  if (comparisonActivity) return comparisonActivity;
  const equivalenceActivity = fractionEquivalenceActivityFromStageId(stageId);
  if (equivalenceActivity) return equivalenceActivity;
  const quotientActivity = fractionQuotientActivityFromStageId(stageId);
  if (quotientActivity) return quotientActivity;
  const l2Activity = fractionLessonL2ActivityFromStageId(stageId);
  if (l2Activity) return l2Activity;
  if (stageId.includes("same-whole")) return "same-whole";
  if (stageId.includes("model-notation")) return "model-notation";
  if (stageId.includes("parts-meaning")) return "parts-meaning";
  if (stageId.includes("fraction-axis")) return "number-line";
  if (stageId.includes("independent")) return "independent";
  return "model-notation";
}

export function isEqualFractionPartition(parts: readonly number[], tolerance = 1e-7): boolean {
  if (parts.length < 2 || parts.some((part) => !Number.isFinite(part) || part <= 0)) return false;
  const total = parts.reduce((sum, part) => sum + part, 0);
  const expected = total / parts.length;
  return parts.every((part) => Math.abs(part - expected) <= tolerance);
}

export function fractionPartitionAttempt(denominator: number, offsetPercent: number): number[] {
  if (!FRACTION_L1_DENOMINATORS.includes(denominator as (typeof FRACTION_L1_DENOMINATORS)[number])) {
    throw new Error("L1 dzieli całość wyłącznie na 2, 3, 4, 6 albo 8 części.");
  }
  const equalPart = 1 / denominator;
  const safeOffset = Math.max(-20, Math.min(20, offsetPercent)) / 100 * equalPart;
  const parts = Array.from({ length: denominator }, () => equalPart);
  parts[0] = equalPart + safeOffset;
  parts[1] = equalPart - safeOffset;
  return parts;
}

export function fractionWholesMatch(referenceSize: number, candidateSize: number, tolerance = 1e-7): boolean {
  return Number.isFinite(referenceSize)
    && Number.isFinite(candidateSize)
    && referenceSize > 0
    && candidateSize > 0
    && Math.abs(referenceSize - candidateSize) <= tolerance;
}

export function isFractionPointOnTick(position: number, denominator: number, tolerance = 1e-7): boolean {
  if (!Number.isFinite(position) || !Number.isSafeInteger(denominator) || denominator <= 0) return false;
  const scaled = position * denominator;
  return Math.abs(scaled - Math.round(scaled)) <= tolerance;
}

export function snapFractionPointToNumerator(position: number, denominator: number): number {
  if (!Number.isFinite(position) || !Number.isSafeInteger(denominator) || denominator <= 0) {
    throw new Error("Pozycja osi i mianownik muszą opisywać poprawną podziałkę.");
  }
  return Math.max(0, Math.min(denominator, Math.round(position * denominator)));
}
