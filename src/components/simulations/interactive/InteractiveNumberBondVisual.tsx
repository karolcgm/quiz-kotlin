"use client";

import { Card } from "@/components/ui/Card";
import { NumberBondHouse } from "@/components/simulations/shared/NumberBondHouseVisual";
import { PlaceValueVisual } from "@/components/simulations/shared/PlaceValueVisual";
import { NumericStepper, TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { formatPlaceValueSummary } from "@/lib/math/placeValue";
import { isNumberBondParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

function bondExpected(params: { whole: number; partA: number; partB: number; ask: "partA" | "partB" | "whole" }) {
  if (params.ask === "partA") return params.partA;
  if (params.ask === "partB") return params.partB;
  return params.whole;
}

interface InteractiveNumberBondVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveNumberBondVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveNumberBondVisualProps) {
  if (!isNumberBondParams(params)) {
    return null;
  }

  const display =
    mode === "task" && targetParams && isNumberBondParams(targetParams) ? targetParams : params;
  const expected = bondExpected(display);
  const userAnswer = numericResult ?? 0;
  const hideMissing = mode === "task" && !showSolution;

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Domki liczbowe — rozkład liczby</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? "Uzupełnij brakujący składnik w domku — użyj + / −, bez liczenia klocków po jednym."
              : "Zmieniaj liczby i obserwuj, jak całość rozkłada się na dwa składniki."}
          </p>
        </>
      )}

      <NumberBondHouse
        whole={display.ask === "whole" && hideMissing ? "?" : display.whole}
        partA={display.ask === "partA" && hideMissing ? "?" : display.partA}
        partB={display.ask === "partB" && hideMissing ? "?" : display.partB}
        highlight={display.ask}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <PlaceValueVisual value={display.partA} label="Składnik A" accent="indigo" />
        <PlaceValueVisual value={display.partB} label="Składnik B" accent="emerald" />
        <PlaceValueVisual value={display.whole} label="Całość" accent="amber" />
      </div>

      <p className="text-center text-lg font-bold text-slate-700">
        {display.partA} + {display.partB} = {display.whole}
        <span className="mt-1 block text-sm font-semibold text-slate-500">
          {formatPlaceValueSummary(display.whole)}
        </span>
      </p>

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumericStepper
            label="Całość (dach)"
            value={params.whole}
            onChange={(value) => {
              const whole = Math.max(2, value);
              const partA = Math.min(params.partA, whole - 1);
              onChange({ ...params, whole, partA, partB: whole - partA });
            }}
            placeValue
            min={2}
          />
          <NumericStepper
            label="Składnik A"
            value={params.partA}
            onChange={(value) => {
              const partA = Math.min(Math.max(1, value), params.whole - 1);
              onChange({ ...params, partA, partB: params.whole - partA });
            }}
            placeValue
            min={1}
          />
        </div>
      )}

      <TaskAnswerPanel
        mode={mode}
        label={
          display.ask === "partB"
            ? "Brakujący składnik B"
            : display.ask === "partA"
              ? "Brakujący składnik A"
              : "Całość"
        }
        value={userAnswer}
        onChange={onNumericResultChange}
        showSolution={showSolution}
        expected={expected}
        step={1}
        placeValue
        compactChrome={compactChrome}
      />

      {!compactChrome && (
        <LessonNote>
          Zamiast 130 klocków pokazujemy setki, dziesiątki i jedności. W domku liczbowym liczba na dachu
          to suma dwóch składników u dołu — np. 100 + 30 = 130.
        </LessonNote>
      )}
    </Card>
  );
}
