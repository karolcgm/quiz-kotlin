"use client";

import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4AddSubActivity =
  | "language"
  | "commutative"
  | "split-add"
  | "split-subtract"
  | "practice"
  | "smart-order"
  | "sum-difference";

export function grade4AddSubActivityFromStageId(stageId: string): Grade4AddSubActivity {
  if (stageId.endsWith("-language")) return "language";
  if (stageId.endsWith("-commutative")) return "commutative";
  if (stageId.endsWith("-split-add")) return "split-add";
  if (stageId.endsWith("-split-subtract")) return "split-subtract";
  if (stageId.endsWith("-smart-order")) return "smart-order";
  if (stageId.endsWith("-sum-difference")) return "sum-difference";
  return "practice";
}

type Task = {
  prompt: string;
  expression?: string;
  answer: number;
  hint: string;
  pairChoices?: string[];
  correctPair?: string;
};

const PRACTICE_TASKS: Task[] = [
  { prompt: "Oblicz sumę.", expression: "34 + 25", answer: 59, hint: "Dodaj dziesiątki, a potem jedności." },
  { prompt: "Oblicz różnicę.", expression: "73 − 41", answer: 32, hint: "Najpierw odejmij 40, potem jeszcze 1." },
  { prompt: "Oblicz w pamięci.", expression: "48 + 27", answer: 75, hint: "Możesz osobno połączyć dziesiątki i jedności." },
  { prompt: "Oblicz w pamięci.", expression: "82 − 36", answer: 46, hint: "Odejmij 30, a potem 6." },
  { prompt: "Uzupełnij wynik.", expression: "56 + 38", answer: 94, hint: "50 + 30 oraz 6 + 8." },
  { prompt: "Uzupełnij wynik.", expression: "91 − 47", answer: 44, hint: "Odejmij 40, a potem 7." },
];

const SMART_TASKS: Task[] = [
  { prompt: "Wybierz parę, którą warto dodać najpierw, i oblicz.", expression: "8 + 17 + 2", answer: 27, hint: "Szukaj składników, które dają pełną dziesiątkę.", pairChoices: ["8 + 2", "17 + 2", "8 + 17"], correctPair: "8 + 2" },
  { prompt: "Wybierz najwygodniejszą kolejność i oblicz.", expression: "26 + 9 + 4", answer: 39, hint: "26 potrzebuje 4 do pełnej dziesiątki.", pairChoices: ["26 + 4", "9 + 4", "26 + 9"], correctPair: "26 + 4" },
  { prompt: "Wybierz najwygodniejszą kolejność i oblicz.", expression: "35 + 18 + 5", answer: 58, hint: "35 i 5 tworzą pełną dziesiątkę.", pairChoices: ["35 + 5", "18 + 5", "35 + 18"], correctPair: "35 + 5" },
  { prompt: "Wybierz najwygodniejszą kolejność i oblicz.", expression: "7 + 24 + 3", answer: 34, hint: "7 i 3 dają 10.", pairChoices: ["7 + 3", "24 + 3", "7 + 24"], correctPair: "7 + 3" },
];

const LANGUAGE_TASKS: Task[] = [
  { prompt: "Oblicz sumę liczb 46 i 23.", answer: 69, hint: "Suma to wynik dodawania." },
  { prompt: "Oblicz różnicę liczb 75 i 32.", answer: 43, hint: "Różnica to wynik odejmowania." },
  { prompt: "Pierwszy składnik to 28, a drugi składnik to 37. Oblicz sumę.", answer: 65, hint: "Zapisz 28 + 37." },
  { prompt: "Odjemna to 84, a odjemnik to 29. Oblicz różnicę.", answer: 55, hint: "Zapisz 84 − 29." },
];

interface Props {
  activity: Grade4AddSubActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function InformationSlide({ activity }: { activity: Exclude<Grade4AddSubActivity, "practice" | "smart-order" | "sum-difference"> }) {
  if (activity === "language") return <LessonTaskFrame eyebrow="Dział 1 · Temat 1" heading="Nazwy w dodawaniu i odejmowaniu" description="Każda liczba i każdy wynik mają swoją nazwę.">
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
        <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">Dodawanie</p>
        <p className="mt-4 whitespace-nowrap text-3xl font-black text-slate-950 sm:text-5xl">3 + 5 = 8</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-black text-emerald-950"><span>składnik</span><span>składnik</span><span>suma</span></div>
      </section>
      <section className="rounded-3xl bg-amber-50 p-5 text-center ring-2 ring-amber-200">
        <p className="text-xs font-black uppercase tracking-[.16em] text-amber-700">Odejmowanie</p>
        <p className="mt-4 whitespace-nowrap text-3xl font-black text-slate-950 sm:text-5xl">9 − 4 = 5</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-black text-amber-950"><span>odjemna</span><span>odjemnik</span><span>różnica</span></div>
      </section>
    </div>
  </LessonTaskFrame>;

  if (activity === "commutative") return <LessonTaskFrame eyebrow="Dział 1 · Temat 1" heading="Dodawanie jest przemienne" description="Możemy zamienić składniki miejscami. Suma się nie zmieni.">
    <div className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
      <p className="whitespace-nowrap text-4xl font-black text-indigo-950 sm:text-6xl"><span className="text-violet-700">3</span> + <span className="text-cyan-700">5</span> = <span className="text-cyan-700">5</span> + <span className="text-violet-700">3</span></p>
      <p className="mt-5 text-xl font-bold text-slate-700">Oba działania dają 8.</p>
      <p className="mt-3 rounded-2xl bg-white px-4 py-3 font-black text-slate-950">Uwaga: odejmowanie nie jest przemienne.</p>
    </div>
  </LessonTaskFrame>;

  if (activity === "split-add") return <LessonTaskFrame eyebrow="Dział 1 · Temat 1" heading="Dodajemy dziesiątki i jedności" description="Rozbijamy liczby na dziesiątki i jedności.">
    <div className="space-y-5 text-center">
      <p className="whitespace-nowrap text-4xl font-black text-slate-950 sm:text-6xl">48 + 36 = 84</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-indigo-50 p-4"><b className="text-indigo-700">1. Dziesiątki</b><p className="mt-2 text-2xl font-black">40 + 30 = 70</p></div>
        <div className="rounded-2xl bg-cyan-50 p-4"><b className="text-cyan-700">2. Jedności</b><p className="mt-2 text-2xl font-black">8 + 6 = 14</p></div>
        <div className="rounded-2xl bg-emerald-50 p-4"><b className="text-emerald-700">3. Razem</b><p className="mt-2 text-2xl font-black">70 + 14 = 84</p></div>
      </div>
    </div>
  </LessonTaskFrame>;

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 1" heading="Odejmujemy po kawałku" description="Najpierw odejmujemy dziesiątki, potem jedności.">
    <div className="space-y-5 text-center">
      <p className="whitespace-nowrap text-4xl font-black text-slate-950 sm:text-6xl">42 − 27 = 15</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-indigo-50 p-4"><b className="text-indigo-700">1. Odejmij 20</b><p className="mt-2 text-2xl font-black">42 − 20 = 22</p></div>
        <div className="rounded-2xl bg-cyan-50 p-4"><b className="text-cyan-700">2. Odejmij 7</b><p className="mt-2 text-2xl font-black">22 − 7 = 15</p></div>
        <div className="rounded-2xl bg-emerald-50 p-4"><b className="text-emerald-700">3. Wynik</b><p className="mt-2 text-2xl font-black">42 − 27 = 15</p></div>
      </div>
    </div>
  </LessonTaskFrame>;
}

export function Grade4AddSubLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  const tasks = activity === "smart-order" ? SMART_TASKS : activity === "sum-difference" ? LANGUAGE_TASKS : PRACTICE_TASKS;
  const task = useMemo(() => tasks[Math.max(0, (questionNumber - 1) % tasks.length)] ?? tasks[Math.abs(taskSeed) % tasks.length]!, [questionNumber, taskSeed, tasks]);
  const [answer, setAnswer] = useState("");
  const [pair, setPair] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);

  if (["language", "commutative", "split-add", "split-subtract"].includes(activity)) {
    return <InformationSlide activity={activity as Exclude<Grade4AddSubActivity, "practice" | "smart-order" | "sum-difference">} />;
  }

  const edit = (key: string) => {
    if (readOnly || feedback === "correct" || feedback === "incorrect") return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 4 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (!answer || (task.correctPair && !pair)) { setFeedback("missing"); return; }
    const correct = Number(answer) === task.answer && (!task.correctPair || pair === task.correctPair);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${task.expression ?? task.prompt} = ${answer}`);
  };

  const heading = activity === "smart-order" ? "Oblicz sprytnie" : activity === "sum-difference" ? "Suma i różnica" : "Dodawanie i odejmowanie";
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 1" heading={heading} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      {task.expression ? <p className="whitespace-nowrap rounded-3xl bg-indigo-50 px-4 py-6 text-center text-4xl font-black text-indigo-950 sm:text-6xl">{task.expression} =</p> : <p className="rounded-3xl bg-indigo-50 px-4 py-5 text-center text-xl font-black text-indigo-950 sm:text-2xl">{task.prompt}</p>}
      {task.pairChoices ? <section className="rounded-2xl bg-cyan-50 p-4"><p className="mb-3 text-center font-black text-cyan-950">Co obliczysz najpierw?</p><div className="grid gap-2 sm:grid-cols-3">{task.pairChoices.map((choice) => <LessonTaskChoice key={choice} selected={pair === choice} disabled={readOnly || feedback === "correct" || feedback === "incorrect"} onClick={() => { setPair(choice); setFeedback(null); onResultChange?.(null); }}>{choice}</LessonTaskChoice>)}</div></section> : null}
      <label className="flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black text-slate-950">Wynik:<input aria-label="Wynik działania" value={answer} inputMode="none" readOnly className="h-16 w-36 rounded-2xl border-2 border-violet-400 bg-violet-50 text-center text-3xl font-black outline-none" /></label>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct" || feedback === "incorrect"} label="Klawiatura do odpowiedzi" helperText="Wpisz wynik i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wynik jest poprawny.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer}{task.correctPair ? `, a najpierw warto obliczyć ${task.correctPair}` : ""}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Podpowiedź: {task.hint}</p> : null}
    </div>
  </LessonTaskFrame>;
}
