import { createFractionDiagnosticResult } from "@/lib/math/fractions/fractionDiagnostics";
import { areEquivalentFractions } from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightAccent,
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type {
  FractionFeedbackCode,
  FractionValue,
  MixedFractionValue,
} from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const FRACTION_QUOTIENT_ORDER_CODE = "FRA_QUOTIENT_ORDER" as const;
export const FRACTION_UNEQUAL_SHARING_CODE = "FRA_UNEQUAL_SHARING" as const;
export const FRACTION_UNUSED_PARTS_CODE = "FRA_UNUSED_PARTS" as const;
export const FRACTION_QUOTIENT_CONTEXT_CODE = "FRA_QUOTIENT_CONTEXT" as const;

export type FractionQuotientDiagnosticCode =
  | FractionFeedbackCode
  | typeof FRACTION_QUOTIENT_ORDER_CODE
  | typeof FRACTION_UNEQUAL_SHARING_CODE
  | typeof FRACTION_UNUSED_PARTS_CODE
  | typeof FRACTION_QUOTIENT_CONTEXT_CODE;

export type FractionQuotientActivity =
  | "fair-share"
  | "two-notations"
  | "realtime-quotient"
  | "zero-divisor"
  | "zoo-banquet"
  | "independent-context";

export type FractionQuotientContextKind = "flatbreads" | "fruit" | "ribbons" | "zoo";

export interface FractionQuotientContext {
  kind: FractionQuotientContextKind;
  objectsLabel: string;
  recipientsLabel: string;
  suggestion: string;
}

export interface FractionQuotientPublicTask {
  generatorId: "fraction-quotient-l1-v1";
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionQuotientActivity;
  dividend: number;
  divisor: number;
  quotient: FractionValue | null;
  mixed: MixedFractionValue | null;
  prompt: string;
  context: FractionQuotientContext;
  controls: {
    dividendMin: number;
    dividendMax: number;
    divisorMin: number;
    divisorMax: number;
  };
  skillIds: readonly [
    "M5-3.2-fraction-as-quotient",
    "M5-3.2-fair-sharing",
    "M5-3.2-context-interpretation",
  ];
  invariants: readonly [
    "positive-divisor-for-valid-quotient",
    "all-parts-used-in-fair-share",
    "equal-share-for-every-recipient",
    "quotient-order-preserved",
  ];
}

const CONTEXTS: readonly FractionQuotientContext[] = [
  {
    kind: "flatbreads",
    objectsLabel: "identycznych placków",
    recipientsLabel: "osoby",
    suggestion: "Placki dzielimy sprawiedliwie między osoby.",
  },
  {
    kind: "fruit",
    objectsLabel: "arbuzów",
    recipientsLabel: "stołów",
    suggestion: "Owoce dzielimy po równo między stoły.",
  },
  {
    kind: "ribbons",
    objectsLabel: "metrów wstążki",
    recipientsLabel: "zespołów",
    suggestion: "Wstążkę dzielimy na równe odcinki dla zespołów.",
  },
  {
    kind: "zoo",
    objectsLabel: "porcji karmy",
    recipientsLabel: "opiekunów",
    suggestion: "Porcje karmy dzielimy sprawiedliwie między opiekunów.",
  },
];

const RANGE_BY_DIFFICULTY: Record<LessonDifficulty, {
  dividendMin: number;
  dividendMax: number;
  divisors: readonly number[];
}> = {
  support: { dividendMin: 3, dividendMax: 8, divisors: [2, 3] },
  core: { dividendMin: 5, dividendMax: 13, divisors: [2, 3, 4, 5, 6] },
  challenge: { dividendMin: 8, dividendMax: 18, divisors: [3, 4, 5, 6, 7, 8] },
};

function deterministicIndex(seed: number, salt: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed ilorazu musi być bezpieczną liczbą całkowitą.");
  if (length <= 0) throw new Error("Generator ilorazu wymaga niepustego zakresu.");
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) % length;
}

export function quotientFraction(dividend: number, divisor: number): FractionValue | null {
  if (!Number.isSafeInteger(dividend) || dividend < 0) {
    throw new Error("Dzielna musi być nieujemną liczbą naturalną.");
  }
  if (!Number.isSafeInteger(divisor)) throw new Error("Dzielnik musi być liczbą całkowitą.");
  if (divisor <= 0) return null;
  return { numerator: dividend, denominator: divisor };
}

/** Liczba mieszana zachowuje mianownik wynikający z liczby osób. */
export function quotientMixedNumber(dividend: number, divisor: number): MixedFractionValue | null {
  const quotient = quotientFraction(dividend, divisor);
  if (!quotient) return null;
  return {
    wholePart: Math.floor(dividend / divisor),
    numerator: dividend % divisor,
    denominator: divisor,
  };
}

function generatedNumbers(seed: number, difficulty: LessonDifficulty): { dividend: number; divisor: number } {
  const range = RANGE_BY_DIFFICULTY[difficulty];
  const divisor = range.divisors[deterministicIndex(seed, 0x53201, range.divisors.length)]!;
  const length = range.dividendMax - range.dividendMin + 1;
  let dividend = range.dividendMin + deterministicIndex(seed, 0x53202, length);
  if (dividend % divisor === 0) {
    dividend = dividend < range.dividendMax ? dividend + 1 : dividend - 1;
  }
  return { dividend, divisor };
}

function taskNumbers(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionQuotientActivity;
}): { dividend: number; divisor: number; context: FractionQuotientContext } {
  if (input.activity === "fair-share" || input.activity === "two-notations") {
    return { dividend: 5, divisor: 2, context: CONTEXTS[0]! };
  }
  if (input.activity === "zero-divisor") {
    return { dividend: 5, divisor: 0, context: CONTEXTS[0]! };
  }
  if (input.activity === "zoo-banquet") {
    return { dividend: 11, divisor: 4, context: CONTEXTS[3]! };
  }
  if (input.activity === "independent-context") {
    return {
      dividend: 13,
      divisor: 6,
      context: CONTEXTS[deterministicIndex(input.seed, 0x53203, CONTEXTS.length - 1) + 1]!,
    };
  }
  const generated = generatedNumbers(input.seed, input.difficulty);
  return {
    ...generated,
    context: CONTEXTS[deterministicIndex(input.seed, 0x53204, CONTEXTS.length)]!,
  };
}

function promptFor(activity: FractionQuotientActivity, dividend: number, divisor: number): string {
  switch (activity) {
    case "fair-share":
      return "Pokrój 5 identycznych placków i rozdaj wszystkie części po równo między 2 osoby.";
    case "two-notations":
      return "Połącz zapis 5 : 2 z pionowym ułamkiem 5/2 i nazwij rolę obu liczb.";
    case "realtime-quotient":
      return `Zmieniaj liczbę obiektów i osób. Model oraz zapis ${dividend} : ${divisor} aktualizują się od razu.`;
    case "zero-divisor":
      return "Sprawdź przypadek 5 : 0 i nazwij warunek, który musi spełniać dzielnik i mianownik.";
    case "zoo-banquet":
      return "Rozdziel 11 porcji po równo między 4 opiekunów. Zapisz ułamek i liczbę mieszaną.";
    case "independent-context":
      return "Utwórz własną sytuację sprawiedliwego podziału do 13 : 6 i wyjaśnij, co oznacza wynik dla jednej grupy.";
  }
}

/** Publiczny generator M5-3.2. Nie zawiera answerSpec ani rubryki walidatora. */
export function createPublicFractionQuotientTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionQuotientActivity;
}): FractionQuotientPublicTask {
  const generated = taskNumbers(input);
  const range = RANGE_BY_DIFFICULTY[input.difficulty];
  return {
    generatorId: "fraction-quotient-l1-v1",
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    dividend: generated.dividend,
    divisor: generated.divisor,
    quotient: quotientFraction(generated.dividend, generated.divisor),
    mixed: quotientMixedNumber(generated.dividend, generated.divisor),
    prompt: promptFor(input.activity, generated.dividend, generated.divisor),
    context: generated.context,
    controls: {
      dividendMin: range.dividendMin,
      dividendMax: range.dividendMax,
      divisorMin: 1,
      divisorMax: Math.max(...range.divisors),
    },
    skillIds: [
      "M5-3.2-fraction-as-quotient",
      "M5-3.2-fair-sharing",
      "M5-3.2-context-interpretation",
    ],
    invariants: [
      "positive-divisor-for-valid-quotient",
      "all-parts-used-in-fair-share",
      "equal-share-for-every-recipient",
      "quotient-order-preserved",
    ],
  };
}

export type FairShareValidation =
  | { status: "correct"; counts: number[] }
  | {
      status: "incorrect";
      code: typeof FRACTION_UNUSED_PARTS_CODE | typeof FRACTION_UNEQUAL_SHARING_CODE;
      counts: number[];
      unassigned: number;
    };

export function validateFairShare(
  assignments: readonly (number | null)[],
  peopleCount: number,
  expectedPiecesPerPerson: number,
): FairShareValidation {
  if (!Number.isSafeInteger(peopleCount) || peopleCount <= 0) throw new Error("Liczba osób musi być dodatnia.");
  if (!Number.isSafeInteger(expectedPiecesPerPerson) || expectedPiecesPerPerson < 0) {
    throw new Error("Liczba części dla osoby musi być nieujemna.");
  }
  const counts = Array.from({ length: peopleCount }, () => 0);
  let unassigned = 0;
  for (const assignment of assignments) {
    if (assignment === null) {
      unassigned += 1;
    } else if (Number.isSafeInteger(assignment) && assignment >= 0 && assignment < peopleCount) {
      counts[assignment] = (counts[assignment] ?? 0) + 1;
    } else {
      throw new Error("Przydział części wskazuje nieistniejącą osobę.");
    }
  }
  if (unassigned > 0) return { status: "incorrect", code: FRACTION_UNUSED_PARTS_CODE, counts, unassigned };
  if (counts.some((count) => count !== expectedPiecesPerPerson)) {
    return { status: "incorrect", code: FRACTION_UNEQUAL_SHARING_CODE, counts, unassigned: 0 };
  }
  return { status: "correct", counts };
}

export function validateQuotientNotation(
  dividend: number,
  divisor: number,
  value: FractionValue,
): FractionQuotientDiagnosticCode | null {
  const expected = quotientFraction(dividend, divisor);
  if (!expected) return FRACTION_FEEDBACK_CODES.zeroDenominator;
  if (value.numerator === divisor && value.denominator === dividend) return FRACTION_QUOTIENT_ORDER_CODE;
  if (value.numerator === dividend && value.denominator === divisor) return null;
  if (areEquivalentFractions(value, expected)) return FRACTION_QUOTIENT_CONTEXT_CODE;
  return FRACTION_FEEDBACK_CODES.notEquivalent;
}

const ACTIVITIES = new Set<FractionQuotientActivity>([
  "fair-share",
  "two-notations",
  "realtime-quotient",
  "zero-divisor",
  "zoo-banquet",
  "independent-context",
]);

export function isFractionQuotientActivity(value: string): value is FractionQuotientActivity {
  return ACTIVITIES.has(value as FractionQuotientActivity);
}

export function fractionQuotientActivityFromStageId(stageId: string): FractionQuotientActivity | null {
  if (stageId.includes("quotient-fair-share")) return "fair-share";
  if (stageId.includes("quotient-two-notations")) return "two-notations";
  if (stageId.includes("quotient-realtime")) return "realtime-quotient";
  if (stageId.includes("quotient-zero")) return "zero-divisor";
  if (stageId.includes("quotient-zoo-banquet")) return "zoo-banquet";
  if (stageId.includes("quotient-independent")) return "independent-context";
  return null;
}

const CUSTOM_COPY: Record<
  Exclude<FractionQuotientDiagnosticCode, FractionFeedbackCode>,
  DiagnosticFeedbackCopy
> = {
  [FRACTION_QUOTIENT_ORDER_CODE]: {
    area: "Kolejność dzielnej i dzielnika nie zgadza się z licznikiem i mianownikiem.",
    guidingQuestion: "Która liczba mówi, ile obiektów dzielisz, a która — między ile osób?",
    visualHint: "Połącz dzielną z licznikiem oraz dzielnik z mianownikiem dwoma opisanymi łącznikami.",
    analogousExample: "W 7 : 3 liczba 7 trafia nad kreskę, a 3 pod kreskę: 7/3.",
  },
  [FRACTION_UNEQUAL_SHARING_CODE]: {
    area: "Wszystkie części rozdano, ale osoby otrzymały różne liczby jednakowych kawałków.",
    guidingQuestion: "Czy każda osoba ma dokładnie tyle samo połówek?",
    visualHint: "Policz kawałki w obu polach osób i przenieś jeden kawałek z większej grupy do mniejszej.",
    analogousExample: "Sześć połówek między dwie osoby to po trzy połówki dla każdej.",
  },
  [FRACTION_UNUSED_PARTS_CODE]: {
    area: "Część podzielonych obiektów pozostała poza polami osób.",
    guidingQuestion: "Czy wykorzystano każdy kawałek powstały po cięciu?",
    visualHint: "Nierozdane części mają obrys „do umieszczenia”. Wybierz je po kolei i umieść u osób.",
    analogousExample: "Po podzieleniu trzech placków na połówki trzeba rozdać wszystkie sześć połówek.",
  },
  [FRACTION_QUOTIENT_CONTEXT_CODE]: {
    area: "Wartość może być równa, ale zapis nie opisuje dokładnie podanej liczby obiektów i odbiorców albo brakuje interpretacji.",
    guidingQuestion: "Co dokładnie oznaczają licznik, mianownik i wynik dla jednej osoby?",
    visualHint: "Wpisz liczbę obiektów nad kreską, liczbę odbiorców pod kreską i dopisz pełne zdanie o jednej osobie.",
    analogousExample: "Dla 9 bułek i 4 stołów zapis 9/4 mówi, że jeden stół dostaje 2 1/4 bułki.",
  },
};

const CUSTOM_META: Record<
  Exclude<FractionQuotientDiagnosticCode, FractionFeedbackCode>,
  { status: "incorrect" | "partially-correct"; score: number; maxScore: number; symbol: string; accent: DiagnosticHighlightAccent }
> = {
  [FRACTION_QUOTIENT_ORDER_CODE]: { status: "incorrect", score: 0, maxScore: 2, symbol: "↓", accent: "indigo" },
  [FRACTION_UNEQUAL_SHARING_CODE]: { status: "partially-correct", score: 1, maxScore: 2, symbol: "≠", accent: "amber" },
  [FRACTION_UNUSED_PARTS_CODE]: { status: "partially-correct", score: 1, maxScore: 2, symbol: "?", accent: "cyan" },
  [FRACTION_QUOTIENT_CONTEXT_CODE]: { status: "partially-correct", score: 2, maxScore: 3, symbol: "→", accent: "violet" },
};

function isCustomDiagnostic(
  code: FractionQuotientDiagnosticCode,
): code is Exclude<FractionQuotientDiagnosticCode, FractionFeedbackCode> {
  return code in CUSTOM_COPY;
}

export function createFractionQuotientDiagnosticResult(
  code: FractionQuotientDiagnosticCode,
  memberIds: string[] = ["dividend", "divisor", "numerator", "denominator"],
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (!isCustomDiagnostic(code)) return createFractionDiagnosticResult(code, { memberIds });
  const meta = CUSTOM_META[code];
  return {
    result: createLessonGradeResult({
      status: meta.status,
      score: meta.score,
      maxScore: meta.maxScore,
      errorCodes: [code],
      feedbackKey: `fraction.${code.toLowerCase()}`,
    }),
    copy: CUSTOM_COPY[code],
    highlights: [{
      id: `fraction-${code.toLowerCase()}`,
      kind: code === FRACTION_UNUSED_PARTS_CODE ? "field" : "pair",
      memberIds,
      label: CUSTOM_COPY[code].area,
      state: "attention",
      pattern: code === FRACTION_UNEQUAL_SHARING_CODE ? "dashed" : "double",
      symbol: meta.symbol,
      accent: meta.accent,
    }],
  };
}

export const FRACTION_QUOTIENT_FEEDBACK_KEYS: readonly FractionQuotientDiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.emptyPart,
  FRACTION_FEEDBACK_CODES.zeroDenominator,
  FRACTION_FEEDBACK_CODES.numeratorDenominatorSwapped,
  FRACTION_FEEDBACK_CODES.notEquivalent,
  FRACTION_FEEDBACK_CODES.notSimplified,
  FRACTION_FEEDBACK_CODES.wrongOperationPair,
  FRACTION_QUOTIENT_ORDER_CODE,
  FRACTION_UNEQUAL_SHARING_CODE,
  FRACTION_UNUSED_PARTS_CODE,
  FRACTION_QUOTIENT_CONTEXT_CODE,
];
