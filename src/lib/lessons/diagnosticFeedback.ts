import type {
  DiagnosticActivityMode,
  DiagnosticFeedbackCopy,
  DiagnosticFeedbackDelivery,
  DiagnosticHighlightKind,
  DiagnosticHighlightState,
  DiagnosticHighlightTarget,
  DiagnosticSolution,
  LessonGradeResult,
  PublicLessonGradeResult,
} from "@/types/diagnosticFeedback";

const STANDALONE_FORBIDDEN_MESSAGES = new Set([
  "źle",
  "błąd",
  "spróbuj ponownie",
  "spróbuj jeszcze raz",
]);

function normalizedMessage(message: string): string {
  return message
    .trim()
    .toLocaleLowerCase("pl-PL")
    .replace(/[.!?…]+$/u, "")
    .trim();
}

export function isStandaloneForbiddenFeedback(message: string): boolean {
  return STANDALONE_FORBIDDEN_MESSAGES.has(normalizedMessage(message));
}

export function assertDiagnosticMessage(message: string, fieldName = "feedback"): void {
  if (!message.trim()) {
    throw new Error(`${fieldName} nie może być pusty.`);
  }
  if (isStandaloneForbiddenFeedback(message)) {
    throw new Error(`${fieldName} musi wskazywać obszar lub następny krok, nie tylko „${message.trim()}”.`);
  }
}

export function assertDiagnosticFeedbackCopy(copy: DiagnosticFeedbackCopy): void {
  assertDiagnosticMessage(copy.area, "Wskazanie obszaru");
  assertDiagnosticMessage(copy.guidingQuestion, "Pytanie naprowadzające");
  assertDiagnosticMessage(copy.visualHint, "Podpowiedź wizualna");
  assertDiagnosticMessage(copy.analogousExample, "Przykład analogiczny");
}

export function createLessonGradeResult(result: LessonGradeResult): LessonGradeResult {
  if (!Number.isFinite(result.score) || !Number.isFinite(result.maxScore) || result.maxScore <= 0) {
    throw new Error("Punktacja feedbacku musi być skończona, a maxScore dodatni.");
  }
  if (result.score < 0 || result.score > result.maxScore) {
    throw new Error("score musi mieścić się w zakresie od 0 do maxScore.");
  }
  if (!result.feedbackKey.trim()) {
    throw new Error("feedbackKey nie może być pusty.");
  }
  if (result.errorCodes.some((code) => !code.trim())) {
    throw new Error("errorCodes nie mogą zawierać pustych kodów.");
  }
  if (result.status === "correct" && (result.score !== result.maxScore || result.errorCodes.length > 0)) {
    throw new Error("Status correct wymaga pełnego wyniku i pustej listy errorCodes.");
  }
  if (result.status === "partially-correct" && !(result.score > 0 && result.score < result.maxScore)) {
    throw new Error("Status partially-correct wymaga wyniku większego od 0 i mniejszego od maxScore.");
  }
  if (result.status === "incorrect" && result.score !== 0) {
    throw new Error("Niezerowy wynik błędnej odpowiedzi należy oznaczyć jako partially-correct.");
  }
  if (result.status !== "correct" && result.errorCodes.length === 0) {
    throw new Error("Wynik inny niż correct wymaga co najmniej jednego kodu diagnostycznego.");
  }
  return result;
}

/** Usuwa z wyniku dane normalizowane, które mogą zawierać klucz odpowiedzi. */
export function toPublicLessonGradeResult(result: LessonGradeResult): PublicLessonGradeResult {
  const validated = createLessonGradeResult(result);
  return {
    status: validated.status,
    score: validated.score,
    maxScore: validated.maxScore,
    errorCodes: [...validated.errorCodes],
    feedbackKey: validated.feedbackKey,
  };
}

export function canDeliverDiagnosticSolution(input: {
  mode: DiagnosticActivityMode;
  submitted: boolean;
  assessmentEnded?: boolean;
}): boolean {
  return input.mode === "practice" || input.submitted || input.assessmentEnded === true;
}

/**
 * Jedyna funkcja składająca publiczny feedback z rozwiązaniem. W ocenianiu
 * przed oddaniem całkowicie usuwa rozwiązanie z obiektu (nie ukrywa go CSS-em).
 */
export function buildDiagnosticFeedbackDelivery(input: {
  result: LessonGradeResult;
  copy: DiagnosticFeedbackCopy;
  highlights?: DiagnosticHighlightTarget[];
  solution?: DiagnosticSolution;
  mode: DiagnosticActivityMode;
  submitted: boolean;
  assessmentEnded?: boolean;
}): DiagnosticFeedbackDelivery {
  assertDiagnosticFeedbackCopy(input.copy);
  const delivery: DiagnosticFeedbackDelivery = {
    result: toPublicLessonGradeResult(input.result),
    copy: input.copy,
    highlights: input.highlights ?? [],
  };
  if (input.solution && canDeliverDiagnosticSolution(input)) {
    delivery.solution = input.solution;
  }
  return delivery;
}

const HIGHLIGHT_KIND_LABELS: Record<DiagnosticHighlightKind, string> = {
  field: "Pole",
  pair: "Para",
  edge: "Krawędź",
  vertex: "Wierzchołek",
};

const HIGHLIGHT_STATE_LABELS: Record<DiagnosticHighlightState, string> = {
  active: "aktywne",
  correct: "poprawne",
  attention: "do sprawdzenia",
  "crossed-out": "przekreślone",
};

export function diagnosticHighlightLabel(target: DiagnosticHighlightTarget): string {
  return `${HIGHLIGHT_KIND_LABELS[target.kind]}: ${target.label}. Stan: ${HIGHLIGHT_STATE_LABELS[target.state]}. Symbol: ${target.symbol}.`;
}

/** Atrybuty do nałożenia bezpośrednio na pole HTML albo element SVG modelu. */
export function diagnosticHighlightAttributes(target: DiagnosticHighlightTarget) {
  return {
    "aria-label": diagnosticHighlightLabel(target),
    "data-diagnostic-target": target.id,
    "data-diagnostic-kind": target.kind,
    "data-diagnostic-state": target.state,
    "data-diagnostic-pattern": target.pattern,
  } as const;
}
