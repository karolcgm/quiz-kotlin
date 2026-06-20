"use client";

import type { SimulatorMode } from "@/lib/simulations/simulatorTaskMode";

interface SimulationModePanelProps {
  mode: SimulatorMode;
  onModeChange: (mode: SimulatorMode) => void;
  onRandomDemo: () => void;
  onNewTask: () => void;
  onShowSolution: () => void;
  onCheckTask: () => void;
  showSolution: boolean;
  taskFeedback: string | null;
  taskActive: boolean;
}

export function SimulationModePanel({
  mode,
  onModeChange,
  onRandomDemo,
  onNewTask,
  onShowSolution,
  onCheckTask,
  showSolution,
  taskFeedback,
  taskActive,
}: SimulationModePanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-bold text-slate-900">Dwa tryby pracy</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onModeChange("demo")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === "demo"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            1. Prezentacja
          </button>
          <button
            type="button"
            onClick={() => onModeChange("task")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              mode === "task"
                ? "bg-emerald-600 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            2. Zadanie na tablicy
          </button>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            <strong>Prezentacja</strong> — zmieniasz liczby i od razu widać rozwiązanie.
          </li>
          <li>
            <strong>Zadanie</strong> — ukryte rozwiązanie, uczniowie budują odpowiedź klikając /
            przeciągając na schemacie.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {mode === "demo" ? (
          <button
            type="button"
            onClick={onRandomDemo}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Wylosuj przykład
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onNewTask}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Losuj zadanie
            </button>
            <button
              type="button"
              onClick={onCheckTask}
              disabled={!taskActive}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Sprawdź
            </button>
            <button
              type="button"
              onClick={onShowSolution}
              disabled={!taskActive || showSolution}
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              Pokaż rozwiązanie
            </button>
          </>
        )}
      </div>

      {mode === "task" && taskFeedback && (
        <div
          className={`rounded-2xl p-4 text-sm font-semibold ${
            taskFeedback.startsWith("Dobrze")
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {taskFeedback}
        </div>
      )}
    </div>
  );
}
