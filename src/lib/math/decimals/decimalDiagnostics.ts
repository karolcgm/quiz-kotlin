import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { DiagnosticFeedbackCopy, DiagnosticHighlightTarget, LessonGradeResult } from "@/types/diagnosticFeedback";

const COPY: Record<DecimalFeedbackCode, DiagnosticFeedbackCopy> = {
  DEC_EMPTY: {
    area: "W zapisie pozostała pusta kratka albo brakuje całej liczby.",
    guidingQuestion: "Jaką wartość pozycyjną ma dokładnie to puste miejsce?",
    visualHint: "Pusta kratka ma symbol □ i podpis swojej kolumny. Nie zamieniam jej automatycznie na zero.",
    analogousExample: "W 4,05 zero w kolumnie części dziesiątych jest cyfrą, a pusta kratka nadal oznacza brak odpowiedzi.",
  },
  DEC_COMMA_MISALIGNED: {
    area: "Przecinki składników nie leżą w jednej pionowej kolumnie.",
    guidingQuestion: "Które cyfry są jednościami w obu liczbach?",
    visualHint: "Pionowa prowadnica łączy oba przecinki i przecinek wyniku.",
    analogousExample: "W działaniu 2,45 + 1,3 jedności 2 i 1 ustawiamy w tej samej kolumnie.",
  },
  DEC_PLACE_VALUE: {
    area: "Cyfra trafiła do kolumny o innej wartości pozycyjnej.",
    guidingQuestion: "Ile jest warta ta cyfra w aktualnej kolumnie?",
    visualHint: "Nagłówek podświetlonej kolumny nazywa pozycję, a odczyt pod tabelą mówi całą liczbę.",
    analogousExample: "Cyfra 4 w 0,04 oznacza cztery setne, a w 0,4 — cztery dziesiąte.",
  },
  DEC_TRAILING_ZERO_VALUE: {
    area: "Zero końcowe zmieniło zapis, ale nie wartość liczby.",
    guidingQuestion: "Czy 2,5 i 2,50 wskazują różne punkty na osi?",
    visualHint: "Oba zapisy są nałożone na ten sam punkt osi i te same kolumny tabeli.",
    analogousExample: "0,7 = 0,70, bo siedem dziesiątych to siedemdziesiąt setnych.",
  },
  DEC_MISSING_ZERO: {
    area: "Brakuje zera wiodącego albo zera pomocniczego w zapisie działania.",
    guidingQuestion: "Co oznacza pusta pozycja przed pierwszą cyfrą albo po ostatniej cyfrze?",
    visualHint: "Wskazana pozycja ma etykietę „zero pomocnicze” do czasu zatwierdzenia.",
    analogousExample: "Czterdzieści pięć setnych zapisujemy 0,45, nie ,45.",
  },
  DEC_PRODUCT_PLACES: {
    area: "Liczba miejsc po przecinku w iloczynie nie zgadza się z czynnikami.",
    guidingQuestion: "Ile łącznie cyfr znajduje się po przecinku w obu czynnikach?",
    visualHint: "Nawias obejmuje cyfry po przecinku w pierwszym i drugim czynniku oraz tyle samo pól wyniku.",
    analogousExample: "1,2 × 0,35 ma 1 + 2 = 3 miejsca po przecinku w wyniku.",
  },
  DEC_PARTIAL_PRODUCT_SHIFT: {
    area: "Iloczyn częściowy zaczyna się w niewłaściwej kolumnie.",
    guidingQuestion: "Jaką pozycję ma cyfra mnożnika, której używasz w tym wierszu?",
    visualHint: "Łącznik prowadzi od cyfry mnożnika do właściwej kolumny startowej iloczynu częściowego.",
    analogousExample: "W drugim wierszu mnożenia przez cyfrę dziesiątek iloczyn zaczyna się o jedną kolumnę dalej.",
  },
  DEC_DIVISOR_SCALE: {
    area: "Skalowanie objęło tylko dzielną albo tylko dzielnik.",
    guidingQuestion: "Przez jaką samą potęgę 10 trzeba pomnożyć obie liczby?",
    visualHint: "Wspólny nawias ×10 lub ×100 obejmuje dzielną i dzielnik.",
    analogousExample: "6 : 0,2 = 60 : 2, bo obie liczby mnożymy przez 10.",
  },
  DEC_ESTIMATE_RANGE: {
    area: "Wynik leży poza wcześniej oszacowanym przedziałem.",
    guidingQuestion: "Czy przecinek i rząd wielkości pasują do oszacowania?",
    visualHint: "Przedział pozostaje widoczny, a wynik jest zaznaczony obok niego bez kasowania rachunku.",
    analogousExample: "2,1 × 3,9 jest blisko 2 × 4, więc wynik powinien być blisko 8.",
  },
  DEC_UNIT_MISMATCH: {
    area: "Wartość liczby może być poprawna, ale wybrano jednostkę innego wymiaru albo inną niż wymagana.",
    guidingQuestion: "Czy zadanie dotyczy długości, masy, objętości, pieniędzy czy pola?",
    visualHint: "Pole liczby i wybór jednostki są oceniane osobno; podświetlony jest tylko wybór jednostki.",
    analogousExample: "Długość zapisujemy w cm lub m, a masę w g lub kg.",
  },
};

export function decimalDiagnosticCopy(code: DecimalFeedbackCode): DiagnosticFeedbackCopy {
  return COPY[code];
}

function target(code: DecimalFeedbackCode, memberIds?: string[]): DiagnosticHighlightTarget {
  const presentations: Record<DecimalFeedbackCode, Pick<DiagnosticHighlightTarget, "kind" | "pattern" | "symbol" | "accent" | "label">> = {
    DEC_EMPTY: { kind: "field", pattern: "dashed", symbol: "□", accent: "amber", label: "Dokładna pusta kratka" },
    DEC_COMMA_MISALIGNED: { kind: "pair", pattern: "double", symbol: ",", accent: "violet", label: "Przecinki do ustawienia w pionie" },
    DEC_PLACE_VALUE: { kind: "field", pattern: "solid", symbol: "P", accent: "cyan", label: "Kolumna wartości pozycyjnej" },
    DEC_TRAILING_ZERO_VALUE: { kind: "pair", pattern: "double", symbol: "=", accent: "indigo", label: "Równe wartości na osi" },
    DEC_MISSING_ZERO: { kind: "field", pattern: "dotted", symbol: "0", accent: "amber", label: "Potrzebne zero" },
    DEC_PRODUCT_PLACES: { kind: "pair", pattern: "dashed", symbol: "Σ", accent: "violet", label: "Miejsca po przecinku w czynnikach i wyniku" },
    DEC_PARTIAL_PRODUCT_SHIFT: { kind: "pair", pattern: "dotted", symbol: "↘", accent: "cyan", label: "Cyfra mnożnika i kolumna startowa" },
    DEC_DIVISOR_SCALE: { kind: "pair", pattern: "double", symbol: "×10", accent: "violet", label: "Wspólna skala dzielnej i dzielnika" },
    DEC_ESTIMATE_RANGE: { kind: "field", pattern: "dashed", symbol: "≈", accent: "amber", label: "Oszacowany przedział" },
    DEC_UNIT_MISMATCH: { kind: "field", pattern: "solid", symbol: "j.", accent: "cyan", label: "Wybór jednostki" },
  };
  const presentation = presentations[code];
  return {
    id: `decimal-${code.toLocaleLowerCase("en-US")}`,
    memberIds: memberIds ?? [code === DECIMAL_FEEDBACK_CODES.unitMismatch ? "unit" : "decimal-workspace"],
    state: "attention",
    ...presentation,
  };
}

export function decimalDiagnosticHighlights(code: DecimalFeedbackCode, memberIds?: string[]): DiagnosticHighlightTarget[] {
  return [target(code, memberIds)];
}

export function createDecimalDiagnosticResult(
  code: DecimalFeedbackCode,
  options: { maxScore?: number; partial?: boolean; memberIds?: string[] } = {},
): { result: LessonGradeResult; copy: DiagnosticFeedbackCopy; highlights: DiagnosticHighlightTarget[] } {
  const maxScore = options.maxScore ?? 1;
  const partial = Boolean(options.partial && maxScore > 1);
  return {
    result: createLessonGradeResult({
      status: partial ? "partially-correct" : "incorrect",
      score: partial ? maxScore - 1 : 0,
      maxScore,
      errorCodes: [code],
      feedbackKey: `decimal.${code.toLocaleLowerCase("en-US")}`,
    }),
    copy: decimalDiagnosticCopy(code),
    highlights: decimalDiagnosticHighlights(code, options.memberIds),
  };
}
