import { createFractionDiagnosticResult } from "@/lib/math/fractions/fractionDiagnostics";
import {
  areEquivalentFractions,
  greatestCommonDivisor,
  mixedToImproper,
  normalizeFraction,
  toMixedFraction,
} from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { FractionFeedbackCode, FractionValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const FRACTION_SAME_DENOMINATOR_MIXED_GENERATOR_ID = "fraction-same-denominator-mixed-l2-v1" as const;
export const FRA_BORROW_WHOLE = "FRA_BORROW_WHOLE" as const;
export const FRA_UNSIMPLIFIED_RESULT = "FRA_UNSIMPLIFIED_RESULT" as const;
export const FRA_MIXED_JUSTIFICATION = "FRA_MIXED_JUSTIFICATION" as const;

export type FractionSameDenominatorMixedDiagnosticCode =
  | FractionFeedbackCode
  | typeof FRA_BORROW_WHOLE
  | typeof FRA_UNSIMPLIFIED_RESULT
  | typeof FRA_MIXED_JUSTIFICATION;

export type FractionSameDenominatorMixedActivity =
  | "mixed-same-denom-add"
  | "mixed-same-denom-borrow-pizza"
  | "mixed-same-denom-borrow-notation"
  | "mixed-same-denom-bakery"
  | "mixed-same-denom-independent";

export type FractionSameDenominatorMixedOperation = "+" | "−";

export interface MixedSameDenominatorProblem {
  id: string;
  left: MixedFractionValue;
  right: MixedFractionValue;
  operation: FractionSameDenominatorMixedOperation;
  requireSimplifiedFinal: boolean;
  storyLabel?: string;
}

export interface FractionSameDenominatorMixedPublicTask {
  generatorId: typeof FRACTION_SAME_DENOMINATOR_MIXED_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionSameDenominatorMixedActivity;
  prompt: string;
  problems: readonly MixedSameDenominatorProblem[];
  requireJustification: boolean;
  skillIds: readonly [
    "M5-3.5-mixed-add-sub",
    "M5-3.5-borrow-whole",
    "M5-3.5-mixed-simplify",
    "M5-3.5-mixed-context",
  ];
  invariants: readonly [
    "mixed-numbers-with-same-positive-denominator",
    "exchange-one-whole-before-subtracting-fractional-parts",
    "denominator-stays-unchanged-before-simplifying",
    "result-is-non-negative",
    "answer-spec-server-only",
  ];
}

const BORROW_PROBLEM: MixedSameDenominatorProblem = {
  id: "borrow-4-3-8-minus-1-5-8",
  left: { wholePart: 4, numerator: 3, denominator: 8 },
  right: { wholePart: 1, numerator: 5, denominator: 8 },
  operation: "−",
  requireSimplifiedFinal: true,
};

const FIXED_PROBLEMS: Record<Exclude<FractionSameDenominatorMixedActivity, "mixed-same-denom-independent">, readonly MixedSameDenominatorProblem[]> = {
  "mixed-same-denom-add": [{
    id: "add-2-7-10-plus-1-9-10",
    left: { wholePart: 2, numerator: 7, denominator: 10 },
    right: { wholePart: 1, numerator: 9, denominator: 10 },
    operation: "+",
    requireSimplifiedFinal: true,
  }, {
    id: "add-3-4-9-plus-2-2-9",
    left: { wholePart: 3, numerator: 4, denominator: 9 },
    right: { wholePart: 2, numerator: 2, denominator: 9 },
    operation: "+",
    requireSimplifiedFinal: true,
  }, {
    id: "add-1-3-6-plus-2-1-6",
    left: { wholePart: 1, numerator: 3, denominator: 6 },
    right: { wholePart: 2, numerator: 1, denominator: 6 },
    operation: "+",
    requireSimplifiedFinal: true,
  }],
  "mixed-same-denom-borrow-pizza": [BORROW_PROBLEM, {
    id: "borrow-5-2-6-minus-2-5-6",
    left: { wholePart: 5, numerator: 2, denominator: 6 },
    right: { wholePart: 2, numerator: 5, denominator: 6 },
    operation: "−",
    requireSimplifiedFinal: true,
  }],
  "mixed-same-denom-borrow-notation": [BORROW_PROBLEM],
  "mixed-same-denom-bakery": [
    {
      id: "bakery-prepared",
      left: { wholePart: 2, numerator: 3, denominator: 10 },
      right: { wholePart: 1, numerator: 5, denominator: 10 },
      operation: "+",
      requireSimplifiedFinal: false,
      storyLabel: "przygotowano razem",
    },
    {
      id: "bakery-after-delivery",
      left: { wholePart: 3, numerator: 8, denominator: 10 },
      right: { wholePart: 1, numerator: 9, denominator: 10 },
      operation: "−",
      requireSimplifiedFinal: true,
      storyLabel: "zostało po wydaniu zamówienia",
    },
  ],
};

const INDEPENDENT_PROBLEMS: Record<LessonDifficulty, readonly MixedSameDenominatorProblem[]> = {
  support: [
    {
      id: "support-add-sixths",
      left: { wholePart: 2, numerator: 1, denominator: 6 },
      right: { wholePart: 1, numerator: 3, denominator: 6 },
      operation: "+",
      requireSimplifiedFinal: true,
    },
    {
      id: "support-subtract-sevenths",
      left: { wholePart: 4, numerator: 5, denominator: 7 },
      right: { wholePart: 2, numerator: 2, denominator: 7 },
      operation: "−",
      requireSimplifiedFinal: true,
    },
  ],
  core: [
    {
      id: "core-borrow-eighths",
      left: { wholePart: 5, numerator: 1, denominator: 8 },
      right: { wholePart: 2, numerator: 5, denominator: 8 },
      operation: "−",
      requireSimplifiedFinal: true,
    },
    {
      id: "core-add-tenths",
      left: { wholePart: 1, numerator: 7, denominator: 10 },
      right: { wholePart: 2, numerator: 9, denominator: 10 },
      operation: "+",
      requireSimplifiedFinal: true,
    },
    {
      id: "core-subtract-sevenths",
      left: { wholePart: 6, numerator: 6, denominator: 7 },
      right: { wholePart: 3, numerator: 2, denominator: 7 },
      operation: "−",
      requireSimplifiedFinal: true,
    },
  ],
  challenge: [
    {
      id: "challenge-borrow-twelfths",
      left: { wholePart: 6, numerator: 1, denominator: 12 },
      right: { wholePart: 2, numerator: 9, denominator: 12 },
      operation: "−",
      requireSimplifiedFinal: true,
    },
    {
      id: "challenge-add-fourteenths",
      left: { wholePart: 3, numerator: 11, denominator: 14 },
      right: { wholePart: 2, numerator: 9, denominator: 14 },
      operation: "+",
      requireSimplifiedFinal: true,
    },
    {
      id: "challenge-borrow-fifteenths",
      left: { wholePart: 8, numerator: 2, denominator: 15 },
      right: { wholePart: 3, numerator: 11, denominator: 15 },
      operation: "−",
      requireSimplifiedFinal: true,
    },
  ],
};

function consecutiveProblemIndex(seed: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed działania na liczbach mieszanych musi być bezpieczną liczbą całkowitą.");
  if (length <= 0) throw new Error("Generator wymaga niepustej puli zadań.");
  return Math.abs(seed) % length;
}

function assertMixedProblem(problem: MixedSameDenominatorProblem): void {
  const values = [problem.left, problem.right];
  if (values.some((value) => !Number.isSafeInteger(value.wholePart)
    || !Number.isSafeInteger(value.numerator)
    || !Number.isSafeInteger(value.denominator)
    || value.wholePart < 0
    || value.denominator <= 0
    || value.denominator > 99
    || value.numerator < 0
    || value.numerator >= value.denominator)) {
    throw new Error("L2 M5-3.5 wymaga poprawnych liczb mieszanych z jedno- lub dwucyfrowym dodatnim mianownikiem.");
  }
  if (problem.left.denominator !== problem.right.denominator) {
    throw new Error("Działanie L2 M5-3.5 wymaga jednakowych mianowników.");
  }
  if (applyMixedSameDenominatorOperationUnchecked(problem).numerator < 0) {
    throw new Error("Wynik działania L2 M5-3.5 nie może być ujemny.");
  }
}

function applyMixedSameDenominatorOperationUnchecked(problem: MixedSameDenominatorProblem): FractionValue {
  const left = mixedToImproper(problem.left);
  const right = mixedToImproper(problem.right);
  return {
    numerator: problem.operation === "+" ? left.numerator + right.numerator : left.numerator - right.numerator,
    denominator: problem.left.denominator,
  };
}

export function applyMixedSameDenominatorOperation(problem: MixedSameDenominatorProblem): FractionValue {
  assertMixedProblem(problem);
  return applyMixedSameDenominatorOperationUnchecked(problem);
}

export function mixedResultWithSameDenominator(problem: MixedSameDenominatorProblem): MixedFractionValue {
  const result = applyMixedSameDenominatorOperation(problem);
  return {
    wholePart: Math.floor(result.numerator / result.denominator),
    numerator: result.numerator % result.denominator,
    denominator: result.denominator,
  };
}

export function simplifiedMixedResult(problem: MixedSameDenominatorProblem): MixedFractionValue {
  return toMixedFraction(normalizeFraction(applyMixedSameDenominatorOperation(problem)));
}

export function requiresWholeExchange(problem: MixedSameDenominatorProblem): boolean {
  assertMixedProblem(problem);
  return problem.operation === "−" && problem.left.numerator < problem.right.numerator;
}

export function exchangeOneWhole(value: MixedFractionValue): MixedFractionValue {
  if (value.wholePart <= 0) throw new Error("Nie można zamienić całości, gdy część całkowita nie jest dodatnia.");
  return {
    wholePart: value.wholePart - 1,
    numerator: value.numerator + value.denominator,
    denominator: value.denominator,
  };
}

function promptFor(activity: FractionSameDenominatorMixedActivity): string {
  switch (activity) {
    case "mixed-same-denom-add":
      return "Dodaj osobno całości i części ułamkowe. Zachowaj wspólny mianownik, a na końcu sprawdź skracanie.";
    case "mixed-same-denom-borrow-pizza":
      return "Najpierw potnij jedną pełną pizzę na osiem równych części, zamień całość i dopiero potem odejmuj.";
    case "mixed-same-denom-borrow-notation":
      return "Zapisz zamianę jednej całości: przekreśl starą część całkowitą i wpisz nową wartość obok.";
    case "mixed-same-denom-bakery":
      return "Najpierw oblicz liczbę przygotowanych tac w dziesiątych, potem odejmij wydane zamówienie.";
    case "mixed-same-denom-independent":
      return "Wykonaj jedno działanie na liczbach mieszanych, pokaż zamianę całości, jeśli jest potrzebna, skróć wynik i uzasadnij swój krok.";
  }
}

export function createPublicFractionSameDenominatorMixedTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionSameDenominatorMixedActivity;
}): FractionSameDenominatorMixedPublicTask {
  const problems = input.activity === "mixed-same-denom-independent"
    ? [INDEPENDENT_PROBLEMS[input.difficulty][consecutiveProblemIndex(input.seed, INDEPENDENT_PROBLEMS[input.difficulty].length)]!]
    : FIXED_PROBLEMS[input.activity];
  problems.forEach(assertMixedProblem);
  return {
    generatorId: FRACTION_SAME_DENOMINATOR_MIXED_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    problems: problems.map((problem) => ({
      ...problem,
      left: { ...problem.left },
      right: { ...problem.right },
    })),
    requireJustification: input.activity === "mixed-same-denom-independent",
    skillIds: [
      "M5-3.5-mixed-add-sub",
      "M5-3.5-borrow-whole",
      "M5-3.5-mixed-simplify",
      "M5-3.5-mixed-context",
    ],
    invariants: [
      "mixed-numbers-with-same-positive-denominator",
      "exchange-one-whole-before-subtracting-fractional-parts",
      "denominator-stays-unchanged-before-simplifying",
      "result-is-non-negative",
      "answer-spec-server-only",
    ],
  };
}

export function hasMixedOperationJustification(reason: string, exchangeRequired: boolean): boolean {
  const normalized = reason.trim().toLocaleLowerCase("pl-PL");
  const mentionsSameParts = /mianown|części|kawałk/u.test(normalized)
    && /zost|nie zmien|taki sam|jednakow/u.test(normalized);
  const mentionsExchange = /zamien|pożycz|całoś/u.test(normalized)
    && /częś|mianown|ósm|szóst|dziesiąt|dwunast/u.test(normalized);
  return normalized.length >= 16 && (exchangeRequired ? mentionsExchange : mentionsSameParts);
}

export function evaluateMixedSameDenominatorAttempt(input: {
  problem: MixedSameDenominatorProblem;
  submitted: FractionValue;
  exchangedWhole: boolean;
  justification?: string;
  requireJustification?: boolean;
}): FractionSameDenominatorMixedDiagnosticCode | null {
  if (input.submitted.denominator === 0) return FRACTION_FEEDBACK_CODES.zeroDenominator;
  const exchangeRequired = requiresWholeExchange(input.problem);
  if (exchangeRequired && !input.exchangedWhole) return FRA_BORROW_WHOLE;
  const expected = applyMixedSameDenominatorOperation(input.problem);
  if (!areEquivalentFractions(input.submitted, expected)) return FRACTION_FEEDBACK_CODES.wrongOperationPair;
  if (input.problem.requireSimplifiedFinal
    && greatestCommonDivisor(input.submitted.numerator, input.submitted.denominator) > 1) {
    return FRA_UNSIMPLIFIED_RESULT;
  }
  if (input.requireJustification
    && !hasMixedOperationJustification(input.justification ?? "", exchangeRequired)) {
    return FRA_MIXED_JUSTIFICATION;
  }
  return null;
}

const CUSTOM_COPY: Record<
  typeof FRA_BORROW_WHOLE | typeof FRA_UNSIMPLIFIED_RESULT | typeof FRA_MIXED_JUSTIFICATION,
  DiagnosticFeedbackCopy
> = {
  [FRA_BORROW_WHOLE]: {
    area: "W części ułamkowej odjemnej jest za mało równych części do wykonania odejmowania.",
    guidingQuestion: "Którą jedną całość możesz zamienić na tyle części, ile wskazuje mianownik?",
    visualHint: "Podświetl część całkowitą odjemnej. Przekreśl starą wartość i wpisz obok o 1 mniej, a do licznika dodaj cały mianownik.",
    analogousExample: "Najpierw zamieniamy jedną całość na odpowiednią liczbę równych części, a dopiero potem odejmujemy.",
  },
  [FRA_UNSIMPLIFIED_RESULT]: {
    area: "Wartość wyniku jest poprawna, ale część ułamkową można jeszcze skrócić.",
    guidingQuestion: "Przez jaką tę samą liczbę podzielisz licznik i mianownik części ułamkowej?",
    visualHint: "Stara część ułamkowa pozostaje widoczna i przekreślona. W małych kratkach obok wpisz nowy licznik i mianownik.",
    analogousExample: "Wynik może mieć poprawną wartość, ale należy go jeszcze skrócić przez wspólny dzielnik.",
  },
  [FRA_MIXED_JUSTIFICATION]: {
    area: "Obliczenie jest poprawne, ale brakuje wyjaśnienia kluczowego kroku.",
    guidingQuestion: "Czy trzeba było zamienić całość? Jeśli nie, dlaczego mianownik pozostał bez zmian?",
    visualHint: "Wskaż albo przekreśloną starą całość i nowe kratki, albo wspólny obrys jednakowych mianowników.",
    analogousExample: "Zamieniam jedną całość na równe części, gdy część ułamkowa jest za mała do odejmowania.",
  },
};

function isCustomCode(code: FractionSameDenominatorMixedDiagnosticCode): code is keyof typeof CUSTOM_COPY {
  return code in CUSTOM_COPY;
}

export function createFractionSameDenominatorMixedDiagnosticResult(
  code: FractionSameDenominatorMixedDiagnosticCode,
  memberIds: string[] = ["mixed-left", "mixed-right", "mixed-result"],
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (!isCustomCode(code)) return createFractionDiagnosticResult(code, { maxScore: 2, memberIds });
  const partial = code === FRA_UNSIMPLIFIED_RESULT || code === FRA_MIXED_JUSTIFICATION;
  return {
    result: createLessonGradeResult({
      status: partial ? "partially-correct" : "incorrect",
      score: partial ? 1 : 0,
      maxScore: 2,
      errorCodes: [code],
      feedbackKey: `fraction.${code.toLocaleLowerCase("en-US")}`,
    }),
    copy: CUSTOM_COPY[code],
    highlights: [{
      id: `fraction-${code.toLocaleLowerCase("en-US")}`,
      kind: code === FRA_BORROW_WHOLE ? "field" : "pair",
      memberIds,
      label: CUSTOM_COPY[code].area,
      state: code === FRA_UNSIMPLIFIED_RESULT ? "crossed-out" : "attention",
      pattern: code === FRA_BORROW_WHOLE ? "double" : "dashed",
      symbol: code === FRA_BORROW_WHOLE ? "1 ↔ n/n" : code === FRA_UNSIMPLIFIED_RESULT ? "÷" : "?",
      accent: partial ? "cyan" : "amber",
    }],
  };
}

export const FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS: readonly FractionSameDenominatorMixedDiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.emptyPart,
  FRACTION_FEEDBACK_CODES.zeroDenominator,
  FRACTION_FEEDBACK_CODES.wrongOperationPair,
  FRA_BORROW_WHOLE,
  FRA_UNSIMPLIFIED_RESULT,
  FRA_MIXED_JUSTIFICATION,
];

const ACTIVITIES = new Set<FractionSameDenominatorMixedActivity>([
  "mixed-same-denom-add",
  "mixed-same-denom-borrow-pizza",
  "mixed-same-denom-borrow-notation",
  "mixed-same-denom-bakery",
  "mixed-same-denom-independent",
]);

export function isFractionSameDenominatorMixedActivity(value: string): value is FractionSameDenominatorMixedActivity {
  return ACTIVITIES.has(value as FractionSameDenominatorMixedActivity);
}

export function fractionSameDenominatorMixedActivityFromStageId(stageId: string): FractionSameDenominatorMixedActivity | null {
  if (stageId.includes("mixed-same-denom-borrow-pizza")) return "mixed-same-denom-borrow-pizza";
  if (stageId.includes("mixed-same-denom-borrow-notation")) return "mixed-same-denom-borrow-notation";
  if (stageId.includes("mixed-same-denom-bakery")) return "mixed-same-denom-bakery";
  if (stageId.includes("mixed-same-denom-independent")) return "mixed-same-denom-independent";
  if (stageId.includes("mixed-same-denom-add")) return "mixed-same-denom-add";
  return null;
}
