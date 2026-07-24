import { createFractionDiagnosticResult } from "@/lib/math/fractions/fractionDiagnostics";
import { mixedToImproper } from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type {
  FractionFeedbackCode,
  FractionValue,
  MixedFractionValue,
} from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const FRACTION_MIXED_CONVERSION_CODE = "FRA_MIXED_CONVERSION" as const;

export type FractionLessonL2DiagnosticCode =
  | FractionFeedbackCode
  | typeof FRACTION_MIXED_CONVERSION_CODE;

export type FractionLessonL2Activity =
  | "more-than-one-pizza"
  | "group-wholes"
  | "extract-wholes"
  | "convert-both-ways"
  | "mixed-number-line"
  | "class-picnic"
  | "independent-l2";

export type FractionLessonL2SourceKind = "proper" | "improper" | "mixed";

export interface FractionLessonL2PublicTask {
  generatorId: "fraction-lesson-l2-v1";
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionLessonL2Activity;
  prompt: string;
  target: FractionValue;
  mixed: MixedFractionValue;
  sourceKind: FractionLessonL2SourceKind;
  axis: {
    minimum: 0;
    maximum: 3;
    subdivisions: number;
  };
  skillIds: readonly [
    "M5-3.1-proper-improper",
    "M5-3.1-mixed-conversion",
    "M5-3.1-mixed-number-line",
  ];
}

const DENOMINATORS: Record<LessonDifficulty, readonly number[]> = {
  support: [2, 3, 4],
  core: [3, 4, 5, 6, 8],
  challenge: [4, 5, 6, 7, 8, 10, 12],
};

function deterministicIndex(seed: number, salt: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed L2 musi być bezpieczną liczbą całkowitą.");
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) % length;
}

function positiveModulo(value: number, divisor: number): number {
  return (value % divisor + divisor) % divisor;
}

/** Zamiana zachowująca szkolny mianownik zamiast automatycznego skracania. */
export function toMixedFractionWithSameDenominator(value: FractionValue): MixedFractionValue {
  if (!Number.isSafeInteger(value.numerator) || !Number.isSafeInteger(value.denominator) || value.denominator <= 0) {
    throw new Error("Ułamek do zamiany musi mieć całkowity licznik i dodatni mianownik.");
  }
  if (value.numerator < 0) throw new Error("L2 pracuje na nieujemnych ułamkach.");
  return {
    wholePart: Math.floor(value.numerator / value.denominator),
    numerator: value.numerator % value.denominator,
    denominator: value.denominator,
  };
}

export function classifyFraction(value: FractionValue): "proper" | "improper" {
  if (!Number.isSafeInteger(value.numerator) || !Number.isSafeInteger(value.denominator) || value.denominator <= 0) {
    throw new Error("Klasyfikowany ułamek musi mieć dodatni mianownik.");
  }
  return value.numerator < value.denominator ? "proper" : "improper";
}

export function mixedConversionEquation(value: MixedFractionValue): {
  multiplication: number;
  numerator: number;
  result: number;
  text: string;
} {
  const improper = mixedToImproper(value);
  const multiplication = Math.abs(value.wholePart) * value.denominator;
  return {
    multiplication,
    numerator: value.numerator,
    result: Math.abs(improper.numerator),
    text: `${Math.abs(value.wholePart)} × ${value.denominator} + ${value.numerator} = ${Math.abs(improper.numerator)}`,
  };
}

function generatedTarget(input: {
  seed: number;
  difficulty: LessonDifficulty;
}): { target: FractionValue; sourceKind: FractionLessonL2SourceKind } {
  const denominators = DENOMINATORS[input.difficulty];
  const denominator = denominators[deterministicIndex(input.seed, 0x53120, denominators.length)]!;
  const profile = positiveModulo(input.seed, 15);

  // Dwa stabilne seedy graniczne sprawdzają dokładnie 1 i 2.
  if (profile === 13) return { target: { numerator: denominator, denominator }, sourceKind: "improper" };
  if (profile === 14) return { target: { numerator: 2 * denominator, denominator }, sourceKind: "improper" };

  const sourceKind = (["proper", "improper", "mixed"] as const)[profile % 3]!;
  const remainder = 1 + deterministicIndex(input.seed, 0x53121, denominator - 1);
  if (sourceKind === "proper") {
    return { target: { numerator: remainder, denominator }, sourceKind };
  }
  const wholePart = 1 + deterministicIndex(input.seed, 0x53122, 2);
  return {
    target: { numerator: wholePart * denominator + remainder, denominator },
    sourceKind,
  };
}

function promptFor(
  activity: FractionLessonL2Activity,
  target: FractionValue,
  sourceKind: FractionLessonL2SourceKind,
): string {
  switch (activity) {
    case "more-than-one-pizza":
      return "Odczytaj 7/4 z dwóch pizz. To poprawny ułamek niewłaściwy, a nie błąd zapisu.";
    case "group-wholes":
      return "Masz 7 kawałków po 1/4 pizzy. Połącz 4 kawałki w jedną całą pizzę i sprawdź, ile ćwiartek zostanie.";
    case "convert-both-ways":
      return "Zamieniaj ułamek niewłaściwy i liczbę mieszaną w obie strony, zachowując wartość.";
    case "extract-wholes":
      return "Wyłącz pełne całości z ułamka niewłaściwego. Iloraz jest liczbą całkowitą, a reszta tworzy część ułamkową.";
    case "mixed-number-line":
      return `Ustaw ${target.numerator}/${target.denominator} na osi z zaznaczonymi granicami 1 i 2.`;
    case "class-picnic":
      return "Na piknik przygotowano 11 ćwiartek pizzy. Zapisz, ile to całych pizz i jaka część pozostaje.";
    case "independent-l2":
      return sourceKind === "mixed"
        ? "Zamień liczbę mieszaną na ułamek niewłaściwy i zaznacz tę samą wartość na osi."
        : "Rozpoznaj rodzaj ułamka, wykonaj potrzebną zamianę i zaznacz wartość na osi.";
  }
}

/** Publiczny, deterministyczny generator L2; nie zawiera answerSpec. */
export function createPublicFractionLessonL2Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionLessonL2Activity;
}): FractionLessonL2PublicTask {
  let generated = generatedTarget(input);
  if (input.activity === "extract-wholes") {
    const examples: readonly FractionValue[] = [
      { numerator: 41, denominator: 12 },
      { numerator: 24, denominator: 7 },
      { numerator: 53, denominator: 8 },
      { numerator: 47, denominator: 9 },
      { numerator: 68, denominator: 11 },
    ];
    generated = { target: examples[positiveModulo(input.seed, examples.length)]!, sourceKind: "improper" };
  } else if (input.activity === "more-than-one-pizza" || input.activity === "group-wholes" || input.activity === "convert-both-ways") {
    generated = { target: { numerator: 7, denominator: 4 }, sourceKind: "improper" };
  } else if (input.activity === "class-picnic") {
    generated = { target: { numerator: 11, denominator: 4 }, sourceKind: "improper" };
  }
  const mixed = toMixedFractionWithSameDenominator(generated.target);
  return {
    generatorId: "fraction-lesson-l2-v1",
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity, generated.target, generated.sourceKind),
    target: generated.target,
    mixed,
    sourceKind: generated.sourceKind,
    axis: { minimum: 0, maximum: 3, subdivisions: generated.target.denominator },
    skillIds: [
      "M5-3.1-proper-improper",
      "M5-3.1-mixed-conversion",
      "M5-3.1-mixed-number-line",
    ],
  };
}

const L2_ACTIVITIES = new Set<FractionLessonL2Activity>([
  "more-than-one-pizza",
  "group-wholes",
  "extract-wholes",
  "convert-both-ways",
  "mixed-number-line",
  "class-picnic",
  "independent-l2",
]);

export function isFractionLessonL2Activity(value: string): value is FractionLessonL2Activity {
  return L2_ACTIVITIES.has(value as FractionLessonL2Activity);
}

export function fractionLessonL2ActivityFromStageId(stageId: string): FractionLessonL2Activity | null {
  if (stageId.includes("l2-more-than-one")) return "more-than-one-pizza";
  if (stageId.includes("l2-group-wholes")) return "group-wholes";
  if (stageId.includes("l2-convert")) return "convert-both-ways";
  if (stageId.includes("topic2-improper-to-mixed")) return "extract-wholes";
  if (stageId.includes("l2-mixed-axis")) return "mixed-number-line";
  if (stageId.includes("l2-class-picnic")) return "class-picnic";
  if (stageId.includes("l2-independent")) return "independent-l2";
  return null;
}

const MIXED_COPY: DiagnosticFeedbackCopy = {
  area: "Zamiana pominęła pełną całość albo resztę ułamkową.",
  guidingQuestion: "Ile pełnych mianowników mieści się w liczniku i jaka reszta pozostaje?",
  visualHint: "Obrysuj pełne grupy, a potem połącz: całości × mianownik + licznik reszty.",
  analogousExample: "Dla 9/4 mamy dwie pełne czwórki i jedną ćwiartkę, czyli 2 1/4.",
};

export function createFractionLessonL2DiagnosticResult(
  code: FractionLessonL2DiagnosticCode,
  memberIds: string[] = ["whole-part", "remainder-numerator", "denominator"],
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (code !== FRACTION_MIXED_CONVERSION_CODE) return createFractionDiagnosticResult(code, { memberIds });
  return {
    result: createLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: 2,
      errorCodes: [FRACTION_MIXED_CONVERSION_CODE],
      feedbackKey: "fraction.fra_mixed_conversion",
    }),
    copy: MIXED_COPY,
    highlights: [{
      id: "fraction-mixed-conversion",
      kind: "pair",
      memberIds,
      label: "Pełne całości i reszta w zamianie",
      state: "attention",
      pattern: "double",
      symbol: "× +",
      accent: "violet",
    }],
  };
}

export const FRACTION_L2_FEEDBACK_KEYS: readonly FractionLessonL2DiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.emptyPart,
  FRACTION_FEEDBACK_CODES.zeroDenominator,
  FRACTION_FEEDBACK_CODES.numeratorDenominatorSwapped,
  FRACTION_FEEDBACK_CODES.notEquivalent,
  FRACTION_FEEDBACK_CODES.notSimplified,
  FRACTION_FEEDBACK_CODES.wrongOperationPair,
  FRACTION_FEEDBACK_CODES.unequalParts,
  FRACTION_FEEDBACK_CODES.wholeMismatch,
  FRACTION_MIXED_CONVERSION_CODE,
];
