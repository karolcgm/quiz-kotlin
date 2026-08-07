"use client";

import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4MulDivActivity =
  | "language"
  | "commutative"
  | "inverse"
  | "split-multiply"
  | "split-divide"
  | "practice"
  | "smart-order"
  | "product-quotient";

export function grade4MulDivActivityFromStageId(stageId: string): Grade4MulDivActivity {
  if (stageId.endsWith("-language")) return "language";
  if (stageId.endsWith("-commutative")) return "commutative";
  if (stageId.endsWith("-inverse")) return "inverse";
  if (stageId.endsWith("-split-multiply")) return "split-multiply";
  if (stageId.endsWith("-split-divide")) return "split-divide";
  if (stageId.endsWith("-smart-order")) return "smart-order";
  if (stageId.endsWith("-product-quotient")) return "product-quotient";
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
  { prompt: "Oblicz iloczyn.", expression: "7 · 8", answer: 56, hint: "Przypomnij sobie tabliczkę mnożenia." },
  { prompt: "Oblicz iloraz.", expression: "54 : 6", answer: 9, hint: "Pomyśl: 6 razy ile daje 54?" },
  { prompt: "Oblicz w pamięci.", expression: "12 · 4", answer: 48, hint: "Możesz obliczyć 10 · 4 oraz 2 · 4." },
  { prompt: "Oblicz w pamięci.", expression: "84 : 7", answer: 12, hint: "Sprawdź wynik mnożeniem." },
  { prompt: "Uzupełnij wynik.", expression: "16 · 5", answer: 80, hint: "Rozbij 16 na 10 i 6." },
  { prompt: "Uzupełnij wynik.", expression: "96 : 3", answer: 32, hint: "Podziel osobno 90 i 6." },
];

const SMART_TASKS: Task[] = [
  { prompt: "Wybierz parę, którą warto pomnożyć najpierw, i oblicz.", expression: "2 · 9 · 5", answer: 90, hint: "Szukaj dwóch czynników, których iloczyn łatwo policzyć.", pairChoices: ["2 · 5", "9 · 5", "2 · 9"], correctPair: "2 · 5" },
  { prompt: "Wybierz najwygodniejszą kolejność i oblicz.", expression: "5 · 6 · 2", answer: 60, hint: "Najpierw utwórz iloczyn 10.", pairChoices: ["5 · 2", "6 · 2", "5 · 6"], correctPair: "5 · 2" },
  { prompt: "Wybierz najwygodniejszą kolejność i oblicz.", expression: "4 · 8 · 5", answer: 160, hint: "4 i 5 dają 20.", pairChoices: ["4 · 5", "8 · 5", "4 · 8"], correctPair: "4 · 5" },
  { prompt: "Wybierz najwygodniejszą kolejność i oblicz.", expression: "2 · 13 · 5", answer: 130, hint: "2 i 5 dają 10.", pairChoices: ["2 · 5", "13 · 5", "2 · 13"], correctPair: "2 · 5" },
];

const LANGUAGE_TASKS: Task[] = [
  { prompt: "Oblicz iloczyn liczb 7 i 9.", answer: 63, hint: "Iloczyn to wynik mnożenia." },
  { prompt: "Oblicz iloraz liczb 72 i 8.", answer: 9, hint: "Iloraz to wynik dzielenia." },
  { prompt: "Pierwszy czynnik to 6, a drugi czynnik to 12. Oblicz iloczyn.", answer: 72, hint: "Zapisz 6 · 12." },
  { prompt: "Dzielna to 96, a dzielnik to 4. Oblicz iloraz.", answer: 24, hint: "Zapisz 96 : 4." },
];

interface Props {
  activity: Grade4MulDivActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function InformationSlide({ activity }: { activity: Exclude<Grade4MulDivActivity, "practice" | "smart-order" | "product-quotient"> }) {
  if (activity === "language") return <LessonTaskFrame eyebrow="Dział 1 · Temat 3" heading="Nazwy w mnożeniu i dzieleniu" description="Każda liczba i każdy wynik mają swoją nazwę.">
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
        <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">Mnożenie</p>
        <p className="mt-4 whitespace-nowrap text-3xl font-black text-slate-950 sm:text-5xl">4 · 6 = 24</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-black text-emerald-950"><span>czynnik</span><span>czynnik</span><span>iloczyn</span></div>
      </section>
      <section className="rounded-3xl bg-amber-50 p-5 text-center ring-2 ring-amber-200">
        <p className="text-xs font-black uppercase tracking-[.16em] text-amber-700">Dzielenie</p>
        <p className="mt-4 whitespace-nowrap text-3xl font-black text-slate-950 sm:text-5xl">24 : 6 = 4</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-black text-amber-950"><span>dzielna</span><span>dzielnik</span><span>iloraz</span></div>
      </section>
    </div>
  </LessonTaskFrame>;

  if (activity === "commutative") return <LessonTaskFrame eyebrow="Dział 1 · Temat 3" heading="Mnożenie jest przemienne" description="Możemy zamienić czynniki miejscami. Iloczyn się nie zmieni.">
    <div className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
      <p className="whitespace-nowrap text-4xl font-black text-indigo-950 sm:text-6xl"><span className="text-violet-700">3</span> · <span className="text-cyan-700">5</span> = <span className="text-cyan-700">5</span> · <span className="text-violet-700">3</span></p>
      <p className="mt-5 text-xl font-bold text-slate-700">Oba działania dają 15.</p>
      <p className="mt-3 rounded-2xl bg-white px-4 py-3 font-black text-slate-950">Uwaga: dzielenie nie jest przemienne.</p>
    </div>
  </LessonTaskFrame>;

  if (activity === "inverse") return <LessonTaskFrame eyebrow="Dział 1 · Temat 3" heading="Mnożenie i dzielenie są ze sobą związane" description="Wynik dzielenia możemy sprawdzić mnożeniem.">
    <div className="grid gap-4 text-center sm:grid-cols-3">
      <div className="rounded-3xl bg-indigo-50 p-5 ring-2 ring-indigo-200"><b className="text-indigo-700">Mnożenie</b><p className="mt-3 whitespace-nowrap text-3xl font-black">6 · 7 = 42</p></div>
      <div className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200"><b className="text-cyan-700">Dzielenie</b><p className="mt-3 whitespace-nowrap text-3xl font-black">42 : 6 = 7</p></div>
      <div className="rounded-3xl bg-emerald-50 p-5 ring-2 ring-emerald-200"><b className="text-emerald-700">Dzielenie</b><p className="mt-3 whitespace-nowrap text-3xl font-black">42 : 7 = 6</p></div>
    </div>
  </LessonTaskFrame>;

  if (activity === "split-multiply") return <LessonTaskFrame eyebrow="Dział 1 · Temat 3" heading="Mnożymy po kawałku" description="Rozbijamy jeden czynnik na łatwiejsze części.">
    <div className="space-y-5 text-center">
      <p className="whitespace-nowrap text-4xl font-black text-slate-950 sm:text-6xl">6 · 14 = 84</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-indigo-50 p-4"><b className="text-indigo-700">1. Rozbij 14</b><p className="mt-2 text-2xl font-black">14 = 10 + 4</p></div>
        <div className="rounded-2xl bg-cyan-50 p-4"><b className="text-cyan-700">2. Pomnóż</b><p className="mt-2 text-2xl font-black">6 · 10 + 6 · 4</p></div>
        <div className="rounded-2xl bg-emerald-50 p-4"><b className="text-emerald-700">3. Dodaj</b><p className="mt-2 text-2xl font-black">60 + 24 = 84</p></div>
      </div>
    </div>
  </LessonTaskFrame>;

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 3" heading="Dzielimy po kawałku" description="Rozbijamy dzielną na liczby, które łatwo podzielić.">
    <div className="space-y-5 text-center">
      <p className="whitespace-nowrap text-4xl font-black text-slate-950 sm:text-6xl">84 : 4 = 21</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-indigo-50 p-4"><b className="text-indigo-700">1. Rozbij 84</b><p className="mt-2 text-2xl font-black">84 = 80 + 4</p></div>
        <div className="rounded-2xl bg-cyan-50 p-4"><b className="text-cyan-700">2. Podziel</b><p className="mt-2 text-2xl font-black">80 : 4 + 4 : 4</p></div>
        <div className="rounded-2xl bg-emerald-50 p-4"><b className="text-emerald-700">3. Dodaj</b><p className="mt-2 text-2xl font-black">20 + 1 = 21</p></div>
      </div>
    </div>
  </LessonTaskFrame>;
}

export function Grade4MulDivLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  const tasks = activity === "smart-order" ? SMART_TASKS : activity === "product-quotient" ? LANGUAGE_TASKS : PRACTICE_TASKS;
  const task = useMemo(() => tasks[Math.max(0, (questionNumber - 1) % tasks.length)] ?? tasks[Math.abs(taskSeed) % tasks.length]!, [questionNumber, taskSeed, tasks]);
  const [answer, setAnswer] = useState("");
  const [pair, setPair] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);

  if (["language", "commutative", "inverse", "split-multiply", "split-divide"].includes(activity)) {
    return <InformationSlide activity={activity as Exclude<Grade4MulDivActivity, "practice" | "smart-order" | "product-quotient">} />;
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
  const heading = activity === "smart-order" ? "Oblicz sprytnie" : activity === "product-quotient" ? "Iloczyn i iloraz" : "Mnożenie i dzielenie";
  const description = activity === "smart-order" ? "Wybierz wygodną parę czynników, a potem wpisz wynik." : activity === "product-quotient" ? "Odczytaj nazwy liczb i wpisz wynik działania." : "Oblicz działanie w pamięci i wpisz wynik.";

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 3" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      {task.expression ? <section className="rounded-3xl bg-indigo-50 px-4 py-5 text-center"><p className="mb-3 font-black text-indigo-800">{task.prompt}</p><p className="whitespace-nowrap text-4xl font-black text-indigo-950 sm:text-6xl">{task.expression} =</p></section> : <p className="rounded-3xl bg-indigo-50 px-4 py-5 text-center text-xl font-black text-indigo-950 sm:text-2xl">{task.prompt}</p>}
      {task.pairChoices ? <section className="rounded-2xl bg-cyan-50 p-4"><p className="mb-3 text-center font-black text-cyan-950">Co pomnożysz najpierw?</p><div className="grid gap-2 sm:grid-cols-3">{task.pairChoices.map((choice) => <LessonTaskChoice key={choice} selected={pair === choice} disabled={readOnly || feedback === "correct" || feedback === "incorrect"} onClick={() => { setPair(choice); setFeedback(null); onResultChange?.(null); }}>{choice}</LessonTaskChoice>)}</div></section> : null}
      <label className="flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black text-slate-950">Wynik:<input aria-label="Wynik działania" value={answer} inputMode="none" readOnly className="h-16 w-36 rounded-2xl border-2 border-violet-400 bg-violet-50 text-center text-3xl font-black outline-none" /></label>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct" || feedback === "incorrect"} label="Klawiatura do odpowiedzi" helperText="Wpisz wynik i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wynik jest poprawny.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer}{task.correctPair ? `, a najpierw warto obliczyć ${task.correctPair}` : ""}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Podpowiedź: {task.hint}</p> : null}
    </div>
  </LessonTaskFrame>;
}
