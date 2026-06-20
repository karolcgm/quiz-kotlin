"use client";

import type { PointerEvent } from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { NumericStepper } from "@/components/simulations/shared/NumericStepper";
import { isRectangleParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

const CELL = 22;
const ORIGIN_X = 72;
const ORIGIN_Y = 56;
const MAX_WIDTH = 16;
const MAX_HEIGHT = 10;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rectangleArea(width: number, height: number) {
  return width * height;
}

function rectanglePerimeter(width: number, height: number) {
  return 2 * (width + height);
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
  onDecrease,
  onIncrease,
  disabledDecrease,
  disabledIncrease,
  highlight,
}: {
  label: string;
  value: number;
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
          aria-label={`Zmniejsz ${label}`}
        >
          −
        </button>
        <span className="min-w-[3rem] text-center text-3xl font-black text-indigo-700">{value}</span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={disabledIncrease}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black hover:bg-slate-50 disabled:opacity-40"
          aria-label={`Zwiększ ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface InteractiveRectangleVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveRectangleVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveRectangleVisualProps) {
  if (!isRectangleParams(params)) {
    return null;
  }

  const width = clamp(Math.round(params.width), 1, MAX_WIDTH);
  const height = clamp(Math.round(params.height), 1, MAX_HEIGHT);
  const ask =
    mode === "task" && targetParams && isRectangleParams(targetParams) ? targetParams.ask : params.ask;

  const area = rectangleArea(width, height);
  const perimeter = rectanglePerimeter(width, height);
  const expectedAnswer = ask === "area" ? area : perimeter;
  const userAnswer = numericResult ?? 0;
  const [practiceArea, setPracticeArea] = useState(area);
  const [practicePerimeter, setPracticePerimeter] = useState(perimeter);

  useEffect(() => {
    setPracticeArea(area);
    setPracticePerimeter(perimeter);
  }, [area, perimeter, mode, targetParams]);

  const rectPixelWidth = width * CELL;
  const rectPixelHeight = height * CELL;
  const gridWidth = MAX_WIDTH * CELL;
  const gridHeight = MAX_HEIGHT * CELL;
  const svgWidth = ORIGIN_X + gridWidth + 56;
  const svgHeight = ORIGIN_Y + gridHeight + 48;

  const updateDimensions = (nextWidth: number, nextHeight: number) => {
    onChange({
      ...params,
      width: clamp(nextWidth, 1, MAX_WIDTH),
      height: clamp(nextHeight, 1, MAX_HEIGHT),
    });
  };

  const updateFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const viewBoxX = ((event.clientX - bounds.left) / bounds.width) * svgWidth;
    const viewBoxY = ((event.clientY - bounds.top) / bounds.height) * svgHeight;
    updateDimensions(
      clamp(Math.round((viewBoxX - ORIGIN_X) / CELL), 1, MAX_WIDTH),
      clamp(Math.round((viewBoxY - ORIGIN_Y) / CELL), 1, MAX_HEIGHT),
    );
  };

  const gridPatternId = "rectangle-grid-pattern";

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Prostokąt na siatce</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? ask === "area"
                ? "Policz pole — ile kratek mieści się w środku? Użyj + / − przy odpowiedzi."
                : "Policz obwód — dodaj długości wszystkich boków. Użyj + / − przy odpowiedzi."
              : "Zmieniaj boki na siatce i obserwuj pole oraz obwód."}
          </p>
        </>
      )}

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full touch-none rounded-2xl bg-slate-50"
        role="img"
        aria-label={`Prostokąt ${width} na ${height} kratek`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          updateFromPointer(event);
        }}
      >
        <defs>
          <pattern id={gridPatternId} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <rect width={CELL} height={CELL} fill="#f8fafc" stroke="#dbeafe" strokeWidth="1" />
          </pattern>
        </defs>

        <rect
          x={ORIGIN_X}
          y={ORIGIN_Y}
          width={gridWidth}
          height={gridHeight}
          fill={`url(#${gridPatternId})`}
        />

        {Array.from({ length: width * height }).map((_, index) => {
          const col = index % width;
          const row = Math.floor(index / width);
          return (
            <rect
              key={index}
              x={ORIGIN_X + col * CELL}
              y={ORIGIN_Y + row * CELL}
              width={CELL}
              height={CELL}
              fill="#93c5fd"
              stroke="#3b82f6"
              strokeWidth="1.5"
              opacity={0.85}
            />
          );
        })}

        <rect
          x={ORIGIN_X}
          y={ORIGIN_Y}
          width={rectPixelWidth}
          height={rectPixelHeight}
          fill="none"
          stroke="#312e81"
          strokeWidth="4"
          rx="4"
        />

        {/* szerokość — nad górną krawędzią */}
        <line
          x1={ORIGIN_X}
          y1={ORIGIN_Y - 18}
          x2={ORIGIN_X + rectPixelWidth}
          y2={ORIGIN_Y - 18}
          stroke="#4338ca"
          strokeWidth="2"
        />
        <text
          x={ORIGIN_X + rectPixelWidth / 2}
          y={ORIGIN_Y - 26}
          textAnchor="middle"
          className="fill-indigo-800 text-base font-black"
        >
          {width}
        </text>
        <text
          x={ORIGIN_X + rectPixelWidth / 2}
          y={ORIGIN_Y - 8}
          textAnchor="middle"
          className="fill-indigo-600 text-[10px] font-bold"
        >
          szerokość
        </text>

        {/* wysokość — przy lewej krawędzi */}
        <line
          x1={ORIGIN_X - 18}
          y1={ORIGIN_Y}
          x2={ORIGIN_X - 18}
          y2={ORIGIN_Y + rectPixelHeight}
          stroke="#059669"
          strokeWidth="2"
        />
        <text
          x={ORIGIN_X - 28}
          y={ORIGIN_Y + rectPixelHeight / 2 + 6}
          textAnchor="middle"
          className="fill-emerald-800 text-base font-black"
          transform={`rotate(-90 ${ORIGIN_X - 28} ${ORIGIN_Y + rectPixelHeight / 2 + 6})`}
        >
          {height}
        </text>
        <text
          x={ORIGIN_X - 14}
          y={ORIGIN_Y + rectPixelHeight / 2}
          textAnchor="middle"
          className="fill-emerald-700 text-[10px] font-bold"
          transform={`rotate(-90 ${ORIGIN_X - 14} ${ORIGIN_Y + rectPixelHeight / 2})`}
        >
          wysokość
        </text>

        {mode === "demo" && (
          <circle
            cx={ORIGIN_X + rectPixelWidth}
            cy={ORIGIN_Y + rectPixelHeight}
            r="12"
            fill="#f59e0b"
            stroke="#fff"
            strokeWidth="3"
            className="cursor-grab"
          />
        )}
        {mode === "task" && (
          <circle
            cx={ORIGIN_X + rectPixelWidth}
            cy={ORIGIN_Y + rectPixelHeight}
            r="12"
            fill="#6366f1"
            stroke="#fff"
            strokeWidth="3"
            className="cursor-grab"
          />
        )}
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        {mode === "demo" ? (
          <>
            <Stepper
              label="Szerokość (kratki)"
              value={width}
              onDecrease={() => updateDimensions(width - 1, height)}
              onIncrease={() => updateDimensions(width + 1, height)}
              disabledDecrease={width <= 1}
              disabledIncrease={width >= MAX_WIDTH}
            />
            <Stepper
              label="Wysokość (kratki)"
              value={height}
              onDecrease={() => updateDimensions(width, height - 1)}
              onIncrease={() => updateDimensions(width, height + 1)}
              disabledDecrease={height <= 1}
              disabledIncrease={height >= MAX_HEIGHT}
            />
            <div className="rounded-2xl bg-indigo-50 p-3 ring-1 ring-indigo-200">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Pole (z siatki)</p>
              <p className="mt-1 text-center text-3xl font-black text-indigo-700">{area}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Obwód (z siatki)</p>
              <p className="mt-1 text-center text-3xl font-black text-emerald-700">{perimeter}</p>
            </div>
            <Stepper
              label="Ćwicz pole (+ / −)"
              value={practiceArea}
              onDecrease={() => setPracticeArea(Math.max(0, practiceArea - 1))}
              onIncrease={() => setPracticeArea(practiceArea + 1)}
              highlight={params.ask === "area"}
            />
            <Stepper
              label="Ćwicz obwód (+ / −)"
              value={practicePerimeter}
              onDecrease={() => setPracticePerimeter(Math.max(0, practicePerimeter - 1))}
              onIncrease={() => setPracticePerimeter(practicePerimeter + 1)}
              highlight={params.ask === "perimeter"}
            />
          </>
        ) : (
          <>
            <Stepper
              label="Szerokość na siatce"
              value={width}
              onDecrease={() => updateDimensions(width - 1, height)}
              onIncrease={() => updateDimensions(width + 1, height)}
              disabledDecrease={width <= 1}
              disabledIncrease={width >= MAX_WIDTH}
            />
            <Stepper
              label="Wysokość na siatce"
              value={height}
              onDecrease={() => updateDimensions(width, height - 1)}
              onIncrease={() => updateDimensions(width, height + 1)}
              disabledDecrease={height <= 1}
              disabledIncrease={height >= MAX_HEIGHT}
            />
            <NumericStepper
              label={ask === "area" ? "Twoje pole" : "Twój obwód"}
              value={userAnswer}
              onChange={onNumericResultChange}
              placeValue
              highlight
            />
            <Stepper
              label={ask === "area" ? "Obwód (+ / −)" : "Pole (+ / −)"}
              value={ask === "area" ? practicePerimeter : practiceArea}
              onDecrease={() =>
                ask === "area"
                  ? setPracticePerimeter(Math.max(0, practicePerimeter - 1))
                  : setPracticeArea(Math.max(0, practiceArea - 1))
              }
              onIncrease={() =>
                ask === "area" ? setPracticePerimeter(practicePerimeter + 1) : setPracticeArea(practiceArea + 1)
              }
            />
          </>
        )}
      </div>

      {mode === "demo" && !compactChrome && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...params, ask: "area" })}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              params.ask === "area" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"
            }`}
          >
            Ćwicz pole
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...params, ask: "perimeter" })}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              params.ask === "perimeter" ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white"
            }`}
          >
            Ćwicz obwód
          </button>
        </div>
      )}

      {mode === "task" && showSolution && !compactChrome && (
        <p className="text-center text-lg font-bold text-emerald-700">
          Rozwiązanie: {ask === "area" ? `pole = ${expectedAnswer}` : `obwód = ${expectedAnswer}`}
        </p>
      )}

      {!compactChrome && (
        <LessonNote>
          Długości boków widać przy prostokącie. W zadaniu kształt losuje się na siatce — możesz też
          dopasować boki przyciskami + / −, a wynik (pole lub obwód) wpisujesz bez klawiatury.
        </LessonNote>
      )}
    </Card>
  );
}
