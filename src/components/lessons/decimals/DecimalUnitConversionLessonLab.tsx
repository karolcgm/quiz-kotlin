"use client";

import { useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { areEquivalentDecimals, parseDecimalInput } from "@/lib/math/decimals";

export const DECIMAL_UNIT_LESSON_ACTIVITIES = ["length-units-ruler", "mass-units-theory", "unit-conversion-practice"] as const;
export type DecimalUnitLessonActivity = typeof DECIMAL_UNIT_LESSON_ACTIVITIES[number];

export function isDecimalUnitLessonActivity(value: string): value is DecimalUnitLessonActivity {
  return DECIMAL_UNIT_LESSON_ACTIVITIES.includes(value as DecimalUnitLessonActivity);
}

const CONVERSIONS = [
  { source: "8", from: "cm", target: "mm", answer: "80" },
  { source: "0,4", from: "cm", target: "mm", answer: "4" },
  { source: "3,5", from: "dm", target: "cm", answer: "35" },
  { source: "0,72", from: "m", target: "dm", answer: "7,2" },
  { source: "2500", from: "m", target: "km", answer: "2,5" },
  { source: "1,2", from: "km", target: "m", answer: "1200" },
  { source: "4,5", from: "kg", target: "dag", answer: "450" },
  { source: "0,08", from: "kg", target: "g", answer: "80" },
  { source: "36", from: "dag", target: "kg", answer: "0,36" },
  { source: "1250", from: "g", target: "kg", answer: "1,25" },
] as const;

type Props = {
  activity: DecimalUnitLessonActivity;
  seed: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
};

function decimal(value: number): string {
  return String(value).replace(".", ",");
}

function LengthRuler({ readOnly }: { readOnly: boolean }) {
  const [millimeters, setMillimeters] = useState(1250);
  const markerX = 50 + (millimeters / 3000) * 500;
  const displays = [
    [decimal(millimeters / 1_000_000), "km"],
    [decimal(millimeters / 1000), "m"],
    [decimal(millimeters / 100), "dm"],
    [decimal(millimeters / 10), "cm"],
    [String(millimeters), "mm"],
  ] as const;

  return <section className="grid gap-4">
    <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4">
      <p className="mb-3 text-center text-lg font-black">Przesuwaj znacznik po linijce</p>
      <div className="relative mx-auto max-w-4xl">
        <svg viewBox="0 0 600 180" role="img" aria-label={`Linijka wskazuje ${millimeters} milimetrów`} className="w-full">
          <rect x="40" y="58" width="520" height="70" rx="12" fill="white" stroke="#334155" strokeWidth="4" />
          {Array.from({ length: 31 }, (_, index) => {
            const x = 50 + (index / 30) * 500;
            const major = index % 5 === 0;
            return <g key={index}><line x1={x} x2={x} y1="61" y2={major ? 99 : 82} stroke="#334155" strokeWidth={major ? 3 : 1.5} />{major ? <text x={x} y="119" textAnchor="middle" fontSize="13" fontWeight="800">{decimal(index / 10)} m</text> : null}</g>;
          })}
          <line x1={markerX} x2={markerX} y1="25" y2="135" stroke="#c2410c" strokeWidth="7" />
          <circle cx={markerX} cy="25" r="12" fill="#fdba74" stroke="#9a3412" strokeWidth="3" />
          <text x={markerX} y="158" textAnchor="middle" fontSize="16" fontWeight="900">{decimal(millimeters / 1000)} m</text>
        </svg>
        {!readOnly ? <input type="range" min={0} max={3000} step={10} value={millimeters} aria-label="Przesuń znacznik na linijce" className="absolute left-[8%] top-[20%] h-[58%] w-[84%] cursor-ew-resize opacity-0" onChange={(event) => setMillimeters(Number(event.target.value))} /> : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-live="polite">
        {displays.map(([value, unit]) => <p key={unit} className="rounded-xl bg-white p-3 text-center shadow-sm"><b className="block text-lg">{value} {unit}</b><span className="text-xs text-slate-600">ta sama długość</span></p>)}
      </div>
    </div>
    <div className="rounded-2xl border-2 border-indigo-200 bg-white p-4 text-center">
      <p className="text-xl font-black">km → m → dm → cm → mm</p>
      <p className="mt-2 font-bold">1 km = 1000 m</p>
      <p className="font-bold">1 m = 10 dm = 100 cm = 1000 mm</p>
      <p className="font-bold">1 dm = 10 cm = 100 mm</p>
      <p className="font-bold">1 cm = 10 mm</p>
    </div>
  </section>;
}

function MassTheory() {
  return <section className="grid gap-4">
    <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5 text-center">
      <p className="text-2xl font-black">t → kg → dag → g</p>
      <p className="mt-4 text-xl font-black">1 t = 1000 kg</p>
      <p className="text-xl font-black">1 kg = 100 dag = 1000 g</p>
      <p className="text-xl font-black">1 dag = 10 g</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-4">
      {[["t", "tona"], ["kg", "kilogram"], ["dag", "dekagram"], ["g", "gram"]].map(([unit, name]) => <div key={unit} className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center"><b className="block text-3xl text-violet-800">{unit}</b><span className="font-bold">{name}</span></div>)}
    </div>
    <p className="rounded-xl bg-amber-50 p-4 text-center font-bold text-amber-950">Przechodząc do mniejszej jednostki, otrzymujemy większą liczbę. Przechodząc do większej jednostki, otrzymujemy mniejszą liczbę.</p>
  </section>;
}

export function DecimalUnitConversionLessonLab(props: Props) {
  return <DecimalUnitConversionRound key={`${props.activity}-${props.questionNumber ?? 1}`} {...props} />;
}

function DecimalUnitConversionRound({ activity, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: Props) {
  const task = CONVERSIONS[((questionNumber ?? 1) - 1) % CONVERSIONS.length]!;
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const title = activity === "length-units-ruler" ? "Jednostki długości" : activity === "mass-units-theory" ? "Jednostki masy" : "Zamiana jednostek";
  const description = activity === "length-units-ruler" ? "Ta sama długość może być zapisana w kilometrach, metrach, decymetrach, centymetrach lub milimetrach." : activity === "mass-units-theory" ? "Poznaj zależności między toną, kilogramem, dekagramem i gramem." : "Uzupełnij wynik. Jednostka docelowa jest już podana.";

  const clear = () => {
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    const entered = parseDecimalInput(input);
    const expected = parseDecimalInput(task.answer);
    const correct = entered.ok && expected.ok && areEquivalentDecimals(entered.value, expected.value);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${task.source} ${task.from} = ${input || "□"} ${task.target}`);
  };

  return <LessonTaskFrame eyebrow="Dział 5 · Ułamki dziesiętne" heading={title} description={description} questionNumber={questionNumber} questionCount={questionCount} contentClassName="grid gap-4" data-decimal-unit-lesson data-activity={activity} data-presentation-mode={presentationMode || undefined}>
    {activity === "length-units-ruler" ? <LengthRuler readOnly={readOnly} /> : null}
    {activity === "mass-units-theory" ? <MassTheory /> : null}
    {activity === "unit-conversion-practice" ? <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-3xl font-black">
        <span>{task.source} {task.from}</span><span>=</span><span className="min-w-28 rounded-xl border-2 border-emerald-400 bg-white px-4 py-2 text-center">{readOnly ? task.answer : input || "□"}</span><span>{task.target}</span>
      </div>
      {!readOnly ? <LessonNumericKeypad allowSeparator label="Kalkulator do zamiany jednostek" helperText="Wpisz tylko liczbę. Jednostka wyniku jest już podana." onKey={(key) => { setInput((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`); clear(); }} onConfirm={check} /> : null}
      {feedback === "correct" ? <p role="status" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 font-black text-emerald-900">✓ Poprawnie. Przejdź do następnego zadania.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">Sprawdź, czy przechodzisz do większej, czy do mniejszej jednostki.</p> : null}
    </section> : null}
  </LessonTaskFrame>;
}
