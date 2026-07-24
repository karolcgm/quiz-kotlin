"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createPublicDecimalDivideByDecimalL1Task, isDecimalDivideByDecimalL1Activity, shiftDecimalCommaRight } from "@/lib/math/decimals/decimalDivideByDecimalL1";
import type { DecimalDivideByDecimalL1Activity } from "@/lib/math/decimals/decimalDivideByDecimalL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

type WrittenStep = { partial: string; product: string; remainder: string };

function buildWrittenSteps(dividend: string, divisor: number, quotient: string): WrittenStep[] {
  const sourceDigits = dividend.replace(",", "");
  const quotientDigits = quotient.replace(",", "");
  const digits = `${sourceDigits}${"0".repeat(Math.max(0, quotientDigits.length - sourceDigits.length))}`;
  const steps: WrittenStep[] = [];
  let partial = 0;
  let started = false;

  for (const digit of digits) {
    partial = partial * 10 + Number(digit);
    if (!started && partial < divisor) continue;
    started = true;
    const product = Math.floor(partial / divisor) * divisor;
    const remainder = partial - product;
    steps.push({ partial: String(partial), product: String(product), remainder: String(remainder) });
  }
  return steps;
}

function WrittenDivisionAfterShift({ dividend, divisor, result, showSolution = false }: { dividend: string; divisor: string; result: string; showSolution?: boolean }) {
  const steps = useMemo(() => buildWrittenSteps(dividend, Number(divisor), result), [dividend, divisor, result]);
  const resultDigits = result.replace(",", "");
  const commaAfter = result.includes(",") ? result.indexOf(",") : resultDigits.length;

  return <section className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
    <div>
      <h3 className="text-lg font-black text-amber-950">Dzielenie pisemne po przesunięciu przecinków</h3>
      <p className="mt-1 font-bold text-amber-950">Dzielimy teraz przez liczbę naturalną. Przecinek w ilorazie stoi nad miejscem, w którym był przecinek w dzielnej przed przesunięciem.</p>
    </div>
    <div className="mx-auto w-fit rounded-xl border-2 border-amber-400 bg-white px-5 py-4 font-mono font-black text-slate-950">
      <div className="ml-8 flex items-end gap-1 border-b-2 border-slate-950 pb-1 text-2xl" aria-label={`Iloraz ${result}`}>
        {resultDigits.split("").map((digit, index) => <span key={`${digit}-${index}`} className="relative grid h-10 w-10 place-items-center rounded-md border-2 border-slate-300 bg-slate-50">{index === commaAfter ? <i aria-hidden className="absolute -left-2 bottom-0 text-3xl not-italic">,</i> : null}{showSolution ? digit : ""}</span>)}
      </div>
      <div className="flex items-center gap-2 pt-2 text-2xl">
        <span className="flex gap-1">{dividend.split("").map((digit, index) => <span key={`${digit}-${index}`} className="grid h-10 w-10 place-items-center rounded-md border-2 border-emerald-600 bg-emerald-50">{digit}</span>)}</span>
        <span>:</span><span className="grid h-10 min-w-10 place-items-center rounded-md border-2 border-slate-500 bg-white px-2">{divisor}</span>
      </div>
      <div className="space-y-1 pt-2 text-right text-2xl">
        {steps.map((step, index) => <div key={`${step.partial}-${index}`} className="space-y-1">
          <p className="pr-14">− {showSolution ? step.product : "□".repeat(step.product.length)}</p>
          <div className="ml-auto w-32 border-t-2 border-slate-950" />
          <p className="pr-10">{showSolution ? step.remainder : "□".repeat(step.remainder.length)}</p>
        </div>)}
      </div>
    </div>
    <p className="text-center text-sm font-bold text-amber-950">W kolejnych wierszach odejmujemy iloczyn dzielnika i kolejnej cyfry ilorazu.</p>
  </section>;
}

function ShiftExample() {
  return <section className="space-y-4 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5">
    <h3 className="text-xl font-black text-cyan-950">Najpierw zamieniamy dzielnik na liczbę naturalną</h3>
    <p className="font-bold text-cyan-950">Przesuwamy oba przecinki o tyle samo miejsc w prawo. Robimy to tak długo, aż dzielnik będzie liczbą naturalną.</p>
    <div className="grid gap-3 text-center font-black md:grid-cols-3"><p className="rounded-xl bg-white p-4 text-2xl">4,5 : 0,15</p><p className="rounded-xl bg-white p-4 text-2xl text-indigo-700">450 : 15</p><p className="rounded-xl bg-white p-4 text-2xl">30</p></div>
    <p className="text-center font-black text-cyan-950">Teraz dzielimy tak jak w poprzednim temacie: przez liczbę naturalną.</p>
  </section>;
}

export interface DecimalDivideByDecimalL1LabProps { activity: DecimalDivideByDecimalL1Activity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }
export { isDecimalDivideByDecimalL1Activity };

export function DecimalDivideByDecimalL1Lab(props: DecimalDivideByDecimalL1LabProps) { return <DecimalDivideByDecimalRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />; }

function DecimalDivideByDecimalRound({ activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalDivideByDecimalL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalDivideByDecimalL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const [shiftCount, setShiftCount] = useState(readOnly ? task.shifts : 0);
  const [answer, setAnswer] = useState(readOnly ? task.result : "");
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const shiftedDividend = shiftDecimalCommaRight(task.dividend, shiftCount);
  const shiftedDivisor = shiftDecimalCommaRight(task.divisor, shiftCount);
  const clear = () => { setStatus(null); onResultChange?.(null); };
  const change = (key: string) => { if (readOnly) return; setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "," && current.includes(",") ? current : current.length < 9 ? `${current}${key}` : current); clear(); };
  const check = () => { const correct = shiftCount === task.shifts && answer === task.result; setStatus(correct ? "correct" : "wrong"); onResultChange?.(correct, answer); };
  return <LessonTaskFrame className="space-y-5" contentClassName="space-y-5" eyebrow="Dział 5 · Ułamki dziesiętne" heading="Dzielenie przez ułamek dziesiętny" description="Przesuń przecinki w obu liczbach o tyle samo miejsc, aby dzielnik był liczbą naturalną." questionNumber={questionNumber} questionCount={questionCount} data-decimal-divide-by-decimal-l1 data-decimal-activity={activity} data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined}>
    <ShiftExample />
    <section className="space-y-5 rounded-2xl border-2 border-indigo-100 bg-white p-5">
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-wide text-indigo-800">Przed przesunięciem</p><p className="mt-2 text-3xl font-black text-slate-950">{task.dividend} : {task.divisor}</p></div>
        <button type="button" disabled={readOnly || shiftCount >= task.shifts} onClick={() => { setShiftCount((count) => count + 1); clear(); }} className="rounded-2xl border-2 border-indigo-600 bg-indigo-600 px-5 py-4 text-lg font-black text-white" aria-label="Przesuń oba przecinki o jedno miejsce w prawo">Przesuń oba przecinki<br />o 1 miejsce →</button>
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-wide text-emerald-800">Po przesunięciu {shiftCount} {shiftCount === 1 ? "miejsce" : "miejsca"}</p><p className="mt-2 text-3xl font-black text-slate-950">{shiftedDividend} : {shiftedDivisor}</p></div>
      </div>
      <p className="text-center font-bold text-slate-700">{shiftCount === task.shifts ? "Dzielnik jest liczbą naturalną. Teraz oblicz iloraz." : "Przesuń przecinki jeszcze raz, aż dzielnik będzie liczbą naturalną."}</p>
      {shiftCount === task.shifts ? <WrittenDivisionAfterShift dividend={shiftedDividend} divisor={shiftedDivisor} result={task.result} showSolution={readOnly} /> : null}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-amber-50 p-4"><span className="text-2xl font-black text-slate-950">{shiftedDividend} : {shiftedDivisor} =</span><button type="button" disabled={readOnly} onClick={clear} className="grid min-h-14 w-36 place-items-center rounded-xl border-2 border-slate-400 bg-white px-3 text-3xl font-black text-slate-950" aria-label="Iloraz po przesunięciu przecinków">{answer}</button></div>
      {!readOnly ? <LessonNumericKeypad allowSeparator onKey={change} onConfirm={check} label="Kalkulator do dzielenia" helperText="Najpierw przesuń oba przecinki. Potem wpisz wynik dzielenia przez liczbę naturalną." /> : null}
      {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? `Dobrze! ${task.dividend} : ${task.divisor} = ${task.result}.` : "Sprawdź liczbę przesunięć oraz iloraz."}</p> : null}
    </section>
  </LessonTaskFrame>;
}
