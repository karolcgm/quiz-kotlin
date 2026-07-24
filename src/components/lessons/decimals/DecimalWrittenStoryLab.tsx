"use client";

import { useMemo, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_WRITTEN_STORY_ACTIVITY = "decimal-written-story" as const;
export type DecimalWrittenStoryActivity = typeof DECIMAL_WRITTEN_STORY_ACTIVITY;
type Operation = "+" | "−" | "·" | ":";
type StoryTask = { operation: Operation; left: string; right: string; result: string; unit: string; title: string; story: string; question: string };
const TASKS: readonly StoryTask[] = [
  { operation: "+", left: "18,75", right: "26,48", result: "45,23", unit: "m", title: "Taśmy do dekoracji", story: "Do przygotowania dekoracji sali wykorzystano 18,75 m granatowej taśmy i 26,48 m srebrnej taśmy.", question: "Ile metrów taśmy wykorzystano łącznie?" },
  { operation: "−", left: "48,6", right: "17,85", result: "30,75", unit: "l", title: "Woda w zbiorniku", story: "W zbiorniku było 48,6 l wody. Do podlewania roślin zużyto 17,85 l.", question: "Ile litrów wody zostało w zbiorniku?" },
  { operation: "·", left: "2,75", right: "8", result: "22", unit: "kg", title: "Paczki z karmą", story: "Do schroniska przygotowano 8 jednakowych paczek karmy. Każda paczka waży 2,75 kg.", question: "Ile kilogramów karmy przygotowano?" },
  { operation: ":", left: "13,5", right: "0,75", result: "18", unit: "porcji", title: "Porcje koktajlu", story: "Przygotowano 13,5 l koktajlu. Jedna porcja ma pojemność 0,75 l.", question: "Ile pełnych porcji można przygotować?" },
];
type ActiveField = "left" | "right" | "result";
export function isDecimalWrittenStoryActivity(activity: string): activity is DecimalWrittenStoryActivity { return activity === DECIMAL_WRITTEN_STORY_ACTIVITY; }
export interface DecimalWrittenStoryLabProps { activity: DecimalWrittenStoryActivity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }

export function DecimalWrittenStoryLab({ seed, taskSeed, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalWrittenStoryLabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => TASKS[effectiveSeed % TASKS.length]!, [effectiveSeed]);
  const [left, setLeft] = useState(readOnly ? task.left : ""); const [right, setRight] = useState(readOnly ? task.right : ""); const [result, setResult] = useState(readOnly ? task.result : ""); const [operation, setOperation] = useState<Operation | "">(readOnly ? task.operation : ""); const [active, setActive] = useState<ActiveField>("left"); const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const clear = () => { setStatus(null); onResultChange?.(null); };
  const change = (key: string) => { if (readOnly) return; const edit = (value: string) => key === "backspace" ? value.slice(0, -1) : key === "," && value.includes(",") ? value : value.length < 8 ? `${value}${key}` : value; if (active === "left") setLeft(edit); if (active === "right") setRight(edit); if (active === "result") setResult(edit); clear(); };
  const check = () => { const normalize = (value: string) => value.trim().replace(".", ","); const correct = Boolean(left && right && result && operation) && normalize(left) === task.left && normalize(right) === task.right && operation === task.operation && normalize(result) === task.result; setStatus(correct ? "correct" : "wrong"); onResultChange?.(correct, correct ? `${left} ${operation} ${right} = ${result} ${task.unit}` : "nieuzupełnione działanie"); };
  const field = (id: ActiveField, value: string, label: string) => <button type="button" disabled={readOnly} onClick={() => setActive(id)} aria-label={label} className={`grid min-h-14 min-w-24 place-items-center rounded-xl border-2 bg-white px-3 font-mono text-2xl font-black text-slate-950 ${active === id ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`}>{value}</button>;
  return <LessonTaskFrame eyebrow="Dział 1 · Rachunki" heading="Zadania tekstowe" description="Samodzielnie odczytaj liczby z treści, wybierz działanie i wpisz cały zapis w pustych kratkach." questionNumber={questionNumber} questionCount={questionCount} data-decimal-written-story data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined} contentClassName="space-y-5">
    <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">{task.title}</p><p className="mt-2 text-lg font-bold leading-relaxed text-emerald-950">{task.story}</p><p className="mt-3 text-lg font-black text-emerald-950">{task.question}</p></section>
    <section className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5"><h3 className="text-center text-xl font-black text-indigo-950">Zapisz działanie</h3><div className="flex flex-wrap items-center justify-center gap-3">{field("left", left, "Pierwsza liczba działania")}<span className="grid min-h-14 min-w-16 place-items-center rounded-xl border-2 border-indigo-300 bg-white px-3 text-3xl font-black text-indigo-950">{operation}</span>{field("right", right, "Druga liczba działania")}<span className="text-3xl font-black">=</span>{field("result", result, "Wynik działania")}</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Wybierz znak działania">{(["+", "−", "·", ":"] as const).map((symbol) => <LessonTaskChoice key={symbol} disabled={readOnly} selected={operation === symbol} onClick={() => { setOperation(symbol); clear(); }} className="min-h-12 text-2xl">{symbol}</LessonTaskChoice>)}</div><p className="rounded-xl bg-white p-3 text-center font-bold text-slate-700">Wykonaj obliczenia pisemne w zeszycie. Na ekranie wpisz samodzielnie liczby, znak i wynik.</p></section>
    {!readOnly ? <LessonNumericKeypad allowSeparator onKey={change} onConfirm={check} label="Kalkulator do zadania tekstowego" helperText="Kliknij pustą kratkę, wpisz liczbę z treści albo wynik. Na końcu zatwierdź całe rozwiązanie." /> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Samodzielnie wybrałeś działanie i poprawnie je obliczyłeś." : "Uzupełnij wszystkie kratki i sprawdź, czy liczby oraz znak wynikają z treści zadania."}</p> : null}
  </LessonTaskFrame>;
}
