"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

interface Props {
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type JumpTask = { start: number; change: number; strategy: string };

const GRADE_SIX_TASKS: JumpTask[] = [
  { start: 480, change: 120, strategy: "Dodaj sześć równych kroków po 20." },
  { start: 1250, change: -250, strategy: "Odejmij pięć równych kroków po 50." },
  { start: 760, change: 240, strategy: "Dodaj sześć równych kroków po 40." },
  { start: 2500, change: -300, strategy: "Odejmij sześć równych kroków po 50." },
  { start: 3990, change: 10, strategy: "Wykonaj jeden krok w prawo." },
];

function NumberKeypad({ onPress, disabled }: { onPress: (key: string) => void; disabled: boolean }) {
  return (
    <div className="grid grid-cols-5 gap-2" aria-label="Klawiatura liczbowa">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((key) => (
        <button key={key} type="button" disabled={disabled} onClick={() => onPress(key)} className="min-h-11 rounded-xl border border-indigo-200 bg-white text-lg font-black text-indigo-950 disabled:opacity-50">{key}</button>
      ))}
      <button type="button" disabled={disabled} onClick={() => onPress("backspace")} className="col-span-5 min-h-11 rounded-xl border border-indigo-200 bg-indigo-50 font-bold text-indigo-950 disabled:opacity-50">← Usuń</button>
    </div>
  );
}

export function NumberLineJumpsModel({ seed, taskSeed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const gradeSix = seed >= 600;
  const task = useMemo<JumpTask>(() => {
    if (gradeSix) return GRADE_SIX_TASKS[((taskSeed ?? seed) + (questionNumber ?? 0)) % GRADE_SIX_TASKS.length] ?? GRADE_SIX_TASKS[0]!;
    const start = 20 + (seed % 41);
    const change = ((seed % 7) + 1) * (seed % 2 === 0 ? 1 : -1);
    return { start, change, strategy: change > 0 ? "Wykonaj skok w prawo." : "Wykonaj skok w lewo." };
  }, [gradeSix, questionNumber, seed, taskSeed]);

  const { start, change } = task;
  const result = start + change;
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const resultReporter = useRef(onResultChange);
  const correct = answer !== "" && Number(answer) === result;

  useEffect(() => { resultReporter.current = onResultChange; }, [onResultChange]);
  useEffect(() => {
    setAnswer("");
    setConfirmed(false);
    resultReporter.current?.(null);
  }, [taskSeed, questionNumber]);

  const updateAnswer = (next: string) => {
    setAnswer(next);
    setConfirmed(false);
    if (!next) onResultChange?.(null);
    else onResultChange?.(Number(next) === result, next);
  };
  const press = (key: string) => updateAnswer(key === "backspace" ? answer.slice(0, -1) : `${answer}${key}`.slice(0, 5));
  const startX = change >= 0 ? 72 : 328;
  const endX = change >= 0 ? 328 : 72;

  return (
    <LessonTaskFrame
      eyebrow="Dział 1 · Temat 1"
      heading="Rachunki na osi liczbowej"
      description="Odczytaj działanie z łuku. Na osi są podpisane tylko dane potrzebne do rozwiązania."
      questionNumber={questionNumber}
      questionCount={questionCount}
      contentClassName="space-y-4"
    >
      <section className="rounded-2xl border border-sky-100 bg-sky-50 p-3 sm:p-5">
        <p className="mb-2 text-center text-xs font-black uppercase tracking-[.16em] text-sky-800">Oś do bieżącego działania</p>
        <svg viewBox="0 0 400 166" className="w-full" role="img" aria-label="Oś liczbowa z początkiem skoku i pustym polem na wynik">
          <defs><marker id="jump-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#0ea5e9" /></marker></defs>
          <line x1="28" y1="92" x2="372" y2="92" stroke="#334155" strokeWidth="3" />
          {Array.from({ length: 11 }, (_, index) => <line key={index} x1={40 + index * 32} y1="82" x2={40 + index * 32} y2="102" stroke="#475569" strokeWidth="2" />)}
          <path d={`M ${startX} 68 Q 200 18 ${endX} 68`} fill="none" stroke="#0ea5e9" strokeWidth="4" markerEnd="url(#jump-arrow)" />
          <text x="200" y="33" textAnchor="middle" className="fill-sky-800 text-sm font-black">{change >= 0 ? "+" : "−"}{Math.abs(change)}</text>
          <circle cx={startX} cy="92" r="9" fill="#4f46e5" />
          <text x={startX} y="127" textAnchor="middle" className="fill-indigo-900 text-base font-black">{start}</text>
          <rect x={endX - 22} y="111" width="44" height="32" rx="7" fill="white" stroke="#2563eb" strokeWidth="2" />
          <text x={endX} y="134" textAnchor="middle" className="fill-indigo-900 text-lg font-black">{readOnly ? result : answer || "?"}</text>
        </svg>
      </section>

      <section className="rounded-2xl bg-indigo-50 px-4 py-4 text-center">
        <p className="text-2xl font-black text-indigo-950 sm:text-3xl">
          {start} {change >= 0 ? "+" : "−"} {Math.abs(change)} = <span className="inline-block min-w-12 rounded-lg border-2 border-dashed border-indigo-400 bg-white px-2">{readOnly ? result : answer || "□"}</span>
        </p>
        <p className="mt-2 text-sm font-semibold text-indigo-900">{task.strategy}</p>
      </section>

      {!readOnly ? <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-bold text-slate-800">Wpisz wynik działania — pojawi się także w pustym miejscu na osi.</label>
        <input value={answer} readOnly inputMode="none" aria-label="Wynik działania na osi" className="mt-2 h-12 w-full rounded-xl border-2 border-indigo-200 bg-slate-50 px-4 text-center text-xl font-black text-indigo-950" />
        <div className="mt-3"><NumberKeypad disabled={false} onPress={press} /></div>
        {!onResultChange ? <><button type="button" disabled={!answer} onClick={() => setConfirmed(true)} className="mt-3 min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-black text-white disabled:bg-slate-300">Zatwierdź</button>{confirmed ? <p className={`mt-3 rounded-xl px-3 py-2 text-sm font-bold ${correct ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{correct ? "Dobrze — wynik działania zgadza się z końcem skoku." : "Sprawdź znak działania i kierunek łuku na osi."}</p> : null}</> : null}
      </section> : null}
    </LessonTaskFrame>
  );
}
