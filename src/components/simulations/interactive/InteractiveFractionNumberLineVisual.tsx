"use client";

import type { PointerEvent } from "react";
import { Card } from "@/components/ui/Card";
import { isFractionParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

const WIDTH = 900;
const PADDING = 56;
const AXIS_Y = 110;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function tickLabel(numerator: number, denominator: number) {
  if (numerator === 0) return "0";
  if (numerator === denominator) return "1";
  return `${numerator}/${denominator}`;
}

function valueToX(numerator: number, denominator: number) {
  const ratio = numerator / denominator;
  return PADDING + ratio * (WIDTH - PADDING * 2);
}

function xToNumerator(x: number, denominator: number) {
  const ratio = clamp((x - PADDING) / (WIDTH - PADDING * 2), 0, 1);
  return clamp(Math.round(ratio * denominator), 0, denominator);
}

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveFractionNumberLineVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveFractionNumberLineVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  onChange,
}: InteractiveFractionNumberLineVisualProps) {
  if (!isFractionParams(params)) {
    return null;
  }

  const numerator = clamp(params.numerator, 0, params.denominator);
  const denominator = clamp(params.denominator, 2, 12);
  const targetNumerator =
    targetParams && isFractionParams(targetParams)
      ? clamp(targetParams.numerator, 0, targetParams.denominator)
      : numerator;
  const targetDenominator =
    targetParams && isFractionParams(targetParams) ? targetParams.denominator : denominator;
  const taskDenominator =
    mode === "task" && targetParams && isFractionParams(targetParams) ? targetDenominator : denominator;

  const setPosition = (nextNumerator: number) => {
    onChange({
      ...params,
      denominator: taskDenominator,
      numerator: clamp(nextNumerator, 0, taskDenominator),
    });
  };

  const changeDenominator = (delta: number) => {
    if (mode === "task") return;
    const nextDenominator = clamp(denominator + delta, 2, 12);
    onChange({
      ...params,
      denominator: nextDenominator,
      numerator: clamp(numerator, 0, nextDenominator),
    });
  };

  const handlePointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const viewBoxX = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    setPosition(xToNumerator(viewBoxX, taskDenominator));
  };

  const markerX = valueToX(numerator, taskDenominator);
  const solutionX = valueToX(targetNumerator, targetDenominator);
  const showSolutionMarker = mode === "task" && showSolution;

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Ułamki na osi liczbowej</h3>
          <p className="text-sm font-semibold text-slate-600">
            Oś od 0 do 1 pokazuje, gdzie leży ułamek — im dalej w prawo, tym większa część całości.
          </p>
        </>
      )}

      {mode === "task" && targetParams && isFractionParams(targetParams) && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Twoje zadanie</p>
          <p className="mt-1 text-2xl font-black text-indigo-900">
            Wskaż na osi położenie ułamka {targetNumerator}/{targetDenominator}
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-700">
            Kliknij miejsce między 0 a 1 — oś jest podzielona na {targetDenominator} równych części.
          </p>
        </div>
      )}

      {mode !== "task" && !compactChrome && (
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-50 p-3">
          <span className="text-sm font-semibold text-slate-600">Podziałki na osi:</span>
          <button
            type="button"
            onClick={() => changeDenominator(-1)}
            disabled={denominator <= 2}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Mniej podziałek"
          >
            −
          </button>
          <span className="min-w-[3rem] text-center text-lg font-black text-indigo-700">{denominator}</span>
          <button
            type="button"
            onClick={() => changeDenominator(1)}
            disabled={denominator >= 12}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-black text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            aria-label="Więcej podziałek"
          >
            +
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 touch-manipulation">
        <svg
          viewBox={`0 0 ${WIDTH} 200`}
          className="mx-auto w-full max-w-full cursor-crosshair select-none"
          role="img"
          aria-label="Oś liczbowa od 0 do 1 z podziałkami ułamkowymi"
          onPointerDown={handlePointer}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return;
            handlePointer(event);
          }}
        >
          <line
            x1={PADDING}
            y1={AXIS_Y}
            x2={WIDTH - PADDING}
            y2={AXIS_Y}
            stroke="#334155"
            strokeWidth={4}
            strokeLinecap="round"
          />

          {Array.from({ length: taskDenominator + 1 }).map((_, index) => {
            const x = valueToX(index, taskDenominator);
            const isMajor = index === 0 || index === taskDenominator;
            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={AXIS_Y - (isMajor ? 18 : 12)}
                  x2={x}
                  y2={AXIS_Y + (isMajor ? 18 : 12)}
                  stroke={isMajor ? "#1e293b" : "#94a3b8"}
                  strokeWidth={isMajor ? 3 : 2}
                />
                <text
                  x={x}
                  y={AXIS_Y + 44}
                  textAnchor="middle"
                  className="fill-slate-700 text-[15px] font-bold"
                >
                  {tickLabel(index, taskDenominator)}
                </text>
                {!isMajor && (
                  <circle
                    cx={x}
                    cy={AXIS_Y}
                    r={14}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setPosition(index)}
                  />
                )}
              </g>
            );
          })}

          {showSolutionMarker && (
            <g>
              <polygon
                points={`${solutionX},${AXIS_Y - 36} ${solutionX - 12},${AXIS_Y - 58} ${solutionX + 12},${AXIS_Y - 58}`}
                fill="#10b981"
              />
              <text
                x={solutionX}
                y={AXIS_Y - 66}
                textAnchor="middle"
                className="fill-emerald-700 text-[14px] font-black"
              >
                {targetNumerator}/{targetDenominator}
              </text>
            </g>
          )}

          <g>
            <polygon
              points={`${markerX},${AXIS_Y - 28} ${markerX - 10},${AXIS_Y - 48} ${markerX + 10},${AXIS_Y - 48}`}
              fill="#4f46e5"
            />
            <text
              x={markerX}
              y={AXIS_Y - 54}
              textAnchor="middle"
              className="fill-indigo-700 text-[14px] font-black"
            >
              {numerator}/{taskDenominator}
            </text>
          </g>
        </svg>
      </div>

      <div className="rounded-2xl bg-indigo-50 p-4 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Twój wybór</p>
        <p className="mt-1 text-3xl font-black text-indigo-900">
          {numerator}/{taskDenominator}
        </p>
        <p className="mt-1 text-sm font-semibold text-indigo-700">
          {numerator === 0
            ? "Początek osi — zero całości."
            : numerator === taskDenominator
              ? "Koniec osi — jedna cała."
              : `${numerator} z ${taskDenominator} równych części między 0 a 1.`}
        </p>
      </div>

      {!compactChrome && (
        <LessonNote>
          <strong>Pomysł na lekcję:</strong> najpierw wspólnie zaznacz 1/2, 1/4 i 3/4, potem poproś uczniów o
          uporządkowanie ułamków od najmniejszego do największego — położenie na osi od razu pokazuje kolejność.
        </LessonNote>
      )}
    </Card>
  );
}
