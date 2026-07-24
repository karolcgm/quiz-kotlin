"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

interface Props {
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type NumberLineTask = {
  base: number;
  step: number;
  known: readonly number[];
  blanks: readonly number[];
};

const GRADE_SIX_TASKS: readonly NumberLineTask[] = [
  { base: 120, step: 20, known: [1, 5], blanks: [0, 3, 6] },
  { base: 300, step: 50, known: [1, 5], blanks: [0, 3, 6] },
  { base: 600, step: 40, known: [1, 5], blanks: [0, 3, 6] },
  { base: 900, step: 25, known: [1, 5], blanks: [0, 3, 6] },
  { base: 1_200, step: 100, known: [1, 5], blanks: [0, 3, 6] },
];

function NumberKeypad({ onPress, disabled }: { onPress: (key: string) => void; disabled: boolean }) {
  return (
    <section className="rounded-2xl bg-slate-900 p-3 text-white" aria-label="Klawiatura ekranowa do osi liczbowej">
      <p className="mb-2 text-center text-xs font-black uppercase tracking-[.14em] text-cyan-200">Wybierz puste pole, potem wpisz liczbę</p>
      <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((key) => (
          <button key={key} type="button" disabled={disabled} onClick={() => onPress(key)} className="min-h-11 rounded-xl bg-white text-lg font-black text-slate-950 disabled:opacity-50">{key}</button>
        ))}
        <button type="button" disabled={disabled} onClick={() => onPress("backspace")} className="col-span-5 min-h-11 rounded-xl bg-rose-300 font-black text-rose-950 disabled:opacity-50">← Usuń</button>
      </div>
    </section>
  );
}

function axisTaskFor(seed: number, taskSeed?: number, questionNumber?: number): NumberLineTask {
  const source = taskSeed ?? seed;
  if (seed >= 600) return GRADE_SIX_TASKS[(source + (questionNumber ?? 0)) % GRADE_SIX_TASKS.length] ?? GRADE_SIX_TASKS[0]!;
  return { base: 20 + (seed % 21), step: 5, known: [1, 5], blanks: [0, 3, 6] };
}

export function NumberLineJumpsModel({ seed, taskSeed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const task = useMemo(() => axisTaskFor(seed, taskSeed, questionNumber), [seed, taskSeed, questionNumber]);
  const values = useMemo(() => Array.from({ length: 7 }, (_, index) => task.base + index * task.step), [task]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeBlank, setActiveBlank] = useState<number>(task.blanks[0]!);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | "empty" | null>(null);
  const reporter = useRef(onResultChange);

  useEffect(() => { reporter.current = onResultChange; }, [onResultChange]);
  useEffect(() => {
    setAnswers({});
    setActiveBlank(task.blanks[0]!);
    setFeedback(null);
    reporter.current?.(null);
  }, [task, taskSeed, questionNumber]);

  const updateAnswer = (key: string) => {
    if (readOnly) return;
    setAnswers((current) => {
      const previous = current[activeBlank] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : `${previous}${key}`.slice(0, 5);
      return { ...current, [activeBlank]: next };
    });
    setFeedback(null);
    onResultChange?.(null);
  };

  const complete = task.blanks.every((index) => answers[index] !== "");
  const correct = complete && task.blanks.every((index) => Number(answers[index]) === values[index]);
  const submittedAnswer = task.blanks.map((index) => answers[index] ?? "").join(", ");
  const check = () => {
    if (!complete) {
      setFeedback("empty");
      onResultChange?.(null);
      return;
    }
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, submittedAnswer);
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 1 · Temat 1"
      heading="Liczby na osi"
      description="Dwie podpisane kreski ustalają skalę osi. Uzupełnij brakujące liczby — nie wszystkie wartości są podane."
      questionNumber={questionNumber}
      questionCount={questionCount}
      contentClassName="space-y-5"
    >
      <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-3 shadow-sm sm:p-5" aria-label="Oś liczbowa z pustymi polami">
        <p className="mb-4 text-center text-sm font-bold text-slate-700">Policz równe odstępy między dwiema podpisanymi kreskami.</p>
        <div className="relative mx-auto max-w-4xl px-2 pb-2 pt-7">
          <div className="absolute left-[4%] right-[4%] top-[3.1rem] h-1 rounded-full bg-slate-700" aria-hidden />
          <div className="relative grid grid-cols-7 gap-1">
            {values.map((value, index) => {
              const editable = task.blanks.includes(index);
              const displayed = readOnly ? String(value) : answers[index] ?? "";
              return (
                <div key={index} className="flex min-h-28 flex-col items-center">
                  <span className="h-10 w-1.5 rounded-full bg-slate-700" aria-hidden />
                  {editable ? (
                    <button
                      type="button"
                      disabled={readOnly}
                      aria-label={`Liczba do wpisania na osi, kreska ${index + 1}`}
                      onClick={() => { setActiveBlank(index); setFeedback(null); onResultChange?.(null); }}
                      className={`mt-3 min-h-12 w-full max-w-24 rounded-xl border-2 bg-white px-1 text-center text-lg font-black text-indigo-950 shadow-sm disabled:border-slate-300 ${activeBlank === index ? "border-indigo-600 ring-4 ring-indigo-200" : "border-indigo-200"}`}
                    >
                      {displayed || "□"}
                    </button>
                  ) : (
                    <span className="mt-5 min-h-12 px-1 text-center text-lg font-black text-slate-900">{task.known.includes(index) ? value : ""}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {!readOnly ? (
        <>
          <input value={answers[activeBlank] ?? ""} readOnly inputMode="none" aria-label="Aktywne pole osi liczbowej" className="sr-only" />
          <NumberKeypad disabled={false} onPress={updateAnswer} />
          <button type="button" onClick={check} className="min-h-12 w-full rounded-xl bg-indigo-700 px-4 font-black text-white">Zatwierdź</button>
        </>
      ) : null}

      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-50 px-4 py-3 text-center font-bold text-emerald-900">Dobrze. Wszystkie liczby rosną o {task.step}.</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-rose-50 px-4 py-3 text-center font-bold text-rose-900">Sprawdź odległość między podpisanymi kreskami. Każda działka ma tę samą wartość.</p> : null}
      {feedback === "empty" ? <p role="status" className="rounded-2xl bg-amber-50 px-4 py-3 text-center font-bold text-amber-900">Uzupełnij wszystkie trzy puste pola na osi.</p> : null}
    </LessonTaskFrame>
  );
}
