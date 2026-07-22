"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  AREA_REVIEW_FIGURE_TASKS,
  AREA_REVIEW_FORMULA_TASKS,
  AREA_REVIEW_STORY_TASKS,
  AREA_REVIEW_UNIT_TASKS,
  type AreaReviewActivity,
  type AreaReviewTask,
} from "@/lib/math/area/areaReview";
import { parsePolishDecimal } from "@/lib/math/area/unitConversion";

interface AreaReviewLabProps {
  activity: AreaReviewActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function RightAngleMark({ x, y }: { x: number; y: number }) {
  return <><path d={`M ${x - 28} ${y} Q ${x - 28} ${y - 28} ${x} ${y - 28}`} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" /><circle cx={x - 15} cy={y - 15} r="4" fill="#0f766e" /></>;
}

function ShapeSvg({ task }: { task: AreaReviewTask }) {
  const labels = task.labels ?? {};
  const commonLabel = "fill-slate-950 text-[23px] font-black";
  const inside = labels.inside ? <text x="330" y="195" textAnchor="middle" className="fill-violet-950 text-[22px] font-black">{labels.inside}</text> : null;

  if (!task.shape) {
    return <div className="mx-auto grid min-h-52 max-w-4xl place-items-center rounded-3xl border-4 border-dashed border-cyan-300 bg-cyan-50 px-6 text-center"><p className="text-2xl font-black text-cyan-950">Zamiana jednostek pola</p><p className="mt-2 max-w-2xl font-bold text-slate-700">Wybierz właściwy przelicznik i wpisz wynik w pustą kratkę.</p></div>;
  }

  const content = (() => {
    if (task.shape === "rectangle") return <>
      <rect x="130" y="85" width="400" height="180" rx="12" fill="#e0e7ff" stroke="#4338ca" strokeWidth="6" />
      <text x="330" y="60" textAnchor="middle" className={commonLabel}>{labels.a ?? "a"}</text>
      <text x="100" y="180" textAnchor="middle" transform="rotate(-90 100 180)" className={commonLabel}>{labels.b ?? "b"}</text>
      {inside}
    </>;
    if (task.shape === "square") return <>
      <rect x="235" y="55" width="210" height="210" rx="12" fill="#ede9fe" stroke="#6d28d9" strokeWidth="6" />
      <text x="340" y="38" textAnchor="middle" className={commonLabel}>{labels.a ?? "a"}</text>
      <text x="210" y="160" textAnchor="middle" transform="rotate(-90 210 160)" className={commonLabel}>{labels.a ?? "a"}</text>
      {inside}
    </>;
    if (task.shape === "parallelogram") return <>
      <polygon points="125,255 490,255 410,85 45,85" fill="#cffafe" stroke="#0e7490" strokeWidth="6" strokeLinejoin="round" />
      <line x1="125" y1="255" x2="125" y2="85" stroke="#0f766e" strokeWidth="5" strokeDasharray="11 8" />
      <RightAngleMark x={125} y={255} />
      <text x="308" y="286" textAnchor="middle" className={commonLabel}>{labels.a ?? "a"}</text>
      <text x="150" y="170" className={commonLabel}>{labels.h ?? "h"}</text>
      {labels.b ? <text x="77" y="162" textAnchor="middle" transform="rotate(-65 77 162)" className="fill-violet-900 text-[20px] font-black">{labels.b}</text> : null}
      {inside}
    </>;
    if (task.shape === "triangle") return <>
      <polygon points="80,260 540,260 275,60" fill="#dbeafe" stroke="#0369a1" strokeWidth="6" strokeLinejoin="round" />
      <line x1="275" y1="60" x2="275" y2="260" stroke="#0f766e" strokeWidth="5" strokeDasharray="11 8" />
      <RightAngleMark x={275} y={260} />
      <text x="310" y="292" textAnchor="middle" className={commonLabel}>{labels.a ?? "a"}</text>
      <text x="300" y="170" className={commonLabel}>{labels.h ?? "h"}</text>
      {inside}
    </>;
    if (task.shape === "rhombus-height") return <>
      <polygon points="110,260 370,260 526,52 266,52" fill="#e0f2fe" stroke="#0369a1" strokeWidth="6" strokeLinejoin="round" />
      <line x1="266" y1="52" x2="266" y2="260" stroke="#0f766e" strokeWidth="5" strokeDasharray="11 8" />
      <RightAngleMark x={266} y={260} />
      <text x="240" y="292" textAnchor="middle" className={commonLabel}>{labels.a ?? "a"}</text>
      <text x="288" y="165" className={commonLabel}>{labels.h ?? "h"}</text>
      {inside}
    </>;
    if (task.shape === "rhombus-diagonals") return <>
      <polygon points="100,180 330,60 560,180 330,300" fill="#e0f2fe" stroke="#0369a1" strokeWidth="6" strokeLinejoin="round" />
      <line x1="100" y1="180" x2="560" y2="180" stroke="#0f766e" strokeWidth="5" />
      <line x1="330" y1="60" x2="330" y2="300" stroke="#0f766e" strokeWidth="5" />
      <RightAngleMark x={330} y={180} />
      <text x="330" y="165" textAnchor="middle" className={commonLabel}>{labels.f ?? "f"}</text>
      <text x="350" y="125" className={commonLabel}>{labels.e ?? "e"}</text>
      {inside}
    </>;
    return <>
      <polygon points="90,260 560,260 440,80 210,80" fill="#bae6fd" stroke="#0369a1" strokeWidth="6" strokeLinejoin="round" />
      <line x1="210" y1="80" x2="210" y2="260" stroke="#0f766e" strokeWidth="5" strokeDasharray="11 8" />
      <RightAngleMark x={210} y={260} />
      <text x="325" y="292" textAnchor="middle" className={commonLabel}>{labels.a ?? "a"}</text>
      <text x="325" y="58" textAnchor="middle" className={commonLabel}>{labels.b ?? "b"}</text>
      <text x="235" y="175" className={commonLabel}>{labels.h ?? "h"}</text>
      {inside}
    </>;
  })();

  return <svg role="img" aria-label={`Rysunek: ${task.prompt}`} viewBox="0 0 620 340" className="mx-auto block w-full max-w-4xl rounded-3xl border-2 border-sky-200 bg-white">{content}</svg>;
}

function blankAnswers(task: AreaReviewTask) {
  return Object.fromEntries(task.answers.map((field) => [field.id, ""])) as Record<string, string>;
}

function ReviewSeries({
  tasks,
  heading,
  description,
  readOnly,
  onResultChange,
}: {
  tasks: AreaReviewTask[];
  heading: string;
  description: string;
  readOnly: boolean;
  onResultChange?: AreaReviewLabProps["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0]) }));
  const [activeField, setActiveField] = useState(tasks[0].answers[0].id);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [feedbackByTask, setFeedbackByTask] = useState<Record<number, string>>({});
  const [pendingAdvance, setPendingAdvance] = useState<number | null>(null);
  const answers = answersByTask[taskIndex] ?? blankAnswers(task);
  const solved = completedTasks.includes(taskIndex);
  const feedback = feedbackByTask[taskIndex] ?? null;

  useEffect(() => {
    if (pendingAdvance !== taskIndex || taskIndex >= tasks.length - 1) return;
    const timeout = window.setTimeout(() => {
      const nextIndex = taskIndex + 1;
      const nextTask = tasks[nextIndex];
      setTaskIndex(nextIndex);
      setAnswersByTask((current) => current[nextIndex] ? current : { ...current, [nextIndex]: blankAnswers(nextTask) });
      setActiveField(nextTask.answers[0].id);
      setPendingAdvance(null);
      onResultChange?.(null);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, pendingAdvance, taskIndex, tasks]);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswersByTask((current) => {
      const taskAnswers = current[taskIndex] ?? blankAnswers(task);
      const previous = taskAnswers[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : key === "," ? (previous.includes(",") ? previous : `${previous},`) : `${previous}${key}`.slice(0, 10);
      return { ...current, [taskIndex]: { ...taskAnswers, [activeField]: next } };
    });
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (task.answers.some((field) => !(answers[field.id] ?? "").trim())) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Uzupełnij wszystkie puste kratki." }));
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = task.answers.every((field) => {
      const value = parsePolishDecimal(answers[field.id]);
      return value !== null && Math.abs(value - field.answer) < 0.000001;
    });
    if (!correct) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: `Jeszcze nie. ${task.hint}` }));
      onResultChange?.(false, task.answers.map((field) => answers[field.id]).join(", "));
      return;
    }
    const nextCompleted = completedTasks.includes(taskIndex) ? completedTasks : [...completedTasks, taskIndex];
    const allCompleted = nextCompleted.length === tasks.length;
    setCompletedTasks(nextCompleted);
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: allCompleted ? `${task.success} Cała seria jest ukończona.` : `${task.success} Za chwilę kolejne zadanie.` }));
    setPendingAdvance(taskIndex < tasks.length - 1 ? taskIndex : null);
    onResultChange?.(allCompleted ? true : null, task.answers.map((field) => `${field.answer} ${field.unit}`).join(", "));
  };

  return <LessonTaskFrame eyebrow="Dział 6 · Powtórzenie" heading={heading} description={description} questionNumber={taskIndex + 1} questionCount={tasks.length} data-area-review-series="true">
    <div className="space-y-5">
      <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-center text-sm font-black text-indigo-950">Zaliczone: {completedTasks.length} z {tasks.length}. Poprawna odpowiedź otworzy następne zadanie.</p>
      <ShapeSvg task={task} />
      <section className="rounded-3xl bg-amber-50 p-5 text-center">
        <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
        {task.detail ? <p className="mt-2 font-bold text-amber-800">{task.detail}</p> : null}
      </section>
      <div className={`grid gap-3 ${task.answers.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-xl"}`}>
        {task.answers.map((field) => <label key={field.id} className={`flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 text-center font-black ${activeField === field.id ? "border-violet-700 ring-4 ring-violet-100" : "border-slate-200"}`}>
          <span className="w-full text-sm text-slate-700 sm:text-base">{field.label}</span>
          <input aria-label={field.label} inputMode="none" readOnly value={answers[field.id] ?? ""} onFocus={() => setActiveField(field.id)} onClick={() => setActiveField(field.id)} className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700" />
          <span className="text-xl text-slate-950">{field.unit}</span>
        </label>)}
      </div>
      {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
      <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} allowSeparator label="Kalkulator do powtórzenia pól" helperText="Kliknij kratkę, wpisz wynik z kalkulatora i zatwierdź rozwiązanie." />
    </div>
  </LessonTaskFrame>;
}

export function AreaReviewLab({ activity, readOnly = false, onResultChange }: AreaReviewLabProps) {
  const content = useMemo(() => {
    if (activity === "formula-sprint") return { tasks: AREA_REVIEW_FORMULA_TASKS, heading: "Pola znanych figur", description: "Oblicz pola figur, dobierając właściwy wzór." };
    if (activity === "unit-sprint") return { tasks: AREA_REVIEW_UNIT_TASKS, heading: "Jednostki pola", description: "Wykonaj zamiany jednostek pola: mm², cm², dm², m², a, ha i km²." };
    if (activity === "figure-sprint") return { tasks: AREA_REVIEW_FIGURE_TASKS, heading: "Brakujący bok, wysokość lub obwód", description: "W każdym zadaniu zdecyduj, co trzeba obliczyć z pola, boków lub obwodu." };
    return { tasks: AREA_REVIEW_STORY_TASKS, heading: "Zadania z treścią", description: "Odczytaj dane z rysunku, wybierz działanie i wpisz wynik w odpowiedniej jednostce." };
  }, [activity]);

  return <ReviewSeries key={activity} {...content} readOnly={readOnly} onResultChange={onResultChange} />;
}
