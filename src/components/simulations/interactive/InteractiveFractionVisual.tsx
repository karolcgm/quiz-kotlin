"use client";

import { Card } from "@/components/ui/Card";
import { isFractionParams } from "@/lib/simulations/simulatorTaskMode";
import type { FractionShape } from "@/components/simulations/interactive/types";
import type { TestWidgetParams } from "@/types/testWidget";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveFractionVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  shape: FractionShape;
  onShapeChange: (shape: FractionShape) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveFractionVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  shape,
  onShapeChange,
  onChange,
}: InteractiveFractionVisualProps) {
  if (!isFractionParams(params)) {
    return null;
  }

  const numerator = clamp(params.numerator, 0, params.denominator);
  const denominator = clamp(params.denominator, 1, 24);
  const targetNumerator =
    targetParams && isFractionParams(targetParams)
      ? clamp(targetParams.numerator, 0, targetParams.denominator)
      : numerator;
  const targetDenominator =
    targetParams && isFractionParams(targetParams) ? targetParams.denominator : denominator;
  const taskDenominator =
    mode === "task" && targetParams && isFractionParams(targetParams) ? targetDenominator : denominator;

  const selectSlice = (index: number) => {
    onChange({
      ...params,
      denominator: taskDenominator,
      numerator: index + 1,
    });
  };

  const changeDenominator = (delta: number) => {
    if (mode === "task") return;
    selectDenominator(denominator + delta);
  };

  const selectDenominator = (nextDenominator: number) => {
    if (mode === "task") return;
    const safeDenominator = clamp(nextDenominator, 1, 24);
    onChange({
      ...params,
      denominator: safeDenominator,
      numerator: clamp(numerator, 0, safeDenominator),
    });
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!compactChrome && (
          <h3 className="text-2xl font-bold text-slate-900">Ułamek — krojenie ciasta</h3>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onShapeChange("rect")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              shape === "rect" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"
            }`}
          >
            Kwadraty
          </button>
          <button
            type="button"
            onClick={() => onShapeChange("circle")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              shape === "circle" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"
            }`}
          >
            Koło
          </button>
        </div>
      </div>

      {mode === "task" && targetParams && isFractionParams(targetParams) && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Twoje zadanie</p>
          <p className="mt-1 text-2xl font-black text-indigo-900">
            Pokoloruj {targetNumerator} z {targetDenominator} równych kawałków
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-700">
            Ułamek do ustawienia: {targetNumerator}/{targetDenominator}
          </p>
        </div>
      )}

      {!compactChrome && mode !== "task" && (
        <p className="text-sm font-semibold text-slate-600">
          Kliknij kawałek od lewej — wypełnią się wszystkie części do tego miejsca.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-slate-50 p-4">
        {mode === "task" && (
          <p className="w-full text-center text-sm font-bold uppercase tracking-wide text-emerald-700">
            Twój ułamek
          </p>
        )}
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Licznik</p>
          <p className="text-3xl font-black text-indigo-700">{numerator}</p>
        </div>
        <span className="text-3xl font-black text-slate-300">/</span>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mianownik</p>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeDenominator(-1)}
              disabled={mode === "task" || denominator <= 1}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Odejmij kawałek od całości"
            >
              −
            </button>
            <span className="min-w-[2.5rem] text-center text-3xl font-black text-indigo-700">{taskDenominator}</span>
            <button
              type="button"
              onClick={() => changeDenominator(1)}
              disabled={mode === "task" || denominator >= 24}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Dodaj kawałek do całości"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {shape === "rect" ? (
        <div
          className="grid gap-2 touch-manipulation"
          style={{ gridTemplateColumns: `repeat(${Math.min(taskDenominator, 12)}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: taskDenominator }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectSlice(index)}
              className={`h-16 rounded-xl border-2 transition ${
                index < numerator
                  ? "border-indigo-700 bg-indigo-500 shadow-md"
                  : "border-indigo-100 bg-white hover:bg-indigo-50"
              } ${showSolution && index < targetNumerator ? "ring-2 ring-emerald-400 ring-offset-2" : ""}`}
              aria-label={`Kawałek ${index + 1} z ${taskDenominator}`}
            />
          ))}
        </div>
      ) : (
        <svg viewBox="0 0 320 320" className="mx-auto w-full max-w-sm touch-manipulation" role="img">
          <circle cx="160" cy="160" r="130" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
          {Array.from({ length: taskDenominator }).map((_, index) => {
            const startAngle = (index / taskDenominator) * 360 - 90;
            const endAngle = ((index + 1) / taskDenominator) * 360 - 90;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const x1 = 160 + 130 * Math.cos(startRad);
            const y1 = 160 + 130 * Math.sin(startRad);
            const x2 = 160 + 130 * Math.cos(endRad);
            const y2 = 160 + 130 * Math.sin(endRad);
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            const filled = index < numerator;

            return (
              <g key={index}>
                <path
                  d={`M 160 160 L ${x1} ${y1} A 130 130 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={filled ? "#6366f1" : "#ffffff"}
                  stroke="#4338ca"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-90"
                  onClick={() => selectSlice(index)}
                />
                {showSolution && index < targetNumerator && (
                  <path
                    d={`M 160 160 L ${x1} ${y1} A 130 130 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                  />
                )}
              </g>
            );
          })}
          <text x="160" y="168" textAnchor="middle" className="fill-slate-800 text-2xl font-black">
            {numerator}/{taskDenominator}
          </text>
        </svg>
      )}

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Licznik
            <input
              type="number"
              min={0}
              max={denominator}
              value={numerator}
              onChange={(event) =>
                onChange({
                  ...params,
                  numerator: clamp(Number(event.target.value), 0, denominator),
                })
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Mianownik (ile kawałków)
            <input
              type="number"
              min={1}
              max={24}
              value={denominator}
              onChange={(event) => selectDenominator(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      )}

      {mode === "task" && showSolution && !compactChrome && targetParams && isFractionParams(targetParams) && (
        <p className="text-center text-lg font-bold text-emerald-700">
          Rozwiązanie: {targetNumerator}/{targetDenominator}
        </p>
      )}

      {!compactChrome && (
        <LessonNote>
          Licznik ustawiasz klikając kawałki ciasta. Mianownik zmieniasz przyciskami + i − — na tablicy
          dotykowej dzieci mogą też dodawać lub odejmować kawałki bez wpisywania liczb.
        </LessonNote>
      )}
    </Card>
  );
}
