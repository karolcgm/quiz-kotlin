"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4RomanNumeralsActivity = "information" | "worked-example" | "read" | "write" | "check-record";

export function grade4RomanNumeralsActivityFromStageId(stageId: string): Grade4RomanNumeralsActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-worked-example")) return "worked-example";
  if (stageId.endsWith("-read")) return "read";
  if (stageId.endsWith("-write")) return "write";
  return "check-record";
}

interface Props {
  activity: Grade4RomanNumeralsActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;

export const ROMAN_READ_TASKS = [
  { roman: "III", answer: 3, explanation: "I + I + I = 1 + 1 + 1 = 3" },
  { roman: "VIII", answer: 8, explanation: "V + III = 5 + 3 = 8" },
  { roman: "XIV", answer: 14, explanation: "X + IV = 10 + 4 = 14" },
  { roman: "XIX", answer: 19, explanation: "X + IX = 10 + 9 = 19" },
  { roman: "XXIV", answer: 24, explanation: "XX + IV = 20 + 4 = 24" },
  { roman: "XXXIX", answer: 39, explanation: "XXX + IX = 30 + 9 = 39" },
  { roman: "XLII", answer: 42, explanation: "XL + II = 40 + 2 = 42" },
  { roman: "XCIV", answer: 94, explanation: "XC + IV = 90 + 4 = 94" },
] as const;

export const ROMAN_WRITE_TASKS = [
  { natural: 2, answer: "II", hint: "2 = 1 + 1" },
  { natural: 6, answer: "VI", hint: "6 = 5 + 1" },
  { natural: 9, answer: "IX", hint: "9 to jeden przed dziesięć." },
  { natural: 13, answer: "XIII", hint: "13 = 10 + 3" },
  { natural: 24, answer: "XXIV", hint: "24 = 20 + 4" },
  { natural: 38, answer: "XXXVIII", hint: "38 = 30 + 8" },
  { natural: 47, answer: "XLVII", hint: "47 = 40 + 7" },
  { natural: 92, answer: "XCII", hint: "92 = 90 + 2" },
] as const;

export const ROMAN_CHECK_TASKS = [
  { natural: 4, roman: "IV", correct: true, correctRecord: "4 = IV" },
  { natural: 8, roman: "IIX", correct: false, correctRecord: "8 = VIII" },
  { natural: 14, roman: "XIV", correct: true, correctRecord: "14 = XIV" },
  { natural: 19, roman: "XVIIII", correct: false, correctRecord: "19 = XIX" },
  { natural: 24, roman: "XXIV", correct: true, correctRecord: "24 = XXIV" },
  { natural: 29, roman: "XXIX", correct: true, correctRecord: "29 = XXIX" },
  { natural: 40, roman: "XXXX", correct: false, correctRecord: "40 = XL" },
  { natural: 44, roman: "XLIV", correct: true, correctRecord: "44 = XLIV" },
] as const;

function FeedbackMessage({ feedback, answer, explanation }: { feedback: Feedback; answer: string; explanation?: string }) {
  if (feedback === "missing") return <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij odpowiedź.</p>;
  if (feedback === "correct") return <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! {explanation ?? `Poprawna odpowiedź to ${answer}.`}</p>;
  if (feedback === "incorrect") return <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {answer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div>;
  return null;
}

function InformationSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 7" heading="Pierwsze spotkanie z systemem rzymskim" description="W tym systemie liczby zapisujemy za pomocą liter. Każda litera ma swoją wartość.">
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
          <h3 className="text-center text-xl font-black text-cyan-950">Znaki, które dziś poznajemy</h3>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[["I", "1"], ["V", "5"], ["X", "10"], ["L", "50"], ["C", "100"]].map(([roman, value]) => <div key={roman} className="rounded-2xl bg-white p-3 text-center shadow"><p className="font-serif text-4xl font-black text-violet-800">{roman}</p><p className="mt-1 font-black">{value}</p></div>)}
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-3xl bg-emerald-50 p-5 ring-2 ring-emerald-200"><h3 className="text-center text-lg font-black text-emerald-950">Mniejszy znak po większym — dodajemy</h3><p className="mt-3 rounded-2xl bg-white p-4 text-center font-serif text-3xl font-black">XIII = 10 + 1 + 1 + 1 = 13</p></section>
          <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200"><h3 className="text-center text-lg font-black text-amber-950">Mniejszy znak przed większym — odejmujemy</h3><p className="mt-3 rounded-2xl bg-white p-4 text-center font-serif text-3xl font-black">IV = 5 − 1 = 4</p></section>
        </div>
        <section className="rounded-3xl bg-violet-50 p-4 text-center font-bold ring-2 ring-violet-200"><p><strong>I</strong> stawiamy przed <strong>V</strong> lub <strong>X</strong>: IV = 4, IX = 9.</p><p className="mt-1"><strong>X</strong> stawiamy przed <strong>L</strong> lub <strong>C</strong>: XL = 40, XC = 90.</p><p className="mt-2 text-violet-900">I oraz X mogą wystąpić najwyżej trzy razy obok siebie. V i L nie powtarzamy.</p></section>
      </div>
    </LessonTaskFrame>
  );
}

function WorkedExampleSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 7" heading="Jak zapisujemy liczbę rzymską?" description="Rozbij liczbę na dziesiątki i jedności, a potem połącz zapis.">
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200"><h3 className="text-center text-xl font-black">Zapisujemy 24</h3><div className="mt-4 grid grid-cols-3 items-center gap-2 text-center"><p className="rounded-2xl bg-white p-4 text-2xl font-black shadow">24 = 20 + 4</p><p className="rounded-2xl bg-white p-4 font-serif text-2xl font-black shadow">XX + IV</p><p className="rounded-2xl bg-violet-700 p-4 font-serif text-3xl font-black text-white shadow">XXIV</p></div></section>
        <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200"><h3 className="text-center text-xl font-black">Odczytujemy XXXIX</h3><div className="mt-4 grid grid-cols-3 items-center gap-2 text-center"><p className="rounded-2xl bg-white p-4 font-serif text-2xl font-black shadow">XXX + IX</p><p className="rounded-2xl bg-white p-4 text-2xl font-black shadow">30 + 9</p><p className="rounded-2xl bg-amber-500 p-4 text-3xl font-black text-white shadow">39</p></div></section>
        <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">Najpierw szukaj par IV, IX, XL lub XC. Pozostałe znaki dodawaj.</p>
      </div>
    </LessonTaskFrame>
  );
}

function ReadSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof ROMAN_READ_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => { if (locked) return; setValue((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 3 ? current : `${current}${key}`); setFeedback(null); onResultChange?.(null); };
  const check = () => { if (!value) return setFeedback("missing"); const correct = Number(value) === task.answer; setFeedback(correct ? "correct" : "incorrect"); onResultChange?.(correct, value); };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 7" heading="Odczytaj liczbę rzymską" description="Wpisz odpowiadającą jej liczbę naturalną." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4"><section className="rounded-3xl bg-cyan-50 p-7 text-center ring-2 ring-cyan-200"><p className="font-serif text-6xl font-black text-violet-950">{task.roman}</p><div className="mt-5 flex items-center justify-center gap-3"><span className="text-3xl font-black">=</span><input aria-label="Liczba naturalna" value={value} inputMode="none" readOnly className="h-16 w-36 rounded-xl border-2 border-violet-400 bg-white text-center text-3xl font-black outline-none" /></div></section>{!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do odczytywania liczb rzymskich" helperText="Wpisz liczbę naturalną i zatwierdź." /> : null}<FeedbackMessage feedback={feedback} answer={String(task.answer)} explanation={task.explanation} /></div>
    </LessonTaskFrame>
  );
}

function RomanKeypad({ onKey, onConfirm, disabled }: { onKey: (key: string) => void; onConfirm: () => void; disabled: boolean }) {
  return <div aria-label="Klawiatura znaków rzymskich" className="rounded-3xl bg-slate-950 p-4 text-center text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Klawiatura znaków rzymskich</p><div className="mt-3 grid grid-cols-5 gap-2">{["I", "V", "X", "L", "C"].map((key) => <button key={key} type="button" disabled={disabled} onClick={() => onKey(key)} className="min-h-14 rounded-xl bg-white font-serif text-2xl font-black text-slate-950 disabled:opacity-40">{key}</button>)}</div><button type="button" disabled={disabled} onClick={() => onKey("backspace")} className="mt-2 min-h-12 w-full rounded-xl bg-rose-300 font-black text-rose-950 disabled:opacity-40">← Usuń</button><button type="button" disabled={disabled} onClick={onConfirm} className="mt-2 min-h-12 w-full rounded-xl bg-cyan-300 font-black text-cyan-950 disabled:opacity-40">Zatwierdź</button></div>;
}

function WriteSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof ROMAN_WRITE_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => { if (locked) return; setValue((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 10 ? current : `${current}${key}`); setFeedback(null); onResultChange?.(null); };
  const check = () => { if (!value) return setFeedback("missing"); const correct = value === task.answer; setFeedback(correct ? "correct" : "incorrect"); onResultChange?.(correct, value); };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 7" heading="Zapisz liczbę po rzymsku" description="Użyj znaków z klawiatury lekcji." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4"><section className="rounded-3xl bg-violet-50 p-7 text-center ring-2 ring-violet-200"><div className="flex items-center justify-center gap-3"><span className="text-5xl font-black">{task.natural}</span><span className="text-3xl font-black">=</span><input aria-label="Zapis rzymski" value={value} inputMode="none" readOnly className="h-16 w-52 rounded-xl border-2 border-violet-400 bg-white px-2 text-center font-serif text-3xl font-black outline-none" /></div><p className="mt-4 font-bold text-violet-900">Podpowiedź: {task.hint}</p></section>{!readOnly ? <RomanKeypad onKey={edit} onConfirm={check} disabled={locked} /> : null}<FeedbackMessage feedback={feedback} answer={task.answer} /></div>
    </LessonTaskFrame>
  );
}

function CheckRecordSlide({ questionNumber, questionCount, readOnly, onResultChange }: { questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const correctIndexes = ROMAN_CHECK_TASKS.flatMap((task, index) => task.correct ? [index] : []);
  const correctRecords = ROMAN_CHECK_TASKS.filter((task) => task.correct).map((task) => task.correctRecord);
  const toggle = (index: number) => {
    if (locked) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (selected.size === 0) return setFeedback("missing");
    const correct = selected.size === correctIndexes.length && correctIndexes.every((index) => selected.has(index));
    const answer = [...selected].sort((a, b) => a - b).map((index) => ROMAN_CHECK_TASKS[index]!.correctRecord).join(", ");
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 7" heading="Czy zapis jest prawidłowy?" description="Zaznacz wszystkie prawidłowe zapisy i zatwierdź całość." questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
          <p className="text-center text-lg font-black text-amber-950">Zaznacz prawidłowe pary.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {ROMAN_CHECK_TASKS.map((task, index) => {
              const isSelected = selected.has(index);
              return (
                <button
                  key={`${task.natural}-${task.roman}`}
                  type="button"
                  aria-label={`${task.natural} = ${task.roman}`}
                  aria-pressed={isSelected}
                  disabled={locked}
                  onClick={() => toggle(index)}
                  className={`min-h-16 rounded-2xl px-3 py-3 text-center text-2xl font-black shadow-sm ring-2 transition ${isSelected ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-950 ring-violet-200 hover:ring-violet-500"} disabled:cursor-default`}
                >
                  <span>{task.natural}</span>
                  <span className={`mx-2 ${isSelected ? "text-violet-200" : "text-slate-400"}`}>=</span>
                  <span className="font-serif">{task.roman}</span>
                </button>
              );
            })}
          </div>
        </section>
        {!readOnly ? <button type="button" disabled={locked} onClick={check} className="min-h-12 w-full rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Zatwierdź</button> : null}
        <FeedbackMessage feedback={feedback} answer={correctRecords.join(", ")} explanation="Zaznaczono wszystkie prawidłowe zapisy." />
      </div>
    </LessonTaskFrame>
  );
}

export function Grade4RomanNumeralsLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "worked-example") return <WorkedExampleSlide />;
  if (activity === "read") { const task = ROMAN_READ_TASKS[(questionNumber - 1) % ROMAN_READ_TASKS.length] ?? ROMAN_READ_TASKS[Math.abs(taskSeed) % ROMAN_READ_TASKS.length]!; return <ReadSlide key={`read-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />; }
  if (activity === "write") { const task = ROMAN_WRITE_TASKS[(questionNumber - 1) % ROMAN_WRITE_TASKS.length] ?? ROMAN_WRITE_TASKS[Math.abs(taskSeed) % ROMAN_WRITE_TASKS.length]!; return <WriteSlide key={`write-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />; }
  return <CheckRecordSlide key={`check-${questionNumber}`} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
