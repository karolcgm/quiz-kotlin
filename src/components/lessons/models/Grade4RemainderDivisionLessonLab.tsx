"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4RemainderDivisionActivity = "information" | "practice" | "stories" | "remainders";

export function grade4RemainderDivisionActivityFromStageId(stageId: string): Grade4RemainderDivisionActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-stories")) return "stories";
  if (stageId.endsWith("-remainders")) return "remainders";
  return "practice";
}

type DivisionTask = { dividend: number; divisor: number; quotient: number; remainder: number };

const DIVISION_TASKS: DivisionTask[] = [
  { dividend: 17, divisor: 5, quotient: 3, remainder: 2 },
  { dividend: 26, divisor: 4, quotient: 6, remainder: 2 },
  { dividend: 38, divisor: 6, quotient: 6, remainder: 2 },
  { dividend: 45, divisor: 7, quotient: 6, remainder: 3 },
  { dividend: 59, divisor: 8, quotient: 7, remainder: 3 },
  { dividend: 73, divisor: 9, quotient: 8, remainder: 1 },
  { dividend: 64, divisor: 6, quotient: 10, remainder: 4 },
  { dividend: 68, divisor: 9, quotient: 7, remainder: 5 },
];

const REMAINDER_TASKS = [6, 4, 5, 7, 3];

type StoryTask = DivisionTask & {
  prompt: string;
  answerLead: string;
  quotientAnswer: string;
  remainderAnswer: string;
};

const STORY_TASKS: StoryTask[] = [
  {
    dividend: 29, divisor: 4, quotient: 7, remainder: 1,
    prompt: "Piekarnia ma 29 babeczek. Układa po 4 babeczki w każdym pudełku. Ile pełnych pudełek przygotuje i ile babeczek zostanie?",
    answerLead: "Piekarnia przygotuje",
    quotientAnswer: "pełnych pudełek", remainderAnswer: "babeczka",
  },
  {
    dividend: 38, divisor: 6, quotient: 6, remainder: 2,
    prompt: "Bibliotekarka ustawia 38 książek na półkach, po 6 książek na każdej półce. Ile pełnych półek zapełni i ile książek zostanie?",
    answerLead: "Bibliotekarka zapełni",
    quotientAnswer: "pełnych półek", remainderAnswer: "książki",
  },
  {
    dividend: 53, divisor: 8, quotient: 6, remainder: 5,
    prompt: "Z 53 koralików wykonujemy bransoletki. Na każdą bransoletkę potrzeba 8 koralików. Ile całych bransoletek można zrobić i ile koralików zostanie?",
    answerLead: "Można zrobić",
    quotientAnswer: "całych bransoletek", remainderAnswer: "koralików",
  },
  {
    dividend: 47, divisor: 5, quotient: 9, remainder: 2,
    prompt: "Nauczyciel dzieli 47 kart na zestawy po 5 kart. Ile pełnych zestawów utworzy i ile kart zostanie?",
    answerLead: "Nauczyciel utworzy",
    quotientAnswer: "pełnych zestawów", remainderAnswer: "karty",
  },
];

interface Props {
  activity: Grade4RemainderDivisionActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function Candy({ faded = false }: { faded?: boolean }) {
  return <span aria-hidden className={`inline-block h-5 w-8 rounded-full border-2 border-rose-700 bg-gradient-to-br from-rose-300 to-rose-500 shadow-sm ${faded ? "opacity-70" : ""}`} />;
}

function InformationSlide() {
  return <LessonTaskFrame eyebrow="Dział 1 · Temat 7" heading="Dzielenie z resztą" description="Dzielimy po równo, a to, czego nie można już rozdać, nazywamy resztą.">
    <div className="space-y-5">
      <section className="rounded-3xl bg-amber-50 p-5 text-center ring-2 ring-amber-200">
        <p className="text-xl font-black leading-relaxed text-amber-950">Mam 20 cukierków. Dzielę je po równo między troje dzieci, a resztę zabieram dla siebie.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((child) => <div key={child} className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="text-4xl" aria-hidden>🧒</div>
            <p className="mb-2 font-black text-slate-800">Dziecko {child}</p>
            <div className="flex flex-wrap justify-center gap-1.5">{Array.from({ length: 6 }, (_, index) => <Candy key={index} />)}</div>
            <p className="mt-2 font-bold text-slate-700">6 cukierków</p>
          </div>)}
        </div>
        <div className="mx-auto mt-4 max-w-sm rounded-2xl bg-rose-100 p-3 ring-2 ring-rose-200">
          <p className="font-black text-rose-950">Dla mnie zostają:</p>
          <div className="mt-2 flex justify-center gap-2"><Candy faded /><Candy faded /></div>
          <p className="mt-2 font-bold text-rose-900">2 cukierki — to jest reszta</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl bg-indigo-50 p-5 text-center ring-2 ring-indigo-200">
          <p className="text-sm font-black uppercase tracking-widest text-indigo-700">Zapis dzielenia</p>
          <p className="mt-3 whitespace-nowrap text-3xl font-black text-slate-950">20 : 3 = 6 r 2</p>
          <p className="mt-2 font-bold text-indigo-950">Każde dziecko dostaje 6, a reszta wynosi 2.</p>
        </div>
        <div className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
          <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Sprawdzenie</p>
          <p className="mt-3 whitespace-nowrap text-3xl font-black text-slate-950">3 · 6 + 2 = 20</p>
          <p className="mt-2 font-bold text-emerald-950">dzielnik · iloraz + reszta = dzielna</p>
        </div>
      </section>

      <p className="rounded-2xl bg-cyan-100 px-4 py-4 text-center text-lg font-black text-cyan-950">Reszta zawsze jest mniejsza od dzielnika. Przy dzieleniu przez 3 reszta może wynosić 0, 1 albo 2.</p>
    </div>
  </LessonTaskFrame>;
}

function AnswerInput({ label, value, active, onSelect }: { label: string; value: string; active: boolean; onSelect: () => void }) {
  return <input aria-label={label} value={value} onClick={onSelect} inputMode="none" readOnly className={`h-14 w-20 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${active ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`} />;
}

function PracticeSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: DivisionTask; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [values, setValues] = useState(["", "", ""]);
  const [activeField, setActiveField] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index === activeField
      ? key === "backspace" ? value.slice(0, -1) : value.length >= 3 ? value : `${value}${key}`
      : value));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (values.some((value) => value === "")) {
      setFeedback("missing");
      return;
    }
    const correct = Number(values[0]) === task.quotient && Number(values[1]) === task.remainder && Number(values[2]) === task.dividend;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${task.dividend}:${task.divisor}=${values[0]}r${values[1]}; ${task.divisor}*${values[0]}+${values[1]}=${values[2]}`);
  };

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 7" heading="Podziel z resztą i sprawdź" description="Wpisz iloraz i resztę, a następnie wykonaj sprawdzenie." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-indigo-50 p-5 text-center ring-2 ring-indigo-200">
        <p className="text-sm font-black uppercase tracking-widest text-indigo-700">Dzielenie</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-3xl font-black text-slate-950">
          <span>{task.dividend} : {task.divisor} =</span>
          <AnswerInput label="Iloraz" value={values[0]} active={activeField === 0} onSelect={() => setActiveField(0)} />
          <span>r</span>
          <AnswerInput label="Reszta" value={values[1]} active={activeField === 1} onSelect={() => setActiveField(1)} />
        </div>
      </section>

      <section className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
        <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Sprawdzenie</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-slate-950">
          <span>{task.divisor} · {values[0] || "?"} + {values[1] || "?"} =</span>
          <AnswerInput label="Wynik sprawdzenia" value={values[2]} active={activeField === 2} onSelect={() => setActiveField(2)} />
        </div>
        <p className="mt-3 font-bold text-emerald-950">Wynik sprawdzenia powinien być równy dzielnej.</p>
      </section>

      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do dzielenia z resztą" helperText="Dotknij kolejno kratki ilorazu, reszty i wyniku sprawdzenia." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij iloraz, resztę i wynik sprawdzenia.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Dzielenie i sprawdzenie są poprawne.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.dividend} : {task.divisor} = {task.quotient} r {task.remainder}, a sprawdzenie: {task.divisor} · {task.quotient} + {task.remainder} = {task.dividend}. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Pamiętaj: reszta musi być mniejsza od {task.divisor}.</p> : null}
    </div>
  </LessonTaskFrame>;
}

function StorySlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: StoryTask; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [values, setValues] = useState(["", "", "", "", ""]);
  const [activeField, setActiveField] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index === activeField
      ? key === "backspace" ? value.slice(0, -1) : value.length >= 3 ? value : `${value}${key}`
      : value));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (values.some((value) => value === "")) {
      setFeedback("missing");
      return;
    }
    const expected = [task.dividend, task.divisor, task.quotient, task.remainder, task.dividend];
    const correct = expected.every((value, index) => Number(values[index]) === value);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${values[0]}:${values[1]}=${values[2]}r${values[3]}; ${values[1]}*${values[2]}+${values[3]}=${values[4]}`);
  };

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 7" heading="Zadanie z treścią" description="Zapisz działanie, oblicz iloraz i resztę, a następnie wykonaj sprawdzenie." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <p className="rounded-3xl bg-amber-50 px-5 py-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">{task.prompt}</p>

      <section className="rounded-3xl bg-indigo-50 p-5 text-center ring-2 ring-indigo-200">
        <p className="text-sm font-black uppercase tracking-widest text-indigo-700">Działanie</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-slate-950">
          <AnswerInput label="Dzielna" value={values[0]} active={activeField === 0} onSelect={() => setActiveField(0)} />
          <span>:</span>
          <AnswerInput label="Dzielnik" value={values[1]} active={activeField === 1} onSelect={() => setActiveField(1)} />
          <span>=</span>
          <AnswerInput label="Iloraz" value={values[2]} active={activeField === 2} onSelect={() => setActiveField(2)} />
          <span>r</span>
          <AnswerInput label="Reszta" value={values[3]} active={activeField === 3} onSelect={() => setActiveField(3)} />
        </div>
      </section>

      <section className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200">
        <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Sprawdzenie</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-slate-950">
          <span>{values[1] || "?"} · {values[2] || "?"} + {values[3] || "?"} =</span>
          <AnswerInput label="Wynik sprawdzenia" value={values[4]} active={activeField === 4} onSelect={() => setActiveField(4)} />
        </div>
      </section>

      <p className="rounded-2xl bg-cyan-50 px-4 py-4 text-center text-lg font-black text-cyan-950 ring-2 ring-cyan-200">
        Odpowiedź: {task.answerLead} <span className="inline-block min-w-8 text-violet-700">{values[2] || "□"}</span> {task.quotientAnswer}, a zostanie <span className="inline-block min-w-8 text-violet-700">{values[3] || "□"}</span> {task.remainderAnswer}.
      </p>

      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do zadania z treścią" helperText="Dotknij kolejno każdej kratki w działaniu i sprawdzeniu." /> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij całe działanie i wynik sprawdzenia.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Działanie, sprawdzenie i odpowiedź są poprawne.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.dividend} : {task.divisor} = {task.quotient} r {task.remainder}, a sprawdzenie: {task.divisor} · {task.quotient} + {task.remainder} = {task.dividend}. Dziś bez punktu.</p> : null}
    </div>
  </LessonTaskFrame>;
}

function RemaindersSlide({ divisor, questionNumber, questionCount, readOnly, onResultChange }: { divisor: number; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const choices = Array.from({ length: divisor + 2 }, (_, index) => index);
  const expected = Array.from({ length: divisor }, (_, index) => index);
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "missing" | null>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";

  const toggle = (value: number) => {
    if (locked) return;
    setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value].sort((a, b) => a - b));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (selected.length === 0) {
      setFeedback("missing");
      return;
    }
    const correct = selected.length === expected.length && expected.every((value) => selected.includes(value));
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, selected.join(","));
  };

  return <LessonTaskFrame eyebrow="Dział 1 · Temat 7" heading="Jakie reszty są możliwe?" description="Wybierz wszystkie liczby, które mogą być resztą." questionNumber={questionNumber} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 p-5 text-center ring-2 ring-cyan-200">
        <p className="text-xl font-black text-cyan-950">Wybierz wszystkie możliwe reszty z dzielenia przez {divisor}.</p>
        <p className="mt-2 font-bold text-cyan-900">Możesz zaznaczyć więcej niż jedną odpowiedź.</p>
      </section>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {choices.map((value) => <LessonTaskChoice key={value} selected={selected.includes(value)} disabled={locked} onClick={() => toggle(value)} className="min-h-14 text-xl">{value}</LessonTaskChoice>)}
      </div>
      {!readOnly ? <button type="button" onClick={check} disabled={locked} className="min-h-12 w-full rounded-2xl bg-violet-700 px-4 font-black text-white shadow disabled:opacity-40">Sprawdź odpowiedź</button> : null}
      {feedback === "missing" ? <p role="alert" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Zaznacz co najmniej jedną możliwą resztę.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Reszta może wynosić od 0 do {divisor - 1}.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawne reszty to: {expected.join(", ")}. Reszta zawsze jest mniejsza od dzielnika. Dziś bez punktu.</p> : null}
      {!feedback ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-600">Reszta 0 także jest możliwa — wtedy liczba dzieli się bez reszty.</p> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade4RemainderDivisionLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;

  const divisionTask = DIVISION_TASKS[Math.max(0, (questionNumber - 1) % DIVISION_TASKS.length)] ?? DIVISION_TASKS[Math.abs(taskSeed) % DIVISION_TASKS.length]!;
  const storyTask = STORY_TASKS[Math.max(0, (questionNumber - 1) % STORY_TASKS.length)] ?? STORY_TASKS[Math.abs(taskSeed) % STORY_TASKS.length]!;
  const divisor = REMAINDER_TASKS[Math.max(0, (questionNumber - 1) % REMAINDER_TASKS.length)] ?? REMAINDER_TASKS[Math.abs(taskSeed) % REMAINDER_TASKS.length]!;

  if (activity === "stories") return <StorySlide key={`story-${storyTask.dividend}-${questionNumber}`} task={storyTask} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;

  return activity === "remainders"
    ? <RemaindersSlide key={`remainders-${divisor}-${questionNumber}`} divisor={divisor} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />
    : <PracticeSlide key={`division-${divisionTask.dividend}-${questionNumber}`} task={divisionTask} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
