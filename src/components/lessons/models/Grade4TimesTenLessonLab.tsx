"use client";

import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4TimesTenActivity = "information" | "multiply" | "divide" | "mixed";

export function grade4TimesTenActivityFromStageId(stageId: string): Grade4TimesTenActivity {
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
  { expression: "6 · 10", answer: 60, hint: "Dopisz jedno zero." },
  { expression: "34 · 10", answer: 340, hint: "Liczba 10 ma jedno zero." },
  { expression: "7 · 100", answer: 700, hint: "Dopisz dwa zera." },
  { expression: "46 · 100", answer: 4600, hint: "Liczba 100 ma dwa zera." },
  { expression: "8 · 1000", answer: 8000, hint: "Dopisz trzy zera." },
  { expression: "125 · 10", answer: 1250, hint: "Dopisz jedno zero na końcu liczby 125." },
];

const DIVIDE_TASKS: Task[] = [
  { expression: "90 : 10", answer: 9, hint: "Skreśl po jednym zerze w obu liczbach." },
  { expression: "470 : 10", answer: 47, hint: "Skreśl jedną parę zer." },
  { expression: "800 : 100", answer: 8, hint: "Skreśl dwie pary zer." },
  { expression: "6300 : 100", answer: 63, hint: "W dzielnej i dzielniku skreśl po dwa zera." },
  { expression: "9000 : 1000", answer: 9, hint: "Skreśl trzy pary zer." },
  { expression: "24000 : 1000", answer: 24, hint: "W obu liczbach skreśl po trzy zera." },
];

const MIXED_TASKS: Task[] = [
  { expression: "23 · 100", answer: 2300, hint: "To mnożenie — dopisz dwa zera." },
  { expression: "560 : 10", answer: 56, hint: "To dzielenie — skreśl jedną parę zer." },
  { expression: "41 · 10", answer: 410, hint: "To mnożenie — dopisz jedno zero." },
  { expression: "7200 : 100", answer: 72, hint: "To dzielenie — skreśl dwie pary zer." },
  { expression: "12 · 1000", answer: 12000, hint: "To mnożenie — dopisz trzy zera." },
  { expression: "35000 : 1000", answer: 35, hint: "To dzielenie — skreśl trzy pary zer." },
];

interface Props {
  activity: Grade4TimesTenActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function ColoredNumber({ value, cancelZeros = false }: { value: string; cancelZeros?: boolean }) {
  return <span aria-label={value} className="inline-flex">
    {[...value].map((digit, index) => digit === "0" ? (
      <span
        key={`${digit}-${index}`}
        className={cancelZeros
          ? "relative inline-block text-rose-600 after:absolute after:left-[-0.08em] after:top-1/2 after:h-[3px] after:w-[1.15em] after:-rotate-12 after:rounded-full after:bg-rose-600 after:content-['']"
          : "text-rose-600"}
        data-red-zero
        data-cancelled-zero={cancelZeros ? "true" : undefined}
        aria-hidden="true"
      >0</span>
    ) : <span key={`${digit}-${index}`} aria-hidden="true">{digit}</span>)}
  </span>;
}

function MultiplicationExample({ number, multiplier, result }: { number: string; multiplier: string; result: string }) {
  return <div className="rounded-2xl bg-emerald-50 p-3 text-center ring-2 ring-emerald-200">
    <p className="whitespace-nowrap text-2xl font-black tracking-tight text-slate-950">
      <ColoredNumber value={number} /> · <ColoredNumber value={multiplier} /> = <ColoredNumber value={result} />
    </p>
  </div>;
}

function DivisionExample({ dividend, divisor, result, pairs }: { dividend: string; divisor: string; result: string; pairs: number }) {
  return <div className="rounded-2xl bg-amber-50 p-3 text-center ring-2 ring-amber-200">
    <p className="whitespace-nowrap text-2xl font-black tracking-tight text-slate-950">
      <ColoredNumber value={dividend} cancelZeros /> : <ColoredNumber value={divisor} cancelZeros /> = {result}
    </p>
    <p className="mt-2 text-sm font-bold text-amber-950">Skreślamy {pairs === 1 ? "jedną parę zer" : pairs === 2 ? "dwie pary zer" : "trzy pary zer"}.</p>
  </div>;
}

function InformationSlide() {
  return <LessonTaskFrame
    eyebrow="Dział 1 · Temat 4"
    heading="Mnożenie i dzielenie przez 10, 100 i 1000"
    description="Liczba zer podpowiada, ile zer dopisujemy albo skreślamy."
  >
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <section className="min-w-0 rounded-3xl bg-emerald-100/70 p-4">
        <h3 className="text-center text-lg font-black text-emerald-950">Mnożenie — dopisujemy zera</h3>
        <p className="mt-1 text-center text-sm font-bold text-emerald-900">Dopisujemy tyle zer, ile ma 10, 100 lub 1000.</p>
        <div className="mt-4 space-y-3">
          <MultiplicationExample number="34" multiplier="10" result="340" />
          <MultiplicationExample number="52" multiplier="100" result="5200" />
          <MultiplicationExample number="7" multiplier="1000" result="7000" />
        </div>
      </section>
      <section className="min-w-0 rounded-3xl bg-amber-100/70 p-4">
        <h3 className="text-center text-lg font-black text-amber-950">Dzielenie — skreślamy zera parami</h3>
        <p className="mt-1 text-center text-sm font-bold text-amber-900">Skreślamy tyle samo zer w dzielnej i dzielniku.</p>
        <div className="mt-4 space-y-3">
          <DivisionExample dividend="340" divisor="10" result="34" pairs={1} />
          <DivisionExample dividend="5200" divisor="100" result="52" pairs={2} />
          <DivisionExample dividend="7000" divisor="1000" result="7" pairs={3} />
        </div>
      </section>
      <p className="rounded-2xl bg-rose-50 px-4 py-3 text-center font-black text-rose-800 lg:col-span-2">
        Czerwone zera pokazują, co dopisujemy. Przy dzieleniu czerwone zera skreślamy parami.
      </p>
    </div>
  </LessonTaskFrame>;
}

export function Grade4TimesTenLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
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
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 6 ? current : `${current}${key}`);
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

  const heading = activity === "divide" ? "Podziel przez 10, 100 lub 1000" : activity === "mixed" ? "Mnożenie czy dzielenie?" : "Pomnóż przez 10, 100 lub 1000";
  const description = activity === "divide" ? "Skreśl w obu liczbach tyle samo zer i wpisz wynik." : activity === "mixed" ? "Rozpoznaj działanie i wpisz wynik." : "Dopisz właściwą liczbę zer i wpisz wynik.";

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 4" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-indigo-50 px-4 py-6 text-center ring-2 ring-indigo-100">
        <p className="whitespace-nowrap text-4xl font-black tracking-tight text-indigo-950 sm:text-5xl">{task.expression} =</p>
      </section>
      <label className="flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black text-slate-950">
        Wynik:
        <input
          aria-label="Wynik działania"
          value={answer}
          inputMode="none"
          readOnly
          className="h-16 w-40 rounded-2xl border-2 border-violet-400 bg-violet-50 text-center text-3xl font-black outline-none"
        />
      </label>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct" || feedback === "incorrect"} label="Klawiatura do odpowiedzi" helperText="Wpisz wynik i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij wynik.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wynik jest poprawny.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Podpowiedź: {task.hint}</p> : null}
    </div>
  </LessonTaskFrame>;
}
