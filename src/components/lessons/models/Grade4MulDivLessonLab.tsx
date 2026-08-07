"use client";

import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4MulDivActivity = "information" | "practice" | "product-quotient";

export function grade4MulDivActivityFromStageId(stageId: string): Grade4MulDivActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-product-quotient")) return "product-quotient";
  return "practice";
}

type Task = {
  prompt: string;
  expression?: string;
  answer: number;
  hint: string;
};

const PRACTICE_TASKS: Task[] = [
  { prompt: "Oblicz iloczyn.", expression: "7 · 8", answer: 56, hint: "Przypomnij sobie tabliczkę mnożenia." },
  { prompt: "Oblicz iloraz.", expression: "54 : 6", answer: 9, hint: "Pomyśl: 6 razy ile daje 54?" },
  { prompt: "Oblicz iloczyn.", expression: "9 · 6", answer: 54, hint: "Możesz zamienić czynniki miejscami." },
  { prompt: "Oblicz iloraz.", expression: "72 : 8", answer: 9, hint: "Pomyśl: 8 · 9 = 72." },
  { prompt: "Oblicz iloczyn.", expression: "6 · 4", answer: 24, hint: "Skorzystaj z tabliczki mnożenia." },
  { prompt: "Oblicz iloraz.", expression: "35 : 5", answer: 7, hint: "Pomyśl: 5 · 7 = 35." },
  { prompt: "Oblicz iloczyn.", expression: "8 · 7", answer: 56, hint: "7 · 8 daje ten sam wynik." },
  { prompt: "Oblicz iloraz.", expression: "63 : 9", answer: 7, hint: "Sprawdź wynik mnożeniem." },
];

const LANGUAGE_TASKS: Task[] = [
  { prompt: "Oblicz iloczyn liczb 7 i 9.", answer: 63, hint: "Iloczyn to wynik mnożenia." },
  { prompt: "Oblicz iloraz liczb 72 i 8.", answer: 9, hint: "Iloraz to wynik dzielenia." },
  { prompt: "Pierwszy czynnik to 6, a drugi czynnik to 8. Oblicz iloczyn.", answer: 48, hint: "Zapisz 6 · 8." },
  { prompt: "Dzielna to 56, a dzielnik to 7. Oblicz iloraz.", answer: 8, hint: "Zapisz 56 : 7." },
];

interface Props {
  activity: Grade4MulDivActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function InformationSlide() {
  return <LessonTaskFrame
    eyebrow="Dział 1 · Temat 3"
    heading="Mnożenie i dzielenie — najważniejsze wiadomości"
    description="W tym temacie korzystamy z tabliczki mnożenia i odpowiadających jej dzieleń."
  >
    <div className="space-y-4">
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-3xl bg-emerald-50 p-4 text-center ring-2 ring-emerald-200">
          <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">Mnożenie</p>
          <p className="mt-3 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950">6 · 7 = 42</p>
          <div className="mt-3 grid grid-cols-3 gap-1 text-xs font-black text-emerald-950 sm:text-sm">
            <span>czynnik</span><span>czynnik</span><span>iloczyn</span>
          </div>
        </section>
        <section className="min-w-0 rounded-3xl bg-amber-50 p-4 text-center ring-2 ring-amber-200">
          <p className="text-xs font-black uppercase tracking-[.16em] text-amber-700">Dzielenie</p>
          <p className="mt-3 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950">42 : 6 = 7</p>
          <div className="mt-3 grid grid-cols-3 gap-1 text-xs font-black text-amber-950 sm:text-sm">
            <span>dzielna</span><span>dzielnik</span><span>iloraz</span>
          </div>
        </section>
      </div>
      <section className="grid gap-3 rounded-3xl bg-cyan-50 p-4 ring-2 ring-cyan-200">
        <div className="rounded-2xl bg-white p-4 text-center">
          <b className="text-violet-700">Mnożenie jest przemienne</b>
          <p className="mt-2 whitespace-nowrap text-2xl font-black">6 · 7 = 7 · 6</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center">
          <b className="text-cyan-700">Dzielenie sprawdzamy mnożeniem</b>
          <p className="mt-2 whitespace-nowrap text-xl font-black sm:text-2xl">42 : 6 = 7, bo 7 · 6 = 42</p>
        </div>
      </section>
      <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-center font-black text-indigo-950">Dzielenie nie jest przemienne: 42 : 6 ≠ 6 : 42.</p>
    </div>
  </LessonTaskFrame>;
}

export function Grade4MulDivLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  const tasks = activity === "product-quotient" ? LANGUAGE_TASKS : PRACTICE_TASKS;
  const task = useMemo(
    () => tasks[Math.max(0, (questionNumber - 1) % tasks.length)] ?? tasks[Math.abs(taskSeed) % tasks.length]!,
    [questionNumber, taskSeed, tasks],
  );
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);

  if (activity === "information") return <InformationSlide />;

  const edit = (key: string) => {
    if (readOnly || feedback === "correct" || feedback === "incorrect") return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 3 ? current : `${current}${key}`);
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
    onResultChange?.(correct, `${task.expression ?? task.prompt} = ${answer}`);
  };

  const heading = activity === "product-quotient" ? "Iloczyn i iloraz" : "Tabliczka mnożenia i dzielenia";
  const description = activity === "product-quotient" ? "Odczytaj nazwy liczb i wpisz wynik działania." : "Oblicz działanie i wpisz wynik.";

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 3" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      {task.expression ? (
        <section className="rounded-3xl bg-indigo-50 px-4 py-5 text-center ring-2 ring-indigo-100">
          <p className="mb-3 font-black text-indigo-800">{task.prompt}</p>
          <p className="whitespace-nowrap text-4xl font-black tracking-tight text-indigo-950 sm:text-5xl">{task.expression} =</p>
        </section>
      ) : (
        <p className="rounded-3xl bg-indigo-50 px-4 py-5 text-center text-xl font-black text-indigo-950 sm:text-2xl">{task.prompt}</p>
      )}
      <label className="flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black text-slate-950">
        Wynik:
        <input aria-label="Wynik działania" value={answer} inputMode="none" readOnly className="h-16 w-36 rounded-2xl border-2 border-violet-400 bg-violet-50 text-center text-3xl font-black outline-none" />
      </label>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct" || feedback === "incorrect"} label="Klawiatura do odpowiedzi" helperText="Wpisz wynik i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij wynik.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wynik jest poprawny.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Podpowiedź: {task.hint}</p> : null}
    </div>
  </LessonTaskFrame>;
}
