"use client";

import { useState } from "react";

interface Props { seed: number; readOnly?: boolean; presentationMode?: boolean; }

/** Osobne, wizualne wejście do Live — nie powiela ani ćwiczeń, ani stacji. */
export function LiveLaunchPadModel({ readOnly = false }: Props) {
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const missions = [
    { icon: "🔢", label: "LICZBY", detail: "układamy i porównujemy", color: "from-violet-500 to-indigo-700" },
    { icon: "↔", label: "RUCH", detail: "skaczemy po osi", color: "from-cyan-400 to-blue-700" },
    { icon: "✦", label: "REGUŁY", detail: "wybieramy pierwszy krok", color: "from-amber-400 to-orange-600" },
  ];
  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl sm:p-10">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,.45),transparent_40%),radial-gradient(circle_at_20%_90%,rgba(34,211,238,.25),transparent_30%)]" />
    <p className="text-center text-xs font-black tracking-[.3em] text-cyan-300">LIVE · PANEL STARTOWY</p>
    <h3 className="mt-3 text-center text-4xl font-black sm:text-6xl">Misja: klasa V</h3>
    <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-300 sm:text-lg">Nauczyciel dotyka obszaru, który klasa uruchamia jako pierwszy. Bez odpowiedzi do wpisania.</p>
    <div className="mx-auto mt-9 grid max-w-5xl gap-4 md:grid-cols-3">{missions.map((mission, index) => <button key={mission.label} type="button" disabled={readOnly} onClick={() => setActive(index)} className={`min-h-48 rounded-[1.6rem] bg-gradient-to-br ${mission.color} p-[1px] text-left transition hover:-translate-y-1 ${active === index ? "ring-4 ring-white shadow-[0_0_35px_rgba(255,255,255,.35)]" : ""}`}><span className="flex h-full flex-col justify-between rounded-[1.5rem] bg-slate-950/65 p-5 backdrop-blur"><span className="text-5xl">{mission.icon}</span><span><span className="block text-xs font-black tracking-[.18em] text-white/70">STREFA {index + 1}</span><span className="mt-1 block text-2xl font-black">{mission.label}</span><span className="mt-1 block text-sm text-white/80">{mission.detail}</span></span></span></button>)}</div>
    <div className="mt-8 flex justify-center"><button type="button" disabled={readOnly} onClick={() => setArmed(true)} className={`min-h-16 rounded-2xl px-8 text-lg font-black transition ${armed ? "bg-emerald-400 text-emerald-950 shadow-[0_0_35px_rgba(52,211,153,.55)]" : "bg-white text-slate-950 hover:scale-105"}`}>{armed ? "START — przejdź do stacji" : "URUCHOM MISJĘ"}</button></div>
  </section>;
}
