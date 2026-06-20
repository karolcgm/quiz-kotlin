"use client";

import type { PointerEvent } from "react";
import { Card } from "@/components/ui/Card";
import { NumericStepper, TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { convertLengthValue, formatNumericAnswer, UNIT_ORDER, type LengthUnit } from "@/lib/math/units";
import { isUnitParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveUnitConversionVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveUnitConversionVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveUnitConversionVisualProps) {
  if (!isUnitParams(params)) {
    return null;
  }

  const display =
    mode === "task" && targetParams && isUnitParams(targetParams) ? targetParams : params;
  const userAnswer = numericResult ?? 0;
  const expected = convertLengthValue(display.value, display.fromUnit, display.toUnit);
  const hideAnswer = mode === "task" && !showSolution;

  const updateValue = (nextValue: number) => {
    onChange({ ...params, value: Math.max(0, nextValue) });
  };

  const setUnit = (field: "fromUnit" | "toUnit", unit: LengthUnit) => {
    if (mode === "task") return;
    onChange({ ...params, [field]: unit });
  };

  const updateFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (mode === "task" || !isUnitParams(params)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const viewBoxX = ((event.clientX - rect.left) / rect.width) * 560;
    const relative = Math.max(0, Math.min(1, (viewBoxX - 60) / 440));
    updateValue(Math.round(relative * 500));
  };

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Jednostki długości</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? "Przelicz wartość na docelową jednostkę — użyj + / − przy odpowiedzi (także +0.1 / −0.1)."
              : "Kliknij jednostki, zmieniaj wartość na miarce i obserwuj przeliczenie."}
          </p>
        </>
      )}

      <div className="grid grid-cols-4 gap-2">
        {UNIT_ORDER.map((unit) => (
          <div key={unit} className="space-y-2">
            <button
              type="button"
              disabled={mode === "task"}
              onClick={() => setUnit("fromUnit", unit)}
              className={`w-full rounded-xl px-2 py-2 text-sm font-bold ${
                display.fromUnit === unit ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-900"
              }`}
            >
              z: {unit}
            </button>
            <button
              type="button"
              disabled={mode === "task"}
              onClick={() => setUnit("toUnit", unit)}
              className={`w-full rounded-xl px-2 py-2 text-sm font-bold ${
                display.toUnit === unit ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-900"
              }`}
            >
              na: {unit}
            </button>
          </div>
        ))}
      </div>

      <svg
        viewBox="0 0 560 180"
        className="w-full touch-none rounded-2xl bg-slate-50"
        role="img"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) updateFromPointer(event);
        }}
      >
        <rect x="40" y="70" width="480" height="44" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
        {Array.from({ length: 11 }).map((_, index) => (
          <g key={index}>
            <line x1={60 + index * 44} y1="70" x2={60 + index * 44} y2={index % 2 === 0 ? 120 : 105} stroke="#92400e" strokeWidth="3" />
            <text x={60 + index * 44} y="145" textAnchor="middle" className="fill-slate-700 text-xs font-bold">
              {index * 50}
            </text>
          </g>
        ))}
        <circle
          cx={60 + Math.min(display.value / 500, 1) * 440}
          cy="92"
          r="14"
          fill="#4f46e1"
          className={mode === "task" ? "" : "cursor-grab"}
        />
      </svg>

      <div className="rounded-2xl bg-slate-50 p-4 text-center">
        <p className="text-3xl font-black text-slate-900">
          {display.value} {display.fromUnit} = {hideAnswer ? "?" : formatNumericAnswer(expected)} {display.toUnit}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {mode === "demo" && !compactChrome && (
          <NumericStepper
            label={`Wartość (${display.fromUnit})`}
            value={params.value}
            onChange={updateValue}
            step={10}
            fineStep={1}
          />
        )}
        <TaskAnswerPanel
          mode={mode}
          label={`Twoja odpowiedź (${display.toUnit})`}
          value={userAnswer}
          onChange={onNumericResultChange}
          showSolution={showSolution}
          expected={expected}
          step={1}
          fineStep={0.1}
          suffix={display.toUnit}
          compactChrome={compactChrome}
        />
      </div>

      {!compactChrome && (
        <LessonNote>
          mm → cm dziel przez 10, cm → m dziel przez 100, m → km dziel przez 1000. W zadaniu wpisuj wynik
          przyciskami + / − — bez klawiatury.
        </LessonNote>
      )}
    </Card>
  );
}
