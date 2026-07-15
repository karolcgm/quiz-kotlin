/** Wspólny kontrakt diagnostyki odpowiedzi — WP-CONTEXT-03. */

export type LessonGradeStatus =
  | "correct"
  | "partially-correct"
  | "incorrect"
  | "manual-review";

export interface LessonGradeResult {
  status: LessonGradeStatus;
  score: number;
  maxScore: number;
  errorCodes: string[];
  feedbackKey: string;
  /** Dane wyłącznie dla walidatora/serwera. Nie wolno ich serializować do klienta. */
  normalizedAnswer?: unknown;
}

export type PublicLessonGradeResult = Omit<LessonGradeResult, "normalizedAnswer">;

export type DiagnosticActivityMode = "practice" | "assessment";

export interface LessonQuestionFeedbackPolicy {
  mode: DiagnosticActivityMode;
  allowsPartialCredit: boolean;
  manualReview: "never" | "possible" | "required";
  /** Stabilne klucze tekstów, nigdy treść answerSpec ani poprawna odpowiedź. */
  feedbackKeys: string[];
}

export type DiagnosticHighlightKind = "field" | "pair" | "edge" | "vertex";
export type DiagnosticHighlightState = "active" | "correct" | "attention" | "crossed-out";
export type DiagnosticHighlightPattern = "solid" | "dashed" | "dotted" | "double";
export type DiagnosticHighlightAccent = "indigo" | "amber" | "cyan" | "violet";

/**
 * Serializowalny opis warstwy wskazania. `label` jest obowiązkową alternatywą
 * tekstową dla koloru, wzoru linii i położenia na modelu.
 */
export interface DiagnosticHighlightTarget {
  id: string;
  kind: DiagnosticHighlightKind;
  memberIds: string[];
  label: string;
  state: DiagnosticHighlightState;
  pattern: DiagnosticHighlightPattern;
  symbol: string;
  accent: DiagnosticHighlightAccent;
}

export interface DiagnosticFeedbackCopy {
  /** Krok 1: wskazanie miejsca wymagającego uwagi. */
  area: string;
  /** Krok 2: pytanie naprowadzające. */
  guidingQuestion: string;
  /** Krok 3: opis podpowiedzi wizualnej. */
  visualHint: string;
  /** Krok 4: analogiczny przykład z innymi danymi. */
  analogousExample: string;
}

export interface DiagnosticSolution {
  /** Krok 5: rozwiązanie udostępniane osobnym żądaniem. */
  steps: string[];
}

export interface DiagnosticFeedbackDelivery {
  result: PublicLessonGradeResult;
  copy: DiagnosticFeedbackCopy;
  highlights: DiagnosticHighlightTarget[];
  /** Nie występuje w payloadzie oceniania przed oddaniem. */
  solution?: DiagnosticSolution;
}
