"use client";

import { Fragment, useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createPublicDecimalNaturalDivideL1Task,
  isDecimalNaturalDivideL1Activity,
  validateDecimalNaturalDivideL1Answer,
  type DecimalNaturalDivideL1Activity,
  type DecimalNaturalDivideL1Task,
} from "@/lib/math/decimals/decimalNaturalDivideL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<DecimalNaturalDivideL1Activity, string> = {
  "decimal-natural-divide-mental": "Dzielenie w pamięci",
  "decimal-natural-divide-written": "Dzielenie pisemne",
  "decimal-natural-divide-story": "Zadania tekstowe",
};

type ActiveCell =
  | { row: "quotient"; index: number }
  | { row: "product" | "remainder"; step: number; index: number }
  | { row: "answer" }
  | null;

interface DivisionStep {
  product: string;
  next: string;
  end: number;
}

function commaPosition(value: string): number {
  const index = value.indexOf(",");
  return index === -1 ? value.replace(",", "").length : index;
}

function digitsOnly(value: string): string {
  return value.replace(",", "");
}

function buildSteps(rawDigits: string, divisor: number): DivisionStep[] {
  let collected = "";
  let started = false;
  const values: { product: string; remainder: number; end: number }[] = [];
  [...rawDigits].forEach((digit, index) => {
    collected = `${collected}${digit}`.replace(/^0+(?=\d)/u, "");
    const current = Number(collected || "0");
    if (!started && current < divisor && index < rawDigits.length - 1) return;
    started = true;
    const quotientDigit = Math.floor(current / divisor);
    const product = quotientDigit * divisor;
    const remainder = current - product;
    values.push({ product: String(product), remainder, end: index });
    collected = String(remainder);
  });
  return values.map((value, index) => ({
    product: value.product,
    next: index < values.length - 1 ? String(Number(`${value.remainder}${rawDigits[value.end + 1] ?? ""}`)) : String(value.remainder),
    end: value.end,
  }));
}

function Box({ value, active, onClick, small = false, label, readOnly = false }: { value: string; active?: boolean; onClick?: () => void; small?: boolean; label?: string; readOnly?: boolean }) {
  const className = `grid place-items-center rounded-lg border-2 bg-white font-mono font-black text-slate-950 ${small ? "h-8 w-8 text-base" : "h-11 w-11 text-2xl sm:h-12 sm:w-12 sm:text-3xl"} ${active ? "border-indigo-600 ring-4 ring-indigo-100" : small ? "border-amber-400" : "border-slate-400"}`;
  return onClick ? <button type="button" aria-label={label} disabled={readOnly} onClick={onClick} className={className}>{value}</button> : <span aria-label={label} className={className}>{value}</span>;
}

function DecimalStoryPicture({ kind }: { kind: NonNullable<DecimalNaturalDivideL1Task["pictureKind"]> }) {
  const label = { juice: "Butelki z sokiem", ribbon: "Równe części wstążki", paint: "Puszki z farbą", apples: "Skrzynki z jabłkami" }[kind];
  const palette = { juice: ["#f59e0b", "#fef3c7"], ribbon: ["#db2777", "#fce7f3"], paint: ["#0ea5e9", "#e0f2fe"], apples: ["#ef4444", "#fef2f2"] }[kind];
  return <svg viewBox="0 0 360 180" role="img" aria-label={label} className="h-auto w-full">
    <rect x="4" y="4" width="352" height="172" rx="24" fill={palette[1]} stroke={palette[0]} strokeWidth="4" />
    <path d="M46 133h268l-18 25H64z" fill="#a16207" opacity=".82" />
    {Array.from({ length: kind === "ribbon" ? 3 : kind === "apples" ? 8 : 6 }, (_, index) => {
      const x = 54 + index * (kind === "apples" ? 35 : 49);
      return kind === "ribbon" ? <path key={index} d={`M${x} 56c28-28 45 28 72 0`} fill="none" stroke={palette[0]} strokeWidth="13" strokeLinecap="round" />
        : kind === "apples" ? <g key={index} transform={`translate(${x} ${index % 2 ? 85 : 55})`}><circle r="15" fill={palette[0]} /><path d="M0-13c0-12 8-15 13-16" stroke="#166534" strokeWidth="4" /></g>
          : <g key={index} transform={`translate(${x} ${kind === "paint" ? 54 : 42})`}><path d="M7 0h24v18l8 14v72H-1V32l8-14z" fill={palette[0]} stroke="#334155" strokeWidth="3" /><path d="M3 56h32" stroke="white" strokeWidth="5" /></g>;
    })}
  </svg>;
}

function MentalExample() {
  return <section className="grid gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5 md:grid-cols-3">
    <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">8,4 : 2</p>
    <p className="rounded-xl bg-white p-4 text-center font-black">84 dziesiąte : 2 = 42 dziesiąte</p>
    <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">4,2</p>
  </section>;
}

function WrittenExample() {
  return <section className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <div><h3 className="text-xl font-black text-amber-950">Schemat dzielenia pisemnego</h3><p className="mt-2 font-bold text-amber-950">Iloraz zapisujemy nad dzielną. Przecinek w ilorazie zapisujemy dokładnie nad przecinkiem dzielnej. Pod dzielną wpisujemy kolejne iloczyny i liczby po sprowadzeniu.</p></div>
    <div className="mx-auto grid w-fit grid-cols-[2rem_repeat(4,3rem)_3rem] items-center gap-0 font-mono text-slate-950">
      <span /><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">0</span><span className="grid w-4 place-items-center text-3xl font-black">,</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">5</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">2</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">5</span><span />
      <span /><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-emerald-700 bg-white text-2xl font-black">4</span><span className="grid w-4 place-items-center text-3xl font-black">,</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-emerald-700 bg-white text-2xl font-black">2</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-amber-400 bg-amber-50 text-2xl font-black">0</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-amber-400 bg-amber-50 text-2xl font-black">0</span><span className="border-l-4 border-t-4 border-slate-950 px-3 py-2 text-2xl font-black">8</span>
      <span /><span /><span /><span className="col-span-3 border-b-4 border-slate-950" /><span />
      <span>−</span><span className="col-span-2" /><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">4</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">0</span><span /><span />
      <span /><span className="col-span-2" /><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">2</span><span className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-400 bg-white text-2xl font-black">0</span><span /><span />
    </div>
  </section>;
}

function DecimalLongDivision({ task, readOnly, onResultChange }: { task: DecimalNaturalDivideL1Task; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [appendedZeros, setAppendedZeros] = useState(readOnly ? task.appendedZeros : 0);
  const rawBase = digitsOnly(task.dividend);
  const decimalAfter = commaPosition(task.dividend);
  const rawDigits = `${rawBase}${"0".repeat(appendedZeros)}`;
  const resultDigits = digitsOnly(task.result);
  const resultCommaAfter = commaPosition(task.result);
  const quotientOffset = Math.max(0, decimalAfter - resultCommaAfter);
  const steps = useMemo(() => buildSteps(rawDigits, task.divisor), [rawDigits, task.divisor]);
  const [quotient, setQuotient] = useState<string[]>(() => readOnly ? [...resultDigits] : [...resultDigits].map(() => ""));
  const [products, setProducts] = useState<string[][]>(() => steps.map((step) => readOnly ? [...step.product] : step.product.split("").map(() => "")));
  const [remainders, setRemainders] = useState<string[][]>(() => steps.map((step) => readOnly ? [...step.next] : step.next.split("").map(() => "")));
  const [answer, setAnswer] = useState(readOnly ? task.result : "");
  const [active, setActive] = useState<ActiveCell>({ row: "quotient", index: 0 });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);

  const reset = (zeros: number) => {
    const nextSteps = buildSteps(`${rawBase}${"0".repeat(zeros)}`, task.divisor);
    setAppendedZeros(zeros); setQuotient([...resultDigits].map(() => "")); setProducts(nextSteps.map((step) => step.product.split("").map(() => ""))); setRemainders(nextSteps.map((step) => step.next.split("").map(() => ""))); setStatus(null); onResultChange?.(null);
  };
  const fill = (key: string) => {
    if (readOnly || !active) return;
    const value = key === "backspace" ? "" : key;
    if (active.row === "answer") { setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "," && current.includes(",") ? current : current.length < 8 ? `${current}${key}` : current); setStatus(null); onResultChange?.(null); return; }
    if (key === ",") return;
    const update = (rows: string[][], setter: (next: string[][]) => void, row: number, index: number, rowName: "product" | "remainder") => { const next = rows.map((cells, currentRow) => currentRow === row ? cells.map((cell, currentIndex) => currentIndex === index ? value : cell) : cells); setter(next); if (key !== "backspace") setActive({ row: rowName, step: row, index: Math.min(next[row]!.length - 1, index + 1) }); };
    if (active.row === "quotient") { const next = quotient.map((cell, index) => index === active.index ? value : cell); setQuotient(next); if (key !== "backspace") setActive({ row: "quotient", index: Math.min(next.length - 1, active.index + 1) }); }
    if (active.row === "product") update(products, setProducts, active.step, active.index, "product");
    if (active.row === "remainder") update(remainders, setRemainders, active.step, active.index, "remainder");
    setStatus(null); onResultChange?.(null);
  };
  const check = () => {
    const quotientText = `${quotient.slice(0, resultCommaAfter).join("")},${quotient.slice(resultCommaAfter).join("")}`;
    const writtenStepsCorrect = steps.every((step, index) => products[index]?.join("") === step.product && remainders[index]?.join("") === step.next);
    const correct = appendedZeros === task.appendedZeros && quotient.every(Boolean) && writtenStepsCorrect && validateDecimalNaturalDivideL1Answer(task, quotientText) && (!task.story || validateDecimalNaturalDivideL1Answer(task, answer));
    setStatus(correct ? "correct" : "wrong"); onResultChange?.(correct, task.story ? `${answer || "brak odpowiedzi"} ${task.answerUnit}` : quotientText);
  };
  const visualChars = [...rawDigits];
  visualChars.splice(decimalAfter, 0, ",");
  const rowCells = (value: string[], end: number, type: "product" | "remainder", step: number) => {
    const start = Math.max(0, end - value.length + 1);
    return visualChars.map((char, visualIndex) => {
      if (char === ",") return <span key={`comma-${type}-${step}-${visualIndex}`} className="grid w-4 place-items-center text-3xl font-black">,</span>;
      const numericIndex = visualIndex > decimalAfter ? visualIndex - 1 : visualIndex;
      const index = numericIndex - start;
      return index >= 0 && index < value.length ? <Box key={`${type}-${step}-${visualIndex}`} value={value[index] ?? ""} active={active?.row === type && active.step === step && active.index === index} onClick={() => setActive({ row: type, step, index })} label={`${type === "product" ? "Iloczyn do odjęcia" : "Liczba po sprowadzeniu"}, krok ${step + 1}, cyfra ${index + 1}`} readOnly={readOnly} /> : <span key={`empty-${type}-${step}-${visualIndex}`} className="h-11 w-11 sm:h-12 sm:w-12" />;
    });
  };
  const quotientBoxes = visualChars.map((character, visualIndex) => {
    if (character === ",") return <span key={`quotient-comma-${visualIndex}`} className="grid w-4 place-items-center text-3xl font-black">,</span>;
    const numericIndex = visualIndex > decimalAfter ? visualIndex - 1 : visualIndex;
    const digitIndex = numericIndex - quotientOffset;
    return digitIndex >= 0 && digitIndex < quotient.length
      ? <Box key={`quotient-${digitIndex}`} value={quotient[digitIndex] ?? ""} active={active?.row === "quotient" && active.index === digitIndex} onClick={() => setActive({ row: "quotient", index: digitIndex })} label={`Iloraz, cyfra ${digitIndex + 1}`} readOnly={readOnly} />
      : <span key={`quotient-empty-${visualIndex}`} className="h-11 w-11 sm:h-12 sm:w-12" />;
  });
  return <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-amber-50 p-3 font-black text-amber-950"><span>Gdy potrzebujesz kolejnej cyfry po przecinku:</span><button type="button" disabled={readOnly || appendedZeros >= task.appendedZeros} onClick={() => reset(appendedZeros + 1)} className="rounded-xl border-2 border-amber-500 bg-white px-4 py-2 disabled:opacity-40">Dopisz 0</button><span>Dopisano: {appendedZeros}</span></div>
    <div className="overflow-x-auto pb-2"><div className="mx-auto grid w-fit items-center gap-0" style={{ gridTemplateColumns: `2rem ${visualChars.map((char) => char === "," ? "1rem" : "3rem").join(" ")} 3rem` }} aria-label={`Dzielenie pisemne ${task.dividend} przez ${task.divisor}`} data-decimal-long-division>
      <span />{quotientBoxes}<span />
      <span />{visualChars.map((char, index) => char === "," ? <span key={`div-comma-${index}`} className="grid w-4 place-items-center text-3xl font-black">,</span> : <Box key={`div-${index}`} value={char} label={`Dzielna: ${char}`} />)}<span className="border-l-4 border-t-4 border-slate-950 px-3 py-2 text-2xl font-black">{task.divisor}</span>
      <span />{visualChars.map((_, index) => <span key={`line-${index}`} className="h-2 border-b-2 border-slate-900" />)}<span />
      {steps.map((step, index) => <Fragment key={`step-${index}`}><span className="grid h-11 place-items-center text-2xl font-black">−</span>{rowCells(products[index] ?? [], step.end, "product", index)}<span /> <span />{rowCells(remainders[index] ?? [], Math.min(rawDigits.length - 1, step.end + 1), "remainder", index)}<span /></Fragment>)}
    </div></div>
    {task.story ? <button type="button" disabled={readOnly} onClick={() => setActive({ row: "answer" })} className={`mx-auto flex min-h-14 max-w-md items-center gap-3 rounded-xl border-2 bg-emerald-50 px-4 text-lg font-black text-emerald-950 ${active?.row === "answer" ? "border-emerald-700 ring-4 ring-emerald-100" : "border-emerald-300"}`}><span>Odpowiedź:</span><span className="min-w-24 rounded-lg bg-white px-3 py-1 text-2xl">{answer}</span><span>{task.answerUnit}</span></button> : null}
    {!readOnly ? <LessonNumericKeypad allowSeparator={active?.row === "answer"} onKey={fill} onConfirm={check} label="Kalkulator do dzielenia pisemnego" helperText={active?.row === "quotient" ? "Uzupełnij iloraz. Przecinek jest ustawiony nad przecinkiem dzielnej." : active?.row === "product" ? "Wpisz iloczyn, który odejmujesz." : active?.row === "remainder" ? "Wpisz liczbę po odjęciu i sprowadzeniu kolejnej cyfry." : "Wpisz odpowiedź liczbową."} /> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Wszystkie kroki dzielenia są poprawne." : "Sprawdź dopisane zera, iloczyny do odjęcia, liczby po sprowadzeniu i iloraz."}</p> : null}
  </section>;
}

export interface DecimalNaturalDivideL1LabProps { activity: DecimalNaturalDivideL1Activity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }
export { isDecimalNaturalDivideL1Activity };

export function DecimalNaturalDivideL1Lab(props: DecimalNaturalDivideL1LabProps) { return <DecimalNaturalDivideRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />; }

function DecimalNaturalDivideRound({ activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalNaturalDivideL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalNaturalDivideL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const [mentalAnswer, setMentalAnswer] = useState(readOnly ? task.result : "");
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const checkMental = () => { const correct = validateDecimalNaturalDivideL1Answer(task, mentalAnswer); setStatus(correct ? "correct" : "wrong"); onResultChange?.(correct, mentalAnswer); };
  const updateMental = (key: string) => { if (readOnly) return; setMentalAnswer((value) => key === "backspace" ? value.slice(0, -1) : key === "," && value.includes(",") ? value : value.length < 8 ? `${value}${key}` : value); setStatus(null); onResultChange?.(null); };
  return <LessonTaskFrame className="space-y-5" contentClassName="space-y-5" eyebrow="Dział 5 · Ułamki dziesiętne" heading={TITLES[activity]} description={activity === "decimal-natural-divide-mental" ? "Oblicz proste ilorazy w pamięci." : activity === "decimal-natural-divide-story" ? "Przeczytaj treść, zapisz dzielenie pisemne w kratkach i uzupełnij odpowiedź." : "Wpisuj kolejne kroki tak, jak w dzieleniu pisemnym liczb naturalnych."} questionNumber={questionNumber} questionCount={questionCount} data-decimal-natural-divide-l1 data-decimal-activity={activity} data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined}>
    {activity === "decimal-natural-divide-mental" ? <MentalExample /> : activity === "decimal-natural-divide-written" ? <WrittenExample /> : null}
    {activity === "decimal-natural-divide-story" && task.story && task.storyQuestion && task.pictureKind ? <section className="space-y-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5"><div><h3 className="text-xl font-black text-emerald-950">Przeczytaj zadanie</h3><p className="mt-2 text-lg font-bold text-emerald-950">{task.story}</p><p className="mt-2 text-lg font-black text-emerald-950">{task.storyQuestion}</p></div><div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-200 bg-white"><DecimalStoryPicture kind={task.pictureKind} /></div></section> : null}
    {activity === "decimal-natural-divide-mental" ? <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-5"><p className="text-center text-3xl font-black">{task.dividend} : {task.divisor} =</p><button type="button" disabled={readOnly} onClick={() => undefined} className="mx-auto grid min-h-14 w-40 place-items-center rounded-xl border-2 border-slate-400 bg-white px-3 text-3xl font-black">{mentalAnswer}</button>{!readOnly ? <LessonNumericKeypad allowSeparator onKey={updateMental} onConfirm={checkMental} label="Kalkulator do dzielenia w pamięci" helperText="Wpisz wynik i zatwierdź." /> : null}{status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze!" : "Sprawdź wynik."}</p> : null}</section> : <DecimalLongDivision task={task} readOnly={readOnly} onResultChange={onResultChange} />}
  </LessonTaskFrame>;
}
