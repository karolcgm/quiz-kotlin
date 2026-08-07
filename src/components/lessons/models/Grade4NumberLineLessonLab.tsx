"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4NumberLineActivity = "information" | "practice";

export function grade4NumberLineActivityFromStageId(stageId: string): Grade4NumberLineActivity {
  return stageId.endsWith("-information") ? "information" : "practice";
}

type AxisTask = { start: number; step: number; pointIndexes: readonly number[] };

const TASKS: readonly AxisTask[] = [
  { start: 0, step: 1, pointIndexes: [2, 5, 8] },
  { start: 4, step: 1, pointIndexes: [2, 5, 8] },
  { start: 10, step: 1, pointIndexes: [2, 5, 8] },
  { start: 20, step: 2, pointIndexes: [2, 5, 8] },
  { start: 50, step: 5, pointIndexes: [2, 5, 8] },
  { start: 100, step: 10, pointIndexes: [2, 5, 8] },
];

interface Props {
  activity: Grade4NumberLineActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

const tickLeft = (index: number) => 6 + index * (82 / 8);

function Thermometer() {
  return <div className="flex items-center justify-center gap-5" aria-label="Termometr do mierzenia temperatury ciała">
    <div className="relative h-64 w-20">
      <div className="absolute bottom-10 left-1/2 h-48 w-8 -translate-x-1/2 rounded-full border-4 border-slate-700 bg-white">
        <div className="absolute bottom-1 left-1/2 h-28 w-3 -translate-x-1/2 rounded-full bg-rose-500" />
      </div>
      <div className="absolute bottom-0 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border-4 border-slate-700 bg-rose-500" />
    </div>
    <div className="flex h-48 flex-col-reverse justify-between py-1 text-sm font-black text-slate-700">
      {[35, 36, 37, 38, 39, 40, 41, 42].map((value) => <span key={value} className="flex items-center gap-2"><span className="h-0.5 w-5 bg-slate-600" />{value}°C</span>)}
    </div>
  </div>;
}

function AxisBase({ start, step, pointIndexes = [], values = [], activePoint = 0, readOnly = true, onPointClick }: { start: number; step: number; pointIndexes?: readonly number[]; values?: readonly string[]; activePoint?: number; readOnly?: boolean; onPointClick?: (pointPosition: number) => void }) {
  const letters = ["A", "B", "C"];
  return <div className="relative mx-auto h-56 w-full max-w-4xl" aria-label="Oś liczbowa ze strzałką po prawej stronie">
    <div className="absolute left-[6%] right-[6%] top-32 h-1 rounded-full bg-slate-800" aria-hidden />
    <div className="absolute right-[3.5%] top-[7.5rem] h-0 w-0 border-y-[10px] border-l-[20px] border-y-transparent border-l-slate-800" aria-hidden />
    {Array.from({ length: 9 }, (_, index) => {
      const left = tickLeft(index);
      const pointPosition = pointIndexes.indexOf(index);
      const known = index === 0 || index === 1;
      return <div key={index} className="absolute top-[7.15rem] -translate-x-1/2" style={{ left: `${left}%` }}>
        <span className="block h-7 w-1 rounded-full bg-slate-800" aria-hidden />
        {pointPosition >= 0 ? <span className="absolute left-1/2 top-[0.4rem] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-rose-500 shadow" aria-hidden /> : null}
        {known ? <span className="absolute left-1/2 top-9 -translate-x-1/2 text-lg font-black text-slate-950">{start + index * step}</span> : null}
        {pointPosition >= 0 ? <label className="absolute bottom-9 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-white p-1.5 font-black text-violet-950 shadow-lg ring-2 ring-violet-300">
          <span>{letters[pointPosition]} =</span>
          <input aria-label={`Współrzędna punktu ${letters[pointPosition]}`} value={values[pointPosition] ?? ""} inputMode="none" readOnly onClick={() => !readOnly && onPointClick?.(pointPosition)} className={`h-11 w-14 rounded-lg border-2 bg-white text-center text-lg font-black outline-none ${activePoint === pointPosition && !readOnly ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`} />
        </label> : null}
      </div>;
    })}
    <div className="absolute top-[10.8rem] h-7 border-x-2 border-b-2 border-violet-600" style={{ left: `${tickLeft(0)}%`, width: `${tickLeft(1) - tickLeft(0)}%` }} aria-hidden />
    <p className="absolute top-[12.7rem] -translate-x-1/2 whitespace-nowrap text-xs font-black text-violet-800" style={{ left: `${(tickLeft(0) + tickLeft(1)) / 2}%` }}>odcinek jednostkowy = {step}</p>
    <p className="absolute right-[1%] top-24 text-xs font-black text-slate-700">liczby rosną</p>
  </div>;
}

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 14" heading="Pierwsze spotkanie z osią liczbową" description="Oś przypomina podziałkę termometru: kreski są rozmieszczone równo, a liczby rosną w jednym kierunku.">
    <div className="space-y-5">
      <section className="grid gap-5 rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200 sm:grid-cols-[0.8fr_1.6fr]">
        <div><p className="mb-2 text-center text-lg font-black text-cyan-950">Termometr</p><Thermometer /></div>
        <div className="flex flex-col justify-center"><p className="text-center text-lg font-black text-cyan-950">Oś liczbowa</p><AxisBase start={0} step={1} /><p className="text-center font-bold text-slate-700">Na termometrze temperatura rośnie ku górze. Na osi strzałka po prawej stronie pokazuje, że liczby rosną w prawo.</p></div>
      </section>
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 text-center ring-2 ring-violet-200"><p className="text-xl font-black text-violet-900">Kreski</p><p className="mt-2 font-bold text-slate-700">Są ustawione w równych odstępach.</p></div>
        <div className="rounded-2xl bg-white p-4 text-center ring-2 ring-violet-200"><p className="text-xl font-black text-violet-900">Odcinek jednostkowy</p><p className="mt-2 font-bold text-slate-700">To odległość między kreską 0 i sąsiednią kreską 1.</p></div>
        <div className="rounded-2xl bg-white p-4 text-center ring-2 ring-violet-200"><p className="text-xl font-black text-violet-900">Strzałka</p><p className="mt-2 font-bold text-slate-700">Pokazuje kierunek, w którym liczby rosną.</p></div>
      </section>
    </div>
  </LessonTaskFrame>;
}

function PracticeSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: AxisTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const answers = task.pointIndexes.map((index) => task.start + index * task.step);
  const [values, setValues] = useState(() => task.pointIndexes.map(() => ""));
  const [activePoint, setActivePoint] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index !== activePoint ? value : key === "backspace" ? value.slice(0, -1) : value.length >= 3 ? value : `${value}${key}`));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) { setFeedback("missing"); return; }
    const correct = values.every((value, index) => Number(value) === answers[index]);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.map((value, index) => `${["A", "B", "C"][index]} = ${value}`).join(", "));
  };
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 14" heading="Odczytaj punkty z osi" description="Dwie sąsiednie kreski są opisane. Ustal wartość jednej działki i wpisz liczby w kratkach nad osią." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 px-3 pt-5 ring-2 ring-cyan-200">
        <p className="text-center font-black text-cyan-950">Odczytaj liczby zaznaczone punktami A, B i C.</p>
        <AxisBase start={task.start} step={task.step} pointIndexes={task.pointIndexes} values={values} activePoint={activePoint} readOnly={locked} onPointClick={setActivePoint} />
      </section>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do odczytywania osi" helperText="Dotknij kratki nad punktem, wpisz liczbę i uzupełnij wszystkie trzy punkty." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij kratki nad wszystkimi trzema punktami.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Wszystkie punkty zostały odczytane poprawnie.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawne wyniki to: A = {answers[0]}, B = {answers[1]}, C = {answers[2]}. Dziś bez punktu.</p> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4NumberLineLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = TASKS.length, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  const task = TASKS[Math.max(0, (questionNumber - 1) % TASKS.length)] ?? TASKS[Math.abs(taskSeed) % TASKS.length]!;
  return <PracticeSlide key={`${questionNumber}-${task.start}-${task.step}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
