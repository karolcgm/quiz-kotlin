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

function MassTheory({ readOnly }: { readOnly: boolean }) {
  const [grams, setGrams] = useState(12_500);
  const displays = [
    [decimal(grams / 1_000_000), "t"],
    [decimal(grams / 1000), "kg"],
    [decimal(grams / 10), "dag"],
    [String(grams), "g"],
  ] as const;
  const load = grams < 5_000
    ? { label: "lekka paczka", color: "#67e8f9", width: 86, height: 50 }
    : grams < 15_000
      ? { label: "plecak", color: "#a78bfa", width: 104, height: 68 }
      : grams < 30_000
        ? { label: "walizka", color: "#fb923c", width: 122, height: 78 }
        : { label: "ciężka skrzynia", color: "#f87171", width: 142, height: 92 };

  return <section className="grid gap-4">
    <div className="rounded-2xl border-2 border-fuchsia-200 bg-fuchsia-50 p-4" data-mass-scale>
      <p className="mb-2 text-center text-lg font-black">Zwiększaj masę przedmiotu na szalce</p>
      <svg viewBox="0 0 640 285" role="img" aria-label={`Waga jest obciążona masą ${decimal(grams / 1000)} kilograma`} className="mx-auto w-full max-w-4xl">
        <path d="M275 246 L365 246 L342 132 L298 132 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="5" />
        <circle cx="320" cy="120" r="18" fill="#fbbf24" stroke="#92400e" strokeWidth="4" />
        <line x1="112" y1="120" x2="528" y2="120" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
        <line x1="155" y1="120" x2="118" y2="190" stroke="#64748b" strokeWidth="4" />
        <line x1="155" y1="120" x2="192" y2="190" stroke="#64748b" strokeWidth="4" />
        <path d="M78 190 Q155 232 232 190" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
        <line x1="485" y1="120" x2="448" y2="190" stroke="#64748b" strokeWidth="4" />
        <line x1="485" y1="120" x2="522" y2="190" stroke="#64748b" strokeWidth="4" />
        <path d="M408 190 Q485 232 562 190" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
        <rect x={155 - load.width / 2} y={190 - load.height} width={load.width} height={load.height} rx="12" fill={load.color} stroke="#334155" strokeWidth="4" />
        <path d={`M${155 - load.width / 2} ${190 - load.height + 18} H${155 + load.width / 2}`} stroke="#334155" strokeWidth="3" strokeDasharray="8 6" />
        <text x="155" y="178" textAnchor="middle" fontSize="13" fontWeight="900">{load.label}</text>
        <rect x="433" y="142" width="104" height="48" rx="10" fill="#ddd6fe" stroke="#5b21b6" strokeWidth="4" />
        <text x="485" y="173" textAnchor="middle" fontSize="17" fontWeight="900">{grams} g</text>
        <text x="320" y="276" textAnchor="middle" fontSize="18" fontWeight="900">Obie szalki mają tę samą masę</text>
      </svg>
      {!readOnly ? <input type="range" min={100} max={50_000} step={100} value={grams} aria-label="Zwiększ lub zmniejsz masę na szalce" className="w-full accent-fuchsia-700" onChange={(event) => setGrams(Number(event.target.value))} /> : null}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
        {displays.map(([value, unit]) => <p key={unit} className="rounded-xl bg-white p-3 text-center shadow-sm"><b className="block text-lg">{value} {unit}</b><span className="text-xs text-slate-600">ta sama masa</span></p>)}
      </div>
    </div>
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
    {activity === "mass-units-theory" ? <MassTheory readOnly={readOnly} /> : null}
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
