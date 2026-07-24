"use client";

import { useMemo, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_WRITTEN_STORY_ACTIVITY = "decimal-written-story" as const;
export type DecimalWrittenStoryActivity = typeof DECIMAL_WRITTEN_STORY_ACTIVITY;
type Operation = "+" | "−" | "·" | ":";
type FieldId = "left" | "right" | "result";
type ActiveField = { id: FieldId; index: number };
type StoryTask = { operation: Operation; left: string; right: string; result: string; unit: string; title: string; story: string; question: string };

const TASKS: readonly StoryTask[] = [
  { operation: "+", left: "18,75", right: "26,48", result: "45,23", unit: "m", title: "Taśmy do dekoracji", story: "Do przygotowania dekoracji sali wykorzystano 18,75 m granatowej taśmy i 26,48 m srebrnej taśmy.", question: "Ile metrów taśmy wykorzystano łącznie?" },
  { operation: "−", left: "48,6", right: "17,85", result: "30,75", unit: "l", title: "Woda w zbiorniku", story: "W zbiorniku było 48,6 l wody. Do podlewania roślin zużyto 17,85 l.", question: "Ile litrów wody zostało w zbiorniku?" },
  { operation: "·", left: "2,75", right: "8", result: "22", unit: "kg", title: "Paczki z karmą", story: "Do schroniska przygotowano 8 jednakowych paczek karmy. Każda paczka waży 2,75 kg.", question: "Ile kilogramów karmy przygotowano?" },
  { operation: ":", left: "13,5", right: "0,75", result: "18", unit: "porcji", title: "Porcje koktajlu", story: "Przygotowano 13,5 l koktajlu. Jedna porcja ma pojemność 0,75 l.", question: "Ile pełnych porcji można przygotować?" },
];

export function isDecimalWrittenStoryActivity(activity: string): activity is DecimalWrittenStoryActivity { return activity === DECIMAL_WRITTEN_STORY_ACTIVITY; }
export interface DecimalWrittenStoryLabProps { activity: DecimalWrittenStoryActivity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }

function digitCount(value: string) { return value.replace(",", "").length; }

export function DecimalWrittenStoryLab({ seed, taskSeed, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalWrittenStoryLabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => TASKS[effectiveSeed % TASKS.length]!, [effectiveSeed]);
  const [left, setLeft] = useState(readOnly ? task.left.replace(",", "") : "");
  const [right, setRight] = useState(readOnly ? task.right.replace(",", "") : "");
  const [result, setResult] = useState(readOnly ? task.result.replace(",", "") : "");
  const [operation, setOperation] = useState<Operation | "">(readOnly ? task.operation : "");
  const [active, setActive] = useState<ActiveField>({ id: "left", index: 0 });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const clear = () => { setStatus(null); onResultChange?.(null); };
  const expected = (id: FieldId) => id === "left" ? task.left.replace(",", "") : id === "right" ? task.right.replace(",", "") : task.result.replace(",", "");
  const current = (id: FieldId) => id === "left" ? left : id === "right" ? right : result;
  const assign = (id: FieldId, value: string) => { if (id === "left") setLeft(value); if (id === "right") setRight(value); if (id === "result") setResult(value); };
  const change = (key: string) => {
    if (readOnly || key === ",") return;
    const wanted = expected(active.id); const old = current(active.id); const value = key === "backspace" ? "" : key;
    const next = old.split(""); next[active.index] = value; assign(active.id, next.join(""));
    if (key !== "backspace") setActive({ id: active.id, index: Math.min(wanted.length - 1, active.index + 1) });
    clear();
  };
  const check = () => {
    const correct = Boolean(operation) && operation === task.operation && left === task.left.replace(",", "") && right === task.right.replace(",", "") && result === task.result.replace(",", "");
    setStatus(correct ? "correct" : "wrong"); onResultChange?.(correct, correct ? `${task.left} ${operation} ${task.right} = ${task.result} ${task.unit}` : "nieuzupełnione działanie");
  };
  const numberRow = (id: FieldId, label: string, value: string, target: string, commaAfter: number | null, prefix?: string) => <div className="flex min-h-12 items-center justify-end gap-1" aria-label={label}>{prefix ? <span className="mr-2 text-2xl">{prefix}</span> : null}{Array.from({ length: target.length }, (_, index) => <span key={index} className="relative">{commaAfter === index ? <i className="absolute -left-2 bottom-0 text-3xl not-italic" aria-hidden>,</i> : null}<button type="button" disabled={readOnly} onClick={() => setActive({ id, index })} className={`grid h-11 w-11 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black text-slate-950 ${active.id === id && active.index === index ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`} aria-label={`${label}, cyfra ${index + 1}`}>{value[index] ?? ""}</button></span>)}</div>;
  const leftComma = task.left.includes(",") ? task.left.indexOf(",") : null;
  const rightComma = task.right.includes(",") ? task.right.indexOf(",") : null;
  const resultComma = task.result.includes(",") ? task.result.indexOf(",") : null;
  return <LessonTaskFrame eyebrow="Dział 1 · Rachunki" heading="Zadania tekstowe" description="Odczytaj dane, wybierz działanie, a następnie wykonaj pełny zapis pisemny w kratkach." questionNumber={questionNumber} questionCount={questionCount} data-decimal-written-story data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined} contentClassName="space-y-5">
    <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5"><p className="text-xs font-black uppercase tracking-wide text-emerald-800">{task.title}</p><p className="mt-2 text-lg font-bold leading-relaxed text-emerald-950">{task.story}</p><p className="mt-3 text-lg font-black text-emerald-950">{task.question}</p></section>
    <section className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5"><h3 className="text-center text-xl font-black text-indigo-950">Wybierz działanie</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Wybierz znak działania">{(["+", "−", "·", ":"] as const).map((symbol) => <LessonTaskChoice key={symbol} disabled={readOnly} selected={operation === symbol} onClick={() => { setOperation(symbol); setActive({ id: "left", index: 0 }); clear(); }} className="min-h-12 text-2xl">{symbol}</LessonTaskChoice>)}</div></section>
    {operation ? <section className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5"><div><h3 className="text-center text-xl font-black text-amber-950">Zapis pisemny</h3><p className="mt-1 text-center font-bold text-amber-950">Kliknij kratkę, wpisz cyfrę z klawiatury i uzupełnij całe działanie.</p></div><input className="sr-only" readOnly inputMode="none" value="" tabIndex={-1} aria-hidden="true" /><div className="mx-auto w-fit rounded-xl border-2 border-amber-400 bg-white p-4 font-mono font-black text-slate-950"><div className="border-b-2 border-slate-950 pb-2">{numberRow("left", "Pierwsza liczba", left, expected("left"), leftComma)}</div><div className="pt-2">{numberRow("right", "Druga liczba", right, expected("right"), rightComma, operation)}</div><div className="my-2 border-t-2 border-slate-950" /><div>{numberRow("result", "Wynik działania", result, expected("result"), resultComma)}</div></div><div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-950"><b>Odpowiedź:</b><span>{result ? `${task.result} ${task.unit}` : "uzupełnij wynik w działaniu"}</span></div></section> : <p className="rounded-xl border-2 border-indigo-200 bg-white p-4 text-center font-black text-indigo-950">Najpierw wybierz znak działania.</p>}
    {!readOnly ? <LessonNumericKeypad onKey={change} onConfirm={check} label="Kalkulator do zadania tekstowego" helperText={operation ? "Uzupełnij wszystkie kratki zapisu pisemnego i zatwierdź." : "Najpierw wybierz znak działania."} /> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Działanie pisemne i odpowiedź są poprawne." : "Uzupełnij wszystkie kratki i sprawdź liczby, znak oraz wynik."}</p> : null}
  </LessonTaskFrame>;
}
