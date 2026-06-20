"use client";

import type { PointerEvent } from "react";
import { Card } from "@/components/ui/Card";
import { NumericStepper } from "@/components/simulations/shared/NumericStepper";
import {
  moveTriangleVertex,
  TrianglePlaygroundSvg,
} from "@/components/simulations/interactive/shared/TrianglePlaygroundSvg";
import { presetTriangle, triangleAngles } from "@/lib/math/triangleClassification";
import { isTriangleAngleSumParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

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

export function InteractiveTriangleAngleSumVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: Props) {
  if (!isTriangleAngleSumParams(params)) return null;

  const taskParams = mode === "task" && targetParams && isTriangleAngleSumParams(targetParams) ? targetParams : params;
  const vertices = {
    ax: mode === "task" ? taskParams.ax : params.ax,
    ay: mode === "task" ? taskParams.ay : params.ay,
    bx: mode === "task" ? taskParams.bx : params.bx,
    by: mode === "task" ? taskParams.by : params.by,
    cx: mode === "task" ? taskParams.cx : params.cx,
    cy: mode === "task" ? taskParams.cy : params.cy,
  };
  const hideAt = taskParams.hideAt;
  const [angleA, angleB, angleC] = triangleAngles(vertices);
  const hiddenAngle = hideAt === "A" ? angleA : hideAt === "B" ? angleB : angleC;
  const userAnswer = numericResult ?? 0;

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Suma kątów w trójkącie</h3>
          <p className="text-sm font-semibold text-slate-600">
            Przeciągaj wierzchołki — zawsze sprawdź, czy trzy kąty dają razem 180°.
          </p>
        </>
      )}

      {mode === "task" && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
          <p className="text-xs font-bold uppercase text-amber-700">Zadanie</p>
          <p className="mt-1 text-xl font-black text-amber-950">
            Znajdź brakujący kąt {hideAt} — suma kątów w trójkącie to 180°
          </p>
        </div>
      )}

      <TrianglePlaygroundSvg
        vertices={vertices}
        draggable={mode === "task" ? false : ["A", "B", "C"]}
        hideAngleAt={mode === "task" && !showSolution ? hideAt : null}
        showAngleValues={mode === "demo" || showSolution}
        highlightAngleSum
        onVertexMove={(vertex, x, y) => onChange({ ...params, ...moveTriangleVertex(vertices, vertex, x, y) })}
      />

      {mode === "task" ? (
        <NumericStepper
          label="Brakujący kąt (°)"
          value={userAnswer}
          onChange={onNumericResultChange}
          step={1}
          min={1}
          max={178}
          highlight
        />
      ) : (
        <div className="rounded-2xl bg-violet-50 p-4 text-center">
          <p className="text-sm font-bold text-violet-800">Reguła: α + β + γ = 180°</p>
          <p className="mt-1 text-3xl font-black text-violet-900">
            {angleA}° + {angleB}° + {angleC}° = {angleA + angleB + angleC}°
          </p>
        </div>
      )}

      {showSolution && mode === "task" && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-center text-2xl font-black text-emerald-800">
          Kąt {hideAt} = {hiddenAngle}°
        </div>
      )}

      {mode === "demo" && !compactChrome && (
        <div className="flex flex-wrap gap-2">
          {(["A", "B", "C"] as const).map((vertex) => (
            <button
              key={vertex}
              type="button"
              onClick={() => onChange({ ...params, hideAt: vertex, ...presetTriangle("scalene") })}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${params.hideAt === vertex ? "bg-violet-600 text-white" : "border border-slate-200 bg-white"}`}
            >
              Ukryj kąt {vertex}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
