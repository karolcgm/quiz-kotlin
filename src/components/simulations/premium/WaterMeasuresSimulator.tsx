"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PremiumSimulationFrame,
  type PremiumSimulationMode,
} from "@/components/simulations/premium/PremiumSimulationFrame";
import { WaterBeakerVisual } from "@/components/simulations/premium/WaterBeakerVisual";
import {
  buildRandomMeasureTask,
  clampVolume,
  DEFAULT_BEAKERS,
  equalizePercent,
  equalizeVolumes,
  fillPercent,
  formatVolumeDisplay,
  gradeMeasureTask,
  howManyFit,
  pourAmountFromInput,
  volumeFraction,
  type BeakerDef,
  type MeasureTask,
  type VolumeDisplayMode,
} from "@/lib/simulations/waterMeasures";

type PourUnit = "ml" | "percent";

export function WaterMeasuresSimulator() {
  const [mode, setMode] = useState<PremiumSimulationMode>("demo");
  const [beakers, setBeakers] = useState<BeakerDef[]>(() => DEFAULT_BEAKERS.map((b) => ({ ...b })));
  const [displayMode, setDisplayMode] = useState<VolumeDisplayMode>("ml");
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_BEAKERS[0].id);
  const [pourSourceId, setPourSourceId] = useState<string | null>(null);
  const [pourAmount, setPourAmount] = useState(50);
  const [pourUnit, setPourUnit] = useState<PourUnit>("ml");
  const [compareFromId, setCompareFromId] = useState(DEFAULT_BEAKERS[0].id);
  const [compareToId, setCompareToId] = useState(DEFAULT_BEAKERS[2].id);
  const [task, setTask] = useState<MeasureTask>(() => buildRandomMeasureTask(DEFAULT_BEAKERS));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [exerciseScore, setExerciseScore] = useState({ correct: 0, total: 0 });

  const selected = beakers.find((b) => b.id === selectedId) ?? beakers[0];
  const compareFrom = beakers.find((b) => b.id === compareFromId)!;
  const compareTo = beakers.find((b) => b.id === compareToId)!;
  const fitCount = howManyFit(compareTo.capacityMl, compareFrom.capacityMl);

  const updateBeaker = useCallback((id: string, volumeMl: number) => {
    setBeakers((current) =>
      current.map((beaker) =>
        beaker.id === id ? { ...beaker, volumeMl: clampVolume(volumeMl, beaker.capacityMl) } : beaker,
      ),
    );
    setFeedback(null);
  }, []);

  const adjustSelected = useCallback(
    (deltaMl: number) => {
      updateBeaker(selected.id, selected.volumeMl + deltaMl);
    },
    [selected.id, selected.volumeMl, updateBeaker],
  );

  const adjustSelectedPercent = useCallback(
    (deltaPercent: number) => {
      const target = selected.volumeMl + Math.round((selected.capacityMl * deltaPercent) / 100);
      updateBeaker(selected.id, target);
    },
    [selected.capacityMl, selected.id, selected.volumeMl, updateBeaker],
  );

  const pourToBeaker = useCallback(
    (targetId: string) => {
      if (!pourSourceId || pourSourceId === targetId) return;
      const source = beakers.find((b) => b.id === pourSourceId);
      const target = beakers.find((b) => b.id === targetId);
      if (!source || !target) return;

      const amount = pourAmountFromInput(pourAmount, pourUnit, source);
      const actual = Math.min(amount, source.volumeMl, target.capacityMl - target.volumeMl);
      if (actual <= 0) return;

      setBeakers((current) =>
        current.map((beaker) => {
          if (beaker.id === source.id) {
            return { ...beaker, volumeMl: beaker.volumeMl - actual };
          }
          if (beaker.id === target.id) {
            return { ...beaker, volumeMl: beaker.volumeMl + actual };
          }
          return beaker;
        }),
      );
      setFeedback(`Przelano ${actual} ml z ${source.label} do ${target.label}.`);
      setFeedbackSuccess(true);
      setPourSourceId(null);
    },
    [beakers, pourAmount, pourSourceId, pourUnit],
  );

  const newTask = useCallback(() => {
    setTask(buildRandomMeasureTask(beakers));
    setBeakers(DEFAULT_BEAKERS.map((b) => ({ ...b, volumeMl: 0 })));
    setFeedback(null);
  }, [beakers]);

  useEffect(() => {
    if (mode === "task" || mode === "exercise") {
      setTask(buildRandomMeasureTask(DEFAULT_BEAKERS));
      setBeakers(DEFAULT_BEAKERS.map((b) => ({ ...b, volumeMl: 0 })));
    } else {
      setBeakers(DEFAULT_BEAKERS.map((b) => ({ ...b })));
    }
    setFeedback(null);
  }, [mode]);

  const checkTask = useCallback(() => {
    const ok = gradeMeasureTask(beakers, task);
    const target = beakers.find((b) => b.id === task.beakerId)!;
    if (ok) {
      setFeedback(`Super! ${target.label} ma ${fillPercent(target.volumeMl, target.capacityMl)}% — cel osiągnięty.`);
      setFeedbackSuccess(true);
      if (mode === "exercise") {
        setExerciseScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
        window.setTimeout(newTask, 1400);
      }
    } else {
      setFeedback(
        `Ustaw ${target.label} na ok. ${task.targetPercent}% (teraz: ${fillPercent(target.volumeMl, target.capacityMl)}%).`,
      );
      setFeedbackSuccess(false);
      if (mode === "exercise") {
        setExerciseScore((s) => ({ ...s, total: s.total + 1 }));
      }
    }
  }, [beakers, mode, newTask, task]);

  const taskBeaker = beakers.find((b) => b.id === task.beakerId);

  const statsPanel = useMemo(
    () =>
      beakers.map((beaker) => ({
        id: beaker.id,
        ml: `${beaker.volumeMl} / ${beaker.capacityMl} ml`,
        percent: `${fillPercent(beaker.volumeMl, beaker.capacityMl)}%`,
        fraction: volumeFraction(beaker.volumeMl, beaker.capacityMl),
      })),
    [beakers],
  );

  return (
    <PremiumSimulationFrame
      slug="miarki-woda"
      title="Miarki na wodę"
      subtitle="Dolewaj, wylewaj, przelewaj między naczyniami i porównuj pojemności — w ml, procentach lub ułamkach."
      mode={mode}
      onModeChange={setMode}
      feedback={feedback}
      feedbackSuccess={feedbackSuccess}
      score={exerciseScore}
      controls={
        <div className="space-y-5">
          {(mode === "task" || mode === "exercise") && taskBeaker && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-900">
              Zadanie: napełnij <strong>{taskBeaker.label}</strong> do około{" "}
              <strong>{task.targetPercent}%</strong>.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(["ml", "percent", "fraction"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDisplayMode(option)}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${
                  displayMode === option ? "bg-cyan-600 text-white" : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {option === "ml" ? "Mililitry" : option === "percent" ? "Procenty" : "Ułamki"}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">
              Wybrana: {selected.label} —{" "}
              {formatVolumeDisplay(selected.volumeMl, selected.capacityMl, displayMode)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => adjustSelected(10)} className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-bold text-white">+10 ml</button>
              <button type="button" onClick={() => adjustSelected(50)} className="rounded-xl bg-cyan-600 px-3 py-2 text-sm font-bold text-white">+50 ml</button>
              <button type="button" onClick={() => adjustSelected(-10)} className="rounded-xl bg-slate-600 px-3 py-2 text-sm font-bold text-white">−10 ml</button>
              <button type="button" onClick={() => adjustSelected(-50)} className="rounded-xl bg-slate-600 px-3 py-2 text-sm font-bold text-white">−50 ml</button>
              <button type="button" onClick={() => adjustSelectedPercent(10)} className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-bold text-white">+10%</button>
              <button type="button" onClick={() => adjustSelectedPercent(-10)} className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-bold text-white">−10%</button>
              <button type="button" onClick={() => updateBeaker(selected.id, selected.capacityMl)} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white">
                Pełna
              </button>
              <button type="button" onClick={() => updateBeaker(selected.id, 0)} className="rounded-xl bg-rose-500 px-3 py-2 text-sm font-bold text-white">
                Opróżnij
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
            <p className="text-sm font-bold text-cyan-950">Przelewanie między miarkami</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={pourSourceId ?? ""}
                onChange={(e) => setPourSourceId(e.target.value || null)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Źródło…</option>
                {beakers.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={pourAmount}
                onChange={(e) => setPourAmount(Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm"
              />
              <select
                value={pourUnit}
                onChange={(e) => setPourUnit(e.target.value as PourUnit)}
                className="rounded-lg border border-slate-200 px-2 py-2 text-sm"
              >
                <option value="ml">ml</option>
                <option value="percent">% z źródła</option>
              </select>
              <span className="text-xs text-slate-600">Potem kliknij miarkę docelową</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBeakers((b) => equalizeVolumes(b))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              Wyrównaj objętość (ml)
            </button>
            <button
              type="button"
              onClick={() => setBeakers((b) => equalizePercent(b))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              Wyrównaj poziom (%)
            </button>
            {mode !== "demo" && (
              <>
                <button type="button" onClick={newTask} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Losuj zadanie</button>
                <button type="button" onClick={checkTask} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Sprawdź</button>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
            <p className="text-sm font-bold text-violet-950">Ile miarek się mieści?</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <select value={compareFromId} onChange={(e) => setCompareFromId(e.target.value)} className="rounded-lg border px-2 py-1">
                {beakers.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
              <span>mieści się w</span>
              <select value={compareToId} onChange={(e) => setCompareToId(e.target.value)} className="rounded-lg border px-2 py-1">
                {beakers.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
              <span className="font-black text-violet-800">→ {fitCount}×</span>
              <span className="text-slate-600">
                ({compareFrom.capacityMl} ml w {compareTo.capacityMl} ml)
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {beakers.map((beaker) => (
            <div key={beaker.id} className="flex flex-col items-center">
              <WaterBeakerVisual
                beaker={beaker}
                selected={selectedId === beaker.id}
                compareGhostCount={
                  compareToId === beaker.id && compareFrom.capacityMl <= beaker.capacityMl ? fitCount : undefined
                }
                onSelect={() => {
                  setSelectedId(beaker.id);
                  if (pourSourceId && pourSourceId !== beaker.id) {
                    pourToBeaker(beaker.id);
                  }
                }}
              />
              <div className="mt-3 w-full rounded-xl bg-white/90 p-3 text-center shadow-sm">
                <p className="text-lg font-black text-slate-900">
                  {formatVolumeDisplay(beaker.volumeMl, beaker.capacityMl, displayMode)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {beaker.volumeMl} ml · {fillPercent(beaker.volumeMl, beaker.capacityMl)}% ·{" "}
                  {volumeFraction(beaker.volumeMl, beaker.capacityMl)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <aside className="assignment-glass rounded-2xl p-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-600">Panel naukowy</h3>
          <ul className="mt-3 space-y-3 text-sm text-slate-700">
            {statsPanel.map((row) => (
              <li key={row.id} className="rounded-xl bg-white/80 p-3">
                <p className="font-bold text-slate-900">{beakers.find((b) => b.id === row.id)?.label}</p>
                <p>Objętość: {row.ml}</p>
                <p>Zapełnienie: {row.percent}</p>
                <p>Ułamek: {row.fraction}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            1 ml = 1 cm³. Pełna miarka to 100% lub ułamek 1/1. Przelewanie uczy zachowania objętości.
          </p>
        </aside>
      </div>
    </PremiumSimulationFrame>
  );
}
