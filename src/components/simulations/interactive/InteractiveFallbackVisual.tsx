"use client";

import { Card } from "@/components/ui/Card";
import { TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { PlaceValueVisual } from "@/components/simulations/shared/PlaceValueVisual";
import { getAssessmentWidget } from "@/lib/simulations/registry";
import {
  isArithmeticParams,
  isComparisonParams,
  isFractionParams,
  isNumberLineParams,
  isRatioParams,
} from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

function computeExpected(slug: string, params: TestWidgetParams): number | null {
  const widget = getAssessmentWidget(slug);
  if (!widget) return null;

  if (isFractionParams(params)) {
    return null;
  }

  const result = widget.grade(
    params,
    isComparisonParams(params) ? { comparison: "=" } : { result: Number.NaN },
    1,
  ).expectedAnswer;

  if ("result" in result && Number.isFinite(result.result)) {
    return result.result;
  }

  return null;
}

interface InteractiveFallbackVisualProps {
  slug: string;
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
}

export function InteractiveFallbackVisual({
  slug,
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
}: InteractiveFallbackVisualProps) {
  const taskParams = mode === "task" && targetParams ? targetParams : params;
  const expected = computeExpected(slug, taskParams);
  const userAnswer = numericResult ?? 0;

  const pair = (() => {
    if (isArithmeticParams(params)) return { a: params.left, b: params.right, label: "działanie" };
    if (isComparisonParams(params)) return { a: params.left, b: params.right, label: "porównanie" };
    if (isNumberLineParams(params)) return { a: params.start, b: params.change, label: "oś liczbowa" };
    if (isRatioParams(params)) return { a: params.partA, b: params.partB, label: "stosunek" };
    if (isFractionParams(params)) return { a: params.numerator, b: params.denominator, label: "ułamek" };
    return { a: 6, b: 3, label: "model" };
  })();

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Model zadania</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? "Użyj + / −, aby wpisać wynik zadania — bez klawiatury."
              : "Obserwuj dane zadania i sprawdź wynik poniżej."}
          </p>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <PlaceValueVisual value={pair.a} label="Lewa / start" accent="indigo" />
        <PlaceValueVisual value={pair.b} label="Prawa / zmiana" accent="emerald" />
      </div>

      <TaskAnswerPanel
        mode={mode}
        label="Twój wynik"
        value={userAnswer}
        onChange={onNumericResultChange}
        showSolution={showSolution}
        expected={expected}
        step={1}
        placeValue
        compactChrome={compactChrome}
      />
    </Card>
  );
}
