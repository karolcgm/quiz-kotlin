"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4OrderOfOperationsActivity = "information" | "practice";

export function grade4OrderOfOperationsActivityFromStageId(stageId: string): Grade4OrderOfOperationsActivity {
  return stageId.endsWith("-information") ? "information" : "practice";
}

type OperationStep = { label: string; answer: number; color: string };
type OrderTask = { expression: string; steps: OperationStep[]; hint: string };

const TASKS: OrderTask[] = [
  { expression: "3² + 4", steps: [{ label: "3²", answer: 9, color: "bg-fuchsia-100 ring-fuchsia-300" }, { label: "9 + 4", answer: 13, color: "bg-emerald-100 ring-emerald-300" }], hint: "Najpierw oblicz potęgę, a potem dodawanie." },
  { expression: "(14 − 8) · 3", steps: [{ label: "14 − 8", answer: 6, color: "bg-amber-100 ring-amber-300" }, { label: "6 · 3", answer: 18, color: "bg-cyan-100 ring-cyan-300" }], hint: "Najpierw działanie w nawiasie, potem mnożenie." },
  { expression: "20 : 5 · 2", steps: [{ label: "20 : 5", answer: 4, color: "bg-cyan-100 ring-cyan-300" }, { label: "4 · 2", answer: 8, color: "bg-cyan-100 ring-cyan-300" }], hint: "Dzielenie i mnożenie mają tę samą ważność, więc licz od lewej do prawej." },
  { expression: "18 − 6 + 4", steps: [{ label: "18 − 6", answer: 12, color: "bg-emerald-100 ring-emerald-300" }, { label: "12 + 4", answer: 16, color: "bg-emerald-100 ring-emerald-300" }], hint: "Odejmowanie i dodawanie mają tę samą ważność, więc licz od lewej do prawej." },
  { expression: "2² + 3 · 4", steps: [{ label: "2²", answer: 4, color: "bg-fuchsia-100 ring-fuchsia-300" }, { label: "3 · 4", answer: 12, color: "bg-cyan-100 ring-cyan-300" }, { label: "4 + 12", answer: 16, color: "bg-emerald-100 ring-emerald-300" }], hint: "Potęgę i mnożenie oblicz osobno. Na końcu dodaj otrzymane wyniki." },
  { expression: "30 − (8 + 4) : 3", steps: [{ label: "8 + 4", answer: 12, color: "bg-amber-100 ring-amber-300" }, { label: "12 : 3", answer: 4, color: "bg-cyan-100 ring-cyan-300" }, { label: "30 − 4", answer: 26, color: "bg-emerald-100 ring-emerald-300" }], hint: "Najpierw nawias, potem dzielenie, na końcu odejmowanie." },
  { expression: "(2 + 4)² : 9", steps: [{ label: "2 + 4", answer: 6, color: "bg-amber-100 ring-amber-300" }, { label: "6²", answer: 36, color: "bg-fuchsia-100 ring-fuchsia-300" }, { label: "36 : 9", answer: 4, color: "bg-cyan-100 ring-cyan-300" }], hint: "Najpierw otrzymaj liczbę z nawiasu. Dopiero tę liczbę podnieś do potęgi." },
  { expression: "48 : 8 + 2³", steps: [{ label: "2³", answer: 8, color: "bg-fuchsia-100 ring-fuchsia-300" }, { label: "48 : 8", answer: 6, color: "bg-cyan-100 ring-cyan-300" }, { label: "6 + 8", answer: 14, color: "bg-emerald-100 ring-emerald-300" }], hint: "Zapisz osobno wynik potęgi i dzielenia, a dopiero potem je dodaj." },
];

interface Props {
  activity: Grade4OrderOfOperationsActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function WorkedLine({ expression, result, accent }: { expression: string; result: string; accent: string }) {
  return <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
    <span className={`rounded-xl px-3 py-2 text-center text-xl font-black ring-2 ${accent}`}>{expression}</span>
    <span className="text-2xl font-black text-violet-600">→</span>
    <span className="text-center text-xl font-black text-slate-950">{result}</span>
  </div>;
}

function InformationSlide() {
  const rules = [
    ["1", "Nawiasy", "Oblicz to, co jest w nawiasie. W jego środku także zachowaj kolejność."],
    ["2", "Potęgi", "Oblicz kwadraty i sześciany liczb."],
    ["3", "Mnożenie i dzielenie", "Wykonuj od lewej do prawej."],
    ["4", "Dodawanie i odejmowanie", "Wykonuj od lewej do prawej."],
  ];
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 13" heading="Kolejność wykonywania działań" description="Nie licz wszystkiego w pamięci. Oblicz jeden fragment, zapisz jego wynik i dopiero przejdź niżej.">
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2">
        {rules.map(([number, title, body]) => <div key={number} className="grid grid-cols-[3rem_1fr] gap-3 rounded-2xl bg-violet-50 p-4 ring-2 ring-violet-200">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-700 text-xl font-black text-white">{number}</span>
          <div><p className="text-lg font-black text-violet-950">{title}</p><p className="mt-1 font-bold text-slate-700">{body}</p></div>
        </div>)}
      </section>
      <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Jeżeli w nawiasie występuje potęga, najpierw oblicz potęgę znajdującą się wewnątrz tego nawiasu.</p>
      <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
        <p className="mb-4 text-center text-sm font-black uppercase tracking-[.16em] text-cyan-900">Zapis schodkami</p>
        <div className="mx-auto max-w-2xl space-y-3">
          <WorkedLine expression="2² + (12 − 4)" result="4 + 8" accent="bg-fuchsia-100 ring-fuchsia-300" />
          <WorkedLine expression="4 + 8" result="12" accent="bg-emerald-100 ring-emerald-300" />
        </div>
        <p className="mt-4 text-center font-bold text-slate-700">Wyniki 4 i 8 zapisujemy pod obliczonymi fragmentami. Dzięki temu w następnym wierszu działanie jest krótsze.</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 text-center ring-2 ring-cyan-200"><p className="font-black text-cyan-900">Mnożenie i dzielenie — od lewej</p><p className="mt-2 text-xl font-black">24 : 6 · 3 = 4 · 3 = 12</p></div>
        <div className="rounded-2xl bg-white p-4 text-center ring-2 ring-emerald-200"><p className="font-black text-emerald-900">Dodawanie i odejmowanie — od lewej</p><p className="mt-2 text-xl font-black">18 − 7 + 5 = 11 + 5 = 16</p></div>
      </section>
    </div>
  </LessonTaskFrame>;
}

function PracticeSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: OrderTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [values, setValues] = useState(() => task.steps.map(() => ""));
  const [activeStep, setActiveStep] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index !== activeStep ? value : key === "backspace" ? value.slice(0, -1) : value.length >= 3 ? value : `${value}${key}`));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) { setFeedback("missing"); return; }
    const correct = values.every((value, index) => Number(value) === task.steps[index]?.answer);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, task.steps.map((step, index) => `${step.label} = ${values[index]}`).join(", "));
  };
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 13" heading="Oblicz schodkami" description="W każdej kratce wpisz tylko wynik działania zapisanego bezpośrednio nad nią." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <p className="rounded-3xl bg-amber-50 p-5 text-center text-3xl font-black text-amber-950 ring-2 ring-amber-200">{task.expression}</p>
      <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
        <p className="mb-4 text-center text-sm font-black uppercase tracking-[.16em] text-violet-800">Wyniki kolejnych działań</p>
        <div className={`grid gap-4 ${task.steps.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {task.steps.map((step, index) => <label key={`${step.label}-${index}`} className={`rounded-2xl p-4 text-center ring-2 ${step.color} ${activeStep === index && !locked ? "outline outline-4 outline-violet-600" : ""}`}>
            <span className="block text-xs font-black uppercase tracking-[.12em] text-slate-600">Krok {index + 1}</span>
            <span className="mt-2 block min-h-10 text-xl font-black text-slate-950">{step.label}</span>
            <span aria-hidden className="block text-2xl font-black text-violet-600">↓</span>
            <input aria-label={`Wynik kroku ${index + 1}: ${step.label}`} value={values[index]} inputMode="none" readOnly onClick={() => !locked && setActiveStep(index)} className="mt-1 h-14 w-full rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none" />
          </label>)}
        </div>
      </section>
      <p className="rounded-2xl bg-slate-100 p-3 text-center font-bold text-slate-700"><span className="font-black text-slate-950">Podpowiedź:</span> {task.hint}</p>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do obliczeń krok po kroku" helperText="Dotknij kratki pod wybranym działaniem i wpisz jego wynik." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wyniki wszystkich kroków.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Wszystkie kroki i wynik są poprawne.</p> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawne wyniki to: {task.steps.map((step) => `${step.label} = ${step.answer}`).join(", ")}. Dziś bez punktu.</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4OrderOfOperationsLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = TASKS.length, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  const task = TASKS[Math.max(0, (questionNumber - 1) % TASKS.length)] ?? TASKS[Math.abs(taskSeed) % TASKS.length]!;
  return <PracticeSlide key={`${questionNumber}-${task.expression}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
