"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { GameDifficultyPicker } from "@/components/materials/games/GameDifficultyPicker";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";

const CubeBuilderScene = dynamic(
  () => import("./CubeBuilderScene").then((module) => module.CubeBuilderScene),
  { ssr: false, loading: () => <div className="flex h-[360px] items-center justify-center rounded-3xl bg-sky-100 font-black text-sky-950">Ładuję pracownię 3D…</div> },
);

export type BuildTask = { id: string; title: string; instruction: string; heights: readonly (readonly number[])[] };
type CubeMode = "add" | "remove";

const TASKS: Record<GameDifficulty, readonly BuildTask[]> = {
  easy: [
    { id: "easy-cube", title: "Sześcian", instruction: "Zbuduj sześcian o krawędzi 2 kostek.", heights: [[2, 2], [2, 2]] },
    { id: "easy-platform", title: "Niska platforma", instruction: "Ułóż jedną równą warstwę kostek.", heights: [[1, 1, 1], [1, 1, 1]] },
    { id: "easy-wall", title: "Ściana", instruction: "Zbuduj pionową ścianę z dwóch warstw.", heights: [[2, 2, 2]] },
  ],
  medium: [
    { id: "medium-steps", title: "Schodki", instruction: "Każdy kolejny rząd ma być o jedną kostkę wyższy.", heights: [[1, 2, 3], [1, 2, 3]] },
    { id: "medium-l", title: "Bryła w kształcie L", instruction: "Zbuduj dwuwarstwową bryłę w kształcie litery L.", heights: [[2, 2, 2], [2, 0, 0], [2, 0, 0]] },
    { id: "medium-terrace", title: "Taras", instruction: "Ułóż niski taras z wyższym środkiem.", heights: [[1, 1, 1], [1, 2, 1], [1, 1, 1]] },
  ],
  hard: [
    { id: "hard-great-steps", title: "Wielkie schody", instruction: "Zbuduj szerokie schody o trzech wysokościach.", heights: [[1, 2, 3], [1, 2, 3], [1, 2, 3]] },
    { id: "hard-pyramid", title: "Piramida schodkowa", instruction: "Od szerokiej podstawy prowadź bryłę do wysokiego narożnika.", heights: [[3, 3, 2], [3, 2, 1], [2, 1, 1]] },
    { id: "hard-gate", title: "Brama", instruction: "Zostaw środek pusty i zbuduj wysokie filary bramy.", heights: [[3, 0, 3], [3, 2, 3], [3, 0, 3]] },
  ],
};

const DIFFICULTY_DESCRIPTIONS: Record<GameDifficulty, string> = {
  easy: "Sześcian, ściana i platforma",
  medium: "Schodki, tarasy i litera L",
  hard: "Piramidy, bramy i złożone schody",
};

function cubeKey(x: number, y: number, z: number) {
  return `${x}:${y}:${z}`;
}

function targetVolume(task: BuildTask) {
  return task.heights.flat().reduce((total, value) => total + value, 0);
}

function taskDimensions(task: BuildTask) {
  return { depth: task.heights.length, width: Math.max(...task.heights.map((row) => row.length)) };
}

export function isCubeBuildComplete(cubes: ReadonlySet<string>, task: BuildTask) {
  return cubes.size === targetVolume(task);
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
  const { width, depth } = taskDimensions(task);
  const maxHeight = Math.max(...task.heights.flat());
  const volume = targetVolume(task);

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
      const allowedHeight = task.heights[z]?.[x] ?? 0;
      const levels = Array.from({ length: allowedHeight }, (_, level) => level).filter((level) => next.has(cubeKey(x, level, z)));
      if (mode === "remove") {
        const levelToRemove = clickedLevel ?? levels.at(-1);
        if (levelToRemove === undefined) return current;
        for (let level = levelToRemove; level < allowedHeight; level += 1) next.delete(cubeKey(x, level, z));
        return next;
      }
      const nextLevel = levels.length;
      if (nextLevel < allowedHeight) next.add(cubeKey(x, nextLevel, z));
      return next;
    });
  }, [completed, mode, task.heights]);

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
      <div className="rounded-3xl bg-white p-3 text-slate-950 sm:p-4"><CubeBuilderScene width={width} depth={depth} targetHeights={task.heights} cubes={cubes} mode={mode} onColumnPress={onColumnPress} /></div>
      <aside className="rounded-3xl bg-white p-5 text-slate-950"><p className="text-xs font-black uppercase tracking-[.14em] text-cyan-700">Cel budowy</p><h2 className="mt-2 text-2xl font-black">{task.title}</h2><p className="mt-2 text-slate-600">{task.instruction} Liczba w każdym polu planu oznacza wysokość kolumny kostek.</p><p className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-center text-lg font-black text-indigo-950" aria-label="Wymiary maksymalne bryły">Wymiary: {width} × {depth} × {maxHeight}</p><div className="mt-4 grid gap-1 rounded-2xl bg-slate-100 p-3" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }} aria-label="Plan wysokości bryły">{Array.from({ length: depth * width }, (_, index) => { const x = index % width; const z = Math.floor(index / width); const height = task.heights[z]?.[x] ?? 0; return <button key={index} type="button" disabled={height === 0} onClick={() => onColumnPress(x, z)} aria-label={`Kolumna ${x + 1}, ${z + 1}: wysokość ${height}`} className={`grid min-h-12 aspect-square place-items-center rounded-lg text-sm font-black transition ${height === 0 ? "cursor-not-allowed bg-slate-200 text-slate-400" : "bg-white text-indigo-950 ring-1 ring-indigo-200 hover:bg-cyan-100 active:scale-95"}`}>{height}</button>; })}</div><p className="mt-2 text-center text-xs font-bold text-slate-600">Dotknij pola w planie, aby zawsze dokładnie wybrać kolumnę.</p><p className="mt-5 rounded-2xl bg-cyan-50 p-4 text-center"><span className="block text-xs font-black uppercase tracking-wide text-cyan-800">Ułożone kostki</span><strong className="mt-1 block text-4xl text-cyan-950" aria-live="polite">{cubes.size} / {volume}</strong></p><div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Tryb budowania"><button type="button" aria-pressed={mode === "add"} onClick={() => setMode("add")} className={`min-h-12 rounded-xl font-black ${mode === "add" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>+ Dodaj</button><button type="button" aria-pressed={mode === "remove"} onClick={() => setMode("remove")} className={`min-h-12 rounded-xl font-black ${mode === "remove" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700"}`}>− Usuń</button></div>{buildIsComplete && !completed ? <button type="button" onClick={() => setCompleted(true)} className="mt-4 min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-black text-white">Sprawdź budowlę</button> : null}{completed ? <div className="mt-4 rounded-2xl bg-emerald-100 p-4 text-emerald-950"><strong className="block text-lg">Gotowe!</strong><p className="mt-1 text-sm">Zbudowano {volume} kostek jednostkowych.</p><button type="button" onClick={nextTask} className="mt-3 min-h-11 w-full rounded-xl bg-emerald-600 px-3 font-black text-white">{taskIndex === tasks.length - 1 ? "Zagraj od nowa" : "Następna budowla →"}</button></div> : <p className="mt-4 text-sm font-semibold text-slate-600">Dotknij kostki, aby budować jej kolumnę, lub wybierz dokładne pole w planie. Przełącz na „Usuń”, aby poprawić budowlę.</p>}</aside>
    </div>}
  </section>;
}
