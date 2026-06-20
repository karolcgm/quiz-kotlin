"use client";

import { useCallback, useState } from "react";
import { Card } from "@/components/ui/Card";
import { InteractiveEducationalVisual, type FractionShape } from "@/components/simulations/interactive/InteractiveEducationalVisual";
import { SimulationModePanel } from "@/components/simulations/shared/SimulationModePanel";
import {
  buildRandomTaskParams,
  createEmptyWorkParams,
  gradeTaskAttempt,
  isClockParams,
  isRatioParams,
  isTriangleClassificationParams,
  type SimulatorMode,
} from "@/lib/simulations/simulatorTaskMode";
import {
  presetTriangle,
  TRIANGLE_ANGLE_KINDS,
  TRIANGLE_SIDE_KINDS,
  formatTriangleClassLabel,
  type TriangleClassKind,
} from "@/lib/math/triangleClassification";
import {
  buildRandomWidgetParams,
  getAssessmentWidget,
} from "@/lib/simulations/registry";
import { isMisalignedGenericWidget } from "@/lib/simulations/widgetAlignment";
import { getSimulationBySlug } from "@/lib/routes";
import { SimulatorTaskHints } from "@/components/simulations/shared/SimulatorTaskHints";
import { NumericStepper } from "@/components/simulations/shared/NumericStepper";
import type { TestWidgetParams } from "@/types/testWidget";

const SINGLE_STEP_PARAM_KEYS = new Set([
  "hour",
  "minute",
  "missingIndex",
  "numerator",
  "denominator",
  "axisPercent",
  "sides",
  "sideLength",
  "width",
  "height",
]);

const HIDDEN_MANUAL_PARAM_KEYS = new Set([
  "ax",
  "ay",
  "bx",
  "by",
  "cx",
  "cy",
]);

function paramUsesPlaceValue(key: string): boolean {
  return !SINGLE_STEP_PARAM_KEYS.has(key);
}

interface AssessmentWidgetSimulatorProps {
  slug: string;
}

function ManualParamControls({
  params,
  onChange,
  disabled,
}: {
  params: TestWidgetParams;
  onChange: (params: TestWidgetParams) => void;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <p className="text-sm text-slate-600">
        W trybie zadania odpowiedź budujesz na schemacie — klikaj i przeciągaj zamiast wpisywać liczby.
      </p>
    );
  }

  if (isTriangleClassificationParams(params)) {
    const presets: { kind: TriangleClassKind; label: string }[] = [
      ...TRIANGLE_SIDE_KINDS.map((kind) => ({ kind, label: formatTriangleClassLabel(kind) })),
      ...TRIANGLE_ANGLE_KINDS.map((kind) => ({ kind, label: formatTriangleClassLabel(kind) })),
    ];

    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">
          Przeciągnij wierzchołek <strong>C</strong> na rysunku albo wczytaj gotowy przykład:
        </p>
        <div className="grid gap-2">
          {presets.map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              onClick={() =>
                onChange({
                  ...params,
                  ...presetTriangle(kind),
                })
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const visibleEntries = Object.entries(params).filter(
    ([key, value]) => typeof value === "number" && !HIDDEN_MANUAL_PARAM_KEYS.has(key),
  );

  if (visibleEntries.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        Parametry tej symulacji ustawiasz bezpośrednio na rysunku — klikaj, przeciągaj i wybieraj odpowiedzi.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <p className="sm:col-span-2 text-sm text-slate-600">
        Możesz też zmieniać liczby tutaj — przy większych wartościach użyj +1, +10 i +100.
      </p>
      {visibleEntries.map(([key, value]) =>
        paramUsesPlaceValue(key) ? (
          <NumericStepper
            key={key}
            label={key}
            value={value}
            onChange={(next) => onChange({ ...params, [key]: next })}
            placeValue
          />
        ) : (
          <NumericStepper
            key={key}
            label={key}
            value={value}
            onChange={(next) => onChange({ ...params, [key]: next })}
            step={1}
            min={key === "hour" ? 1 : 0}
            max={
              key === "hour"
                ? 12
                : key === "minute"
                  ? 45
                  : key === "missingIndex"
                    ? 3
                    : key === "numerator"
                      ? (params as { denominator?: number }).denominator ?? 24
                      : key === "denominator"
                        ? 24
                        : key === "sides"
                          ? 12
                          : key === "sideLength"
                            ? 12
                            : key === "width" || key === "height"
                              ? 12
                              : undefined
            }
          />
        ),
      )}
    </div>
  );
}

export function AssessmentWidgetSimulator({ slug }: AssessmentWidgetSimulatorProps) {
  const widget = getAssessmentWidget(slug);
  const simulation = getSimulationBySlug(slug);
  const defaultParams = widget?.defaultParams ?? { start: 4, change: -7 };

  const [mode, setMode] = useState<SimulatorMode>("demo");
  const [params, setParams] = useState<TestWidgetParams>(defaultParams);
  const [taskTarget, setTaskTarget] = useState<TestWidgetParams | null>(null);
  const [workParams, setWorkParams] = useState<TestWidgetParams>(defaultParams);
  const [showSolution, setShowSolution] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);
  const [fractionShape, setFractionShape] = useState<FractionShape>(
    slug === "ulamki-ciasto" ? "circle" : "rect",
  );
  const [numericResult, setNumericResult] = useState<number | null>(null);
  const [comparisonSign, setComparisonSign] = useState<"<" | "=" | ">" | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [ratioPair, setRatioPair] = useState({ partA: 1, partB: 1 });

  const startNewTask = useCallback(() => {
    const target = buildRandomTaskParams(slug);
    setTaskTarget(target);
    setWorkParams(createEmptyWorkParams(target));
    setNumericResult(isClockParams(target) ? 0 : null);
    setComparisonSign(null);
    setSelectedLabel(null);
    setRatioPair({ partA: 1, partB: 1 });
    setShowSolution(false);
    setTaskFeedback(null);
  }, [slug]);

  const handleModeChange = (nextMode: SimulatorMode) => {
    setMode(nextMode);
    setTaskFeedback(null);
    setShowSolution(false);
    if (nextMode === "task" && !taskTarget) {
      startNewTask();
    }
  };

  if (!widget) {
    return null;
  }

  const misaligned = isMisalignedGenericWidget(slug, widget, simulation);
  const effectiveMode = misaligned ? "demo" : mode;
  const displayParams = effectiveMode === "demo" ? params : workParams;

  const handleParamsChange = (next: TestWidgetParams) => {
    if (effectiveMode === "demo") {
      setParams(next);
      return;
    }
    setWorkParams(next);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <h2 className="text-2xl font-bold text-slate-900">{widget.title}</h2>
        <p className="mt-3 text-slate-600">{widget.lessonUse}</p>

        {misaligned && (
          <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">
            Ta symulacja ma jeszcze tylko tryb <strong>prezentacji</strong>. Interaktywne zadanie dla uczniów jest w
            przygotowaniu — obecny podgląd liczbowy nie odpowiada tematowi lekcji.
          </div>
        )}

        <div className="mt-6">
          <SimulationModePanel
            mode={effectiveMode}
            onModeChange={misaligned ? () => undefined : handleModeChange}
            onRandomDemo={() => setParams(buildRandomWidgetParams(slug))}
            onNewTask={misaligned ? () => undefined : startNewTask}
            onShowSolution={() => setShowSolution(true)}
            onCheckTask={() => {
              if (!taskTarget || misaligned) return;
              const result = gradeTaskAttempt(slug, taskTarget, workParams, {
                numericResult: numericResult ?? undefined,
                comparison: comparisonSign ?? undefined,
                label: selectedLabel ?? undefined,
                ratioPair: isRatioParams(taskTarget) ? ratioPair : undefined,
              });
              setTaskFeedback(result.message);
            }}
            showSolution={showSolution}
            taskFeedback={taskFeedback}
            taskActive={Boolean(taskTarget)}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold text-slate-900">
            {isTriangleClassificationParams(displayParams) ? "Przykłady" : "Panel liczb"}
          </h3>
          <div className="mt-4">
            <ManualParamControls
              params={displayParams}
              onChange={handleParamsChange}
              disabled={effectiveMode === "task"}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <InteractiveEducationalVisual
          slug={slug}
          visualKind={simulation?.visualKind ?? "game"}
          compactChrome
          params={displayParams}
          targetParams={misaligned ? null : taskTarget}
          mode={effectiveMode}
          showSolution={showSolution}
          fractionShape={fractionShape}
          onFractionShapeChange={setFractionShape}
          onChange={handleParamsChange}
          numericResult={numericResult}
          onNumericResultChange={setNumericResult}
          comparisonSign={comparisonSign}
          onComparisonSignChange={setComparisonSign}
          selectedLabel={selectedLabel}
          onSelectedLabelChange={setSelectedLabel}
          ratioPair={ratioPair}
          onRatioPairChange={setRatioPair}
        />

        <SimulatorTaskHints
          slug={slug}
          params={effectiveMode === "task" && taskTarget && !misaligned ? taskTarget : displayParams}
          revealAnswer={effectiveMode === "demo" || showSolution}
          taskMode={effectiveMode === "task" && !misaligned}
        />
      </div>
    </div>
  );
}
