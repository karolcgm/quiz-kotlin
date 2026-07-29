"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  PLANE_FIGURES_REVIEW_ANGLE_TASKS,
  PLANE_FIGURES_REVIEW_CHALLENGE_TASKS,
  PLANE_FIGURES_REVIEW_LENGTH_TASKS,
  type PlaneFiguresReviewActivity,
  type PlaneFiguresReviewTask,
} from "@/lib/math/geometry/planeFiguresReview";

interface Props {
  activity: PlaneFiguresReviewActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function Scene({ task }: { task: PlaneFiguresReviewTask }) {
  return (
    <Image
      src={task.imageSrc}
      alt={task.imageAlt}
      width={1200}
      height={800}
      sizes="(max-width: 640px) 92vw, 640px"
      className="h-auto w-full"
    />
  );
}

function blankAnswers(task: PlaneFiguresReviewTask) {
  return Object.fromEntries(task.answers.map((field) => [field.id, ""])) as Record<string, string>;
}

export function PlaneFiguresReviewLessonLab({ activity, readOnly = false, onResultChange }: Props) {
  const content = useMemo(() => {
    if (activity === "lengths") return {
      tasks: PLANE_FIGURES_REVIEW_LENGTH_TASKS,
      heading: "Geometria w praktyce — długości i obwody",
      description: "Przeczytaj treść, wybierz potrzebne dane i oblicz wynik.",
    };
    if (activity === "angles") return {
      tasks: PLANE_FIGURES_REVIEW_ANGLE_TASKS,
      heading: "Kąty w planach i konstrukcjach",
      description: "Połącz własności kątów z informacjami ukrytymi w treści zadania.",
    };
    return {
      tasks: PLANE_FIGURES_REVIEW_CHALLENGE_TASKS,
      heading: "Wyzwania geometryczne",
      description: "Każde zadanie wymaga co najmniej dwóch kroków lub wyboru właściwej własności figury.",
    };
  }, [activity]);
  const { tasks } = content;
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0]) }));
  const [activeField, setActiveField] = useState(tasks[0].answers[0].id);
  const [completed, setCompleted] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const answers = answersByTask[taskIndex] ?? blankAnswers(task);
  const solved = completed.includes(taskIndex);

  useEffect(() => {
    if (!pendingAdvance || taskIndex >= tasks.length - 1) return;
    const timeout = window.setTimeout(() => {
      const nextIndex = taskIndex + 1;
      const nextTask = tasks[nextIndex];
      setTaskIndex(nextIndex);
      setAnswersByTask((current) => current[nextIndex] ? current : { ...current, [nextIndex]: blankAnswers(nextTask) });
      setActiveField(nextTask.answers[0].id);
      setFeedback("");
      setPendingAdvance(false);
      onResultChange?.(null);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, pendingAdvance, taskIndex, tasks]);

  const edit = (key: string) => {
    if (readOnly || solved) return;
    setAnswersByTask((current) => {
      const taskAnswers = current[taskIndex] ?? blankAnswers(task);
      const previous = taskAnswers[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : `${previous}${key}`.slice(0, 5);
      return { ...current, [taskIndex]: { ...taskAnswers, [activeField]: next } };
    });
    setFeedback("");
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (task.answers.some((field) => !(answers[field.id] ?? "").trim())) {
      setFeedback("Uzupełnij wszystkie wymagane wyniki.");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const correct = task.answers.every((field) => Number(answers[field.id]) === field.answer);
    if (!correct) {
      setFeedback(`Jeszcze nie. ${task.hint}`);
      onResultChange?.(false, task.answers.map((field) => answers[field.id]).join(", "));
      return;
    }
    const nextCompleted = completed.includes(taskIndex) ? completed : [...completed, taskIndex];
    const allCompleted = nextCompleted.length === tasks.length;
    setCompleted(nextCompleted);
    setFeedback(allCompleted ? `${task.success} Ukończono całą serię.` : `${task.success} Za chwilę pojawi się kolejne zadanie.`);
    setPendingAdvance(!allCompleted);
    onResultChange?.(allCompleted ? true : null, task.answers.map((field) => `${field.answer} ${field.unit}`).join(", "));
  };

  return <LessonTaskFrame
    eyebrow="Dział 2 · Powtórzenie wiadomości"
    heading={content.heading}
    description={content.description}
    questionNumber={taskIndex + 1}
    questionCount={tasks.length}
    data-plane-figures-review={activity}
  >
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-violet-50">
        <Scene task={task} />
      </div>
      <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-black uppercase tracking-[.16em] text-amber-800">Zadanie tekstowe</p>
        <h3 className="mt-1 text-xl font-black text-amber-950 sm:text-2xl">{task.title}</h3>
        <p className="mt-3 text-base font-bold leading-relaxed text-slate-800 sm:text-lg">{task.story}</p>
      </section>
      <div className={`grid gap-3 ${task.answers.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-xl"}`}>
        {task.answers.map((field) => <label key={field.id} className={`flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 p-4 text-center font-black ${activeField === field.id ? "border-violet-700 bg-violet-50 ring-4 ring-violet-100" : "border-slate-200 bg-white"}`}>
          <span className="w-full text-sm text-slate-700 sm:text-base">{field.label}</span>
          <input
            aria-label={field.label}
            inputMode="none"
            readOnly
            value={answers[field.id] ?? ""}
            onFocus={() => setActiveField(field.id)}
            onClick={() => setActiveField(field.id)}
            className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700"
          />
          <span className="text-xl text-slate-950">{field.unit}</span>
        </label>)}
      </div>
      {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
      <LessonNumericKeypad
        onKey={edit}
        onConfirm={check}
        disabled={readOnly || solved}
        label="Kalkulator do zadań geometrycznych"
        helperText="Dotknij kratki, wpisz wynik i zatwierdź. Jednostka jest już podana."
      />
    </div>
  </LessonTaskFrame>;
}
