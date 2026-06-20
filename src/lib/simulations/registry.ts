import type {
  ArithmeticQuestionParams,
  ComparisonAnswer,
  ComparisonQuestionParams,
  FractionAnswer,
  FractionPartQuestionParams,
  NumberLineAnswer,
  NumberLineQuestionParams,
  RectangleQuestionParams,
  TestWidgetAnswer,
  TestWidgetDefinition,
  TestWidgetParams,
  UnitConversionQuestionParams,
} from "@/types/testWidget";
import { simulations } from "@/data/simulations";
import type { Simulation } from "@/types/simulation";

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

function isNumberLineAnswer(answer: TestWidgetAnswer): answer is NumberLineAnswer {
  return "result" in answer;
}

function isFractionAnswer(answer: TestWidgetAnswer): answer is FractionAnswer {
  return "numerator" in answer && "denominator" in answer;
}

function isComparisonAnswer(answer: TestWidgetAnswer): answer is ComparisonAnswer {
  return "comparison" in answer;
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

  if (simulation.visualKind === "number-line" || textIncludes(simulation, ["oś", "temperatura", "przeciwne"])) {
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

  if (simulation.visualKind === "geometry" || skill === "geometry") {
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

  if (simulation.visualKind === "measurement" || skill === "measurement") {
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
