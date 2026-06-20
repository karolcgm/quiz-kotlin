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
}

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

export type NumericAnswer = NumberLineAnswer;

export type TestWidgetParams =
  | NumberLineQuestionParams
  | ArithmeticQuestionParams
  | FractionPartQuestionParams
  | RectangleQuestionParams
  | UnitConversionQuestionParams
  | ComparisonQuestionParams;

export type TestWidgetAnswer = NumericAnswer | FractionAnswer | ComparisonAnswer;

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
