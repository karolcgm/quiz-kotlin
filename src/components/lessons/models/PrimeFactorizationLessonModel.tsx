"use client";

import { useEffect, useMemo, useState } from "react";
import { NumericLessonKeypad } from "@/components/lessons/models/NumericLessonKeypad";
import { isPrime } from "@/components/lessons/models/PrimeCompositeLessonModel";

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export const MENTAL_FACTORIZATION_TASKS = [
  { label: "4 × 6", value: 24, factors: [2, 2, 2, 3] },
  { label: "30", value: 30, factors: [2, 3, 5] },
  { label: "12", value: 12, factors: [2, 2, 3] },
  { label: "45", value: 45, factors: [3, 3, 5] },
] as const;

export const FACTORIZATION_LADDER_TASKS = [420, 84, 180, 126] as const;

export function primeFactors(value: number) {
  const factors: number[] = [];
  let remaining = value;
  for (let divisor = 2; divisor * divisor <= remaining; divisor += 1) {
    while (remaining % divisor === 0) {
      factors.push(divisor);
      remaining /= divisor;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

export function validateFactorLadder(initial: number, leftValues: readonly string[], rightValues: readonly string[]) {
  if (leftValues.length !== rightValues.length || leftValues.some((value) => !value) || rightValues.some((value) => !value)) return false;
  let current = initial;
  for (let index = 0; index < rightValues.length; index += 1) {
    const divisor = Number(rightValues[index]);
    const quotient = Number(leftValues[index]);
    if (!isPrime(divisor) || current % divisor !== 0 || current / divisor !== quotient) return false;
    current = quotient;
  }
  return current === 1;
}

function sameFactors(left: readonly number[], right: readonly number[]) {
  const a = [...left].sort((x, y) => x - y);
  const b = [...right].sort((x, y) => x - y);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function DefinitionTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const answers = [
    "przedstawienie liczby złożonej w postaci iloczynu liczb pierwszych",
    "zapisanie wszystkich dzielników liczby",
    "podzielenie liczby przez 10",
    "zamiana liczby na sumę liczb pierwszych",
  ];
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  return <article className="rounded-[2rem] bg-gradient-to-br from-violet-950 to-indigo-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-200">Przypomnienie pojęcia</p><h4 className="mt-2 text-3xl font-black">Rozkład na czynniki pierwsze to…</h4><div className="mt-6 grid gap-3 sm:grid-cols-2">{answers.map((answer, index) => <button key={answer} type="button" disabled={readOnly} onClick={() => { setSelected(index); onResultChange?.(index === 0, answer); }} className={`min-h-24 rounded-2xl border-2 p-4 text-left font-bold ${selected === index ? index === 0 ? "border-emerald-200 bg-emerald-300 text-emerald-950" : "border-rose-200 bg-rose-300 text-rose-950" : "border-white/20 bg-white/10"}`}>{answer}</button>)}</div>{selected !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 font-black ${selected === 0 ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{selected === 0 ? "Tak — po prawej stronie iloczynu muszą zostać wyłącznie liczby pierwsze." : "To nie jest definicja rozkładu na czynniki pierwsze."}</p> : null}</article>;
}

function MentalTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = MENTAL_FACTORIZATION_TASKS[taskIndex % MENTAL_FACTORIZATION_TASKS.length]!;
  const [factors, setFactors] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const add = (factor: number) => { setFactors((values) => [...values, factor]); setChecked(null); onResultChange?.(null); };
  const remove = () => { setFactors((values) => values.slice(0, -1)); setChecked(null); onResultChange?.(null); };
  const check = () => { const correct = sameFactors(factors, task.factors); setChecked(correct); onResultChange?.(correct, `${task.label} = ${factors.join(" × ")}`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-sm font-bold text-cyan-200">Rozkładaj w pamięci, aż po prawej stronie zostaną wyłącznie liczby pierwsze.</p><h4 className="mt-4 rounded-3xl bg-white p-5 text-center text-3xl font-black text-slate-950 sm:text-5xl"><span>{task.label}</span> = <span className="text-indigo-700">{factors.length ? factors.join(" × ") : "?"}</span></h4><div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white/10 p-4"><p className="mb-3 text-center font-black">Klawiatura czynników pierwszych</p><div className="grid grid-cols-5 gap-3">{[2, 3, 5, 7].map((factor) => <button key={factor} type="button" disabled={readOnly} onClick={() => add(factor)} className="min-h-16 rounded-2xl bg-white text-2xl font-black text-indigo-950 disabled:opacity-35">{factor}</button>)}<button type="button" disabled={readOnly || factors.length === 0} onClick={remove} className="min-h-16 rounded-2xl bg-rose-300 font-black text-rose-950 disabled:opacity-35">← Usuń</button></div></div><button type="button" disabled={readOnly || factors.length === 0} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź rozkład</button>{checked !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 text-center font-black ${checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>{checked ? `Poprawnie: ${task.value} jest iloczynem podanych liczb pierwszych.` : "Iloczyn lub zestaw czynników nie jest jeszcze poprawny."}</p> : null}</article>;
}

type LadderTarget = { side: "left" | "right"; index: number };

function LadderTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const initial = FACTORIZATION_LADDER_TASKS[taskIndex % FACTORIZATION_LADDER_TASKS.length]!;
  const rowCount = useMemo(() => primeFactors(initial).length, [initial]);
  const [leftValues, setLeftValues] = useState<string[]>(() => Array(rowCount).fill(""));
  const [rightValues, setRightValues] = useState<string[]>(() => Array(rowCount).fill(""));
  const [active, setActive] = useState<LadderTarget>({ side: "right", index: 0 });
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const applyKey = (key: string) => {
    const setter = active.side === "left" ? setLeftValues : setRightValues;
    setter((values) => values.map((value, index) => index === active.index ? key === "backspace" ? value.slice(0, -1) : `${value}${key}` : value));
    reset();
  };
  const update = (side: "left" | "right", index: number, value: string) => {
    const setter = side === "left" ? setLeftValues : setRightValues;
    setter((values) => values.map((item, itemIndex) => itemIndex === index ? value.replace(/\D/g, "") : item));
    reset();
  };
  const check = () => { const correct = validateFactorLadder(initial, leftValues, rightValues); setChecked(correct); onResultChange?.(correct, `${initial}: ${rightValues.join(" × ")}`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-emerald-950 via-slate-950 to-indigo-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-sm font-bold text-emerald-200">Po prawej wpisuj wyłącznie liczby pierwsze. Po lewej zapisuj wynik dzielenia. Kończymy, gdy po lewej pojawi się 1.</p><h4 className="mt-2 text-3xl font-black">Rozłóż liczbę {initial} metodą kreski</h4><div className="mx-auto mt-6 max-w-lg rounded-3xl bg-white p-5 text-slate-950"><div className="grid grid-cols-[1fr_4px_1fr] items-center gap-x-4 gap-y-2 text-center"><b className="pb-2 text-sm uppercase text-indigo-700">wyniki dzielenia</b><span className="h-full bg-slate-950" aria-hidden /><b className="pb-2 text-sm uppercase text-emerald-700">dzielniki pierwsze</b>{Array.from({ length: rowCount + 1 }, (_, row) => <div key={row} className="contents">{row === 0 ? <span className="grid min-h-12 place-items-center rounded-xl bg-indigo-100 text-2xl font-black">{initial}</span> : <input aria-label={`Wynik dzielenia, wiersz ${row}`} inputMode="none" disabled={readOnly} value={leftValues[row - 1]} onFocus={() => setActive({ side: "left", index: row - 1 })} onClick={() => setActive({ side: "left", index: row - 1 })} onChange={(event) => update("left", row - 1, event.target.value)} className={`min-h-12 w-full rounded-xl border-2 text-center text-xl font-black ${active.side === "left" && active.index === row - 1 ? "border-indigo-600 bg-indigo-100 ring-4 ring-indigo-200" : "border-indigo-200 bg-indigo-50"}`} />}<span className="h-full min-h-12 bg-slate-950" aria-hidden />{row < rowCount ? <input aria-label={`Dzielnik pierwszy, wiersz ${row + 1}`} inputMode="none" disabled={readOnly} value={rightValues[row]} onFocus={() => setActive({ side: "right", index: row })} onClick={() => setActive({ side: "right", index: row })} onChange={(event) => update("right", row, event.target.value)} className={`min-h-12 w-full rounded-xl border-2 text-center text-xl font-black ${active.side === "right" && active.index === row ? "border-emerald-600 bg-emerald-100 ring-4 ring-emerald-200" : "border-emerald-200 bg-emerald-50"}`} /> : <span className="grid min-h-12 place-items-center text-sm font-black text-slate-500">koniec</span>}</div>)}</div><div className="mt-5"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura do uzupełniania kreski" /></div></div><button type="button" disabled={readOnly || leftValues.some((value) => !value) || rightValues.some((value) => !value)} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-300 px-5 text-lg font-black text-emerald-950 disabled:opacity-35">Sprawdź całą kreskę</button>{checked !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 text-center font-black ${checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>{checked ? `Poprawny rozkład: ${initial} = ${rightValues.join(" × ")}.` : "Któryś dzielnik nie jest pierwszy albo wynik dzielenia po lewej stronie jest niepoprawny."}</p> : null}</article>;
}

export function PrimeFactorizationLessonModel({ seed = 1, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const station = Math.min(2, Math.max(1, seed));
  const taskIndex = Math.max(0, questionNumber - 1);
  return <section data-seed={seed} className="rounded-[2.25rem] bg-gradient-to-br from-emerald-700 via-indigo-700 to-violet-700 p-3 shadow-2xl sm:p-5"><header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-100">Dział II · Temat 5</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">Rozkład na czynniki pierwsze</h3></div><b className="rounded-2xl bg-white/20 px-4 py-2">Zadanie {questionNumber}/{questionCount}</b></header>{station === 1 && taskIndex === 0 ? <DefinitionTask readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 1 && taskIndex > 0 ? <MentalTask key={taskIndex} taskIndex={taskIndex - 1} readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 2 ? <LadderTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}</section>;
}
