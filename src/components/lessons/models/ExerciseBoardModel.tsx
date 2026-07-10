"use client";

import { useState } from "react";

interface Props { seed: number; readOnly?: boolean; presentationMode?: boolean; }

/** Pusty, dotykowy ekran dla pracy z podręcznikiem — nauczyciel zaznacza wykonane pola. */
export function ExerciseBoardModel({ readOnly = false }: Props) {
  const [marked, setMarked] = useState<number[]>([]);
  const toggle = (index: number) => { if (!readOnly) setMarked((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]); };
  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,.3),transparent_33%),radial-gradient(circle_at_85%_85%,rgba(168,85,247,.3),transparent_34%)]" />
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.24em] text-cyan-300">TRYB NAUCZYCIELA · PODRĘCZNIK</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">Ćwiczenia</h3><p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-lg">Wybierz zadania z własnego podręcznika. Dotknij pola, aby zaznaczyć je klasie — zaczynamy od lewego górnego rogu.</p></div><button type="button" onClick={() => setMarked([])} className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-bold hover:bg-white/10">Wyczyść zaznaczenia</button></div>
    <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 18 }).map((_, index) => { const active = marked.includes(index); return <button key={index} type="button" onClick={() => toggle(index)} className={`touch-manipulation aspect-[1.2] rounded-2xl border-2 text-3xl font-black sm:text-4xl ${active ? "border-emerald-200 bg-emerald-400 text-emerald-950 shadow-[0_0_30px_rgba(52,211,153,.45)]" : "border-white/15 bg-white/5 text-white"}`} aria-pressed={active}><span className="block">{index + 1}</span><span className="mt-1 block text-[10px] tracking-widest">{active ? "WYBRANE" : "DOTKNIJ"}</span></button>; })}</div>
    <p className="mt-6 text-center text-sm font-semibold text-slate-300">{marked.length === 0 ? "Tablica jest gotowa — nauczyciel wybiera pierwsze zadanie." : `Wybrano: ${marked.map((item) => item + 1).join(", ")}`}</p>
  </section>;
}
