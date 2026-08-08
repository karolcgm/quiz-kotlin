"use client";

import Image from "next/image";
import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4MassUnitsActivity =
  | "information"
  | "choose-unit"
  | "conversion-example"
  | "convert"
  | "net-gross"
  | "recipe";

export function grade4MassUnitsActivityFromStageId(stageId: string): Grade4MassUnitsActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-choose-unit")) return "choose-unit";
  if (stageId.endsWith("-conversion-example")) return "conversion-example";
  if (stageId.endsWith("-convert")) return "convert";
  if (stageId.endsWith("-net-gross")) return "net-gross";
  return "recipe";
}

interface Props {
  activity: Grade4MassUnitsActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;
type AnswerPart = { unit: string; value: number };

export const MASS_UNIT_TASKS = [
  { icon: "🍎", object: "masa jabłka", answer: "g", explanation: "Masę jabłka najwygodniej podajemy w gramach." },
  { icon: "🧀", object: "porcja sera w sklepie", answer: "dag", explanation: "Porcję sera kupowaną na wagę często podajemy w dekagramach." },
  { icon: "🧒", object: "masa dziecka", answer: "kg", explanation: "Masę człowieka podajemy w kilogramach." },
  { icon: "🚚", object: "masa ciężarówki", answer: "t", explanation: "Masę ciężarówki najwygodniej podajemy w tonach." },
  { icon: "🌾", object: "torba mąki", answer: "kg", explanation: "Masę dużej torby mąki podajemy w kilogramach." },
  { icon: "🍫", object: "tabliczka czekolady", answer: "g", explanation: "Masę tabliczki czekolady podajemy w gramach." },
] as const;

type NumericTask = {
  prompt: string;
  answers: readonly AnswerPart[];
  hint?: string;
};

export const MASS_CONVERSION_TASKS: readonly NumericTask[] = [
  { prompt: "5 dag =", answers: [{ unit: "g", value: 50 }] },
  { prompt: "7 kg =", answers: [{ unit: "dag", value: 700 }] },
  { prompt: "4 kg =", answers: [{ unit: "g", value: 4000 }] },
  { prompt: "3 t =", answers: [{ unit: "kg", value: 3000 }] },
  { prompt: "235 dag =", answers: [{ unit: "kg", value: 2 }, { unit: "dag", value: 35 }] },
  { prompt: "1270 g =", answers: [{ unit: "kg", value: 1 }, { unit: "g", value: 270 }] },
  { prompt: "2045 kg =", answers: [{ unit: "t", value: 2 }, { unit: "kg", value: 45 }] },
  { prompt: "6 dag 5 g =", answers: [{ unit: "g", value: 65 }] },
] as const;

type NetGrossTask = NumericTask & {
  data: readonly { label: string; value: string; tone: string }[];
};

export const NET_GROSS_TASKS: readonly NetGrossTask[] = [
  {
    prompt: "Oblicz masę brutto truskawek w opakowaniu.",
    data: [
      { label: "masa netto", value: "750 g", tone: "bg-emerald-100" },
      { label: "tara", value: "50 g", tone: "bg-amber-100" },
    ],
    answers: [{ unit: "g", value: 800 }],
    hint: "Masa brutto = masa netto + tara.",
  },
  {
    prompt: "Oblicz masę netto produktu.",
    data: [
      { label: "masa brutto", value: "1200 g", tone: "bg-cyan-100" },
      { label: "tara", value: "200 g", tone: "bg-amber-100" },
    ],
    answers: [{ unit: "g", value: 1000 }],
    hint: "Masa netto = masa brutto − tara.",
  },
  {
    prompt: "Oblicz masę pustego opakowania, czyli tarę.",
    data: [
      { label: "masa brutto", value: "850 g", tone: "bg-cyan-100" },
      { label: "masa netto", value: "800 g", tone: "bg-emerald-100" },
    ],
    answers: [{ unit: "g", value: 50 }],
    hint: "Tara = masa brutto − masa netto.",
  },
  {
    prompt: "Oblicz masę brutto paczki.",
    data: [
      { label: "masa netto", value: "2 kg 500 g", tone: "bg-emerald-100" },
      { label: "tara", value: "250 g", tone: "bg-amber-100" },
    ],
    answers: [{ unit: "kg", value: 2 }, { unit: "g", value: 750 }],
    hint: "Dodaj 250 g do 500 g. Pełne kilogramy nie zmieniają się.",
  },
] as const;

export const RECIPE_TASK_PARTS = [
  { label: "a", prompt: "Ile gramów ważą wszystkie składniki razem?", answer: 600 },
  { label: "b", prompt: "Ile gramów ważą razem cukier i owoce?", answer: 350 },
  { label: "c", prompt: "O ile gramów owoce są cięższe od mąki?", answer: 50 },
] as const;

function FeedbackMessage({ feedback, answer, explanation }: { feedback: Feedback; answer: string; explanation?: string }) {
  if (feedback === "missing") return <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij odpowiedź.</p>;
  if (feedback === "correct") return <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! {explanation ?? `Poprawny wynik to ${answer}.`}</p>;
  if (feedback === "incorrect") return <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {answer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div>;
  return null;
}

function InformationSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 6" heading="Jednostki masy" description="Jednostkę dobieramy do masy ważonego przedmiotu.">
      <div className="space-y-5">
        <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
          <h3 className="text-center text-xl font-black text-cyan-950">Od grama do tony</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["g", "gram", "mały przedmiot"],
              ["dag", "dekagram", "porcja produktu"],
              ["kg", "kilogram", "zakupy, człowiek"],
              ["t", "tona", "bardzo ciężki obiekt"],
            ].map(([symbol, name, example]) => <div key={symbol} className="rounded-2xl bg-white p-3 text-center shadow"><p className="text-3xl font-black text-violet-800">{symbol}</p><p className="font-black">{name}</p><p className="mt-1 text-xs font-bold text-slate-600">{example}</p></div>)}
          </div>
        </section>
        <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
          <h3 className="text-center text-xl font-black text-violet-950">Najważniejsze zależności</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["1 dag = 10 g", "1 kg = 100 dag", "1 kg = 1000 g", "1 t = 1000 kg"].map((relation) => <p key={relation} className="rounded-2xl bg-white p-4 text-center text-2xl font-black shadow">{relation}</p>)}
          </div>
        </section>
        <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Im mniejsza jednostka, tym większa liczba opisuje tę samą masę.</p>
      </div>
    </LessonTaskFrame>
  );
}

function ConversionExampleSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 6" heading="Jak zamieniamy jednostki masy?" description="Najpierw sprawdź zależność między jednostkami.">
      <div className="space-y-4">
        {[
          ["Z kilogramów na gramy", "4 kg = 4 · 1000 g = 4000 g", "Każdy kilogram ma 1000 gramów."],
          ["Z dekagramów na zapis łączony", "235 dag = 2 kg 35 dag", "200 dag tworzy 2 kg, a 35 dag pozostaje."],
          ["Z kilogramów na tony i kilogramy", "2450 kg = 2 t 450 kg", "2000 kg tworzy 2 t, a 450 kg pozostaje."],
        ].map(([title, example, note], index) => <section key={title} className={`rounded-3xl p-5 ring-2 ${index === 0 ? "bg-cyan-50 ring-cyan-200" : index === 1 ? "bg-violet-50 ring-violet-200" : "bg-amber-50 ring-amber-200"}`}><p className="text-center text-lg font-black">{title}</p><div className="mt-3 rounded-2xl bg-white p-5 text-center shadow"><p className="text-3xl font-black">{example}</p><p className="mt-2 font-bold text-slate-700">{note}</p></div></section>)}
      </div>
    </LessonTaskFrame>
  );
}

function ChooseUnitSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof MASS_UNIT_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const check = () => {
    if (!selected) return setFeedback("missing");
    const correct = selected === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, selected);
  };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 6" heading="Dobierz jednostkę masy" description="Wybierz jednostkę, w której najwygodniej podać tę masę." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200"><span className="text-7xl" aria-hidden>{task.icon}</span><p className="mt-3 text-2xl font-black text-slate-950">{task.object}</p></section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{["g", "dag", "kg", "t"].map((unit) => <LessonTaskChoice key={unit} selected={selected === unit} disabled={locked} onClick={() => { setSelected(unit); setFeedback(null); onResultChange?.(null); }} className="min-h-16 text-xl">{unit}</LessonTaskChoice>)}</div>
        {!readOnly ? <button type="button" disabled={locked} onClick={check} className="min-h-12 w-full rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Zatwierdź</button> : null}
        <FeedbackMessage feedback={feedback} answer={task.answer} explanation={task.explanation} />
      </div>
    </LessonTaskFrame>
  );
}

function MassAnswerFields({ values, units, activeIndex, onSelect, labelPrefix }: { values: readonly string[]; units: readonly string[]; activeIndex: number; onSelect: (index: number) => void; labelPrefix?: string }) {
  return <div className="flex flex-wrap justify-center gap-4">{units.map((unit, index) => <label key={`${unit}-${index}`} className="flex items-center gap-2 text-xl font-black"><input aria-label={labelPrefix ? `${labelPrefix}, wynik w ${unit}` : `Wynik ${index + 1} w ${unit}`} value={values[index] ?? ""} inputMode="none" readOnly onClick={() => onSelect(index)} onFocus={() => onSelect(index)} className={`h-16 w-32 rounded-xl border-2 bg-white px-2 text-center text-2xl font-black outline-none ${activeIndex === index ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`} /><span>{unit}</span></label>)}</div>;
}

function useNumericTask(task: NumericTask, readOnly: boolean, onResultChange?: Props["onResultChange"]) {
  const [values, setValues] = useState<string[]>(() => task.answers.map(() => ""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index === activeIndex ? key === "backspace" ? value.slice(0, -1) : value.length >= 6 ? value : `${value}${key}` : value));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) return setFeedback("missing");
    const correct = task.answers.every((answer, index) => Number(values[index]) === answer.value);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join("|"));
  };
  return { values, activeIndex, setActiveIndex, feedback, locked, edit, check };
}

function ConversionSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: NumericTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const state = useNumericTask(task, readOnly, onResultChange);
  const correctAnswer = task.answers.map((answer) => `${answer.value} ${answer.unit}`).join(" ");
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 6" heading="Zamień jednostki masy" description="Uzupełnij jedną lub dwie kratki." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200"><p className="text-4xl font-black text-slate-950">{task.prompt}</p><div className="mt-5"><MassAnswerFields values={state.values} units={task.answers.map((answer) => answer.unit)} activeIndex={state.activeIndex} onSelect={state.setActiveIndex} /></div></section>
        {!readOnly ? <LessonNumericKeypad onKey={state.edit} onConfirm={state.check} disabled={state.locked} label="Klawiatura do zamiany masy" helperText={`Wpisujesz wynik w ${task.answers[state.activeIndex]?.unit ?? "jednostce"}.`} /> : null}
        <FeedbackMessage feedback={state.feedback} answer={correctAnswer} />
      </div>
    </LessonTaskFrame>
  );
}

function NetGrossSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: NetGrossTask; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const state = useNumericTask(task, readOnly, onResultChange);
  const correctAnswer = task.answers.map((answer) => `${answer.value} ${answer.unit}`).join(" ");
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 6" heading="Masa netto, tara i masa brutto" description="Sprawdź, czy ważymy sam produkt, opakowanie czy wszystko razem." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200">
          <div className="relative aspect-[3/2] max-h-64 w-full overflow-hidden"><Image src="/images/lessons/grade4/mass/net-gross-package.png" alt="Pojemnik z truskawkami na wadze i takie samo puste opakowanie obok" fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" /></div>
          <div className="grid gap-2 p-4 text-center sm:grid-cols-3"><p className="rounded-xl bg-emerald-100 p-3 font-black"><span className="block text-emerald-800">Masa netto</span>produkt bez opakowania</p><p className="rounded-xl bg-amber-100 p-3 font-black"><span className="block text-amber-800">Tara</span>puste opakowanie</p><p className="rounded-xl bg-cyan-100 p-3 font-black"><span className="block text-cyan-800">Masa brutto</span>produkt z opakowaniem</p></div>
        </section>
        <section className="rounded-3xl bg-violet-50 p-5 text-center ring-2 ring-violet-200"><p className="text-xl font-black">{task.prompt}</p><div className="mt-4 flex flex-wrap justify-center gap-3">{task.data.map((item) => <div key={item.label} className={`rounded-2xl px-4 py-3 shadow ${item.tone}`}><p className="text-sm font-black uppercase tracking-wide">{item.label}</p><p className="text-2xl font-black">{item.value}</p></div>)}</div><div className="mt-5"><MassAnswerFields values={state.values} units={task.answers.map((answer) => answer.unit)} activeIndex={state.activeIndex} onSelect={state.setActiveIndex} /></div><p className="mt-4 font-bold text-violet-800">{task.hint}</p></section>
        {!readOnly ? <LessonNumericKeypad onKey={state.edit} onConfirm={state.check} disabled={state.locked} label="Klawiatura do masy netto i brutto" helperText={`Wpisujesz wynik w ${task.answers[state.activeIndex]?.unit ?? "jednostce"}.`} /> : null}
        <FeedbackMessage feedback={state.feedback} answer={correctAnswer} />
      </div>
    </LessonTaskFrame>
  );
}

function RecipeSlide({ questionNumber, questionCount, readOnly, onResultChange }: { questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const task: NumericTask = { prompt: "", answers: RECIPE_TASK_PARTS.map((part) => ({ unit: "g", value: part.answer })), hint: "Najpierw zamień dekagramy na gramy." };
  const state = useNumericTask(task, readOnly, onResultChange);
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 6" heading="Owocowe muffinki" description="Odczytaj dane z przepisu i odpowiedz na trzy pytania." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200">
          <div className="relative aspect-[3/2] max-h-72 w-full overflow-hidden"><Image src="/images/lessons/grade4/mass/recipe-muffins.png" alt="Dzieci przygotowujące owocowe muffinki w kuchni" fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" /></div>
          <div className="p-5">
            <p className="text-center text-xl font-black">Do przygotowania muffinek użyto 25 dag mąki, 5 dag cukru oraz 300 g owoców.</p>
            <p className="mt-3 text-center font-bold text-violet-800">{task.hint}</p>
            <div className="mt-5 space-y-3">
              {RECIPE_TASK_PARTS.map((part, index) => (
                <section key={part.label} className="rounded-2xl bg-white p-4 shadow">
                  <p className="text-lg font-black"><span className="mr-2 text-violet-800">{part.label})</span>{part.prompt}</p>
                  <div className="mt-4"><MassAnswerFields values={[state.values[index] ?? ""]} units={["g"]} activeIndex={state.activeIndex === index ? 0 : -1} onSelect={() => state.setActiveIndex(index)} labelPrefix={`Podpunkt ${part.label}`} /></div>
                </section>
              ))}
            </div>
          </div>
        </section>
        {!readOnly ? <LessonNumericKeypad onKey={state.edit} onConfirm={state.check} disabled={state.locked} label="Klawiatura do zadania z przepisem" helperText={`Wpisz wynik podpunktu ${RECIPE_TASK_PARTS[state.activeIndex]?.label ?? "a"} w gramach.`} /> : null}
        <FeedbackMessage feedback={state.feedback} answer={RECIPE_TASK_PARTS.map((part) => `${part.label}) ${part.answer} g`).join("; ")} />
      </div>
    </LessonTaskFrame>
  );
}

export function Grade4MassUnitsLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "conversion-example") return <ConversionExampleSlide />;
  if (activity === "choose-unit") {
    const task = MASS_UNIT_TASKS[(questionNumber - 1) % MASS_UNIT_TASKS.length] ?? MASS_UNIT_TASKS[Math.abs(taskSeed) % MASS_UNIT_TASKS.length]!;
    return <ChooseUnitSlide key={`unit-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  if (activity === "convert") {
    const task = MASS_CONVERSION_TASKS[(questionNumber - 1) % MASS_CONVERSION_TASKS.length] ?? MASS_CONVERSION_TASKS[Math.abs(taskSeed) % MASS_CONVERSION_TASKS.length]!;
    return <ConversionSlide key={`convert-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  if (activity === "net-gross") {
    const task = NET_GROSS_TASKS[(questionNumber - 1) % NET_GROSS_TASKS.length] ?? NET_GROSS_TASKS[Math.abs(taskSeed) % NET_GROSS_TASKS.length]!;
    return <NetGrossSlide key={`net-gross-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  return <RecipeSlide questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
