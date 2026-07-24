"use client";

import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { shiftDecimalCommaRight } from "@/lib/math/decimals/decimalDivideByDecimalL1";

type Active = { row: "left" | "right" | "quotient"; index: number } | { row: "product" | "remainder"; step: number; index: number };
type Step = { partial: string; product: string; remainder: string };

const raw = (value: string) => value.replace(",", "");
const commaAfter = (value: string) => value.includes(",") ? value.indexOf(",") : raw(value).length;

function createSteps(dividend: string, divisor: number): Step[] {
  const source = raw(dividend);
  const steps: Step[] = [];
  let partial = 0;
  let started = false;
  for (let index = 0; index < source.length; index += 1) {
    partial = partial * 10 + Number(source[index]);
    if (!started && partial < divisor) continue;
    started = true;
    const product = Math.floor(partial / divisor) * divisor;
    const remainder = partial - product;
    const next = index < source.length - 1 ? `${remainder}${source[index + 1]}` : `${remainder}`;
    steps.push({ partial: `${partial}`, product: `${product}`, remainder: next });
  }
  return steps;
}

export function DecimalWrittenDivisionStory({ left: taskLeft, right: taskRight, result, unit, readOnly = false, onResultChange }: { left: string; right: string; result: string; unit: string; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const leftDigits = raw(taskLeft);
  const rightDigits = raw(taskRight);
  const resultDigits = raw(result);
  const [left, setLeft] = useState(() => readOnly ? [...leftDigits] : leftDigits.split("").map(() => ""));
  const [right, setRight] = useState(() => readOnly ? [...rightDigits] : rightDigits.split("").map(() => ""));
  const [shiftCount, setShiftCount] = useState(0);
  const [quotient, setQuotient] = useState(() => readOnly ? [...resultDigits] : resultDigits.split("").map(() => ""));
  const requiredShifts = taskRight.includes(",") ? taskRight.length - taskRight.indexOf(",") - 1 : 0;
  const finalDividend = shiftDecimalCommaRight(taskLeft, requiredShifts);
  const finalDivisor = shiftDecimalCommaRight(taskRight, requiredShifts);
  const steps = useMemo(() => createSteps(finalDividend, Number(finalDivisor)), [finalDividend, finalDivisor]);
  const [products, setProducts] = useState(() => steps.map((step) => readOnly ? [...step.product] : step.product.split("").map(() => "")));
  const [remainders, setRemainders] = useState(() => steps.map((step) => readOnly ? [...step.remainder] : step.remainder.split("").map(() => "")));
  const [active, setActive] = useState<Active>({ row: "left", index: 0 });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const setupCorrect = left.join("") === leftDigits && right.join("") === rightDigits;
  const clear = () => { setStatus(null); onResultChange?.(null); };
  const enter = (key: string) => {
    if (readOnly || key === ",") return;
    const value = key === "backspace" ? "" : key;
    if (active.row === "left") setLeft((cells) => cells.map((cell, index) => index === active.index ? value : cell));
    if (active.row === "right") setRight((cells) => cells.map((cell, index) => index === active.index ? value : cell));
    if (active.row === "quotient") setQuotient((cells) => cells.map((cell, index) => index === active.index ? value : cell));
    if (active.row === "product") setProducts((rows) => rows.map((cells, step) => step === active.step ? cells.map((cell, index) => index === active.index ? value : cell) : cells));
    if (active.row === "remainder") setRemainders((rows) => rows.map((cells, step) => step === active.step ? cells.map((cell, index) => index === active.index ? value : cell) : cells));
    clear();
  };
  const check = () => {
    const correct = setupCorrect && shiftCount === requiredShifts && quotient.join("") === resultDigits && steps.every((step, index) => products[index]?.join("") === step.product && remainders[index]?.join("") === step.remainder);
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, correct ? `${taskLeft} : ${taskRight} = ${result} ${unit}` : "nieuzupełnione dzielenie");
  };
  const cells = (values: string[], row: Active["row"], label: string, step?: number, comma = -1) => <div className="flex justify-end gap-1">{values.map((value, index) => <span key={index} className="relative">{index === comma ? <i className="absolute -left-2 bottom-0 z-10 text-3xl font-black not-italic" aria-hidden>,</i> : null}<button type="button" disabled={readOnly} onClick={() => step === undefined ? setActive({ row: row as "left" | "right" | "quotient", index }) : setActive({ row: row as "product" | "remainder", step, index })} className={`grid h-11 w-11 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black ${active.row === row && active.index === index && (step === undefined || "step" in active && active.step === step) ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`} aria-label={`${label}, cyfra ${index + 1}`}>{value}</button></span>)}</div>;
  return <section className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5" data-decimal-story-division>
    <input className="sr-only" readOnly inputMode="none" value="" tabIndex={-1} aria-hidden="true" />
    <div><h3 className="text-center text-xl font-black text-amber-950">Zapisz liczby, przesuń przecinki, potem podziel pisemnie</h3><p className="mt-1 text-center font-bold text-amber-950">Najpierw wpisz dane z zadania. Potem przesuń oba przecinki o tyle samo miejsc.</p></div>
    <div className="mx-auto w-fit rounded-xl border-2 border-amber-400 bg-white p-4 font-mono font-black text-slate-950"><div className="flex items-center justify-end gap-3">{cells(left, "left", "Dzielna", undefined, commaAfter(taskLeft))}<span className="text-3xl">:</span>{cells(right, "right", "Dzielnik", undefined, commaAfter(taskRight))}</div></div>
    {setupCorrect ? <div className="space-y-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4"><div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]"><p className="rounded-xl bg-white p-3 text-center text-xl font-black">{taskLeft} : {taskRight}</p><button type="button" disabled={readOnly || shiftCount >= requiredShifts} onClick={() => { setShiftCount((count) => count + 1); clear(); }} className="rounded-xl border-2 border-indigo-600 bg-indigo-600 px-4 py-3 font-black text-white">Przesuń oba przecinki o 1 miejsce →</button><p className="rounded-xl bg-emerald-50 p-3 text-center text-xl font-black">{shiftDecimalCommaRight(taskLeft, shiftCount)} : {shiftDecimalCommaRight(taskRight, shiftCount)}</p></div>{shiftCount === requiredShifts ? <div className="space-y-3"><p className="text-center font-black text-indigo-950">Teraz dzielimy pisemnie: {finalDividend} : {finalDivisor}</p><div className="mx-auto w-fit rounded-xl border-2 border-indigo-400 bg-white p-4 font-mono font-black text-slate-950"><div className="ml-auto w-fit border-b-2 border-slate-950 pb-2">{cells(quotient, "quotient", "Iloraz", undefined, commaAfter(result))}</div><div className="pt-2 text-right text-2xl">{finalDividend} : {finalDivisor}</div>{steps.map((step, index) => <div key={`${step.partial}-${index}`} className="mt-2 space-y-1 text-right"><p>{step.partial}</p>{cells(products[index] ?? [], "product", `Iloczyn do odjęcia, krok ${index + 1}`, index)}<div className="ml-auto w-48 border-t-2 border-slate-950" />{cells(remainders[index] ?? [], "remainder", `Liczba po odjęciu, krok ${index + 1}`, index)}</div>)}</div></div> : <p className="text-center font-bold text-indigo-950">Przesuwaj przecinki aż dzielnik będzie liczbą naturalną.</p>}</div> : <p className="rounded-xl bg-white p-3 text-center font-bold text-amber-950">Wpisz poprawnie obie liczby, aby przejść do przesuwania przecinków.</p>}
    {!readOnly ? <LessonNumericKeypad onKey={enter} onConfirm={check} label="Kalkulator do dzielenia w zadaniu tekstowym" helperText={shiftCount === requiredShifts && setupCorrect ? "Uzupełnij iloraz i kolejne kroki dzielenia, a potem zatwierdź." : "Wpisz liczby z treści zadania i przesuń przecinki."} /> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Dzielenie jest poprawne." : "Sprawdź liczby, przesunięcie przecinków oraz kolejne kroki dzielenia."}</p> : null}
  </section>;
}
