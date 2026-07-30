"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { Grade6RectangleAreaLab } from "@/components/lessons/area/Grade6RectangleAreaLab";
import {
  AREA_CALCULATION_TASKS,
  AREA_STORY_TASKS,
  type AreaTask,
  type RectangleSquareAreaActivity,
} from "@/lib/math/area/rectangleSquareArea";

interface RectangleSquareAreaLabProps {
  activity: RectangleSquareAreaActivity;
  readOnly?: boolean;
  presentationMode?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function UnitSquare({ unit, side }: { unit: "mm²" | "cm²"; side: "1 mm" | "1 cm" }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4 text-center">
      <div className={`grid place-items-center border-4 border-cyan-700 bg-white font-black text-cyan-950 shadow-inner ${unit === "mm²" ? "h-24 w-24" : "h-32 w-32"}`}>
        1 {unit}
      </div>
      <div>
        <p className="font-black text-slate-950">Kwadrat jednostkowy 1 {unit}</p>
        <p className="text-sm font-bold text-slate-600">bok {side} · bok {side}</p>
      </div>
    </div>
  );
}

function ShapeDiagram({ task, compact = false }: { task: AreaTask; compact?: boolean }) {
  const square = task.shape === "square";
  const x = square ? 170 : 85;
  const width = square ? 180 : 350;
  const y = square ? 35 : 45;
  const height = square ? 180 : 155;
  return (
    <svg
      role="img"
      aria-label={`${square ? "Kwadrat" : "Prostokąt"}. ${task.prompt}`}
      viewBox="0 0 520 250"
      className={`mx-auto w-full ${compact ? "max-w-xl" : "max-w-3xl"}`}
    >
      <defs>
        <pattern id={`area-grid-${task.id}`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx="10" fill="#e0e7ff" stroke="#4338ca" strokeWidth="5" />
      <rect x={x} y={y} width={width} height={height} rx="10" fill={`url(#area-grid-${task.id})`} />
      {task.labels.top ? <text x={x + width / 2} y={y - 14} textAnchor="middle" fill="#0f172a" fontSize="23" fontWeight="800">{task.labels.top}</text> : null}
      {task.labels.side ? <text x={x - 20} y={y + height / 2} textAnchor="middle" fill="#0f172a" fontSize="23" fontWeight="800" transform={`rotate(-90 ${x - 20} ${y + height / 2})`}>{task.labels.side}</text> : null}
      {task.labels.inside ? <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" fill="#312e81" fontSize="26" fontWeight="900">{task.labels.inside}</text> : null}
    </svg>
  );
}

function StoryScene({ task }: { task: AreaTask }) {
  const labels = Array.from(
    new Set([task.labels.top, task.labels.side, task.labels.inside].filter((label): label is string => Boolean(label))),
  );

  if (!task.storyImage) return <ShapeDiagram task={task} compact />;

  return (
    <figure className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border-2 border-sky-200 bg-white shadow-sm">
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-sky-50">
        <Image
          src={task.storyImage.src}
          alt={task.storyImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
          preload={task.id === "garden"}
        />
      </div>
      {labels.length > 0 ? (
        <figcaption className="flex flex-wrap items-center justify-center gap-2 bg-sky-50 px-4 py-3">
          {labels.map((label) => (
            <span key={label} className="rounded-full border-2 border-sky-200 bg-white px-4 py-2 text-sm font-black text-slate-950 sm:text-base">
              {label}
            </span>
          ))}
        </figcaption>
      ) : null}
    </figure>
  );
}

function DefinitionSlide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 1"
      heading="Co to jest pole?"
      description="Pole mówi, jak dużą część powierzchni zajmuje wnętrze figury — ile kwadratów jednostkowych mieści się w środku."
    >
      <div className="space-y-6">
        <div className="relative mx-auto grid min-h-56 max-w-4xl place-items-center overflow-hidden rounded-3xl border-4 border-indigo-700 bg-indigo-100 p-8 text-center shadow-inner">
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(#818cf8 1px, transparent 1px), linear-gradient(90deg, #818cf8 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative rounded-2xl bg-white/90 px-6 py-5">
            <p className="text-2xl font-black text-indigo-950 sm:text-4xl">Pole to wnętrze figury</p>
            <p className="mt-2 font-bold text-slate-700">Sprawdzamy, ile kwadratów jednostkowych można ułożyć w środku bez luk i bez nakładania.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <UnitSquare unit="mm²" side="1 mm" />
          <UnitSquare unit="cm²" side="1 cm" />
        </div>
        <p className="rounded-2xl bg-amber-50 px-5 py-4 text-center font-black text-amber-950">Rysunki są powiększone. Każda jednostka pola jest kwadratem o bokach długości jednej jednostki.</p>
      </div>
    </LessonTaskFrame>
  );
}

function AreaGridSlide({ readOnly }: { readOnly: boolean }) {
  const [width, setWidth] = useState(6);
  const [height, setHeight] = useState(4);
  const area = width * height;
  const cells = useMemo(() => Array.from({ length: 100 }, (_, index) => ({ row: Math.floor(index / 10), column: index % 10 })), []);
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 1"
      heading="Pole na kratownicy"
      description="Przesuwaj suwaki. Zaznaczone kratki pokazują wnętrze prostokąta lub kwadratu."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]">
        <div className="space-y-6 rounded-3xl bg-indigo-50 p-5">
          <label className="block font-black text-indigo-950">
            Długość: <span className="text-2xl">{width}</span> {width === 1 ? "jednostka" : "jednostek"}
            <input aria-label="Długość prostokąta" className="mt-3 w-full accent-indigo-700" type="range" min="1" max="10" value={width} disabled={readOnly} onChange={(event) => setWidth(Number(event.target.value))} />
          </label>
          <label className="block font-black text-indigo-950">
            Szerokość: <span className="text-2xl">{height}</span> {height === 1 ? "jednostka" : "jednostek"}
            <input aria-label="Szerokość prostokąta" className="mt-3 w-full accent-cyan-700" type="range" min="1" max="10" value={height} disabled={readOnly} onChange={(event) => setHeight(Number(event.target.value))} />
          </label>
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm" aria-live="polite">
            <p className="text-sm font-black uppercase tracking-wide text-slate-500">{width === height ? "Kwadrat" : "Prostokąt"}</p>
            <p className="mt-1 text-3xl font-black text-indigo-950">P = {width} · {height} = {area}</p>
            <p className="mt-1 font-bold text-slate-600">{area} {area === 1 ? "kwadrat jednostkowy" : "kwadratów jednostkowych"}</p>
          </div>
        </div>
        <div>
          <div role="img" aria-label={`Kratownica 10 na 10. Zaznaczony obszar ma ${width} kolumn i ${height} wiersze, czyli pole ${area}.`} className="mx-auto grid w-full max-w-2xl grid-cols-10 overflow-hidden rounded-2xl border-4 border-slate-700 bg-white shadow-lg">
            {cells.map(({ row, column }) => {
              const active = row < height && column < width;
              return <span key={`${row}-${column}`} aria-hidden className={`aspect-square border border-slate-300 ${active ? "bg-cyan-400" : "bg-white"}`} data-area-cell={active ? "active" : "inactive"} />;
            })}
          </div>
          <p className="mt-3 text-center font-bold text-slate-600">Każda mała kratka ma pole 1 jednostki².</p>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function FormulaCard({ title, formula, children }: { title: string; formula: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center">
      {children}
      <h3 className="mt-3 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 rounded-2xl bg-indigo-700 px-5 py-3 text-2xl font-black text-white">{formula}</p>
    </div>
  );
}

function FormulaSlide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 1"
      heading="Wzory i jednostki pola"
      description="Aby obliczyć pole, mnożymy długości boków. Wynik zawsze zapisujemy w jednostkach kwadratowych."
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <FormulaCard title="Pole prostokąta" formula="P = a · b">
            <svg role="img" aria-label="Prostokąt o bokach a i b" viewBox="0 0 320 180" className="h-48 w-full max-w-md">
              <rect x="45" y="35" width="230" height="110" rx="8" fill="#cffafe" stroke="#0e7490" strokeWidth="6" />
              <text x="160" y="25" textAnchor="middle" fontSize="24" fontWeight="900" fill="#0f172a">a</text>
              <text x="28" y="96" textAnchor="middle" fontSize="24" fontWeight="900" fill="#0f172a">b</text>
            </svg>
          </FormulaCard>
          <FormulaCard title="Pole kwadratu" formula="P = a · a = a²">
            <svg role="img" aria-label="Kwadrat o boku a" viewBox="0 0 320 180" className="h-48 w-full max-w-md">
              <rect x="95" y="22" width="136" height="136" rx="8" fill="#ede9fe" stroke="#6d28d9" strokeWidth="6" />
              <text x="163" y="18" textAnchor="middle" fontSize="24" fontWeight="900" fill="#0f172a">a</text>
              <text x="77" y="96" textAnchor="middle" fontSize="24" fontWeight="900" fill="#0f172a">a</text>
            </svg>
          </FormulaCard>
        </div>
        <section aria-label="Podstawowe jednostki pola" className="rounded-3xl bg-cyan-50 p-5">
          <h3 className="text-center text-xl font-black text-cyan-950">Podstawowe jednostki pola</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { symbol: "mm²", name: "milimetr kwadratowy" },
              { symbol: "cm²", name: "centymetr kwadratowy" },
              { symbol: "dm²", name: "decymetr kwadratowy" },
              { symbol: "m²", name: "metr kwadratowy" },
              { symbol: "km²", name: "kilometr kwadratowy" },
            ].map((unit) => (
              <div key={unit.symbol} className="rounded-2xl border-2 border-cyan-300 bg-white px-3 py-4 text-center text-slate-950 shadow-sm">
                <strong className="block text-2xl font-black">{unit.symbol}</strong>
                <span className="mt-1 block text-xs font-bold text-slate-600">{unit.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function blankAnswers(task: AreaTask): Record<string, string> {
  return Object.fromEntries(task.answerFields.map((field) => [field.id, ""]));
}

function TaskSeries({
  tasks,
  heading,
  description,
  readOnly,
  stories = false,
  onResultChange,
}: {
  tasks: AreaTask[];
  heading: string;
  description: string;
  readOnly: boolean;
  stories?: boolean;
  onResultChange?: RectangleSquareAreaLabProps["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: blankAnswers(tasks[0]) }));
  const [activeField, setActiveField] = useState(tasks[0].answerFields[0].id);
  const [feedbackByTask, setFeedbackByTask] = useState<Record<number, string>>({});
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [pendingAdvance, setPendingAdvance] = useState<number | null>(null);
  const answers = answersByTask[taskIndex] ?? blankAnswers(task);
  const feedback = feedbackByTask[taskIndex] ?? null;
  const solved = completedTasks.includes(taskIndex);

  useEffect(() => {
    if (pendingAdvance === null || pendingAdvance !== taskIndex || taskIndex >= tasks.length - 1) return;
    const timeout = window.setTimeout(() => {
      const nextTask = tasks[taskIndex + 1];
      setTaskIndex((current) => current + 1);
      setAnswersByTask((current) => current[taskIndex + 1] ? current : { ...current, [taskIndex + 1]: blankAnswers(nextTask) });
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
      const next = key === "backspace" ? previous.slice(0, -1) : `${previous}${key}`.slice(0, 8);
      return { ...current, [taskIndex]: { ...taskAnswers, [activeField]: next } };
    });
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    const missing = task.answerFields.some((field) => !(answers[field.id] ?? "").trim());
    if (missing) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Uzupełnij wszystkie puste kratki." }));
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = task.answerFields.every((field) => Number(answers[field.id]) === field.answer);
    if (!correct) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Jeszcze nie. Sprawdź, czy obliczasz pole wnętrza figury, długość boku czy obwód." }));
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
      eyebrow="Dział 6 · Temat 1"
      heading={heading}
      description={description}
      questionNumber={taskIndex + 1}
      questionCount={tasks.length}
      data-area-series={stories ? "stories" : "calculations"}
      data-series-complete={completedTasks.length === tasks.length ? "true" : "false"}
    >
      <div className="space-y-5">
        <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white p-2 shadow-sm" aria-label="Przełączanie zadań">
          <button type="button" onClick={() => goToTask(taskIndex - 1)} disabled={taskIndex === 0} className="min-h-11 justify-self-start rounded-xl bg-indigo-100 px-3 font-black text-indigo-950 disabled:opacity-35">
            ← Poprzednie
          </button>
          <span className="text-center text-xs font-black text-slate-600">Rozwiązane: {completedTasks.length} z {tasks.length}</span>
          <button type="button" onClick={() => goToTask(taskIndex + 1)} disabled={taskIndex === tasks.length - 1} className="min-h-11 justify-self-end rounded-xl bg-indigo-700 px-3 font-black text-white disabled:opacity-35">
            Następne →
          </button>
        </nav>
        {stories ? <StoryScene task={task} /> : <ShapeDiagram task={task} />}
        <section className="rounded-3xl bg-slate-50 p-5 text-center">
          <p className="text-lg font-black leading-relaxed text-slate-950 sm:text-2xl">{task.prompt}</p>
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
                className="h-14 w-24 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700"
                data-area-answer={field.id}
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
          label="Kalkulator do pola"
          helperText="Kliknij wybraną kratkę, wpisz liczbę i zatwierdź odpowiedź."
        />
      </div>
    </LessonTaskFrame>
  );
}

export function RectangleSquareAreaLab({ activity, readOnly = false, onResultChange }: RectangleSquareAreaLabProps) {
  if (activity.startsWith("grade6-")) {
    return <Grade6RectangleAreaLab activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  }
  if (activity === "area-definition") return <DefinitionSlide />;
  if (activity === "area-grid") return <AreaGridSlide readOnly={readOnly} />;
  if (activity === "area-formulas") return <FormulaSlide />;
  if (activity === "area-calculations") {
    return <TaskSeries key="area-calculations" tasks={AREA_CALCULATION_TASKS} heading="Obliczanie pola" description="Rozwiąż zadania po kolei. Zmieniaj jednostkę tylko wtedy, gdy wymaga tego treść." readOnly={readOnly} onResultChange={onResultChange} />;
  }
  return <TaskSeries key="area-stories" tasks={AREA_STORY_TASKS} heading="Zadania tekstowe" description="Samodzielnie zdecyduj, jakie działanie należy wykonać. Pole i obwód opisują różne wielkości." readOnly={readOnly} stories onResultChange={onResultChange} />;
}
