"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
import {
  G6_AREA_REVIEW_STORIES,
  G6_AREA_REVIEW_TASKS,
  G6_PARALLELOGRAM_RHOMBUS_STORIES,
  G6_PARALLELOGRAM_RHOMBUS_TASKS,
  G6_TRAPEZOID_STORIES,
  G6_TRAPEZOID_TASKS,
  G6_TRIANGLE_STORIES,
  G6_TRIANGLE_TASKS,
} from "@/lib/math/area/grade6PolygonArea";
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
  isGrade6,
  onResultChange,
}: {
  tasks: AreaReviewTask[];
  heading: string;
  description: string;
  readOnly: boolean;
  isGrade6: boolean;
  onResultChange?: AreaReviewLabProps["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0]) }));
  const [activeField, setActiveField] = useState(tasks[0].answers[0]?.id ?? "");
  const [matchesByTask, setMatchesByTask] = useState<Record<number, Record<string, string>>>({});
  const [activeMatchFigure, setActiveMatchFigure] = useState(tasks[0].matchBoard?.figures[0]?.id ?? "");
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [failedTasks, setFailedTasks] = useState<number[]>([]);
  const [feedbackByTask, setFeedbackByTask] = useState<Record<number, string>>({});
  const [pendingAdvance, setPendingAdvance] = useState<number | null>(null);
  const answers = answersByTask[taskIndex] ?? blankAnswers(task);
  const matches = matchesByTask[taskIndex] ?? {};
  const solved = completedTasks.includes(taskIndex);
  const feedback = feedbackByTask[taskIndex] ?? null;

  useEffect(() => {
    if (pendingAdvance !== taskIndex || taskIndex >= tasks.length - 1) return;
    const timeout = window.setTimeout(() => {
      const nextIndex = taskIndex + 1;
      const nextTask = tasks[nextIndex];
      setTaskIndex(nextIndex);
      setAnswersByTask((current) => current[nextIndex] ? current : { ...current, [nextIndex]: blankAnswers(nextTask) });
      setActiveField(nextTask.answers[0]?.id ?? "");
      setActiveMatchFigure(nextTask.matchBoard?.figures[0]?.id ?? "");
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
    if (task.matchBoard) {
      if (task.matchBoard.figures.some((figure) => !matches[figure.id])) {
        setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Dopasuj wynik do każdej figury." }));
        onResultChange?.(false, "brak odpowiedzi");
        return;
      }
      const correct = task.matchBoard.figures.every((figure) => matches[figure.id] === figure.answerOptionId);
      if (!correct) {
        setFailedTasks((current) => current.includes(taskIndex) ? current : [...current, taskIndex]);
        const correctAnswer = task.matchBoard.figures
          .map((figure) => `${figure.name}: ${task.matchBoard?.options.find((option) => option.id === figure.answerOptionId)?.label ?? ""}`)
          .join(", ");
        setFeedbackByTask((current) => ({ ...current, [taskIndex]: `Spróbuj innym razem. Poprawne dopasowanie to ${correctAnswer}. Dziś bez punktu.` }));
        onResultChange?.(false, Object.values(matches).join(", "));
        return;
      }
      const nextCompleted = completedTasks.includes(taskIndex) ? completedTasks : [...completedTasks, taskIndex];
      const allCompleted = nextCompleted.length === tasks.length;
      setCompletedTasks(nextCompleted);
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: allCompleted ? `${task.success} Cała seria jest ukończona.` : `${task.success} Za chwilę kolejne zadanie.` }));
      setPendingAdvance(taskIndex < tasks.length - 1 ? taskIndex : null);
      const allPassed = allCompleted && failedTasks.length === 0;
      onResultChange?.(allCompleted ? allPassed : null, task.matchBoard.figures.map((figure) => matches[figure.id]).join(", "));
      return;
    }
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
      setFailedTasks((current) => current.includes(taskIndex) ? current : [...current, taskIndex]);
      const correctAnswer = task.answers.map((field) => `${field.answer.toLocaleString("pl-PL")} ${field.unit}`).join(", ");
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: `Spróbuj innym razem. Poprawny wynik to ${correctAnswer}. Dziś bez punktu.` }));
      onResultChange?.(false, task.answers.map((field) => answers[field.id]).join(", "));
      return;
    }
    const nextCompleted = completedTasks.includes(taskIndex) ? completedTasks : [...completedTasks, taskIndex];
    const allCompleted = nextCompleted.length === tasks.length;
    setCompletedTasks(nextCompleted);
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: allCompleted ? `${task.success} Cała seria jest ukończona.` : `${task.success} Za chwilę kolejne zadanie.` }));
    setPendingAdvance(taskIndex < tasks.length - 1 ? taskIndex : null);
    const allPassed = allCompleted && failedTasks.length === 0;
    onResultChange?.(allCompleted ? allPassed : null, task.answers.map((field) => `${field.answer} ${field.unit}`).join(", "));
  };

  const advanceWithoutPoint = () => {
    if (taskIndex >= tasks.length - 1) {
      onResultChange?.(false, "seria ukończona bez pełnej liczby punktów");
      return;
    }
    const nextIndex = taskIndex + 1;
    setTaskIndex(nextIndex);
    setAnswersByTask((current) => current[nextIndex] ? current : { ...current, [nextIndex]: blankAnswers(tasks[nextIndex]) });
    setActiveField(tasks[nextIndex].answers[0]?.id ?? "");
    setActiveMatchFigure(tasks[nextIndex].matchBoard?.figures[0]?.id ?? "");
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
    onResultChange?.(null);
  };

  return <LessonTaskFrame eyebrow={isGrade6 ? "Dział 5 · Pola wielokątów" : "Dział 6 · Powtórzenie"} heading={heading} description={description} questionNumber={taskIndex + 1} questionCount={tasks.length} data-area-review-series="true">
    <div className="space-y-5">
      <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-center text-sm font-black text-indigo-950">Zaliczone: {completedTasks.length} z {tasks.length}. Poprawna odpowiedź otworzy następne zadanie.</p>
      {task.matchBoard ? (
        <section className="space-y-5 rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {task.matchBoard.figures.map((figure) => {
              const selectedOption = task.matchBoard?.options.find((option) => option.id === matches[figure.id]);
              const active = activeMatchFigure === figure.id;
              return (
                <button
                  key={figure.id}
                  type="button"
                  disabled={readOnly || solved}
                  onClick={() => setActiveMatchFigure(figure.id)}
                  className={`rounded-2xl border-4 bg-white p-2 text-left transition ${active ? "border-violet-600 shadow-lg" : "border-transparent shadow-sm"}`}
                >
                  <ShapeSvg task={{ ...task, prompt: figure.name, shape: figure.shape, labels: figure.labels, matchBoard: undefined }} />
                  <span className="mt-2 block text-center text-sm font-black text-slate-700">{figure.name}</span>
                  <span className={`mt-1 block min-h-9 rounded-full px-3 py-2 text-center font-black ${selectedOption ? "bg-violet-100 text-violet-950" : "bg-slate-100 text-slate-500"}`}>
                    {selectedOption?.label ?? "Wybierz pole"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="mb-3 text-center font-black text-slate-800">Wybierz pole zaznaczonej figury</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {task.matchBoard.options.map((option) => {
                const owner = Object.entries(matches).find(([, optionId]) => optionId === option.id)?.[0];
                const assignedElsewhere = Boolean(owner && owner !== activeMatchFigure);
                const selected = matches[activeMatchFigure] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={readOnly || solved || !activeMatchFigure || assignedElsewhere}
                    onClick={() => {
                      if (!activeMatchFigure) return;
                      setMatchesByTask((current) => ({
                        ...current,
                        [taskIndex]: { ...(current[taskIndex] ?? {}), [activeMatchFigure]: option.id },
                      }));
                      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
                      onResultChange?.(null);
                    }}
                    className={`min-h-14 rounded-[45%] border-2 px-4 py-3 text-lg font-black transition ${
                      selected
                        ? "border-violet-700 bg-violet-700 text-white"
                        : assignedElsewhere
                          ? "border-slate-200 bg-slate-100 text-slate-400"
                          : "border-cyan-300 bg-cyan-50 text-cyan-950 hover:border-violet-500"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : <ShapeSvg task={task} />}
      {task.image ? <Image src={task.image} alt="" width={1536} height={1024} className="mx-auto block aspect-video w-full max-w-4xl rounded-3xl border-2 border-cyan-200 object-cover shadow-sm" /> : null}
      <section className="rounded-3xl bg-amber-50 p-5 text-center">
        <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
        {task.detail ? <p className="mt-2 font-bold text-amber-800">{task.detail}</p> : null}
      </section>
      {!task.matchBoard ? <div className={`grid gap-3 ${task.answers.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-xl"}`}>
        {task.answers.map((field) => <label key={field.id} className={`flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 text-center font-black ${activeField === field.id ? "border-violet-700 ring-4 ring-violet-100" : "border-slate-200"}`}>
          <span className="w-full text-sm text-slate-700 sm:text-base">{field.label}</span>
          <input aria-label={field.label} inputMode="none" readOnly value={answers[field.id] ?? ""} onFocus={() => setActiveField(field.id)} onClick={() => setActiveField(field.id)} className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700" />
          <span className="text-xl text-slate-950">{field.unit}</span>
        </label>)}
      </div> : null}
      {feedback ? <div role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>
        <p>{feedback}</p>
        {!solved && failedTasks.includes(taskIndex) ? <button type="button" onClick={advanceWithoutPoint} className="mt-3 min-h-11 rounded-xl bg-amber-900 px-5 text-white">Przejdź dalej bez punktu</button> : null}
      </div> : null}
      {task.matchBoard ? (
        <button type="button" onClick={check} disabled={readOnly || solved} className="min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 shadow-sm disabled:opacity-50">
          Zatwierdź dopasowanie
        </button>
      ) : (
        <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} allowSeparator label="Kalkulator do powtórzenia pól" helperText="Kliknij kratkę, wpisz wynik z kalkulatora i zatwierdź rozwiązanie." />
      )}
    </div>
  </LessonTaskFrame>;
}

export function AreaReviewLab({ activity, readOnly = false, onResultChange }: AreaReviewLabProps) {
  const content = useMemo(() => {
    if (activity === "g6-parallelogram-rhombus") return { tasks: G6_PARALLELOGRAM_RHOMBUS_TASKS, heading: "Pole równoległoboku i rombu", description: "Wybierz właściwe dane, zapisz je w tych samych jednostkach i oblicz pole albo brakujący wymiar." };
    if (activity === "g6-parallelogram-rhombus-stories") return { tasks: G6_PARALLELOGRAM_RHOMBUS_STORIES, heading: "Zadania tekstowe", description: "Rozwiąż nowe zadania o panelach słonecznych i rombowym witrażu." };
    if (activity === "g6-triangle") return { tasks: G6_TRIANGLE_TASKS, heading: "Pole trójkąta", description: "Oblicz pole albo brakujący wymiar. Zwróć uwagę na jednostki i położenie wysokości." };
    if (activity === "g6-triangle-stories") return { tasks: G6_TRIANGLE_STORIES, heading: "Zadania tekstowe", description: "Zastosuj pole trójkąta w nowych sytuacjach: na ściance wspinaczkowej i żaglówce." };
    if (activity === "g6-trapezoid") return { tasks: G6_TRAPEZOID_TASKS, heading: "Pole trapezu", description: "Oblicz pole, wysokość lub brakującą podstawę i pokaż potrzebne zamiany jednostek." };
    if (activity === "g6-trapezoid-stories") return { tasks: G6_TRAPEZOID_STORIES, heading: "Zadania tekstowe", description: "Rozwiąż nowe zadania o trapezowej rabacie i muzealnym oknie." };
    if (activity === "g6-area-review") return { tasks: G6_AREA_REVIEW_TASKS, heading: "Powtórzenie pól wielokątów", description: "Rozpoznaj potrzebny wzór i oblicz brakujące wielkości." };
    if (activity === "g6-area-review-stories") return { tasks: G6_AREA_REVIEW_STORIES, heading: "Zadania tekstowe", description: "Połącz wiadomości o polach figur w wieloetapowych zadaniach." };
    if (activity === "formula-sprint") return { tasks: AREA_REVIEW_FORMULA_TASKS, heading: "Pola znanych figur", description: "Oblicz pola figur, dobierając właściwy wzór." };
    if (activity === "unit-sprint") return { tasks: AREA_REVIEW_UNIT_TASKS, heading: "Jednostki pola", description: "Wykonaj zamiany jednostek pola: mm², cm², dm², m², a, ha i km²." };
    if (activity === "figure-sprint") return { tasks: AREA_REVIEW_FIGURE_TASKS, heading: "Brakujący bok, wysokość lub obwód", description: "W każdym zadaniu zdecyduj, co trzeba obliczyć z pola, boków lub obwodu." };
    return { tasks: AREA_REVIEW_STORY_TASKS, heading: "Zadania z treścią", description: "Odczytaj dane z rysunku, wybierz działanie i wpisz wynik w odpowiedniej jednostce." };
  }, [activity]);

  return <ReviewSeries key={activity} {...content} readOnly={readOnly} isGrade6={activity.startsWith("g6-")} onResultChange={onResultChange} />;
}
