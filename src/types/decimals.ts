import type { DiagnosticHighlightTarget, LessonGradeResult } from "@/types/diagnosticFeedback";
import type { LessonDifficulty } from "@/types/lessonPackage";

export type DecimalDigit = "" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/** Dokładna wartość: sign × coefficient × 10^-scale. coefficient nie ma znaku. */
export interface DecimalValue {
  sign: -1 | 1;
  coefficient: string;
  scale: number;
}

/** Ślad zapisu ucznia; zera końcowe są celowo zachowane. */
export interface DecimalInputTrace {
  rawInput: string;
  display: string;
  separator: "," | "." | null;
  integerDigits: string;
  fractionDigits: string;
  leadingZeroCount: number;
  trailingZeroCount: number;
}

export type DecimalParserErrorCode =
  | "DEC_EMPTY"
  | "DEC_INVALID_FORMAT"
  | "DEC_MULTIPLE_SEPARATORS"
  | "DEC_UNSAFE_RANGE";

export type DecimalParseResult =
  | { ok: true; value: DecimalValue; trace: DecimalInputTrace }
  | { ok: false; error: { code: DecimalParserErrorCode; message: string; input: string } };

export const DECIMAL_FEEDBACK_CODES = {
  empty: "DEC_EMPTY",
  commaMisaligned: "DEC_COMMA_MISALIGNED",
  placeValue: "DEC_PLACE_VALUE",
  trailingZeroValue: "DEC_TRAILING_ZERO_VALUE",
  missingZero: "DEC_MISSING_ZERO",
  productPlaces: "DEC_PRODUCT_PLACES",
  partialProductShift: "DEC_PARTIAL_PRODUCT_SHIFT",
  divisorScale: "DEC_DIVISOR_SCALE",
  estimateRange: "DEC_ESTIMATE_RANGE",
  unitMismatch: "DEC_UNIT_MISMATCH",
} as const;

export type DecimalFeedbackCode =
  (typeof DECIMAL_FEEDBACK_CODES)[keyof typeof DECIMAL_FEEDBACK_CODES];

export type DecimalUnitDimension =
  | "none"
  | "length"
  | "mass"
  | "volume"
  | "currency"
  | "area";

export type DecimalUnitId =
  | "none"
  | "mm" | "cm" | "dm" | "m" | "km"
  | "mg" | "g" | "dag" | "kg" | "t"
  | "ml" | "l"
  | "gr" | "zł"
  | "mm²" | "cm²" | "dm²" | "m²";

export interface DecimalUnitDefinition {
  id: DecimalUnitId;
  label: string;
  dimension: DecimalUnitDimension;
  /** Potęga dziesięciu względem jednostki bazowej danego wymiaru. */
  base10Exponent: number;
  aliases: readonly string[];
}

export type DecimalUnitParseResult =
  | { ok: true; unit: DecimalUnitDefinition }
  | { ok: false; error: { code: "DEC_UNIT_MISMATCH"; message: string; input: string } };

export type DecimalPlaceId =
  | "thousands" | "hundreds" | "tens" | "ones"
  | "tenths" | "hundredths" | "thousandths" | "ten-thousandths";

export interface DecimalPlaceDefinition {
  id: DecimalPlaceId;
  label: string;
  shortLabel: string;
  power: number;
}

export type DecimalPlaceValueState = Partial<Record<DecimalPlaceId, DecimalDigit>>;

export interface DecimalColumnCell {
  id: string;
  digit: DecimalDigit;
  placePower: number;
  auxiliaryZero?: boolean;
}

export interface DecimalAddSubExchange {
  columnPower: number;
  kind: "carry" | "borrow";
  from: number;
  to: number;
  label: string;
}

export interface DecimalWrittenAddSubModel {
  operation: "add" | "subtract";
  operands: [DecimalParseResult & { ok: true }, DecimalParseResult & { ok: true }];
  columns: number[];
  rows: DecimalColumnCell[][];
  result: DecimalColumnCell[];
  commaAfterPower: 0;
  exchanges: DecimalAddSubExchange[];
}

export interface DecimalMultiplyPair {
  id: string;
  symbol: string;
  topDigit: string;
  bottomDigit: string;
  topIndex: number;
  bottomIndex: number;
  topPower: number;
  bottomPower: number;
  targetColumn: number;
  product: number;
}

export interface DecimalPartialProduct {
  id: string;
  multiplierDigit: string;
  shift: number;
  digits: string;
}

export interface DecimalAdditionColumn {
  column: number;
  digits: number[];
  carryIn: number;
  resultDigit: number;
  carryOut: number;
}

export interface DecimalWrittenMultiplyModel {
  top: DecimalParseResult & { ok: true };
  bottom: DecimalParseResult & { ok: true };
  integerTop: string;
  integerBottom: string;
  pairs: DecimalMultiplyPair[];
  partialProducts: DecimalPartialProduct[];
  additionColumns: DecimalAdditionColumn[];
  product: DecimalValue;
  productDisplay: string;
  productPlaces: number;
}

export interface DecimalWrittenDivideModel {
  dividend: DecimalParseResult & { ok: true };
  divisor: DecimalParseResult & { ok: true };
  scalePower: number;
  scaledDividend: DecimalValue;
  scaledDivisor: DecimalValue;
  scaledDividendDisplay: string;
  scaledDivisorDisplay: string;
  quotient: DecimalValue | null;
  quotientDisplay: string | null;
  appendedZeros: number;
}

export interface DecimalStrategyTrace {
  commaAligned?: boolean;
  placedDigits?: Partial<Record<DecimalPlaceId, DecimalDigit>>;
  exchanges?: Array<{ columnPower: number; kind: "carry" | "borrow" }>;
  claimsTrailingZeroChangesValue?: boolean;
  auxiliaryZeros?: string[];
  productPlaces?: number;
  partialProductShifts?: number[];
  partialProducts?: string[];
  additionColumns?: Array<{ column: number; resultDigit: number; carryOut: number }>;
  divisionScalePower?: number;
  scaledDividend?: string;
  scaledDivisor?: string;
  estimate?: { minimum: string; maximum: string };
}

export interface DecimalStudentAnswer {
  value: string;
  unit?: string;
  strategy?: DecimalStrategyTrace;
}

export type DecimalGeneratorTask =
  | "place-value" | "add" | "subtract" | "multiply" | "divide" | "unit";

export interface DecimalGeneratorConfig {
  task: DecimalGeneratorTask;
  decimalPlacesMin: number;
  decimalPlacesMax: number;
  integerDigitsMax: number;
  maximumValue: number;
  units?: DecimalUnitId[];
  skillIds: string[];
}

export interface DecimalPublicQuestionParams {
  operands: string[];
  operator: "+" | "−" | "×" | ":" | "place" | "convert";
  prompt: string;
  sourceUnit: DecimalUnitId;
  requiredUnit: DecimalUnitId;
  decimalPlaces: number[];
  maximumValue: number;
}

/** Publiczny payload nie ma answerSpec ani oczekiwanej strategii. */
export interface DecimalPublicQuestion {
  generatorId: "decimal-foundation";
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  params: DecimalPublicQuestionParams;
  skillIds: string[];
  renderMode: "decimal-place-grid" | "decimal-written-operation";
  invariants: readonly [
    "comma-independent-of-locale",
    "trailing-zero-trace-preserved",
    "empty-is-not-zero",
    "answer-spec-server-only",
  ];
}

export interface DecimalAnswerSpec {
  expected: DecimalValue;
  expectedDisplay: string;
  expectedUnit: DecimalUnitId;
  strategy: DecimalStrategyTrace;
  allowEquivalentTrailingZeros: boolean;
  minimum?: DecimalValue;
  maximum?: DecimalValue;
  maxScore: number;
}

export interface GeneratedDecimalQuestion {
  publicQuestion: DecimalPublicQuestion;
  answerSpec: DecimalAnswerSpec;
}

export interface DecimalDiagnosticPresentation {
  result: LessonGradeResult;
  highlights: DiagnosticHighlightTarget[];
}
