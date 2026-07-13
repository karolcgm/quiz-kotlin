"use client";

import { useState } from "react";

const EXAMPLES = [{ a: 4827, b: 36 }, { a: 12040, b: 25 }] as const;

function WrittenExample({ a, b, readOnly }: { a: number; b: number; readOnly: boolean }) {
  const expected = [a * (b % 10), a * Math.floor(b / 10) * 10, a * b]; const [values, setValues] = useState(["", "", ""]); const [active, setActive] = useState(0);
  const change = (digit: string) => !readOnly && setValues((current) => current.map((value, index) => index === active ? (digit === "←" ? value.slice(0, -1) : `${value}${digit}`.slice(0, 7)) : value));
  return <article className="rounded-3xl bg-slate-100 p-4 font-mono text-slate-950"><div className="grid grid-cols-[2rem_repeat(7,2.5rem)] items-center gap-1 text-2xl font-black"><span /><span className="col-span-7 text-right">{a}</span><span>×</span><span className="col-span-7 text-right">{b}</span><span className="col-span-8 border-b-4 border-slate-950" />{["Jedności", "Dziesiątki", "Wynik"].map((label, index) => <><span key={`${label}-label`} className="text-[10px] font-sans font-bold">{label}</span><button key={label} type="button" disabled={readOnly} onClick={() => setActive(index)} className={`col-span-7 min-h-10 rounded-lg border-2 px-2 text-right ${active === index ? "border-cyan-500 bg-cyan-100" : "border-slate-300 bg-white"}`}>{values[index] || "□"}</button></>)}</div><div className="mt-4 grid grid-cols-3 gap-1">{"123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly} onClick={() => change(digit)} className="min-h-9 rounded-lg bg-slate-900 font-sans text-white">{digit}</button>)}<button type="button" disabled={readOnly} onClick={() => change("0")} className="min-h-9 rounded-lg bg-slate-900 font-sans text-white">0</button><button type="button" disabled={readOnly} onClick={() => change("←")} className="col-span-2 min-h-9 rounded-lg bg-rose-300 font-sans font-bold text-rose-950">← Usuń</button></div>{values.every(Boolean) ? <p className="mt-3 font-sans text-sm font-bold">{values.every((value, index) => Number(value) === expected[index]) ? "Wszystkie piętra są poprawne." : "Sprawdź jeszcze iloczyny częściowe."}</p> : null}</article>;
}

export function WrittenMultiplicationLessonModel({ readOnly = false }: { seed: number; readOnly?: boolean }) {
  return <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · MNOŻENIE PISEMNE</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">Mnożenie piętrami</h3><p className="mt-2 text-slate-200">Uzupełnij oba przykłady: iloczyn jedności, iloczyn dziesiątek i wynik końcowy.</p><div className="mt-6 grid gap-5 lg:grid-cols-2">{EXAMPLES.map((example) => <WrittenExample key={example.a} {...example} readOnly={readOnly} />)}</div></section>;
}
