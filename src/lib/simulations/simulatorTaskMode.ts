import { buildRandomWidgetParams, getAssessmentWidget } from "@/lib/simulations/registry";
import { collectPrimeLeaves, factorsToLabel } from "@/lib/math/primeFactors";
import type { TestWidgetAnswer, TestWidgetParams } from "@/types/testWidget";

export type SimulatorMode = "demo" | "task";

export function isFractionParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { numerator: number; denominator: number }
> {
  return "numerator" in params && "denominator" in params;
}

export function isNumberLineParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { start: number; change: number }
> {
  return "start" in params && "change" in params;
}

export function isArithmeticParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { operation: string; left: number; right: number }
> {
  return "operation" in params && "left" in params && "right" in params;
}

export function isComparisonParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { left: number; right: number }
> {
  return "left" in params && "right" in params && !("operation" in params) && !("variant" in params);
}

export function isRatioParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { partA: number; partB: number; ask: string }
> {
  return "partA" in params && "partB" in params && "ask" in params && !("whole" in params);
}

export function isRectangleParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { width: number; height: number; ask: "area" | "perimeter" }
> {
  return "width" in params && "height" in params && "ask" in params;
}

export function isPolygonParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { sides: number; sideLength: number; ask: string }
> {
  return "sides" in params && "sideLength" in params && "ask" in params;
}

export function isShapeSortParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { shape: "circle" | "triangle" | "square" | "rectangle" }
> {
  return "shape" in params && !("sides" in params) && !("width" in params) && !("hour" in params) && !("variant" in params);
}

export function isSymmetryPictureParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { variant: "picture"; motif: string; mirroredCells: string[] }
> {
  return "variant" in params && params.variant === "picture";
}

export function isSymmetryAxisParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { variant: "axis"; shape: string; axisPercent: number }
> {
  return "variant" in params && params.variant === "axis";
}

export function isPrimeFactorTreeParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { variant: "factor-tree"; number: number; tree: { value: number } }
> {
  return "variant" in params && params.variant === "factor-tree";
}

export function isTriangleClassificationParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { variant: "triangle-classify"; ax: number; ask: "bySides" | "byAngles" }
> {
  return "variant" in params && params.variant === "triangle-classify";
}

export function isTriangleAngleSumParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { variant: "triangle-angle-sum"; hideAt: "A" | "B" | "C" }
> {
  return "variant" in params && params.variant === "triangle-angle-sum";
}

export function isAngleKindParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { variant: "angle-kind"; degrees: number }
> {
  return "variant" in params && params.variant === "angle-kind";
}

export function isIntersectingAnglesParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { variant: "intersecting-angles"; degrees: number; ask: string }
> {
  return "variant" in params && params.variant === "intersecting-angles";
}

export function isClockParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { hour: number; minute: number; ask: "hour" | "minute" }
> {
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

export function isUnitParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { value: number; fromUnit: string; toUnit: string }
> {
  return "value" in params && "fromUnit" in params && "toUnit" in params;
}

export function isNumberBondParams(params: TestWidgetParams): params is Extract<
  TestWidgetParams,
  { whole: number; partA: number; partB: number; ask: "partA" | "partB" | "whole" }
> {
  return "whole" in params && "partA" in params && "partB" in params && "ask" in params;
}

export function buildRandomTaskParams(slug: string): TestWidgetParams {
  return buildRandomWidgetParams(slug);
}

export function createEmptyWorkParams(target: TestWidgetParams): TestWidgetParams {
  if (isPrimeFactorTreeParams(target)) {
    return {
      ...target,
      tree: { value: target.number },
    };
  }

  if (isFractionParams(target)) {
    return {
      ...target,
      numerator: 0,
    };
  }

  if (isNumberLineParams(target)) {
    return { ...target };
  }

  if (isArithmeticParams(target)) {
    return { ...target };
  }

  if (isRatioParams(target)) {
    return { ...target };
  }

  if (isPolygonParams(target)) {
    return { ...target };
  }

  if (isShapeSortParams(target)) {
    return { ...target };
  }

  if (isSymmetryPictureParams(target)) {
    return { ...target, mirroredCells: [] };
  }

  if (isSymmetryAxisParams(target)) {
    return { ...target };
  }

  if (isClockParams(target)) {
    return { ...target };
  }

  if (isNumberBondParams(target)) {
    return { ...target };
  }

  if ("width" in target && "height" in target && "ask" in target) {
    return { ...target };
  }

  if ("value" in target && "fromUnit" in target) {
    return { ...target };
  }

  if (isComparisonParams(target)) {
    return { ...target };
  }

  return target;
}

export function answerFromWork(
  slug: string,
  work: TestWidgetParams,
  extras: { numericResult?: number; comparison?: "<" | "=" | ">"; label?: string; ratioPair?: { partA: number; partB: number } },
): TestWidgetAnswer {
  if (isPrimeFactorTreeParams(work)) {
    const leaves = collectPrimeLeaves(work.tree);
    if (!leaves) {
      return { label: "" };
    }
    return { label: factorsToLabel(leaves) };
  }

  if (isFractionParams(work)) {
    return { numerator: work.numerator, denominator: work.denominator };
  }

  if (isRatioParams(work) && work.ask === "simplify" && extras.ratioPair) {
    return { partA: extras.ratioPair.partA, partB: extras.ratioPair.partB };
  }

  if (isTriangleClassificationParams(work) && extras.label) {
    return { label: extras.label };
  }

  if (isAngleKindParams(work) && extras.label) {
    return { label: extras.label };
  }

  if (isSymmetryPictureParams(work)) {
    return { label: [...work.mirroredCells].sort().join("|") };
  }

  if (extras.label && (isShapeSortParams(work) || isSymmetryAxisParams(work))) {
    return { label: extras.label };
  }

  if (isComparisonParams(work) && extras.comparison) {
    return { comparison: extras.comparison };
  }

  if (typeof extras.numericResult === "number") {
    return { result: extras.numericResult };
  }

  if (isTriangleAngleSumParams(work)) {
    return { result: 0 };
  }

  if (isIntersectingAnglesParams(work)) {
    return { result: 0 };
  }

  const widget = getAssessmentWidget(slug);
  if (widget && isArithmeticParams(work)) {
    return { result: 0 };
  }

  return { result: 0 };
}

export function gradeTaskAttempt(
  slug: string,
  target: TestWidgetParams,
  work: TestWidgetParams,
  extras: { numericResult?: number; comparison?: "<" | "=" | ">"; label?: string; ratioPair?: { partA: number; partB: number } },
) {
  const widget = getAssessmentWidget(slug);
  if (!widget) {
    return { isCorrect: false, message: "Brak definicji widgetu." };
  }

  const answer = answerFromWork(slug, work, extras);
  const result = widget.grade(target, answer, 1);

  return {
    isCorrect: result.isCorrect,
    message: result.isCorrect
      ? "Dobrze! Twój model zgadza się z zadaniem."
      : "Jeszcze nie — spróbuj ponownie albo pokaż rozwiązanie.",
    expectedAnswer: result.expectedAnswer,
  };
}
