"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4PowersActivity = "information" | "calculate" | "words" | "curiosity" | "expand";

export function grade4PowersActivityFromStageId(stageId: string): Grade4PowersActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-words")) return "words";
  if (stageId.endsWith("-curiosity")) return "curiosity";
  if (stageId.endsWith("-expand")) return "expand";
  return "calculate";
}

type PowerTask = { base: number; exponent: number; answer: number; spoken?: string };

const CALCULATION_TASKS: PowerTask[] = [
  { base: 2, exponent: 2, answer: 4 },
  { base: 3, exponent: 2, answer: 9 },
  { base: 6, exponent: 2, answer: 36 },
  { base: 9, exponent: 2, answer: 81 },
  { base: 2, exponent: 3, answer: 8 },
  { base: 3, exponent: 3, answer: 27 },
  { base: 4, exponent: 3, answer: 64 },
  { base: 5, exponent: 3, answer: 125 },
];

const WORD_TASKS: PowerTask[] = [
  { base: 8, exponent: 2, answer: 64, spoken: "osiem do potęgi drugiej" },
  { base: 7, exponent: 2, answer: 49, spoken: "siedem do potęgi drugiej" },
  { base: 2, exponent: 3, answer: 8, spoken: "dwa do potęgi trzeciej" },
  { base: 4, exponent: 3, answer: 64, spoken: "cztery do potęgi trzeciej" },
  { base: 10, exponent: 2, answer: 100, spoken: "dziesięć do potęgi drugiej" },
];

type ExpansionTask = { base: number; exponent: number; choices: string[]; answer: string };

const EXPANSION_TASKS: ExpansionTask[] = [
  { base: 2, exponent: 4, choices: ["2 · 4", "2 · 2 · 2 · 2", "4 · 4"], answer: "2 · 2 · 2 · 2" },
  { base: 3, exponent: 5, choices: ["3 · 3 · 3 · 3 · 3", "3 · 5", "5 · 5 · 5"], answer: "3 · 3 · 3 · 3 · 3" },
  { base: 5, exponent: 4, choices: ["5 · 5 · 5 · 5", "5 · 4", "4 · 4 · 4 · 4 · 4"], answer: "5 · 5 · 5 · 5" },
  { base: 2, exponent: 6, choices: ["2 · 6", "6 · 6", "2 · 2 · 2 · 2 · 2 · 2"], answer: "2 · 2 · 2 · 2 · 2 · 2" },
  { base: 10, exponent: 4, choices: ["10 · 4", "10 · 10 · 10 · 10", "4 · 4 · 4 · 4 · 4 · 4 · 4 · 4 · 4 · 4"], answer: "10 · 10 · 10 · 10" },
];

interface Props {
  activity: Grade4PowersActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function Power({ base, exponent, className = "" }: { base: number | string; exponent: number; className?: string }) {
  return <span className={`inline-flex items-start whitespace-nowrap font-black ${className}`} aria-label={`${base} do potęgi ${exponent}`}>
    <span>{base}</span><sup className="ml-0.5 text-[.55em] leading-none">{exponent}</sup>
  </span>;
}

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 8" heading="Kwadraty i sześciany liczb" description="Potęga jest krótszym zapisem mnożenia jednakowych czynników.">
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
          <h3 className="text-xl font-black text-emerald-950">Kwadrat liczby</h3>
          <p className="mt-2 font-bold text-emerald-900">Potęga druga oznacza dwa jednakowe czynniki.</p>
          <div className="mx-auto mt-4 grid w-fit grid-cols-4 gap-1 rounded-2xl bg-white p-3 shadow-sm" aria-label="Kwadrat z 16 pól">
            {Array.from({ length: 16 }, (_, index) => <span key={index} className="h-7 w-7 rounded bg-emerald-400 ring-1 ring-emerald-700" />)}
          </div>
          <p className="mt-4 text-3xl font-black text-slate-950"><Power base={4} exponent={2} /> = 4 · 4 = 16</p>
          <p className="mt-2 font-black text-emerald-800">Czytamy: „cztery do potęgi drugiej” albo „kwadrat liczby cztery”.</p>
        </div>

        <div className="rounded-3xl bg-violet-50 p-5 text-center ring-2 ring-violet-200">
          <h3 className="text-xl font-black text-violet-950">Sześcian liczby</h3>
          <p className="mt-2 font-bold text-violet-900">Potęga trzecia oznacza trzy jednakowe czynniki.</p>
          <div className="mx-auto mt-4 flex w-fit gap-2 rounded-2xl bg-white p-3 shadow-sm" aria-label="Trzy warstwy po 9 pól">
            {[1, 2, 3].map((layer) => <div key={layer} className="grid grid-cols-3 gap-1">{Array.from({ length: 9 }, (_, index) => <span key={index} className="h-5 w-5 rounded bg-violet-400 ring-1 ring-violet-700" />)}</div>)}
          </div>
          <p className="mt-4 text-3xl font-black text-slate-950"><Power base={3} exponent={3} /> = 3 · 3 · 3 = 27</p>
          <p className="mt-2 font-black text-violet-800">Czytamy: „trzy do potęgi trzeciej” albo „sześcian liczby trzy”.</p>
        </div>
      </section>

      <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
        <div className="flex flex-wrap items-center justify-center gap-6 text-center">
          <Power base="a" exponent={3} className="text-5xl text-slate-950" />
          <div className="space-y-2 text-left font-bold text-cyan-950">
            <p><b className="text-2xl text-violet-700">a</b> — podstawa potęgi: mówi, jaką liczbę mnożymy.</p>
            <p><b className="text-2xl text-rose-600">3</b> — wykładnik potęgi: mówi, ile razy zapisujemy czynnik.</p>
          </div>
        </div>
      </section>
    </div>
  </LessonTaskFrame>;
}

function CuriositySlide() {
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 8" heading="Ciekawostka: inne potęgi" description="Wykładnik może być także większy niż 2 lub 3.">
    <div className="space-y-5">
      <p className="rounded-3xl bg-amber-50 px-5 py-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">Wykładnik mówi, ile jednakowych czynników zapisujemy w mnożeniu. Nie mnożymy podstawy przez wykładnik.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-indigo-50 p-5 text-center ring-2 ring-indigo-200">
          <p className="text-3xl font-black text-slate-950"><Power base={2} exponent={4} /> = 2 · 2 · 2 · 2 = 16</p>
          <p className="mt-3 font-bold text-indigo-950">Czwórka w wykładniku oznacza cztery dwójki.</p>
        </section>
        <section className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
          <p className="text-2xl font-black text-slate-950 sm:text-3xl"><Power base={3} exponent={5} /> = 3 · 3 · 3 · 3 · 3 = 243</p>
          <p className="mt-3 font-bold text-emerald-950">Piątka w wykładniku oznacza pięć trójek.</p>
        </section>
      </div>
      <p className="rounded-2xl bg-rose-100 px-4 py-4 text-center text-lg font-black text-rose-950"><Power base={2} exponent={4} /> nie oznacza 2 · 4. Potęga opisuje wielokrotne mnożenie tej samej liczby.</p>
    </div>
  </LessonTaskFrame>;
}

function CalculationSlide({ task, spoken, questionNumber, questionCount, readOnly, onResultChange }: { task: PowerTask; spoken: boolean; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const edit = (key: string) => {
    if (locked) return;
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
    onResultChange?.(correct, `${task.base}^${task.exponent}=${answer}`);
  };

  const heading = spoken ? "Oblicz potęgę zapisaną słownie" : "Oblicz potęgę";
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 8" heading={heading} description={spoken ? "Przeczytaj nazwę potęgi i wpisz jej wartość." : "Najpierw rozpisz potęgę jako mnożenie jednakowych czynników."} questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-indigo-50 p-6 text-center ring-2 ring-indigo-200">
        {spoken ? <p className="text-xl font-black leading-relaxed text-indigo-950">Oblicz: „{task.spoken}”.</p> : <div className="text-6xl text-slate-950"><Power base={task.base} exponent={task.exponent} /></div>}
        <label className="mt-5 flex flex-wrap items-center justify-center gap-3 text-3xl font-black text-slate-950">
          {spoken ? <span>Wynik:</span> : <span>=</span>}
          <input aria-label="Wartość potęgi" value={answer} inputMode="none" readOnly className="h-16 w-32 rounded-xl border-2 border-violet-400 bg-white text-center text-3xl font-black outline-none focus:border-violet-700 focus:ring-4 focus:ring-violet-200" />
        </label>
      </section>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do obliczania potęg" helperText="Wpisz wartość potęgi i zatwierdź." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wpisz wartość potęgi.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! <Power base={task.base} exponent={task.exponent} /> = {task.answer}.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.base}<sup>{task.exponent}</sup> = {task.answer}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Podpowiedź: {Array.from({ length: task.exponent }, () => task.base).join(" · ")}.</p> : null}
    </div>
  </LessonTaskFrame>;
}

function ExpansionSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: ExpansionTask; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const check = () => {
    if (!selected) {
      setFeedback("missing");
      return;
    }
    const correct = selected === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, selected);
  };

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 8" heading="Rozpisz potęgę" description="Wybierz mnożenie, które jest pełnym zapisem podanej potęgi." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200">
        <p className="text-lg font-black text-cyan-950">Który zapis przedstawia tę potęgę?</p>
        <div className="mt-4 text-6xl text-slate-950"><Power base={task.base} exponent={task.exponent} /></div>
      </section>
      <div className="grid gap-3">
        {task.choices.map((choice) => <LessonTaskChoice key={choice} selected={selected === choice} disabled={locked} onClick={() => { setSelected(choice); setFeedback(null); onResultChange?.(null); }} className="min-h-14 text-lg sm:text-xl">{choice}</LessonTaskChoice>)}
      </div>
      {!readOnly ? <button type="button" onClick={check} disabled={locked} className="min-h-12 w-full rounded-2xl bg-violet-700 px-4 font-black text-white shadow disabled:opacity-40">Sprawdź odpowiedź</button> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Wybierz jeden zapis mnożenia.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wykładnik {task.exponent} oznacza {task.exponent} jednakowych czynników.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny zapis to {task.answer}. Dziś bez punktu.</p> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4PowersLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "curiosity") return <CuriositySlide />;

  const calculationTasks = activity === "words" ? WORD_TASKS : CALCULATION_TASKS;
  const calculationTask = calculationTasks[Math.max(0, (questionNumber - 1) % calculationTasks.length)] ?? calculationTasks[Math.abs(taskSeed) % calculationTasks.length]!;
  const expansionTask = EXPANSION_TASKS[Math.max(0, (questionNumber - 1) % EXPANSION_TASKS.length)] ?? EXPANSION_TASKS[Math.abs(taskSeed) % EXPANSION_TASKS.length]!;

  return activity === "expand"
    ? <ExpansionSlide key={`expand-${expansionTask.base}-${expansionTask.exponent}-${questionNumber}`} task={expansionTask} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />
    : <CalculationSlide key={`power-${calculationTask.base}-${calculationTask.exponent}-${questionNumber}`} task={calculationTask} spoken={activity === "words"} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
