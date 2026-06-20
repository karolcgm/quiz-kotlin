"use client";

import type { PointerEvent } from "react";
import { Card } from "@/components/ui/Card";
import {
  ANGLE_KIND_COLORS,
  ANGLE_KIND_LABELS,
  classifyAngleKind,
  normalizeDegrees,
  type AngleKind,
} from "@/lib/math/angles";
import { isAngleKindParams } from "@/lib/simulations/simulatorTaskMode";
import type { TestWidgetParams } from "@/types/testWidget";

const WIDTH = 400;
const HEIGHT = 280;
const ORIGIN = { x: 80, y: 220 };

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

const PRESETS: { label: string; degrees: number }[] = [
  { label: "Ostry 45°", degrees: 45 },
  { label: "Prosty 90°", degrees: 90 },
  { label: "Rozwarty 120°", degrees: 120 },
  { label: "Półpełny 180°", degrees: 180 },
];

export function InteractiveAngleKindsVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  selectedLabel,
  onSelectedLabelChange,
  onChange,
}: Props) {
  if (!isAngleKindParams(params)) return null;

  const degrees = normalizeDegrees(mode === "task" && targetParams && isAngleKindParams(targetParams) ? targetParams.degrees : params.degrees);
  const kind = classifyAngleKind(degrees);
  const color = ANGLE_KIND_COLORS[kind];
  const rayLength = 220;
  const endX = ORIGIN.x + rayLength * Math.cos(-(degrees * Math.PI) / 180);
  const endY = ORIGIN.y + rayLength * Math.sin(-(degrees * Math.PI) / 180);

  const setDegrees = (next: number) => onChange({ ...params, degrees: normalizeDegrees(next) });

  const handleDrag = (event: PointerEvent<SVGCircleElement>) => {
    if (mode === "task") return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
    const y = ((event.clientY - bounds.top) / bounds.height) * HEIGHT;
    const angle = Math.atan2(ORIGIN.y - y, x - ORIGIN.x);
    setDegrees(normalizeDegrees((angle * 180) / Math.PI));
  };

  const options: AngleKind[] = ["acute", "right", "obtuse", "straight"];

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Rodzaje kątów</h3>
          <p className="text-sm font-semibold text-slate-600">
            Przeciągnij zielony punkt — zmieniaj kąt między ramionami i obserwuj jego nazwę.
          </p>
        </>
      )}

      {mode === "task" && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center">
          <p className="text-xs font-bold uppercase text-indigo-600">Zadanie</p>
          <p className="mt-1 text-2xl font-black text-indigo-900">Jak nazywa się ten kąt ({degrees}°)?</p>
        </div>
      )}

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full rounded-2xl bg-gradient-to-br from-rose-50 via-white to-sky-50">
        <line x1={ORIGIN.x} y1={ORIGIN.y} x2={320} y2={ORIGIN.y} stroke="#475569" strokeWidth={6} strokeLinecap="round" />
        <line x1={ORIGIN.x} y1={ORIGIN.y} x2={endX} y2={endY} stroke={color} strokeWidth={6} strokeLinecap="round" />
        <path
          d={`M ${ORIGIN.x + 40} ${ORIGIN.y} A 40 40 0 ${degrees > 180 ? 1 : 0} 0 ${ORIGIN.x + 40 * Math.cos(-(degrees * Math.PI) / 180)} ${ORIGIN.y + 40 * Math.sin(-(degrees * Math.PI) / 180)} Z`}
          fill={color}
          fillOpacity={0.35}
          stroke={color}
          strokeWidth={2}
        />
        <circle cx={ORIGIN.x} cy={ORIGIN.y} r={8} fill="#334155" />
        <circle
          cx={endX}
          cy={endY}
          r={mode === "task" ? 8 : 14}
          fill="#22c55e"
          stroke="#fff"
          strokeWidth={3}
          className={mode === "task" ? undefined : "cursor-grab active:cursor-grabbing"}
          onPointerDown={handleDrag}
          onPointerMove={(e) => {
            if (mode === "task" || e.buttons !== 1) return;
            handleDrag(e);
          }}
        />
        <text x={ORIGIN.x + 50} y={ORIGIN.y - 12} fill="#0f172a" fontSize="18" fontWeight="900">
          {mode === "demo" || showSolution ? `${degrees}°` : "?"}
        </text>
      </svg>

      {mode === "demo" && (
        <div className="rounded-2xl p-4 text-center text-xl font-black" style={{ backgroundColor: `${color}22`, color }}>
          {ANGLE_KIND_LABELS[kind]}
        </div>
      )}

      {mode === "demo" && !compactChrome && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.degrees}
              type="button"
              onClick={() => setDegrees(preset.degrees)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold hover:bg-slate-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {mode === "task" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectedLabelChange(option)}
              className={`rounded-xl px-3 py-3 text-left font-bold ${selectedLabel === option ? "text-white" : "border border-slate-200 bg-white"}`}
              style={selectedLabel === option ? { backgroundColor: ANGLE_KIND_COLORS[option] } : undefined}
            >
              {ANGLE_KIND_LABELS[option]}
            </button>
          ))}
        </div>
      )}

      {mode === "task" && showSolution && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-center text-xl font-black text-emerald-900">
          {ANGLE_KIND_LABELS[kind]}
        </div>
      )}
    </Card>
  );
}
