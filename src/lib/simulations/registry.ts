import type {
  ArithmeticQuestionParams,
  ClockQuestionParams,
  ComparisonAnswer,
  ComparisonQuestionParams,
  FractionAnswer,
  FractionPartQuestionParams,
  NumberLineAnswer,
  NumberLineQuestionParams,
  RatioQuestionParams,
  RatioPairAnswer,
  RectangleQuestionParams,
  NumberBondQuestionParams,
  PolygonQuestionParams,
  PrimeFactorTreeQuestionParams,
  TriangleClassificationQuestionParams,
  TriangleAngleSumQuestionParams,
  AngleKindQuestionParams,
  IntersectingAnglesQuestionParams,
  LabelAnswer,
  TestWidgetAnswer,
  TestWidgetDefinition,
  TestWidgetParams,
  ShapeSortQuestionParams,
  SymmetryAxisQuestionParams,
  SymmetryPictureQuestionParams,
  UnitConversionQuestionParams,
} from "@/types/testWidget";
import { expectedMirrorCells, isAxisSymmetric, randomMotif } from "@/lib/math/symmetryPatterns";
import { simulations } from "@/data/simulations";
import { wordProblemWidgetDefinition, WORD_PROBLEM_SLUG } from "@/lib/wordProblems/widget";
import type { Simulation } from "@/types/simulation";
import {
  polygonInteriorAngle,
  polygonName,
  polygonPerimeter,
  polygonVertices,
} from "@/lib/math/polygon";
import { simplifyRatio } from "@/lib/math/ratio";
import { missingDigitExpected } from "@/lib/math/comparisonDisplay";
import {
  COMPOSITE_NUMBERS,
  factorsToLabel,
  labelToFactors,
  primeFactorize,
  sameFactorMultiset,
} from "@/lib/math/primeFactors";
import {
  classifyTriangleByAngles,
  classifyTriangleBySides,
  presetTriangle,
  TRIANGLE_ANGLE_KINDS,
  TRIANGLE_SIDE_KINDS,
  triangleAngles,
  type TriangleClassKind,
} from "@/lib/math/triangleClassification";
import { classifyAngleKind, normalizeDegrees, adjacentSupplement } from "@/lib/math/angles";
import { registerDedicatedWidgetSlugs } from "@/lib/simulations/widgetAlignment";
import { normalizeHour, normalizeMinute, clockMinuteStep } from "@/lib/math/clock";
import { randomBasicShape, SHAPE_LABELS } from "@/lib/math/basicShapes";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isNumberLineParams(params: TestWidgetParams): params is NumberLineQuestionParams {
  return "start" in params && "change" in params;
}

function isArithmeticParams(params: TestWidgetParams): params is ArithmeticQuestionParams {
  return "operation" in params && "left" in params && "right" in params;
}

function isFractionPartParams(params: TestWidgetParams): params is FractionPartQuestionParams {
  return "numerator" in params && "denominator" in params;
}

function isRectangleParams(params: TestWidgetParams): params is RectangleQuestionParams {
  return "width" in params && "height" in params && "ask" in params;
}

function isUnitConversionParams(params: TestWidgetParams): params is UnitConversionQuestionParams {
  return "value" in params && "fromUnit" in params && "toUnit" in params;
}

function isComparisonParams(params: TestWidgetParams): params is ComparisonQuestionParams {
  return "left" in params && "right" in params && !("operation" in params);
}

function isRatioParams(params: TestWidgetParams): params is RatioQuestionParams {
  return "partA" in params && "partB" in params && "ask" in params && !("whole" in params);
}

function isNumberBondParams(params: TestWidgetParams): params is NumberBondQuestionParams {
  return "whole" in params && "partA" in params && "partB" in params && "ask" in params;
}

function isTriangleAngleSumParams(params: TestWidgetParams): params is TriangleAngleSumQuestionParams {
  return "variant" in params && params.variant === "triangle-angle-sum";
}

function isAngleKindParams(params: TestWidgetParams): params is AngleKindQuestionParams {
  return "variant" in params && params.variant === "angle-kind";
}

function isIntersectingAnglesParams(params: TestWidgetParams): params is IntersectingAnglesQuestionParams {
  return "variant" in params && params.variant === "intersecting-angles";
}

function isTriangleClassificationParams(params: TestWidgetParams): params is TriangleClassificationQuestionParams {
  return "variant" in params && params.variant === "triangle-classify";
}

function isPrimeFactorTreeParams(params: TestWidgetParams): params is PrimeFactorTreeQuestionParams {
  return "variant" in params && params.variant === "factor-tree";
}

function isPolygonParams(params: TestWidgetParams): params is PolygonQuestionParams {
  return "sides" in params && "sideLength" in params && "ask" in params;
}

function isNumberLineAnswer(answer: TestWidgetAnswer): answer is NumberLineAnswer {
  return "result" in answer;
}

function isFractionAnswer(answer: TestWidgetAnswer): answer is FractionAnswer {
  return "numerator" in answer && "denominator" in answer;
}

function isComparisonAnswer(answer: TestWidgetAnswer): answer is ComparisonAnswer {
  return "comparison" in answer;
}

function isLabelAnswer(answer: TestWidgetAnswer): answer is LabelAnswer {
  return "label" in answer;
}

function isRatioPairAnswer(answer: TestWidgetAnswer): answer is RatioPairAnswer {
  return "partA" in answer && "partB" in answer && !("numerator" in answer);
}

function arithmeticResult(params: ArithmeticQuestionParams) {
  if (params.operation === "add") return params.left + params.right;
  if (params.operation === "subtract") return params.left - params.right;
  if (params.operation === "multiply") return params.left * params.right;
  return params.left / params.right;
}

function unitToMillimeters(unit: UnitConversionQuestionParams["fromUnit"]) {
  if (unit === "mm") return 1;
  if (unit === "cm") return 10;
  if (unit === "m") return 1000;
  return 1_000_000;
}

function convertLength(params: UnitConversionQuestionParams) {
  return (params.value * unitToMillimeters(params.fromUnit)) / unitToMillimeters(params.toUnit);
}

function comparisonSign(params: ComparisonQuestionParams): ComparisonAnswer["comparison"] {
  if (params.left < params.right) return "<";
  if (params.left > params.right) return ">";
  return "=";
}

function ratioExpected(params: RatioQuestionParams) {
  if (params.ask === "left") return params.partA;
  if (params.ask === "right") return params.partB;
  return params.partA + params.partB;
}

function isNumberLineSimulation(simulation: Simulation): boolean {
  if (simulation.slug === "ulamki-na-osi") {
    return false;
  }

  if (simulation.visualKind === "number-line") {
    return true;
  }

  if (simulation.slug.includes("os-liczbow") || simulation.slug.includes("oś-liczbow")) {
    return true;
  }

  if (simulation.tags.some((tag) => tag === "oś" || tag.includes("oś liczbow"))) {
    return true;
  }

  return textIncludes(simulation, ["oś liczbow", "osi liczbow", "liczbowa", "number-line"]);
}

function isRatioSimulation(simulation: Simulation): boolean {
  if (isNumberLineSimulation(simulation)) {
    return false;
  }

  return textIncludes(simulation, ["stosunek", "proporcj"]) && !textIncludes(simulation, ["prędkość", "droga"]);
}

function createRatioWidget(simulation: Simulation, lessonUse: string): TestWidgetDefinition {
  const favorsSimplify = simulation.slug === "proporcje" || textIncludes(simulation, ["proporcj"]);

  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "ratio-bar",
    skill: "algebra",
    defaultPoints: 1,
    defaultParams: favorsSimplify
      ? { partA: 2, partB: 6, ask: "simplify" }
      : { partA: 2, partB: 3, ask: "total" },
    lessonUse,
    buildRandomParams() {
      const divisor = randomInt(2, 6);
      const simplifiedA = randomInt(1, 5);
      const simplifiedB = randomInt(1, 5);
      const partA = simplifiedA * divisor;
      const partB = simplifiedB * divisor;
      const asks: RatioQuestionParams["ask"][] = ["total", "left", "right", "simplify"];

      if (favorsSimplify) {
        const weightedAsks: RatioQuestionParams["ask"][] = ["simplify", "simplify", "simplify", "total", "left", "right"];
        return { partA, partB, ask: weightedAsks[randomInt(0, weightedAsks.length - 1)] };
      }

      return { partA, partB, ask: asks[randomInt(0, 2)] };
    },
    buildPrompt(params) {
      if (!isRatioParams(params)) {
        return `${simulation.title}: odczytaj stosunek z modelu paska.`;
      }

      if (params.ask === "simplify") {
        return `${simulation.title}: uprość stosunek ${params.partA}:${params.partB} do postaci najprostszej.`;
      }

      if (params.ask === "left") {
        return `${simulation.title}: stosunek ${params.partA}:${params.partB}. Ile części ma lewa część?`;
      }

      if (params.ask === "right") {
        return `${simulation.title}: stosunek ${params.partA}:${params.partB}. Ile części ma prawa część?`;
      }

      return `${simulation.title}: stosunek ${params.partA}:${params.partB}. Ile części ma całość?`;
    },
    grade(params, answer, maxScore) {
      if (!isRatioParams(params)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          skill: "algebra",
          expectedAnswer: { result: 0 },
        };
      }

      if (params.ask === "simplify") {
        const expected = simplifyRatio(params.partA, params.partB);
        const isCorrect =
          isRatioPairAnswer(answer) && answer.partA === expected.partA && answer.partB === expected.partB;

        return {
          isCorrect,
          score: isCorrect ? maxScore : 0,
          maxScore,
          skill: "algebra",
          expectedAnswer: expected,
        };
      }

      const expected = ratioExpected(params);
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;

      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "algebra",
        expectedAnswer: { result: expected },
      };
    },
  };
}

function randomNumberBondParams(): NumberBondQuestionParams {
  const whole = randomInt(11, 99);
  const partA = randomInt(1, whole - 1);
  const partB = whole - partA;
  const asks: NumberBondQuestionParams["ask"][] = ["partA", "partB", "whole"];
  return { whole, partA, partB, ask: asks[randomInt(0, asks.length - 1)] };
}

function createNumberBondWidget(simulation: Simulation, lessonUse: string): TestWidgetDefinition {
  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "number-bond",
    skill: "addition",
    defaultPoints: 1,
    defaultParams: { whole: 130, partA: 100, partB: 30, ask: "partB" },
    lessonUse,
    buildRandomParams() {
      return randomNumberBondParams();
    },
    buildPrompt(params) {
      if (!isNumberBondParams(params)) return `${simulation.title}: uzupełnij dom liczbowy.`;
      if (params.ask === "whole") {
        return `${simulation.title}: ${params.partA} + ${params.partB} = ?`;
      }
      if (params.ask === "partA") {
        return `${simulation.title}: ? + ${params.partB} = ${params.whole}`;
      }
      return `${simulation.title}: ${params.partA} + ? = ${params.whole}`;
    },
    grade(params, answer, maxScore) {
      if (!isNumberBondParams(params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "addition", expectedAnswer: { result: 0 } };
      }
      const expected =
        params.ask === "partA" ? params.partA : params.ask === "partB" ? params.partB : params.whole;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "addition",
        expectedAnswer: { result: expected },
      };
    },
  };
}

function createLiczmanyWidget(
  simulation: Simulation,
  lessonUse: string,
  operation: "add" | "subtract",
): TestWidgetDefinition {
  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "arithmetic-basic",
    skill: operation === "subtract" ? "subtraction" : "addition",
    defaultPoints: 1,
    defaultParams:
      operation === "subtract"
        ? { left: 45, right: 13, operation: "subtract" }
        : { left: 24, right: 16, operation: "add" },
    lessonUse,
    buildRandomParams() {
      if (operation === "subtract") {
        const left = randomInt(15, 99);
        return { left, right: randomInt(5, left - 1), operation: "subtract" };
      }
      return { left: randomInt(10, 80), right: randomInt(5, 50), operation: "add" };
    },
    buildPrompt(params) {
      if (!isArithmeticParams(params)) return `${simulation.title}: rozwiąż zadanie.`;
      return `${simulation.title}: oblicz ${operationPrompt(params)}.`;
    },
    grade(params, answer, maxScore) {
      const expected = isArithmeticParams(params) ? arithmeticResult(params) : 0;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: operation === "subtract" ? "subtraction" : "addition",
        expectedAnswer: { result: expected },
      };
    },
  };
}

function isShapeSortParams(params: TestWidgetParams): params is ShapeSortQuestionParams {
  return "shape" in params && !("sides" in params) && !("width" in params) && !("hour" in params) && !("variant" in params);
}

function isSymmetryPictureParams(params: TestWidgetParams): params is SymmetryPictureQuestionParams {
  return "variant" in params && params.variant === "picture";
}

function isSymmetryAxisParams(params: TestWidgetParams): params is SymmetryAxisQuestionParams {
  return "variant" in params && params.variant === "axis";
}

function isClockParams(params: TestWidgetParams): params is ClockQuestionParams {
  return (
    "hour" in params &&
    "minute" in params &&
    "ask" in params &&
    !("whole" in params) &&
    !("sides" in params) &&
    !("width" in params) &&
    !("partA" in params)
  );
}

function clockExpected(params: ClockQuestionParams, slug: string): number {
  if (params.ask === "minute") {
    return normalizeMinute(params.minute, clockMinuteStep(slug));
  }
  return normalizeHour(params.hour);
}

function createClockWidget(
  simulation: Simulation,
  lessonUse: string,
  options: { fullHoursOnly: boolean },
): TestWidgetDefinition {
  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "clock-read",
    skill: "measurement",
    defaultPoints: 1,
    defaultParams: options.fullHoursOnly
      ? { hour: 3, minute: 0, ask: "hour" }
      : { hour: 3, minute: 30, ask: "hour" },
    lessonUse,
    buildRandomParams() {
      const hour = randomInt(1, 12);
      if (options.fullHoursOnly) {
        return { hour, minute: 0, ask: "hour" };
      }
      const minutes = [0, 15, 30, 45];
      const minute = minutes[randomInt(0, minutes.length - 1)];
      const ask: ClockQuestionParams["ask"] = Math.random() > 0.5 ? "hour" : "minute";
      return { hour, minute, ask };
    },
    buildPrompt(params) {
      if (!isClockParams(params)) return `${simulation.title}: odczytaj zegar.`;
      if (params.ask === "minute") {
        return `${simulation.title}: ile minut wskazuje długa wskazówka?`;
      }
      return options.fullHoursOnly
        ? `${simulation.title}: którą godzinę wskazuje krótka wskazówka? (pełne godziny)`
        : `${simulation.title}: którą godzinę wskazuje krótka wskazówka?`;
    },
    grade(params, answer, maxScore) {
      if (!isClockParams(params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "measurement", expectedAnswer: { result: 0 } };
      }
      const expected = clockExpected(params, simulation.slug);
      const step = clockMinuteStep(simulation.slug);
      const actual =
        isNumberLineAnswer(answer) && Number.isFinite(answer.result)
          ? params.ask === "minute"
            ? normalizeMinute(answer.result, step)
            : normalizeHour(answer.result)
          : NaN;
      const isCorrect = actual === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "measurement",
        expectedAnswer: { result: expected },
      };
    },
  };
}

function randomWeightComparisonParams(): ComparisonQuestionParams {
  if (Math.random() < 0.45) {
    const left = randomInt(100, 999);
    let right = randomInt(100, 999);
    while (right === left) right = randomInt(100, 999);
    const missingSide: "left" | "right" = Math.random() > 0.5 ? "left" : "right";
    const value = missingSide === "left" ? left : right;
    const missingIndex = randomInt(0, String(value).length - 1);
    return { left, right, ask: "missingDigit", missingSide, missingIndex };
  }

  return { left: randomInt(12, 99), right: randomInt(12, 99), ask: "sign" };
}

function gradeWeightComparison(
  params: ComparisonQuestionParams,
  answer: TestWidgetAnswer,
  maxScore: number,
) {
  if (params.ask === "missingDigit" && params.missingSide != null && params.missingIndex != null) {
    const expected = missingDigitExpected(params);
    const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
    return {
      isCorrect,
      score: isCorrect ? maxScore : 0,
      maxScore,
      skill: "measurement" as const,
      expectedAnswer: { result: expected },
    };
  }

  const expected = comparisonSign(params);
  const isCorrect = isComparisonAnswer(answer) && answer.comparison === expected;
  return {
    isCorrect,
    score: isCorrect ? maxScore : 0,
    maxScore,
    skill: "measurement" as const,
    expectedAnswer: { comparison: expected },
  };
}

const baseSimulationWidgetRegistry: Record<string, TestWidgetDefinition> = {
  "os-liczbowa": {
    slug: "os-liczbowa",
    title: "Oś liczbowa — wynik działania",
    widgetKind: "number-line-result",
    skill: "addition",
    defaultPoints: 1,
    defaultParams: {
      start: 4,
      change: -7,
    },
    lessonUse: "Uczniowie widzą ruch po osi i wpisują punkt końcowy.",
    buildRandomParams() {
      return {
        start: randomInt(-10, 10),
        change: randomInt(-10, 10),
      };
    },
    buildPrompt(params) {
      if (!isNumberLineParams(params)) {
        return "Oblicz wynik działania na osi liczbowej.";
      }

      const sign = params.change >= 0 ? "+" : "-";
      return `Oblicz: ${params.start} ${sign} ${Math.abs(params.change)} = ?`;
    },
    grade(params, answer, maxScore) {
      if (!isNumberLineParams(params) || !isNumberLineAnswer(answer)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          skill: "addition",
          expectedAnswer: { result: 0 },
        };
      }

      const expected = params.start + params.change;
      const isCorrect = answer.result === expected;
      const skill = params.change >= 0 ? "addition" : "subtraction";

      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill,
        expectedAnswer: { result: expected },
      };
    },
  },
  "dodawanie-do-100": {
    slug: "dodawanie-do-100",
    title: "Dodawanie do 100",
    widgetKind: "arithmetic-basic",
    skill: "addition",
    defaultPoints: 1,
    defaultParams: { left: 37, right: 28, operation: "add" },
    lessonUse: "Model pokazuje składniki jako dwa kolorowe paski i sumę.",
    buildRandomParams() {
      return { left: randomInt(10, 70), right: randomInt(5, 30), operation: "add" };
    },
    buildPrompt(params) {
      if (!isArithmeticParams(params)) return "Oblicz sumę.";
      return `Oblicz: ${params.left} + ${params.right} = ?`;
    },
    grade(params, answer, maxScore) {
      const expected = isArithmeticParams(params) ? arithmeticResult(params) : 0;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "addition",
        expectedAnswer: { result: expected },
      };
    },
  },
  "odejmowanie-do-100": {
    slug: "odejmowanie-do-100",
    title: "Odejmowanie do 100",
    widgetKind: "arithmetic-basic",
    skill: "subtraction",
    defaultPoints: 1,
    defaultParams: { left: 84, right: 37, operation: "subtract" },
    lessonUse: "Model pokazuje odejmowanie jako zabieranie części z całości.",
    buildRandomParams() {
      const left = randomInt(30, 99);
      return { left, right: randomInt(5, left - 1), operation: "subtract" };
    },
    buildPrompt(params) {
      if (!isArithmeticParams(params)) return "Oblicz różnicę.";
      return `Oblicz: ${params.left} - ${params.right} = ?`;
    },
    grade(params, answer, maxScore) {
      const expected = isArithmeticParams(params) ? arithmeticResult(params) : 0;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "subtraction",
        expectedAnswer: { result: expected },
      };
    },
  },
  "mnozenie-jako-grupy": {
    slug: "mnozenie-jako-grupy",
    title: "Mnożenie jako równe grupy",
    widgetKind: "arithmetic-basic",
    skill: "multiplication",
    defaultPoints: 1,
    defaultParams: { left: 4, right: 6, operation: "multiply" },
    lessonUse: "Kropki układają się w równe grupy, a uczeń wpisuje łączną liczbę.",
    buildRandomParams() {
      return { left: randomInt(2, 9), right: randomInt(2, 9), operation: "multiply" };
    },
    buildPrompt(params) {
      if (!isArithmeticParams(params)) return "Oblicz iloczyn.";
      return `Oblicz: ${params.left} · ${params.right} = ?`;
    },
    grade(params, answer, maxScore) {
      const expected = isArithmeticParams(params) ? arithmeticResult(params) : 0;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "multiplication",
        expectedAnswer: { result: expected },
      };
    },
  },
  "dzielenie-na-rowne-grupy": {
    slug: "dzielenie-na-rowne-grupy",
    title: "Dzielenie na równe grupy",
    widgetKind: "arithmetic-basic",
    skill: "division",
    defaultPoints: 1,
    defaultParams: { left: 36, right: 6, operation: "divide" },
    lessonUse: "Elementy są rozdzielane do pudełek, a uczeń podaje liczbę w jednej grupie.",
    buildRandomParams() {
      const right = randomInt(2, 9);
      return { left: right * randomInt(2, 9), right, operation: "divide" };
    },
    buildPrompt(params) {
      if (!isArithmeticParams(params)) return "Oblicz iloraz.";
      return `Oblicz: ${params.left} : ${params.right} = ?`;
    },
    grade(params, answer, maxScore) {
      const expected = isArithmeticParams(params) ? arithmeticResult(params) : 0;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "division",
        expectedAnswer: { result: expected },
      };
    },
  },
  "ulamki-na-osi": {
    slug: "ulamki-na-osi",
    title: "Ułamki na osi liczbowej",
    widgetKind: "fraction-number-line",
    skill: "fractions",
    defaultPoints: 1,
    defaultParams: { numerator: 3, denominator: 4 },
    lessonUse:
      "Oś od 0 do 1 pokazuje położenie ułamka — uczniowie wskazują punkt odpowiadający licznikowi przy danym mianowniku.",
    buildRandomParams() {
      const denominator = randomInt(2, 8);
      return { numerator: randomInt(1, denominator - 1), denominator };
    },
    buildPrompt(params) {
      if (!isFractionPartParams(params)) return "Wskaż ułamek na osi liczbowej.";
      return `Wskaż na osi liczbowej położenie ułamka ${params.numerator}/${params.denominator}.`;
    },
    grade(params, answer, maxScore) {
      const expected = isFractionPartParams(params)
        ? { numerator: params.numerator, denominator: params.denominator }
        : { numerator: 0, denominator: 1 };
      const isCorrect =
        isFractionAnswer(answer) &&
        answer.denominator !== 0 &&
        answer.numerator * expected.denominator === expected.numerator * answer.denominator;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "fractions",
        expectedAnswer: expected,
      };
    },
  },
  "ulamki-ciasto": {
    slug: "ulamki-ciasto",
    title: "Ułamki — część całości",
    widgetKind: "fraction-part",
    skill: "fractions",
    defaultPoints: 1,
    defaultParams: { numerator: 3, denominator: 8 },
    lessonUse: "Podzielone koło pokazuje licznik i mianownik jako część całości.",
    buildRandomParams() {
      const denominator = randomInt(3, 10);
      return { numerator: randomInt(1, denominator - 1), denominator };
    },
    buildPrompt(params) {
      if (!isFractionPartParams(params)) return "Zapisz zaznaczony ułamek.";
      return `Zapisz ułamek: ${params.numerator} z ${params.denominator} równych części.`;
    },
    grade(params, answer, maxScore) {
      const expected = isFractionPartParams(params)
        ? { numerator: params.numerator, denominator: params.denominator }
        : { numerator: 0, denominator: 1 };
      const isCorrect =
        isFractionAnswer(answer) &&
        answer.denominator !== 0 &&
        answer.numerator * expected.denominator === expected.numerator * answer.denominator;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "fractions",
        expectedAnswer: expected,
      };
    },
  },
  "prostokat-pole-obwod": {
    slug: "prostokat-pole-obwod",
    title: "Prostokąt — pole albo obwód",
    widgetKind: "rectangle-measure",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { width: 7, height: 4, ask: "area" },
    lessonUse: "Prostokąt na kratkach pokazuje różnicę między polem i obwodem.",
    buildRandomParams() {
      return {
        width: randomInt(2, 12),
        height: randomInt(2, 8),
        ask: Math.random() > 0.5 ? "area" : "perimeter",
      };
    },
    buildPrompt(params) {
      if (!isRectangleParams(params)) return "Oblicz wartość dla prostokąta.";
      return params.ask === "area"
        ? `Oblicz pole prostokąta ${params.width} × ${params.height}.`
        : `Oblicz obwód prostokąta ${params.width} × ${params.height}.`;
    },
    grade(params, answer, maxScore) {
      const expected = isRectangleParams(params)
        ? params.ask === "area"
          ? params.width * params.height
          : 2 * (params.width + params.height)
        : 0;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { result: expected },
      };
    },
  },
  wielokaty: {
    slug: "wielokaty",
    title: "Wielokąty",
    widgetKind: "polygon-explore",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { sides: 5, sideLength: 4, ask: "name" },
    lessonUse:
      "Pokazuje boki, wierzchołki, kąty i obwód wielokąta. Zmieniaj liczbę boków i proś uczniów o nazwanie figury przed pokazaniem odpowiedzi.",
    buildRandomParams() {
      const sides = randomInt(3, 10);
      const asks: PolygonQuestionParams["ask"][] = ["name", "perimeter", "vertices", "interiorAngle"];
      return {
        sides,
        sideLength: randomInt(2, 8),
        ask: asks[randomInt(0, asks.length - 1)],
      };
    },
    buildPrompt(params) {
      if (!isPolygonParams(params)) return "Poznaj wielokąt foremny.";
      if (params.ask === "name") {
        return `Jak nazywa się wielokąt foremny o ${params.sides} bokach?`;
      }
      if (params.ask === "perimeter") {
        return `Oblicz obwód wielokąta: ${params.sides} boków, każdy po ${params.sideLength} cm.`;
      }
      if (params.ask === "vertices") {
        return `Ile wierzchołków ma ten wielokąt foremny?`;
      }
      return `Jaki jest miara kąta wewnętrznego w tym wielokącie foremnym? (w stopniach)`;
    },
    grade(params, answer, maxScore) {
      if (!isPolygonParams(params)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          skill: "geometry",
          expectedAnswer: { label: "?" },
        };
      }

      if (params.ask === "name") {
        const expected = polygonName(params.sides);
        const isCorrect = isLabelAnswer(answer) && answer.label === expected;
        return {
          isCorrect,
          score: isCorrect ? maxScore : 0,
          maxScore,
          skill: "geometry",
          expectedAnswer: { label: expected },
        };
      }

      const expected =
        params.ask === "perimeter"
          ? polygonPerimeter(params.sides, params.sideLength)
          : params.ask === "vertices"
            ? polygonVertices(params.sides)
            : Math.round(polygonInteriorAngle(params.sides));

      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { result: expected },
      };
    },
  },
  "jednostki-dlugosci": {
    slug: "jednostki-dlugosci",
    title: "Jednostki długości",
    widgetKind: "unit-conversion",
    skill: "measurement",
    defaultPoints: 1,
    defaultParams: { value: 250, fromUnit: "cm", toUnit: "m" },
    lessonUse: "Tabela jednostek pokazuje przesuwanie wartości między mm, cm, m i km.",
    buildRandomParams() {
      const variants: UnitConversionQuestionParams[] = [
        { value: randomInt(10, 900), fromUnit: "cm", toUnit: "m" },
        { value: randomInt(1, 20), fromUnit: "m", toUnit: "cm" },
        { value: randomInt(1, 5), fromUnit: "km", toUnit: "m" },
        { value: randomInt(100, 9000), fromUnit: "mm", toUnit: "cm" },
      ];
      return variants[randomInt(0, variants.length - 1)];
    },
    buildPrompt(params) {
      if (!isUnitConversionParams(params)) return "Przelicz jednostkę długości.";
      return `Przelicz: ${params.value} ${params.fromUnit} = ? ${params.toUnit}`;
    },
    grade(params, answer, maxScore) {
      const expected = isUnitConversionParams(params) ? convertLength(params) : 0;
      const isCorrect = isNumberLineAnswer(answer) && Math.abs(answer.result - expected) < 0.001;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "measurement",
        expectedAnswer: { result: expected },
      };
    },
  },
  "zegar-pelne-godziny": createClockWidget(
    {
      slug: "zegar-pelne-godziny",
      title: "Zegar — pełne godziny",
      shortDescription: "Przesuwanie wskazówek i odczytywanie pełnych godzin.",
      grades: [1, 2],
      sectionId: "measurement-grade-1",
      topicId: "simple-time",
      status: "mvp",
      tags: ["zegar", "czas", "godziny"],
      visualKind: "measurement",
      interactionKind: "slider",
      teacherHint: "Przesuwaj wskazówkę godzinową i poproś uczniów o odczyt.",
    } as Simulation,
    "Przesuwanie wskazówek i odczytywanie pełnych godzin. Długa wskazówka na 12, krótka pokazuje godzinę.",
    { fullHoursOnly: true },
  ),
  "zegar-polowki-kwadranse": createClockWidget(
    {
      slug: "zegar-polowki-kwadranse",
      title: "Zegar — połówki i kwadranse",
      shortDescription: "Odczytywanie godzin, połówek i kwadransów.",
      grades: [2, 3],
      sectionId: "practical-grade-2",
      topicId: "clock-half",
      status: "mvp",
      tags: ["zegar", "kwadrans", "czas"],
      visualKind: "measurement",
      interactionKind: "slider",
      teacherHint: "Ustaw godzinę na zegarze i poproś uczniów o zapis cyfrowy.",
    } as Simulation,
    "Odczytywanie godzin, połówek i kwadransów. Długa wskazówka: 0, 15, 30 lub 45 minut.",
    { fullHoursOnly: false },
  ),
  "porownywanie-liczb-waga": {
    slug: "porownywanie-liczb-waga",
    title: "Porównywanie liczb na wadze",
    widgetKind: "weight-comparison",
    skill: "measurement",
    defaultPoints: 1,
    defaultParams: {
      left: 457,
      right: 492,
      ask: "missingDigit",
      missingSide: "left",
      missingIndex: 1,
    },
    lessonUse:
      "Większe, mniejsze i równe jako przechylenie wagi. Krokodyl patrzy na większą liczbę — albo uczeń odtwarza cyfrę, którą zjadł.",
    buildRandomParams() {
      return randomWeightComparisonParams();
    },
    buildPrompt(params) {
      if (!isComparisonParams(params)) return "Porównaj liczby na wadze.";
      if (params.ask === "missingDigit") {
        return "Porównywanie liczb na wadze: która cyfrę zjadł krokodyl?";
      }
      return `Porównaj na wadze: ${params.left} ? ${params.right} (krokodyl patrzy na większą liczbę).`;
    },
    grade(params, answer, maxScore) {
      if (!isComparisonParams(params)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          skill: "measurement",
          expectedAnswer: { comparison: "=" },
        };
      }
      return gradeWeightComparison(params, answer, maxScore);
    },
  },
  "trojkaty-klasyfikacja": {
    slug: "trojkaty-klasyfikacja",
    title: "Klasyfikacja trójkątów",
    widgetKind: "triangle-classification",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: {
      variant: "triangle-classify",
      ask: "bySides",
      ...presetTriangle("isosceles"),
    },
    lessonUse:
      "Przesuwanie wierzchołka pokazuje, jak zmieniają się boki i kąty — uczeń klasyfikuje trójkąt równoboczny, równoramienny, różnoboczny albo ostry, prosty, rozwartokątny.",
    buildRandomParams() {
      const ask = Math.random() > 0.5 ? "bySides" : "byAngles";
      const kinds = ask === "bySides" ? TRIANGLE_SIDE_KINDS : TRIANGLE_ANGLE_KINDS;
      const kind = kinds[randomInt(0, kinds.length - 1)] as TriangleClassKind;
      return {
        variant: "triangle-classify",
        ask,
        ...presetTriangle(kind),
      };
    },
    buildPrompt(params) {
      if (!isTriangleClassificationParams(params)) return "Sklasyfikuj trójkąt.";
      return params.ask === "bySides"
        ? "Określ typ trójkąta ze względu na długości boków."
        : "Określ typ trójkąta ze względu na miary kątów.";
    },
    grade(params, answer, maxScore) {
      if (!isTriangleClassificationParams(params)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          skill: "geometry",
          expectedAnswer: { label: "?" },
        };
      }

      const expected =
        params.ask === "bySides"
          ? classifyTriangleBySides(params)
          : classifyTriangleByAngles(params);
      const isCorrect = isLabelAnswer(answer) && answer.label === expected;

      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { label: expected },
      };
    },
  },
  "suma-katow-w-trojkacie": {
    slug: "suma-katow-w-trojkacie",
    title: "Suma kątów w trójkącie",
    widgetKind: "triangle-angle-sum",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: {
      variant: "triangle-angle-sum",
      hideAt: "C",
      ask: "missingAngle",
      ...presetTriangle("scalene"),
    },
    lessonUse: "Przeciągaj wierzchołki trójkąta — suma trzech kątów zawsze wynosi 180°.",
    buildRandomParams() {
      const hideAt = (["A", "B", "C"] as const)[randomInt(0, 2)];
      const kinds = [...TRIANGLE_SIDE_KINDS, ...TRIANGLE_ANGLE_KINDS] as TriangleClassKind[];
      return {
        variant: "triangle-angle-sum",
        hideAt,
        ask: "missingAngle",
        ...presetTriangle(kinds[randomInt(0, kinds.length - 1)]),
      };
    },
    buildPrompt(params) {
      if (!isTriangleAngleSumParams(params)) return "Znajdź brakujący kąt w trójkącie.";
      return `Suma kątów w trójkącie to 180°. Znajdź kąt ${params.hideAt}.`;
    },
    grade(params, answer, maxScore) {
      if (!isTriangleAngleSumParams(params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "geometry", expectedAnswer: { result: 0 } };
      }
      const angles = triangleAngles(params);
      const expected = params.hideAt === "A" ? angles[0] : params.hideAt === "B" ? angles[1] : angles[2];
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { result: expected },
      };
    },
  },
  "katy-rodzaje": {
    slug: "katy-rodzaje",
    title: "Rodzaje kątów",
    widgetKind: "angle-kind",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { variant: "angle-kind", degrees: 65, ask: "classify" },
    lessonUse: "Przeciągaj ramię kąta — ostry, prosty, rozwarty i półpełny widać od razu na kolorowym łuku.",
    buildRandomParams() {
      const presets = [35, 90, 120, 180];
      return { variant: "angle-kind", degrees: presets[randomInt(0, presets.length - 1)], ask: "classify" };
    },
    buildPrompt() {
      return "Określ rodzaj zaznaczonego kąta.";
    },
    grade(params, answer, maxScore) {
      const expected = isAngleKindParams(params) ? classifyAngleKind(params.degrees) : "acute";
      const isCorrect = isLabelAnswer(answer) && answer.label === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { label: expected },
      };
    },
  },
  "katy-przylegle-wierzcholkowe": {
    slug: "katy-przylegle-wierzcholkowe",
    title: "Kąty przyległe i wierzchołkowe",
    widgetKind: "intersecting-angles",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { variant: "intersecting-angles", degrees: 52, ask: "adjacent" },
    lessonUse: "Przecinające się proste — kąty przyległe sumują się do 180°, wierzchołkowe są równe.",
    buildRandomParams() {
      const asks: IntersectingAnglesQuestionParams["ask"][] = ["adjacent", "vertical", "linearPair"];
      return {
        variant: "intersecting-angles",
        degrees: randomInt(25, 155),
        ask: asks[randomInt(0, asks.length - 1)],
      };
    },
    buildPrompt(params) {
      if (!isIntersectingAnglesParams(params)) return "Oblicz brakujący kąt.";
      if (params.ask === "vertical") return `Proste przecinają się. Kąt wierzchołkowy — naprzeciwko ${params.degrees}°?`;
      if (params.ask === "adjacent") return `Kąt przyległy do ${params.degrees}° (razem 180°)?`;
      return `Kąt dopełniający na prostej do ${params.degrees}°?`;
    },
    grade(params, answer, maxScore) {
      if (!isIntersectingAnglesParams(params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "geometry", expectedAnswer: { result: 0 } };
      }
      const expected =
        params.ask === "vertical" ? normalizeDegrees(params.degrees) : adjacentSupplement(params.degrees);
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { result: expected },
      };
    },
  },
  "rozklad-na-czynniki": {
    slug: "rozklad-na-czynniki",
    title: "Rozkład na czynniki pierwsze",
    widgetKind: "prime-factor-tree",
    skill: "algebra",
    defaultPoints: 1,
    defaultParams: {
      variant: "factor-tree",
      number: 60,
      tree: { value: 60 },
    },
    lessonUse:
      "Drzewko czynników pokazuje, jak rozkładać liczbę złożoną na mnożniki — aż w liściach zostają same liczby pierwsze.",
    buildRandomParams() {
      const number = COMPOSITE_NUMBERS[randomInt(0, COMPOSITE_NUMBERS.length - 1)];
      return { variant: "factor-tree", number, tree: { value: number } };
    },
    buildPrompt(params) {
      if (!isPrimeFactorTreeParams(params)) return "Rozłóż liczbę na czynniki pierwsze.";
      return `Rozłóż ${params.number} na czynniki pierwsze — zbuduj drzewko podziałów.`;
    },
    grade(params, answer, maxScore) {
      const expectedFactors = isPrimeFactorTreeParams(params) ? primeFactorize(params.number) : [2];
      const expectedLabel = factorsToLabel(expectedFactors);
      const answerFactors = isLabelAnswer(answer) ? labelToFactors(answer.label) : [];
      const isCorrect =
        answerFactors.length > 0 &&
        sameFactorMultiset(answerFactors, expectedFactors);
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "algebra",
        expectedAnswer: { label: expectedLabel },
      };
    },
  },
  "porownywanie-do-100": {
    slug: "porownywanie-do-100",
    title: "Porównywanie liczb do 100",
    widgetKind: "number-comparison",
    skill: "addition",
    defaultPoints: 1,
    defaultParams: { left: 48, right: 52 },
    lessonUse: "Dwie liczby leżą na osi, a uczeń wybiera właściwy znak porównania.",
    buildRandomParams() {
      return { left: randomInt(1, 100), right: randomInt(1, 100) };
    },
    buildPrompt(params) {
      if (!isComparisonParams(params)) return "Wstaw znak porównania.";
      return `Wstaw znak: ${params.left} ? ${params.right}`;
    },
    grade(params, answer, maxScore) {
      const expected = isComparisonParams(params) ? comparisonSign(params) : "=";
      const isCorrect = isComparisonAnswer(answer) && answer.comparison === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "addition",
        expectedAnswer: { comparison: expected },
      };
    },
  },
  "rozklad-liczby-domki": createNumberBondWidget(
    {
      slug: "rozklad-liczby-domki",
      title: "Domki liczbowe",
      shortDescription: "Rozkład liczby na dwa składniki w formie prostego domku.",
      grades: [1, 2],
      sectionId: "operations-grade-1",
      topicId: "number-bonds",
      status: "mvp",
      tags: ["rozkład liczby", "dodawanie", "składniki"],
      visualKind: "game",
      interactionKind: "build",
      teacherHint: "Wybierz liczbę w dachu i uzupełniaj brakujący składnik.",
    } as Simulation,
    "Rozkład liczby na dwa składniki w formie prostego domku. Wybierz liczbę w dachu i uzupełniaj brakujący składnik.",
  ),
  "liczmany-dodawanie": createLiczmanyWidget(
    {
      slug: "liczmany-dodawanie",
      title: "Dodawanie liczmanów",
      shortDescription: "Łączenie dwóch zbiorów klocków i natychmiastowe liczenie sumy.",
      grades: [1, 2],
      sectionId: "operations-grade-1",
      topicId: "addition-objects",
      status: "mvp",
      tags: ["liczmany", "dodawanie", "zbiory"],
      visualKind: "game",
      interactionKind: "drag",
      teacherHint: "Przesuwaj liczmany między zbiorami i pytaj, ile będzie razem.",
    } as Simulation,
    "Łączenie dwóch zbiorów klocków i natychmiastowe liczenie sumy. Przesuwaj liczmany między zbiorami i pytaj, ile będzie razem.",
    "add",
  ),
  "liczmany-odejmowanie": createLiczmanyWidget(
    {
      slug: "liczmany-odejmowanie",
      title: "Odejmowanie liczmanów",
      shortDescription: "Zabieranie obiektów ze zbioru i obserwowanie różnicy.",
      grades: [1, 2],
      sectionId: "operations-grade-1",
      topicId: "subtraction-objects",
      status: "mvp",
      tags: ["liczmany", "odejmowanie", "różnica"],
      visualKind: "game",
      interactionKind: "drag",
      teacherHint: "Zabierz kilka obiektów i poproś uczniów o opisanie działania.",
    } as Simulation,
    "Zabieranie obiektów ze zbioru i obserwowanie różnicy. Zabierz kilka obiektów i poproś uczniów o opisanie działania.",
    "subtract",
  ),
  "symetria-obrazka": {
    slug: "symetria-obrazka",
    title: "Dokończ symetrię",
    widgetKind: "symmetry-picture",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { variant: "picture", motif: "butterfly", mirroredCells: [] },
    lessonUse: "Dorysowywanie drugiej połowy prostego obrazka względem osi symetrii.",
    buildRandomParams() {
      return { variant: "picture" as const, motif: randomMotif(), mirroredCells: [] };
    },
    buildPrompt() {
      return "Dokończ symetrię: kliknij kwadraty po prawej stronie osi, aby odtworzyć odbicie lustrzane.";
    },
    grade(params, answer, maxScore) {
      if (!isSymmetryPictureParams(params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "geometry", expectedAnswer: { label: "" } };
      }
      const expected = expectedMirrorCells(params.motif).sort().join("|");
      const actual = isLabelAnswer(answer) ? answer.label : [...params.mirroredCells].sort().join("|");
      const isCorrect = actual === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { label: expected },
      };
    },
  },
  "os-symetrii-figury": {
    slug: "os-symetrii-figury",
    title: "Oś symetrii figury",
    widgetKind: "symmetry-axis",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { variant: "axis", shape: "square", axisPercent: 50 },
    lessonUse: "Sprawdzanie, czy linia dzieli figurę na dwie równe części.",
    buildRandomParams() {
      const shapes: SymmetryAxisQuestionParams["shape"][] = ["square", "rectangle"];
      return {
        variant: "axis" as const,
        shape: shapes[randomInt(0, shapes.length - 1)],
        axisPercent: randomInt(20, 80),
      };
    },
    buildPrompt() {
      return "Czy ta oś symetrii dzieli figurę na dwie równe części?";
    },
    grade(params, answer, maxScore) {
      if (!isSymmetryAxisParams(params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "geometry", expectedAnswer: { label: "no" } };
      }
      const expected = isAxisSymmetric(params.shape, params.axisPercent) ? "yes" : "no";
      const isCorrect = isLabelAnswer(answer) && answer.label === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { label: expected },
      };
    },
  },
  "figury-podstawowe-sortowanie": {
    slug: "figury-podstawowe-sortowanie",
    title: "Sortowanie figur",
    widgetKind: "shape-sort",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { shape: "triangle" },
    lessonUse:
      "Przeciąganie figur do grup: koło, trójkąt, kwadrat, prostokąt. Uczniowie klasyfikują kształty i uzasadniają wybór.",
    buildRandomParams() {
      return { shape: randomBasicShape() };
    },
    buildPrompt(params) {
      if (!isShapeSortParams(params)) return "Posortuj figurę do właściwej grupy.";
      return `Sortowanie figur: do którego koszyka trafi ta figura?`;
    },
    grade(params, answer, maxScore) {
      if (!isShapeSortParams(params)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          skill: "geometry",
          expectedAnswer: { label: "circle" },
        };
      }
      const isCorrect = isLabelAnswer(answer) && answer.label === params.shape;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { label: params.shape },
      };
    },
  },
  [WORD_PROBLEM_SLUG]: wordProblemWidgetDefinition,
};

function textIncludes(simulation: Simulation, keywords: string[]) {
  const source = [
    simulation.slug,
    simulation.title,
    simulation.shortDescription,
    simulation.visualKind,
    simulation.interactionKind,
    ...simulation.tags,
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => source.includes(keyword));
}

function inferGenericSkill(simulation: Simulation): TestWidgetDefinition["skill"] {
  if (textIncludes(simulation, ["odejm", "różnica"])) return "subtraction";
  if (textIncludes(simulation, ["mnoż", "tabliczka", "potęg"])) return "multiplication";
  if (textIncludes(simulation, ["dziel", "iloraz"])) return "division";
  if (textIncludes(simulation, ["ułam", "dziesięt", "procent", "część"])) return "fractions";
  if (textIncludes(simulation, ["geometr", "figury", "pole", "obwód", "kąt", "trójkąt", "koło", "brył"])) {
    return "geometry";
  }
  if (textIncludes(simulation, ["jednost", "długość", "masa", "czas", "skala", "prędkość", "droga"])) {
    return "measurement";
  }
  if (textIncludes(simulation, ["algebra", "równanie", "wyraż", "wzór", "funkcj"])) return "algebra";
  if (textIncludes(simulation, ["statyst", "diagram", "średnia", "mediana", "prawdopodob"])) return "statistics";
  return "addition";
}

function genericOperationForSkill(skill: TestWidgetDefinition["skill"]): ArithmeticQuestionParams["operation"] {
  if (skill === "subtraction") return "subtract";
  if (skill === "multiplication") return "multiply";
  if (skill === "division") return "divide";
  return "add";
}

function genericArithmeticParams(skill: TestWidgetDefinition["skill"]): ArithmeticQuestionParams {
  const operation = genericOperationForSkill(skill);

  if (operation === "subtract") {
    const left = randomInt(20, 120);
    return { left, right: randomInt(2, left - 1), operation };
  }

  if (operation === "multiply") {
    return { left: randomInt(2, 12), right: randomInt(2, 12), operation };
  }

  if (operation === "divide") {
    const right = randomInt(2, 12);
    return { left: right * randomInt(2, 12), right, operation };
  }

  return { left: randomInt(5, 90), right: randomInt(5, 90), operation };
}

function operationPrompt(params: ArithmeticQuestionParams) {
  const sign = params.operation === "add"
    ? "+"
    : params.operation === "subtract"
      ? "-"
      : params.operation === "multiply"
        ? "·"
        : ":";

  return `${params.left} ${sign} ${params.right}`;
}

function createGenericWidget(simulation: Simulation): TestWidgetDefinition {
  const skill = inferGenericSkill(simulation);
  const lessonUse = `${simulation.shortDescription} ${simulation.teacherHint}`;

  if (isRatioSimulation(simulation)) {
    return createRatioWidget(simulation, lessonUse);
  }

  if (isNumberLineSimulation(simulation)) {
    return {
      slug: simulation.slug,
      title: simulation.title,
      widgetKind: "number-line-result",
      skill,
      defaultPoints: 1,
      defaultParams: { start: randomInt(-8, 12), change: randomInt(-10, 10) },
      lessonUse,
      buildRandomParams() {
        return { start: randomInt(-20, 20), change: randomInt(-15, 15) };
      },
      buildPrompt(params) {
        if (!isNumberLineParams(params)) return `Rozwiąż zadanie: ${simulation.title}.`;
        const sign = params.change >= 0 ? "+" : "-";
        return `${simulation.title}: oblicz ${params.start} ${sign} ${Math.abs(params.change)}.`;
      },
      grade(params, answer, maxScore) {
        const expected = isNumberLineParams(params) ? params.start + params.change : 0;
        const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;
        return {
          isCorrect,
          score: isCorrect ? maxScore : 0,
          maxScore,
          skill: params && isNumberLineParams(params) && params.change < 0 ? "subtraction" : skill,
          expectedAnswer: { result: expected },
        };
      },
    };
  }

  if (simulation.visualKind === "fraction" || skill === "fractions") {
    return {
      slug: simulation.slug,
      title: simulation.title,
      widgetKind: "fraction-part",
      skill: "fractions",
      defaultPoints: 1,
      defaultParams: { numerator: 2, denominator: 5 },
      lessonUse,
      buildRandomParams() {
        const denominator = randomInt(3, 12);
        return { numerator: randomInt(1, denominator - 1), denominator };
      },
      buildPrompt(params) {
        if (!isFractionPartParams(params)) return `Zapisz ułamek w module: ${simulation.title}.`;
        return `${simulation.title}: zapisz ${params.numerator} z ${params.denominator} równych części jako ułamek.`;
      },
      grade(params, answer, maxScore) {
        const expected = isFractionPartParams(params)
          ? { numerator: params.numerator, denominator: params.denominator }
          : { numerator: 0, denominator: 1 };
        const isCorrect =
          isFractionAnswer(answer) &&
          answer.denominator !== 0 &&
          answer.numerator * expected.denominator === expected.numerator * answer.denominator;

        return {
          isCorrect,
          score: isCorrect ? maxScore : 0,
          maxScore,
          skill: "fractions",
          expectedAnswer: expected,
        };
      },
    };
  }

  if (
    (simulation.visualKind === "geometry" || skill === "geometry") &&
    !textIncludes(simulation, ["sortow", "symetr", "rytm", "układank", "ukladank", "wzor", "ryt"])
  ) {
    if (textIncludes(simulation, ["pole", "obwód", "obwod", "prostokąt", "prostokat", "kratk", "wielokąt"])) {
    return {
      slug: simulation.slug,
      title: simulation.title,
      widgetKind: "rectangle-measure",
      skill: "geometry",
      defaultPoints: 1,
      defaultParams: { width: 6, height: 4, ask: "area" },
      lessonUse,
      buildRandomParams() {
        return {
          width: randomInt(2, 14),
          height: randomInt(2, 10),
          ask: Math.random() > 0.5 ? "area" : "perimeter",
        };
      },
      buildPrompt(params) {
        if (!isRectangleParams(params)) return `Rozwiąż zadanie geometryczne: ${simulation.title}.`;
        return params.ask === "area"
          ? `${simulation.title}: oblicz pole prostokąta ${params.width} × ${params.height}.`
          : `${simulation.title}: oblicz obwód prostokąta ${params.width} × ${params.height}.`;
      },
      grade(params, answer, maxScore) {
        const expected = isRectangleParams(params)
          ? params.ask === "area"
            ? params.width * params.height
            : 2 * (params.width + params.height)
          : 0;
        const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;

        return {
          isCorrect,
          score: isCorrect ? maxScore : 0,
          maxScore,
          skill: "geometry",
          expectedAnswer: { result: expected },
        };
      },
    };
    }
  }

  if (
    (simulation.visualKind === "measurement" || skill === "measurement") &&
    !textIncludes(simulation, ["zegar"])
  ) {
    return {
      slug: simulation.slug,
      title: simulation.title,
      widgetKind: "unit-conversion",
      skill: "measurement",
      defaultPoints: 1,
      defaultParams: { value: 320, fromUnit: "cm", toUnit: "m" },
      lessonUse,
      buildRandomParams() {
        const variants: UnitConversionQuestionParams[] = [
          { value: randomInt(10, 900), fromUnit: "cm", toUnit: "m" },
          { value: randomInt(1, 40), fromUnit: "m", toUnit: "cm" },
          { value: randomInt(1, 8), fromUnit: "km", toUnit: "m" },
          { value: randomInt(100, 9000), fromUnit: "mm", toUnit: "cm" },
        ];
        return variants[randomInt(0, variants.length - 1)];
      },
      buildPrompt(params) {
        if (!isUnitConversionParams(params)) return `${simulation.title}: przelicz jednostkę.`;
        return `${simulation.title}: ${params.value} ${params.fromUnit} = ? ${params.toUnit}`;
      },
      grade(params, answer, maxScore) {
        const expected = isUnitConversionParams(params) ? convertLength(params) : 0;
        const isCorrect = isNumberLineAnswer(answer) && Math.abs(answer.result - expected) < 0.001;

        return {
          isCorrect,
          score: isCorrect ? maxScore : 0,
          maxScore,
          skill: "measurement",
          expectedAnswer: { result: expected },
        };
      },
    };
  }

  if (simulation.interactionKind === "compare" || textIncludes(simulation, ["porówn", "więks", "mniejs"])) {
    return {
      slug: simulation.slug,
      title: simulation.title,
      widgetKind: "number-comparison",
      skill,
      defaultPoints: 1,
      defaultParams: { left: 42, right: 57 },
      lessonUse,
      buildRandomParams() {
        return { left: randomInt(-50, 150), right: randomInt(-50, 150) };
      },
      buildPrompt(params) {
        if (!isComparisonParams(params)) return `${simulation.title}: wstaw znak porównania.`;
        return `${simulation.title}: wstaw znak ${params.left} ? ${params.right}.`;
      },
      grade(params, answer, maxScore) {
        const expected = isComparisonParams(params) ? comparisonSign(params) : "=";
        const isCorrect = isComparisonAnswer(answer) && answer.comparison === expected;

        return {
          isCorrect,
          score: isCorrect ? maxScore : 0,
          maxScore,
          skill,
          expectedAnswer: { comparison: expected },
        };
      },
    };
  }

  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "arithmetic-basic",
    skill,
    defaultPoints: 1,
    defaultParams: genericArithmeticParams(skill),
    lessonUse,
    buildRandomParams() {
      return genericArithmeticParams(skill);
    },
    buildPrompt(params) {
      if (!isArithmeticParams(params)) return `Rozwiąż zadanie: ${simulation.title}.`;
      return `${simulation.title}: oblicz ${operationPrompt(params)}.`;
    },
    grade(params, answer, maxScore) {
      const expected = isArithmeticParams(params) ? arithmeticResult(params) : 0;
      const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;

      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill,
        expectedAnswer: { result: expected },
      };
    },
  };
}

export const simulationWidgetRegistry: Record<string, TestWidgetDefinition> = simulations.reduce(
  (registry, simulation) => {
    registry[simulation.slug] = baseSimulationWidgetRegistry[simulation.slug] ?? createGenericWidget(simulation);
    return registry;
  },
  { ...baseSimulationWidgetRegistry },
);

registerDedicatedWidgetSlugs(Object.keys(baseSimulationWidgetRegistry));

export function getAssessmentWidget(slug: string): TestWidgetDefinition | undefined {
  return simulationWidgetRegistry[slug];
}

export function isAssessmentReady(slug: string): boolean {
  return Boolean(getAssessmentWidget(slug));
}

export function getAssessmentReadySlugs(): string[] {
  return Object.keys(simulationWidgetRegistry);
}

export function getAssessmentWidgets(): TestWidgetDefinition[] {
  return Object.values(simulationWidgetRegistry);
}

export function buildWidgetPrompt(slug: string, params: TestWidgetParams): string {
  return getAssessmentWidget(slug)?.buildPrompt(params) ?? "Rozwiąż zadanie.";
}

export function buildRandomWidgetParams(slug: string): TestWidgetParams {
  return getAssessmentWidget(slug)?.buildRandomParams() ?? { start: 0, change: 0 };
}
