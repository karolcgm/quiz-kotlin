"use client";

import { useEffect, useMemo, useState } from "react";

interface Props { seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answer?: string) => void; }
const additions = [[468, 357], [782, 149], [596, 278], [834, 167], [429, 386]] as const;
const subtractions = [[802, 457], [900, 368], [741, 286], [650, 179], [1000, 546]] as const;

export function WrittenAddSubLessonModel({ seed, taskSeed = seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const subtract = ((Math.abs(seed) - 1) % 2) === 1;
  const [a, b] = useMemo(() => (subtract ? subtractions : additions)[Math.abs(taskSeed) % 5]!, [subtract, taskSeed]);
  const expected = subtract ? a - b : a + b;
  const [digits, setDigits] = useState("");
  useEffect(() => { setDigits(""); onResultChange?.(null); }, [taskSeed, onResultChange]);
  const value = Number(digits || 0);
  const choose = (digit: string) => { if (readOnly) return; const next = digit === "←" ? digits.slice(0, -1) : digits.length < 4 ? `${digits}${digit}` : digits; setDigits(next); if (next) onResultChange?.(Number(next) === expected, next); else onResultChange?.(null); };
  return <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-indigo-700/20 to-violet-700/35" /><div className="relative"><header className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 6</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{subtract ? "Odejmowanie pisemne" : "Dodawanie pisemne"}</h3><p className="mt-2 text-cyan-50">Ustaw liczby w kolumnach, policz w zeszycie i wpisz wynik klawiaturą.</p></div>{questionNumber && questionCount ? <b className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm text-slate-950">Zadanie {questionNumber}/{questionCount}</b> : null}</header><div className="mx-auto mt-7 max-w-sm rounded-3xl bg-white p-6 text-right font-mono text-5xl font-black leading-tight text-slate-950 shadow-xl sm:text-6xl"><div>{a}</div><div className="border-b-4 border-slate-900 pb-2">{subtract ? "−" : "+"} {b}</div><div className="pt-2 text-cyan-700">{digits || "?"}</div></div><div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3">{"123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly} onClick={() => choose(digit)} className="min-h-16 rounded-2xl bg-white text-2xl font-black text-slate-950 shadow disabled:opacity-50">{digit}</button>)}<button type="button" disabled={readOnly} onClick={() => choose("0")} className="min-h-16 rounded-2xl bg-white text-2xl font-black text-slate-950 shadow disabled:opacity-50">0</button><button type="button" disabled={readOnly} onClick={() => choose("←")} className="col-span-2 min-h-16 rounded-2xl bg-rose-300 text-xl font-black text-rose-950 disabled:opacity-50">← Usuń</button></div>{digits ? <p className="mt-5 text-center font-bold text-cyan-100">Wpisany wynik: {value}. Wyślij odpowiedź.</p> : null}</div></section>;
}
