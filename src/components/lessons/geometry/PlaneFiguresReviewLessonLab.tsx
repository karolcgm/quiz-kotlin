"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  PLANE_FIGURES_REVIEW_ANGLE_TASKS,
  PLANE_FIGURES_REVIEW_CHALLENGE_TASKS,
  PLANE_FIGURES_REVIEW_LENGTH_TASKS,
  type PlaneFiguresReviewActivity,
  type PlaneFiguresReviewScene,
  type PlaneFiguresReviewTask,
} from "@/lib/math/geometry/planeFiguresReview";

interface Props {
  activity: PlaneFiguresReviewActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function Scene({ scene }: { scene: PlaneFiguresReviewScene }) {
  const common = "stroke-slate-800 stroke-[5] fill-none";
  if (scene === "garden") return <svg role="img" aria-label="Plan ogrodu" viewBox="0 0 620 260" className="h-auto w-full">
    <rect x="105" y="45" width="410" height="170" rx="18" fill="#bbf7d0" stroke="#166534" strokeWidth="6" />
    <path d="M105 132H515M310 45V215" stroke="#f8fafc" strokeWidth="16" />
    <circle cx="205" cy="90" r="27" fill="#f472b6" /><circle cx="415" cy="170" r="30" fill="#facc15" />
    <path d="M286 215h48" stroke="#fb923c" strokeWidth="12" />
  </svg>;
  if (scene === "banner") return <svg role="img" aria-label="Trójkątny proporczyk" viewBox="0 0 620 260" className="h-auto w-full">
    <path d="M110 45H500L305 220Z" fill="#fde68a" stroke="#b45309" strokeWidth="7" strokeLinejoin="round" />
    <path d="M140 68H470" stroke="#f97316" strokeWidth="8" strokeDasharray="18 12" />
    <circle cx="305" cy="132" r="28" fill="#fff" opacity=".75" />
  </svg>;
  if (scene === "wheel" || scene === "circles") return <svg role="img" aria-label={scene === "wheel" ? "Koło roweru" : "Dwa okręgi"} viewBox="0 0 620 260" className="h-auto w-full">
    {scene === "wheel" ? <><circle cx="310" cy="132" r="103" fill="#e0f2fe" stroke="#0369a1" strokeWidth="7" /><circle cx="310" cy="132" r="15" fill="#0369a1" />{[0,30,60,90,120,150].map((a) => { const r=a*Math.PI/180; const x=Math.cos(r)*103; const y=Math.sin(r)*103; return <line key={a} x1={310-x} y1={132-y} x2={310+x} y2={132+y} stroke="#0f172a" strokeWidth="3" />; })}</> : <><circle cx="225" cy="132" r="73" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="7" /><circle cx="410" cy="132" r="112" fill="#bae6fd" stroke="#0369a1" strokeWidth="7" /><circle cx="225" cy="132" r="7" fill="#111827" /><circle cx="410" cy="132" r="7" fill="#111827" /><line x1="225" y1="132" x2="410" y2="132" stroke="#111827" strokeWidth="4" strokeDasharray="9 7" /></>}
  </svg>;
  if (scene === "roof") return <svg role="img" aria-label="Trójkątny dach z kątem zewnętrznym" viewBox="0 0 620 260" className="h-auto w-full">
    <path d="M90 205H500L305 45Z" fill="#fecaca" stroke="#9f1239" strokeWidth="7" strokeLinejoin="round" />
    <path d="M500 205H575" className={common} strokeDasharray="11 9" />
    <path d="M475 205A42 42 0 0 1 520 168" className={common} />
    <text x="525" y="165" className="fill-rose-950 text-[25px] font-black">128°</text>
    <text x="125" y="190" className="fill-rose-950 text-[25px] font-black">47°</text>
  </svg>;
  if (scene === "sign") return <svg role="img" aria-label="Szyld w kształcie równoległoboku" viewBox="0 0 620 260" className="h-auto w-full">
    <path d="M150 45H520L455 215H85Z" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="7" strokeLinejoin="round" />
    <path d="M85 215H30" className={common} strokeDasharray="11 9" />
    <path d="M85 178A42 42 0 0 0 48 215" className={common} />
    <text x="35" y="174" className="fill-blue-950 text-[24px] font-black">118°</text>
  </svg>;
  if (scene === "window") return <svg role="img" aria-label="Okno w kształcie trapezu równoramiennego" viewBox="0 0 620 260" className="h-auto w-full">
    <path d="M185 45H435L535 215H85Z" fill="#cffafe" stroke="#0e7490" strokeWidth="7" strokeLinejoin="round" />
    <path d="M310 45V215" stroke="#67e8f9" strokeWidth="5" /><path d="M135 130H485" stroke="#67e8f9" strokeWidth="5" />
  </svg>;
  if (scene === "streets") return <svg role="img" aria-label="Układ przecinających się prostych" viewBox="0 0 620 260" className="h-auto w-full">
    <path d="M70 55L550 215M80 215L540 45" stroke="#475569" strokeWidth="18" strokeLinecap="round" />
    <path d="M255 120A64 64 0 0 1 356 128" fill="none" stroke="#f97316" strokeWidth="7" />
    <circle cx="310" cy="130" r="8" fill="#111827" />
  </svg>;
  if (scene === "bridge") return <svg role="img" aria-label="Trójkątna rama mostu" viewBox="0 0 620 260" className="h-auto w-full">
    <path d="M65 215H555M105 215L310 45L515 215M165 215L310 95L455 215" stroke="#334155" strokeWidth="11" fill="none" strokeLinejoin="round" />
    <path d="M45 230H575" stroke="#0ea5e9" strokeWidth="18" strokeLinecap="round" />
  </svg>;
  return <svg role="img" aria-label="Rombowa ozdoba" viewBox="0 0 620 260" className="h-auto w-full">
    <path d="M310 30L540 130L310 230L80 130Z" fill="#f5d0fe" stroke="#a21caf" strokeWidth="7" strokeLinejoin="round" />
    <path d="M80 130H540M310 30V230" stroke="#86198f" strokeWidth="5" />
    <circle cx="310" cy="130" r="7" fill="#111827" />
  </svg>;
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
        <Scene scene={task.scene} />
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
