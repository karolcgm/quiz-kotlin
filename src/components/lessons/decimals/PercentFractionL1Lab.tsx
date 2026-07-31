"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createPercentFractionL1Task, isPercentFractionL1Activity, type PercentFractionL1Activity } from "@/lib/math/decimals/percentFractionL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface Props {
  activity: PercentFractionL1Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

const BASIC_PERCENTAGES = [
  { percent: 10, numerator: 1, denominator: 10, decimal: "0,1" },
  { percent: 20, numerator: 1, denominator: 5, decimal: "0,2" },
  { percent: 25, numerator: 1, denominator: 4, decimal: "0,25" },
  { percent: 50, numerator: 1, denominator: 2, decimal: "0,5" },
  { percent: 100, numerator: 1, denominator: 1, decimal: "1,0" },
] as const;

const GRADE_SIX_PERCENTAGES = [
  { percent: 1, numerator: 1, denominator: 100, decimal: "0,01" },
  { percent: 5, numerator: 1, denominator: 20, decimal: "0,05" },
  { percent: 10, numerator: 1, denominator: 10, decimal: "0,1" },
  { percent: 20, numerator: 1, denominator: 5, decimal: "0,2" },
  { percent: 25, numerator: 1, denominator: 4, decimal: "0,25" },
  { percent: 50, numerator: 1, denominator: 2, decimal: "0,5" },
  { percent: 75, numerator: 3, denominator: 4, decimal: "0,75" },
  { percent: 100, numerator: 1, denominator: 1, decimal: "1" },
] as const;

function StackedFraction({ numerator, denominator }: { numerator: number | string; denominator: number | string }) {
  return <span className="inline-grid min-w-9 grid-rows-2 text-center leading-none" aria-label={`${numerator} przez ${denominator}`}><span className="border-b-2 border-current px-1 pb-1">{numerator}</span><span className="px-1 pt-1">{denominator}</span></span>;
}

function PercentCircle({ percent }: { percent: number }) {
  const radius = 48;
  const center = 60;
  const angle = (percent / 100) * 360;
  const endAngle = (angle - 90) * (Math.PI / 180);
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);
  const sectorPath = percent === 100
    ? undefined
    : `M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY} Z`;

  return <svg
    viewBox="0 0 120 120"
    role="img"
    aria-label={`Koło z zaznaczonymi ${percent} procentami`}
    className="h-24 w-24 shrink-0 drop-shadow-sm sm:h-28 sm:w-28"
    data-percent-circle={percent}
  >
    <circle cx={center} cy={center} r={radius} fill="#eef2ff" />
    {percent === 100
      ? <circle cx={center} cy={center} r={radius} fill="#4f46e5" />
      : <path d={sectorPath} fill="#4f46e5" />}
    <circle cx={center} cy={center} r={radius} fill="none" stroke="#312e81" strokeWidth="4" />
    {percent < 100 ? <>
      <line x1={center} y1={center} x2={center} y2={center - radius} stroke="#312e81" strokeWidth="2.5" />
      <line x1={center} y1={center} x2={endX} y2={endY} stroke="#312e81" strokeWidth="2.5" />
    </> : null}
    <circle cx={center} cy={center} r="3.5" fill="#312e81" />
  </svg>;
}

function PercentageRemember() {
  const rows = [BASIC_PERCENTAGES.slice(0, 2), BASIC_PERCENTAGES.slice(2, 4), BASIC_PERCENTAGES.slice(4)] as const;

  return <div className="space-y-5">
    <p className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center text-lg font-black text-amber-950">Procent oznacza część ze stu. Te pięć zapisów warto zapamiętać.</p>
    <div className="space-y-4" data-percent-remember-rows>
      {rows.map((row, rowIndex) => <div key={rowIndex} data-percent-remember-row className={`grid gap-4 ${row.length === 2 ? "sm:grid-cols-2" : "mx-auto max-w-xl"}`}>
        {row.map((item) => <div key={item.percent} className="grid min-h-36 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 p-4 shadow-sm sm:gap-5">
          <PercentCircle percent={item.percent} />
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xl font-black text-slate-950 sm:text-2xl">
            <span className="text-indigo-800">{item.percent}%</span><span>=</span><StackedFraction numerator={item.numerator} denominator={item.denominator} /><span>=</span><span>{item.decimal}</span>
          </div>
        </div>)}
      </div>)}
    </div>
  </div>;
}

function GradeSixPercentageRemember() {
  const rows = [
    GRADE_SIX_PERCENTAGES.slice(0, 3),
    GRADE_SIX_PERCENTAGES.slice(3, 6),
    GRADE_SIX_PERCENTAGES.slice(6),
  ] as const;

  return <div className="space-y-5">
    <section className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 text-center text-amber-950 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[.14em] text-amber-700">Najważniejsza informacja</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-3xl font-black">
        <span className="text-indigo-800">1%</span>
        <span>=</span>
        <StackedFraction numerator={1} denominator={100} />
        <span>=</span>
        <span>0,01</span>
      </div>
      <p className="mt-3 text-base font-bold">Jeden procent oznacza jedną setną całości.</p>
    </section>

    <div className="space-y-4" data-percent-six-remember-rows>
      {rows.map((row, rowIndex) => <div key={rowIndex} className={`grid gap-3 ${row.length === 3 ? "sm:grid-cols-3" : "mx-auto max-w-2xl sm:grid-cols-2"}`}>
        {row.map((item) => <div key={item.percent} className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 p-4 text-center shadow-sm">
          <span className="text-2xl font-black text-indigo-800">{item.percent}%</span>
          <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-black text-slate-950">
            <StackedFraction numerator={item.numerator} denominator={item.denominator} />
            <span>=</span>
            <span>{item.decimal}</span>
          </div>
        </div>)}
      </div>)}
    </div>
  </div>;
}

type ConversionField = "numerator" | "denominator" | "decimal";

function normalizeDecimal(value: string): number | null {
  if (!/^\d+(?:[,.]\d+)?$/u.test(value)) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function PercentConversionRound({ task, readOnly, onResultChange }: { task: ReturnType<typeof createPercentFractionL1Task>; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [numerator, setNumerator] = useState(readOnly ? String(task.numerator) : "");
  const [denominator, setDenominator] = useState(readOnly ? String(task.denominator) : "");
  const [decimal, setDecimal] = useState(readOnly ? task.decimal : "");
  const [activeField, setActiveField] = useState<ConversionField>("numerator");
  const [status, setStatus] = useState<"missing" | "correct" | "wrong" | null>(null);

  const clearResult = () => {
    setStatus(null);
    onResultChange?.(null);
  };
  const updateField = (key: string) => {
    if (readOnly) return;
    const update = (current: string, maxLength: number, allowSeparator: boolean) => {
      if (key === "backspace") return current.slice(0, -1);
      if (key === ",") {
        if (!allowSeparator || current.includes(",") || current.includes(".")) return current;
        return current.length === 0 ? "0," : `${current},`;
      }
      return current.length < maxLength ? `${current}${key}` : current;
    };
    if (activeField === "numerator") setNumerator((current) => update(current, 3, false));
    if (activeField === "denominator") setDenominator((current) => update(current, 3, false));
    if (activeField === "decimal") setDecimal((current) => update(current, 5, true));
    clearResult();
  };
  const check = () => {
    if (!numerator || !denominator || !decimal || decimal.endsWith(",")) {
      setStatus("missing");
      onResultChange?.(null);
      return;
    }
    const decimalValue = normalizeDecimal(decimal);
    const expectedDecimal = normalizeDecimal(task.decimal);
    const correct = Number(numerator) === task.numerator
      && Number(denominator) === task.denominator
      && decimalValue !== null
      && expectedDecimal !== null
      && Math.abs(decimalValue - expectedDecimal) < 1e-9;
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, `${task.percent}%`);
  };

  const fieldClass = (field: ConversionField) => `flex min-h-14 min-w-16 items-center justify-center rounded-xl border-2 bg-white px-3 text-2xl font-black text-slate-950 ${
    activeField === field ? "border-cyan-500 ring-4 ring-cyan-100" : "border-indigo-300"
  }`;

  return <div className="space-y-5">
    <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-5">
      <p className="text-center text-lg font-bold text-slate-700">Zapisz procent jako nieskracalny ułamek zwykły i ułamek dziesiętny.</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-3xl font-black text-slate-950">
        <span className="rounded-2xl bg-indigo-700 px-5 py-3 text-white">{task.percent}%</span>
        <span>=</span>
        <span className="inline-grid grid-rows-2 items-center">
          <button type="button" disabled={readOnly} onClick={() => setActiveField("numerator")} aria-label="Licznik ułamka zwykłego" className={`${fieldClass("numerator")} border-b-slate-950`}>{numerator || "□"}</button>
          <button type="button" disabled={readOnly} onClick={() => setActiveField("denominator")} aria-label="Mianownik ułamka zwykłego" className={fieldClass("denominator")}>{denominator || "□"}</button>
        </span>
        <span>=</span>
        <button type="button" disabled={readOnly} onClick={() => setActiveField("decimal")} aria-label="Ułamek dziesiętny" className={`${fieldClass("decimal")} min-w-28`}>{decimal || "□"}</button>
      </div>
    </section>

    {!readOnly ? <LessonNumericKeypad
      onKey={updateField}
      onConfirm={check}
      allowSeparator
      label="Klawiatura do zamiany procentów"
      helperText="Wybierz kratkę, wpisz liczby i zatwierdź wszystkie pola raz na końcu."
    /> : null}

    {status === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij licznik, mianownik i ułamek dziesiętny.</p> : null}
    {status === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! Procent ma oba poprawne zapisy.</p> : null}
    {status === "wrong" ? <div role="status" className="rounded-xl bg-amber-50 p-4 text-center font-black text-amber-950">
      <span>Spróbuj innym razem. Poprawny wynik to </span>
      <span className="inline-flex items-center gap-2"><StackedFraction numerator={task.numerator} denominator={task.denominator} /><span>= {task.decimal}. Dziś bez punktu.</span></span>
    </div> : null}
  </div>;
}

function PercentGridRound({ task, readOnly, onResultChange }: { task: ReturnType<typeof createPercentFractionL1Task>; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<Set<number>>(() => readOnly ? new Set(Array.from({ length: task.percent }, (_, index) => index)) : new Set());
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const toggle = (index: number) => {
    if (readOnly) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
    setStatus(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (selected.size === 0) {
      setStatus(null);
      onResultChange?.(null);
      return;
    }
    const correct = selected.size === task.percent;
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, `${selected.size}%`);
  };
  return <div className="space-y-4">
    <div className="rounded-2xl bg-cyan-50 p-4 text-center text-xl font-black text-cyan-950">Zamaluj <span className="text-3xl">{task.percent}%</span>, czyli {task.percent} ze 100 pól.</div>
    <div className="mx-auto grid w-full max-w-[32rem] grid-cols-10 gap-1 rounded-2xl border-4 border-slate-700 bg-slate-700 p-1.5" role="group" aria-label={`Kratownica 10 na 10. Zaznacz ${task.percent} procent.`}>
      {Array.from({ length: 100 }, (_, index) => <button key={index} type="button" disabled={readOnly} onClick={() => toggle(index)} aria-pressed={selected.has(index)} aria-label={`Pole ${index + 1}${selected.has(index) ? ", zaznaczone" : ""}`} className={`aspect-square rounded-sm border border-slate-300 transition ${selected.has(index) ? "bg-cyan-500" : "bg-white hover:bg-cyan-100"} disabled:cursor-default`} />)}
    </div>
    <p className="text-center font-bold text-slate-700" aria-live="polite">Zaznaczono: {selected.size} ze 100 pól = {selected.size}%.</p>
    {!readOnly ? <button type="button" onClick={check} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-500">Zatwierdź</button> : null}
    {selected.size === 0 && status === null ? <p className="text-center text-sm font-bold text-slate-600">Zaznacz pola przed zatwierdzeniem.</p> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-amber-50 text-amber-950"}`}>{status === "correct" ? "Dobrze! Tyle pól oznacza podany procent." : `Spróbuj innym razem. Poprawny wynik to ${task.percent} zaznaczonych pól. Dziś bez punktu.`}</p> : null}
  </div>;
}

function PercentStoryRound({ task, readOnly, onResultChange }: { task: ReturnType<typeof createPercentFractionL1Task>; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [answer, setAnswer] = useState(readOnly ? String(task.percent) : "");
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const update = (key: string) => {
    if (readOnly) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length < 3 ? `${current}${key}` : current);
    setStatus(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (!answer) {
      setStatus(null);
      onResultChange?.(null);
      return;
    }
    const correct = Number(answer) === task.percent;
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, `${answer || "brak"}%`);
  };
  return <div className="space-y-4">
    <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
      <p className="text-xl font-black leading-relaxed">{task.story}</p>
      <p className="mt-3 text-lg font-bold">{task.question}</p>
    </section>
    <p className="rounded-xl bg-slate-100 p-3 text-center font-bold text-slate-700">Zapisz w myśli: <StackedFraction numerator={task.numerator} denominator={task.denominator} /> całości = … %.</p>
    <button type="button" disabled={readOnly} onClick={() => undefined} aria-label="Odpowiedź w procentach" className="mx-auto flex min-h-16 min-w-40 items-center justify-center rounded-2xl border-2 border-indigo-500 bg-white px-4 text-3xl font-black text-slate-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-500">{answer || "□"}<span className="ml-1">%</span></button>
    {!readOnly ? <LessonNumericKeypad onKey={update} onConfirm={check} label="Kalkulator do procentów" helperText="Wpisz liczbę procentów. Znak % jest już zapisany obok kratki." /> : null}
    {!answer && status === null ? <p className="text-center text-sm font-bold text-slate-600">Wpisz liczbę procentów przed zatwierdzeniem.</p> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-amber-50 text-amber-950"}`}>{status === "correct" ? "Dobrze! Ta część całości odpowiada podanemu procentowi." : `Spróbuj innym razem. Poprawny wynik to ${task.percent}%. Dziś bez punktu.`}</p> : null}
  </div>;
}

export function PercentFractionL1Lab({ activity, seed, taskSeed, difficulty = "core", readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPercentFractionL1Task({ seed: effectiveSeed, activity, difficulty }), [activity, difficulty, effectiveSeed]);
  const gradeSix = activity.startsWith("percent-six-");
  const heading = activity === "percent-remember" || activity === "percent-six-remember"
    ? "Procenty a ułamki"
    : activity === "percent-six-convert"
      ? "Zamiana procentów na ułamki"
      : activity === "percent-grid" || activity === "percent-six-grid"
        ? "Zaznacz procent na kratownicy"
        : "Zadania tekstowe z procentami";
  return <LessonTaskFrame eyebrow={gradeSix ? "Dział 6 · Procenty" : "Dział 5 · Ułamki dziesiętne"} heading={heading} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount} className="space-y-5" contentClassName="space-y-5" data-percent-fraction-l1 data-percent-activity={activity} data-seed={effectiveSeed}>
    {activity === "percent-remember" ? <PercentageRemember /> : null}
    {activity === "percent-six-remember" ? <GradeSixPercentageRemember /> : null}
    {activity === "percent-six-convert" ? <PercentConversionRound key={`${activity}-${effectiveSeed}`} task={task} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {activity === "percent-grid" || activity === "percent-six-grid" ? <PercentGridRound key={`${activity}-${effectiveSeed}`} task={task} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {activity === "percent-story" || activity === "percent-six-story" ? <PercentStoryRound key={`${activity}-${effectiveSeed}`} task={task} readOnly={readOnly} onResultChange={onResultChange} /> : null}
  </LessonTaskFrame>;
}

export { isPercentFractionL1Activity };
