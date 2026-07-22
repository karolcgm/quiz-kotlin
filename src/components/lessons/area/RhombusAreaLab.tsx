"use client";

import { useEffect, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  RHOMBUS_CALCULATION_TASKS,
  RHOMBUS_STORY_TASKS,
  type RhombusAreaActivity,
  type RhombusAreaMethod,
  type RhombusAreaTask,
} from "@/lib/math/area/rhombusArea";
import { parsePolishDecimal } from "@/lib/math/area/unitConversion";

interface RhombusAreaLabProps {
  activity: RhombusAreaActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Point = { x: number; y: number };

const SLANTED_POINTS = [
  { x: 110, y: 305 },
  { x: 370, y: 305 },
  { x: 526, y: 97 },
  { x: 266, y: 97 },
];

const DIAMOND_POINTS = [
  { x: 320, y: 38 },
  { x: 500, y: 200 },
  { x: 320, y: 362 },
  { x: 140, y: 200 },
];

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

function RhombusDiagram({
  variant,
  showHeight = false,
  showDiagonals = false,
  labels = {},
  compact = false,
}: {
  variant: "slanted" | "diamond";
  showHeight?: boolean;
  showDiagonals?: boolean;
  labels?: RhombusAreaTask["labels"];
  compact?: boolean;
}) {
  const points = variant === "slanted" ? SLANTED_POINTS : DIAMOND_POINTS;
  const [a, b, c, d] = points;
  const center = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
  const heightTop = variant === "slanted" ? d : a;
  const heightFoot = variant === "slanted" ? { x: d.x, y: a.y } : { x: a.x, y: c.y };
  const heightArc = rightAngleArc(heightFoot, a, heightTop, 23);
  const diagonalArc = rightAngleArc(center, a, b, 24);
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 640 400"
      className={`mx-auto block h-auto w-full ${compact ? "max-w-xl" : "max-w-4xl"}`}
      role="img"
      aria-label={`${variant === "slanted" ? "Romb ustawiony jak równoległobok" : "Romb ustawiony jak latawiec"}${showHeight ? " z wysokością" : ""}${showDiagonals ? " z przekątnymi" : ""}`}
    >
      <defs>
        <pattern id={`rhombus-grid-${variant}-${showHeight}-${showDiagonals}`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#cbd5e1" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="636" height="396" rx="28" fill={`url(#rhombus-grid-${variant}-${showHeight}-${showDiagonals})`} stroke="#cbd5e1" strokeWidth="2" />
      <polygon points={polygon} fill="#fef3c7" fillOpacity="0.92" stroke="#92400e" strokeWidth="5" strokeLinejoin="round" />

      {showHeight ? (
        <>
          <line x1={heightTop.x} y1={heightTop.y} x2={heightFoot.x} y2={heightFoot.y} stroke="#0f766e" strokeWidth="5" strokeDasharray="11 8" />
          <path d={heightArc.path} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
          <circle cx={heightArc.dot.x} cy={heightArc.dot.y} r="4.5" fill="#0f766e" />
        </>
      ) : null}

      {showDiagonals ? (
        <>
          <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke="#7c3aed" strokeWidth="5" />
          <line x1={b.x} y1={b.y} x2={d.x} y2={d.y} stroke="#0369a1" strokeWidth="5" />
          <path d={diagonalArc.path} fill="none" stroke="#be123c" strokeWidth="4" strokeLinecap="round" />
          <circle cx={diagonalArc.dot.x} cy={diagonalArc.dot.y} r="4.5" fill="#be123c" />
        </>
      ) : null}

      {labels.side ? (
        <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 34} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-amber-950 text-[23px] font-black">
          {labels.side}
        </text>
      ) : null}
      {labels.height ? (
        <text x={heightFoot.x + 28} y={(heightTop.y + heightFoot.y) / 2} paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-teal-900 text-[23px] font-black">
          {labels.height}
        </text>
      ) : null}
      {labels.diagonalE ? (
        <text x={(a.x + center.x) / 2 - 18} y={(a.y + center.y) / 2 - 12} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-violet-900 text-[22px] font-black">
          {labels.diagonalE}
        </text>
      ) : null}
      {labels.diagonalF ? (
        <text x={(b.x + center.x) / 2 + 18} y={(b.y + center.y) / 2 - 12} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-sky-900 text-[22px] font-black">
          {labels.diagonalF}
        </text>
      ) : null}
      {labels.center ? (
        <text x={center.x} y={center.y + 58} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="10" className="fill-slate-950 text-[25px] font-black">
          {labels.center}
        </text>
      ) : null}

      {[a, b, c, d].map((point, index) => (
        <g key={index}>
          <circle cx={point.x} cy={point.y} r="6" fill="#92400e" />
          <text x={point.x + 12} y={point.y - 12} className="fill-slate-950 text-[19px] font-black">{"ABCD"[index]}</text>
        </g>
      ))}
    </svg>
  );
}

function ShapesSlide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 4"
      heading="Dwa ustawienia rombu"
      description="Romb może być narysowany jak pochylony równoległobok albo jak latawiec. Obrócenie figury nie zmienia jej własności."
    >
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 text-center">
            <RhombusDiagram variant="slanted" compact />
            <h3 className="text-xl font-black text-amber-950">Romb ustawiony jak równoległobok</h3>
            <p className="mt-2 font-bold text-slate-700">Możemy wybrać jego bok jako podstawę i poprowadzić do niej wysokość.</p>
          </section>
          <section className="rounded-3xl border-2 border-violet-200 bg-violet-50 p-4 text-center">
            <RhombusDiagram variant="diamond" compact />
            <h3 className="text-xl font-black text-violet-950">Romb ustawiony jak latawiec</h3>
            <p className="mt-2 font-bold text-slate-700">Wygodnie widać w nim dwie prostopadłe przekątne.</p>
          </section>
        </div>
        <p className="rounded-2xl bg-cyan-50 px-5 py-4 text-center text-lg font-black text-cyan-950">
          W obu rysunkach wszystkie cztery boki mają tę samą długość — to nadal ta sama figura: romb.
        </p>
      </div>
    </LessonTaskFrame>
  );
}

function FormulasSlide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 4"
      heading="Dwa wzory na pole rombu"
      description="Wybór wzoru zależy od danych podanych w zadaniu."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col rounded-3xl border-2 border-teal-200 bg-teal-50 p-4 text-center">
          <RhombusDiagram variant="slanted" showHeight labels={{ side: "a", height: "h" }} compact />
          <h3 className="text-xl font-black text-teal-950">Gdy znamy bok i wysokość</h3>
          <p className="mx-auto mt-3 rounded-2xl bg-teal-700 px-6 py-3 text-3xl font-black text-white">P = a · h</p>
          <p className="mt-3 font-bold text-slate-700">Wysokość musi być prostopadła do wybranego boku.</p>
        </section>
        <section className="flex flex-col rounded-3xl border-2 border-violet-200 bg-violet-50 p-4 text-center">
          <RhombusDiagram variant="diamond" showDiagonals labels={{ diagonalE: "e", diagonalF: "f" }} compact />
          <h3 className="text-xl font-black text-violet-950">Gdy znamy obie przekątne</h3>
          <p className="mx-auto mt-3 rounded-2xl bg-violet-700 px-6 py-3 text-white"><DiagonalFormula testId="rhombus-diagonal-formula" /></p>
          <p className="mt-3 font-bold text-slate-700">Przekątne rombu przecinają się pod kątem prostym.</p>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function blankAnswers(task: RhombusAreaTask) {
  return Object.fromEntries(task.answerFields.map((field) => [field.id, ""])) as Record<string, string>;
}

function methodLabel(method: RhombusAreaMethod) {
  return method === "base-height" ? "Bok i wysokość" : "Dwie przekątne";
}

function DiagonalFormula({ compact = false, testId }: { compact?: boolean; testId?: string }) {
  return (
    <span
      data-testid={testId}
      aria-label="P równa się iloczyn przekątnych e i f podzielony przez 2"
      className={`inline-flex items-center gap-2 whitespace-nowrap font-black ${compact ? "text-sm" : "text-3xl"}`}
    >
      <span>P =</span>
      <span className="inline-flex flex-col items-center leading-none">
        <span className="border-b-2 border-current px-1 pb-1">e · f</span>
        <span className="pt-1">2</span>
      </span>
    </span>
  );
}

function TaskSeries({
  tasks,
  stories,
  readOnly,
  onResultChange,
}: {
  tasks: RhombusAreaTask[];
  stories?: boolean;
  readOnly: boolean;
  onResultChange?: RhombusAreaLabProps["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0]) }));
  const [activeField, setActiveField] = useState(tasks[0].answerFields[0].id);
  const [methodsByTask, setMethodsByTask] = useState<Record<number, RhombusAreaMethod | undefined>>({});
  const [feedbackByTask, setFeedbackByTask] = useState<Record<number, string>>({});
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [pendingAdvance, setPendingAdvance] = useState<number | null>(null);

  const answers = answersByTask[taskIndex] ?? blankAnswers(task);
  const selectedMethod = methodsByTask[taskIndex];
  const solved = completedTasks.includes(taskIndex);
  const feedback = feedbackByTask[taskIndex] ?? null;
  const showHeight = Boolean(task.labels.height);
  const showDiagonals = Boolean(task.labels.diagonalE || task.labels.diagonalF);

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

  const goToTask = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= tasks.length) return;
    const nextTask = tasks[nextIndex];
    setTaskIndex(nextIndex);
    setAnswersByTask((current) => current[nextIndex] ? current : { ...current, [nextIndex]: blankAnswers(nextTask) });
    setActiveField(nextTask.answerFields[0].id);
    setPendingAdvance(null);
    onResultChange?.(completedTasks.length === tasks.length ? true : null);
  };

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
    if (!selectedMethod) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Najpierw wybierz wzór pasujący do danych." }));
      onResultChange?.(false, "nie wybrano wzoru");
      return;
    }
    if (!task.allowedMethods.includes(selectedMethod)) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: `${methodLabel(selectedMethod)} nie daje tutaj kompletu potrzebnych danych. Wybierz drugi wzór.` }));
      onResultChange?.(false, methodLabel(selectedMethod));
      return;
    }
    if (task.answerFields.some((field) => !(answers[field.id] ?? "").trim())) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Uzupełnij wszystkie puste kratki." }));
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = task.answerFields.every((field) => {
      const parsed = parsePolishDecimal(answers[field.id]);
      return parsed !== null && Math.abs(parsed - field.answer) < 0.000001;
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
      [taskIndex]: allCompleted ? `${task.success} Cała seria jest ukończona.` : taskIndex === tasks.length - 1 ? `${task.success} Wróć do nieukończonych zadań.` : `${task.success} Za chwilę następne zadanie.`,
    }));
    setPendingAdvance(taskIndex < tasks.length - 1 ? taskIndex : null);
    onResultChange?.(allCompleted ? true : null, task.answerFields.map((field) => `${field.answer} ${field.unit}`).join(", "));
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 4"
      heading={stories ? "Zadania tekstowe z polem rombu" : "Obliczanie pola rombu"}
      description={stories ? "Rozpoznaj dane, wybierz jeden z dwóch wzorów i oblicz szukaną wielkość." : "W każdym zadaniu najpierw wybierz wzór pasujący do podanych danych."}
      questionNumber={taskIndex + 1}
      questionCount={tasks.length}
      data-rhombus-series={stories ? "stories" : "calculations"}
    >
      <div className="space-y-5">
        <nav
          aria-label="Przełączanie zadań"
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white p-2 shadow-sm"
        >
          <button
            type="button"
            disabled={taskIndex === 0}
            onClick={() => goToTask(taskIndex - 1)}
            className="justify-self-start rounded-xl bg-indigo-100 px-3 py-2 text-sm font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-35"
          >
            ← Poprzednie
          </button>
          <span className="text-center text-xs font-black text-slate-600 sm:text-sm">
            Zaliczone: {completedTasks.length} z {tasks.length}
          </span>
          <button
            type="button"
            disabled={taskIndex === tasks.length - 1 || !solved}
            onClick={() => goToTask(taskIndex + 1)}
            className="justify-self-end rounded-xl bg-indigo-100 px-3 py-2 text-sm font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Następne →
          </button>
        </nav>

        <RhombusDiagram variant={task.variant} showHeight={showHeight} showDiagonals={showDiagonals} labels={task.labels} />

        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
          {task.detail ? <p className="mt-2 font-bold text-slate-700">{task.detail}</p> : null}
        </section>

        <fieldset className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4">
          <legend className="px-2 text-center font-black text-violet-950">Który wzór wybierasz?</legend>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <LessonTaskChoice type="button" selected={selectedMethod === "base-height"} disabled={readOnly || solved} onClick={() => setMethodsByTask((current) => ({ ...current, [taskIndex]: "base-height" }))}>
              P = a · h
            </LessonTaskChoice>
            <LessonTaskChoice type="button" selected={selectedMethod === "diagonals"} disabled={readOnly || solved} onClick={() => setMethodsByTask((current) => ({ ...current, [taskIndex]: "diagonals" }))}>
              <DiagonalFormula compact />
            </LessonTaskChoice>
          </div>
        </fieldset>

        <div className={`grid gap-3 ${task.answerFields.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-xl"}`}>
          {task.answerFields.map((field) => (
            <label key={field.id} className={`flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 font-black ${activeField === field.id ? "border-violet-700 ring-4 ring-violet-100" : "border-slate-200"}`}>
              <span className="text-sm text-slate-700 sm:text-base">{field.label}</span>
              <input
                aria-label={field.label}
                inputMode="none"
                readOnly
                value={answers[field.id] ?? ""}
                onFocus={() => setActiveField(field.id)}
                onClick={() => setActiveField(field.id)}
                className="h-14 w-28 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700"
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
          label="Kalkulator do pola rombu"
          helperText="Wybierz wzór, uzupełnij wszystkie kratki i zatwierdź rozwiązanie jeden raz."
        />
      </div>
    </LessonTaskFrame>
  );
}

export function RhombusAreaLab({ activity, readOnly = false, onResultChange }: RhombusAreaLabProps) {
  if (activity === "rhombus-shapes") return <ShapesSlide />;
  if (activity === "rhombus-formulas") return <FormulasSlide />;
  if (activity === "rhombus-calculations") return <TaskSeries key="rhombus-calculations" tasks={RHOMBUS_CALCULATION_TASKS} readOnly={readOnly} onResultChange={onResultChange} />;
  return <TaskSeries key="rhombus-stories" tasks={RHOMBUS_STORY_TASKS} stories readOnly={readOnly} onResultChange={onResultChange} />;
}
