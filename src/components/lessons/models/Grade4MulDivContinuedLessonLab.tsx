"use client";

import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4MulDivContinuedActivity = "information" | "multiply" | "divide" | "mixed";

export function grade4MulDivContinuedActivityFromStageId(stageId: string): Grade4MulDivContinuedActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-divide")) return "divide";
  if (stageId.endsWith("-mixed")) return "mixed";
  return "multiply";
}

type Task = {
  expression: string;
  answer: number;
  hint: string;
};

const MULTIPLY_TASKS: Task[] = [
  { expression: "3 · 24", answer: 72, hint: "Oblicz 3 · 20, potem 3 · 4 i dodaj wyniki." },
  { expression: "5 · 16", answer: 80, hint: "Rozbij 16 na 10 i 6." },
  { expression: "4 · 23", answer: 92, hint: "Oblicz 4 · 20 + 4 · 3." },
  { expression: "6 · 14", answer: 84, hint: "Oblicz 6 · 10 + 6 · 4." },
  { expression: "7 · 12", answer: 84, hint: "Rozbij 12 na 10 i 2." },
  { expression: "8 · 15", answer: 120, hint: "Oblicz 8 · 10 + 8 · 5." },
];

const DIVIDE_TASKS: Task[] = [
  { expression: "78 : 6", answer: 13, hint: "Rozbij 78 na 60 i 18." },
  { expression: "84 : 7", answer: 12, hint: "Rozbij 84 na 70 i 14." },
  { expression: "96 : 8", answer: 12, hint: "Rozbij 96 na 80 i 16." },
  { expression: "75 : 5", answer: 15, hint: "Rozbij 75 na 50 i 25." },
  { expression: "68 : 4", answer: 17, hint: "Rozbij 68 na 40 i 28." },
  { expression: "91 : 7", answer: 13, hint: "Rozbij 91 na 70 i 21." },
];

const MIXED_TASKS: Task[] = [
  { expression: "9 · 13", answer: 117, hint: "Rozbij 13 na 10 i 3." },
  { expression: "88 : 8", answer: 11, hint: "Rozbij 88 na 80 i 8." },
  { expression: "4 · 32", answer: 128, hint: "Rozbij 32 na 30 i 2." },
  { expression: "69 : 3", answer: 23, hint: "Rozbij 69 na 60 i 9." },
  { expression: "6 · 17", answer: 102, hint: "Rozbij 17 na 10 i 7." },
  { expression: "85 : 5", answer: 17, hint: "Rozbij 85 na 50 i 35." },
];

interface Props {
  activity: Grade4MulDivContinuedActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function InformationSlide() {
  return <LessonTaskFrame
    eyebrow="Dział 1 · Temat 5"
    heading="Mnożenie i dzielenie trudniejszych liczb"
    description="Rozbijamy liczbę na takie części, które łatwo pomnożyć albo podzielić."
  >
    <div className="space-y-4">
      <section className="rounded-3xl bg-emerald-50 p-4 ring-2 ring-emerald-200">
        <h3 className="text-center text-lg font-black text-emerald-950">Liczba jednocyfrowa razy dwucyfrowa</h3>
        <p className="mt-1 text-center text-sm font-bold text-emerald-800">Rozbijamy liczbę dwucyfrową na dziesiątki i jedności.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center font-black">
          <div className="rounded-2xl bg-white p-3"><b className="text-emerald-700">1. Rozbij</b><p className="mt-2 whitespace-nowrap text-lg sm:text-xl">14 = 10 + 4</p></div>
          <div className="rounded-2xl bg-white p-3"><b className="text-emerald-700">2. Pomnóż</b><p className="mt-2 whitespace-nowrap text-lg sm:text-xl">6 · 10 + 6 · 4</p></div>
          <div className="rounded-2xl bg-white p-3"><b className="text-emerald-700">3. Dodaj</b><p className="mt-2 whitespace-nowrap text-lg sm:text-xl">60 + 24</p></div>
          <div className="rounded-2xl bg-white p-3"><b className="text-emerald-700">Wynik</b><p className="mt-2 whitespace-nowrap text-lg sm:text-xl">6 · 14 = 84</p></div>
        </div>
      </section>

      <section className="rounded-3xl bg-amber-50 p-4 ring-2 ring-amber-200">
        <h3 className="text-center text-lg font-black text-amber-950">Dzielenie przez rozbijanie dzielnej</h3>
        <p className="mt-1 text-center text-sm font-bold text-amber-800">Wybieramy części, które osobno dzielą się przez dzielnik.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center font-black">
          <div className="rounded-2xl bg-white p-3"><b className="text-amber-700">1. Rozbij</b><p className="mt-2 whitespace-nowrap text-lg sm:text-xl">78 = 60 + 18</p></div>
          <div className="rounded-2xl bg-white p-3"><b className="text-amber-700">2. Podziel</b><p className="mt-2 whitespace-nowrap text-base sm:text-xl">60 : 6 + 18 : 6</p></div>
          <div className="rounded-2xl bg-white p-3"><b className="text-amber-700">3. Dodaj</b><p className="mt-2 whitespace-nowrap text-lg sm:text-xl">10 + 3</p></div>
          <div className="rounded-2xl bg-white p-3"><b className="text-amber-700">Wynik</b><p className="mt-2 whitespace-nowrap text-lg sm:text-xl">78 : 6 = 13</p></div>
        </div>
      </section>
      <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-center font-black text-indigo-950">W dzieleniu nie rozbijamy dowolnie: każda wybrana część musi dzielić się przez dzielnik.</p>
    </div>
  </LessonTaskFrame>;
}

export function Grade4MulDivContinuedLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  const tasks = activity === "divide" ? DIVIDE_TASKS : activity === "mixed" ? MIXED_TASKS : MULTIPLY_TASKS;
  const task = useMemo(
    () => tasks[Math.max(0, (questionNumber - 1) % tasks.length)] ?? tasks[Math.abs(taskSeed) % tasks.length]!,
    [questionNumber, taskSeed, tasks],
  );
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);

  if (activity === "information") return <InformationSlide />;

  const edit = (key: string) => {
    if (readOnly || feedback === "correct" || feedback === "incorrect") return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 4 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!answer) {
      setFeedback("missing");
      return;
    }
    const correct = Number(answer) === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${task.expression} = ${answer}`);
  };

  const heading = activity === "divide" ? "Podziel przez rozbijanie" : activity === "mixed" ? "Mnożenie czy dzielenie?" : "Pomnóż przez rozbijanie";
  const description = activity === "divide" ? "Rozbij dzielną na wygodne części i wpisz wynik." : activity === "mixed" ? "Wybierz właściwy sposób i oblicz w pamięci." : "Rozbij liczbę dwucyfrową na dziesiątki i jedności.";

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 5" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-indigo-50 px-4 py-6 text-center ring-2 ring-indigo-100">
        <p className="whitespace-nowrap text-4xl font-black tracking-tight text-indigo-950 sm:text-5xl">{task.expression} =</p>
      </section>
      <label className="flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black text-slate-950">
        Wynik:
        <input aria-label="Wynik działania" value={answer} inputMode="none" readOnly className="h-16 w-40 rounded-2xl border-2 border-violet-400 bg-violet-50 text-center text-3xl font-black outline-none" />
      </label>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct" || feedback === "incorrect"} label="Klawiatura do odpowiedzi" helperText="Wpisz wynik i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij wynik.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wynik jest poprawny.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Podpowiedź: {task.hint}</p> : null}
    </div>
  </LessonTaskFrame>;
}
