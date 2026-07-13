"use client";

import { useEffect, useMemo, useState } from "react";
import { distinctIndex } from "@/lib/lessons/exampleSelection";

interface Props { seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answer?: string) => void; }
const additions = [[468, 357], [782, 149], [596, 278], [834, 167], [429, 386], [675, 248], [907, 186], [543, 279], [728, 164], [856, 237]] as const;
const subtractions = [[802, 457], [900, 368], [741, 286], [650, 179], [1000, 546], [934, 287], [815, 396], [702, 184], [963, 478], [880, 265]] as const;
type ActiveCell = { row:"carry"|"result"; column:number } | null;

function digitAt(value:number, column:number, columns:number) { return String(value).padStart(columns, " ")[column]!.trim(); }
export function writtenOperationColumnCount(a:number, b:number, result:number) { return Math.max(String(a).length, String(b).length, String(result).length); }

export function WrittenAddSubLessonModel({ seed, taskSeed = seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const subtract = ((Math.abs(seed) - 1) % 2) === 1;
  const pool = subtract ? subtractions : additions;
  // `taskSeed` is randomized per question by the session builder. The stage
  // seed is stable, so use it to permute the pool and let the ordinal advance
  // through every example exactly once.
  const selectionSeed = questionNumber === undefined ? taskSeed : seed;
  const [a, b] = useMemo(() => pool[distinctIndex(selectionSeed, questionNumber, pool.length)]!, [pool, selectionSeed, questionNumber]);
  const expected = subtract ? a - b : a + b; const columns = writtenOperationColumnCount(a, b, expected);
  const [resultDigits, setResultDigits] = useState<string[]>(Array(columns).fill("")); const [carries, setCarries] = useState<string[]>(Array(columns).fill("")); const [active, setActive] = useState<ActiveCell>(null);
  useEffect(() => { setResultDigits(Array(columns).fill("")); setCarries(Array(columns).fill("")); setActive(null); onResultChange?.(null); }, [taskSeed, columns, onResultChange]);
  const answer = resultDigits.join("");
  const change = (digit:string) => {
    if (readOnly || !active) return;
    const set = active.row === "result" ? setResultDigits : setCarries;
    set(current => { const next=[...current]; const currentValue = next[active.column] ?? ""; next[active.column] = digit === "←" ? currentValue.slice(0, -1) : active.row === "carry" && subtract ? `${currentValue}${digit}`.slice(-2) : digit; if(active.row === "result") { const value=next.join(""); onResultChange?.(value ? Number(value) === expected : null, value || undefined); } return next; });
    if (digit !== "←" && (active.row === "result" || !subtract) && active.column > 0) setActive({ ...active, column: active.column - 1 });
  };
  const cellClass = (row:"carry"|"result", column:number, small=false) => `grid place-items-center rounded-lg border-2 font-mono font-black transition ${small?"h-9 w-9 text-lg sm:h-11 sm:w-11 sm:text-xl":"h-14 w-14 text-3xl sm:h-16 sm:w-16 sm:text-4xl"} ${active?.row===row&&active.column===column?"border-cyan-400 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50":"border-slate-300 bg-white text-slate-950"}`;
  return <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-indigo-700/20 to-violet-700/35"/><div className="relative"><header className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 6</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{subtract ? "Odejmowanie pisemne" : "Dodawanie pisemne"}</h3><p className="mt-2 text-cyan-50">Uzupełnij przeniesienia w małych kratkach, a wynik wpisz cyfra po cyfrze w dolnych kratkach.</p></div>{questionNumber && questionCount ? <b className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm text-slate-950">Zadanie {questionNumber}/{questionCount}</b> : null}</header>
    <div className="mx-auto mt-7 w-fit rounded-3xl bg-slate-100 p-4 shadow-xl sm:p-6"><div className="grid items-center gap-2" style={{gridTemplateColumns:`2rem 2rem repeat(${columns}, minmax(0, 1fr))`}}><span/><span/>{Array.from({length:columns},(_,column)=><button type="button" key={`carry-${column}`} aria-label={`Przeniesienie, kolumna ${column + 1}`} disabled={readOnly} onClick={()=>setActive({row:"carry",column})} className={`${cellClass("carry",column,true)} justify-self-center`}>{carries[column]}</button>)}<span/><span/>{Array.from({length:columns},(_,column)=><span key={`a-${column}`} className="grid h-14 w-14 place-items-center font-mono text-3xl font-black text-slate-950 sm:h-16 sm:w-16 sm:text-4xl">{digitAt(a,column,columns)}</span>)}<span/><span className="text-center text-3xl font-black text-slate-950">{subtract?"−":"+"}</span>{Array.from({length:columns},(_,column)=><span key={`b-${column}`} className="grid h-14 w-14 place-items-center font-mono text-3xl font-black text-slate-950 sm:h-16 sm:w-16 sm:text-4xl">{digitAt(b,column,columns)}</span>)}<span/><span/><span className="col-span-full mt-1 border-b-4 border-slate-900"/><span/><span/>{Array.from({length:columns},(_,column)=><button type="button" key={`result-${column}`} aria-label={`Wynik, kolumna ${column + 1}`} disabled={readOnly} onClick={()=>setActive({row:"result",column})} className={cellClass("result",column)}>{resultDigits[column]}</button>)}</div></div>
    {active ? <div className="mx-auto mt-6 max-w-sm"><p className="mb-3 text-center text-sm font-bold text-cyan-100">Wybrana kratka: {active.row === "carry" ? "przeniesienie" : "wynik"}. Wybierz cyfrę.</p><div className="grid grid-cols-3 gap-3">{"123456789".split("").map(digit=><button type="button" key={digit} disabled={readOnly} onClick={()=>change(digit)} className="min-h-14 rounded-2xl bg-white text-2xl font-black text-slate-950 shadow disabled:opacity-50">{digit}</button>)}<button type="button" disabled={readOnly} onClick={()=>change("0")} className="min-h-14 rounded-2xl bg-white text-2xl font-black text-slate-950 shadow disabled:opacity-50">0</button><button type="button" disabled={readOnly} onClick={()=>change("←")} className="col-span-2 min-h-14 rounded-2xl bg-rose-300 text-xl font-black text-rose-950 disabled:opacity-50">← Usuń cyfrę</button></div></div> : <p className="mt-6 text-center font-bold text-cyan-100">Kliknij kratkę wyniku, aby otworzyć klawiaturę.</p>}
    {answer ? <p className="mt-5 text-center font-bold text-cyan-100">Wpisany wynik: {answer}. Wyślij odpowiedź.</p> : null}</div></section>;
}
