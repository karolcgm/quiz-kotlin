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

function StackedFraction({ numerator, denominator }: { numerator: number; denominator: number }) {
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
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Tyle pól oznacza podany procent." : `Sprawdź liczbę zaznaczonych pól. Potrzebujesz ${task.percent} pól.`}</p> : null}
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
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Ta część całości odpowiada podanemu procentowi." : "Sprawdź, jaką część całości opisuje zadanie."}</p> : null}
  </div>;
}

export function PercentFractionL1Lab({ activity, seed, taskSeed, difficulty = "core", readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPercentFractionL1Task({ seed: effectiveSeed, activity, difficulty }), [activity, difficulty, effectiveSeed]);
  return <LessonTaskFrame eyebrow="Dział 5 · Ułamki dziesiętne" heading={activity === "percent-remember" ? "Procenty a ułamki" : activity === "percent-grid" ? "Zaznacz procent na kratownicy" : "Zadania tekstowe z procentami"} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount} className="space-y-5" contentClassName="space-y-5" data-percent-fraction-l1 data-percent-activity={activity} data-seed={effectiveSeed}>
    {activity === "percent-remember" ? <PercentageRemember /> : activity === "percent-grid" ? <PercentGridRound key={`${activity}-${effectiveSeed}`} task={task} readOnly={readOnly} onResultChange={onResultChange} /> : <PercentStoryRound key={`${activity}-${effectiveSeed}`} task={task} readOnly={readOnly} onResultChange={onResultChange} />}
  </LessonTaskFrame>;
}

export { isPercentFractionL1Activity };
