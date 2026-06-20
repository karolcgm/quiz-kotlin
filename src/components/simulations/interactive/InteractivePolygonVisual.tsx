"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { NumericStepper } from "@/components/simulations/shared/NumericStepper";
import {
  polygonInteriorAngle,
  polygonName,
  polygonNameOptions,
  polygonPerimeter,
  polygonVertices,
  pointsToPath,
  regularPolygonVertices,
} from "@/lib/math/polygon";
import { isPolygonParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

const MIN_SIDES = 3;
const MAX_SIDES = 12;

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

function Stepper({
  label,
  value,
  suffix,
  onDecrease,
  onIncrease,
  disabledDecrease,
  disabledIncrease,
  highlight,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  onDecrease: () => void;
  onIncrease: () => void;
  disabledDecrease?: boolean;
  disabledIncrease?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 ${highlight ? "bg-indigo-50 ring-2 ring-indigo-300" : "bg-white ring-1 ring-slate-200"}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={onDecrease}
          disabled={disabledDecrease}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black hover:bg-slate-50 disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-2xl font-black text-indigo-700">
          {value}
          {suffix ? <span className="text-base">{suffix}</span> : null}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={disabledIncrease}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black hover:bg-slate-50 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface InteractivePolygonVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  selectedLabel: string | null;
  onSelectedLabelChange: (value: string) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractivePolygonVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  selectedLabel,
  onSelectedLabelChange,
  onChange,
}: InteractivePolygonVisualProps) {
  if (!isPolygonParams(params)) {
    return null;
  }

  const taskParams =
    mode === "task" && targetParams && isPolygonParams(targetParams) ? targetParams : params;
  const sides = clamp(
    Math.round(mode === "task" ? taskParams.sides : params.sides),
    MIN_SIDES,
    MAX_SIDES,
  );
  const sideLength = clamp(
    Math.round(mode === "task" ? taskParams.sideLength : params.sideLength),
    1,
    12,
  );
  const ask = taskParams.ask;
  const hideName = mode === "task" && ask === "name" && !showSolution;

  const perimeter = polygonPerimeter(sides, sideLength);
  const vertices = polygonVertices(sides);
  const interiorAngle = Math.round(polygonInteriorAngle(sides));
  const name = polygonName(sides);
  const userAnswer = numericResult ?? 0;

  const nameOptions = useMemo(
    () => polygonNameOptions(taskParams.sides),
    [taskParams.sides, mode, showSolution],
  );

  const cx = 200;
  const cy = 190;
  const radius = 120;
  const polygonPoints = regularPolygonVertices(sides, cx, cy, radius);

  const updateSides = (nextSides: number) => {
    onChange({ ...params, sides: clamp(nextSides, MIN_SIDES, MAX_SIDES) });
  };

  const updateSideLength = (nextLength: number) => {
    onChange({ ...params, sideLength: clamp(nextLength, 1, 12) });
  };

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Wielokąt foremny</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? ask === "name"
                ? "Policz boki i wierzchołki, potem wybierz nazwę figury."
                : ask === "perimeter"
                  ? "Każdy bok ma taką samą długość — użyj + / −, aby wpisać obwód."
                  : ask === "vertices"
                    ? "Policz wierzchołki (rogaliki) i wpisz wynik."
                    : "Kąt wewnętrzny — wpisz miarę w stopniach (+ / −)."
              : "Zmieniaj liczbę boków i długość boku. Obserwuj wierzchołki, kąty i obwód."}
          </p>
        </>
      )}

      <svg viewBox="0 0 400 360" className="w-full rounded-2xl bg-slate-50" role="img" aria-label="Wielokąt foremny">
        <polygon
          points={pointsToPath(polygonPoints)}
          fill="#c7d2fe"
          stroke="#4338ca"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {polygonPoints.map((vertex, index) => {
          const next = polygonPoints[(index + 1) % polygonPoints.length];
          const midX = (vertex.x + next.x) / 2;
          const midY = (vertex.y + next.y) / 2;
          const labelOffsetX = (midX - cx) * 0.15;
          const labelOffsetY = (midY - cy) * 0.15;

          return (
            <g key={`side-${index}`}>
              <line x1={vertex.x} y1={vertex.y} x2={next.x} y2={next.y} stroke="#312e81" strokeWidth="2" />
              <text
                x={midX + labelOffsetX}
                y={midY + labelOffsetY}
                textAnchor="middle"
                className="fill-indigo-900 text-xs font-bold"
              >
                {sideLength} cm
              </text>
            </g>
          );
        })}

        {polygonPoints.map((vertex, index) => (
          <g key={`vertex-${index}`}>
            <circle cx={vertex.x} cy={vertex.y} r="8" fill="#6366f1" stroke="#fff" strokeWidth="2" />
            <text
              x={vertex.x + (vertex.x - cx) * 0.18}
              y={vertex.y + (vertex.y - cy) * 0.18}
              textAnchor="middle"
              className="fill-indigo-950 text-xs font-black"
            >
              W{index + 1}
            </text>
          </g>
        ))}

        {polygonPoints.map((vertex, index) => {
          const prev = polygonPoints[(index - 1 + polygonPoints.length) % polygonPoints.length];
          const next = polygonPoints[(index + 1) % polygonPoints.length];
          const v1x = prev.x - vertex.x;
          const v1y = prev.y - vertex.y;
          const v2x = next.x - vertex.x;
          const v2y = next.y - vertex.y;
          const angle1 = Math.atan2(v1y, v1x);
          const angle2 = Math.atan2(v2y, v2x);
          const arcRadius = 22;
          const startX = vertex.x + arcRadius * Math.cos(angle1);
          const startY = vertex.y + arcRadius * Math.sin(angle1);
          const endX = vertex.x + arcRadius * Math.cos(angle2);
          const endY = vertex.y + arcRadius * Math.sin(angle2);
          const largeArc = 0;

          return (
            <g key={`angle-${index}`}>
              <path
                d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${endX} ${endY}`}
                fill="none"
                stroke="#059669"
                strokeWidth="2"
              />
              {(index === 0 || mode === "demo") && (
                <text
                  x={vertex.x + (vertex.x - cx) * 0.08}
                  y={vertex.y + (vertex.y - cy) * 0.08}
                  textAnchor="middle"
                  className="fill-emerald-800 text-[10px] font-bold"
                >
                  {mode === "demo" || showSolution ? `${interiorAngle}°` : "?"}
                </text>
              )}
            </g>
          );
        })}

        <text x={cx} y={cy} textAnchor="middle" className="fill-slate-800 text-lg font-black">
          {hideName ? `${sides} boków` : name}
        </text>
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        <Stepper
          label="Liczba boków"
          value={sides}
          onDecrease={() => updateSides(sides - 1)}
          onIncrease={() => updateSides(sides + 1)}
          disabledDecrease={sides <= MIN_SIDES || mode === "task"}
          disabledIncrease={sides >= MAX_SIDES || mode === "task"}
        />
        <Stepper
          label="Długość boku"
          value={sideLength}
          suffix=" cm"
          onDecrease={() => updateSideLength(sideLength - 1)}
          onIncrease={() => updateSideLength(sideLength + 1)}
          disabledDecrease={sideLength <= 1 || mode === "task"}
          disabledIncrease={sideLength >= 12 || mode === "task"}
        />

        {mode === "demo" ? (
          <>
            <div className="rounded-2xl bg-indigo-50 p-3 ring-1 ring-indigo-200">
              <p className="text-xs font-bold uppercase text-indigo-600">Wierzchołki</p>
              <p className="mt-1 text-center text-3xl font-black text-indigo-700">{vertices}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
              <p className="text-xs font-bold uppercase text-emerald-600">Obwód</p>
              <p className="mt-1 text-center text-3xl font-black text-emerald-700">{perimeter} cm</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200 sm:col-span-2">
              <p className="text-xs font-bold uppercase text-amber-700">Nazwa figury</p>
              <p className="mt-1 text-center text-2xl font-black text-amber-900">{name}</p>
            </div>
          </>
        ) : ask === "name" ? (
          <div className="sm:col-span-2 space-y-2">
            <p className="text-sm font-bold text-slate-700">Wybierz nazwę figury:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {nameOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectedLabelChange(option)}
                  className={`rounded-xl px-4 py-3 text-lg font-bold ${
                    selectedLabel === option
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <NumericStepper
            label={
              ask === "perimeter"
                ? "Twój obwód (cm)"
                : ask === "vertices"
                  ? "Liczba wierzchołków"
                  : "Kąt wewnętrzny (°)"
            }
            value={userAnswer}
            onChange={onNumericResultChange}
            placeValue
            highlight
          />
        )}
      </div>

      {mode === "demo" && !compactChrome && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["name", "Ćwicz nazwę"],
              ["perimeter", "Ćwicz obwód"],
              ["vertices", "Ćwicz wierzchołki"],
              ["interiorAngle", "Ćwicz kąt"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...params, ask: value })}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                params.ask === value ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {mode === "task" && showSolution && !compactChrome && (
        <div className="rounded-xl bg-emerald-50 p-4 text-center font-bold text-emerald-800">
          Rozwiązanie:{" "}
          {ask === "name"
            ? polygonName(taskParams.sides)
            : ask === "perimeter"
              ? `${polygonPerimeter(taskParams.sides, taskParams.sideLength)} cm`
              : ask === "vertices"
                ? polygonVertices(taskParams.sides)
                : `${Math.round(polygonInteriorAngle(taskParams.sides))}°`}
        </div>
      )}

      {!compactChrome && (
        <LessonNote>
          Wierzchołki (W1, W2…) to rogi figury. Długości boków widać przy krawędziach. W zadaniu najpierw
          niech uczeń nazwie figurę lub policzy obwód — dopiero potem pokaż rozwiązanie.
        </LessonNote>
      )}
    </Card>
  );
}
