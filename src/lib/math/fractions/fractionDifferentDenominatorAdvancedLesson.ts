import { createFractionDiagnosticResult } from "@/lib/math/fractions/fractionDiagnostics";
import {
  FRA_DENOM_ADDED,
  FRA_DIFFERENT_EXTENSION_FACTORS,
  FRA_NO_COMMON_DENOMINATOR,
  FRA_ONE_FRACTION_EXTENDED,
  createFractionDifferentDenominatorMeasureDiagnosticResult,
  type FractionDifferentDenominatorMeasureDiagnosticCode,
} from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import {
  areEquivalentFractions,
  greatestCommonDivisor,
  mixedToImproper,
  normalizeFraction,
  toMixedFraction,
} from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { DiagnosticFeedbackCopy, DiagnosticHighlightTarget, LessonGradeResult } from "@/types/diagnosticFeedback";
import type { FractionValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_GENERATOR_ID = "fraction-different-denominator-l2-v1" as const;
export const FRA_MIXED_NUMBER_ERROR = "FRA_MIXED_NUMBER_ERROR" as const;
export const FRA_WHOLE_ASSESSMENT = "FRA_WHOLE_ASSESSMENT" as const;
export const FRA_REPAIR_STEP = "FRA_REPAIR_STEP" as const;

export type FractionDifferentDenominatorAdvancedDiagnosticCode =
  | FractionDifferentDenominatorMeasureDiagnosticCode
  | typeof FRA_MIXED_NUMBER_ERROR
  | typeof FRA_WHOLE_ASSESSMENT
  | typeof FRA_REPAIR_STEP;

export type FractionDifferentDenominatorAdvancedActivity =
  | "different-denom-l2-subtraction-bars"
  | "different-denom-l2-mixed-number"
  | "different-denom-l2-greenhouse"
  | "different-denom-l2-repair"
  | "different-denom-l2-independent";

export type FractionRepairStep = "common-denominator" | "extension" | "numerator-operation" | "denominator-operation";
export type WholeAssessment = "below-one" | "equal-one" | "above-one";

export interface FractionDifferentDenominatorAdvancedPublicTask {
  generatorId: typeof FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionDifferentDenominatorAdvancedActivity;
  prompt: string;
  left: MixedFractionValue;
  right: MixedFractionValue;
  operation: "+" | "−";
  commonDenominatorOptions: number[];
  requiresMixedResult: boolean;
  requiresWholeAssessment: boolean;
  requiresRepairStep: boolean;
  skillIds: readonly [
    "M5-3.6-l2-common-measure",
    "M5-3.6-l2-mixed-add-sub",
    "M5-3.6-l2-sense-check",
    "M5-3.6-l2-repair",
  ];
  invariants: readonly [
    "different-positive-denominators",
    "least-common-denominator-is-an-option",
    "mixed-result-required-when-value-exceeds-one",
    "final-fractional-part-is-simplified",
    "answer-spec-server-only",
  ];
}

export interface FractionDifferentDenominatorAdvancedAttempt {
  commonDenominator: number | null;
  leftMultiplier: number;
  rightMultiplier: number;
  submitted: FractionValue;
  usedMixedFormat: boolean;
  submittedFractionalNumerator: number;
  submittedFractionalDenominator: number;
  wholeAssessment?: WholeAssessment | null;
  repairStep?: FractionRepairStep | null;
}

interface AdvancedCase {
  left: MixedFractionValue;
  right: MixedFractionValue;
  operation: "+" | "−";
  options: readonly number[];
}

const FIXED_CASES: Record<Exclude<FractionDifferentDenominatorAdvancedActivity, "different-denom-l2-independent">, AdvancedCase> = {
  "different-denom-l2-subtraction-bars": {
    left: { wholePart: 0, numerator: 5, denominator: 6 },
    right: { wholePart: 0, numerator: 1, denominator: 4 },
    operation: "−",
    options: [10, 12, 24],
  },
  "different-denom-l2-mixed-number": {
    left: { wholePart: 2, numerator: 1, denominator: 3 },
    right: { wholePart: 1, numerator: 1, denominator: 4 },
    operation: "+",
    options: [7, 12, 24],
  },
  "different-denom-l2-greenhouse": {
    left: { wholePart: 0, numerator: 2, denominator: 3 },
    right: { wholePart: 0, numerator: 3, denominator: 4 },
    operation: "+",
    options: [7, 12, 24],
  },
  "different-denom-l2-repair": {
    left: { wholePart: 0, numerator: 2, denominator: 3 },
    right: { wholePart: 0, numerator: 1, denominator: 4 },
    operation: "+",
    options: [7, 12, 24],
  },
};

const INDEPENDENT_CASES: Record<LessonDifficulty, AdvancedCase> = {
  support: {
    left: { wholePart: 0, numerator: 1, denominator: 2 },
    right: { wholePart: 0, numerator: 1, denominator: 3 },
    operation: "+",
    options: [5, 6, 12],
  },
  core: {
    left: { wholePart: 1, numerator: 1, denominator: 2 },
    right: { wholePart: 0, numerator: 2, denominator: 3 },
    operation: "+",
    options: [5, 6, 12],
  },
  challenge: {
    left: { wholePart: 3, numerator: 1, denominator: 4 },
    right: { wholePart: 1, numerator: 5, denominator: 6 },
    operation: "−",
    options: [10, 12, 24],
  },
};

function promptFor(activity: FractionDifferentDenominatorAdvancedActivity): string {
  switch (activity) {
    case "different-denom-l2-subtraction-bars":
      return "Sprowadź 5/6 i 1/4 do wspólnej miary. Wybierz najmniejszy wygodny mianownik, a potem odłóż odejmowaną część na pasku.";
    case "different-denom-l2-mixed-number":
      return "Dodaj osobno całości, zbuduj wspólną miarę części ułamkowych i zapisz wynik jako liczbę mieszaną.";
    case "different-denom-l2-greenhouse":
      return "Do zbiornika wlano 2/3 l pożywki i 3/4 l wody. Oblicz objętość oraz oceń przed liczeniem, czy przekroczy 1 litr.";
    case "different-denom-l2-repair":
      return "W rozwiązaniu 2/3 + 1/4 = 3/7 wskaż dokładny pierwszy błędny krok, a potem napraw wynik.";
    case "different-denom-l2-independent":
      return "Wykonaj działanie z różnymi mianownikami. Użyj liczby mieszanej, gdy wynik przekracza całość, i sprawdź jego sens.";
  }
}

export function leastCommonDenominatorAdvanced(left: number, right: number): number {
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || left <= 0 || right <= 0) {
    throw new Error("Mianowniki L2 muszą być dodatnimi liczbami całkowitymi.");
  }
  return left / greatestCommonDivisor(left, right) * right;
}

export function applyDifferentDenominatorAdvancedOperation(
  task: Pick<FractionDifferentDenominatorAdvancedPublicTask, "left" | "right" | "operation">,
): FractionValue {
  const left = mixedToImproper(task.left);
  const right = mixedToImproper(task.right);
  const common = leastCommonDenominatorAdvanced(left.denominator, right.denominator);
  return {
    numerator: task.operation === "+"
      ? left.numerator * (common / left.denominator) + right.numerator * (common / right.denominator)
      : left.numerator * (common / left.denominator) - right.numerator * (common / right.denominator),
    denominator: common,
  };
}

export function simplifiedDifferentDenominatorAdvancedResult(
  task: Pick<FractionDifferentDenominatorAdvancedPublicTask, "left" | "right" | "operation">,
): MixedFractionValue {
  return toMixedFraction(normalizeFraction(applyDifferentDenominatorAdvancedOperation(task)));
}

export function createPublicFractionDifferentDenominatorAdvancedTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionDifferentDenominatorAdvancedActivity;
}): FractionDifferentDenominatorAdvancedPublicTask {
  if (!Number.isSafeInteger(input.seed)) throw new Error("Seed M5-3.6 L2 musi być bezpieczną liczbą całkowitą.");
  const selected = input.activity === "different-denom-l2-independent"
    ? INDEPENDENT_CASES[input.difficulty]
    : FIXED_CASES[input.activity];
  const result = applyDifferentDenominatorAdvancedOperation(selected);
  if (selected.left.denominator === selected.right.denominator || result.numerator < 0) {
    throw new Error("Zadanie M5-3.6 L2 wymaga różnych mianowników i nieujemnego wyniku.");
  }
  return {
    generatorId: FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    left: { ...selected.left },
    right: { ...selected.right },
    operation: selected.operation,
    commonDenominatorOptions: [...selected.options],
    requiresMixedResult: result.numerator >= result.denominator,
    requiresWholeAssessment: input.activity === "different-denom-l2-greenhouse",
    requiresRepairStep: input.activity === "different-denom-l2-repair",
    skillIds: ["M5-3.6-l2-common-measure", "M5-3.6-l2-mixed-add-sub", "M5-3.6-l2-sense-check", "M5-3.6-l2-repair"],
    invariants: ["different-positive-denominators", "least-common-denominator-is-an-option", "mixed-result-required-when-value-exceeds-one", "final-fractional-part-is-simplified", "answer-spec-server-only"],
  };
}

export function evaluateDifferentDenominatorAdvancedAttempt(input: {
  task: FractionDifferentDenominatorAdvancedPublicTask;
  attempt: FractionDifferentDenominatorAdvancedAttempt;
}): FractionDifferentDenominatorAdvancedDiagnosticCode | null {
  const { task, attempt } = input;
  if (attempt.submitted.denominator === 0) return FRACTION_FEEDBACK_CODES.zeroDenominator;
  if (task.requiresRepairStep && attempt.repairStep !== "denominator-operation") return FRA_REPAIR_STEP;
  const common = attempt.commonDenominator;
  if (common === null || common % task.left.denominator !== 0 || common % task.right.denominator !== 0) return FRA_NO_COMMON_DENOMINATOR;
  const expectedLeft = common / task.left.denominator;
  const expectedRight = common / task.right.denominator;
  if (attempt.leftMultiplier === expectedLeft && attempt.rightMultiplier === 1
    || attempt.rightMultiplier === expectedRight && attempt.leftMultiplier === 1) return FRA_ONE_FRACTION_EXTENDED;
  if (attempt.leftMultiplier !== expectedLeft || attempt.rightMultiplier !== expectedRight) return FRA_DIFFERENT_EXTENSION_FACTORS;
  if (attempt.submitted.denominator === task.left.denominator + task.right.denominator) return FRA_DENOM_ADDED;
  const expected = applyDifferentDenominatorAdvancedOperation(task);
  if (!areEquivalentFractions(attempt.submitted, expected)) return FRACTION_FEEDBACK_CODES.wrongOperationPair;
  if (task.requiresMixedResult && (!attempt.usedMixedFormat
    || attempt.submittedFractionalNumerator >= attempt.submittedFractionalDenominator)) return FRA_MIXED_NUMBER_ERROR;
  if (greatestCommonDivisor(attempt.submittedFractionalNumerator, attempt.submittedFractionalDenominator) > 1) return FRACTION_FEEDBACK_CODES.notSimplified;
  if (task.requiresWholeAssessment && attempt.wholeAssessment !== "above-one") return FRA_WHOLE_ASSESSMENT;
  return null;
}

const CUSTOM_COPY: Record<typeof FRA_MIXED_NUMBER_ERROR | typeof FRA_WHOLE_ASSESSMENT | typeof FRA_REPAIR_STEP, DiagnosticFeedbackCopy> = {
  [FRA_MIXED_NUMBER_ERROR]: {
    area: "Wartość przekracza jedną całość, ale zapis nie rozdziela pełnych całości od właściwej części ułamkowej.",
    guidingQuestion: "Ile pełnych mianowników mieści się w liczniku wyniku?",
    visualHint: "Przenieś każdą pełną grupę mianownik/mianownik do osobnej kratki części całkowitej.",
    analogousExample: "13/6 to dwie pełne szóstki i 1/6, czyli 2 1/6.",
  },
  [FRA_WHOLE_ASSESSMENT]: {
    area: "Obliczenie może być poprawne, ale ocena względem jednego litra nie zgadza się z modelem zbiornika.",
    guidingQuestion: "Czy 2/3 jest większe od 1/2 i czy 3/4 jest większe od 1/2?",
    visualHint: "Dwie porcje większe od połowy razem przekroczą poziom jednej pełnej jednostki.",
    analogousExample: "3/5 + 2/3 > 1, bo obie porcje są większe od 1/2.",
  },
  [FRA_REPAIR_STEP]: {
    area: "Nie wskazano pierwszego kroku, w którym zmieniono wielkość części przez dodanie mianowników.",
    guidingQuestion: "W którym wierszu pojawia się niepoprawny mianownik 3 + 4 = 7?",
    visualHint: "Przekreśl mianownik 7. Najpierw zbuduj wspólną miarę 12, a dopiero potem dodaj liczniki.",
    analogousExample: "1/2 + 1/3 nie daje 2/5; po rozszerzeniu otrzymujemy 3/6 + 2/6.",
  },
};

export function createFractionDifferentDenominatorAdvancedDiagnosticResult(
  code: FractionDifferentDenominatorAdvancedDiagnosticCode,
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (code === FRA_NO_COMMON_DENOMINATOR || code === FRA_ONE_FRACTION_EXTENDED
    || code === FRA_DIFFERENT_EXTENSION_FACTORS || code === FRA_DENOM_ADDED) {
    return createFractionDifferentDenominatorMeasureDiagnosticResult(code);
  }
  if (code !== FRA_MIXED_NUMBER_ERROR && code !== FRA_WHOLE_ASSESSMENT && code !== FRA_REPAIR_STEP) {
    return createFractionDiagnosticResult(code, { maxScore: 4, memberIds: ["different-denom-l2-operation"] });
  }
  const memberIds = code === FRA_MIXED_NUMBER_ERROR
    ? ["mixed-whole", "mixed-fraction"]
    : code === FRA_WHOLE_ASSESSMENT
      ? ["greenhouse-one-liter", "greenhouse-level"]
      : ["repair-wrong-denominator", "repair-common-denominator"];
  return {
    result: createLessonGradeResult({ status: "incorrect", score: 0, maxScore: 4, errorCodes: [code], feedbackKey: `fraction.${code.toLowerCase()}` }),
    copy: CUSTOM_COPY[code],
    highlights: [{ id: `fraction-${code.toLowerCase()}`, kind: "pair", memberIds, label: CUSTOM_COPY[code].area, state: "attention", pattern: code === FRA_REPAIR_STEP ? "double" : "dashed", symbol: code === FRA_MIXED_NUMBER_ERROR ? "1 ↔ n/n" : code === FRA_WHOLE_ASSESSMENT ? "> 1" : "≠ +", accent: code === FRA_REPAIR_STEP ? "violet" : "amber" }],
  };
}

export const FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS: readonly FractionDifferentDenominatorAdvancedDiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.emptyPart,
  FRACTION_FEEDBACK_CODES.zeroDenominator,
  FRACTION_FEEDBACK_CODES.notEquivalent,
  FRACTION_FEEDBACK_CODES.notSimplified,
  FRACTION_FEEDBACK_CODES.wrongOperationPair,
  FRA_NO_COMMON_DENOMINATOR,
  FRA_ONE_FRACTION_EXTENDED,
  FRA_DIFFERENT_EXTENSION_FACTORS,
  FRA_DENOM_ADDED,
  FRA_MIXED_NUMBER_ERROR,
  FRA_WHOLE_ASSESSMENT,
  FRA_REPAIR_STEP,
];

const ACTIVITIES = new Set<FractionDifferentDenominatorAdvancedActivity>([
  "different-denom-l2-subtraction-bars",
  "different-denom-l2-mixed-number",
  "different-denom-l2-greenhouse",
  "different-denom-l2-repair",
  "different-denom-l2-independent",
]);

export function isFractionDifferentDenominatorAdvancedActivity(value: string): value is FractionDifferentDenominatorAdvancedActivity {
  return ACTIVITIES.has(value as FractionDifferentDenominatorAdvancedActivity);
}

export function fractionDifferentDenominatorAdvancedActivityFromStageId(stageId: string): FractionDifferentDenominatorAdvancedActivity | null {
  for (const activity of ACTIVITIES) if (stageId.includes(activity)) return activity;
  return null;
}
