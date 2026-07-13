"use client";

import { distinctIndex } from "@/lib/lessons/exampleSelection";

import { useEffect, useState } from "react";

interface Props { seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answer?: string) => void; }
type EstimateTask = { expression: string; options: Array<number | string>; answer: number | string; story?: boolean; title?: string; note?: string };
const calculationTasks: EstimateTask[] = [
  { expression: "348 + 529", options: [800, 900, 1000], answer: 900 },
  { expression: "914 − 368", options: [400, 500, 600], answer: 500 },
  { expression: "4 × 218", options: [700, 900, 1100], answer: 900 },
  { expression: "595 : 5", options: [100, 120, 140], answer: 120 },
  { expression: "642 − 287", options: [300, 400, 500], answer: 400 },
  { expression: "276 + 413", options: [600, 700, 800], answer: 700 },
  { expression: "803 − 247", options: [500, 600, 700], answer: 600 },
  { expression: "6 × 307", options: [1500, 1800, 2100], answer: 1800 },
];
const shopTasks = [
  { question: "Czy 10 zł wystarczy na cukierki i lizaka?", answer: true, products: [{ emoji: "🍬", name: "cukierki", price: "7 zł" }, { emoji: "🍭", name: "lizak", price: "3 zł" }] },
  { question: "Czy za 20 zł kupisz chipsy, colę i gumę?", answer: false, products: [{ emoji: "🍟", name: "chipsy", price: "9 zł" }, { emoji: "🥤", name: "cola", price: "8 zł" }, { emoji: "🫧", name: "guma", price: "4 zł" }] },
  { question: "Czy za sok i baton zapłacisz więcej niż 15 zł?", answer: true, products: [{ emoji: "🧃", name: "sok", price: "8 zł" }, { emoji: "🍫", name: "baton", price: "9 zł" }] },
  { question: "Komputer kosztuje 2650 zł, a drukarka 399 zł. Czy za komplet zapłacisz więcej niż 3000 zł?", answer: true, products: [{ emoji: "💻", name: "komputer", price: "2650 zł" }, { emoji: "🖨️", name: "drukarka", price: "399 zł" }] },
  { question: "Czy 15 zł wystarczy na sok, gumę i cukierki?", answer: true, products: [{ emoji: "🧃", name: "sok", price: "5 zł" }, { emoji: "🫧", name: "guma", price: "4 zł" }, { emoji: "🍬", name: "cukierki", price: "3 zł" }] },
  { question: "Czy za dwa batony i colę zapłacisz mniej niż 25 zł?", answer: true, products: [{ emoji: "🍫", name: "baton × 2", price: "12 zł" }, { emoji: "🥤", name: "cola", price: "8 zł" }] },
];
const storyTasks: EstimateTask[] = [
  { expression: "Otrzymałeś 612 zł na wycieczkę klasową. Wydałeś 187 zł. Ile mniej więcej pieniędzy Ci zostało?", options: [300, 400, 500], answer: 400, story: true, title: "Wycieczka klasowa", note: "Zaokrąglij kwoty do pełnych setek." },
  { expression: "Na wycieczkę pojechało 48 uczniów. Bilet dla jednej osoby kosztował 19 zł. Ile mniej więcej zapłacono za wszystkie bilety?", options: [800, 1000, 1200], answer: 1000, story: true, title: "Wycieczka klasowa", note: "Zaokrąglij liczbę uczniów i cenę biletu." },
  { expression: "Podczas wycieczki klasa miała 286 zł na pamiątki. Wydano 121 zł. Ile mniej więcej pieniędzy zostało?", options: [100, 200, 300], answer: 200, story: true, title: "Wycieczka klasowa", note: "Zaokrąglij obie kwoty i oszacuj różnicę." },
  { expression: "Na wycieczkę kupiono 6 kartonów wody po 48 zł. Ile mniej więcej zapłacono za wodę?", options: [200, 300, 400], answer: 300, story: true, title: "Wycieczka klasowa", note: "Zaokrąglij cenę jednego kartonu i pomnóż przez 6." },
  { expression: "Klasa miała 950 zł na wycieczkę i wydała 378 zł na bilety. Ile mniej więcej pieniędzy zostało?", options: [500, 600, 700], answer: 600, story: true, title: "Wycieczka klasowa", note: "Zaokrąglij kwoty do pełnych setek." },
];
function Header({ title, number, count, children }: { title: string; number?: number; count?: number; children: React.ReactNode }) { return <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><div className="absolute inset-0 bg-gradient-to-br from-amber-500/35 via-orange-600/20 to-fuchsia-700/30" /><div className="relative"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-amber-200">LICZBY I DZIAŁANIA · TEMAT 5</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3></div>{number && count ? <b className="rounded-2xl bg-amber-300 px-4 py-2 text-sm text-slate-950">Zadanie {number}/{count}</b> : null}</div>{children}</div></section>; }

export function EstimationLessonModel({ seed, taskSeed = seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const station = ((Math.abs(seed) - 1) % 3) + 1;
  const [answer, setAnswer] = useState<string | null>(null);
  useEffect(() => { onResultChange?.(null); }, [taskSeed, onResultChange]);
  const report = (correct: boolean, value: string) => { setAnswer(value); onResultChange?.(correct, value); };
  if (station === 2) {
    const task = shopTasks[distinctIndex(seed, questionNumber, shopTasks.length)]!;
    return <Header title="Sklep na rogu" number={questionNumber} count={questionCount}><p className="mt-3 text-lg text-amber-50">🛒 <b>Sklep spożywczy</b></p><div className="mt-5 grid gap-3 sm:grid-cols-3">{task.products.map((product) => <div key={product.name} className="rounded-2xl bg-white/95 p-3 text-center text-slate-950 shadow-lg"><div className="text-5xl" aria-hidden>{product.emoji}</div><p className="mt-1 font-black">{product.name}</p><p className="text-sm font-bold text-amber-700">{product.price}</p></div>)}</div><p className="mt-8 text-2xl font-black sm:text-4xl">{task.question}</p><div className="mt-7 grid grid-cols-2 gap-4"><button disabled={readOnly} onClick={() => report(task.answer, "Tak")} className="min-h-20 rounded-2xl bg-emerald-400 text-2xl font-black text-emerald-950 disabled:opacity-50">TAK</button><button disabled={readOnly} onClick={() => report(!task.answer, "Nie")} className="min-h-20 rounded-2xl bg-rose-400 text-2xl font-black text-rose-950 disabled:opacity-50">NIE</button></div>{answer ? <p className="mt-4 text-center font-bold text-amber-100">Odpowiedź wybrana — wyślij ją.</p> : null}</Header>;
  }
  // The question seed is randomized independently for every question. Use the
  // stage seed for the permutation so the question number always advances to a
  // new item instead of occasionally landing on a duplicate.
  const task = station === 1
    ? calculationTasks[distinctIndex(seed, questionNumber, calculationTasks.length)]!
    : storyTasks[distinctIndex(seed, questionNumber, storyTasks.length)]!;
  return <Header title={station === 1 ? "Najpierw oszacuj" : "Wycieczka klasowa"} number={questionNumber} count={questionCount}><p className="mt-5 text-sm font-bold text-amber-100">{task.note ?? "Zaokrąglij liczby do pełnych setek. Nie licz dokładnego wyniku."}</p><p className={`${task.story ? "mt-7 rounded-2xl bg-white/10 p-5 text-xl leading-relaxed" : "mt-7 text-center text-4xl font-black sm:text-6xl"}`}>{task.expression}{task.story ? "" : " ≈ ?"}</p><div className={`mt-7 grid gap-3 ${task.options.length === 2 ? "grid-cols-2" : "sm:grid-cols-3"}`}>{task.options.map((option) => <button key={option} disabled={readOnly} onClick={() => report(option === task.answer, `${option}`)} className="min-h-20 rounded-2xl bg-white text-3xl font-black text-slate-950 shadow-lg disabled:opacity-50">{option}</button>)}</div>{answer ? <p className="mt-4 text-center font-bold text-amber-100">Odpowiedź wybrana — wyślij ją.</p> : null}</Header>;
}
