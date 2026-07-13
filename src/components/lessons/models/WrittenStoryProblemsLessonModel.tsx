"use client";

import { useState } from "react";

const PROBLEMS = [
  { title: "Zadanie tekstowe — dodawanie pisemne", text: "W swojej ulubionej grze zdobyłeś 286 punktów, a za kolejne wyzwanie otrzymałeś jeszcze 137 punktów. Ile punktów masz razem?", a: 286, b: 137, operation: "+" as const, answer: "423", answerPrefix: "Masz razem ", answerSuffix: " punktów.", graphic: "🎮" },
  { title: "Zadanie tekstowe — odejmowanie pisemne", text: "W sali stały 624 krzesła. 185 krzeseł przeniesiono do innej sali. Ile krzeseł zostało w tej sali?", a: 624, b: 185, operation: "−" as const, answer: "439", answerPrefix: "W sali zostało ", answerSuffix: " krzeseł.", graphic: "🪑" },
] as const;

function digitAt(value: number, column: number, columns: number) { return String(value).padStart(columns, " ")[column]!.trim(); }

function WrittenAnswerGrid({ a, b, operation, readOnly }: { a: number; b: number; operation: "+" | "−"; readOnly: boolean }) {
  const expected = operation === "+" ? a + b : a - b;
  const columns = Math.max(String(a).length, String(b).length, String(expected).length);
  const [resultDigits, setResultDigits] = useState<string[]>(Array(columns).fill(""));
  const [carries, setCarries] = useState<string[]>(Array(columns).fill(""));
  const [active, setActive] = useState<{ row: "carry" | "result"; column: number } | null>(null);
  const change = (digit: string) => {
    if (readOnly || !active) return;
    const setter = active.row === "result" ? setResultDigits : setCarries;
    setter((current) => current.map((value, index) => index === active.column
      ? digit === "←" ? value.slice(0, -1) : active.row === "carry" && operation === "−" ? `${value}${digit}`.slice(-2) : digit
      : value));
    if (digit !== "←" && active.column > 0) setActive({ ...active, column: active.column - 1 });
  };
  const cell = (row: "carry" | "result", column: number, small = false) => `grid place-items-center rounded-lg border-2 font-mono font-black ${small ? "h-9 w-9 text-lg" : "h-14 w-14 text-3xl"} ${active?.row === row && active.column === column ? "border-cyan-500 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50" : "border-slate-300 bg-white text-slate-950"}`;
  return <div className="mt-5 overflow-x-auto rounded-2xl bg-slate-100 p-4 text-slate-950"><div className="mx-auto grid w-fit items-center gap-2" style={{ gridTemplateColumns: `2rem 2rem repeat(${columns}, 3.5rem)` }}><span /><span />{Array.from({ length: columns }, (_, column) => <button type="button" key={`carry-${column}`} aria-label={`Przeniesienie, kolumna ${column + 1}`} disabled={readOnly} onClick={() => setActive({ row: "carry", column })} className={cell("carry", column, true)}>{carries[column]}</button>)}<span /><span />{Array.from({ length: columns }, (_, column) => <span key={`a-${column}`} className="grid h-14 w-14 place-items-center font-mono text-3xl font-black">{digitAt(a, column, columns)}</span>)}<span /><span className="text-center text-3xl font-black">{operation}</span>{Array.from({ length: columns }, (_, column) => <span key={`b-${column}`} className="grid h-14 w-14 place-items-center font-mono text-3xl font-black">{digitAt(b, column, columns)}</span>)}<span /><span /><span className="col-span-full border-b-4 border-slate-900" /><span /><span />{Array.from({ length: columns }, (_, column) => <button type="button" key={`result-${column}`} aria-label={`Wynik, kolumna ${column + 1}`} disabled={readOnly} onClick={() => setActive({ row: "result", column })} className={cell("result", column)}>{resultDigits[column]}</button>)}</div><p className="mt-3 text-center text-sm font-bold text-slate-700">Kliknij kratkę przeniesienia lub wyniku, a potem wybierz cyfrę.</p><div className="mx-auto mt-3 grid max-w-xs grid-cols-3 gap-2">{"123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly} onClick={() => change(digit)} className="min-h-12 rounded-xl bg-slate-900 text-xl font-black text-white">{digit}</button>)}<button type="button" disabled={readOnly} onClick={() => change("0")} className="min-h-12 rounded-xl bg-slate-900 text-xl font-black text-white">0</button><button type="button" disabled={readOnly} onClick={() => change("←")} className="col-span-2 min-h-12 rounded-xl bg-rose-300 font-black text-rose-950">← Usuń cyfrę</button></div></div>;
}

export function WrittenStoryProblemsLessonModel({ readOnly = false, seed = 1 }: { readOnly?: boolean; seed?: number }) {
  const problem = PROBLEMS[Math.abs(seed - 1) % PROBLEMS.length]!;
  return <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 6</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{problem.title}</h3><p className="mt-3 text-cyan-50">{problem.graphic} Najpierw zapisz działanie w kratkach, potem uzupełnij przeniesienia i wynik.</p><article className="mt-6 rounded-2xl bg-white/10 p-4"><div className="flex items-start gap-4"><span className="text-5xl" aria-hidden>{problem.graphic}</span><p className="font-bold leading-relaxed">{problem.text}</p></div><WrittenAnswerGrid a={problem.a} b={problem.b} operation={problem.operation} readOnly={readOnly} /><p className="mt-4 text-center font-semibold text-cyan-100">Dokończ zdanie: „{problem.answerPrefix}…{problem.answerSuffix}”</p></article></section>;
}
