"use client";

import { distinctIndex } from "@/lib/lessons/exampleSelection";

import { useEffect, useState } from "react";

interface Props { seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answer?: string) => void; }
type EstimateTask = { expression: string; options: number[]; answer: number; story?: boolean };
const calculationTasks: EstimateTask[] = [
  { expression: "348 + 529", options: [800, 900, 1000], answer: 900 },
  { expression: "914 − 368", options: [400, 500, 600], answer: 500 },
  { expression: "31 × 29", options: [600, 900, 1200], answer: 900 },
  { expression: "1188 : 4", options: [200, 300, 400], answer: 300 },
  { expression: "642 − 287", options: [300, 400, 500], answer: 400 },
];
const shopTasks = [
  { question: "Czy 10 zł wystarczy na cukierki i lizaka?", answer: true, products: [{ emoji: "🍬", name: "cukierki", price: "7 zł" }, { emoji: "🍭", name: "lizak", price: "3 zł" }] },
  { question: "Czy za 20 zł kupisz chipsy, colę i gumę?", answer: false, products: [{ emoji: "🍟", name: "chipsy", price: "9 zł" }, { emoji: "🥤", name: "cola", price: "8 zł" }, { emoji: "🫧", name: "guma", price: "4 zł" }] },
  { question: "Czy zapłacisz więcej niż 15 zł za sok i baton?", answer: true, products: [{ emoji: "🧃", name: "sok", price: "8 zł" }, { emoji: "🍫", name: "baton", price: "9 zł" }] },
];
const storyTasks: EstimateTask[] = [
  { expression: "W autobusie jadą 47 osoby. Bilet kosztuje 18 zł. Ile mniej więcej kosztują wszystkie bilety?", options: [700, 800, 900], answer: 800, story: true },
  { expression: "W bibliotece jest 286 książek. Zakupiono 421 książek. Ile mniej więcej książek jest teraz w bibliotece?", options: [600, 700, 800], answer: 700, story: true },
  { expression: "Na wycieczkę przeznaczono 612 zł. Wydano 187 zł. Ile mniej więcej pieniędzy zostało?", options: [300, 400, 500], answer: 400, story: true },
];
function Header({ title, number, count, children }: { title: string; number?: number; count?: number; children: React.ReactNode }) { return <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><div className="absolute inset-0 bg-gradient-to-br from-amber-500/35 via-orange-600/20 to-fuchsia-700/30" /><div className="relative"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-amber-200">LICZBY I DZIAŁANIA · TEMAT 5</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3></div>{number && count ? <b className="rounded-2xl bg-amber-300 px-4 py-2 text-sm text-slate-950">Zadanie {number}/{count}</b> : null}</div>{children}</div></section>; }

export function EstimationLessonModel({ seed, taskSeed = seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const station = ((Math.abs(seed) - 1) % 3) + 1;
  const [answer, setAnswer] = useState<string | null>(null);
  useEffect(() => { onResultChange?.(null); }, [taskSeed, onResultChange]);
  const report = (correct: boolean, value: string) => { setAnswer(value); onResultChange?.(correct, value); };
  if (station === 2) {
    const task = shopTasks[distinctIndex(taskSeed, questionNumber, shopTasks.length)]!;
    return <Header title="Sklep na rogu" number={questionNumber} count={questionCount}><p className="mt-3 text-lg text-amber-50">🛒 <b>Sklep spożywczy</b></p><div className="mt-5 grid gap-3 sm:grid-cols-3">{task.products.map((product) => <div key={product.name} className="rounded-2xl bg-white/95 p-3 text-center text-slate-950 shadow-lg"><div className="text-5xl" aria-hidden>{product.emoji}</div><p className="mt-1 font-black">{product.name}</p><p className="text-sm font-bold text-amber-700">{product.price}</p></div>)}</div><p className="mt-8 text-2xl font-black sm:text-4xl">{task.question}</p><div className="mt-7 grid grid-cols-2 gap-4"><button disabled={readOnly} onClick={() => report(task.answer, "Tak")} className="min-h-20 rounded-2xl bg-emerald-400 text-2xl font-black text-emerald-950 disabled:opacity-50">TAK</button><button disabled={readOnly} onClick={() => report(!task.answer, "Nie")} className="min-h-20 rounded-2xl bg-rose-400 text-2xl font-black text-rose-950 disabled:opacity-50">NIE</button></div>{answer ? <p className="mt-4 text-center font-bold text-amber-100">Odpowiedź wybrana — wyślij ją.</p> : null}</Header>;
  }
  const task = station === 1 ? calculationTasks[distinctIndex(taskSeed, questionNumber, calculationTasks.length)]! : storyTasks[distinctIndex(taskSeed, questionNumber, storyTasks.length)]!;
  return <Header title={station === 1 ? "Najpierw oszacuj" : "Szacunek w zadaniu"} number={questionNumber} count={questionCount}><p className="mt-5 text-sm font-bold text-amber-100">Zaokrąglij liczby do pełnych setek. Nie licz dokładnego wyniku.</p><p className={`${task.story ? "mt-7 rounded-2xl bg-white/10 p-5 text-xl leading-relaxed" : "mt-7 text-center text-4xl font-black sm:text-6xl"}`}>{task.expression}{task.story ? "" : " ≈ ?"}</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{task.options.map((option) => <button key={option} disabled={readOnly} onClick={() => report(option === task.answer, `${option}`)} className="min-h-20 rounded-2xl bg-white text-3xl font-black text-slate-950 shadow-lg disabled:opacity-50">{option}</button>)}</div>{answer ? <p className="mt-4 text-center font-bold text-amber-100">Odpowiedź wybrana — wyślij ją.</p> : null}</Header>;
}
