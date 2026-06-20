"use client";

import type { PointerEvent } from "react";
import { Card } from "@/components/ui/Card";
import { TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { isNumberLineParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

const MIN = -20;
const MAX = 20;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function valueToX(value: number, width: number, padding: number): number {
  const range = MAX - MIN;
  return padding + ((value - MIN) / range) * (width - padding * 2);
}

function xToValue(x: number, width: number, padding: number): number {
  const range = MAX - MIN;
  const ratio = (x - padding) / (width - padding * 2);
  return clamp(Math.round(MIN + ratio * range), MIN, MAX);
}

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveNumberLineVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveNumberLineVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveNumberLineVisualProps) {
  if (!isNumberLineParams(params)) {
    return null;
  }

  const start = params.start;
  const change = params.change;
  const expected = start + change;
  const userResult = numericResult ?? (mode === "demo" ? expected : start);
  const hideSolution = mode === "task" && !showSolution;
  const width = 900;
  const padding = 40;
  const axisY = 120;

  const handlePointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const viewBoxX = ((event.clientX - bounds.left) / bounds.width) * width;
    onNumericResultChange(xToValue(viewBoxX, width, padding));
  };

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Oś liczbowa</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? "Kliknij punkt na osi, w którym kończy się ruch."
              : "Przesuń liczby w panelu albo kliknij wynik na osi."}
          </p>
        </>
      )}
      <svg
        viewBox={`0 0 ${width} 220`}
        className="w-full touch-none rounded-2xl bg-slate-50"
        role="img"
        aria-label="Interaktywna oś liczbowa"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          handlePointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            handlePointer(event);
          }
        }}
      >
        <line x1={padding} y1={axisY} x2={width - padding} y2={axisY} stroke="#334155" strokeWidth="3" />
        {Array.from({ length: MAX - MIN + 1 }).map((_, index) => {
          const value = MIN + index;
          const x = valueToX(value, width, padding);
          const isMajor = value % 5 === 0;
          return (
            <g key={value}>
              <line
                x1={x}
                y1={axisY - (isMajor ? 12 : 7)}
                x2={x}
                y2={axisY + (isMajor ? 12 : 7)}
                stroke="#94a3b8"
                strokeWidth={isMajor ? 2 : 1}
              />
              {isMajor && (
                <text x={x} y={axisY + 32} textAnchor="middle" className="fill-slate-600 text-sm">
                  {value}
                </text>
              )}
            </g>
          );
        })}
        <circle cx={valueToX(start, width, padding)} cy={axisY} r="10" fill="#0ea5e9" />
        <circle cx={valueToX(userResult, width, padding)} cy={axisY} r="12" fill="#6366f1" className="cursor-pointer" />
        {!hideSolution && (
          <text x={valueToX(userResult, width, padding)} y={axisY - 24} textAnchor="middle" className="fill-indigo-700 text-base font-bold">
            {userResult}
          </text>
        )}
        {mode === "task" && showSolution && !compactChrome && (
          <text x={valueToX(expected, width, padding)} y={50} textAnchor="middle" className="fill-emerald-700 text-base font-bold">
            Rozwiązanie: {expected}
          </text>
        )}
      </svg>

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Start
            <input
              type="number"
              value={start}
              onChange={(event) => onChange({ ...params, start: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Zmiana
            <input
              type="number"
              value={change}
              onChange={(event) => onChange({ ...params, change: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      )}

      {!compactChrome && (
        <p className="text-center text-xl font-black text-indigo-700">
          {start} {change >= 0 ? "+" : "−"} {Math.abs(change)} = {hideSolution ? "?" : userResult}
        </p>
      )}

      <TaskAnswerPanel
        mode={mode}
        label="Twój wynik na osi"
        value={userResult}
        onChange={onNumericResultChange}
        showSolution={showSolution}
        expected={expected}
        step={1}
        placeValue
        compactChrome={compactChrome}
      />

      {!compactChrome && (
        <LessonNote>
          Kliknięcie na osi ustawia wynik ruchu. W zadaniu ukrywasz odpowiedź, a uczeń wskazuje punkt
          końcowy palcem lub myszką.
        </LessonNote>
      )}
    </Card>
  );
}
