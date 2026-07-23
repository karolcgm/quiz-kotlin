"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";

const CubeBuilderScene = dynamic(
  () => import("./CubeBuilderScene").then((module) => module.CubeBuilderScene),
  { ssr: false, loading: () => <div className="flex h-[360px] items-center justify-center rounded-3xl bg-sky-100 font-black text-sky-950">Ładuję pracownię 3D…</div> },
);

type BuildTask = { id: string; width: number; depth: number; height: number };
type CubeMode = "add" | "remove";

const TASKS: Record<GameDifficulty, readonly BuildTask[]> = {
  easy: [{ id: "easy-cube", width: 2, depth: 2, height: 2 }, { id: "easy-cuboid", width: 3, depth: 2, height: 1 }],
  medium: [{ id: "medium-cuboid", width: 3, depth: 2, height: 2 }, { id: "medium-tower", width: 2, depth: 2, height: 3 }],
  hard: [{ id: "hard-cuboid", width: 3, depth: 3, height: 2 }, { id: "hard-tower", width: 3, depth: 2, height: 3 }],
};

const DIFFICULTY_DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "Bryły do 8 kostek",
  medium: "Bryły do 12 kostek",
  hard: "Bryły do 18 kostek",
};

function cubeKey(x: number, y: number, z: number) {
  return `${x}:${y}:${z}`;
}

export function isCubeBuildComplete(cubes: ReadonlySet<string>, task: BuildTask) {
  return cubes.size === task.width * task.depth * task.height;
}

export function CubeBuilderGame() {
  const [difficulty, setDifficulty] = useState<GameDifficulty>("easy");
  const [started, setStarted] = useState(false);
  const [taskIndex, setTaskIndex] = useState(0);
  const [cubes, setCubes] = useState<Set<string>>(() => new Set());
  const [mode, setMode] = useState<CubeMode>("add");
  const [completed, setCompleted] = useState(false);
  const tasks = TASKS[difficulty];
  const task = tasks[taskIndex];
  const targetVolume = task.width * task.depth * task.height;
  const currentVolume = cubes.size;

  const start = () => {
    setStarted(true);
    setTaskIndex(0);
    setCubes(new Set());
    setMode("add");
    setCompleted(false);
  };

  const onColumnPress = useCallback((x: number, z: number, clickedLevel?: number) => {
    if (completed) return;
    setCubes((current) => {
      const next = new Set(current);
      const levels = Array.from({ length: task.height }, (_, level) => level).filter((level) => next.has(cubeKey(x, level, z)));
      if (mode === "remove") {
        const levelToRemove = clickedLevel ?? levels.at(-1);
        if (levelToRemove === undefined) return current;
        for (let level = levelToRemove; level < task.height; level += 1) next.delete(cubeKey(x, level, z));
        return next;
      }
      const nextLevel = levels.length;
      if (nextLevel < task.height) next.add(cubeKey(x, nextLevel, z));
      return next;
    });
  }, [completed, mode, task.height]);

  const complete = useCallback(() => {
    setCompleted(true);
  }, []);

  const nextTask = () => {
    if (taskIndex === tasks.length - 1) {
      start();
      return;
    }
    setTaskIndex((value) => value + 1);
    setCubes(new Set());
    setCompleted(false);
    setMode("add");
  };

  const buildIsComplete = useMemo(() => isCubeBuildComplete(cubes, task), [cubes, task]);

  return <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-900 p-4 text-white shadow-2xl sm:p-7" data-cube-builder-game>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Pracownia brył 3D</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Budowniczy sześcianów</h1></div>
      {started ? <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-black">Budowla {taskIndex + 1}/{tasks.length}</span> : null}
    </header>

    {!started ? <div className="mt-6 rounded-3xl bg-white p-5 text-center text-slate-950 sm:p-8"><div className="text-6xl" aria-hidden>🧊</div><h2 className="mt-3 text-2xl font-black">Zbuduj bryłę z kostek jednostkowych</h2><p className="mx-auto mt-3 max-w-2xl leading-relaxed text-slate-600">Wybierz poziom, a potem dotykaj pól w modelu 3D. Każde dotknięcie dodaje jedną kostkę; w trybie usuwania dotknij kostki, której nie chcesz.</p><GameDifficultyPicker value={difficulty} onChange={setDifficulty} descriptions={DIFFICULTY_DESCRIPTIONS} accent="cyan" /><button type="button" onClick={start} className="mt-6 min-h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-7 text-lg font-black text-slate-950 shadow-lg transition hover:from-cyan-400 hover:to-teal-400">Otwórz pracownię 3D →</button></div> : <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_270px]">
      <div className="rounded-3xl bg-white p-3 text-slate-950 sm:p-4"><CubeBuilderScene width={task.width} depth={task.depth} height={task.height} cubes={cubes} mode={mode} onColumnPress={onColumnPress} /></div>
      <aside className="rounded-3xl bg-white p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-[.14em] text-cyan-700">Cel budowy</p><h2 className="mt-2 text-2xl font-black">{task.width} × {task.depth} × {task.height}</h2><p className="mt-2 text-slate-600">Ułóż pełny prostopadłościan. Każda kostka ma objętość 1 cm³.</p><p className="mt-5 rounded-2xl bg-cyan-50 p-4 text-center"><span className="block text-xs font-black uppercase tracking-wide text-cyan-800">Ułożone kostki</span><strong className="mt-1 block text-4xl text-cyan-950" aria-live="polite">{currentVolume} / {targetVolume}</strong></p><div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Tryb budowania"><button type="button" aria-pressed={mode === "add"} onClick={() => setMode("add")} className={`min-h-12 rounded-xl font-black ${mode === "add" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>+ Dodaj</button><button type="button" aria-pressed={mode === "remove"} onClick={() => setMode("remove")} className={`min-h-12 rounded-xl font-black ${mode === "remove" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700"}`}>− Usuń</button></div>{buildIsComplete && !completed ? <button type="button" onClick={complete} className="mt-4 min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-black text-white">Sprawdź budowlę</button> : null}{completed ? <div className="mt-4 rounded-2xl bg-emerald-100 p-4 text-emerald-950"><strong className="block text-lg">Gotowe!</strong><p className="mt-1 text-sm">Zbudowano {targetVolume} kostek jednostkowych.</p><button type="button" onClick={nextTask} className="mt-3 min-h-11 w-full rounded-xl bg-emerald-600 px-3 font-black text-white">{taskIndex === tasks.length - 1 ? "Zagraj od nowa" : "Następna budowla →"}</button></div> : <p className="mt-4 text-sm font-semibold text-slate-600">Dotknij niebieskiego pola, aby dodać kostkę. Przełącz na „Usuń”, aby poprawić budowlę.</p>}</aside>
    </div>}
  </section>;
}
