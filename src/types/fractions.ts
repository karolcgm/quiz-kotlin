import type {
  DiagnosticHighlightTarget,
  LessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Ułamek o mianowniku dodatnim. Postać nie musi być skrócona. */
export interface FractionValue {
  numerator: number;
  denominator: number;
}

/** Kanoniczna, skrócona postać ułamka z mianownikiem dodatnim. */
export interface NormalizedFraction extends FractionValue {
  readonly normalized: true;
}

export interface MixedFractionValue {
  wholePart: number;
  numerator: number;
  denominator: number;
}

export const FRACTION_FEEDBACK_CODES = {
  emptyPart: "FRA_EMPTY_PART",
  zeroDenominator: "FRA_ZERO_DENOMINATOR",
  numeratorDenominatorSwapped: "FRA_NUM_DEN_SWAPPED",
  notEquivalent: "FRA_NOT_EQUIVALENT",
  notSimplified: "FRA_NOT_SIMPLIFIED",
  wrongOperationPair: "FRA_WRONG_OPERATION_PAIR",
  unequalParts: "FRA_UNEQUAL_PARTS",
  wholeMismatch: "FRA_WHOLE_MISMATCH",
} as const;

export type FractionFeedbackCode =
  (typeof FRACTION_FEEDBACK_CODES)[keyof typeof FRACTION_FEEDBACK_CODES];

export type FractionParserErrorCode =
  | Extract<FractionFeedbackCode, "FRA_EMPTY_PART" | "FRA_ZERO_DENOMINATOR">
  | "FRA_AMBIGUOUS_INPUT"
  | "FRA_INVALID_FORMAT"
  | "FRA_UNSAFE_INTEGER";

export interface FractionParserError {
  code: FractionParserErrorCode;
  message: string;
  part?: "whole" | "numerator" | "denominator" | "fraction";
  input: string;
}

export type ParsedFractionKind = "fraction" | "mixed" | "integer";

export type FractionParseResult =
  | {
      ok: true;
      kind: ParsedFractionKind;
      input: string;
      /** Wartość przed skróceniem, potrzebna m.in. do oceny wymaganej postaci. */
      value: FractionValue;
      normalized: NormalizedFraction;
    }
  | {
      ok: false;
      error: FractionParserError;
    };

/** Jedna kratka przechowuje dokładnie jedną cyfrę albo pozostaje pusta. */
export type FractionDigit = "" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export interface FractionStackValue {
  wholePart?: FractionDigit[];
  numerator: FractionDigit[];
  denominator: FractionDigit[];
}

export interface FractionDiagnosticPresentation {
  result: LessonGradeResult;
  highlights: DiagnosticHighlightTarget[];
}

export type FractionGeneratorTask =
  | "represent"
  | "simplify"
  | "convert-to-mixed"
  | "write-equivalent";

export interface FractionGeneratorConfig {
  task: FractionGeneratorTask;
  denominatorMin: number;
  denominatorMax: number;
  /** Maksymalna liczba pełnych całości dla ułamka niewłaściwego/liczby mieszanej. */
  wholeMax?: number;
  /** Mnożnik używany przez zadania o ułamkach równoważnych. */
  equivalentMultiplierMax?: number;
  requireSimplified?: boolean;
  skillIds: string[];
}

export interface FractionPublicQuestionParams {
  source: FractionValue;
  sourceLabel: string;
  prompt: string;
  responseFormat: "fraction" | "mixed-or-improper";
  showWholePart: boolean;
  digitLimit: number;
}

/** Kontrakt, który może zostać zserializowany do klienta. Nie ma pola answerSpec. */
export interface FractionPublicQuestion {
  generatorId: "fraction-foundation";
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  params: FractionPublicQuestionParams;
  skillIds: string[];
  renderMode: "fraction-stack";
  invariants: readonly [
    "positive-non-zero-denominator",
    "value-preserved-between-representations",
    "empty-is-not-zero",
  ];
}

/** Prywatny kontrakt walidatora. Ten typ nie jest częścią publicznego pytania. */
export interface FractionAnswerSpec {
  expected: FractionValue;
  allowEquivalent: boolean;
  requireSimplified: boolean;
  expectedFormat: "fraction" | "mixed-or-improper";
  maxScore: number;
}

export interface GeneratedFractionQuestion {
  publicQuestion: FractionPublicQuestion;
  answerSpec: FractionAnswerSpec;
}
