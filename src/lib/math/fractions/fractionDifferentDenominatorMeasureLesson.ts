import { createFractionDiagnosticResult } from "@/lib/math/fractions/fractionDiagnostics";
import {
  areEquivalentFractions,
  greatestCommonDivisor,
  normalizeFraction,
} from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { FractionFeedbackCode, FractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const FRACTION_DIFFERENT_DENOMINATOR_MEASURE_GENERATOR_ID =
  "fraction-different-denominator-measure-l1-v1" as const;

export const FRA_NO_COMMON_DENOMINATOR = "FRA_NO_COMMON_DENOMINATOR" as const;
export const FRA_ONE_FRACTION_EXTENDED = "FRA_ONE_FRACTION_EXTENDED" as const;
export const FRA_DIFFERENT_EXTENSION_FACTORS = "FRA_DIFFERENT_EXTENSION_FACTORS" as const;
export const FRA_DENOM_ADDED = "FRA_DENOM_ADDED" as const;

export type FractionDifferentDenominatorMeasureDiagnosticCode =
  | FractionFeedbackCode
  | typeof FRA_NO_COMMON_DENOMINATOR
  | typeof FRA_ONE_FRACTION_EXTENDED
  | typeof FRA_DIFFERENT_EXTENSION_FACTORS
  | typeof FRA_DENOM_ADDED;

export type FractionDifferentDenominatorMeasureActivity =
  | "different-denom-glasses-discover"
  | "different-denom-glasses-twelfths"
  | "different-denom-glasses-pour"
  | "different-denom-algorithm"
  | "different-denom-independent";

export type FractionDifferentDenominatorOperation = "+" | "−";

export interface FractionDifferentDenominatorMeasurePublicTask {
  generatorId: typeof FRACTION_DIFFERENT_DENOMINATOR_MEASURE_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionDifferentDenominatorMeasureActivity;
  prompt: string;
  left: FractionValue;
  right: FractionValue;
  operation: FractionDifferentDenominatorOperation;
  commonDenominatorOptions: number[];
  requireSimplifiedFinal: true;
  skillIds: readonly [
    "M5-3.6-common-measure",
    "M5-3.6-equivalent-extension",
    "M5-3.6-add-sub-diff-denom",
    "M5-3.6-sense-check",
  ];
  invariants: readonly [
    "proper-fractions-only",
    "different-positive-denominators",
    "common-measure-before-operation",
    "same-factor-within-each-fraction",
    "no-mixed-numbers-or-multistep-problems",
    "answer-spec-server-only",
  ];
}

export interface FractionDifferentDenominatorAttempt {
  commonDenominator: number | null;
  leftNumeratorMultiplier: number;
  leftDenominatorMultiplier: number;
  rightNumeratorMultiplier: number;
  rightDenominatorMultiplier: number;
  submitted: FractionValue;
}

interface DifferentDenominatorCase {
  left: FractionValue;
  right: FractionValue;
  operation: FractionDifferentDenominatorOperation;
  commonDenominatorOptions: readonly number[];
}

const GLASS_CASE: DifferentDenominatorCase = {
  left: { numerator: 1, denominator: 3 },
  right: { numerator: 1, denominator: 4 },
  operation: "+",
  commonDenominatorOptions: [7, 12, 24],
};

const INDEPENDENT_CASES: Record<LessonDifficulty, readonly DifferentDenominatorCase[]> = {
  support: [
    { left: { numerator: 1, denominator: 2 }, right: { numerator: 1, denominator: 3 }, operation: "+", commonDenominatorOptions: [5, 6, 12] },
    { left: { numerator: 1, denominator: 2 }, right: { numerator: 1, denominator: 7 }, operation: "+", commonDenominatorOptions: [7, 14, 21] },
  ],
  core: [
    { left: { numerator: 2, denominator: 3 }, right: { numerator: 1, denominator: 4 }, operation: "+", commonDenominatorOptions: [7, 12, 24] },
    { left: { numerator: 4, denominator: 9 }, right: { numerator: 1, denominator: 3 }, operation: "−", commonDenominatorOptions: [6, 9, 18] },
  ],
  challenge: [
    { left: { numerator: 5, denominator: 6 }, right: { numerator: 1, denominator: 4 }, operation: "−", commonDenominatorOptions: [10, 12, 24] },
    { left: { numerator: 3, denominator: 7 }, right: { numerator: 2, denominator: 9 }, operation: "+", commonDenominatorOptions: [16, 63, 126] },
  ],
};

function deterministicIndex(seed: number, salt: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed wspólnej miary musi być bezpieczną liczbą całkowitą.");
  if (length <= 0) throw new Error("Generator wspólnej miary wymaga niepustej puli zadań.");
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) % length;
}

function promptFor(activity: FractionDifferentDenominatorMeasureActivity): string {
  switch (activity) {
    case "different-denom-glasses-discover":
      return "Porównaj identyczne szklanki z 1/3 i 1/4 pojemności. Spróbuj nazwać obie porcje jedną wspólną miarą.";
    case "different-denom-glasses-twelfths":
      return "Zagęść podziałki do dwunastych. Obserwuj, że poziom wody nie zmienia się: 1/3 = 4/12 i 1/4 = 3/12.";
    case "different-denom-glasses-pour":
      return "Przelej obie porcje do identycznej szklanki wynikowej i odczytaj 7/12 pojemności.";
    case "different-denom-algorithm":
      return "Wykonaj osobno każdy wiersz: wybierz wspólny mianownik, rozszerz oba ułamki, połącz liczniki i sprawdź wynik.";
    case "different-denom-independent":
      return "Wybierz wspólny mianownik, rozszerz oba ułamki przez właściwe mnożniki i zapisz wynik w najprostszej postaci.";
  }
}

function assertProperDifferentDenominators(input: DifferentDenominatorCase): void {
  const values = [input.left, input.right];
  if (values.some((value) => !Number.isSafeInteger(value.numerator)
    || !Number.isSafeInteger(value.denominator)
    || value.denominator <= 0
    || value.numerator < 0
    || value.numerator >= value.denominator)) {
    throw new Error("L1 M5-3.6 obsługuje wyłącznie ułamki właściwe o dodatnich mianownikach.");
  }
  if (input.left.denominator === input.right.denominator) {
    throw new Error("L1 M5-3.6 wymaga dwóch różnych mianowników.");
  }
  const result = applyDifferentDenominatorOperation(input);
  if (result.numerator < 0 || result.numerator >= result.denominator) {
    throw new Error("Wynik L1 M5-3.6 musi pozostać ułamkiem właściwym bez liczb mieszanych.");
  }
}

export function leastCommonDenominator(leftDenominator: number, rightDenominator: number): number {
  if (!Number.isSafeInteger(leftDenominator) || !Number.isSafeInteger(rightDenominator)
    || leftDenominator <= 0 || rightDenominator <= 0) {
    throw new Error("Mianowniki wspólnej miary muszą być dodatnimi liczbami całkowitymi.");
  }
  return leftDenominator / greatestCommonDivisor(leftDenominator, rightDenominator) * rightDenominator;
}

export function applyDifferentDenominatorOperation(
  input: Pick<DifferentDenominatorCase, "left" | "right" | "operation">,
): FractionValue {
  const commonDenominator = leastCommonDenominator(input.left.denominator, input.right.denominator);
  const leftNumerator = input.left.numerator * (commonDenominator / input.left.denominator);
  const rightNumerator = input.right.numerator * (commonDenominator / input.right.denominator);
  return {
    numerator: input.operation === "+" ? leftNumerator + rightNumerator : leftNumerator - rightNumerator,
    denominator: commonDenominator,
  };
}

export function simplifiedDifferentDenominatorResult(
  input: Pick<DifferentDenominatorCase, "left" | "right" | "operation">,
): FractionValue {
  return normalizeFraction(applyDifferentDenominatorOperation(input));
}

export function createPublicFractionDifferentDenominatorMeasureTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionDifferentDenominatorMeasureActivity;
}): FractionDifferentDenominatorMeasurePublicTask {
  const selected = input.activity === "different-denom-independent"
    ? INDEPENDENT_CASES[input.difficulty][deterministicIndex(input.seed, 0x53601, INDEPENDENT_CASES[input.difficulty].length)]!
    : GLASS_CASE;
  assertProperDifferentDenominators(selected);
  return {
    generatorId: FRACTION_DIFFERENT_DENOMINATOR_MEASURE_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    left: { ...selected.left },
    right: { ...selected.right },
    operation: selected.operation,
    commonDenominatorOptions: [...selected.commonDenominatorOptions],
    requireSimplifiedFinal: true,
    skillIds: [
      "M5-3.6-common-measure",
      "M5-3.6-equivalent-extension",
      "M5-3.6-add-sub-diff-denom",
      "M5-3.6-sense-check",
    ],
    invariants: [
      "proper-fractions-only",
      "different-positive-denominators",
      "common-measure-before-operation",
      "same-factor-within-each-fraction",
      "no-mixed-numbers-or-multistep-problems",
      "answer-spec-server-only",
    ],
  };
}

function hasValidCommonDenominator(task: Pick<FractionDifferentDenominatorMeasurePublicTask, "left" | "right">, value: number | null): value is number {
  return value !== null
    && Number.isSafeInteger(value)
    && value > 0
    && value % task.left.denominator === 0
    && value % task.right.denominator === 0;
}

export function evaluateDifferentDenominatorMeasureAttempt(input: {
  task: Pick<FractionDifferentDenominatorMeasurePublicTask, "left" | "right" | "operation" | "requireSimplifiedFinal">;
  attempt: FractionDifferentDenominatorAttempt;
}): FractionDifferentDenominatorMeasureDiagnosticCode | null {
  const { task, attempt } = input;
  if (attempt.submitted.denominator === 0) return FRACTION_FEEDBACK_CODES.zeroDenominator;
  if (!hasValidCommonDenominator(task, attempt.commonDenominator)) return FRA_NO_COMMON_DENOMINATOR;

  if (attempt.leftNumeratorMultiplier !== attempt.leftDenominatorMultiplier
    || attempt.rightNumeratorMultiplier !== attempt.rightDenominatorMultiplier) {
    return FRA_DIFFERENT_EXTENSION_FACTORS;
  }

  const expectedLeftMultiplier = attempt.commonDenominator / task.left.denominator;
  const expectedRightMultiplier = attempt.commonDenominator / task.right.denominator;
  const leftCorrect = attempt.leftNumeratorMultiplier === expectedLeftMultiplier;
  const rightCorrect = attempt.rightNumeratorMultiplier === expectedRightMultiplier;
  const leftUntouched = attempt.leftNumeratorMultiplier === 1;
  const rightUntouched = attempt.rightNumeratorMultiplier === 1;
  if (leftCorrect && rightUntouched || rightCorrect && leftUntouched) return FRA_ONE_FRACTION_EXTENDED;
  if (!leftCorrect || !rightCorrect) return FRACTION_FEEDBACK_CODES.notEquivalent;

  if (attempt.submitted.denominator === task.left.denominator + task.right.denominator) return FRA_DENOM_ADDED;
  const expected = applyDifferentDenominatorOperation(task);
  if (!areEquivalentFractions(attempt.submitted, expected)) return FRACTION_FEEDBACK_CODES.wrongOperationPair;
  if (task.requireSimplifiedFinal
    && greatestCommonDivisor(attempt.submitted.numerator, attempt.submitted.denominator) > 1) {
    return FRACTION_FEEDBACK_CODES.notSimplified;
  }
  return null;
}

const CUSTOM_COPY: Record<
  typeof FRA_NO_COMMON_DENOMINATOR
  | typeof FRA_ONE_FRACTION_EXTENDED
  | typeof FRA_DIFFERENT_EXTENSION_FACTORS
  | typeof FRA_DENOM_ADDED,
  DiagnosticFeedbackCopy
> = {
  [FRA_NO_COMMON_DENOMINATOR]: {
    area: "Wybrana miara nie dzieli obu mianowników na całkowitą liczbę równych części.",
    guidingQuestion: "Która liczba jest wielokrotnością obu mianowników?",
    visualHint: "Dolne kratki obu ułamków mają jeszcze różne podziałki. Wspólna miara pojawi się dopiero wtedy, gdy obie zakończą się tym samym mianownikiem.",
    analogousExample: "Dla 1/2 i 1/3 wspólną miarą są szóste części, bo 6 dzieli się przez 2 i przez 3.",
  },
  [FRA_ONE_FRACTION_EXTENDED]: {
    area: "Do wspólnej miary rozszerzono tylko jeden z dwóch ułamków.",
    guidingQuestion: "Który drugi ułamek nadal ma dawny mianownik?",
    visualHint: "Podświetl obie pionowe pary. Każdy ułamek musi osobno dojść do wybranego wspólnego mianownika.",
    analogousExample: "Dla 1/3 + 1/4 zapis 4/12 + 1/4 nie jest jeszcze gotowy; także 1/4 trzeba zamienić na 3/12.",
  },
  [FRA_DIFFERENT_EXTENSION_FACTORS]: {
    area: "W jednym ułamku licznik i mianownik pomnożono przez różne liczby.",
    guidingQuestion: "Czy mnożnik nad kreską i pod kreską tego samego ułamka jest identyczny?",
    visualHint: "Połącz licznik i mianownik pionową parą z tym samym symbolem mnożenia. Różne symbole oznaczają zmianę wartości ułamka.",
    analogousExample: "Rozszerzając 1/3 do dwunastych, mnożymy 1 × 4 i 3 × 4, więc otrzymujemy 4/12.",
  },
  [FRA_DENOM_ADDED]: {
    area: "Mianowniki zostały dodane, choć po rozszerzeniu obie porcje są już mierzone takimi samymi częściami.",
    guidingQuestion: "Czy po połączeniu czterech dwunastych i trzech dwunastych zmienia się wielkość jednej części?",
    visualHint: "W wierszu działania połączone są liczniki. Wspólny mianownik pozostaje pod jednym obrysem i nie bierze udziału w dodawaniu ani odejmowaniu.",
    analogousExample: "2/6 + 1/6 = 3/6, bo liczymy trzy szóste części, a nie części o mianowniku 12.",
  },
};

function isCustomCode(code: FractionDifferentDenominatorMeasureDiagnosticCode): code is keyof typeof CUSTOM_COPY {
  return code in CUSTOM_COPY;
}

export function createFractionDifferentDenominatorMeasureDiagnosticResult(
  code: FractionDifferentDenominatorMeasureDiagnosticCode,
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (!isCustomCode(code)) {
    return createFractionDiagnosticResult(code, {
      maxScore: 3,
      memberIds: code === FRACTION_FEEDBACK_CODES.notSimplified
        ? ["result-numerator", "result-denominator"]
        : ["different-denom-operation"],
    });
  }
  const memberIds = code === FRA_NO_COMMON_DENOMINATOR
    ? ["common-denominator-left", "common-denominator-right"]
    : code === FRA_ONE_FRACTION_EXTENDED
      ? ["left-extension", "right-extension"]
      : code === FRA_DIFFERENT_EXTENSION_FACTORS
        ? ["numerator-multiplier", "denominator-multiplier"]
        : ["result-denominator", "common-denominator"];
  return {
    result: createLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: 3,
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
      pattern: code === FRA_DIFFERENT_EXTENSION_FACTORS || code === FRA_DENOM_ADDED ? "double" : "dashed",
      symbol: code === FRA_NO_COMMON_DENOMINATOR ? "≠" : code === FRA_ONE_FRACTION_EXTENDED ? "↕" : code === FRA_DIFFERENT_EXTENSION_FACTORS ? "×≠" : "≠ +",
      accent: code === FRA_DIFFERENT_EXTENSION_FACTORS ? "violet" : "amber",
    }],
  };
}

export const FRACTION_DIFFERENT_DENOMINATOR_MEASURE_FEEDBACK_KEYS:
readonly FractionDifferentDenominatorMeasureDiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.emptyPart,
  FRACTION_FEEDBACK_CODES.zeroDenominator,
  FRACTION_FEEDBACK_CODES.notEquivalent,
  FRACTION_FEEDBACK_CODES.notSimplified,
  FRACTION_FEEDBACK_CODES.wrongOperationPair,
  FRA_NO_COMMON_DENOMINATOR,
  FRA_ONE_FRACTION_EXTENDED,
  FRA_DIFFERENT_EXTENSION_FACTORS,
  FRA_DENOM_ADDED,
];

const ACTIVITIES = new Set<FractionDifferentDenominatorMeasureActivity>([
  "different-denom-glasses-discover",
  "different-denom-glasses-twelfths",
  "different-denom-glasses-pour",
  "different-denom-algorithm",
  "different-denom-independent",
]);

export function isFractionDifferentDenominatorMeasureActivity(
  value: string,
): value is FractionDifferentDenominatorMeasureActivity {
  return ACTIVITIES.has(value as FractionDifferentDenominatorMeasureActivity);
}

export function fractionDifferentDenominatorMeasureActivityFromStageId(
  stageId: string,
): FractionDifferentDenominatorMeasureActivity | null {
  if (stageId.includes("different-denom-glasses-discover")) return "different-denom-glasses-discover";
  if (stageId.includes("different-denom-glasses-twelfths")) return "different-denom-glasses-twelfths";
  if (stageId.includes("different-denom-glasses-pour")) return "different-denom-glasses-pour";
  if (stageId.includes("different-denom-algorithm")) return "different-denom-algorithm";
  if (stageId.includes("different-denom-independent")) return "different-denom-independent";
  return null;
}
