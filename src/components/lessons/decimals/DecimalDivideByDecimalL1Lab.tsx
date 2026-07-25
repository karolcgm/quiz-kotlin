"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createPublicDecimalDivideByDecimalL1Task, isDecimalDivideByDecimalL1Activity, shiftDecimalCommaRight } from "@/lib/math/decimals/decimalDivideByDecimalL1";
import type { DecimalDivideByDecimalL1Activity } from "@/lib/math/decimals/decimalDivideByDecimalL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

function ShiftExample() {
  return <section className="space-y-4 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5">
    <h3 className="text-xl font-black text-cyan-950">Najpierw zamieniamy dzielnik na liczbę naturalną</h3>
    <p className="font-bold text-cyan-950">Przesuwamy oba przecinki o tyle samo miejsc w prawo — aż dzielnik będzie liczbą naturalną.</p>
    <div className="grid gap-3 text-center font-black md:grid-cols-3"><p className="rounded-xl bg-white p-4 text-2xl">4,5 : 0,15</p><p className="rounded-xl bg-white p-4 text-2xl text-indigo-700">450 : 15</p><p className="rounded-xl bg-white p-4 text-2xl">30</p></div>
  </section>;
}

export interface DecimalDivideByDecimalL1LabProps { activity: DecimalDivideByDecimalL1Activity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }
export { isDecimalDivideByDecimalL1Activity };

export function DecimalDivideByDecimalL1Lab(props: DecimalDivideByDecimalL1LabProps) { return <DecimalDivideByDecimalRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />; }

function DecimalDivideByDecimalRound({ activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalDivideByDecimalL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalDivideByDecimalL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const resultDigits = task.result.replace(",", "");
  const commaAfter = task.result.includes(",") ? task.result.indexOf(",") : resultDigits.length;
  const [shiftCount, setShiftCount] = useState(readOnly ? task.shifts : 0);
  const [answer, setAnswer] = useState<string[]>(() => readOnly ? [...resultDigits] : resultDigits.split("").map(() => ""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const shiftedDividend = shiftDecimalCommaRight(task.dividend, shiftCount);
  const shiftedDivisor = shiftDecimalCommaRight(task.divisor, shiftCount);
  const answerText = answer.join("");
  const clear = () => { setStatus(null); onResultChange?.(null); };
  const enter = (key: string) => {
    if (readOnly || key === ",") return;
    setAnswer((cells) => cells.map((cell, index) => index === activeIndex ? (key === "backspace" ? "" : key) : cell));
    if (key !== "backspace") setActiveIndex((index) => Math.min(answer.length - 1, index + 1));
    clear();
  };
  const check = () => {
    const correct = shiftCount === task.shifts && answer.every(Boolean) && answerText === resultDigits;
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, answerText ? `${task.dividend} : ${task.divisor} = ${task.result}` : "brak wyniku");
  };
  return <LessonTaskFrame className="space-y-5" contentClassName="space-y-5" eyebrow="Dział 5 · Ułamki dziesiętne" heading="Dzielenie przez ułamek dziesiętny" description="Przesuń przecinki w obu liczbach o tyle samo miejsc, aby dzielnik był liczbą naturalną. Następnie wpisz wynik." questionNumber={questionNumber} questionCount={questionCount} data-decimal-divide-by-decimal-l1 data-decimal-activity={activity} data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined}>
    <ShiftExample />
    <section className="space-y-5 rounded-2xl border-2 border-indigo-100 bg-white p-5">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]"><div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-wide text-indigo-800">Przed przesunięciem</p><p className="mt-2 text-3xl font-black text-slate-950">{task.dividend} : {task.divisor}</p></div><button type="button" disabled={readOnly || shiftCount >= task.shifts} onClick={() => { setShiftCount((count) => count + 1); clear(); }} className="rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-5 py-4 text-lg font-black text-white">Przesuń oba przecinki<br />o 1 miejsce →</button><div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-wide text-emerald-800">Po przesunięciu: {shiftCount}</p><p className="mt-2 text-3xl font-black text-slate-950">{shiftedDividend} : {shiftedDivisor}</p></div></div>
      <p className="text-center font-bold text-slate-700">{shiftCount === task.shifts ? "Dzielnik jest liczbą naturalną. Wpisz wynik w kratkach." : "Przesuwaj przecinki aż dzielnik będzie liczbą naturalną."}</p>
      {shiftCount === task.shifts ? <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5"><p className="text-center text-xl font-black text-amber-950">{shiftedDividend} : {shiftedDivisor} =</p><div className="mt-4 flex justify-center gap-1" aria-label="Wynik dzielenia">{answer.map((digit, index) => <span key={index} className="relative">{index === commaAfter ? <i className="absolute -left-2 bottom-0 text-3xl font-black not-italic" aria-hidden>,</i> : null}<button type="button" disabled={readOnly} onClick={() => setActiveIndex(index)} aria-label={`Wynik, cyfra ${index + 1}`} className={`grid h-12 w-12 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black text-slate-950 ${activeIndex === index ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`}>{digit}</button></span>)}</div></div> : null}
      {!readOnly ? <LessonNumericKeypad onKey={enter} onConfirm={check} label="Kalkulator do wyniku dzielenia" helperText={shiftCount === task.shifts ? "Uzupełnij wszystkie kratki wyniku i zatwierdź." : "Najpierw przesuń oba przecinki."} /> : null}
      {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? `Dobrze! ${task.dividend} : ${task.divisor} = ${task.result}.` : "Sprawdź liczbę przesunięć oraz wszystkie cyfry wyniku."}</p> : null}
    </section>
  </LessonTaskFrame>;
}
