"use client";

import { useMemo, useState } from "react";
import { buildEquation, describeMovement } from "@/lib/math/numberLine";

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
  { start: 480, change: 120, strategy: "Dopełnij do 600" },
  { start: 1250, change: -250, strategy: "Odejmij ćwierć tysiąca" },
  { start: 760, change: 240, strategy: "Dopełnij do 1000" },
  { start: 2500, change: -300, strategy: "Odejmij trzy setki" },
  { start: 3990, change: 10, strategy: "Dopełnij do 4000" },
];

function NumberKeypad({ onPress, disabled }: { onPress: (key: string) => void; disabled: boolean }) {
  return <div className="grid grid-cols-5 gap-2" aria-label="Klawiatura liczbowa">
    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((key) => (
      <button key={key} type="button" disabled={disabled} onClick={() => onPress(key)} className="min-h-11 rounded-xl border border-indigo-200 bg-white text-lg font-black text-indigo-950 disabled:opacity-50">{key}</button>
    ))}
    <button type="button" disabled={disabled} onClick={() => onPress("backspace")} className="col-span-5 min-h-11 rounded-xl border border-indigo-200 bg-indigo-50 font-bold text-indigo-950 disabled:opacity-50">← Usuń</button>
  </div>;
}

export function NumberLineJumpsModel({ seed, taskSeed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const gradeSix = seed >= 600;
  const task = useMemo<JumpTask>(() => {
    if (gradeSix) return GRADE_SIX_TASKS[((taskSeed ?? seed) + (questionNumber ?? 0)) % GRADE_SIX_TASKS.length] ?? GRADE_SIX_TASKS[0]!;
    const start = 20 + (seed % 41);
    const change = ((seed % 7) + 1) * (seed % 2 === 0 ? 1 : -1);
    return { start, change, strategy: change > 0 ? "Skok w prawo" : "Skok w lewo" };
  }, [gradeSix, questionNumber, seed, taskSeed]);
  const { start, change } = task;
  const result = start + change;
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const correct = answer !== "" && Number(answer) === result;
  const min = Math.min(start, result) - Math.max(20, Math.abs(change) / 4);
  const max = Math.max(start, result) + Math.max(20, Math.abs(change) / 4);
  const span = max - min || 1;
  const toX = (value: number) => 44 + ((value - min) / span) * 312;
  const ticks = Array.from({ length: 7 }, (_, index) => Math.round(min + (span * index) / 6));

  const updateAnswer = (next: string) => {
    setAnswer(next);
    setConfirmed(false);
    if (!next) onResultChange?.(null);
    else onResultChange?.(Number(next) === result, next);
  };
  const press = (key: string) => updateAnswer(key === "backspace" ? answer.slice(0, -1) : `${answer}${key}`.slice(0, 5));

  return <div className="space-y-3 rounded-3xl border border-sky-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="rounded-2xl border border-sky-100 bg-sky-50 p-2">
      <svg viewBox="0 0 400 150" className="w-full" role="img" aria-label="Oś liczbowa z zaznaczonym początkiem i pustym miejscem na wynik">
        <defs><marker id="jump-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#0ea5e9" /></marker></defs>
        <line x1="28" y1="92" x2="372" y2="92" stroke="#334155" strokeWidth="3" />
        {ticks.map((tick) => <g key={tick}><line x1={toX(tick)} y1="84" x2={toX(tick)} y2="100" stroke="#475569" strokeWidth="2" /><text x={toX(tick)} y="122" textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">{tick}</text></g>)}
        <path d={`M ${toX(start)} 70 Q ${(toX(start) + toX(result)) / 2} 22 ${toX(result)} 70`} fill="none" stroke="#0ea5e9" strokeWidth="4" markerEnd="url(#jump-arrow)" />
        <circle cx={toX(start)} cy="92" r="9" fill="#4f46e5" /><text x={toX(start)} y="78" textAnchor="middle" className="fill-indigo-800 text-sm font-black">start</text>
        <rect x={toX(result) - 18} y="72" width="36" height="36" rx="7" fill="white" stroke="#2563eb" strokeWidth="2" />
        <text x={toX(result)} y="97" textAnchor="middle" className="fill-indigo-900 text-lg font-black">{readOnly ? result : answer || "?"}</text>
      </svg>
    </div>
    <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-center">
      {questionNumber && questionCount ? <p className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-700">Zadanie {questionNumber}/{questionCount}</p> : null}
      <p className="text-lg font-black text-indigo-950 sm:text-xl">{readOnly ? buildEquation(start, change, result) : `${start} ${change >= 0 ? "+" : "−"} ${Math.abs(change)} = ?`}</p>
      <p className="mt-1 text-xs font-semibold text-indigo-900">{describeMovement(change)}</p>
    </div>
    {!readOnly ? <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <label className="block text-sm font-bold text-slate-800">Wpisz liczbę z pustego pola na osi</label>
      <input value={answer} readOnly inputMode="none" aria-label="Liczba w pustym polu osi" className="mt-2 h-12 w-full rounded-xl border-2 border-indigo-200 bg-slate-50 px-4 text-center text-xl font-black text-indigo-950" />
      <div className="mt-3"><NumberKeypad disabled={false} onPress={press} /></div>
      {!onResultChange ? <><button type="button" disabled={!answer} onClick={() => setConfirmed(true)} className="mt-3 min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-black text-white disabled:bg-slate-300">Zatwierdź</button>{confirmed ? <p className={`mt-3 rounded-xl px-3 py-2 text-sm font-bold ${correct ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{correct ? "Dobrze — skok kończy się na wskazanej liczbie." : "Sprawdź kierunek i długość skoku."}</p> : null}</> : null}
    </div> : null}
  </div>;
}
