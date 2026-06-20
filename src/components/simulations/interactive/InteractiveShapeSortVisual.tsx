"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { BasicShapeIcon } from "@/components/simulations/shared/BasicShapeIcon";
import {
  BASIC_SHAPE_KINDS,
  createMixedShapePool,
  SHAPE_BIN_COLORS,
  SHAPE_FILL_COLORS,
  SHAPE_LABELS,
  type BasicShapeKind,
} from "@/lib/math/basicShapes";
import { isShapeSortParams } from "@/lib/simulations/simulatorTaskMode";
import type { ShapeSortQuestionParams, TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveShapeSortVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  selectedLabel: string | null;
  onSelectedLabelChange: (value: string) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveShapeSortVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  selectedLabel,
  onSelectedLabelChange,
  onChange,
}: InteractiveShapeSortVisualProps) {
  const [pool, setPool] = useState(() => createMixedShapePool(8));
  const [bins, setBins] = useState<Record<BasicShapeKind, { id: string; kind: BasicShapeKind }[]>>({
    circle: [],
    triangle: [],
    square: [],
    rectangle: [],
  });
  const [activePoolId, setActivePoolId] = useState<string | null>(null);

  if (!isShapeSortParams(params)) {
    return null;
  }

  const display: ShapeSortQuestionParams =
    mode === "task" && targetParams && isShapeSortParams(targetParams) ? targetParams : params;
  const expected = display.shape;
  const choice = selectedLabel ?? "";
  const hideSolution = mode === "task" && !showSolution;

  const poolItem = useMemo(
    () => pool.find((item) => item.id === activePoolId) ?? null,
    [pool, activePoolId],
  );

  const resetMix = () => {
    setPool(createMixedShapePool(8));
    setBins({ circle: [], triangle: [], square: [], rectangle: [] });
    setActivePoolId(null);
  };

  const sortIntoBin = (bin: BasicShapeKind) => {
    if (mode === "task") {
      onSelectedLabelChange(bin);
      return;
    }

    if (poolItem) {
      setPool((current) => current.filter((item) => item.id !== poolItem.id));
      setBins((current) => ({
        ...current,
        [bin]: [...current[bin], { id: poolItem.id, kind: poolItem.kind }],
      }));
      setActivePoolId(null);
      onChange({ shape: poolItem.kind });
      return;
    }

    onChange({ shape: bin });
  };

  return (
    <Card className="space-y-5">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Sortowanie figur</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? "Wybierz koszyk, do którego należy wyróżniona figura."
              : "Kliknij figurę z mieszanki, potem koszyk — figura trafi we właściwą grupę."}
          </p>
        </>
      )}

      {mode === "demo" && (
        <>
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mieszanka figur</p>
              <button
                type="button"
                onClick={resetMix}
                className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50"
              >
                Nowa mieszanka
              </button>
            </div>
            <div className="flex min-h-[5.5rem] flex-wrap justify-center gap-3">
              {pool.length === 0 ? (
                <p className="py-6 text-sm font-semibold text-emerald-700">Wszystkie figury posortowane!</p>
              ) : (
                pool.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActivePoolId(item.id)}
                    className={`rounded-2xl bg-white p-2 shadow-sm transition ${
                      activePoolId === item.id ? "ring-4 ring-indigo-400" : "ring-1 ring-slate-200 hover:ring-indigo-300"
                    }`}
                    aria-label={`Figura: ${SHAPE_LABELS[item.kind]}`}
                  >
                    <BasicShapeIcon kind={item.kind} size={56} fill={SHAPE_FILL_COLORS[item.kind]} />
                  </button>
                ))
              )}
            </div>
            {poolItem && (
              <p className="mt-3 text-center text-sm font-semibold text-indigo-700">
                Wybrano: {SHAPE_LABELS[poolItem.kind]} — teraz kliknij właściwy koszyk poniżej.
              </p>
            )}
          </div>
        </>
      )}

      {mode === "task" && (
        <div className="rounded-2xl bg-indigo-50 p-6 text-center ring-2 ring-indigo-200">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Posortuj tę figurę</p>
          <div className="mt-4 flex justify-center">
            <BasicShapeIcon kind={display.shape} size={96} fill={SHAPE_FILL_COLORS[display.shape]} />
          </div>
          {!hideSolution && (
            <p className="mt-3 text-lg font-bold text-indigo-900">Grupa: {SHAPE_LABELS[expected]}</p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BASIC_SHAPE_KINDS.map((bin) => {
          const styles = SHAPE_BIN_COLORS[bin];
          const isSelected = choice === bin;
          const isCorrectBin = showSolution && expected === bin;

          return (
            <button
              key={bin}
              type="button"
              onClick={() => sortIntoBin(bin)}
              className={`rounded-2xl border-2 p-4 text-left transition ${styles.bg} ${styles.border} ${
                isSelected ? "ring-4 ring-indigo-400" : ""
              } ${isCorrectBin ? "ring-4 ring-emerald-400" : ""} hover:shadow-md`}
            >
              <p className={`text-sm font-black uppercase tracking-wide ${styles.text}`}>{SHAPE_LABELS[bin]}</p>
              <div className="mt-3 flex min-h-[4rem] flex-wrap justify-center gap-2">
                {mode === "demo" &&
                  bins[bin].map((item) => (
                    <BasicShapeIcon key={item.id} kind={item.kind} size={36} fill={SHAPE_FILL_COLORS[item.kind]} />
                  ))}
                {mode === "demo" && bins[bin].length === 0 && (
                  <BasicShapeIcon kind={bin} size={40} fill={SHAPE_FILL_COLORS[bin]} className="opacity-30" />
                )}
                {mode === "task" && (
                  <BasicShapeIcon kind={bin} size={48} fill={SHAPE_FILL_COLORS[bin]} className="mx-auto opacity-40" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {mode === "demo" && (
        <div className="flex flex-wrap justify-center gap-2">
          {BASIC_SHAPE_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onChange({ shape: kind })}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                params.shape === kind ? "bg-indigo-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              Pokaż: {SHAPE_LABELS[kind]}
            </button>
          ))}
        </div>
      )}

      {mode === "task" && showSolution && !compactChrome && (
        <p className="text-center text-lg font-bold text-emerald-700">
          Poprawny koszyk: {SHAPE_LABELS[expected]}
        </p>
      )}

      {!compactChrome && (
        <LessonNote>
          Koło, trójkąt, kwadrat i prostokąt mają osobne koszyki. Najpierw wybierz figurę z góry, potem dotknij
          właściwej grupy — tak ćwiczysz sortowanie na tablicy bez klawiatury.
        </LessonNote>
      )}
    </Card>
  );
}
