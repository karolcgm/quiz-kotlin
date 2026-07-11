"use client";

import { useState } from "react";

interface Props { seed: number; readOnly?: boolean; presentationMode?: boolean; }

function Stepper({ label, value, min, max, onChange, readOnly }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; readOnly: boolean }) {
  return <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-center">
    <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">{label}</p>
    <p className="my-4 text-7xl font-black tabular-nums">{value}</p>
    <div className="grid grid-cols-2 gap-3">
      <button type="button" disabled={readOnly || value <= min} onClick={() => onChange(value - 1)} className="min-h-16 rounded-2xl bg-white/10 text-4xl font-black disabled:opacity-30">−</button>
      <button type="button" disabled={readOnly || value >= max} onClick={() => onChange(value + 1)} className="min-h-16 rounded-2xl bg-white text-4xl font-black text-slate-950 disabled:opacity-30">+</button>
    </div>
  </div>;
}

/** Tablica organizacyjna do wspólnej pracy z dowolnym podręcznikiem. */
export function ExerciseBoardModel({ readOnly = false }: Props) {
  const [page, setPage] = useState(1);
  const [exercise, setExercise] = useState(1);
  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,.3),transparent_33%),radial-gradient(circle_at_85%_85%,rgba(168,85,247,.3),transparent_34%)]" />
    <header><p className="text-xs font-black tracking-[.24em] text-cyan-300">PODRĘCZNIK · PRACA Z KLASĄ</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">Otwórz podręcznik</h3><p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-lg">Nauczyciel ustawia stronę i numer aktualnie wykonywanego zadania.</p></header>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Stepper label="Strona" value={page} min={1} max={999} onChange={setPage} readOnly={readOnly} />
      <Stepper label="Zadanie" value={exercise} min={1} max={99} onChange={setExercise} readOnly={readOnly} />
    </div>
    <p className="mt-6 rounded-2xl bg-cyan-300 px-5 py-4 text-center text-xl font-black text-slate-950">Strona {page} · zadanie {exercise}</p>
  </section>;
}
