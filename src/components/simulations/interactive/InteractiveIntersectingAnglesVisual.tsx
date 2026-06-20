"use client";

import { Card } from "@/components/ui/Card";
import { NumericStepper } from "@/components/simulations/shared/NumericStepper";
import { adjacentSupplement, normalizeDegrees } from "@/lib/math/angles";
import { isIntersectingAnglesParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

const WIDTH = 420;
const HEIGHT = 300;
const CX = 210;
const CY = 160;

interface Props {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveIntersectingAnglesVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: Props) {
  if (!isIntersectingAnglesParams(params)) return null;

  const taskParams = mode === "task" && targetParams && isIntersectingAnglesParams(targetParams) ? targetParams : params;
  const angle1 = normalizeDegrees(mode === "task" ? taskParams.degrees : params.degrees);
  const angle2 = adjacentSupplement(angle1);
  const angle3 = angle1;
  const angle4 = angle2;
  const ask = taskParams.ask;
  const expected =
    ask === "vertical" ? angle3 : ask === "adjacent" ? angle2 : angle2;
  const userAnswer = numericResult ?? 0;

  const lineLen = 170;
  const rad = (angle1 * Math.PI) / 180;

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Kąty przyległe i wierzchołkowe</h3>
          <p className="text-sm font-semibold text-slate-600">
            Suwak zmienia jeden kąt — obserwuj pary przyległe (razem 180°) i wierzchołkowe (równe).
          </p>
        </>
      )}

      {mode === "task" && (
        <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-4 text-center">
          <p className="text-xs font-bold uppercase text-sky-700">Zadanie</p>
          <p className="mt-1 text-xl font-black text-sky-950">
            {ask === "vertical"
              ? `Kąt wierzchołkowy — znajdź kąt naprzeciwko ${angle1}°`
              : ask === "adjacent"
                ? `Kąt przyległy do ${angle1}° (razem 180°)`
                : `Drugi kąt na prostej — dopełnienie do 180°`}
          </p>
        </div>
      )}

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full rounded-2xl bg-gradient-to-b from-indigo-50 to-white">
        <line x1={40} y1={CY} x2={WIDTH - 40} y2={CY} stroke="#334155" strokeWidth={5} />
        <line
          x1={CX - lineLen * Math.cos(rad)}
          y1={CY - lineLen * Math.sin(rad)}
          x2={CX + lineLen * Math.cos(rad)}
          y2={CY + lineLen * Math.sin(rad)}
          stroke="#6366f1"
          strokeWidth={5}
        />
        {[
          { value: angle1, color: "#f97316", ox: 40, oy: -30 },
          { value: angle2, color: "#22c55e", ox: -70, oy: -30 },
          { value: angle3, color: "#f97316", ox: -70, oy: 40 },
          { value: angle4, color: "#22c55e", ox: 40, oy: 40 },
        ].map((item, index) => (
          <text
            key={index}
            x={CX + item.ox}
            y={CY + item.oy}
            fill={item.color}
            fontSize="16"
            fontWeight="900"
          >
            {mode === "demo" || showSolution || index === 0 ? `${item.value}°` : "?"}
          </text>
        ))}
      </svg>

      {mode !== "task" && (
        <div>
          <label className="text-sm font-bold text-slate-700">Obróć linię — kąt α</label>
          <input
            type="range"
            min={15}
            max={165}
            value={angle1}
            onChange={(event) => onChange({ ...params, degrees: Number(event.target.value) })}
            className="mt-2 w-full accent-indigo-600"
          />
          <p className="mt-2 text-center text-sm font-semibold text-slate-600">
            Przyległe: {angle1}° + {angle2}° = 180° · Wierzchołkowe: {angle1}° = {angle3}°
          </p>
        </div>
      )}

      {mode === "task" && (
        <NumericStepper label="Twój kąt (°)" value={userAnswer} onChange={onNumericResultChange} step={1} min={1} max={179} highlight />
      )}

      {showSolution && mode === "task" && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-center text-2xl font-black text-emerald-800">{expected}°</div>
      )}
    </Card>
  );
}
