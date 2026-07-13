"use client";

import { useState } from "react";

const PROBLEMS = [
  { text: "W bibliotece było 248 książek. Dokupiono 137 książek. Ile książek jest teraz?", answer: "385" },
  { text: "Na placu było 624 krzeseł. 185 krzeseł przeniesiono. Ile krzeseł zostało?", answer: "439" },
] as const;

export function WrittenStoryProblemsLessonModel({ readOnly = false }: { readOnly?: boolean }) {
  const [answers, setAnswers] = useState(["", ""]); const [active, setActive] = useState(0);
  const change = (digit: string) => { if (!readOnly) setAnswers((current) => current.map((answer, index) => index === active ? (digit === "←" ? answer.slice(0, -1) : `${answer}${digit}`.slice(0, 4)) : answer)); };
  return <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 6</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">Zadania tekstowe</h3><div className="mt-6 space-y-4">{PROBLEMS.map((problem, index) => <article key={problem.answer} className="rounded-2xl bg-white/10 p-4"><p className="font-bold">{index + 1}. {problem.text}</p><p className="mt-3">{index === 0 ? "Odpowiedź: Razem jest " : "Odpowiedź: Zostało "}<button type="button" disabled={readOnly} onClick={() => setActive(index)} className={`mx-2 min-w-28 rounded-lg border-2 bg-white px-3 py-2 text-2xl font-black text-slate-950 ${active === index ? "border-cyan-400" : "border-slate-300"}`}>{answers[index] || "□ □ □"}</button>{index === 0 ? " książek." : " krzeseł."}</p></article>)}</div><div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">{"123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly} onClick={() => change(digit)} className="min-h-12 rounded-xl bg-white text-xl font-black text-slate-950">{digit}</button>)}<button type="button" disabled={readOnly} onClick={() => change("0")} className="min-h-12 rounded-xl bg-white text-xl font-black text-slate-950">0</button><button type="button" disabled={readOnly} onClick={() => change("←")} className="col-span-2 min-h-12 rounded-xl bg-rose-300 font-black text-rose-950">← Usuń</button></div></section>;
}
