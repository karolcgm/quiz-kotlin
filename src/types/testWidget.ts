import type { FactorTreeNode } from "@/lib/math/primeFactors";
import type { GradeLevel } from "@/types/curriculum";

export type TestSkill =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "fractions"
  | "geometry"
  | "measurement"
  | "algebra"
  | "statistics";

export interface NumberLineQuestionParams {
  start: number;
  change: number;
}

export type ArithmeticOperation = "add" | "subtract" | "multiply" | "divide";

export interface ArithmeticQuestionParams {
  left: number;
  right: number;
  operation: ArithmeticOperation;
}

export interface FractionPartQuestionParams {
  numerator: number;
  denominator: number;
}

export interface RectangleQuestionParams {
  width: number;
  height: number;
  ask: "area" | "perimeter";
}

export interface UnitConversionQuestionParams {
  value: number;
  fromUnit: "mm" | "cm" | "m" | "km";
  toUnit: "mm" | "cm" | "m" | "km";
}

export interface ComparisonQuestionParams {
  left: number;
  right: number;
  ask?: "sign" | "missingDigit";
  missingSide?: "left" | "right";
  /** Indeks ukrytej cyfry od lewej (0 = pierwsza cyfra). */
  missingIndex?: number;
}

export type RatioQuestionTarget = "total" | "left" | "right" | "simplify";

export interface RatioQuestionParams {
  partA: number;
  partB: number;
  ask: RatioQuestionTarget;
}

export type PolygonAsk = "name" | "perimeter" | "vertices" | "interiorAngle";

export interface PolygonQuestionParams {
  sides: number;
  sideLength: number;
  ask: PolygonAsk;
}

export interface NumberBondQuestionParams {
  whole: number;
  partA: number;
  partB: number;
  ask: "partA" | "partB" | "whole";
}

export interface ClockQuestionParams {
  hour: number;
  minute: number;
  ask: "hour" | "minute";
}

export interface ShapeSortQuestionParams {
  shape: "circle" | "triangle" | "square" | "rectangle";
}

export type SymmetryMotif = "butterfly" | "house" | "heart";

export type SymmetryAxisShape = "square" | "rectangle";

export interface SymmetryPictureQuestionParams {
  variant: "picture";
  motif: SymmetryMotif;
  mirroredCells: string[];
}

export interface SymmetryAxisQuestionParams {
  variant: "axis";
  shape: SymmetryAxisShape;
  axisPercent: number;
}

export interface PrimeFactorTreeQuestionParams {
  variant: "factor-tree";
  number: number;
  tree: FactorTreeNode;
}

export type TriangleClassificationAsk = "bySides" | "byAngles";

export interface TriangleClassificationQuestionParams {
  variant: "triangle-classify";
  ax: number;
  ay: number;
  bx: number;
  by: number;
  cx: number;
  cy: number;
  ask: TriangleClassificationAsk;
}

export type TriangleAngleSumAsk = "missingAngle";

export interface TriangleAngleSumQuestionParams {
  variant: "triangle-angle-sum";
  ax: number;
  ay: number;
  bx: number;
  by: number;
  cx: number;
  cy: number;
  hideAt: "A" | "B" | "C";
  ask: TriangleAngleSumAsk;
}

export interface AngleKindQuestionParams {
  variant: "angle-kind";
  degrees: number;
  ask: "classify";
}

export type IntersectingAnglesAsk = "vertical" | "adjacent" | "linearPair";

export interface IntersectingAnglesQuestionParams {
  variant: "intersecting-angles";
  degrees: number;
  ask: IntersectingAnglesAsk;
}

export type WordProblemFormula =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "sum3"
  | "missing_addend"
  | "groups"
  | "share"
  | "perimeter_rect"
  | "area_rect"
  | "percent_of"
  | "average3"
  | "chain_add_sub";

export interface WordProblemQuestionParams {
  variant: "word-problem";
  problemId: string;
  sectionId: string;
  grade: GradeLevel;
  values: Record<string, number>;
  formula: WordProblemFormula;
  skill: TestSkill;
  story: string;
  expectedOverride?: number;
  /** Zapisywane przy zapisie testu — używane przy ocenianiu w SQL */
  expectedResult?: number;
}

export type { FactorTreeNode };

export interface NumberLineAnswer {
  result: number;
}

export interface FractionAnswer {
  numerator: number;
  denominator: number;
}

export interface ComparisonAnswer {
  comparison: "<" | "=" | ">";
}

export interface LabelAnswer {
  label: string;
}

export interface RatioPairAnswer {
  partA: number;
  partB: number;
}

export type NumericAnswer = NumberLineAnswer;

export type TestWidgetParams =
  | NumberLineQuestionParams
  | ArithmeticQuestionParams
  | FractionPartQuestionParams
  | RectangleQuestionParams
  | UnitConversionQuestionParams
  | ComparisonQuestionParams
  | RatioQuestionParams
  | PolygonQuestionParams
  | NumberBondQuestionParams
  | ClockQuestionParams
  | ShapeSortQuestionParams
  | SymmetryPictureQuestionParams
  | SymmetryAxisQuestionParams
  | PrimeFactorTreeQuestionParams
  | TriangleClassificationQuestionParams
  | TriangleAngleSumQuestionParams
  | AngleKindQuestionParams
  | IntersectingAnglesQuestionParams
  | WordProblemQuestionParams;

export type TestWidgetAnswer = NumericAnswer | FractionAnswer | ComparisonAnswer | LabelAnswer | RatioPairAnswer;

export interface WidgetGradeResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  skill: TestSkill;
  expectedAnswer: TestWidgetAnswer;
}

export interface TestWidgetDefinition {
  slug: string;
  title: string;
  widgetKind: string;
  skill: TestSkill;
  defaultPoints: number;
  defaultParams: TestWidgetParams;
  lessonUse: string;
  buildPrompt: (params: TestWidgetParams) => string;
  buildRandomParams: () => TestWidgetParams;
  grade: (params: TestWidgetParams, answer: TestWidgetAnswer, maxScore: number) => WidgetGradeResult;
}
