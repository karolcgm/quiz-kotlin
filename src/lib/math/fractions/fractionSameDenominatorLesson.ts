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

export const FRACTION_SAME_DENOMINATOR_GENERATOR_ID = "fraction-same-denominator-l1-v1" as const;
export const FRA_DENOM_ADDED = "FRA_DENOM_ADDED" as const;
export const FRA_UNSIMPLIFIED_RESULT = "FRA_UNSIMPLIFIED_RESULT" as const;
export const FRA_SAME_DENOM_JUSTIFICATION = "FRA_SAME_DENOM_JUSTIFICATION" as const;

export type FractionSameDenominatorDiagnosticCode =
  | FractionFeedbackCode
  | typeof FRA_DENOM_ADDED
  | typeof FRA_UNSIMPLIFIED_RESULT
  | typeof FRA_SAME_DENOM_JUSTIFICATION;

export type FractionSameDenominatorActivity =
  | "same-denom-pizza-add"
  | "same-denom-rule"
  | "same-denom-take-away"
  | "same-denom-bakery"
  | "same-denom-independent";

export type FractionSameDenominatorOperation = "+" | "−";

export interface FractionSameDenominatorPublicTask {
  generatorId: typeof FRACTION_SAME_DENOMINATOR_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionSameDenominatorActivity;
  prompt: string;
  left: FractionValue;
  right: FractionValue;
  operation: FractionSameDenominatorOperation;
  requireSimplifiedFinal: boolean;
  resultHiddenUntilAttempt: boolean;
  skillIds: readonly [
    "M5-3.5-add-sub-same-denom",
    "M5-3.5-denominator-invariant",
    "M5-3.5-simplify-result",
    "M5-3.5-context",
  ];
  invariants: readonly [
    "proper-fractions-only",
    "same-positive-denominator",
    "denominator-stays-unchanged-before-simplifying",
    "no-mixed-numbers-or-borrowing",
    "answer-spec-server-only",
  ];
}

interface SameDenominatorCase {
  left: FractionValue;
  right: FractionValue;
  operation: FractionSameDenominatorOperation;
}

const FIXED_CASES: Record<Exclude<FractionSameDenominatorActivity, "same-denom-independent">, SameDenominatorCase> = {
  "same-denom-pizza-add": {
    left: { numerator: 2, denominator: 8 },
    right: { numerator: 3, denominator: 8 },
    operation: "+",
  },
  "same-denom-rule": {
    left: { numerator: 2, denominator: 8 },
    right: { numerator: 3, denominator: 8 },
    operation: "+",
  },
  "same-denom-take-away": {
    left: { numerator: 7, denominator: 8 },
    right: { numerator: 3, denominator: 8 },
    operation: "−",
  },
  "same-denom-bakery": {
    left: { numerator: 3, denominator: 10 },
    right: { numerator: 4, denominator: 10 },
    operation: "+",
  },
};

const INDEPENDENT_CASES: Record<LessonDifficulty, readonly SameDenominatorCase[]> = {
  support: [
    { left: { numerator: 1, denominator: 6 }, right: { numerator: 2, denominator: 6 }, operation: "+" },
    { left: { numerator: 5, denominator: 8 }, right: { numerator: 1, denominator: 8 }, operation: "−" },
  ],
  core: [
    { left: { numerator: 9, denominator: 16 }, right: { numerator: 3, denominator: 16 }, operation: "+" },
    { left: { numerator: 13, denominator: 20 }, right: { numerator: 5, denominator: 20 }, operation: "−" },
    { left: { numerator: 7, denominator: 18 }, right: { numerator: 5, denominator: 18 }, operation: "+" },
    { left: { numerator: 15, denominator: 24 }, right: { numerator: 3, denominator: 24 }, operation: "−" },
    { left: { numerator: 11, denominator: 25 }, right: { numerator: 9, denominator: 25 }, operation: "+" },
  ],
  challenge: [
    { left: { numerator: 13, denominator: 24 }, right: { numerator: 5, denominator: 24 }, operation: "+" },
    { left: { numerator: 17, denominator: 30 }, right: { numerator: 5, denominator: 30 }, operation: "−" },
    { left: { numerator: 11, denominator: 18 }, right: { numerator: 5, denominator: 18 }, operation: "+" },
    { left: { numerator: 19, denominator: 28 }, right: { numerator: 7, denominator: 28 }, operation: "−" },
    { left: { numerator: 7, denominator: 20 }, right: { numerator: 9, denominator: 20 }, operation: "+" },
  ],
};

function deterministicIndex(seed: number, salt: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed działania na ułamkach musi być bezpieczną liczbą całkowitą.");
  if (length <= 0) throw new Error("Generator wymaga niepustej puli zadań.");
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) % length;
}

function promptFor(activity: FractionSameDenominatorActivity): string {
  switch (activity) {
    case "same-denom-pizza-add":
      return "Przenieś 3 z 8 równych kawałków do pizzy, w której są już 2 kawałki. Obserwuj, co zmienia się w zapisie.";
    case "same-denom-rule":
      return "Obrysuj wspólną miarę „ósme części”, a potem połącz tylko liczniki. Wyjaśnij, dlaczego mianownik zostaje 8.";
    case "same-denom-take-away":
      return "Odłóż fizycznie 3 kawałki z 7/8 pizzy. Wynik zapisz dopiero po własnej próbie.";
    case "same-denom-bakery":
      return "Piekarnia przygotowała 3/10 tacy drożdżówek rano i 4/10 tacy później. Oblicz całość i odpowiedz pełnym zdaniem.";
    case "same-denom-independent":
      return "Wykonaj działanie, skróć wynik do postaci nieskracalnej i uzasadnij jednym zdaniem, dlaczego mianownik działania się nie zmienia.";
  }
}

function assertProperSameDenominator(input: SameDenominatorCase): void {
  const values = [input.left, input.right];
  if (values.some((value) => !Number.isSafeInteger(value.numerator)
    || !Number.isSafeInteger(value.denominator)
    || value.denominator <= 0
    || value.numerator < 0
    || value.numerator >= value.denominator)) {
    throw new Error("L1 M5-3.5 obsługuje wyłącznie ułamki właściwe o dodatnim mianowniku.");
  }
  if (input.left.denominator !== input.right.denominator) {
    throw new Error("Działanie L1 M5-3.5 wymaga jednakowych mianowników.");
  }
  const rawNumerator = input.operation === "+"
    ? input.left.numerator + input.right.numerator
    : input.left.numerator - input.right.numerator;
  if (rawNumerator < 0 || rawNumerator >= input.left.denominator) {
    throw new Error("Wynik L1 M5-3.5 musi pozostać ułamkiem właściwym bez pożyczania.");
  }
}

export function applySameDenominatorOperation(input: SameDenominatorCase): FractionValue {
  assertProperSameDenominator(input);
  return {
    numerator: input.operation === "+"
      ? input.left.numerator + input.right.numerator
      : input.left.numerator - input.right.numerator,
    denominator: input.left.denominator,
  };
}

export function createPublicFractionSameDenominatorTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionSameDenominatorActivity;
}): FractionSameDenominatorPublicTask {
  const selected = input.activity === "same-denom-independent"
    ? INDEPENDENT_CASES[input.difficulty][deterministicIndex(input.seed, 0x53501, INDEPENDENT_CASES[input.difficulty].length)]!
    : FIXED_CASES[input.activity];
  assertProperSameDenominator(selected);
  return {
    generatorId: FRACTION_SAME_DENOMINATOR_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    left: { ...selected.left },
    right: { ...selected.right },
    operation: selected.operation,
    requireSimplifiedFinal: input.activity === "same-denom-independent",
    resultHiddenUntilAttempt: input.activity === "same-denom-take-away",
    skillIds: [
      "M5-3.5-add-sub-same-denom",
      "M5-3.5-denominator-invariant",
      "M5-3.5-simplify-result",
      "M5-3.5-context",
    ],
    invariants: [
      "proper-fractions-only",
      "same-positive-denominator",
      "denominator-stays-unchanged-before-simplifying",
      "no-mixed-numbers-or-borrowing",
      "answer-spec-server-only",
    ],
  };
}

export function hasSameDenominatorJustification(reason: string): boolean {
  const normalized = reason.trim().toLocaleLowerCase("pl-PL");
  return normalized.length >= 12
    && /mianown|części|kawałk/u.test(normalized)
    && /zost|nie zmien|taki sam|jednakow/u.test(normalized);
}

export function evaluateSameDenominatorAttempt(input: {
  task: Pick<FractionSameDenominatorPublicTask, "left" | "right" | "operation" | "requireSimplifiedFinal">;
  submitted: FractionValue;
  justification?: string;
  requireJustification?: boolean;
}): FractionSameDenominatorDiagnosticCode | null {
  if (input.submitted.denominator === 0) return FRACTION_FEEDBACK_CODES.zeroDenominator;
  const raw = applySameDenominatorOperation(input.task);
  const incorrectlyAddedDenominator = input.task.left.denominator + input.task.right.denominator;
  if (input.submitted.denominator === incorrectlyAddedDenominator) return FRA_DENOM_ADDED;
  if (!areEquivalentFractions(input.submitted, raw)) return FRACTION_FEEDBACK_CODES.wrongOperationPair;
  if (input.task.requireSimplifiedFinal && greatestCommonDivisor(input.submitted.numerator, input.submitted.denominator) > 1) {
    return FRA_UNSIMPLIFIED_RESULT;
  }
  if (input.requireJustification && !hasSameDenominatorJustification(input.justification ?? "")) {
    return FRA_SAME_DENOM_JUSTIFICATION;
  }
  return null;
}

const CUSTOM_COPY: Record<
  typeof FRA_DENOM_ADDED | typeof FRA_UNSIMPLIFIED_RESULT | typeof FRA_SAME_DENOM_JUSTIFICATION,
  DiagnosticFeedbackCopy
> = {
  [FRA_DENOM_ADDED]: {
    area: "Mianowniki zostały dodane, choć nadal liczymy części tej samej wielkości.",
    guidingQuestion: "Czy po połączeniu kawałków pizza została podzielona na szesnaście części, czy nadal na osiem równych części?",
    visualHint: "Obrys obejmuje oba mianowniki jako wspólną miarę. Łącznik biegnie tylko między licznikami.",
    analogousExample: "1/6 + 2/6 = 3/6, bo łączymy trzy szóste części, a nie zmieniamy ich wielkości.",
  },
  [FRA_UNSIMPLIFIED_RESULT]: {
    area: "Wartość działania jest poprawna, ale końcowy ułamek można jeszcze skrócić.",
    guidingQuestion: "Przez jaką tę samą liczbę można podzielić licznik i mianownik?",
    visualHint: "Przekreśl stary licznik i mianownik jedną kreską, a obok wpisz obie nowe wartości po podzieleniu przez wspólny dzielnik.",
    analogousExample: "3/6 opisuje poprawną wartość, lecz końcowo zapisujemy 1/2 po podzieleniu góry i dołu przez 3.",
  },
  [FRA_SAME_DENOM_JUSTIFICATION]: {
    area: "Wynik działania jest poprawny, ale uzasadnienie nie wyjaśnia niezmiennego mianownika.",
    guidingQuestion: "Co mówi mianownik o wielkości kawałków przed działaniem i po nim?",
    visualHint: "Wskaż wspólny obrys dolnych kratek i nazwij części tej samej wielkości.",
    analogousExample: "W 2/7 + 3/7 mianownik zostaje 7, bo przez całe działanie liczymy siódme części.",
  },
};

function isCustomCode(code: FractionSameDenominatorDiagnosticCode): code is keyof typeof CUSTOM_COPY {
  return code in CUSTOM_COPY;
}

export function createFractionSameDenominatorDiagnosticResult(
  code: FractionSameDenominatorDiagnosticCode,
  memberIds: string[] = ["same-denom-left", "same-denom-right", "same-denom-result"],
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (!isCustomCode(code)) return createFractionDiagnosticResult(code, { maxScore: 2, memberIds });
  const partial = code === FRA_UNSIMPLIFIED_RESULT || code === FRA_SAME_DENOM_JUSTIFICATION;
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
      kind: code === FRA_DENOM_ADDED ? "pair" : "field",
      memberIds,
      label: CUSTOM_COPY[code].area,
      state: code === FRA_UNSIMPLIFIED_RESULT ? "crossed-out" : "attention",
      pattern: code === FRA_DENOM_ADDED ? "double" : "dashed",
      symbol: code === FRA_DENOM_ADDED ? "≠ +" : code === FRA_UNSIMPLIFIED_RESULT ? "÷" : "?",
      accent: partial ? "cyan" : "amber",
    }],
  };
}

export function simplifiedSameDenominatorResult(
  task: Pick<FractionSameDenominatorPublicTask, "left" | "right" | "operation">,
): FractionValue {
  return normalizeFraction(applySameDenominatorOperation(task));
}

export const FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS: readonly FractionSameDenominatorDiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.emptyPart,
  FRACTION_FEEDBACK_CODES.zeroDenominator,
  FRACTION_FEEDBACK_CODES.wrongOperationPair,
  FRA_DENOM_ADDED,
  FRA_UNSIMPLIFIED_RESULT,
  FRA_SAME_DENOM_JUSTIFICATION,
];

const ACTIVITIES = new Set<FractionSameDenominatorActivity>([
  "same-denom-pizza-add",
  "same-denom-rule",
  "same-denom-take-away",
  "same-denom-bakery",
  "same-denom-independent",
]);

export function isFractionSameDenominatorActivity(value: string): value is FractionSameDenominatorActivity {
  return ACTIVITIES.has(value as FractionSameDenominatorActivity);
}

export function fractionSameDenominatorActivityFromStageId(stageId: string): FractionSameDenominatorActivity | null {
  if (stageId.includes("same-denom-pizza-add")) return "same-denom-pizza-add";
  if (stageId.includes("same-denom-rule")) return "same-denom-rule";
  if (stageId.includes("same-denom-take-away")) return "same-denom-take-away";
  if (stageId.includes("same-denom-bakery")) return "same-denom-bakery";
  if (stageId.includes("same-denom-independent")) return "same-denom-independent";
  return null;
}
