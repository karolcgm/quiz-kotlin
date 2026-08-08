"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4LargeNumberArithmeticActivity = "information" | "add-sub" | "mul-div" | "powers";

export function grade4LargeNumberArithmeticActivityFromStageId(stageId: string): Grade4LargeNumberArithmeticActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-mul-div")) return "mul-div";
  if (stageId.endsWith("-powers")) return "powers";
  return "add-sub";
}

interface Props {
  activity: Grade4LargeNumberArithmeticActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type ArithmeticTask = {
  expression: string;
  answer: string;
  hint: string;
};

const ADD_SUB_TASKS: readonly ArithmeticTask[] = [
  { expression: "48 000 + 36 000", answer: "84000", hint: "Najpierw oblicz 48 + 36 = 84. Zachowaj trzy końcowe zera." },
  { expression: "72 000 − 25 000", answer: "47000", hint: "Najpierw oblicz 72 − 25 = 47. Zachowaj trzy końcowe zera." },
  { expression: "450 000 + 230 000", answer: "680000", hint: "Najpierw oblicz 450 + 230 = 680. Zachowaj trzy końcowe zera." },
  { expression: "900 000 − 370 000", answer: "530000", hint: "Najpierw oblicz 900 − 370 = 530. Zachowaj trzy końcowe zera." },
  { expression: "2 400 000 + 1 300 000", answer: "3700000", hint: "Dodajesz miliony i setki tysięcy." },
  { expression: "8 000 000 − 2 750 000", answer: "5250000", hint: "Najpierw odejmij 2 000 000, a następnie jeszcze 750 000." },
];

const MUL_DIV_TASKS: readonly ArithmeticTask[] = [
  { expression: "6 · 40 000", answer: "240000", hint: "Oblicz 6 · 4 i dopisz cztery zera." },
  { expression: "300 · 700", answer: "210000", hint: "Oblicz 3 · 7 i policz wszystkie zera obu czynników." },
  { expression: "9 · 5 000 000", answer: "45000000", hint: "Oblicz 9 · 5 i zachowaj sześć zer." },
  { expression: "84 000 : 7", answer: "12000", hint: "Najpierw 84 : 7, potem wróć do tysięcy." },
  { expression: "360 000 : 900", answer: "400", hint: "Skreśl po dwa zera w dzielnej i dzielniku, potem oblicz 3 600 : 9." },
  { expression: "4 200 000 : 600", answer: "7000", hint: "Skreśl po dwa zera i oblicz 42 000 : 6." },
  { expression: "25 000 · 40", answer: "1000000", hint: "Oblicz 25 · 4 i dopisz cztery zera." },
  { expression: "9 000 000 : 3 000", answer: "3000", hint: "Skreśl po trzy zera w obu liczbach." },
];

const POWER_TASKS: readonly ArithmeticTask[] = [
  { expression: "10²", answer: "100", hint: "10² = 10 · 10." },
  { expression: "10³", answer: "1000", hint: "10³ = 10 · 10 · 10." },
  { expression: "6 · 10²", answer: "600", hint: "10² to 100." },
  { expression: "4 · 10³", answer: "4000", hint: "10³ to 1 000." },
  { expression: "3 · 10³ + 2 · 10³", answer: "5000", hint: "To 3 tysiące i jeszcze 2 tysiące." },
  { expression: "9 · 10³ − 4 · 10³", answer: "5000", hint: "Odejmij 4 tysiące od 9 tysięcy." },
];

type Feedback = "correct" | "incorrect" | "missing" | null;

const formatAnswer = (value: string) => new Intl.NumberFormat("pl-PL").format(Number(value));

function RedZeros({ count, crossed = false }: { count: number; crossed?: boolean }) {
  return <span aria-label={`${count} zera`} className="inline-flex">{Array.from({ length: count }, (_, index) => <span key={index} className={`text-rose-600 ${crossed ? "line-through decoration-4" : ""}`}>0</span>)}</span>;
}

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 2 · Temat 3" heading="Rachunki na dużych liczbach" description="Wykorzystujemy znane rachunki, a zera pomagają nam rozpoznać tysiące, miliony i wielokrotności dziesiątki.">
    <div className="space-y-5">
      <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
        <h3 className="text-center text-xl font-black text-cyan-950">Dodawanie i odejmowanie</h3>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow">
            <p className="whitespace-nowrap text-2xl font-black tracking-tight"><span className="inline-flex whitespace-nowrap">48&nbsp;<RedZeros count={3} /></span> + <span className="inline-flex whitespace-nowrap">36&nbsp;<RedZeros count={3} /></span></p>
            <p className="mt-2 font-bold">Najpierw obliczamy: 48 + 36 = 84</p>
            <p className="mt-1 whitespace-nowrap text-xl font-black text-violet-700">48 000 + 36 000 = 84 000</p>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow">
            <p className="whitespace-nowrap text-2xl font-black tracking-tight"><span className="inline-flex whitespace-nowrap">72&nbsp;<RedZeros count={3} /></span> − <span className="inline-flex whitespace-nowrap">25&nbsp;<RedZeros count={3} /></span></p>
            <p className="mt-2 font-bold">Najpierw obliczamy: 72 − 25 = 47</p>
            <p className="mt-1 whitespace-nowrap text-xl font-black text-violet-700">72 000 − 25 000 = 47 000</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
        <h3 className="text-center text-xl font-black text-violet-950">Mnożenie: najpierw liczby bez końcowych zer</h3>
        <div className="mt-4 rounded-2xl bg-white p-4 text-center shadow">
          <p className="text-2xl font-black">3<RedZeros count={2} /> · 7<RedZeros count={2} /> = 3 · 7 · 1<RedZeros count={4} /> = 21<RedZeros count={4} /></p>
          <p className="mt-2 font-bold text-violet-800">300 · 700 = 210 000</p>
        </div>
      </section>

      <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
        <h3 className="text-center text-xl font-black text-amber-950">Dzielenie: skreślamy tyle samo zer w obu liczbach</h3>
        <div className="mt-4 rounded-2xl bg-white p-4 text-center shadow">
          <p className="text-2xl font-black">360 0<RedZeros count={2} crossed /> : 9<RedZeros count={2} crossed /> = 3 600 : 9 = 400</p>
          <p className="mt-2 font-bold text-amber-800">Każda skreślona para zer oznacza podzielenie obu liczb przez 10.</p>
        </div>
      </section>

    </div>
  </LessonTaskFrame>;
}

function ArithmeticSlide({ activity, task, questionNumber, questionCount, readOnly, onResultChange }: { activity: Exclude<Grade4LargeNumberArithmeticActivity, "information">; task: ArithmeticTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const heading = activity === "add-sub" ? "Dodaj lub odejmij" : activity === "mul-div" ? "Pomnóż lub podziel" : "Kod potęg dziesiątki";
  const description = activity === "powers" ? "Najpierw oblicz wartość potęgi, a potem całe działanie." : "Wykorzystaj prostszy rachunek i uważnie policz zera.";
  const displayedExpression = task.expression.replace(/(\d) (?=\d)/gu, "$1\u00a0");
  const expressionSize = task.expression.length >= 22 ? "text-2xl sm:text-3xl" : task.expression.length >= 16 ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl";

  const edit = (key: string) => {
    if (locked) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 12 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!answer) return setFeedback("missing");
    const correct = answer === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };

  return <LessonTaskFrame eyebrow="Dział 2 · Temat 3" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
        <p data-testid="large-number-expression" className={`whitespace-nowrap font-black tracking-tight text-slate-950 ${expressionSize}`}>{displayedExpression} =</p>
        <label className="mt-5 flex flex-wrap items-center justify-center gap-3 font-black text-slate-950"><span>Wynik:</span><input aria-label="Wynik działania" value={answer} inputMode="none" readOnly className="h-16 w-full max-w-xs rounded-xl border-2 border-violet-400 bg-white px-3 text-center text-2xl font-black outline-none" /></label>
        <p className="mt-4 font-bold text-slate-700">{task.hint}</p>
      </section>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do rachunków na dużych liczbach" helperText="Wpisz wynik bez spacji i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Wpisz wynik działania.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Poprawny wynik to {formatAnswer(task.answer)}.</p> : null}
      {feedback === "incorrect" ? <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {formatAnswer(task.answer)}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4LargeNumberArithmeticLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  const tasks = activity === "add-sub" ? ADD_SUB_TASKS : activity === "mul-div" ? MUL_DIV_TASKS : POWER_TASKS;
  const task = tasks[(questionNumber - 1) % tasks.length] ?? tasks[Math.abs(taskSeed) % tasks.length]!;
  return <ArithmeticSlide key={`${activity}-${questionNumber}`} activity={activity} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
