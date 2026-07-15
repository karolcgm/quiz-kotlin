import { createFractionDiagnosticResult } from "@/lib/math/fractions/fractionDiagnostics";
import {
  areEquivalentFractions,
  greatestCommonDivisor,
  isFractionSimplified,
} from "@/lib/math/fractions/fractionMath";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightAccent,
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { FractionFeedbackCode, FractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const FRACTION_DIFFERENT_FACTORS_CODE = "FRA_DIFFERENT_FACTORS" as const;
export const FRACTION_ONE_SIDED_OPERATION_CODE = "FRA_ONE_SIDED_OPERATION" as const;
export const FRACTION_NON_INTEGER_DIVISOR_CODE = "FRA_NON_INTEGER_DIVISOR" as const;
export const FRACTION_EQUIVALENCE_REASON_CODE = "FRA_EQUIVALENCE_REASON" as const;

export type FractionEquivalenceDiagnosticCode =
  | FractionFeedbackCode
  | typeof FRACTION_DIFFERENT_FACTORS_CODE
  | typeof FRACTION_ONE_SIDED_OPERATION_CODE
  | typeof FRACTION_NON_INTEGER_DIVISOR_CODE
  | typeof FRACTION_EQUIVALENCE_REASON_CODE;

export type FractionEquivalenceActivity =
  | "equivalence-theory-check"
  | "denser-partition"
  | "expansion-grid"
  | "common-denominator-pair"
  | "collapse-partition"
  | "cross-out-rewrite"
  | "equivalent-chain"
  | "equivalence-review"
  | "paint-lab"
  | "independent-equivalence"
  | "independent-simplification";

export interface FractionEquivalencePublicTask {
  generatorId: "fraction-equivalence-l1-v1";
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionEquivalenceActivity;
  source: FractionValue;
  result: FractionValue;
  operation: "expand" | "simplify";
  factor: number;
  prompt: string;
  chain: FractionValue[];
  controls: {
    multipliers: readonly [2, 3, 4];
    divisorOptions: number[];
  };
  skillIds: readonly [
    "M5-3.3-simplify-expand",
    "M5-3.3-equivalent-fractions",
    "M5-3.3-same-factor",
    "M5-3.3-irreducible-form",
  ];
  invariants: readonly [
    "same-factor-for-numerator-and-denominator",
    "value-preserved",
    "positive-non-zero-denominator",
    "integer-divisor-for-simplification",
  ];
}

const INDEPENDENT_CASES: Record<LessonDifficulty, readonly {
  source: FractionValue;
  factor: number;
}[]> = {
  support: [
    { source: { numerator: 1, denominator: 5 }, factor: 2 },
    { source: { numerator: 2, denominator: 7 }, factor: 2 },
    { source: { numerator: 3, denominator: 8 }, factor: 2 },
  ],
  core: [
    { source: { numerator: 3, denominator: 7 }, factor: 3 },
    { source: { numerator: 4, denominator: 9 }, factor: 4 },
    { source: { numerator: 5, denominator: 11 }, factor: 4 },
    { source: { numerator: 7, denominator: 10 }, factor: 3 },
  ],
  challenge: [
    { source: { numerator: 7, denominator: 12 }, factor: 6 },
    { source: { numerator: 9, denominator: 14 }, factor: 6 },
    { source: { numerator: 11, denominator: 15 }, factor: 5 },
  ],
};

const SIMPLIFICATION_CASES: Record<LessonDifficulty, readonly FractionValue[]> = {
  support: [{ numerator: 10, denominator: 15 }, { numerator: 14, denominator: 21 }, { numerator: 16, denominator: 28 }],
  core: [{ numerator: 32, denominator: 48 }, { numerator: 35, denominator: 49 }, { numerator: 44, denominator: 66 }],
  challenge: [{ numerator: 105, denominator: 165 }, { numerator: 126, denominator: 198 }, { numerator: 154, denominator: 231 }],
};

function deterministicIndex(seed: number, salt: number, length: number): number {
  if (!Number.isSafeInteger(seed)) throw new Error("Seed równoważności musi być bezpieczną liczbą całkowitą.");
  if (length <= 0) throw new Error("Generator równoważności wymaga niepustej puli.");
  let value = (seed ^ salt) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return (value >>> 0) % length;
}

export function expandFraction(value: FractionValue, factor: number): FractionValue {
  if (!Number.isSafeInteger(factor) || factor <= 0) {
    throw new Error("Mnożnik rozszerzenia musi być dodatnią liczbą całkowitą.");
  }
  if (!Number.isSafeInteger(value.numerator) || !Number.isSafeInteger(value.denominator) || value.denominator <= 0) {
    throw new Error("Rozszerzany ułamek musi mieć całkowity licznik i dodatni mianownik.");
  }
  return { numerator: value.numerator * factor, denominator: value.denominator * factor };
}

export function simplifyFractionBy(value: FractionValue, divisor: number): FractionValue | null {
  if (!Number.isSafeInteger(divisor) || divisor <= 1) return null;
  if (value.denominator <= 0 || value.numerator % divisor !== 0 || value.denominator % divisor !== 0) return null;
  return { numerator: value.numerator / divisor, denominator: value.denominator / divisor };
}

function divisorOptions(value: FractionValue): number[] {
  const gcd = greatestCommonDivisor(value.numerator, value.denominator);
  return Array.from({ length: Math.max(0, gcd - 1) }, (_, index) => index + 2)
    .filter((candidate) => gcd % candidate === 0);
}

function fixedTask(activity: Exclude<FractionEquivalenceActivity, "independent-equivalence" | "independent-simplification">): {
  source: FractionValue;
  result: FractionValue;
  operation: "expand" | "simplify";
  factor: number;
  chain: FractionValue[];
} {
  switch (activity) {
    case "equivalence-theory-check":
      return {
        source: { numerator: 5, denominator: 8 },
        result: { numerator: 5, denominator: 8 },
        operation: "simplify",
        factor: 1,
        chain: [{ numerator: 5, denominator: 8 }],
      };
    case "denser-partition":
      return {
        source: { numerator: 3, denominator: 7 },
        result: { numerator: 6, denominator: 14 },
        operation: "expand",
        factor: 2,
        chain: [{ numerator: 3, denominator: 7 }, { numerator: 6, denominator: 14 }],
      };
    case "expansion-grid":
      return {
        source: { numerator: 1, denominator: 3 },
        result: { numerator: 3, denominator: 9 },
        operation: "expand",
        factor: 3,
        chain: [{ numerator: 1, denominator: 3 }, { numerator: 3, denominator: 9 }],
      };
    case "common-denominator-pair":
      return {
        source: { numerator: 1, denominator: 3 },
        result: { numerator: 2, denominator: 6 },
        operation: "expand",
        factor: 2,
        chain: [{ numerator: 1, denominator: 3 }, { numerator: 2, denominator: 6 }],
      };
    case "collapse-partition":
      return {
        source: { numerator: 16, denominator: 28 },
        result: { numerator: 4, denominator: 7 },
        operation: "simplify",
        factor: 4,
        chain: [{ numerator: 16, denominator: 28 }, { numerator: 8, denominator: 14 }, { numerator: 4, denominator: 7 }],
      };
    case "cross-out-rewrite":
      return {
        source: { numerator: 54, denominator: 72 },
        result: { numerator: 3, denominator: 4 },
        operation: "simplify",
        factor: 18,
        chain: [{ numerator: 54, denominator: 72 }, { numerator: 3, denominator: 4 }],
      };
    case "equivalent-chain":
      return {
        source: { numerator: 18, denominator: 24 },
        result: { numerator: 3, denominator: 4 },
        operation: "simplify",
        factor: 6,
        chain: [{ numerator: 18, denominator: 24 }, { numerator: 3, denominator: 4 }],
      };
    case "equivalence-review":
      return {
        source: { numerator: 12, denominator: 18 },
        result: { numerator: 2, denominator: 3 },
        operation: "simplify",
        factor: 6,
        chain: [{ numerator: 12, denominator: 18 }, { numerator: 2, denominator: 3 }],
      };
    case "paint-lab":
      return {
        source: { numerator: 4, denominator: 7 },
        result: { numerator: 12, denominator: 21 },
        operation: "expand",
        factor: 3,
        chain: [
          { numerator: 4, denominator: 7 },
          { numerator: 8, denominator: 14 },
          { numerator: 12, denominator: 21 },
        ],
      };
  }
}

function promptFor(activity: FractionEquivalenceActivity, source: FractionValue, result: FractionValue, factor: number): string {
  switch (activity) {
    case "equivalence-theory-check":
      return "Wybierz poprawną odpowiedź. Rozpoznaj ułamek skracalny i nieskracalny oraz przypomnij sobie, co oznacza rozszerzanie ułamka.";
    case "denser-partition":
      return "Podziel każdy segment paska na 2, 3 albo 4 mniejsze części. Zaznaczone pole i punkt na osi nie mogą się przesunąć.";
    case "expansion-grid":
      return "Uzupełnij brakujący licznik albo mianownik. Licznik i mianownik pomnóż przez tę samą liczbę.";
    case "common-denominator-pair":
      return "Rozszerz oba ułamki tak, aby otrzymały wspólny mianownik. Każdy ułamek zapisz w osobnym wierszu.";
    case "collapse-partition":
      return `Połącz sąsiednie części modelu ${source.numerator}/${source.denominator} w grupy po ${factor}, nie zmieniając zaznaczonego pola.`;
    case "cross-out-rewrite":
      return `Podziel licznik i mianownik ${source.numerator}/${source.denominator} przez ${factor}. Stare liczby pozostaw jako czytelny, przekreślony ślad.`;
    case "equivalent-chain":
      return `Skróć ${source.numerator}/${source.denominator} do postaci nieskracalnej. Zapisz tylko jeden ułamek wynikowy.`;
    case "equivalence-review":
      return "Rozwiąż bieżący przykład. Kolejne zadanie pojawi się w tym samym slajdzie po zatwierdzeniu odpowiedzi.";
    case "paint-lab":
      return "Opisz tę samą pomalowaną część ściany trzema równoważnymi ułamkami, mimo coraz gęstszego podziału.";
    case "independent-equivalence":
      return `Rozszerz ${source.numerator}/${source.denominator} przez ${factor}, a potem skróć ${result.numerator}/${result.denominator} do postaci nieskracalnej. Zapisz dowód kroków.`;
    case "independent-simplification":
      return `Skróć ${source.numerator}/${source.denominator} do postaci nieskracalnej. Zostaw ślad wszystkich wspólnych dzielników i uzasadnij zachowanie wartości.`;
  }
}

/** Publiczny generator M5-3.3. Zawiera dane zadania, ale nigdy prywatny answerSpec. */
export function createPublicFractionEquivalenceTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionEquivalenceActivity;
}): FractionEquivalencePublicTask {
  const data = input.activity === "independent-equivalence"
    ? (() => {
        const pool = INDEPENDENT_CASES[input.difficulty];
        const chosen = pool[deterministicIndex(input.seed, 0x53301, pool.length)]!;
        const result = expandFraction(chosen.source, chosen.factor);
        return {
          source: chosen.source,
          result,
          operation: "expand" as const,
          factor: chosen.factor,
          chain: [chosen.source, result],
        };
      })()
    : input.activity === "independent-simplification"
      ? (() => {
          const pool = SIMPLIFICATION_CASES[input.difficulty];
          const source = pool[deterministicIndex(input.seed, 0x53302, pool.length)]!;
          const factor = greatestCommonDivisor(source.numerator, source.denominator);
          const result = { numerator: source.numerator / factor, denominator: source.denominator / factor };
          return { source, result, operation: "simplify" as const, factor, chain: [source, result] };
        })()
      : fixedTask(input.activity);

  return {
    generatorId: "fraction-equivalence-l1-v1",
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    ...data,
    prompt: promptFor(input.activity, data.source, data.result, data.factor),
    controls: {
      multipliers: [2, 3, 4],
      divisorOptions: divisorOptions(data.operation === "simplify" ? data.source : data.result),
    },
    skillIds: [
      "M5-3.3-simplify-expand",
      "M5-3.3-equivalent-fractions",
      "M5-3.3-same-factor",
      "M5-3.3-irreducible-form",
    ],
    invariants: [
      "same-factor-for-numerator-and-denominator",
      "value-preserved",
      "positive-non-zero-denominator",
      "integer-divisor-for-simplification",
    ],
  };
}

export function validateEquivalentTransformation(input: {
  source: FractionValue;
  result: FractionValue;
  mode: "expand" | "simplify";
  numeratorFactor: number;
  denominatorFactor: number;
}): FractionEquivalenceDiagnosticCode | null {
  const { source, result, mode, numeratorFactor, denominatorFactor } = input;
  const factorsAreIntegers = Number.isSafeInteger(numeratorFactor) && Number.isSafeInteger(denominatorFactor);
  if (!factorsAreIntegers) return FRACTION_NON_INTEGER_DIVISOR_CODE;
  if ((numeratorFactor <= 1) !== (denominatorFactor <= 1)) return FRACTION_ONE_SIDED_OPERATION_CODE;
  if (numeratorFactor <= 1 || denominatorFactor <= 1) return FRACTION_NON_INTEGER_DIVISOR_CODE;
  if (numeratorFactor !== denominatorFactor) return FRACTION_DIFFERENT_FACTORS_CODE;

  const expected = mode === "expand"
    ? expandFraction(source, numeratorFactor)
    : simplifyFractionBy(source, numeratorFactor);
  if (!expected) return FRACTION_NON_INTEGER_DIVISOR_CODE;
  if (result.numerator !== expected.numerator || result.denominator !== expected.denominator) {
    return areEquivalentFractions(source, result)
      ? FRACTION_FEEDBACK_CODES.wrongOperationPair
      : FRACTION_FEEDBACK_CODES.notEquivalent;
  }
  return areEquivalentFractions(source, result) ? null : FRACTION_FEEDBACK_CODES.notEquivalent;
}

export function validateSimplificationPath(input: {
  source: FractionValue;
  result: FractionValue;
  numeratorDivisors: readonly number[];
  denominatorDivisors: readonly number[];
}): FractionEquivalenceDiagnosticCode | null {
  const { source, result, numeratorDivisors, denominatorDivisors } = input;
  if ((numeratorDivisors.length === 0) !== (denominatorDivisors.length === 0)) {
    return FRACTION_ONE_SIDED_OPERATION_CODE;
  }
  if (numeratorDivisors.length !== denominatorDivisors.length) return FRACTION_DIFFERENT_FACTORS_CODE;

  let current = { ...source };
  for (let index = 0; index < numeratorDivisors.length; index += 1) {
    const numeratorDivisor = numeratorDivisors[index]!;
    const denominatorDivisor = denominatorDivisors[index]!;
    if (!Number.isSafeInteger(numeratorDivisor) || !Number.isSafeInteger(denominatorDivisor)
      || numeratorDivisor <= 1 || denominatorDivisor <= 1) {
      return FRACTION_NON_INTEGER_DIVISOR_CODE;
    }
    if (numeratorDivisor !== denominatorDivisor) return FRACTION_DIFFERENT_FACTORS_CODE;
    const next = simplifyFractionBy(current, numeratorDivisor);
    if (!next) return FRACTION_NON_INTEGER_DIVISOR_CODE;
    current = next;
  }

  if (result.numerator !== current.numerator || result.denominator !== current.denominator) {
    return areEquivalentFractions(source, result)
      ? FRACTION_FEEDBACK_CODES.wrongOperationPair
      : FRACTION_FEEDBACK_CODES.notEquivalent;
  }
  if (!isFractionSimplified(result)) return FRACTION_FEEDBACK_CODES.notSimplified;
  return null;
}

export function validateEquivalentChainEntry(
  source: FractionValue,
  factor: number,
  answer: FractionValue,
): FractionEquivalenceDiagnosticCode | null {
  const expected = expandFraction(source, factor);
  if (answer.numerator === expected.numerator && answer.denominator === expected.denominator) return null;
  if (areEquivalentFractions(source, answer)) return FRACTION_FEEDBACK_CODES.wrongOperationPair;
  return FRACTION_FEEDBACK_CODES.notEquivalent;
}

export function parseDivisorPath(raw: string): number[] {
  if (!raw.trim()) return [];
  return raw.split(/[\s,;]+/u).filter(Boolean).map((token) => Number(token));
}

const ACTIVITIES = new Set<FractionEquivalenceActivity>([
  "equivalence-theory-check",
  "denser-partition",
  "expansion-grid",
  "common-denominator-pair",
  "collapse-partition",
  "cross-out-rewrite",
  "equivalent-chain",
  "equivalence-review",
  "paint-lab",
  "independent-equivalence",
  "independent-simplification",
]);

export function isFractionEquivalenceActivity(value: string): value is FractionEquivalenceActivity {
  return ACTIVITIES.has(value as FractionEquivalenceActivity);
}

export function fractionEquivalenceActivityFromStageId(stageId: string): FractionEquivalenceActivity | null {
  if (stageId.includes("equiv-theory-check")) return "equivalence-theory-check";
  if (stageId.includes("equiv-denser-partition")) return "denser-partition";
  if (stageId.includes("equiv-expansion-grid")) return "expansion-grid";
  if (stageId.includes("equiv-common-denominator-pair")) return "common-denominator-pair";
  if (stageId.includes("equiv-collapse-partition")) return "collapse-partition";
  if (stageId.includes("equiv-cross-out-rewrite")) return "cross-out-rewrite";
  if (stageId.includes("equiv-equivalent-chain")) return "equivalent-chain";
  if (stageId.includes("equiv-review")) return "equivalence-review";
  if (stageId.includes("equiv-paint-lab")) return "paint-lab";
  if (stageId.includes("equiv-independent-simplification")) return "independent-simplification";
  if (stageId.includes("equiv-independent")) return "independent-equivalence";
  return null;
}

const CUSTOM_COPY: Record<
  Exclude<FractionEquivalenceDiagnosticCode, FractionFeedbackCode>,
  DiagnosticFeedbackCopy
> = {
  [FRACTION_DIFFERENT_FACTORS_CODE]: {
    area: "Licznik i mianownik zostały zmienione przez różne liczby.",
    guidingQuestion: "Czy symbol przy liczniku i symbol przy mianowniku wskazują dokładnie ten sam mnożnik albo dzielnik?",
    visualHint: "Połącz aktywną parę identycznym symbolem, wzorem linii i liczbą działania.",
    analogousExample: "Rozszerzając 3/7 przez 4, obliczamy 3 × 4 i 7 × 4, więc otrzymujemy 12/28.",
  },
  [FRACTION_ONE_SIDED_OPERATION_CODE]: {
    area: "Działanie wykonano tylko na liczniku albo tylko na mianowniku.",
    guidingQuestion: "Która druga część ułamka musi zostać zmieniona przez tę samą liczbę?",
    visualHint: "Wygasz pozostałe pola i zaznacz pionową parę: licznik oraz mianownik tego samego ułamka.",
    analogousExample: "Dzieląc 16/28 przez 4, dzielimy zarówno 16, jak i 28, otrzymując 4/7.",
  },
  [FRACTION_NON_INTEGER_DIVISOR_CODE]: {
    area: "Wybrana liczba nie jest całkowitym wspólnym dzielnikiem licznika i mianownika.",
    guidingQuestion: "Czy obie liczby dzielą się przez wybrany dzielnik bez reszty?",
    visualHint: "Sprawdź grupy sąsiednich części. Każda grupa musi zawierać tę samą całkowitą liczbę części.",
    analogousExample: "18 i 24 można podzielić przez 6, ale nie można utworzyć całych grup po 5 części.",
  },
  [FRACTION_EQUIVALENCE_REASON_CODE]: {
    area: "Brakuje uzasadnienia, że wartość ułamka pozostała niezmieniona.",
    guidingQuestion: "Jaką samą liczbą zmieniono licznik i mianownik?",
    visualHint: "Wskaż parę mnożników albo dzielników i dopisz, że punkt na osi nie zmienił miejsca.",
    analogousExample: "4/9 = 12/27, ponieważ licznik i mianownik pomnożono przez 3, więc wartość się nie zmieniła.",
  },
};

const CUSTOM_META: Record<
  Exclude<FractionEquivalenceDiagnosticCode, FractionFeedbackCode>,
  { status: "incorrect" | "partially-correct"; score: number; maxScore: number; symbol: string; accent: DiagnosticHighlightAccent }
> = {
  [FRACTION_DIFFERENT_FACTORS_CODE]: { status: "incorrect", score: 0, maxScore: 3, symbol: "≠", accent: "violet" },
  [FRACTION_ONE_SIDED_OPERATION_CODE]: { status: "incorrect", score: 0, maxScore: 3, symbol: "↕", accent: "indigo" },
  [FRACTION_NON_INTEGER_DIVISOR_CODE]: { status: "incorrect", score: 0, maxScore: 3, symbol: "÷", accent: "amber" },
  [FRACTION_EQUIVALENCE_REASON_CODE]: { status: "partially-correct", score: 2, maxScore: 3, symbol: "?", accent: "cyan" },
};

function isCustomDiagnostic(
  code: FractionEquivalenceDiagnosticCode,
): code is Exclude<FractionEquivalenceDiagnosticCode, FractionFeedbackCode> {
  return code in CUSTOM_COPY;
}

export function createFractionEquivalenceDiagnosticResult(
  code: FractionEquivalenceDiagnosticCode,
  memberIds: string[] = ["numerator", "denominator"],
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  if (!isCustomDiagnostic(code)) {
    return createFractionDiagnosticResult(code, { maxScore: 3, memberIds });
  }
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
      kind: code === FRACTION_EQUIVALENCE_REASON_CODE ? "field" : "pair",
      memberIds,
      label: CUSTOM_COPY[code].area,
      state: "attention",
      pattern: code === FRACTION_DIFFERENT_FACTORS_CODE ? "double" : "dashed",
      symbol: meta.symbol,
      accent: meta.accent,
    }],
  };
}

export const FRACTION_EQUIVALENCE_FEEDBACK_KEYS: readonly FractionEquivalenceDiagnosticCode[] = [
  FRACTION_FEEDBACK_CODES.emptyPart,
  FRACTION_FEEDBACK_CODES.zeroDenominator,
  FRACTION_FEEDBACK_CODES.notEquivalent,
  FRACTION_FEEDBACK_CODES.notSimplified,
  FRACTION_FEEDBACK_CODES.wrongOperationPair,
  FRACTION_DIFFERENT_FACTORS_CODE,
  FRACTION_ONE_SIDED_OPERATION_CODE,
  FRACTION_NON_INTEGER_DIVISOR_CODE,
  FRACTION_EQUIVALENCE_REASON_CODE,
];
