"use client";

import { useEffect, useMemo, useState } from "react";

import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  isPercentReviewFinalAnswerCorrect,
  isPercentReviewL6Activity,
  parsePercentReviewNumber,
  percentReviewL6Task,
  type PercentReviewChart,
  type PercentReviewL6Activity,
  type PercentReviewL6Task,
} from "@/lib/math/decimals/percentReviewL6";

export { isPercentReviewL6Activity };

interface PercentReviewL6LabProps {
  activity: PercentReviewL6Activity;
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function formatNumber(value: number): string {
  return String(value).replace(".", ",");
}

function PercentReviewChartView({ chart }: { chart: PercentReviewChart }) {
  if (chart.kind === "pie") {
    const stops = chart.categories
      .reduce<{ cursor: number; parts: string[] }>(
        (state, category) => ({
          cursor: state.cursor + category.value,
          parts: [
            ...state.parts,
            `${category.color} ${state.cursor}% ${state.cursor + category.value}%`,
          ],
        }),
        { cursor: 0, parts: [] },
      )
      .parts.join(", ");

    return (
      <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-4" aria-label={chart.title}>
        <h3 className="text-center text-lg font-black text-slate-950">{chart.title}</h3>
        <p className="text-center text-sm font-bold text-slate-600">{chart.totalLabel}</p>
        <div className="mt-4 grid items-center gap-5 sm:grid-cols-[minmax(0,13rem)_1fr]">
          <div
            className="mx-auto aspect-square w-full max-w-52 rounded-full border-8 border-white shadow-lg"
            style={{ background: `conic-gradient(${stops})` }}
            role="img"
            aria-label={chart.categories.map((item) => `${item.label}: ${item.value}%`).join(", ")}
          />
          <ul className="grid gap-2">
            {chart.categories.map((category) => (
              <li key={category.label} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 font-bold shadow-sm">
                <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-sm" style={{ backgroundColor: category.color }} />{category.label}</span>
                <span>{category.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const category = chart.categories[0]!;
  const first = category.value;
  const second = category.secondValue ?? 0;
  const labels = chart.seriesLabels ?? ["A", "B"];
  return (
    <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-4" aria-label={chart.title}>
      <h3 className="text-center text-lg font-black text-slate-950">{chart.title}</h3>
      <p className="text-center text-sm font-bold text-slate-600">{chart.totalLabel}</p>
      <div className="mx-auto mt-4 flex h-52 max-w-sm items-end justify-center gap-12 border-b-4 border-l-4 border-slate-700 px-8 pt-3">
        {[{ label: labels[0], value: first, color: category.color }, { label: labels[1], value: second, color: "#f97316" }].map((bar) => (
          <div key={bar.label} className="flex h-full w-20 flex-col justify-end text-center">
            <strong className="mb-1 text-base text-slate-950">{bar.value}%</strong>
            <div className="w-full rounded-t-xl shadow" style={{ height: `${Math.max(8, bar.value * 1.7)}%`, backgroundColor: bar.color }} />
            <span className="mt-1 text-sm font-black text-slate-950">{bar.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-700">Kategoria: {category.label}</p>
    </section>
  );
}

function PercentReviewTask({ task, readOnly = false, questionNumber, questionCount, onResultChange }: Omit<PercentReviewL6LabProps, "activity" | "seed" | "taskSeed"> & { task: PercentReviewL6Task }) {
  const [answers, setAnswers] = useState<string[]>(() => task.fields.map(() => ""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "missing" | "correct" | "incorrect">("idle");

  useEffect(() => {
    onResultChange?.(null);
  }, [onResultChange, task]);

  const updateActive = (key: string) => {
    if (readOnly || status === "correct" || status === "incorrect") return;
    setStatus("idle");
    setAnswers((current) => current.map((value, index) => {
      if (index !== activeIndex) return value;
      if (key === "backspace") return value.slice(0, -1);
      if (key === ",") return value.includes(",") || value.includes(".") ? value : `${value || "0"},`;
      return value.length >= 8 ? value : `${value}${key}`;
    }));
  };

  const confirm = () => {
    if (readOnly || status === "correct" || status === "incorrect") return;
    if (answers.some((answer) => parsePercentReviewNumber(answer) === null)) {
      setStatus("missing");
      return;
    }
    const correct = isPercentReviewFinalAnswerCorrect(task, answers);
    setStatus(correct ? "correct" : "incorrect");
    const finalValue = parsePercentReviewNumber(answers[answers.length - 1] ?? "");
    onResultChange?.(correct, finalValue === null ? undefined : `${formatNumber(finalValue)} ${task.fields[task.fields.length - 1]!.unit}`);
  };

  const finalField = task.fields[task.fields.length - 1]!;
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Procenty"
      heading={task.title}
      description="Połącz wiadomości z kilku tematów. Uzupełnij etapy i oblicz wynik końcowy."
      questionNumber={questionNumber}
      questionCount={questionCount}
    >
      <div className="grid gap-5">
        <section className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-5 text-center">
          <div className="text-5xl" aria-hidden>{task.icon}</div>
          <p className="mx-auto mt-3 max-w-2xl text-lg font-black leading-relaxed text-slate-950 sm:text-xl">{task.prompt}</p>
        </section>

        {task.chart ? <PercentReviewChartView chart={task.chart} /> : null}

        <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-4 sm:p-5">
          <h3 className="text-center text-lg font-black text-indigo-950">Zapis obliczeń</h3>
          <div className="mx-auto mt-4 grid max-w-xl gap-2">
            {task.fields.map((field, index) => (
              <div key={`${field.label}-${index}`}>
                {index > 0 ? <div className="py-1 text-center text-3xl font-black leading-none text-violet-600" aria-hidden>↓</div> : null}
                <label className={`grid min-h-20 grid-cols-[1fr_auto_auto] items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 shadow-sm ${index === task.fields.length - 1 ? "border-emerald-400" : "border-indigo-100"}`}>
                  <span className="font-black text-slate-800">{field.label}{index === task.fields.length - 1 ? <small className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-900">wynik końcowy</small> : null}</span>
                  <input
                    type="text"
                    inputMode="none"
                    readOnly
                    value={answers[index]}
                    onClick={() => { if (!readOnly && status !== "correct" && status !== "incorrect") setActiveIndex(index); }}
                    aria-label={field.label}
                    className={`h-14 w-24 rounded-xl border-2 bg-white text-center text-xl font-black outline-none ${activeIndex === index ? "border-cyan-500 ring-4 ring-cyan-100" : "border-violet-300"}`}
                  />
                  <span className="min-w-12 font-black text-slate-700">{field.unit}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <LessonNumericKeypad
          onKey={updateActive}
          onConfirm={confirm}
          disabled={readOnly || status === "correct" || status === "incorrect"}
          allowSeparator
          label="Klawiatura do powtórzenia procentów"
          helperText="Wybierz kratkę, wpisz wartość i zatwierdź wszystkie pola jeden raz na końcu."
        />

        {status === "missing" ? <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola, a następnie zatwierdź odpowiedź.</p> : null}
        {status === "correct" ? <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">Dobrze! Wynik końcowy jest poprawny.</p> : null}
        {status === "incorrect" ? <p className="rounded-2xl bg-amber-50 p-4 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {formatNumber(finalField.answer)} {finalField.unit}. Dziś bez punktu.</p> : null}
      </div>
    </LessonTaskFrame>
  );
}

export function PercentReviewL6Lab({ activity, seed, taskSeed, ...props }: PercentReviewL6LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => percentReviewL6Task(activity, effectiveSeed), [activity, effectiveSeed]);
  return <PercentReviewTask key={`${activity}-${effectiveSeed}`} task={task} {...props} />;
}
