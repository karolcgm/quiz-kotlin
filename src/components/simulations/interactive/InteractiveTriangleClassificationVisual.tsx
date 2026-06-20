"use client";

import { Card } from "@/components/ui/Card";
import {
  moveTriangleVertex,
  TrianglePlaygroundSvg,
} from "@/components/simulations/interactive/shared/TrianglePlaygroundSvg";
import {
  TRIANGLE_ANGLE_KINDS,
  TRIANGLE_ANGLE_LABELS,
  TRIANGLE_SIDE_KINDS,
  TRIANGLE_SIDE_LABELS,
  classifyTriangleByAngles,
  classifyTriangleBySides,
  formatTriangleClassLabel,
  presetTriangle,
  type TriangleClassKind,
} from "@/lib/math/triangleClassification";
import { isTriangleClassificationParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">{children}</div>
  );
}

interface Props {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  selectedLabel: string | null;
  onSelectedLabelChange: (value: string) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveTriangleClassificationVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  selectedLabel,
  onSelectedLabelChange,
  onChange,
}: Props) {
  if (!isTriangleClassificationParams(params)) return null;

  const taskParams =
    mode === "task" && targetParams && isTriangleClassificationParams(targetParams) ? targetParams : params;
  const vertices = {
    ax: mode === "task" ? taskParams.ax : params.ax,
    ay: mode === "task" ? taskParams.ay : params.ay,
    bx: mode === "task" ? taskParams.bx : params.bx,
    by: mode === "task" ? taskParams.by : params.by,
    cx: mode === "task" ? taskParams.cx : params.cx,
    cy: mode === "task" ? taskParams.cy : params.cy,
  };
  const ask = taskParams.ask;
  const sideKind = classifyTriangleBySides(vertices);
  const angleKind = classifyTriangleByAngles(vertices);
  const expectedKind = ask === "bySides" ? sideKind : angleKind;
  const options = ask === "bySides" ? TRIANGLE_SIDE_KINDS : TRIANGLE_ANGLE_KINDS;

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Klasyfikacja trójkątów</h3>
          <p className="text-sm font-semibold text-slate-600">
            Przeciągaj wierzchołki A, B i C — kolory boków pokazują równe długości, a wypełnione łuki pokazują kąty.
          </p>
        </>
      )}

      {mode === "task" && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Twoje zadanie</p>
          <p className="mt-1 text-2xl font-black text-indigo-900">
            {ask === "bySides" ? "Jaki to trójkąt ze względu na boki?" : "Jaki to trójkąt ze względu na kąty?"}
          </p>
        </div>
      )}

      <TrianglePlaygroundSvg
        vertices={vertices}
        draggable={mode === "task" ? false : ["A", "B", "C"]}
        showAngleValues={mode === "demo" || showSolution}
        onVertexMove={(vertex, x, y) => onChange({ ...params, ...moveTriangleVertex(vertices, vertex, x, y) })}
      />

      {mode === "demo" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-indigo-50 p-4 ring-2 ring-indigo-200">
            <p className="text-xs font-bold uppercase text-indigo-600">Boki</p>
            <p className="mt-1 text-lg font-black text-indigo-900">{TRIANGLE_SIDE_LABELS[sideKind]}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 ring-2 ring-emerald-200">
            <p className="text-xs font-bold uppercase text-emerald-700">Kąty</p>
            <p className="mt-1 text-lg font-black text-emerald-900">{TRIANGLE_ANGLE_LABELS[angleKind]}</p>
          </div>
        </div>
      )}

      {mode === "demo" && !compactChrome && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["bySides", "Ćwicz: boki"],
              ["byAngles", "Ćwicz: kąty"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...params, ask: value })}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${params.ask === value ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"}`}
            >
              {label}
            </button>
          ))}
          {([...TRIANGLE_SIDE_KINDS, ...TRIANGLE_ANGLE_KINDS] as TriangleClassKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onChange({ ...params, ...presetTriangle(kind) })}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {formatTriangleClassLabel(kind)}
            </button>
          ))}
        </div>
      )}

      {mode === "task" && (
        <div className="grid gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectedLabelChange(option)}
              className={`rounded-xl px-4 py-3 text-left text-lg font-bold ${selectedLabel === option ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"} ${showSolution && option === expectedKind ? "ring-2 ring-emerald-400" : ""}`}
            >
              {formatTriangleClassLabel(option)}
            </button>
          ))}
        </div>
      )}

      {mode === "task" && showSolution && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-center text-2xl font-black text-emerald-900">
          {formatTriangleClassLabel(expectedKind)}
        </div>
      )}

      {!compactChrome && (
        <LessonNote>
          <strong>Lekcja:</strong> równe boki mają ten sam kolor. Przesuń wierzchołki — kiedy trójkąt staje się
          równoramienny? A prostokątny?
        </LessonNote>
      )}
    </Card>
  );
}
