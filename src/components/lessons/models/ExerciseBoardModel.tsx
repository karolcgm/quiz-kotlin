"use client";

import { useEffect, useState } from "react";
import type { LessonBookwork } from "@/types/lessonSession";
import type { LessonLearningGoal } from "@/types/lessonPackage";

interface Props {
  seed: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  lessonTitle?: string;
  learningGoals?: LessonLearningGoal[];
  initialPage?: number | null;
  initialExercises?: string[];
  onBookworkChange?: (bookwork: LessonBookwork) => void;
}

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
export function ExerciseBoardModel({ readOnly = false, presentationMode = false, lessonTitle, learningGoals = [], initialPage, initialExercises, onBookworkChange }: Props) {
  const [page, setPage] = useState(() => Math.max(1, Math.min(999, initialPage ?? 1)));
  const [exercises, setExercises] = useState<string[]>(() => initialExercises?.length ? initialExercises : ["1"]);

  useEffect(() => {
    onBookworkChange?.({
      textbookPage: page,
      coveredExercises: exercises.map((value) => value.trim()).filter(Boolean),
    });
  }, [exercises, onBookworkChange, page]);

  const updateExercise = (index: number, value: string) => {
    setExercises((current) => current.map((item, itemIndex) => itemIndex === index ? value.slice(0, 24) : item));
  };

  const removeExercise = (index: number) => {
    setExercises((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
  };
  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,.3),transparent_33%),radial-gradient(circle_at_85%_85%,rgba(168,85,247,.3),transparent_34%)]" />
    <header>
      <p className="text-xs font-black tracking-[.24em] text-cyan-300">TEMAT LEKCJI</p>
      <h3 className="mt-1 text-3xl font-black sm:text-5xl">{lessonTitle ?? "Praca z podręcznikiem"}</h3>
      <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">Najpierw sprawdź, czego się nauczysz i po czym poznasz, że cel został osiągnięty.</p>
    </header>

    {learningGoals.length > 0 ? (
      <div className={`mt-6 grid gap-3 ${learningGoals.length > 1 ? "lg:grid-cols-2" : ""}`}>
        {learningGoals.map((goal, index) => (
          <article key={goal.id} className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-sm">
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-300 font-black text-slate-950">{index + 1}</span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-200">Mój cel</p>
                <h4 className="mt-1 text-base font-black leading-snug text-white sm:text-lg">{goal.studentGoal}</h4>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-slate-950/35 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-emerald-300">Kryteria sukcesu — potrafię:</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-100 sm:text-sm">
                {goal.successCriteria.map((criterion) => <li key={criterion} className="flex gap-2"><span className="text-emerald-300" aria-hidden>✓</span><span>{criterion}</span></li>)}
              </ul>
            </div>
            {goal.curriculumReferences.length > 0 ? <p className="mt-2 text-[10px] font-semibold text-slate-400">Podstawa programowa: {goal.curriculumReferences.join(" · ")}</p> : null}
          </article>
        ))}
      </div>
    ) : null}

    <div className="mt-7 flex flex-wrap items-end justify-between gap-2">
      <div><p className="text-xs font-black tracking-[.2em] text-fuchsia-300">PODRĘCZNIK</p><h4 className="mt-1 text-2xl font-black">Otwórz stronę i zadanie</h4></div>
      <p className="text-xs text-slate-400">{presentationMode ? "Ustawienie dla całej klasy" : "Wskazanie nauczyciela"}</p>
    </div>
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <Stepper label="Strona" value={page} min={1} max={999} onChange={setPage} readOnly={readOnly} />
      <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
        <p className="text-center text-xs font-black uppercase tracking-[.2em] text-cyan-200">Przerobione zadania</p>
        <div className="mt-4 space-y-3">
          {exercises.map((exercise, index) => <div key={index} className="flex gap-2">
            <label className="min-w-0 flex-1"><span className="sr-only">Zadanie {index + 1}</span><input type="text" inputMode="text" disabled={readOnly} value={exercise} onChange={(event) => updateExercise(index, event.target.value)} aria-label={`Zadanie ${index + 1}`} placeholder="np. 4a lub 5–7" className="min-h-14 w-full rounded-2xl border border-white/20 bg-white px-4 text-center text-2xl font-black text-slate-950 disabled:bg-white/90" /></label>
            {!readOnly && exercises.length > 1 ? <button type="button" onClick={() => removeExercise(index)} aria-label={`Usuń zadanie ${index + 1}`} className="min-h-14 rounded-2xl bg-rose-300 px-4 font-black text-rose-950">Usuń</button> : null}
          </div>)}
        </div>
        {!readOnly ? <button type="button" onClick={() => setExercises((current) => [...current, ""])} className="mt-3 min-h-12 w-full rounded-2xl border border-cyan-200/40 bg-cyan-300/15 px-4 font-black text-cyan-100">+ Dodaj kolejne zadanie</button> : null}
      </div>
    </div>
    <p className="mt-6 rounded-2xl bg-cyan-300 px-5 py-4 text-center text-xl font-black text-slate-950">Strona {page} · zadania {exercises.map((value) => value.trim()).filter(Boolean).join(", ") || "—"}</p>
  </section>;
}
