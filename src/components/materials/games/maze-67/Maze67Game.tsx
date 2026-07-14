"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import { claimVisualGamePerfectRewardAction } from "@/lib/actions/rewards";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";
import { formatMissionTime } from "@/lib/materials/gameTime";
import {
  buildMaze67Puzzle,
  getWinningMazeOptions,
  type Maze67Puzzle,
} from "@/lib/materials/generators/maze67";

type GameStatus = "intro" | "playing" | "complete";
type Feedback = "success" | "dead-end" | null;
type RewardStatus = "idle" | "saving" | "awarded" | "already-awarded" | "error";

type MazeSelection = {
  gateIndex: number;
  optionIndex: number;
  value: number;
};

const DIFFICULTY_DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "5 bram · kilka dróg",
  medium: "6 bram · dokładne planowanie",
  hard: "7 bram · bardzo podobne liczby",
};

const MAP_WIDTH = 940;
const MAP_HEIGHT = 360;
const NODE_Y = [72, 180, 288] as const;

export function Maze67Game({ rewardEnabled = false }: { rewardEnabled?: boolean }) {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const [puzzle, setPuzzle] = useState<Maze67Puzzle | null>(null);
  const [status, setStatus] = useState<GameStatus>("intro");
  const [selected, setSelected] = useState<MazeSelection[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [hintedValues, setHintedValues] = useState<number[]>([]);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>("idle");

  const selectedValues = useMemo(() => selected.map((item) => item.value), [selected]);
  const currentSum = selectedValues.reduce((sum, value) => sum + value, 0);
  const remaining = (puzzle?.target ?? 67) - currentSum;
  const progress = puzzle ? Math.round((selected.length / puzzle.gates.length) * 100) : 0;

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  function start() {
    setPuzzle(buildMaze67Puzzle(difficulty));
    setSelected([]);
    setFeedback(null);
    setHintedValues([]);
    setHints(0);
    setMistakes(0);
    setElapsedSeconds(0);
    setFinalSeconds(0);
    setRewardStatus("idle");
    setStatus("playing");
  }

  function finishPerfect(completionTime: number) {
    if (!rewardEnabled || mistakes > 0 || hints > 0) return;
    setRewardStatus("saving");
    void claimVisualGamePerfectRewardAction("maze-67", completionTime).then((result) => {
      if (result.error) setRewardStatus("error");
      else setRewardStatus(result.awarded ? "awarded" : "already-awarded");
    });
  }

  function choose(gateIndex: number, optionIndex: number, value: number) {
    if (!puzzle || gateIndex !== selected.length || feedback === "success") return;
    const nextSelected = [...selected, { gateIndex, optionIndex, value }];
    const nextSum = currentSum + value;
    setSelected(nextSelected);
    setHintedValues([]);
    setFeedback(null);

    if (nextSelected.length !== puzzle.gates.length) return;
    if (nextSum === puzzle.target) {
      setFeedback("success");
      const completionTime = elapsedSeconds;
      setFinalSeconds(completionTime);
      window.setTimeout(() => {
        setStatus("complete");
        finishPerfect(completionTime);
      }, 650);
      return;
    }

    setMistakes((valueNow) => valueNow + 1);
    setFeedback("dead-end");
  }

  function undo() {
    if (selected.length === 0 || feedback === "success") return;
    setSelected((items) => items.slice(0, -1));
    setFeedback(null);
    setHintedValues([]);
  }

  function showHint() {
    if (!puzzle || selected.length >= puzzle.gates.length) return;
    const values = getWinningMazeOptions(puzzle.gates, selectedValues);
    setHintedValues(values);
    setHints((value) => value + 1);
  }

  const nodeX = (gateIndex: number) => {
    if (!puzzle) return 0;
    return 105 + gateIndex * (730 / Math.max(1, puzzle.gates.length - 1));
  };

  const routePoints = selected.map((item) => `${nodeX(item.gateIndex)},${NODE_Y[item.optionIndex]}`);
  const routePath = routePoints.length > 0
    ? `M 25 ${MAP_HEIGHT / 2} L ${routePoints.join(" L ")}${selected.length === puzzle?.gates.length ? ` L 915 ${MAP_HEIGHT / 2}` : ""}`
    : "";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-cyan-200 bg-slate-950 shadow-2xl" aria-label="Gra Labirynt 67">
      <div className="relative min-h-[940px] overflow-hidden sm:min-h-[820px] lg:min-h-[720px]">
        <Image
          src="/materials/maze-67/v1/maze-67-scene-v1.png"
          alt="Magiczny kamienny labirynt z turkusowymi ścieżkami"
          fill
          sizes="(min-width: 1280px) 1100px, 100vw"
          className="object-cover"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/15 to-slate-950/75" />

        <header className="absolute inset-x-0 top-0 z-30 p-4 text-white sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Strategiczna misja dodawania</p>
              <h1 className="text-2xl font-black sm:text-4xl">Labirynt 67</h1>
            </div>
            {status !== "intro" ? (
              <div className="flex flex-wrap justify-end gap-2">
                <div className="rounded-2xl bg-slate-950/80 px-4 py-2 text-right ring-1 ring-white/20">
                  <p className="text-[9px] font-black uppercase text-cyan-200">Czas</p>
                  <p className="font-mono text-lg font-black">{formatMissionTime(status === "complete" ? finalSeconds : elapsedSeconds)}</p>
                </div>
                <div className="rounded-2xl bg-amber-300 px-4 py-2 text-right text-amber-950 shadow-lg">
                  <p className="text-[9px] font-black uppercase">Suma trasy</p>
                  <p className="text-xl font-black">{currentSum} / 67</p>
                </div>
                <div className={`rounded-2xl px-4 py-2 text-right shadow-lg ${remaining >= 0 ? "bg-cyan-100 text-cyan-950" : "bg-rose-200 text-rose-950"}`}>
                  <p className="text-[9px] font-black uppercase">{remaining >= 0 ? "Brakuje" : "Nadmiar"}</p>
                  <p className="text-xl font-black">{Math.abs(remaining)}</p>
                </div>
              </div>
            ) : null}
          </div>
          {status === "playing" && puzzle ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="Postęp przez labirynt" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-300 transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
              <b className="min-w-20 text-right text-sm">Brama {selected.length}/{puzzle.gates.length}</b>
            </div>
          ) : null}
        </header>

        {status === "intro" ? (
          <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/35 p-4 pt-24 backdrop-blur-[2px]">
            <div className="max-w-2xl rounded-[2rem] border-4 border-cyan-100 bg-white/95 p-6 text-center shadow-2xl sm:p-8">
              <span className="text-6xl" aria-hidden="true">🧭</span>
              <h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Znajdź drogę do liczby 67</h2>
              <p className="mt-3 leading-relaxed text-slate-600">Labirynt ma kilka bram. Przy każdej wybierasz jedną z trzech liczb. Wybrane liczby dodają się do wyniku trasy. Zaplanuj przejście tak, aby przy wyjściu suma wynosiła dokładnie <strong className="text-violet-700">67</strong>.</p>
              <div className="mt-4 grid gap-3 text-left sm:grid-cols-3">
                <div className="rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950"><span className="text-xl">①</span><br />Spójrz na wszystkie przyszłe bramy.</div>
                <div className="rounded-2xl bg-violet-50 p-3 text-sm font-bold text-violet-950"><span className="text-xl">②</span><br />Kontroluj sumę i wartość „brakuje”.</div>
                <div className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-950"><span className="text-xl">③</span><br />Możesz cofnąć krok lub użyć kompasu.</div>
              </div>
              <GameDifficultyPicker value={difficulty} onChange={setDifficulty} descriptions={DIFFICULTY_DESCRIPTIONS} accent="violet" />
              <button type="button" onClick={start} className="mt-5 min-h-14 rounded-2xl bg-gradient-to-r from-cyan-600 to-violet-600 px-8 text-lg font-black text-white shadow-xl">Wejdź do labiryntu →</button>
            </div>
          </div>
        ) : null}

        {status === "playing" && puzzle ? (
          <div className="absolute inset-x-0 bottom-0 top-36 z-10 flex flex-col p-3 sm:top-40 sm:p-5">
            <div className="overflow-x-auto rounded-[2rem] border-2 border-cyan-100/50 bg-slate-950/62 p-3 shadow-2xl backdrop-blur-md">
              <div className="relative mx-auto h-[360px] min-w-[940px]" style={{ width: MAP_WIDTH }}>
                <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <defs>
                    <filter id="maze-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  {puzzle.gates.slice(0, -1).flatMap((gate, gateIndex) =>
                    gate.options.flatMap((_, optionIndex) =>
                      puzzle.gates[gateIndex + 1].options.map((__, nextOptionIndex) => (
                        <line key={`${gate.id}-${optionIndex}-${nextOptionIndex}`} x1={nodeX(gateIndex)} y1={NODE_Y[optionIndex]} x2={nodeX(gateIndex + 1)} y2={NODE_Y[nextOptionIndex]} stroke="rgba(165,243,252,.14)" strokeWidth="2" />
                      )),
                    ),
                  )}
                  <line x1="25" y1="180" x2={nodeX(0)} y2="180" stroke="rgba(255,255,255,.25)" strokeWidth="3" strokeDasharray="7 7" />
                  <line x1={nodeX(puzzle.gates.length - 1)} y1="180" x2="915" y2="180" stroke="rgba(255,255,255,.25)" strokeWidth="3" strokeDasharray="7 7" />
                  {routePath ? <path d={routePath} fill="none" stroke="#67e8f9" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#maze-glow)" className="transition-all" /> : null}
                </svg>

                <div className="absolute left-0 top-1/2 grid size-14 -translate-y-1/2 place-items-center rounded-full border-4 border-cyan-100 bg-cyan-500 text-2xl shadow-[0_0_24px_#22d3ee]" aria-label="Wejście">🚪</div>
                <div className={`absolute right-0 top-1/2 grid size-16 -translate-y-1/2 place-items-center rounded-full border-4 text-xl font-black shadow-2xl ${feedback === "success" ? "border-amber-100 bg-amber-300 text-amber-950 shadow-[0_0_34px_#fcd34d]" : "border-violet-100 bg-violet-600 text-white"}`} aria-label="Cel 67">67</div>

                {puzzle.gates.map((gate, gateIndex) =>
                  gate.options.map((value, optionIndex) => {
                    const chosen = selected[gateIndex]?.optionIndex === optionIndex;
                    const current = gateIndex === selected.length;
                    const future = gateIndex > selected.length;
                    const hinted = current && hintedValues.includes(value);
                    return (
                      <button
                        key={`${gate.id}-${optionIndex}`}
                        type="button"
                        onClick={() => choose(gateIndex, optionIndex, value)}
                        disabled={!current || feedback === "dead-end"}
                        className={`absolute grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 text-xl font-black shadow-xl transition sm:size-[4.5rem] sm:text-2xl ${chosen ? "z-20 border-emerald-100 bg-emerald-300 text-emerald-950 shadow-[0_0_28px_#6ee7b7]" : hinted ? "z-20 animate-pulse border-amber-100 bg-amber-300 text-amber-950 shadow-[0_0_34px_#fcd34d]" : current ? "z-10 border-cyan-100 bg-white text-slate-950 hover:scale-110 hover:bg-cyan-50" : future ? "border-white/25 bg-slate-950/75 text-white/75" : "border-white/15 bg-slate-800/75 text-white/40"}`}
                        style={{ left: nodeX(gateIndex), top: NODE_Y[optionIndex] }}
                        aria-label={`Brama ${gateIndex + 1}, wybierz ${value}`}
                      >
                        {value}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="min-h-16 rounded-2xl border border-white/25 bg-slate-950/78 p-4 text-center text-white backdrop-blur-md" aria-live="polite">
                {feedback === "dead-end" ? <p className="font-black text-rose-200">Ta trasa kończy się wynikiem {currentSum}. {remaining > 0 ? `Brakuje ${remaining}.` : `Masz nadmiar ${Math.abs(remaining)}.`} Cofnij ostatnią bramę i spróbuj inaczej.</p> : feedback === "success" ? <p className="text-xl font-black text-amber-200">67! Brama wyjściowa otwiera się!</p> : <p className="font-bold text-cyan-100">{selected.length === puzzle.gates.length ? "Sprawdzam trasę…" : `Wybierz liczbę przy bramie ${selected.length + 1}. Wszystkie dalsze liczby są już widoczne.`}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={undo} disabled={selected.length === 0 || feedback === "success"} className="min-h-14 rounded-2xl border-2 border-white/60 bg-slate-950/80 px-5 font-black text-white disabled:opacity-40">↶ Cofnij krok</button>
                <button type="button" onClick={showHint} disabled={selected.length >= puzzle.gates.length || feedback === "dead-end"} className="min-h-14 rounded-2xl border-2 border-amber-100 bg-amber-300 px-5 font-black text-amber-950 disabled:opacity-40">🧭 Kompas</button>
              </div>
            </div>
          </div>
        ) : null}

        {status === "complete" ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/55 p-5 backdrop-blur-sm">
            <div className="max-w-xl rounded-[2rem] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-2xl">
              <div className="text-7xl" aria-hidden="true">🏛️</div>
              <p className="mt-2 text-xs font-black uppercase tracking-[.2em] text-violet-700">Cel osiągnięty · 67</p>
              <h2 className="mt-1 text-4xl font-black text-slate-950">Labirynt rozwiązany!</h2>
              <p className="mt-3 text-lg text-slate-600">Twoja trasa: <strong className="text-slate-950">{selectedValues.join(" + ")} = 67</strong></p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-2xl bg-cyan-50 p-3"><span className="block text-xs font-black uppercase text-cyan-700">Czas</span><b className="font-mono text-xl">{formatMissionTime(finalSeconds)}</b></div>
                <div className="rounded-2xl bg-rose-50 p-3"><span className="block text-xs font-black uppercase text-rose-700">Ślepe drogi</span><b className="text-xl">{mistakes}</b></div>
                <div className="rounded-2xl bg-amber-50 p-3"><span className="block text-xs font-black uppercase text-amber-700">Kompasy</span><b className="text-xl">{hints}</b></div>
              </div>
              {mistakes === 0 && hints === 0 && rewardEnabled ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">{rewardStatus === "saving" ? "Zapisuję nagrodę…" : rewardStatus === "awarded" ? "🏆 Pierwsze samodzielne przejście — zdobywasz 5 punktów!" : rewardStatus === "already-awarded" ? "Perfekcyjna trasa! Nagroda jest już zapisana." : rewardStatus === "error" ? "Nie udało się teraz zapisać punktów." : "Perfekcyjna trasa!"}</p> : null}
              <div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={start} className="min-h-12 rounded-xl bg-violet-600 px-6 font-black text-white">Nowy labirynt</button><button type="button" onClick={() => setStatus("intro")} className="min-h-12 rounded-xl border-2 border-slate-300 px-6 font-black text-slate-700">Zmień poziom</button></div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
