import type { Simulation } from "@/types/simulation";
import type {
  BarChartQuestionParams,
  CircleMeasureParams,
  ExtendedQuestionParams,
  TestWidgetAnswer,
  TestWidgetDefinition,
  TestWidgetParams,
} from "@/types/testWidget";
import {
  arithmeticMean,
  circleArea,
  circleCircumference,
  circleDiameter,
  coordinateDistance,
  countDivisors,
  countMultiplesUpTo,
  countPrimesUpTo,
  cuboidVolume,
  cylinderVolume,
  distanceFromSpeedTime,
  evaluateExpression,
  lcm,
  linearY,
  median,
  mode,
  parallelogramArea,
  percentDiscountPrice,
  percentIncreasePrice,
  percentPart,
  powerValue,
  probabilityPercent,
  pythagorasHypotenuse,
  shapeVertices,
  solidCounts,
  speedFromDistanceTime,
  sqrtFromArea,
  substituteLinear,
  sumCoefficients,
  timeFromDistanceSpeed,
  triangleArea,
  trapezoidArea,
} from "@/lib/math/topicMath";
import { randomBasicShape } from "@/lib/math/basicShapes";
import { createWordProblemParams, wordProblemWidgetDefinition } from "@/lib/wordProblems/widget";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isExtendedParams(params: TestWidgetParams): params is ExtendedQuestionParams {
  return "variant" in params && typeof params.variant === "string";
}

function numericExpected(params: ExtendedQuestionParams): number {
  switch (params.variant) {
    case "percent":
      if (params.ask === "part" || params.ask === "compoundPart") return percentPart(params.base, params.percent);
      if (params.ask === "discountPrice") return percentDiscountPrice(params.base, params.percent);
      return percentIncreasePrice(params.base, params.percent);
    case "sdt":
      if (params.ask === "speed") return speedFromDistanceTime(params.distance, params.time);
      if (params.ask === "distance") return distanceFromSpeedTime(params.speed, params.time);
      return timeFromDistanceSpeed(params.distance, params.speed);
    case "statistics":
      if (params.ask === "mean") return arithmeticMean(params.values);
      if (params.ask === "median") return median(params.values);
      return mode(params.values);
    case "bar-chart":
      if (params.ask === "value") return params.values[params.targetIndex] ?? 0;
      if (params.ask === "sum") return params.values.reduce((a, b) => a + b, 0);
      return Math.max(...params.values);
    case "expression":
      return evaluateExpression(params.a, params.b, params.c, params.d);
    case "substitute":
      return substituteLinear(params.x, params.a, params.b);
    case "equation-balance":
      return params.unknown;
    case "like-terms":
      return sumCoefficients(params.terms);
    case "power":
      return powerValue(params.base, params.exponent);
    case "linear-function":
      return params.ask === "slope" ? params.a : linearY(params.a, params.b, params.x);
    case "pythagoras":
      return params.ask === "hypotenuse"
        ? pythagorasHypotenuse(params.legA, params.legB)
        : params.legA * params.legA + params.legB * params.legB;
    case "circle":
      if (params.ask === "diameter") return circleDiameter(params.radius);
      if (params.ask === "circumference") return circleCircumference(params.radius);
      return circleArea(params.radius);
    case "volume-cubes":
      return cuboidVolume(params.cellsWidth, params.cellsHeight, params.cellsDepth);
    case "cylinder-volume":
      return cylinderVolume(params.radius, params.height);
    case "angle-measure":
      return params.degrees;
    case "shape-properties":
      return shapeVertices(params.shape);
    case "divisibility":
      if (params.ask === "remainder") return params.number % params.divisor;
      return String(params.number)
        .split("")
        .reduce((acc, digit) => acc + Number(digit), 0);
    case "multiples-grid":
      return params.ask === "count" ? countMultiplesUpTo(params.base, params.max) : lcm(params.base, params.target);
    case "prime-sieve":
      return countPrimesUpTo(params.max);
    case "solid-net":
      return solidCounts(params.solid)[params.ask];
    case "line-geometry":
      return params.points - 1;
    case "triangle-area":
      return triangleArea(params.base, params.height);
    case "trapezoid-area":
      return trapezoidArea(params.baseA, params.baseB, params.height);
    case "parallelogram-area":
      return parallelogramArea(params.base, params.height);
    case "probability":
      return probabilityPercent(params.favorable, params.total);
    case "multiplication-grid":
      return params.rows * params.cols;
    case "sqrt-area":
      return sqrtFromArea(params.squareArea);
    case "coordinate-distance":
      return coordinateDistance(params.dx, params.dy);
    case "divisor-count":
      return countDivisors(params.number);
    case "thermometer":
      return params.temperature;
    case "pie-chart":
      return percentPart(params.total, params.percent);
    default:
      return 0;
  }
}

function gradeNumeric(params: ExtendedQuestionParams, answer: TestWidgetAnswer, maxScore: number, skill: TestWidgetDefinition["skill"]) {
  const expected = numericExpected(params);
  const isCorrect = "result" in answer && answer.result === expected;
  return {
    isCorrect,
    score: isCorrect ? maxScore : 0,
    maxScore,
    skill,
    expectedAnswer: { result: expected },
  };
}

function makeExtendedWidget(
  simulation: Simulation,
  widgetKind: string,
  skill: TestWidgetDefinition["skill"],
  defaultParams: ExtendedQuestionParams,
  buildRandom: () => ExtendedQuestionParams,
  buildPrompt: (params: ExtendedQuestionParams) => string,
): TestWidgetDefinition {
  const lessonUse = `${simulation.shortDescription} ${simulation.teacherHint}`;
  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind,
    skill,
    defaultPoints: 1,
    defaultParams,
    lessonUse,
    buildRandomParams: buildRandom,
    buildPrompt(params) {
      if (!isExtendedParams(params)) return `${simulation.title}: rozwiąż zadanie.`;
      return buildPrompt(params);
    },
    grade(params, answer, maxScore) {
      if (!isExtendedParams(params)) {
        return { isCorrect: false, score: 0, maxScore, skill, expectedAnswer: { result: 0 } };
      }
      return gradeNumeric(params, answer, maxScore, skill);
    },
  };
}

function createExpressionWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "expression-eval",
    "algebra",
    { variant: "expression", a: 4, b: 3, c: 5, d: 2, ask: "result" },
    () => ({
      variant: "expression",
      a: randomInt(2, 9),
      b: randomInt(2, 9),
      c: randomInt(2, 9),
      d: randomInt(1, 8),
      ask: "result",
    }),
    (params) =>
      params.variant === "expression"
        ? `Oblicz: ${params.a} + ${params.b} · ${params.c} − ${params.d} (pamiętaj o kolejności działań).`
        : simulation.title,
  );
}

function createPercentPartWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "percent-calc",
    "fractions",
    { variant: "percent", base: 200, percent: 15, ask: "part" },
    () => ({
      variant: "percent",
      base: randomInt(50, 400),
      percent: [5, 10, 15, 20, 25][randomInt(0, 4)],
      ask: "part",
    }),
    (params) =>
      params.variant === "percent" ? `Ile to ${params.percent}% z ${params.base}?` : simulation.title,
  );
}

function createSdtWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "speed-distance-time",
    "measurement",
    { variant: "sdt", distance: 60, time: 2, speed: 30, ask: "speed" },
    () => {
      const asks = ["speed", "distance", "time"] as const;
      const ask = asks[randomInt(0, 2)];
      const speed = randomInt(4, 12) * 5;
      const time = randomInt(1, 4);
      const distance = speed * time;
      return { variant: "sdt", distance, time, speed, ask };
    },
    (params) => {
      if (params.variant !== "sdt") return simulation.title;
      if (params.ask === "speed") return `Droga ${params.distance} km, czas ${params.time} h. Jaka prędkość?`;
      if (params.ask === "distance") return `Prędkość ${params.speed} km/h przez ${params.time} h. Jaka droga?`;
      return `Droga ${params.distance} km przy ${params.speed} km/h. Ile godzin?`;
    },
  );
}

function createSubstituteWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "substitute",
    "algebra",
    { variant: "substitute", x: 4, a: 3, b: 5, ask: "result" },
    () => ({
      variant: "substitute",
      x: randomInt(1, 9),
      a: randomInt(2, 7),
      b: randomInt(-5, 12),
      ask: "result",
    }),
    (params) =>
      params.variant === "substitute"
        ? `Oblicz wartość wyrażenia ${params.a}x + ${params.b} dla x = ${params.x}.`
        : simulation.title,
  );
}

function createBalanceWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "equation-balance",
    "algebra",
    { variant: "equation-balance", leftPan: 15, rightPan: 27, unknown: 12, ask: "unknown" },
    () => {
      const unknown = randomInt(3, 20);
      const leftPan = randomInt(2, 15);
      return { variant: "equation-balance", leftPan, rightPan: leftPan + unknown, unknown, ask: "unknown" };
    },
    () => "Na wadze obie szalki są w równowadze. Znajdź brakującą masę (x).",
  );
}

function createBarChartWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "bar-chart",
    "statistics",
    { variant: "bar-chart", values: [5, 8, 3, 10], ask: "max", targetIndex: 0 },
    () => {
      const values = Array.from({ length: 4 }, () => randomInt(2, 14));
      return {
        variant: "bar-chart",
        values,
        ask: ["value", "sum", "max"][randomInt(0, 2)] as BarChartQuestionParams["ask"],
        targetIndex: randomInt(0, 3),
      };
    },
    (params) => {
      if (params.variant !== "bar-chart") return simulation.title;
      if (params.ask === "value") return `Odczytaj wartość słupka nr ${params.targetIndex + 1}.`;
      if (params.ask === "sum") return "Oblicz sumę wszystkich słupków.";
      return "Podaj najwyższą wartość na diagramie.";
    },
  );
}

function createPiePercentWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "pie-chart",
    "fractions",
    { variant: "pie-chart", percent: 25, total: 200, ask: "part" },
    () => ({
      variant: "pie-chart",
      percent: [10, 15, 20, 25, 30, 40][randomInt(0, 5)],
      total: randomInt(80, 400),
      ask: "part",
    }),
    (params) =>
      params.variant === "pie-chart"
        ? `Diagram kołowy: ${params.percent}% z ${params.total}. Oblicz wielkość wycinka.`
        : simulation.title,
  );
}

function createProbabilityWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "probability",
    "statistics",
    { variant: "probability", favorable: 2, total: 6, ask: "probabilityPercent" },
    () => {
      const total = randomInt(4, 12);
      return {
        variant: "probability",
        favorable: randomInt(1, total - 1),
        total,
        ask: "probabilityPercent",
      };
    },
    (params) =>
      params.variant === "probability"
        ? `Losowanie: ${params.favorable} korzystnych na ${params.total}. Jaki to procent szans?`
        : simulation.title,
  );
}

function createTriangleAreaWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "triangle-area",
    "geometry",
    { variant: "triangle-area", base: 8, height: 5, ask: "area" },
    () => ({
      variant: "triangle-area",
      base: randomInt(4, 14),
      height: randomInt(3, 10),
      ask: "area",
    }),
    (params) =>
      params.variant === "triangle-area"
        ? `Oblicz pole trójkąta: podstawa ${params.base}, wysokość ${params.height}.`
        : simulation.title,
  );
}

function createTrapezoidAreaWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "trapezoid-area",
    "geometry",
    { variant: "trapezoid-area", baseA: 5, baseB: 9, height: 4, ask: "area" },
    () => ({
      variant: "trapezoid-area",
      baseA: randomInt(3, 8),
      baseB: randomInt(9, 14),
      height: randomInt(3, 7),
      ask: "area",
    }),
    (params) =>
      params.variant === "trapezoid-area"
        ? `Oblicz pole trapezu: podstawy ${params.baseA} i ${params.baseB}, wysokość ${params.height}.`
        : simulation.title,
  );
}

function createParallelogramAreaWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "parallelogram-area",
    "geometry",
    { variant: "parallelogram-area", base: 7, height: 4, ask: "area" },
    () => ({
      variant: "parallelogram-area",
      base: randomInt(4, 12),
      height: randomInt(3, 8),
      ask: "area",
    }),
    (params) =>
      params.variant === "parallelogram-area"
        ? `Oblicz pole równoległoboku: podstawa ${params.base}, wysokość ${params.height}.`
        : simulation.title,
  );
}

function createCircleWidget(simulation: Simulation, ask: "circumference" | "area") {
  return makeExtendedWidget(
    simulation,
    "circle-measure",
    "geometry",
    { variant: "circle", radius: 5, ask },
    () => ({
      variant: "circle",
      radius: randomInt(2, 10),
      ask,
    }),
    (params) => {
      if (params.variant !== "circle") return simulation.title;
      if (params.ask === "circumference") return `Oblicz obwód koła o promieniu ${params.radius} (π ≈ 3,14).`;
      return `Oblicz pole koła o promieniu ${params.radius} (π ≈ 3,14).`;
    },
  );
}

function createMultiplicationGridWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "multiplication-grid",
    "multiplication",
    { variant: "multiplication-grid", rows: 4, cols: 6, ask: "product" },
    () => ({
      variant: "multiplication-grid",
      rows: randomInt(2, 9),
      cols: randomInt(2, 9),
      ask: "product",
    }),
    (params) =>
      params.variant === "multiplication-grid"
        ? `Siatka ${params.rows} × ${params.cols}. Ile elementów razem?`
        : simulation.title,
  );
}

function createPowerWidget(simulation: Simulation, base = 10) {
  return makeExtendedWidget(
    simulation,
    "power-eval",
    "algebra",
    { variant: "power", base, exponent: 3, ask: "result" },
    () => ({
      variant: "power",
      base,
      exponent: randomInt(2, 5),
      ask: "result",
    }),
    (params) =>
      params.variant === "power" ? `Oblicz: ${params.base}^${params.exponent}` : simulation.title,
  );
}

function createThermometerWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "thermometer",
    "measurement",
    { variant: "thermometer", temperature: -3, ask: "reading" },
    () => ({
      variant: "thermometer",
      temperature: randomInt(-10, 35),
      ask: "reading",
    }),
    () => "Odczytaj temperaturę na termometrze (w °C).",
  );
}

function createDivisorCountWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "divisor-count",
    "algebra",
    { variant: "divisor-count", number: 24, ask: "count" },
    () => ({
      variant: "divisor-count",
      number: randomInt(12, 48),
      ask: "count",
    }),
    (params) =>
      params.variant === "divisor-count"
        ? `Ile dzielników ma liczba ${params.number}?`
        : simulation.title,
  );
}

function createCoordinateDistanceWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "coordinate-distance",
    "geometry",
    { variant: "coordinate-distance", dx: 3, dy: 4, ask: "distance" },
    () => ({
      variant: "coordinate-distance",
      dx: randomInt(2, 9),
      dy: randomInt(2, 9),
      ask: "distance",
    }),
    (params) =>
      params.variant === "coordinate-distance"
        ? `Odległość między punktami o różnicy ${params.dx} i ${params.dy} (Pitagoras).`
        : simulation.title,
  );
}

function createSqrtWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "sqrt-area",
    "geometry",
    { variant: "sqrt-area", squareArea: 49, ask: "side" },
    () => ({
      variant: "sqrt-area",
      squareArea: [16, 25, 36, 49, 64, 81][randomInt(0, 5)],
      ask: "side",
    }),
    (params) =>
      params.variant === "sqrt-area"
        ? `Kwadrat ma pole ${params.squareArea}. Oblicz długość boku.`
        : simulation.title,
  );
}

function createCuboidVolumeWidget(simulation: Simulation) {
  return makeExtendedWidget(
    simulation,
    "volume-cubes",
    "geometry",
    { variant: "volume-cubes", cellsWidth: 4, cellsHeight: 3, cellsDepth: 5, ask: "volume" },
    () => ({
      variant: "volume-cubes",
      cellsWidth: randomInt(2, 6),
      cellsHeight: randomInt(2, 5),
      cellsDepth: randomInt(2, 6),
      ask: "volume",
    }),
    (params) =>
      params.variant === "volume-cubes"
        ? `Graniastosłup: ${params.cellsWidth} × ${params.cellsHeight} × ${params.cellsDepth}. Oblicz objętość.`
        : simulation.title,
  );
}

function createRectangleMeasureWidget(simulation: Simulation, defaultAsk: "area" | "perimeter" = "area"): TestWidgetDefinition {
  const lessonUse = `${simulation.shortDescription} ${simulation.teacherHint}`;
  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "rectangle-measure",
    skill: "geometry" as const,
    defaultPoints: 1,
    defaultParams: { width: 6, height: 4, ask: defaultAsk },
    lessonUse,
    buildRandomParams() {
      const ask: "area" | "perimeter" =
        simulation.slug === "obwod-na-sznurku" || defaultAsk === "perimeter"
          ? "perimeter"
          : Math.random() > 0.5
            ? "area"
            : "perimeter";
      return {
        width: randomInt(2, 12),
        height: randomInt(2, 10),
        ask,
      };
    },
    buildPrompt(params: TestWidgetParams) {
      if (!("width" in params && "height" in params && "ask" in params)) {
        return `${simulation.title}: oblicz wartość z rysunku.`;
      }
      const p = params as { width: number; height: number; ask: "area" | "perimeter" };
      const figureLabel = simulation.slug === "obwod-na-sznurku" ? "figury" : "figury";
      return p.ask === "area"
        ? `${simulation.title}: oblicz pole ${figureLabel} ${p.width} × ${p.height} na kratce.`
        : `${simulation.title}: oblicz obwód ${figureLabel} ${p.width} × ${p.height} — dodaj długości wszystkich boków (jak sznurek wokół figury).`;
    },
    grade(params: TestWidgetParams, answer: TestWidgetAnswer, maxScore: number) {
      if (!("width" in params && "height" in params && "ask" in params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "geometry" as const, expectedAnswer: { result: 0 } };
      }
      const p = params as { width: number; height: number; ask: "area" | "perimeter" };
      const expected = p.ask === "area" ? p.width * p.height : 2 * (p.width + p.height);
      const isCorrect = "result" in answer && answer.result === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry" as const,
        expectedAnswer: { result: expected },
      };
    },
  };
}

function createFractionNumberLineWidget(simulation: Simulation): TestWidgetDefinition {
  const lessonUse = `${simulation.shortDescription} ${simulation.teacherHint}`;
  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "fraction-number-line",
    skill: "fractions" as const,
    defaultPoints: 1,
    defaultParams: { numerator: 3, denominator: 4 },
    lessonUse,
    buildRandomParams() {
      const denominator = randomInt(2, 8);
      return { numerator: randomInt(1, denominator - 1), denominator };
    },
    buildPrompt(params: TestWidgetParams) {
      if (!("numerator" in params && "denominator" in params)) {
        return `${simulation.title}: wskaż ułamek na osi.`;
      }
      const p = params as { numerator: number; denominator: number };
      return `${simulation.title}: wskaż położenie ${p.numerator}/${p.denominator} na osi liczbowej.`;
    },
    grade(params: TestWidgetParams, answer: TestWidgetAnswer, maxScore: number) {
      if (!("numerator" in params && "denominator" in params)) {
        return {
          isCorrect: false,
          score: 0,
          maxScore,
          skill: "fractions" as const,
          expectedAnswer: { numerator: 0, denominator: 1 },
        };
      }
      const expected = { numerator: params.numerator, denominator: params.denominator };
      const isCorrect =
        "numerator" in answer &&
        "denominator" in answer &&
        answer.denominator !== 0 &&
        answer.numerator * expected.denominator === expected.numerator * answer.denominator;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "fractions" as const,
        expectedAnswer: expected,
      };
    },
  };
}

function createDecimalCompareWidget(simulation: Simulation): TestWidgetDefinition {
  const lessonUse = `${simulation.shortDescription} ${simulation.teacherHint}`;
  return {
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "number-comparison",
    skill: "fractions" as const,
    defaultPoints: 1,
    defaultParams: { left: 502, right: 498 },
    lessonUse,
    buildRandomParams() {
      const a = randomInt(10, 99) / 10;
      const b = randomInt(10, 99) / 10;
      return { left: Math.round(a * 100), right: Math.round(b * 100) };
    },
    buildPrompt(params: TestWidgetParams) {
      if (!("left" in params && "right" in params)) return `${simulation.title}: porównaj liczby.`;
      const p = params as { left: number; right: number };
      return `${simulation.title}: porównaj ${(p.left / 100).toFixed(2)} ? ${(p.right / 100).toFixed(2)}`;
    },
    grade(params: TestWidgetParams, answer: TestWidgetAnswer, maxScore: number) {
      if (!("left" in params && "right" in params)) {
        return { isCorrect: false, score: 0, maxScore, skill: "fractions" as const, expectedAnswer: { comparison: "=" as const } };
      }
      const p = params as { left: number; right: number };
      const expected: "<" | "=" | ">" = p.left < p.right ? "<" : p.left > p.right ? ">" : "=";
      const isCorrect = "comparison" in answer && answer.comparison === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "fractions" as const,
        expectedAnswer: { comparison: expected },
      };
    },
  };
}

const SLUG_BUILDERS: Record<string, (simulation: Simulation) => TestWidgetDefinition> = {
  "wlasnosci-figur": (simulation) =>
    makeExtendedWidget(
      simulation,
      "shape-properties",
      "geometry",
      { variant: "shape-properties", shape: "hexagon", ask: "vertices" },
      () => {
        const shapes = ["triangle", "square", "pentagon", "hexagon", "octagon"] as const;
        const shape = shapes[randomInt(0, shapes.length - 1)];
        return { variant: "shape-properties", shape, ask: Math.random() > 0.5 ? "vertices" : "sides" };
      },
      (params) => {
        if (params.variant !== "shape-properties") return simulation.title;
        return params.ask === "vertices"
          ? `Ile wierzchołków ma ${params.shape === "square" ? "kwadrat" : "figura"}?`
          : `Ile boków ma ta figura?`;
      },
    ),
  "tangram-figury": (simulation) => ({
    slug: simulation.slug,
    title: simulation.title,
    widgetKind: "shape-sort",
    skill: "geometry",
    defaultPoints: 1,
    defaultParams: { shape: "triangle" },
    lessonUse: `${simulation.shortDescription} ${simulation.teacherHint}`,
    buildRandomParams() {
      return { shape: randomBasicShape() };
    },
    buildPrompt() {
      return "Do której grupy należy wyróżniona figura z tangramu?";
    },
    grade(params, answer, maxScore) {
      const expected = "shape" in params ? params.shape : "triangle";
      const isCorrect = "label" in answer && answer.label === expected;
      return {
        isCorrect,
        score: isCorrect ? maxScore : 0,
        maxScore,
        skill: "geometry",
        expectedAnswer: { label: expected },
      };
    },
  }),
  "kolejnosc-dzialan-drzewko": createExpressionWidget,
  "kolejnosc-dzialan-egzamin": createExpressionWidget,
  "odcinki-proste-polproste": (simulation) =>
    makeExtendedWidget(
      simulation,
      "line-geometry",
      "geometry",
      { variant: "line-geometry", points: 3, ask: "segments" },
      () => ({ variant: "line-geometry", points: randomInt(2, 5), ask: "segments" }),
      (params) =>
        params.variant === "line-geometry"
          ? `Na prostej leżą ${params.points} punkty kolejno. Ile odcinków można wyznaczyć?`
          : simulation.title,
    ),
  "wielokrotnosci-na-siatce": (simulation) =>
    makeExtendedWidget(
      simulation,
      "multiples-grid",
      "multiplication",
      { variant: "multiples-grid", base: 4, max: 40, target: 6, ask: "count" },
      () => ({
        variant: "multiples-grid",
        base: randomInt(2, 9),
        max: randomInt(24, 60),
        target: randomInt(2, 9),
        ask: Math.random() > 0.5 ? "count" : "lcm",
      }),
      (params) =>
        params.variant === "multiples-grid"
          ? params.ask === "count"
            ? `Ile wielokrotności liczby ${params.base} jest ≤ ${params.max}?`
            : `Najmniejsza wspólna wielokrotność ${params.base} i ${params.target}?`
          : simulation.title,
    ),
  "liczby-pierwsze-sito": (simulation) =>
    makeExtendedWidget(
      simulation,
      "prime-sieve",
      "multiplication",
      { variant: "prime-sieve", max: 30, ask: "count" },
      () => ({ variant: "prime-sieve", max: randomInt(20, 50), ask: "count" }),
      (params) =>
        params.variant === "prime-sieve"
          ? `Ile liczb pierwszych jest w przedziale od 2 do ${params.max}?`
          : simulation.title,
    ),
  "cechy-podzielnosci": (simulation) =>
    makeExtendedWidget(
      simulation,
      "divisibility",
      "algebra",
      { variant: "divisibility", number: 126, divisor: 3, ask: "remainder" },
      () => ({
        variant: "divisibility",
        number: randomInt(100, 999),
        divisor: [2, 3, 4, 5, 9, 10][randomInt(0, 5)],
        ask: Math.random() > 0.5 ? "remainder" : "digitSum",
      }),
      (params) =>
        params.variant === "divisibility"
          ? params.ask === "remainder"
            ? `Jaka jest reszta z dzielenia ${params.number} przez ${params.divisor}?`
            : `Jaka jest suma cyfr liczby ${params.number}?`
          : simulation.title,
    ),
  katomierz: (simulation) =>
    makeExtendedWidget(
      simulation,
      "angle-measure",
      "geometry",
      { variant: "angle-measure", degrees: 65, ask: "degrees" },
      () => ({ variant: "angle-measure", degrees: randomInt(15, 165), ask: "degrees" }),
      (params) =>
        params.variant === "angle-measure"
          ? "Odczytaj miarę kąta na rysunku (w stopniach)."
          : simulation.title,
    ),
  "procent-z-liczby": createPercentPartWidget,
  "obnizka-ceny": (simulation) =>
    makeExtendedWidget(
      simulation,
      "percent-calc",
      "fractions",
      { variant: "percent", base: 120, percent: 20, ask: "discountPrice" },
      () => ({
        variant: "percent",
        base: randomInt(80, 300),
        percent: [10, 15, 20, 25, 30][randomInt(0, 4)],
        ask: "discountPrice",
      }),
      (params) =>
        params.variant === "percent"
          ? `Cena ${params.base} zł po obniżce o ${params.percent}%. Jaka jest nowa cena?`
          : simulation.title,
    ),
  "podwyzka-procentowa": (simulation) =>
    makeExtendedWidget(
      simulation,
      "percent-calc",
      "fractions",
      { variant: "percent", base: 100, percent: 10, ask: "increasePrice" },
      () => ({
        variant: "percent",
        base: randomInt(50, 250),
        percent: [5, 10, 15, 20][randomInt(0, 3)],
        ask: "increasePrice",
      }),
      (params) =>
        params.variant === "percent"
          ? `Wynagrodzenie ${params.base} zł wzrosło o ${params.percent}%. Jaka jest nowa kwota?`
          : simulation.title,
    ),
  "procenty-zlozone": (simulation) =>
    makeExtendedWidget(
      simulation,
      "percent-calc",
      "fractions",
      { variant: "percent", base: 400, percent: 10, ask: "compoundPart" },
      () => ({
        variant: "percent",
        base: randomInt(200, 600),
        percent: [10, 15, 20][randomInt(0, 2)],
        ask: "compoundPart",
      }),
      (params) =>
        params.variant === "percent"
          ? `Oblicz ${params.percent}% z kwoty ${params.base} zł (procent złożony — pierwszy krok).`
          : simulation.title,
    ),
  "egzamin-procenty-zadanie": createPercentPartWidget,
  "predkosc-droga-czas": createSdtWidget,
  "egzamin-droga-czas": createSdtWidget,
  "wyrazenia-z-klockow": createExpressionWidget,
  "podstawianie-do-wzoru": createSubstituteWidget,
  "przeksztalcanie-wzorow": createSubstituteWidget,
  "rownanie-waga": createBalanceWidget,
  "rownanie-liniowe-kroki": createBalanceWidget,
  "redukcja-wyrazow-podobnych": (simulation) =>
    makeExtendedWidget(
      simulation,
      "like-terms",
      "algebra",
      { variant: "like-terms", terms: [3, 5, -2, 4], ask: "sum" },
      () => ({
        variant: "like-terms",
        terms: Array.from({ length: 4 }, () => randomInt(-8, 12)),
        ask: "sum",
      }),
      (params) =>
        params.variant === "like-terms"
          ? `Dodaj wyrazy podobne: ${params.terms.map((t) => (t >= 0 ? `+ ${t}x` : `- ${Math.abs(t)}x`)).join(" ").replace(/^\+ /, "")}`
          : simulation.title,
    ),
  "potegi-jako-wzrost": (simulation) =>
    makeExtendedWidget(
      simulation,
      "power-eval",
      "multiplication",
      { variant: "power", base: 2, exponent: 5, ask: "result" },
      () => ({
        variant: "power",
        base: randomInt(2, 5),
        exponent: randomInt(2, 5),
        ask: "result",
      }),
      (params) =>
        params.variant === "power" ? `Oblicz: ${params.base}^${params.exponent}` : simulation.title,
    ),
  "srednia-arytmetyczna": (simulation) =>
    makeExtendedWidget(
      simulation,
      "statistics",
      "statistics",
      { variant: "statistics", values: [4, 6, 8, 10, 12], ask: "mean" },
      () => ({
        variant: "statistics",
        values: Array.from({ length: 5 }, () => randomInt(2, 20)),
        ask: "mean",
      }),
      () => "Oblicz średnią arytmetyczną danych na wykresie.",
    ),
  "mediana-i-dominanta": (simulation) =>
    makeExtendedWidget(
      simulation,
      "statistics",
      "statistics",
      { variant: "statistics", values: [3, 5, 5, 7, 9], ask: "median" },
      () => ({
        variant: "statistics",
        values: Array.from({ length: 5 }, () => randomInt(1, 15)),
        ask: Math.random() > 0.5 ? "median" : "mode",
      }),
      (params) =>
        params.variant === "statistics"
          ? params.ask === "median"
            ? "Uporządkuj dane i podaj medianę."
            : "Podaj dominantę (najczęstszą wartość)."
          : simulation.title,
    ),
  "diagram-slupkowy": createBarChartWidget,
  "odczytywanie-wykresow": createBarChartWidget,
  "tabela-funkcji": (simulation) =>
    makeExtendedWidget(
      simulation,
      "linear-function",
      "algebra",
      { variant: "linear-function", a: 2, b: 3, x: 4, ask: "y" },
      () => ({
        variant: "linear-function",
        a: randomInt(1, 5),
        b: randomInt(-4, 8),
        x: randomInt(1, 8),
        ask: "y",
      }),
      (params) =>
        params.variant === "linear-function"
          ? `Dla y = ${params.a}x + ${params.b} oblicz y, gdy x = ${params.x}.`
          : simulation.title,
    ),
  "wykres-funkcji-liniowej": (simulation) =>
    makeExtendedWidget(
      simulation,
      "linear-function",
      "algebra",
      { variant: "linear-function", a: 3, b: -2, x: 0, ask: "slope" },
      () => ({
        variant: "linear-function",
        a: randomInt(-5, 5) || 2,
        b: randomInt(-6, 6),
        x: randomInt(1, 6),
        ask: "slope",
      }),
      () => "Odczytaj współczynnik kierunkowy a z wykresu funkcji liniowej.",
    ),
  "pitagoras-kwadraty": (simulation) =>
    makeExtendedWidget(
      simulation,
      "pythagoras",
      "geometry",
      { variant: "pythagoras", legA: 3, legB: 4, ask: "hypotenuse" },
      () => ({
        variant: "pythagoras",
        legA: randomInt(3, 9),
        legB: randomInt(3, 9),
        ask: Math.random() > 0.4 ? "hypotenuse" : "areaSum",
      }),
      (params) =>
        params.variant === "pythagoras"
          ? params.ask === "hypotenuse"
            ? `Przyprostokątne ${params.legA} i ${params.legB}. Oblicz długość przeciwprostokątnej.`
            : `Oblicz sumę pól kwadratów na bokach ${params.legA} i ${params.legB}.`
          : simulation.title,
    ),
  "promien-srednica": (simulation) =>
    makeExtendedWidget(
      simulation,
      "circle-measure",
      "geometry",
      { variant: "circle", radius: 5, ask: "diameter" },
      () => ({
        variant: "circle",
        radius: randomInt(2, 12),
        ask: ["diameter", "circumference", "area"][randomInt(0, 2)] as CircleMeasureParams["ask"],
      }),
      (params) => {
        if (params.variant !== "circle") return simulation.title;
        if (params.ask === "diameter") return `Koło o promieniu ${params.radius}. Oblicz średnicę.`;
        if (params.ask === "circumference") return `Oblicz obwód koła o promieniu ${params.radius}.`;
        return `Oblicz pole koła o promieniu ${params.radius}.`;
      },
    ),
  "objetosc-z-kostek": (simulation) =>
    makeExtendedWidget(
      simulation,
      "volume-cubes",
      "geometry",
      { variant: "volume-cubes", cellsWidth: 4, cellsHeight: 3, cellsDepth: 2, ask: "volume" },
      () => ({
        variant: "volume-cubes",
        cellsWidth: randomInt(2, 6),
        cellsHeight: randomInt(2, 5),
        cellsDepth: randomInt(2, 4),
        ask: "volume",
      }),
      (params) =>
        params.variant === "volume-cubes"
          ? `Bryła z kostek: ${params.cellsWidth} × ${params.cellsHeight} × ${params.cellsDepth}. Oblicz objętość.`
          : simulation.title,
    ),
  "objetosc-walca": (simulation) =>
    makeExtendedWidget(
      simulation,
      "cylinder-volume",
      "geometry",
      { variant: "cylinder-volume", radius: 3, height: 10, ask: "volume" },
      () => ({
        variant: "cylinder-volume",
        radius: randomInt(2, 6),
        height: randomInt(5, 15),
        ask: "volume",
      }),
      (params) =>
        params.variant === "cylinder-volume"
          ? `Walec: r = ${params.radius}, h = ${params.height}. Oblicz objętość (π ≈ 3,14).`
          : simulation.title,
    ),
  "siatki-bryl": (simulation) =>
    makeExtendedWidget(
      simulation,
      "solid-net",
      "geometry",
      { variant: "solid-net", solid: "cube", ask: "faces" },
      () => {
        const solids = ["cube", "cuboid", "cylinder"] as const;
        const solid = solids[randomInt(0, solids.length - 1)];
        const asks = ["faces", "edges", "vertices"] as const;
        return { variant: "solid-net", solid, ask: asks[randomInt(0, 2)] };
      },
      (params) => {
        if (params.variant !== "solid-net") return simulation.title;
        const names = { cube: "sześcianu", cuboid: "prostopadłościanu", cylinder: "walca" };
        const labels = { faces: "ścian", edges: "krawędzi", vertices: "wierzchołków" };
        return `Ile ${labels[params.ask]} ma rozwinięcie ${names[params.solid]}?`;
      },
    ),
  "zadanie-geometryczne-rysunek": (simulation) => createRectangleMeasureWidget(simulation, "area"),
  "obwod-na-sznurku": (simulation) => createRectangleMeasureWidget(simulation, "perimeter"),
  "zadanie-tekstowe-kroki": (simulation) => ({
    ...wordProblemWidgetDefinition,
    slug: simulation.slug,
    title: simulation.title,
    lessonUse: `${simulation.shortDescription} ${simulation.teacherHint}`,
    defaultParams: createWordProblemParams("numbers-grade-5-01"),
  }),
  "model-zadania-tekstowego": (simulation) => ({
    ...wordProblemWidgetDefinition,
    slug: simulation.slug,
    title: simulation.title,
    lessonUse: `${simulation.shortDescription} ${simulation.teacherHint}`,
    defaultParams: createWordProblemParams("numbers-grade-3-01"),
  }),
  "procent-z-paska": createPiePercentWidget,
  "diagram-kolowy": createPiePercentWidget,
  "porownywanie-dziesietnych": createDecimalCompareWidget,
  "liczby-wymierne-na-osi": createFractionNumberLineWidget,
  "notacja-wykladnicza-przesuwanie": (simulation) => createPowerWidget(simulation, 10),
  "pole-trojkata": createTriangleAreaWidget,
  "pole-trapezu": createTrapezoidAreaWidget,
  "pole-rownolegloboku": createParallelogramAreaWidget,
  "obwod-kola": (simulation) => createCircleWidget(simulation, "circumference"),
  "pole-kola": (simulation) => createCircleWidget(simulation, "area"),
  "dzielniki-liczby": createDivisorCountWidget,
  "odleglosc-w-ukladzie": createCoordinateDistanceWidget,
  "pierwiastek-jako-bok": createSqrtWidget,
  "objetosc-graniastoslupa": createCuboidVolumeWidget,
  "tabliczka-mnozenia-siatka": createMultiplicationGridWidget,
  "liczby-calkowite-termometr": createThermometerWidget,
  "prawdopodobienstwo-losowanie": createProbabilityWidget,
  "kostka-prawdopodobienstwo": createProbabilityWidget,
  "dzialania-na-wymiernych": createExpressionWidget,
};

export function buildExtendedSimulationWidgets(simulations: Simulation[]): Record<string, TestWidgetDefinition> {
  const out: Record<string, TestWidgetDefinition> = {};
  for (const simulation of simulations) {
    const builder = SLUG_BUILDERS[simulation.slug];
    if (builder) {
      out[simulation.slug] = builder(simulation);
    }
  }
  return out;
}

export function isTopicExtendedParams(params: TestWidgetParams): params is ExtendedQuestionParams {
  return isExtendedParams(params);
}

export { numericExpected };
