"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import {
  GRADE6_AREA_CALCULATION_TASKS,
  GRADE6_AREA_STORY_TASKS,
  GRADE6_COMPOSITE_RECTANGLE_TASKS,
  type AreaAnswerField,
  type AreaTask,
  type CompositeRectangleTask,
  type RectangleSquareAreaActivity,
} from "@/lib/math/area/rectangleSquareArea";

interface Props {
  activity: RectangleSquareAreaActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type SeriesTask = AreaTask | CompositeRectangleTask;

function ReviewSlide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 5 · Temat 1"
      heading="Pole prostokąta i kwadratu"
      description="Przypomnij wzory i odróżnij pole od obwodu. W tej lekcji wykorzystasz je także w zadaniach wieloetapowych."
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border-2 border-cyan-300 bg-cyan-50 p-5 text-center">
            <svg viewBox="0 0 380 220" role="img" aria-label="Prostokąt o bokach a i b" className="mx-auto w-full max-w-md">
              <defs>
                <pattern id="g6-rectangle-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M28 0H0V28" fill="none" stroke="#67e8f9" strokeWidth="1.5" />
                </pattern>
              </defs>
              <rect x="55" y="38" width="270" height="145" rx="10" fill="#cffafe" stroke="#0e7490" strokeWidth="5" />
              <rect x="55" y="38" width="270" height="145" rx="10" fill="url(#g6-rectangle-grid)" />
              <text x="190" y="28" textAnchor="middle" fontSize="24" fontWeight="900">a</text>
              <text x="36" y="118" textAnchor="middle" fontSize="24" fontWeight="900">b</text>
            </svg>
            <h3 className="text-xl font-black">Prostokąt</h3>
            <p className="mt-2 text-2xl font-black text-cyan-950">P = a · b</p>
            <p className="mt-1 font-bold text-slate-700">Obw = 2 · a + 2 · b</p>
          </section>
          <section className="rounded-3xl border-2 border-violet-300 bg-violet-50 p-5 text-center">
            <svg viewBox="0 0 380 220" role="img" aria-label="Kwadrat o boku a" className="mx-auto w-full max-w-md">
              <defs>
                <pattern id="g6-square-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <path d="M28 0H0V28" fill="none" stroke="#c4b5fd" strokeWidth="1.5" />
                </pattern>
              </defs>
              <rect x="105" y="28" width="170" height="170" rx="10" fill="#ede9fe" stroke="#6d28d9" strokeWidth="5" />
              <rect x="105" y="28" width="170" height="170" rx="10" fill="url(#g6-square-grid)" />
              <text x="190" y="22" textAnchor="middle" fontSize="24" fontWeight="900">a</text>
            </svg>
            <h3 className="text-xl font-black">Kwadrat</h3>
            <p className="mt-2 text-2xl font-black text-violet-950">P = a · a = a²</p>
            <p className="mt-1 font-bold text-slate-700">Obw = 4 · a</p>
          </section>
        </div>
        <p className="rounded-2xl bg-amber-50 px-5 py-4 text-center font-black text-amber-950">
          Przed obliczeniem pola wszystkie długości zapisz w tej samej jednostce.
        </p>
      </div>
    </LessonTaskFrame>
  );
}

function UnitRelationsSlide() {
  const rows = [
    ["1 cm = 10 mm", "1 cm² = 100 mm²"],
    ["1 dm = 10 cm", "1 dm² = 100 cm²"],
    ["1 m = 10 dm", "1 m² = 100 dm²"],
    ["1 m = 100 cm", "1 m² = 10 000 cm²"],
    ["1 km = 1000 m", "1 km² = 1 000 000 m²"],
  ];
  return (
    <LessonTaskFrame
      eyebrow="Dział 5 · Temat 1"
      heading="Zależności między jednostkami pola"
      description="Przy jednostkach pola przelicznik długości trzeba zastosować dwa razy — osobno dla obu wymiarów."
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border-2 border-indigo-300">
          <div className="grid grid-cols-2 bg-indigo-700 text-center font-black text-white">
            <span className="p-3">Jednostki długości</span>
            <span className="border-l-2 border-indigo-300 p-3">Jednostki pola</span>
          </div>
          {rows.map(([length, area], index) => (
            <div key={length} className={`grid grid-cols-2 text-center text-lg font-black ${index % 2 ? "bg-indigo-50" : "bg-white"}`}>
              <span className="p-4">{length}</span>
              <span className="border-l-2 border-indigo-200 p-4 text-violet-800">{area}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["1 a", "100 m²"],
            ["1 ha", "100 a = 10 000 m²"],
            ["1 km²", "100 ha"],
          ].map(([unit, value]) => (
            <div key={unit} className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
              <strong className="block text-2xl text-emerald-950">{unit}</strong>
              <span className="font-black text-slate-700">= {value}</span>
            </div>
          ))}
        </div>
        <p className="rounded-2xl bg-cyan-50 px-5 py-4 text-center font-black text-cyan-950">
          Przykład: 2,4 m = 240 cm, ale 2,4 m² = 24 000 cm².
        </p>
      </div>
    </LessonTaskFrame>
  );
}

function ShapeDiagram({ task }: { task: AreaTask }) {
  const square = task.shape === "square";
  const x = square ? 165 : 75;
  const width = square ? 190 : 370;
  const y = 48;
  const height = square ? 190 : 155;
  return (
    <svg role="img" aria-label={task.prompt} viewBox="0 0 520 265" className="mx-auto w-full max-w-3xl">
      <defs>
        <pattern id={`g6-area-${task.id}`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0H0V25" fill="none" stroke="#a5b4fc" strokeWidth="1.4" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx="10" fill="#e0e7ff" stroke="#4338ca" strokeWidth="5" />
      <rect x={x} y={y} width={width} height={height} rx="10" fill={`url(#g6-area-${task.id})`} />
      {task.labels.top ? <text x={x + width / 2} y={y - 15} textAnchor="middle" fontSize="22" fontWeight="900">{task.labels.top}</text> : null}
      {task.labels.side ? <text x={x - 20} y={y + height / 2} textAnchor="middle" fontSize="22" fontWeight="900" transform={`rotate(-90 ${x - 20} ${y + height / 2})`}>{task.labels.side}</text> : null}
      {task.labels.inside ? <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" fill="#312e81" fontSize="21" fontWeight="900">{task.labels.inside}</text> : null}
    </svg>
  );
}

function CompositeDiagram({ task }: { task: CompositeRectangleTask }) {
  return (
    <svg role="img" aria-label={task.prompt} viewBox="0 0 500 280" className="mx-auto w-full max-w-3xl rounded-2xl bg-slate-50">
      <defs>
        <pattern id={`g6-composite-grid-${task.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#cbd5e1" strokeWidth="1.3" />
        </pattern>
      </defs>
      <rect width="500" height="280" fill={`url(#g6-composite-grid-${task.id})`} />
      <polygon points={task.polygon} fill="#bae6fd" stroke="#0369a1" strokeWidth="5" strokeLinejoin="round" />
      {task.parts.map((part, index) => (
        <rect
          key={`${task.id}-${index}`}
          x={part.x}
          y={part.y}
          width={part.width}
          height={part.height}
          fill={index % 2 ? "#ddd6fe88" : "#67e8f955"}
          stroke="#7c3aed"
          strokeWidth="2"
          strokeDasharray="8 6"
        />
      ))}
      {task.labels.map((label) => (
        <text key={`${label.x}-${label.y}-${label.text}`} x={label.x} y={label.y} textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">{label.text}</text>
      ))}
    </svg>
  );
}

function blankAnswers(fields: AreaAnswerField[]) {
  return Object.fromEntries(fields.map((field) => [field.id, ""]));
}

function correctLabel(task: SeriesTask) {
  return task.answerFields.map((field) => `${field.answer} ${field.unit}`).join(", ");
}

function TaskSeries({
  tasks,
  heading,
  description,
  readOnly,
  composite = false,
  onResultChange,
}: {
  tasks: SeriesTask[];
  heading: string;
  description: string;
  readOnly: boolean;
  composite?: boolean;
  onResultChange?: Props["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0].answerFields) }));
  const [activeField, setActiveField] = useState(tasks[0].answerFields[0].id);
  const [feedbackByTask, setFeedbackByTask] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState<number[]>([]);
  const [attempted, setAttempted] = useState<number[]>([]);
  const [canContinue, setCanContinue] = useState(false);
  const answers = answersByTask[taskIndex] ?? blankAnswers(task.answerFields);
  const solved = completed.includes(taskIndex);

  const goTo = (index: number) => {
    if (index < 0 || index >= tasks.length) return;
    setTaskIndex(index);
    setAnswersByTask((current) => current[index] ? current : { ...current, [index]: blankAnswers(tasks[index].answerFields) });
    setActiveField(tasks[index].answerFields[0].id);
    setCanContinue(false);
    onResultChange?.(null);
  };

  const advance = () => {
    if (taskIndex < tasks.length - 1) {
      goTo(taskIndex + 1);
      return;
    }
    setCanContinue(false);
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: `${current[taskIndex]} Seria została zakończona.` }));
    onResultChange?.(false, correctLabel(task));
  };

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswersByTask((current) => {
      const currentAnswers = current[taskIndex] ?? blankAnswers(task.answerFields);
      const previous = currentAnswers[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : `${previous}${key}`.slice(0, 10);
      return { ...current, [taskIndex]: { ...currentAnswers, [activeField]: next } };
    });
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
    setCanContinue(false);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (task.answerFields.some((field) => !(answers[field.id] ?? "").trim())) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Uzupełnij wszystkie wymagane pola przed zatwierdzeniem." }));
      return;
    }
    const isCorrect = task.answerFields.every((field) => Number((answers[field.id] ?? "").replace(",", ".")) === field.answer);
    if (!isCorrect) {
      setAttempted((current) => current.includes(taskIndex) ? current : [...current, taskIndex]);
      setFeedbackByTask((current) => ({
        ...current,
        [taskIndex]: `Spróbuj innym razem. Poprawny wynik to ${correctLabel(task)}. Dziś bez punktu.`,
      }));
      setCanContinue(true);
      onResultChange?.(false, Object.values(answers).join(", "));
      return;
    }
    const nextCompleted = completed.includes(taskIndex) ? completed : [...completed, taskIndex];
    setCompleted(nextCompleted);
    setAttempted((current) => current.includes(taskIndex) ? current : [...current, taskIndex]);
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: `${task.success} Dobrze.` }));
    onResultChange?.(nextCompleted.length === tasks.length ? true : null, correctLabel(task));
    if (taskIndex < tasks.length - 1) window.setTimeout(advance, 650);
  };

  const feedback = feedbackByTask[taskIndex];
  const allAttempted = new Set([...attempted, ...completed]).size === tasks.length;

  return (
    <LessonTaskFrame
      eyebrow="Dział 5 · Temat 1"
      heading={heading}
      description={description}
      questionNumber={taskIndex + 1}
      questionCount={tasks.length}
      data-grade6-area-series={composite ? "composite" : "standard"}
      data-series-complete={allAttempted ? "true" : "false"}
    >
      <div className="space-y-5">
        <LessonTaskNavigator
          currentIndex={taskIndex}
          taskCount={tasks.length}
          completed={solved}
          completedCount={completed.length}
          onPrevious={() => goTo(taskIndex - 1)}
          onNext={() => goTo(taskIndex + 1)}
        />
        {"polygon" in task ? <CompositeDiagram task={task} /> : <ShapeDiagram task={task} />}
        <section className="rounded-3xl bg-slate-50 p-5 text-center">
          <p className="text-lg font-black leading-relaxed sm:text-2xl">{task.prompt}</p>
          {task.detail ? <p className="mt-2 font-bold text-indigo-800">{task.detail}</p> : null}
        </section>
        <div className={`grid gap-3 ${task.answerFields.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-lg"}`}>
          {task.answerFields.map((field) => (
            <label key={field.id} className={`flex items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 font-black ${activeField === field.id ? "border-violet-700 ring-4 ring-violet-100" : "border-slate-200"}`}>
              <span className="min-w-0 text-sm text-slate-700 sm:text-base">{field.label}</span>
              <input
                aria-label={field.label}
                inputMode="none"
                readOnly
                value={answers[field.id] ?? ""}
                onFocus={() => setActiveField(field.id)}
                onClick={() => setActiveField(field.id)}
                className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black outline-none focus:border-violet-700"
                data-grade6-area-answer={field.id}
              />
              <span className="text-lg">{field.unit}</span>
            </label>
          ))}
        </div>
        {feedback ? (
          <div className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`} role="status">
            <p>{feedback}</p>
            {canContinue ? (
              <button type="button" onClick={advance} className="mt-3 min-h-11 rounded-xl bg-indigo-700 px-5 text-white">
                Przejdź dalej bez punktu
              </button>
            ) : null}
          </div>
        ) : null}
        <LessonNumericKeypad
          onKey={onKey}
          onConfirm={check}
          disabled={readOnly || solved}
          allowSeparator
          label="Kalkulator do pola"
          helperText="Wybierz kratkę, wpisz wartość i zatwierdź zadanie raz na końcu."
        />
      </div>
    </LessonTaskFrame>
  );
}

export function Grade6RectangleAreaLab({ activity, readOnly = false, onResultChange }: Props) {
  if (activity === "grade6-review") return <ReviewSlide />;
  if (activity === "grade6-units") return <UnitRelationsSlide />;
  if (activity === "grade6-calculations") {
    return (
      <TaskSeries
        key="grade6-calculations"
        tasks={GRADE6_AREA_CALCULATION_TASKS}
        heading="Pole prostokąta i kwadratu — zadania"
        description="Zamieniaj jednostki, obliczaj brakujące boki i łącz pole z obwodem."
        readOnly={readOnly}
        onResultChange={onResultChange}
      />
    );
  }
  if (activity === "grade6-composite") {
    return (
      <TaskSeries
        key="grade6-composite"
        tasks={GRADE6_COMPOSITE_RECTANGLE_TASKS}
        heading="Pole figury złożonej z prostokątów"
        description="Podziel figurę na znane prostokąty albo odejmij wycięty fragment. Zapisz pola części i całej figury."
        readOnly={readOnly}
        composite
        onResultChange={onResultChange}
      />
    );
  }
  return (
    <TaskSeries
      key="grade6-stories"
      tasks={GRADE6_AREA_STORY_TASKS}
      heading="Zadania tekstowe"
      description="Samodzielnie rozpoznaj potrzebne działania. Zwróć uwagę na różne jednostki i kilka etapów rozwiązania."
      readOnly={readOnly}
      onResultChange={onResultChange}
    />
  );
}
