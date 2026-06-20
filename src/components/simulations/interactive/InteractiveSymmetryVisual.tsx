"use client";

import { Card } from "@/components/ui/Card";
import {
  expectedMirrorCells,
  isAxisSymmetric,
  motifLeftHalf,
  parseCellKey,
  SYMMETRY_GRID,
  type SymmetryAxisShape,
  type SymmetryMotif,
} from "@/lib/math/symmetryPatterns";
import {
  isSymmetryAxisParams,
  isSymmetryPictureParams,
} from "@/lib/simulations/simulatorTaskMode";
import type { SymmetryPictureQuestionParams, TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveSymmetryVisualProps {
  slug: string;
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  selectedLabel: string | null;
  onSelectedLabelChange: (value: string) => void;
  onChange: (params: TestWidgetParams) => void;
}

function SymmetryGrid({
  motif,
  mirroredCells,
  showSolution,
  onToggleCell,
  readOnlyLeft,
}: {
  motif: SymmetryMotif;
  mirroredCells: string[];
  showSolution: boolean;
  onToggleCell: (key: string) => void;
  readOnlyLeft: boolean;
}) {
  const { rows, cols, axisCol } = SYMMETRY_GRID;
  const leftCells = new Set(motifLeftHalf(motif));
  const expected = new Set(expectedMirrorCells(motif));
  const selected = new Set(mirroredCells);

  return (
    <div className="mx-auto max-w-md">
      <svg viewBox="0 0 360 300" className="w-full" role="img" aria-label="Siatka symetrii obrazka">
        <rect x="0" y="0" width="360" height="300" rx="16" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="180" y1="8" x2="180" y2="292" stroke="#ef4444" strokeWidth="3" strokeDasharray="8 6" />
        <text x="180" y="24" textAnchor="middle" className="fill-red-600 text-xs font-bold">
          oś symetrii
        </text>
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((__, col) => {
            const key = `${row},${col}`;
            const x = 24 + col * 52;
            const y = 40 + row * 48;
            const isLeft = col < axisCol;
            const filledLeft = leftCells.has(key);
            const filledRight = selected.has(key) || (showSolution && expected.has(key));
            const filled = isLeft ? filledLeft : filledRight;
            const clickable = !isLeft && !readOnlyLeft;

            return (
              <g key={key}>
                <rect
                  x={x}
                  y={y}
                  width="44"
                  height="40"
                  rx="6"
                  fill={filled ? "#818cf8" : "#fff"}
                  stroke={filled ? "#4338ca" : "#e2e8f0"}
                  strokeWidth="2"
                  className={clickable ? "cursor-pointer" : ""}
                  onClick={() => clickable && onToggleCell(key)}
                />
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}

function AxisShapeVisual({
  shape,
  axisPercent,
  onAxisChange,
  disabled,
}: {
  shape: SymmetryAxisShape;
  axisPercent: number;
  onAxisChange: (value: number) => void;
  disabled?: boolean;
}) {
  const axisX = 40 + (axisPercent / 100) * 280;
  const symmetric = isAxisSymmetric(shape, axisPercent);

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 360 220" className="mx-auto w-full max-w-lg" role="img" aria-label="Oś symetrii figury">
        <rect x="0" y="0" width="360" height="220" rx="16" fill="#f8fafc" />
        {shape === "square" ? (
          <rect x="110" y="50" width="140" height="140" rx="8" fill="#c7d2fe" stroke="#4338ca" strokeWidth="4" />
        ) : (
          <rect x="70" y="70" width="220" height="100" rx="8" fill="#bbf7d0" stroke="#059669" strokeWidth="4" />
        )}
        <line x1={axisX} y1="20" x2={axisX} y2="200" stroke="#ef4444" strokeWidth="4" strokeDasharray="8 6" />
        <circle cx={axisX} cy="20" r="8" fill="#ef4444" />
      </svg>
      {!disabled && (
        <input
          type="range"
          min={10}
          max={90}
          value={axisPercent}
          onChange={(event) => onAxisChange(Number(event.target.value))}
          className="w-full"
          aria-label="Pozycja osi symetrii"
        />
      )}
      <p className="text-center text-sm font-semibold text-slate-600">
        {symmetric ? "Oś przechodzi przez środek — figura jest symetryczna." : "Oś jest przesunięta — brak symetrii."}
      </p>
    </div>
  );
}

export function InteractiveSymmetryVisual({
  slug,
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  selectedLabel,
  onSelectedLabelChange,
  onChange,
}: InteractiveSymmetryVisualProps) {
  const isPicture = slug === "symetria-obrazka" || isSymmetryPictureParams(params);
  const isAxis = slug === "os-symetrii-figury" || isSymmetryAxisParams(params);

  if (isPicture && isSymmetryPictureParams(params)) {
    const display: SymmetryPictureQuestionParams =
      mode === "task" && targetParams && isSymmetryPictureParams(targetParams) ? targetParams : params;

    const toggleCell = (key: string) => {
      const { col } = parseCellKey(key);
      if (col < SYMMETRY_GRID.axisCol) return;
      const set = new Set(params.mirroredCells);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      onChange({ ...params, mirroredCells: [...set] });
    };

    return (
      <Card className="space-y-4">
        {!compactChrome && (
          <>
            <h3 className="text-2xl font-bold text-slate-900">Dokończ symetrię obrazka</h3>
            <p className="text-sm font-semibold text-slate-600">
              {mode === "task"
                ? "Klikaj kwadraty po prawej stronie osi, aby odtworzyć lustrzane odbicie."
                : "Przećwicz dorysowywanie drugiej połowy obrazka względem osi."}
            </p>
          </>
        )}

        <SymmetryGrid
          motif={display.motif}
          mirroredCells={params.mirroredCells}
          showSolution={showSolution}
          onToggleCell={toggleCell}
          readOnlyLeft={mode === "task" && !showSolution ? false : false}
        />

        {mode === "demo" && (
          <div className="flex flex-wrap justify-center gap-2">
            {(["butterfly", "house", "heart"] as SymmetryMotif[]).map((motif) => (
              <button
                key={motif}
                type="button"
                onClick={() => onChange({ variant: "picture", motif, mirroredCells: [] })}
                className={`rounded-xl px-3 py-2 text-sm font-bold ${
                  params.motif === motif ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                }`}
              >
                {motif === "butterfly" ? "Motyl" : motif === "house" ? "Dom" : "Serce"}
              </button>
            ))}
          </div>
        )}

        {!compactChrome && (
          <LessonNote>
            Symetryczny obrazek wygląda tak samo po obu stronach osi. Każdy kolorowy kwadrat po lewej ma swoje
            odbicie lustrzane po prawej.
          </LessonNote>
        )}
      </Card>
    );
  }

  if (isAxis && isSymmetryAxisParams(params)) {
    const display =
      mode === "task" && targetParams && isSymmetryAxisParams(targetParams) ? targetParams : params;
    const choice = selectedLabel ?? "";

    return (
      <Card className="space-y-4">
        {!compactChrome && (
          <>
            <h3 className="text-2xl font-bold text-slate-900">Oś symetrii figury</h3>
            <p className="text-sm font-semibold text-slate-600">
              Przesuń oś i oceń, czy figura jest podzielona na dwie równe części.
            </p>
          </>
        )}

        <AxisShapeVisual
          shape={display.shape}
          axisPercent={params.axisPercent}
          onAxisChange={(axisPercent) => onChange({ ...params, axisPercent })}
          disabled={mode === "task"}
        />

        {mode === "demo" && (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ variant: "axis", shape: "square", axisPercent: params.axisPercent })}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                params.shape === "square" ? "bg-indigo-600 text-white" : "bg-white ring-1 ring-slate-200"
              }`}
            >
              Kwadrat
            </button>
            <button
              type="button"
              onClick={() => onChange({ variant: "axis", shape: "rectangle", axisPercent: params.axisPercent })}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                params.shape === "rectangle" ? "bg-indigo-600 text-white" : "bg-white ring-1 ring-slate-200"
              }`}
            >
              Prostokąt
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelectedLabelChange("yes")}
            className={`rounded-2xl border-2 p-4 text-lg font-black ${
              choice === "yes" ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white"
            }`}
          >
            Tak — symetria
          </button>
          <button
            type="button"
            onClick={() => onSelectedLabelChange("no")}
            className={`rounded-2xl border-2 p-4 text-lg font-black ${
              choice === "no" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-slate-200 bg-white"
            }`}
          >
            Nie — brak symetrii
          </button>
        </div>

        {showSolution && !compactChrome && (
          <p className="text-center font-bold text-emerald-700">
            {isAxisSymmetric(display.shape, display.axisPercent) ? "Tak — oś jest poprawna" : "Nie — oś przesunięta"}
          </p>
        )}

        {!compactChrome && (
          <LessonNote>
            Figura ma symetrię, gdy oś dzieli ją na dwie identyczne połowy — jak odbicie w lustrze.
          </LessonNote>
        )}
      </Card>
    );
  }

  return null;
}
