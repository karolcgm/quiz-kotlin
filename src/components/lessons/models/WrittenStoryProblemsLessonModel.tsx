"use client";

import { useState } from "react";

const PROBLEMS = [
  { title: "Zadanie tekstowe — dodawanie pisemne", text: "W swojej ulubionej grze zdobyłeś 286 punktów, a za kolejne wyzwanie otrzymałeś jeszcze 137 punktów. Ile punktów masz razem?", answer: "423", answerPrefix: "Masz razem ", answerSuffix: " punktów." },
  { title: "Zadanie tekstowe — odejmowanie pisemne", text: "W sali stały 624 krzesła. 185 krzeseł przeniesiono do innej sali. Ile krzeseł zostało w tej sali?", answer: "439", answerPrefix: "W sali zostało ", answerSuffix: " krzeseł." },
] as const;

export function WrittenStoryProblemsLessonModel({ readOnly = false, seed = 1 }: { readOnly?: boolean; seed?: number }) {
  const problem = PROBLEMS[Math.abs(seed - 1) % PROBLEMS.length]!;
  const [answer, setAnswer] = useState("");
  const change = (digit: string) => { if (!readOnly) setAnswer((current) => digit === "←" ? current.slice(0, -1) : `${current}${digit}`.slice(0, 4)); };
  return <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 6</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{problem.title}</h3><p className="mt-3 text-cyan-50">Najpierw zapisz działanie w słupku, potem oblicz i wpisz odpowiedź.</p><article className="mt-6 rounded-2xl bg-white/10 p-4"><p className="font-bold">{problem.text}</p><p className="mt-4">Odpowiedź: {problem.answerPrefix}<button type="button" disabled={readOnly} className="mx-2 min-w-28 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-2xl font-black text-slate-950">{answer || "□ □ □"}</button>{problem.answerSuffix}</p></article><div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-2">{"123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly} onClick={() => change(digit)} className="min-h-12 rounded-xl bg-white text-xl font-black text-slate-950">{digit}</button>)}<button type="button" disabled={readOnly} onClick={() => change("0")} className="min-h-12 rounded-xl bg-white text-xl font-black text-slate-950">0</button><button type="button" disabled={readOnly} onClick={() => change("←")} className="col-span-2 min-h-12 rounded-xl bg-rose-300 font-black text-rose-950">← Usuń</button></div></section>;
}
