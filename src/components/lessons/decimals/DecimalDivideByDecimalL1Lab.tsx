"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createPublicDecimalDivideByDecimalL1Task, isDecimalDivideByDecimalL1Activity, shiftDecimalCommaRight } from "@/lib/math/decimals/decimalDivideByDecimalL1";
import type { DecimalDivideByDecimalL1Activity } from "@/lib/math/decimals/decimalDivideByDecimalL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

type WrittenStep = { partial: string; product: string; remainder: string };
type ActiveCell = { type: "quotient" } | { type: "product" | "remainder"; step: number };

function buildWrittenSteps(dividend: string, divisor: number, quotient: string): WrittenStep[] {
  const source = dividend.replace(",", "");
  const result = quotient.replace(",", "");
  const digits = `${source}${"0".repeat(Math.max(0, result.length - source.length))}`;
  const steps: WrittenStep[] = [];
  let partial = 0;
  let started = false;
  for (const digit of digits) {
    partial = partial * 10 + Number(digit);
    if (!started && partial < divisor) continue;
    started = true;
    const product = Math.floor(partial / divisor) * divisor;
    steps.push({ partial: String(partial), product: String(product), remainder: String(partial - product) });
  }
  return steps;
}

function ShiftExample() {
  return <section className="space-y-4 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5">
    <h3 className="text-xl font-black text-cyan-950">Najpierw zamieniamy dzielnik na liczbę naturalną</h3>
    <p className="font-bold text-cyan-950">Przesuwamy oba przecinki o tyle samo miejsc w prawo. Robimy to tak długo, aż dzielnik będzie liczbą naturalną.</p>
    <div className="grid gap-3 text-center font-black md:grid-cols-3"><p className="rounded-xl bg-white p-4 text-2xl">4,5 : 0,15</p><p className="rounded-xl bg-white p-4 text-2xl text-indigo-700">450 : 15</p><p className="rounded-xl bg-white p-4 text-2xl">30</p></div>
  </section>;
}

function InteractiveWrittenDivision({ dividend, divisor, result, readOnly = false, onResultChange }: { dividend: string; divisor: string; result: string; readOnly?: boolean; onResultChange: (correct: boolean | null, answer?: string) => void }) {
  const steps = useMemo(() => buildWrittenSteps(dividend, Number(divisor), result), [dividend, divisor, result]);
  const resultDigits = result.replace(",", "");
  const commaAfter = result.includes(",") ? result.indexOf(",") : resultDigits.length;
  const [quotient, setQuotient] = useState(readOnly ? resultDigits : "");
  const [products, setProducts] = useState(() => steps.map((step) => readOnly ? step.product : ""));
  const [remainders, setRemainders] = useState(() => steps.map((step) => readOnly ? step.remainder : ""));
  const [active, setActive] = useState<ActiveCell>({ type: "quotient" });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const resetFeedback = () => { setStatus(null); onResultChange(null); };
  const edit = (key: string) => {
    if (readOnly || key === ",") return;
    const add = (value: string, size: number) => key === "backspace" ? value.slice(0, -1) : value.length < size ? `${value}${key}` : value;
    if (active.type === "quotient") setQuotient((value) => add(value, resultDigits.length));
    if (active.type === "product") setProducts((rows) => rows.map((value, index) => index === active.step ? add(value, steps[index]!.product.length) : value));
    if (active.type === "remainder") setRemainders((rows) => rows.map((value, index) => index === active.step ? add(value, steps[index]!.remainder.length) : value));
    resetFeedback();
  };
  const check = () => {
    const correct = quotient === resultDigits && steps.every((step, index) => products[index] === step.product && remainders[index] === step.remainder);
    setStatus(correct ? "correct" : "wrong");
    onResultChange(correct, result);
  };
  const cell = (value: string, selected: boolean, label: string, select: () => void) => <button type="button" disabled={readOnly} onClick={select} aria-label={label} className={`grid h-11 min-w-11 place-items-center rounded-lg border-2 bg-white px-2 font-mono text-2xl font-black tabular-nums text-slate-950 ${selected ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`}>{value}</button>;
  return <section className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
    <div><h3 className="text-lg font-black text-amber-950">Dzielenie pisemne po przesunięciu przecinków</h3><p className="mt-1 font-bold text-amber-950">Dzielimy teraz przez liczbę naturalną. Wpisz iloraz, a następnie kolejne iloczyny do odjęcia i liczby po odjęciu.</p></div>
    <input className="sr-only" readOnly inputMode="none" value="" tabIndex={-1} aria-hidden="true" />
    <div className="mx-auto w-fit max-w-full overflow-x-auto rounded-xl border-2 border-amber-400 bg-white p-4 font-mono font-black text-slate-950">
      <div className="ml-auto flex w-fit gap-1 border-b-2 border-slate-950 pb-2" style={{ marginRight: "4rem" }}>{resultDigits.split("").map((_, index) => <span key={index} className="relative">{index === commaAfter ? <i className="absolute -left-2 bottom-0 text-3xl not-italic" aria-hidden>,</i> : null}{cell(quotient[index] ?? "", active.type === "quotient", `Iloraz, cyfra ${index + 1}`, () => setActive({ type: "quotient" }))}</span>)}</div>
      <div className="flex items-center gap-2 pt-3 text-2xl"><span className="flex gap-1">{dividend.split("").map((digit, index) => digit === "," ? <i key={index} className="grid h-11 items-end text-3xl not-italic">,</i> : <span key={index} className="grid h-11 min-w-11 place-items-center rounded-lg border-2 border-emerald-600 bg-emerald-50 px-2">{digit}</span>)}</span><span>:</span><span className="grid h-11 min-w-11 place-items-center rounded-lg border-2 border-slate-500 px-2">{divisor}</span></div>
      <div className="space-y-2 pt-3 text-right">{steps.map((step, index) => <div key={`${step.partial}-${index}`} className="space-y-1"><div className="flex items-center justify-end gap-1"><span className="text-2xl">−</span>{step.product.split("").map((_, digitIndex) => <span key={digitIndex}>{cell(products[index]?.[digitIndex] ?? "", active.type === "product" && active.step === index, `Iloczyn do odjęcia, krok ${index + 1}`, () => setActive({ type: "product", step: index }))}</span>)}</div><div className="ml-auto w-44 border-t-2 border-slate-950" /><div className="flex justify-end gap-1">{step.remainder.split("").map((_, digitIndex) => <span key={digitIndex}>{cell(remainders[index]?.[digitIndex] ?? "", active.type === "remainder" && active.step === index, `Liczba po odjęciu, krok ${index + 1}`, () => setActive({ type: "remainder", step: index }))}</span>)}</div></div>)}</div>
    </div>
    {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} label="Kalkulator do dzielenia pisemnego" helperText={active.type === "quotient" ? "Wpisz cyfry ilorazu. Przecinek jest już ustawiony we właściwym miejscu." : active.type === "product" ? "Wpisz iloczyn do odjęcia." : "Wpisz liczbę po odjęciu i sprowadzeniu kolejnej cyfry."} /> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Wszystkie kroki dzielenia są poprawne." : "Sprawdź iloraz oraz kolejne odejmowania i reszty."}</p> : null}
  </section>;
}

export interface DecimalDivideByDecimalL1LabProps { activity: DecimalDivideByDecimalL1Activity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }
export { isDecimalDivideByDecimalL1Activity };

export function DecimalDivideByDecimalL1Lab(props: DecimalDivideByDecimalL1LabProps) { return <DecimalDivideByDecimalRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />; }

function DecimalDivideByDecimalRound({ activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalDivideByDecimalL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalDivideByDecimalL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const [shiftCount, setShiftCount] = useState(readOnly ? task.shifts : 0);
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const shiftedDividend = shiftDecimalCommaRight(task.dividend, shiftCount);
  const shiftedDivisor = shiftDecimalCommaRight(task.divisor, shiftCount);
  const clear = () => { setStatus(null); onResultChange?.(null); };
  const handleWrittenResult = (correct: boolean | null, answer?: string) => { if (correct === null) { clear(); return; } const finalCorrect = shiftCount === task.shifts && correct; setStatus(finalCorrect ? "correct" : "wrong"); onResultChange?.(finalCorrect, answer); };
  return <LessonTaskFrame className="space-y-5" contentClassName="space-y-5" eyebrow="Dział 5 · Ułamki dziesiętne" heading="Dzielenie przez ułamek dziesiętny" description="Przesuń przecinki w obu liczbach o tyle samo miejsc, aby dzielnik był liczbą naturalną, a następnie wykonaj dzielenie pisemne." questionNumber={questionNumber} questionCount={questionCount} data-decimal-divide-by-decimal-l1 data-decimal-activity={activity} data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined}>
    <ShiftExample />
    <section className="space-y-5 rounded-2xl border-2 border-indigo-100 bg-white p-5">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]"><div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-wide text-indigo-800">Przed przesunięciem</p><p className="mt-2 text-3xl font-black text-slate-950">{task.dividend} : {task.divisor}</p></div><button type="button" disabled={readOnly || shiftCount >= task.shifts} onClick={() => { setShiftCount((count) => count + 1); clear(); }} className="rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-5 py-4 text-lg font-black text-white">Przesuń oba przecinki<br />o 1 miejsce →</button><div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-wide text-emerald-800">Po przesunięciu: {shiftCount}</p><p className="mt-2 text-3xl font-black text-slate-950">{shiftedDividend} : {shiftedDivisor}</p></div></div>
      <p className="text-center font-bold text-slate-700">{shiftCount === task.shifts ? "Dzielnik jest liczbą naturalną. Teraz wykonaj dzielenie pisemne." : "Przesuwaj przecinki aż dzielnik będzie liczbą naturalną."}</p>
      {shiftCount === task.shifts ? <InteractiveWrittenDivision key={`${shiftedDividend}-${shiftedDivisor}`} dividend={shiftedDividend} divisor={shiftedDivisor} result={task.result} readOnly={readOnly} onResultChange={handleWrittenResult} /> : null}
      {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? `Dobrze! ${task.dividend} : ${task.divisor} = ${task.result}.` : "Sprawdź liczbę przesunięć i zapis pisemny."}</p> : null}
    </section>
  </LessonTaskFrame>;
}
