"use client";

import { Card } from "@/components/ui/Card";
import { isComparisonParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

function comparisonSign(left: number, right: number): "<" | "=" | ">" {
  if (left < right) return "<";
  if (left > right) return ">";
  return "=";
}

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveComparisonVisualProps {
  params: TestWidgetParams;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  comparisonSign: "<" | "=" | ">" | null;
  onComparisonSignChange: (value: "<" | "=" | ">") => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveComparisonVisual({
  params,
  mode,
  showSolution,
  compactChrome = false,
  comparisonSign: selectedSign,
  onComparisonSignChange,
  onChange,
}: InteractiveComparisonVisualProps) {
  if (!isComparisonParams(params)) {
    return null;
  }

  const expected = comparisonSign(params.left, params.right);
  const current = selectedSign ?? (mode === "demo" ? expected : "=");
  const hideSolution = mode === "task" && !showSolution;

  return (
    <Card className="space-y-4">
      {!compactChrome && <h3 className="text-2xl font-bold text-slate-900">Porównywanie liczb</h3>}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <button
          type="button"
          onClick={() => mode === "demo" && onChange({ ...params, left: params.left + 1 })}
          className="rounded-2xl bg-indigo-50 p-6 text-center text-4xl font-black text-indigo-700"
        >
          {params.left}
        </button>
        <div className="flex flex-col gap-2">
          {(["<", "=", ">"] as const).map((sign) => (
            <button
              key={sign}
              type="button"
              onClick={() => onComparisonSignChange(sign)}
              className={`rounded-xl px-4 py-2 text-2xl font-black ${
                current === sign ? "bg-emerald-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {sign}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => mode === "demo" && onChange({ ...params, right: params.right + 1 })}
          className="rounded-2xl bg-emerald-50 p-6 text-center text-4xl font-black text-emerald-700"
        >
          {params.right}
        </button>
      </div>

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Lewa
            <input
              type="number"
              value={params.left}
              onChange={(event) => onChange({ ...params, left: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Prawa
            <input
              type="number"
              value={params.right}
              onChange={(event) => onChange({ ...params, right: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      )}

      <p className="text-center text-xl font-bold text-slate-800">
        {params.left} {hideSolution ? "?" : current} {params.right}
        {mode === "task" && showSolution && !compactChrome && (
          <span className="ml-2 text-emerald-700">({expected})</span>
        )}
      </p>

      {!compactChrome && <LessonNote>Kliknij znak porównania zamiast wpisywać go z klawiatury.</LessonNote>}
    </Card>
  );
}
