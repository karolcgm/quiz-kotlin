"use client";

import { useEffect, useState } from "react";

interface Props { seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answer?: string) => void; }
type EstimateTask = { expression: string; options: number[]; answer: number };
const calculationTasks: EstimateTask[] = [
  { expression: "348 + 529", options: [800, 900, 1000], answer: 900 },
  { expression: "914 − 368", options: [400, 500, 600], answer: 500 },
  { expression: "31 × 29", options: [600, 900, 1200], answer: 900 },
  { expression: "1188 : 4", options: [200, 300, 400], answer: 300 },
  { expression: "765 + 148", options: [800, 900, 1000], answer: 900 },
];
const shopTasks = [
  { question: "Czy 10 zł starczy na cukierki i lizaka?", detail: "cukierki 7 zł + lizak 3 zł", answer: true },
  { question: "Czy za 20 zł kupisz chipsy, colę i gumę?", detail: "chipsy 9 zł + cola 8 zł + guma 4 zł", answer: false },
  { question: "Czy zapłacisz więcej niż 15 zł za sok i baton?", detail: "sok 8 zł + baton 9 zł", answer: true },
];
const storyTasks: EstimateTask[] = [
  { expression: "Autobus: 47 osób × 18 zł za bilet", options: [700, 800, 900], answer: 800 },
  { expression: "Biblioteka: 286 nowych książek + 421 książek", options: [600, 700, 800], answer: 700 },
  { expression: "Wycieczka: 612 zł − 187 zł wydatków", options: [300, 400, 500], answer: 400 },
];

function select<T>(items: T[], seed: number) { return items[Math.abs(seed) % items.length]!; }
function Header({ title, number, count, children }: { title: string; number?: number; count?: number; children: React.ReactNode }) { return <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><div className="absolute inset-0 bg-gradient-to-br from-amber-500/35 via-orange-600/20 to-fuchsia-700/30" /><div className="relative"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-amber-200">LICZBY I DZIAŁANIA · TEMAT 5</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3></div>{number && count ? <b className="rounded-2xl bg-amber-300 px-4 py-2 text-sm text-slate-950">Zadanie {number}/{count}</b> : null}</div>{children}</div></section>; }

export function EstimationLessonModel({ seed, taskSeed = seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const station = ((Math.abs(seed) - 1) % 3) + 1;
  const [answer, setAnswer] = useState<string | null>(null);
  useEffect(() => { onResultChange?.(null); }, [taskSeed, onResultChange]);
  const report = (correct: boolean, value: string) => { setAnswer(value); onResultChange?.(correct, value); };
  if (station === 2) {
    const task = select(shopTasks, taskSeed);
    return <Header title="Sklep na rogu" number={questionNumber} count={questionCount}><p className="mt-3 text-lg text-amber-50">🛒 <b>Sklep spożywczy</b> · {task.detail}</p><p className="mt-8 text-2xl font-black sm:text-4xl">{task.question}</p><div className="mt-7 grid grid-cols-2 gap-4"><button disabled={readOnly} onClick={() => report(task.answer, "Tak")} className="min-h-20 rounded-2xl bg-emerald-400 text-2xl font-black text-emerald-950 disabled:opacity-50">TAK</button><button disabled={readOnly} onClick={() => report(!task.answer, "Nie")} className="min-h-20 rounded-2xl bg-rose-400 text-2xl font-black text-rose-950 disabled:opacity-50">NIE</button></div>{answer ? <p className="mt-4 text-center font-bold text-amber-100">Odpowiedź wybrana — wyślij ją.</p> : null}</Header>;
  }
  const task = station === 1 ? select(calculationTasks, taskSeed) : select(storyTasks, taskSeed);
  return <Header title={station === 1 ? "Najpierw oszacuj" : "Szacunek w zadaniu"} number={questionNumber} count={questionCount}><p className="mt-5 text-sm font-bold text-amber-100">Zaokrąglij liczby do pełnych setek. Nie licz dokładnego wyniku.</p><p className="mt-7 text-center text-4xl font-black sm:text-6xl">{task.expression} ≈ ?</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{task.options.map((option) => <button key={option} disabled={readOnly} onClick={() => report(option === task.answer, `${option}`)} className="min-h-20 rounded-2xl bg-white text-3xl font-black text-slate-950 shadow-lg disabled:opacity-50">{option}</button>)}</div>{answer ? <p className="mt-4 text-center font-bold text-amber-100">Odpowiedź wybrana — wyślij ją.</p> : null}</Header>;
}
