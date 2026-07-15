import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { FractionFeedbackCode } from "@/types/fractions";

const COPY: Record<FractionFeedbackCode, DiagnosticFeedbackCopy> = {
  FRA_EMPTY_PART: {
    area: "Jedna z części zapisu ułamka jest pusta.",
    guidingQuestion: "Której liczby jeszcze brakuje: części całkowitej, licznika czy mianownika?",
    visualHint: "Sprawdź kratkę oznaczoną symbolem □. Licznik jest nad kreską, a mianownik pod nią.",
    analogousExample: "W zapisie 3/5 liczba 3 trafia nad kreskę, a 5 pod kreskę.",
  },
  FRA_ZERO_DENOMINATOR: {
    area: "Na zero części nie można podzielić całości.",
    guidingQuestion: "Na ile części można podzielić całość? Czy może to być zero części?",
    visualHint: "Mianownik pozostaje widoczny, ale kratka z zerem ma obrys ostrzegawczy.",
    analogousExample: "Dwie z pięciu części zapisujemy jako 2/5. Na zero części nie można podzielić całości.",
  },
  FRA_NUM_DEN_SWAPPED: {
    area: "Licznik i mianownik opisują inne elementy modelu.",
    guidingQuestion: "Która liczba mówi, ile części zaznaczono, a która — na ile podzielono całość?",
    visualHint: "Połącz etykietę „ile zaznaczono” z licznikiem oraz „na ile podzielono” z mianownikiem.",
    analogousExample: "Gdy zaznaczono 2 z 7 równych części, zapis ma postać 2/7, nie 7/2.",
  },
  FRA_NOT_EQUIVALENT: {
    area: "Wartość ułamka zmieniła się podczas skracania albo rozszerzania.",
    guidingQuestion: "Czy licznik i mianownik zostały pomnożone albo podzielone przez tę samą liczbę?",
    visualHint: "Dwa mnożniki lub dzielniki są połączone tym samym symbolem. Porównaj je.",
    analogousExample: "Dla 2/3 mnożymy obie liczby przez 2 i otrzymujemy 4/6.",
  },
  FRA_NOT_SIMPLIFIED: {
    area: "Wartość wyniku jest poprawna, ale ułamek można jeszcze skrócić.",
    guidingQuestion: "Jaki wspólny dzielnik większy od 1 mają licznik i mianownik?",
    visualHint: "Podświetlona para wskazuje liczby, które można podzielić przez ten sam dzielnik.",
    analogousExample: "6/8 ma tę samą wartość co 3/4 po podzieleniu obu liczb przez 2.",
  },
  FRA_WRONG_OPERATION_PAIR: {
    area: "Połączono kratki, które nie tworzą aktywnej pary tego kroku.",
    guidingQuestion: "Które dwie liczby powinny zostać teraz pomnożone, podzielone albo porównane?",
    visualHint: "Pozostałe pola są wygaszone, a aktywna para ma wspólny symbol i wzór linii.",
    analogousExample: "Przy mnożeniu liczniki tworzą jedną parę, a mianowniki drugą parę.",
  },
  FRA_UNEQUAL_PARTS: {
    area: "Całość została podzielona na części o różnych rozmiarach.",
    guidingQuestion: "Czy każda część zajmuje dokładnie tyle samo miejsca?",
    visualHint: "Porównaj szerokości części. Wszystkie granice powinny wypadać w równych odstępach.",
    analogousExample: "Cztery ćwiartki powstają po podziale całości na cztery równe części.",
  },
  FRA_WHOLE_MISMATCH: {
    area: "Porównywane ułamki odnoszą się do całości o różnych rozmiarach.",
    guidingQuestion: "Czy oba modele pokazują taką samą całość?",
    visualHint: "Wyrównaj obrysy modeli i sprawdź, czy mają tę samą długość lub średnicę.",
    analogousExample: "Połowa dwóch jednakowych pasków ma tę samą wielkość; połowy różnych pasków nie muszą.",
  },
};

export function fractionDiagnosticCopy(code: FractionFeedbackCode): DiagnosticFeedbackCopy {
  return COPY[code];
}

function target(
  id: string,
  memberIds: string[],
  label: string,
  options: Pick<DiagnosticHighlightTarget, "kind" | "state" | "pattern" | "symbol" | "accent">,
): DiagnosticHighlightTarget {
  return { id, memberIds, label, ...options };
}

export function fractionDiagnosticHighlights(
  code: FractionFeedbackCode,
  memberIds?: string[],
): DiagnosticHighlightTarget[] {
  if (code === FRACTION_FEEDBACK_CODES.emptyPart) {
    return [target("fraction-empty", memberIds ?? ["numerator", "denominator"], "Brakująca część ułamka", {
      kind: "field", state: "attention", pattern: "dashed", symbol: "□", accent: "amber",
    })];
  }
  if (code === FRACTION_FEEDBACK_CODES.zeroDenominator) {
    return [target("fraction-zero-denominator", memberIds ?? ["denominator"], "Mianownik równy zero", {
      kind: "field", state: "attention", pattern: "double", symbol: "0", accent: "amber",
    })];
  }
  if (code === FRACTION_FEEDBACK_CODES.numeratorDenominatorSwapped) {
    return [
      target("fraction-selected", memberIds?.slice(0, 1) ?? ["numerator"], "Ile części zaznaczono", {
        kind: "field", state: "attention", pattern: "solid", symbol: "●", accent: "cyan",
      }),
      target("fraction-divided", memberIds?.slice(1, 2) ?? ["denominator"], "Na ile części podzielono", {
        kind: "field", state: "attention", pattern: "dashed", symbol: "◆", accent: "violet",
      }),
    ];
  }
  if (code === FRACTION_FEEDBACK_CODES.notEquivalent) {
    return [target("fraction-equivalence-pair", memberIds ?? ["numerator-factor", "denominator-factor"], "Mnożniki lub dzielniki muszą być takie same", {
      kind: "pair", state: "attention", pattern: "double", symbol: "=", accent: "violet",
    })];
  }
  if (code === FRACTION_FEEDBACK_CODES.notSimplified) {
    return [target("fraction-common-divisor", memberIds ?? ["numerator", "denominator"], "Para ze wspólnym dzielnikiem", {
      kind: "pair", state: "active", pattern: "dotted", symbol: "÷", accent: "cyan",
    })];
  }
  if (code === FRACTION_FEEDBACK_CODES.unequalParts) {
    return [target("fraction-unequal-parts", memberIds ?? ["partition"], "Części o różnych rozmiarach", {
      kind: "field", state: "attention", pattern: "dashed", symbol: "≠", accent: "amber",
    })];
  }
  if (code === FRACTION_FEEDBACK_CODES.wholeMismatch) {
    return [target("fraction-whole-mismatch", memberIds ?? ["whole-left", "whole-right"], "Różne całości", {
      kind: "pair", state: "attention", pattern: "double", symbol: "↔", accent: "violet",
    })];
  }
  return [target("fraction-operation-pair", memberIds ?? ["active-left", "active-right"], "Aktywna para działania", {
    kind: "pair", state: "attention", pattern: "dashed", symbol: "↔", accent: "indigo",
  })];
}

export function createFractionDiagnosticResult(
  code: FractionFeedbackCode,
  options: { maxScore?: number; memberIds?: string[] } = {},
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  const maxScore = options.maxScore ?? (code === FRACTION_FEEDBACK_CODES.notSimplified ? 2 : 1);
  const partiallyCorrect = code === FRACTION_FEEDBACK_CODES.notSimplified && maxScore > 1;
  return {
    result: createLessonGradeResult({
      status: partiallyCorrect ? "partially-correct" : "incorrect",
      score: partiallyCorrect ? maxScore - 1 : 0,
      maxScore,
      errorCodes: [code],
      feedbackKey: `fraction.${code.toLocaleLowerCase("en-US")}`,
    }),
    copy: fractionDiagnosticCopy(code),
    highlights: fractionDiagnosticHighlights(code, options.memberIds),
  };
}
