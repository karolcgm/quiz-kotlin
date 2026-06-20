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

export interface IntersectingAnglesQuestionParams {
  variant: "intersecting-angles";
  degrees: number;
  ask: IntersectingAnglesAsk;
}

export interface PercentQuestionParams {
  variant: "percent";
  base: number;
  percent: number;
  ask: "part" | "discountPrice" | "increasePrice" | "compoundPart";
}

export interface SpeedDistanceTimeParams {
  variant: "sdt";
  distance: number;
  time: number;
  speed: number;
  ask: "speed" | "distance" | "time";
}

export interface StatisticsQuestionParams {
  variant: "statistics";
  values: number[];
  ask: "mean" | "median" | "mode";
}

export interface BarChartQuestionParams {
  variant: "bar-chart";
  values: number[];
  ask: "value" | "sum" | "max";
  targetIndex: number;
}

export interface ExpressionQuestionParams {
  variant: "expression";
  a: number;
  b: number;
  c: number;
  d: number;
  ask: "result";
}

export interface SubstituteQuestionParams {
  variant: "substitute";
  x: number;
  a: number;
  b: number;
  ask: "result";
}

export interface EquationBalanceParams {
  variant: "equation-balance";
  leftPan: number;
  rightPan: number;
  unknown: number;
  ask: "unknown";
}

export interface LikeTermsParams {
  variant: "like-terms";
  terms: number[];
  ask: "sum";
}

export interface PowerQuestionParams {
  variant: "power";
  base: number;
  exponent: number;
  ask: "result";
}

export interface LinearFunctionParams {
  variant: "linear-function";
  a: number;
  b: number;
  x: number;
  ask: "y" | "slope";
}

export interface PythagorasQuestionParams {
  variant: "pythagoras";
  legA: number;
  legB: number;
  ask: "hypotenuse" | "areaSum";
}

export interface CircleMeasureParams {
  variant: "circle";
  radius: number;
  ask: "diameter" | "circumference" | "area";
}

export interface VolumeCubesParams {
  variant: "volume-cubes";
  cellsWidth: number;
  cellsHeight: number;
  cellsDepth: number;
  ask: "volume";
}

export interface CylinderVolumeParams {
  variant: "cylinder-volume";
  radius: number;
  height: number;
  ask: "volume";
}

export interface AngleMeasureParams {
  variant: "angle-measure";
  degrees: number;
  ask: "degrees";
}

export interface ShapePropertiesParams {
  variant: "shape-properties";
  shape: "triangle" | "square" | "pentagon" | "hexagon" | "octagon";
  ask: "vertices" | "sides";
}

export interface DivisibilityParams {
  variant: "divisibility";
  number: number;
  divisor: number;
  ask: "remainder" | "digitSum";
}

export interface MultiplesGridParams {
  variant: "multiples-grid";
  base: number;
  max: number;
  target: number;
  ask: "count" | "lcm";
}

export interface PrimeSieveParams {
  variant: "prime-sieve";
  max: number;
  ask: "count";
}

export interface SolidNetParams {
  variant: "solid-net";
  solid: "cube" | "cuboid" | "cylinder";
  ask: "faces" | "edges" | "vertices";
}

export interface LineGeometryParams {
  variant: "line-geometry";
  points: number;
  ask: "segments";
}

export interface TriangleAreaParams {
  variant: "triangle-area";
  base: number;
  height: number;
  ask: "area";
}

export interface TrapezoidAreaParams {
  variant: "trapezoid-area";
  baseA: number;
  baseB: number;
  height: number;
  ask: "area";
}

export interface ProbabilityParams {
  variant: "probability";
  favorable: number;
  total: number;
  ask: "probabilityPercent";
}

export interface MultiplicationGridParams {
  variant: "multiplication-grid";
  rows: number;
  cols: number;
  ask: "product";
}

export interface SqrtAreaParams {
  variant: "sqrt-area";
  squareArea: number;
  ask: "side";
}

export interface CoordinateDistanceParams {
  variant: "coordinate-distance";
  dx: number;
  dy: number;
  ask: "distance";
}

export interface DivisorCountParams {
  variant: "divisor-count";
  number: number;
  ask: "count";
}

export interface ThermometerParams {
  variant: "thermometer";
  temperature: number;
  ask: "reading";
}

export interface PieChartParams {
  variant: "pie-chart";
  percent: number;
  total: number;
  ask: "part";
}

export interface ParallelogramAreaParams {
  variant: "parallelogram-area";
  base: number;
  height: number;
  ask: "area";
}

export type ExtendedQuestionParams =
  | PercentQuestionParams
  | SpeedDistanceTimeParams
  | StatisticsQuestionParams
  | BarChartQuestionParams
  | ExpressionQuestionParams
  | SubstituteQuestionParams
  | EquationBalanceParams
  | LikeTermsParams
  | PowerQuestionParams
  | LinearFunctionParams
  | PythagorasQuestionParams
  | CircleMeasureParams
  | VolumeCubesParams
  | CylinderVolumeParams
  | AngleMeasureParams
  | ShapePropertiesParams
  | DivisibilityParams
  | MultiplesGridParams
  | PrimeSieveParams
  | SolidNetParams
  | LineGeometryParams
  | TriangleAreaParams
  | TrapezoidAreaParams
  | ProbabilityParams
  | MultiplicationGridParams
  | SqrtAreaParams
  | CoordinateDistanceParams
  | DivisorCountParams
  | ThermometerParams
  | PieChartParams
  | ParallelogramAreaParams;

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

export type WordProblemDifficulty = "easy" | "medium" | "hard";

export interface WordProblemAnswerPartConfig {
  id: string;
  label: string;
  formula: WordProblemFormula | "literal";
  literalKey?: string;
  expectedOverride?: number;
}

export interface WordProblemQuestionParams {
  variant: "word-problem";
  problemId: string;
  sectionId: string;
  grade: GradeLevel;
  difficulty: WordProblemDifficulty;
  values: Record<string, number>;
  /** Główna formuła (zgodność wsteczna) */
  formula: WordProblemFormula;
  skill: TestSkill;
  story: string;
  parts: WordProblemAnswerPartConfig[];
  partialCredit: boolean;
  expectedOverride?: number;
  expectedResults?: Record<string, number>;
}

export interface WordProblemPartsAnswer {
  parts: Record<string, number>;
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
  | ExtendedQuestionParams
  | WordProblemQuestionParams;

export type TestWidgetAnswer =
  | NumericAnswer
  | FractionAnswer
  | ComparisonAnswer
  | LabelAnswer
  | RatioPairAnswer
  | WordProblemPartsAnswer;

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
