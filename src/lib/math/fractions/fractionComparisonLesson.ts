import { createFractionDiagnosticResult } from "@/lib/math/fractions/fractionDiagnostics";
import { greatestCommonDivisor } from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { FractionFeedbackCode, FractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const FRACTION_COMPARISON_GENERATOR_ID = "fraction-comparison-l1-v1" as const;

export const FRACTION_COMPARISON_WRONG_SIGN_CODE = "FRA_COMPARISON_WRONG_SIGN" as const;
export const FRACTION_COMPARISON_JUSTIFICATION_CODE = "FRA_COMPARISON_JUSTIFICATION" as const;
export const FRACTION_COMPARISON_ORDER_CODE = "FRA_COMPARISON_ORDER" as const;
export const FRACTION_COMPARISON_STRATEGY_CODE = "FRA_COMPARISON_STRATEGY" as const;

export type FractionComparisonDiagnosticCode =
  | FractionFeedbackCode
  | typeof FRACTION_COMPARISON_WRONG_SIGN_CODE
  | typeof FRACTION_COMPARISON_JUSTIFICATION_CODE
  | typeof FRACTION_COMPARISON_ORDER_CODE
  | typeof FRACTION_COMPARISON_STRATEGY_CODE;

export type FractionComparisonActivity =
  | "same-denominator"
  | "same-numerator"
  | "common-measure"
  | "cross-multiplication"
  | "overlay-bars"
  | "common-axis"
  | "shortest-strategy"
  | "denominator-trap"
  | "drone-race"
  | "independent-comparison";

export type FractionComparisonSign = "<" | "=" | ">";

export type FractionComparisonStrategy =
  | "common-denominator"
  | "common-numerator"
  | "reference-half"
  | "reference-one";

export interface FractionComparisonPublicTask {
  generatorId: typeof FRACTION_COMPARISON_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionComparisonActivity;
  prompt: string;
  fractions: readonly FractionValue[];
  recommendedStrategy: FractionComparisonStrategy;
  sameWholeRequired: true;
  skillIds: readonly [
    "M5-3.4-compare-fractions",
    "M5-3.4-common-measure",
    "M5-3.4-reference-strategy",
    "M5-3.4-justify-order",
  ];
  invariants: readonly [
    "same-whole-before-comparison",
    "positive-non-zero-denominator",
    "exact-integer-cross-products",
    "difference-method-not-required-in-base",
  ];
}

interface ComparisonCase {
  fractions: readonly FractionValue[];
  strategy: FractionComparisonStrategy;
}

const FIXED_CASES: Record<Exclude<FractionComparisonActivity, "independent-comparison">, ComparisonCase> = {
  "same-denominator": {
    fractions: [{ numerator: 2, denominator: 6 }, { numerator: 5, denominator: 6 }],
    strategy: "common-denominator",
  },
  "same-numerator": {
    fractions: [{ numerator: 3, denominator: 4 }, { numerator: 3, denominator: 8 }],
    strategy: "common-numerator",
  },
  "common-measure": {
    fractions: [{ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 4 }],
    strategy: "common-denominator",
  },
  "cross-multiplication": {
    fractions: [{ numerator: 1, denominator: 2 }, { numerator: 2, denominator: 3 }],
    strategy: "common-denominator",
  },
  "overlay-bars": {
    fractions: [{ numerator: 3, denominator: 4 }, { numerator: 5, denominator: 8 }],
    strategy: "common-denominator",
  },
  "common-axis": {
    fractions: [{ numerator: 2, denominator: 3 }, { numerator: 3, denominator: 5 }],
    strategy: "common-denominator",
  },
  "shortest-strategy": {
    fractions: [{ numerator: 3, denominator: 4 }, { numerator: 5, denominator: 8 }],
    strategy: "common-denominator",
  },
  "denominator-trap": {
    fractions: [{ numerator: 1, denominator: 8 }, { numerator: 1, denominator: 6 }],
    strategy: "common-numerator",
  },
  "drone-race": {
    fractions: [
      { numerator: 1, denominator: 2 },
      { numerator: 4, denominator: 7 },
      { numerator: 5, denominator: 8 },
    ],
    strategy: "reference-half",
  },
};

const INDEPENDENT_CASES: Record<LessonDifficulty, readonly ComparisonCase[]> = {
  support: [
    {
      fractions: [
        { numerator: 1, denominator: 4 },
        { numerator: 1, denominator: 2 },
        { numerator: 3, denominator: 4 },
      ],
      strategy: "reference-half",
    },
    {
      fractions: [
        { numerator: 1, denominator: 3 },
        { numerator: 2, denominator: 3 },
        { numerator: 5, denominator: 6 },
      ],
      strategy: "common-denominator",
    },
  ],
  core: [
    {
      fractions: [
        { numerator: 2, denominator: 3 },
        { numerator: 3, denominator: 4 },
        { numerator: 5, denominator: 6 },
      ],
      strategy: "common-denominator",
    },
    {
      fractions: [
        { numerator: 3, denominator: 8 },
        { numerator: 3, denominator: 7 },
        { numerator: 3, denominator: 5 },
      ],
      strategy: "common-numerator",
    },
    {
      fractions: [
        { numerator: 5, denominator: 6 },
        { numerator: 7, denominator: 8 },
        { numerator: 9, denominator: 10 },
      ],
      strategy: "reference-one",
    },
  ],
  challenge: [
    {
      fractions: [
        { numerator: 5, denominator: 8 },
        { numerator: 7, denominator: 10 },
        { numerator: 11, denominator: 12 },
      ],
      strategy: "common-denominator",
    },
    {
      fractions: [
        { numerator: 5, denominator: 12 },
        { numerator: 7, denominator: 15 },
        { numerator: 9, denominator: 16 },
      ],
      strategy: "reference-half",
    },
  ],
};

function assertFraction(value: FractionValue): void {
  if (!Number.isSafeInteger(value.numerator) || !Number.isSafeInteger(value.denominator) || value.denominator <= 0) {
    throw new Error("Porównywany ułamek musi mieć całkowity licznik i dodatni mianownik.");
  }
}

function deterministicIndex(seed: number, salt: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed porównywania musi być bezpieczną liczbą całkowitą.");
  if (length <= 0) throw new Error("Generator porównywania wymaga niepustej puli.");
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) % length;
}

function promptFor(activity: FractionComparisonActivity): string {
  switch (activity) {
    case "same-denominator":
      return "Porównaj liczniki ułamków o jednakowych mianownikach i wstaw znak < albo >.";
    case "same-numerator":
      return "Porównaj mianowniki ułamków o jednakowych licznikach i wstaw znak < albo >.";
    case "cross-multiplication":
      return "Pomnóż liczby po skosie, porównaj iloczyny i wstaw znak < albo >.";
    case "common-measure":
      return "Sprowadź ułamki do wspólnego licznika lub mianownika, a następnie wybierz znak < albo >.";
    case "overlay-bars":
      return "Nałóż paski tej samej długości. Obrót lub zamiana kolejności pasków nie zmienia wartości ułamka.";
    case "common-axis":
      return "Ustaw dwa punkty na wspólnej osi, a potem wstaw między ułamki znak <, = albo >.";
    case "shortest-strategy":
      return "Wybierz najkrótszą strategię: wspólny mianownik, wspólny licznik, odniesienie do 1/2 albo do 1.";
    case "denominator-trap":
      return "Sprawdź na modelu kontrprzykład 1/8 i 1/6. Większy mianownik nie oznacza większego ułamka.";
    case "drone-race":
      return "Ustaw drony według przebytej części tej samej trasy — od najmniejszej do największej.";
    case "independent-comparison":
      return "Uporządkuj trzy ułamki, wybierz strategię bazową i krótko uzasadnij pierwszy rozstrzygający krok.";
  }
}

export function createPublicFractionComparisonTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionComparisonActivity;
}): FractionComparisonPublicTask {
  const comparisonCase = input.activity === "independent-comparison"
    ? INDEPENDENT_CASES[input.difficulty][deterministicIndex(
      input.seed,
      0x53404,
      INDEPENDENT_CASES[input.difficulty].length,
    )]!
    : FIXED_CASES[input.activity];

  comparisonCase.fractions.forEach(assertFraction);
  return {
    generatorId: FRACTION_COMPARISON_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    fractions: comparisonCase.fractions.map((value) => ({ ...value })),
    recommendedStrategy: comparisonCase.strategy,
    sameWholeRequired: true,
    skillIds: [
      "M5-3.4-compare-fractions",
      "M5-3.4-common-measure",
      "M5-3.4-reference-strategy",
      "M5-3.4-justify-order",
    ],
    invariants: [
      "same-whole-before-comparison",
      "positive-non-zero-denominator",
      "exact-integer-cross-products",
      "difference-method-not-required-in-base",
    ],
  };
}

export function compareFractions(left: FractionValue, right: FractionValue): -1 | 0 | 1 {
  assertFraction(left);
  assertFraction(right);
  const leftProduct = BigInt(left.numerator) * BigInt(right.denominator);
  const rightProduct = BigInt(right.numerator) * BigInt(left.denominator);
  return leftProduct < rightProduct ? -1 : leftProduct > rightProduct ? 1 : 0;
}

export function comparisonSign(left: FractionValue, right: FractionValue): FractionComparisonSign {
  const comparison = compareFractions(left, right);
  return comparison < 0 ? "<" : comparison > 0 ? ">" : "=";
}

export function sortFractionsAscending(values: readonly FractionValue[]): FractionValue[] {
  values.forEach(assertFraction);
  return values.map((value) => ({ ...value })).sort(compareFractions);
}

function leastCommonMultiple(left: number, right: number): number {
  return Math.abs(left * right) / greatestCommonDivisor(left, right);
}

export function commonDenominatorEvidence(left: FractionValue, right: FractionValue): {
  denominator: number;
  leftNumerator: number;
  rightNumerator: number;
} {
  assertFraction(left);
  assertFraction(right);
  const denominator = leastCommonMultiple(left.denominator, right.denominator);
  return {
    denominator,
    leftNumerator: left.numerator * (denominator / left.denominator),
    rightNumerator: right.numerator * (denominator / right.denominator),
  };
}

export function commonNumeratorEvidence(left: FractionValue, right: FractionValue): {
  numerator: number;
  leftDenominator: number;
  rightDenominator: number;
} {
  assertFraction(left);
  assertFraction(right);
  if (left.numerator <= 0 || right.numerator <= 0) {
    throw new Error("Strategia wspólnego licznika wymaga dodatnich liczników.");
  }
  const numerator = leastCommonMultiple(left.numerator, right.numerator);
  return {
    numerator,
    leftDenominator: left.denominator * (numerator / left.numerator),
    rightDenominator: right.denominator * (numerator / right.numerator),
  };
}

export function hasComparisonJustification(reason: string, strategy: FractionComparisonStrategy): boolean {
  const normalized = reason.trim().toLocaleLowerCase("pl-PL");
  if (normalized.length < 8) return false;
  switch (strategy) {
    case "common-denominator":
      return /mianown|wspóln/u.test(normalized);
    case "common-numerator":
      return /licznik|części/u.test(normalized);
    case "reference-half":
      return /1\s*\/\s*2|połow/u.test(normalized);
    case "reference-one":
      return /\b1\b|całoś|jednoś/u.test(normalized);
  }
}

export function evaluateComparisonAttempt(input: {
  left: FractionValue;
  right: FractionValue;
  sign: FractionComparisonSign | null;
  sameWhole: boolean;
  reason?: string;
  strategy?: FractionComparisonStrategy;
}): FractionComparisonDiagnosticCode | null {
  if (!input.sameWhole) return FRACTION_FEEDBACK_CODES.wholeMismatch;
  if (input.sign !== comparisonSign(input.left, input.right)) return FRACTION_COMPARISON_WRONG_SIGN_CODE;
  if (input.strategy && !hasComparisonJustification(input.reason ?? "", input.strategy)) {
    return FRACTION_COMPARISON_JUSTIFICATION_CODE;
  }
  return null;
}

export function evaluateFractionOrderAttempt(
  values: readonly FractionValue[],
  orderedIndexes: readonly number[],
): FractionComparisonDiagnosticCode | null {
  if (orderedIndexes.length !== values.length || new Set(orderedIndexes).size !== values.length) {
    return FRACTION_COMPARISON_ORDER_CODE;
  }
  if (orderedIndexes.some((index) => !Number.isSafeInteger(index) || index < 0 || index >= values.length)) {
    return FRACTION_COMPARISON_ORDER_CODE;
  }
  const ordered = orderedIndexes.map((index) => values[index]!);
  return ordered.every((value, index) => index === 0 || compareFractions(ordered[index - 1]!, value) <= 0)
    ? null
    : FRACTION_COMPARISON_ORDER_CODE;
}

const CUSTOM_COPY: Record<Exclude<FractionComparisonDiagnosticCode, FractionFeedbackCode>, DiagnosticFeedbackCopy> = {
  [FRACTION_COMPARISON_WRONG_SIGN_CODE]: {
    area: "Wartości zostały odczytane, ale znak porównania jest skierowany w złą stronę.",
    guidingQuestion: "Który ułamek leży bardziej na prawo na wspólnej osi?",
    visualHint: "Podświetl pierwszy rozstrzygający licznik albo mianownik i skieruj szerszą stronę znaku do większej wartości.",
    analogousExample: "3/8 < 5/8, bo przy wspólnym mianowniku jako pierwszy rozstrzyga licznik: 3 < 5.",
  },
  [FRACTION_COMPARISON_JUSTIFICATION_CODE]: {
    area: "Znak lub porządek jest poprawny, ale uzasadnienie nie pokazuje wybranej strategii.",
    guidingQuestion: "Który konkretny element rozstrzygnął porównanie w wybranej strategii?",
    visualHint: "Dopisz wspólny mianownik lub licznik albo wskaż położenie względem 1/2 lub 1.",
    analogousExample: "2/3 > 3/5, bo po sprowadzeniu do mianownika 15 porównujemy 10/15 i 9/15.",
  },
  [FRACTION_COMPARISON_ORDER_CODE]: {
    area: "Co najmniej jedna sąsiednia para jest ustawiona w złej kolejności.",
    guidingQuestion: "Która para po lewej i prawej stronie nie rośnie?",
    visualHint: "Sprawdzaj kolejno sąsiednie ułamki na jednej osi, zaczynając od pierwszej pary.",
    analogousExample: "1/2 < 4/7 < 5/8, więc każdy kolejny punkt leży bardziej na prawo.",
  },
  [FRACTION_COMPARISON_STRATEGY_CODE]: {
    area: "Wybrana strategia nie jest najkrótszą strategią dla tej pary.",
    guidingQuestion: "Czy ułamki mają już wspólny licznik, łatwy wspólny mianownik albo leżą po przeciwnych stronach 1/2 lub blisko 1?",
    visualHint: "Porównaj cztery karty i wybierz tę, która ujawnia pierwszy rozstrzygający element bez zbędnych kroków.",
    analogousExample: "Dla 1/8 i 1/6 wspólny licznik już jest widoczny, więc nie trzeba budować wspólnego mianownika.",
  },
};

function isCustomCode(
  code: FractionComparisonDiagnosticCode,
): code is Exclude<FractionComparisonDiagnosticCode, FractionFeedbackCode> {
  return code in CUSTOM_COPY;
}

export function createFractionComparisonDiagnosticResult(
  code: FractionComparisonDiagnosticCode,
  memberIds: string[] = ["comparison-left", "comparison-right"],
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (!isCustomCode(code)) {
    return createFractionDiagnosticResult(code, { maxScore: 2, memberIds });
  }
  const partial = code === FRACTION_COMPARISON_JUSTIFICATION_CODE;
  const symbol = code === FRACTION_COMPARISON_WRONG_SIGN_CODE
    ? "↔"
    : code === FRACTION_COMPARISON_ORDER_CODE
      ? "1·2·3"
      : "?";
  return {
    result: createLessonGradeResult({
      status: partial ? "partially-correct" : "incorrect",
      score: partial ? 1 : 0,
      maxScore: 2,
      errorCodes: [code],
      feedbackKey: `fraction.${code.toLowerCase()}`,
    }),
    copy: CUSTOM_COPY[code],
    highlights: [{
      id: `fraction-${code.toLowerCase()}`,
      kind: "pair",
      memberIds,
      label: CUSTOM_COPY[code].area,
      state: "attention",
      pattern: code === FRACTION_COMPARISON_WRONG_SIGN_CODE ? "double" : "dashed",
      symbol,
      accent: partial ? "cyan" : "amber",
    }],
  };
}

export const FRACTION_COMPARISON_FEEDBACK_KEYS: readonly FractionComparisonDiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.wholeMismatch,
  FRACTION_COMPARISON_WRONG_SIGN_CODE,
  FRACTION_COMPARISON_JUSTIFICATION_CODE,
  FRACTION_COMPARISON_ORDER_CODE,
  FRACTION_COMPARISON_STRATEGY_CODE,
];

const ACTIVITIES = new Set<FractionComparisonActivity>([
  "same-denominator",
  "same-numerator",
  "common-measure",
  "cross-multiplication",
  "overlay-bars",
  "common-axis",
  "shortest-strategy",
  "denominator-trap",
  "drone-race",
  "independent-comparison",
]);

export function isFractionComparisonActivity(value: string): value is FractionComparisonActivity {
  return ACTIVITIES.has(value as FractionComparisonActivity);
}

export function fractionComparisonActivityFromStageId(stageId: string): FractionComparisonActivity | null {
  if (stageId.includes("compare-same-denominator")) return "same-denominator";
  if (stageId.includes("compare-same-numerator")) return "same-numerator";
  if (stageId.includes("compare-common-measure")) return "common-measure";
  if (stageId.includes("compare-cross-multiplication")) return "cross-multiplication";
  if (stageId.includes("compare-overlay-bars")) return "overlay-bars";
  if (stageId.includes("compare-common-axis")) return "common-axis";
  if (stageId.includes("compare-shortest-strategy")) return "shortest-strategy";
  if (stageId.includes("compare-denominator-trap")) return "denominator-trap";
  if (stageId.includes("compare-drone-race")) return "drone-race";
  if (stageId.includes("compare-independent")) return "independent-comparison";
  return null;
}
