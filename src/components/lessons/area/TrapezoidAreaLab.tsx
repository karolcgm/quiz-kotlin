"use client";

import { useEffect, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  TRAPEZOID_CALCULATION_TASKS,
  TRAPEZOID_STORY_TASKS,
  type TrapezoidAreaActivity,
  type TrapezoidAreaTask,
} from "@/lib/math/area/trapezoidArea";
import { parsePolishDecimal } from "@/lib/math/area/unitConversion";

interface TrapezoidAreaLabProps {
  activity: TrapezoidAreaActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Point = { x: number; y: number };

const TRAPEZOID_POINTS = {
  lowerLeft: { x: 110, y: 320 },
  lowerRight: { x: 570, y: 320 },
  upperRight: { x: 440, y: 92 },
  upperLeft: { x: 230, y: 92 },
} as const;

function rightAngleArc(vertex: Point, first: Point, second: Point, size = 25) {
  const firstLength = Math.hypot(first.x - vertex.x, first.y - vertex.y) || 1;
  const secondLength = Math.hypot(second.x - vertex.x, second.y - vertex.y) || 1;
  const u = { x: (first.x - vertex.x) / firstLength, y: (first.y - vertex.y) / firstLength };
  const v = { x: (second.x - vertex.x) / secondLength, y: (second.y - vertex.y) / secondLength };
  const start = { x: vertex.x + u.x * size, y: vertex.y + u.y * size };
  const end = { x: vertex.x + v.x * size, y: vertex.y + v.y * size };
  const control = { x: vertex.x + (u.x + v.x) * size, y: vertex.y + (u.y + v.y) * size };
  const dot = { x: vertex.x + (u.x + v.x) * size * 0.52, y: vertex.y + (u.y + v.y) * size * 0.52 };
  return { path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`, dot };
}

function TrapezoidSvg({
  labels = {},
  compact = false,
}: {
  labels?: TrapezoidAreaTask["labels"];
  compact?: boolean;
}) {
  const { lowerLeft, lowerRight, upperRight, upperLeft } = TRAPEZOID_POINTS;
  const foot = { x: upperLeft.x, y: lowerLeft.y };
  const arc = rightAngleArc(foot, lowerLeft, upperLeft, 25);
  const polygon = [lowerLeft, lowerRight, upperRight, upperLeft].map((point) => `${point.x},${point.y}`).join(" ");
  const labelClass = "fill-slate-950 text-[23px] font-black";

  return (
    <svg
      viewBox="0 0 680 410"
      className={`mx-auto block h-auto w-full ${compact ? "max-w-xl" : "max-w-4xl"}`}
      role="img"
      aria-label="Trapez z dwiema podstawami i wysokością"
    >
      <defs>
        <pattern id="trapezoid-grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#cbd5e1" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="676" height="406" rx="28" fill="url(#trapezoid-grid)" stroke="#cbd5e1" strokeWidth="2" />
      <polygon points={polygon} fill="#bae6fd" fillOpacity="0.9" stroke="#0369a1" strokeWidth="5" strokeLinejoin="round" />
      <line x1={upperLeft.x} y1={upperLeft.y} x2={foot.x} y2={foot.y} stroke="#0f766e" strokeWidth="5" strokeDasharray="11 8" />
      <path d={arc.path} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
      <circle cx={arc.dot.x} cy={arc.dot.y} r="4.5" fill="#0f766e" />

      <text x={(lowerLeft.x + lowerRight.x) / 2} y={lowerLeft.y + 42} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="9" className={labelClass}>{labels.lowerBase ?? "a"}</text>
      <text x={(upperLeft.x + upperRight.x) / 2} y={upperLeft.y - 22} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="9" className={labelClass}>{labels.upperBase ?? "b"}</text>
      <text x={foot.x + 29} y={(upperLeft.y + foot.y) / 2} paintOrder="stroke" stroke="white" strokeWidth="9" className={labelClass}>{labels.height ?? "h"}</text>
      {labels.leftLeg ? <text x="148" y="198" textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-violet-900 text-[21px] font-black">{labels.leftLeg}</text> : null}
      {labels.rightLeg ? <text x="524" y="198" textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-violet-900 text-[21px] font-black">{labels.rightLeg}</text> : null}
      {labels.center ? <text x="360" y="235" textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="10" className="fill-slate-950 text-[25px] font-black">{labels.center}</text> : null}
    </svg>
  );
}

function TrapezoidFormula({ compact = false, testId }: { compact?: boolean; testId?: string }) {
  return (
    <span
      data-testid={testId}
      aria-label="P równa się iloczyn sumy podstaw a i b oraz wysokości h podzielony przez 2"
      className={`inline-flex items-center gap-3 whitespace-nowrap font-black ${compact ? "text-lg" : "text-5xl"}`}
    >
      <span>P =</span>
      <span className="inline-flex flex-col items-center leading-none">
        <span className="border-b-[3px] border-current px-2 pb-1">(a + b) · h</span>
        <span className="pt-1">2</span>
      </span>
    </span>
  );
}

function PartsSlide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 6"
      heading="Podstawy, ramiona i wysokość trapezu"
      description="Trapez ma jedną parę boków równoległych. To właśnie te boki nazywamy podstawami."
    >
      <div className="space-y-5">
        <TrapezoidSvg labels={{ lowerBase: "a — dolna podstawa", upperBase: "b — górna podstawa", height: "h — wysokość", leftLeg: "ramię", rightLeg: "ramię" }} />
        <div className="grid gap-3 text-center sm:grid-cols-3">
          <p className="rounded-2xl bg-sky-50 p-4 font-bold text-sky-950"><strong>Podstawy a i b</strong><br />Są równoległe.</p>
          <p className="rounded-2xl bg-violet-50 p-4 font-bold text-violet-950"><strong>Ramiona</strong><br />To dwa pozostałe boki trapezu.</p>
          <p className="rounded-2xl bg-teal-50 p-4 font-bold text-teal-950"><strong>Wysokość h</strong><br />Łączy podstawy pod kątem prostym.</p>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function FormulaSlide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 6"
      heading="Wzór na pole trapezu"
      description="Dodaj długości obu podstaw, pomnóż otrzymaną sumę przez wysokość, a następnie podziel wynik przez 2."
    >
      <div className="space-y-5">
        <TrapezoidSvg labels={{ lowerBase: "a", upperBase: "b", height: "h" }} />
        <div className="mx-auto max-w-2xl rounded-3xl bg-emerald-100 p-6 text-center shadow-sm">
          <p className="text-lg font-bold text-emerald-950">Pole trapezu jest połową iloczynu sumy podstaw i wysokości.</p>
          <p className="mt-3 text-emerald-700"><TrapezoidFormula testId="trapezoid-area-formula" /></p>
        </div>
        <p className="rounded-2xl bg-amber-50 px-5 py-4 text-center font-bold text-amber-950">We wzorze występują tylko obie podstawy i wysokość. Długości ramion nie są potrzebne do obliczenia pola.</p>
      </div>
    </LessonTaskFrame>
  );
}

function blankAnswers(task: TrapezoidAreaTask) {
  return Object.fromEntries(task.answerFields.map((field) => [field.id, ""])) as Record<string, string>;
}

function TaskSeries({
  tasks,
  stories,
  readOnly,
  onResultChange,
}: {
  tasks: TrapezoidAreaTask[];
  stories?: boolean;
  readOnly: boolean;
  onResultChange?: TrapezoidAreaLabProps["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0]) }));
  const [activeField, setActiveField] = useState(tasks[0].answerFields[0].id);
  const [feedbackByTask, setFeedbackByTask] = useState<Record<number, string>>({});
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
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
      setActiveField(nextTask.answerFields[0].id);
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
      const next = key === "backspace" ? previous.slice(0, -1) : key === "," ? (previous.includes(",") ? previous : `${previous},`) : `${previous}${key}`.slice(0, 9);
      return { ...current, [taskIndex]: { ...taskAnswers, [activeField]: next } };
    });
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (task.answerFields.some((field) => !(answers[field.id] ?? "").trim())) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Uzupełnij wszystkie puste kratki." }));
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = task.answerFields.every((field) => {
      const value = parsePolishDecimal(answers[field.id]);
      return value !== null && Math.abs(value - field.answer) < 0.000001;
    });
    if (!correct) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: `Jeszcze nie. ${task.hint}` }));
      onResultChange?.(false, task.answerFields.map((field) => answers[field.id]).join(", "));
      return;
    }
    const nextCompleted = completedTasks.includes(taskIndex) ? completedTasks : [...completedTasks, taskIndex];
    const allCompleted = nextCompleted.length === tasks.length;
    setCompletedTasks(nextCompleted);
    setFeedbackByTask((current) => ({
      ...current,
      [taskIndex]: allCompleted ? `${task.success} Cała seria jest ukończona.` : `${task.success} Za chwilę następne zadanie.`,
    }));
    setPendingAdvance(taskIndex < tasks.length - 1 ? taskIndex : null);
    onResultChange?.(allCompleted ? true : null, task.answerFields.map((field) => `${field.answer} ${field.unit}`).join(", "));
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 6"
      heading={stories ? "Zadania tekstowe z polem trapezu" : "Obliczanie pola trapezu"}
      description={stories ? "Zrób szkic pomocniczy, podpisz podstawy i wysokość, a potem uzupełnij kolejne etapy obliczeń." : "Odczytaj długości obu podstaw i wysokości. Zadbaj o jednakowe jednostki przed obliczeniem pola."}
      questionNumber={taskIndex + 1}
      questionCount={tasks.length}
      data-trapezoid-series={stories ? "stories" : "calculations"}
    >
      <div className="space-y-5">
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-sm font-black text-indigo-950">
          Zaliczone: {completedTasks.length} z {tasks.length}
        </div>
        <TrapezoidSvg labels={task.labels} />
        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
          {task.detail ? <p className="mt-2 font-bold text-slate-700">{task.detail}</p> : null}
        </section>
        {stories ? <p className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-center font-bold text-sky-950">Szkic pomocniczy: na rysunku zaznacz podstawy a i b oraz wysokość h.</p> : null}
        <div className={`grid gap-3 ${task.answerFields.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-xl"}`}>
          {task.answerFields.map((field) => (
            <label key={field.id} className={`flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 font-black ${activeField === field.id ? "border-emerald-700 ring-4 ring-emerald-100" : "border-slate-200"}`}>
              <span className="text-sm text-slate-700 sm:text-base">{field.label}</span>
              <input
                aria-label={field.label}
                inputMode="none"
                readOnly
                value={answers[field.id] ?? ""}
                onFocus={() => setActiveField(field.id)}
                onClick={() => setActiveField(field.id)}
                className="h-14 w-28 rounded-xl border-2 border-emerald-400 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-emerald-700"
              />
              <span className="text-xl text-slate-950">{field.unit}</span>
            </label>
          ))}
        </div>
        {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
        <LessonNumericKeypad
          onKey={onKey}
          onConfirm={check}
          disabled={readOnly || solved}
          allowSeparator
          label="Kalkulator do pola trapezu"
          helperText="Kliknij kratkę, wpisz liczby z kalkulatora i zatwierdź rozwiązanie jeden raz."
        />
      </div>
    </LessonTaskFrame>
  );
}

export function TrapezoidAreaLab({ activity, readOnly = false, onResultChange }: TrapezoidAreaLabProps) {
  if (activity === "trapezoid-parts") return <PartsSlide />;
  if (activity === "trapezoid-formula") return <FormulaSlide />;
  if (activity === "trapezoid-calculations") return <TaskSeries key="trapezoid-calculations" tasks={TRAPEZOID_CALCULATION_TASKS} readOnly={readOnly} onResultChange={onResultChange} />;
  return <TaskSeries key="trapezoid-stories" tasks={TRAPEZOID_STORY_TASKS} stories readOnly={readOnly} onResultChange={onResultChange} />;
}
