"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_WRITTEN_STORY_ACTIVITY = "decimal-written-story" as const;
export type DecimalWrittenStoryActivity = typeof DECIMAL_WRITTEN_STORY_ACTIVITY;
type Operation = "+" | "−" | "·" | ":";
type FieldId = "left" | "right" | "result";
type ActiveField = { id: FieldId; index: number };
type PictureKind = "ribbons" | "water" | "pet-food" | "smoothie";
type StoryTask = { operation: Operation; left: string; right: string; result: string; unit: string; title: string; story: string; question: string; picture: PictureKind };

const TASKS: readonly StoryTask[] = [
  { operation: "+", left: "18,75", right: "26,48", result: "45,23", unit: "m", title: "Taśmy do dekoracji", story: "Do przygotowania dekoracji sali wykorzystano 18,75 m granatowej taśmy i 26,48 m srebrnej taśmy.", question: "Ile metrów taśmy wykorzystano łącznie?", picture: "ribbons" },
  { operation: "−", left: "48,6", right: "17,85", result: "30,75", unit: "l", title: "Woda w zbiorniku", story: "W zbiorniku było 48,6 l wody. Do podlewania roślin zużyto 17,85 l.", question: "Ile litrów wody zostało w zbiorniku?", picture: "water" },
  { operation: "·", left: "2,75", right: "8", result: "22", unit: "kg", title: "Paczki z karmą", story: "Do schroniska przygotowano 8 jednakowych paczek karmy. Każda paczka waży 2,75 kg.", question: "Ile kilogramów karmy przygotowano?", picture: "pet-food" },
  { operation: ":", left: "13,5", right: "0,75", result: "18", unit: "porcji", title: "Porcje koktajlu", story: "Przygotowano 13,5 l koktajlu. Jedna porcja ma pojemność 0,75 l.", question: "Ile pełnych porcji można przygotować?", picture: "smoothie" },
];

const PICTURE_SRC: Record<PictureKind, string> = {
  ribbons: "/lessons/illustrations/decimals/written-story/ribbons.png",
  water: "/lessons/illustrations/decimals/written-story/water.png",
  "pet-food": "/lessons/illustrations/decimals/written-story/pet-food.png",
  smoothie: "/lessons/illustrations/decimals/written-story/smoothie.png",
};

const digits = (value: string) => value.replace(",", "");
const decimalParts = (value: string) => { const [whole, decimal = ""] = value.split(","); return { whole, decimal }; };

export function isDecimalWrittenStoryActivity(activity: string): activity is DecimalWrittenStoryActivity { return activity === DECIMAL_WRITTEN_STORY_ACTIVITY; }
export interface DecimalWrittenStoryLabProps { activity: DecimalWrittenStoryActivity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }

export function DecimalWrittenStoryLab({ seed, taskSeed, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalWrittenStoryLabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => TASKS[effectiveSeed % TASKS.length]!, [effectiveSeed]);
  const [left, setLeft] = useState(readOnly ? digits(task.left) : "");
  const [right, setRight] = useState(readOnly ? digits(task.right) : "");
  const [result, setResult] = useState(readOnly ? digits(task.result) : "");
  const [operation, setOperation] = useState<Operation | "">(readOnly ? task.operation : "");
  const [active, setActive] = useState<ActiveField>({ id: "left", index: 0 });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const expected = (id: FieldId) => id === "left" ? digits(task.left) : id === "right" ? digits(task.right) : digits(task.result);
  const current = (id: FieldId) => id === "left" ? left : id === "right" ? right : result;
  const assign = (id: FieldId, value: string) => { if (id === "left") setLeft(value); if (id === "right") setRight(value); if (id === "result") setResult(value); };
  const clear = () => { setStatus(null); onResultChange?.(null); };
  const allParts = [task.left, task.right, task.result].map(decimalParts);
  const integerColumns = Math.max(...allParts.map(({ whole }) => whole.length));
  const fractionColumns = Math.max(...allParts.map(({ decimal }) => decimal.length));
  const cellCount = integerColumns + fractionColumns;

  const change = (key: string) => {
    if (readOnly || key === ",") return;
    const target = expected(active.id);
    const previous = current(active.id);
    const next = previous.split("");
    next[active.index] = key === "backspace" ? "" : key;
    assign(active.id, next.join(""));
    if (key !== "backspace") setActive({ id: active.id, index: Math.min(target.length - 1, active.index + 1) });
    clear();
  };
  const check = () => {
    const correct = Boolean(operation) && operation === task.operation && left === digits(task.left) && right === digits(task.right) && result === digits(task.result);
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, correct ? `${task.left} ${operation} ${task.right} = ${task.result} ${task.unit}` : "nieuzupełnione działanie");
  };
  const formatCurrent = (id: FieldId) => {
    const source = id === "left" ? task.left : id === "right" ? task.right : task.result;
    const { whole, decimal } = decimalParts(source);
    const value = current(id);
    return decimal ? `${value.slice(0, whole.length)},${value.slice(whole.length)}` : value;
  };
  const numberRow = (id: FieldId, label: string, prefix?: string) => {
    const source = id === "left" ? task.left : id === "right" ? task.right : task.result;
    const { whole, decimal } = decimalParts(source);
    const value = current(id);
    const integerStart = integerColumns - whole.length;
    return <div className="flex min-h-12 items-center justify-end gap-3" aria-label={label}>
      <span className="w-7 text-center text-2xl font-black" aria-hidden>{prefix ?? ""}</span>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cellCount}, minmax(0, 2.55rem))` }}>
        {Array.from({ length: cellCount }, (_, column) => {
          const index = column < integerColumns ? column - integerStart : whole.length + column - integerColumns;
          const editable = index >= 0 && index < digits(source).length;
          const showsComma = column === integerColumns - 1 && decimal.length > 0;
          if (!editable) return <span key={column} className="h-11 w-11 rounded-lg border-2 border-slate-200 bg-slate-100" aria-label="Puste miejsce wyrównujące" />;
          return <span key={column} className="relative">
            {showsComma ? <i className="absolute -right-2 bottom-0 z-10 text-3xl font-black not-italic" aria-hidden>,</i> : null}
            <button type="button" disabled={readOnly} onClick={() => setActive({ id, index })} className={`grid h-11 w-11 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black text-slate-950 ${active.id === id && active.index === index ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`} aria-label={`${label}, cyfra ${index + 1}`}>{value[index] ?? ""}</button>
          </span>;
        })}
      </div>
    </div>;
  };

  return <LessonTaskFrame eyebrow="Dział 1 · Rachunki" heading="Zadania tekstowe" description="Odczytaj dane, wybierz działanie, a następnie wykonaj pełny zapis pisemny w kratkach." questionNumber={questionNumber} questionCount={questionCount} data-decimal-written-story data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined} contentClassName="space-y-5">
    <section className="grid gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 md:grid-cols-[1.2fr_0.8fr]"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-800">{task.title}</p><p className="mt-2 text-lg font-bold leading-relaxed text-emerald-950">{task.story}</p><p className="mt-3 text-lg font-black text-emerald-950">{task.question}</p></div><div className="self-center"><Image src={PICTURE_SRC[task.picture]} alt="Ilustracja do zadania" width={1536} height={1024} className="mx-auto h-auto max-h-48 w-full object-contain" /></div></section>
    <section className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5"><h3 className="text-center text-xl font-black text-indigo-950">Wybierz działanie</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Wybierz znak działania">{(["+", "−", "·", ":"] as const).map((symbol) => <LessonTaskChoice key={symbol} disabled={readOnly} selected={operation === symbol} onClick={() => { setOperation(symbol); setActive({ id: "left", index: 0 }); clear(); }} className="min-h-12 text-2xl">{symbol}</LessonTaskChoice>)}</div></section>
    {operation ? <section className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5"><div><h3 className="text-center text-xl font-black text-amber-950">Zapis pisemny</h3><p className="mt-1 text-center font-bold text-amber-950">Każdy rząd ma te same kolumny. Wpisz cyfry w puste kratki i zachowaj położenie przecinka.</p></div><input className="sr-only" readOnly inputMode="none" value="" tabIndex={-1} aria-hidden="true" /><div className="mx-auto w-full max-w-xl overflow-x-auto rounded-xl border-2 border-amber-400 bg-white p-4 font-mono font-black text-slate-950"><div className="min-w-[17rem] space-y-2"><div className="border-b-2 border-slate-950 pb-2">{numberRow("left", "Pierwsza liczba")}</div><div className="pt-1">{numberRow("right", "Druga liczba", operation)}</div><div className="border-t-2 border-slate-950 pt-2">{numberRow("result", "Wynik działania")}</div></div></div><div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-950"><b>Odpowiedź:</b><span>{result.length === expected("result").length ? `${formatCurrent("result")} ${task.unit}` : "uzupełnij wynik w działaniu"}</span></div></section> : <p className="rounded-xl border-2 border-indigo-200 bg-white p-4 text-center font-black text-indigo-950">Najpierw wybierz znak działania.</p>}
    {!readOnly ? <LessonNumericKeypad onKey={change} onConfirm={check} label="Kalkulator do zadania tekstowego" helperText={operation ? "Uzupełnij wszystkie kratki zapisu pisemnego i zatwierdź." : "Najpierw wybierz znak działania."} /> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Działanie pisemne i odpowiedź są poprawne." : "Uzupełnij wszystkie kratki i sprawdź liczby, znak oraz wynik."}</p> : null}
  </LessonTaskFrame>;
}
