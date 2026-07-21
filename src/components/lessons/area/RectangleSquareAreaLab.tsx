"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
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

const SCENE_LABELS: Record<NonNullable<AreaTask["illustration"]>, string> = {
  garden: "Szkolny ogródek",
  carpet: "Dywan w sali",
  tiles: "Kwadratowa płytka",
  poster: "Plakat",
  sandbox: "Piaskownica",
  table: "Blat stolika",
  plot: "Działka",
  classroom: "Sala lekcyjna",
};

function StoryScene({ task }: { task: AreaTask }) {
  const scene = task.illustration ?? "garden";
  const square = task.shape === "square";
  const x = square ? 210 : 120;
  const width = square ? 180 : 360;
  const y = square ? 28 : 50;
  const height = square ? 180 : 145;
  return (
    <svg role="img" aria-label={`${SCENE_LABELS[scene]} — ilustracja do zadania`} viewBox="0 0 600 260" className="mx-auto w-full max-w-4xl rounded-3xl bg-sky-50">
      <rect width="600" height="260" rx="28" fill="#ecfeff" />
      {scene === "garden" || scene === "plot" ? (
        <>
          <rect x={x} y={y} width={width} height={height} rx="12" fill="#bbf7d0" stroke="#15803d" strokeWidth="5" />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${x + 35 + i * (width - 70) / 4} ${y + 105} q -12 -24 0 -42 q 12 18 0 42`} fill="none" stroke="#166534" strokeWidth="6" strokeLinecap="round" />)}
        </>
      ) : null}
      {scene === "carpet" ? (
        <>
          <rect x={x} y={y} width={width} height={height} rx="18" fill="#f5d0fe" stroke="#a21caf" strokeWidth="5" />
          <path d={`M ${x + 25} ${y + height / 2} H ${x + width - 25} M ${x + width / 2} ${y + 20} V ${y + height - 20}`} stroke="#c026d3" strokeWidth="10" strokeLinecap="round" />
        </>
      ) : null}
      {scene === "tiles" ? (
        <>
          <rect x={x} y={y} width={width} height={height} rx="8" fill="#fde68a" stroke="#b45309" strokeWidth="5" />
          <path d={`M ${x + width / 2} ${y} V ${y + height} M ${x} ${y + height / 2} H ${x + width}`} stroke="#d97706" strokeWidth="4" />
        </>
      ) : null}
      {scene === "poster" ? (
        <>
          <rect x={x} y={y} width={width} height={height} rx="5" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="5" />
          <path d={`M ${x + width / 2} ${y + 25} l 13 26 29 4 -21 20 5 29 -26 -14 -26 14 5 -29 -21 -20 29 -4 z`} fill="#fbbf24" stroke="#b45309" strokeWidth="3" />
        </>
      ) : null}
      {scene === "sandbox" ? (
        <>
          <rect x={x} y={y} width={width} height={height} rx="18" fill="#fde68a" stroke="#92400e" strokeWidth="8" />
          <circle cx={x + width / 2} cy={y + height / 2} r="34" fill="#fcd34d" stroke="#d97706" strokeWidth="4" />
          <path d={`M ${x + width / 2 - 16} ${y + height / 2} h 32 l -6 35 h -20 z`} fill="#38bdf8" />
        </>
      ) : null}
      {scene === "table" ? (
        <>
          <rect x={x} y={y} width={width} height={height} rx="18" fill="#fed7aa" stroke="#9a3412" strokeWidth="7" />
          <path d={`M ${x + 35} ${y + height} v 38 M ${x + width - 35} ${y + height} v 38`} stroke="#7c2d12" strokeWidth="12" strokeLinecap="round" />
        </>
      ) : null}
      {scene === "classroom" ? (
        <>
          <rect x={x} y={y} width={width} height={height} rx="10" fill="#e0e7ff" stroke="#4338ca" strokeWidth="5" />
          {[0, 1, 2].flatMap((row) => [0, 1, 2, 3].map((column) => <rect key={`${row}-${column}`} x={x + 35 + column * (width - 70) / 4} y={y + 25 + row * 42} width="52" height="26" rx="5" fill="#a5b4fc" stroke="#3730a3" strokeWidth="3" />))}
        </>
      ) : null}
      <text x="300" y="232" textAnchor="middle" fill="#0f172a" fontSize="24" fontWeight="900">{SCENE_LABELS[scene]}</text>
      {task.labels.top ? <text x={x + width / 2} y={y - 13} textAnchor="middle" fill="#0f172a" fontSize="21" fontWeight="900">{task.labels.top}</text> : null}
      {task.labels.side ? <text x={x - 22} y={y + height / 2} textAnchor="middle" fill="#0f172a" fontSize="21" fontWeight="900" transform={`rotate(-90 ${x - 22} ${y + height / 2})`}>{task.labels.side}</text> : null}
      {task.labels.inside ? <text x={x + width / 2} y={y + height / 2 + 8} textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">{task.labels.inside}</text> : null}
    </svg>
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
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["mm²", "cm²", "dm²", "m²"].map((unit) => <div key={unit} className="rounded-2xl border-2 border-cyan-300 bg-white px-4 py-4 text-center text-2xl font-black text-slate-950">{unit}</div>)}
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
  const [answers, setAnswers] = useState<Record<string, string>>(() => blankAnswers(tasks[0]));
  const [activeField, setActiveField] = useState(tasks[0].answerFields[0].id);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (!solved || taskIndex >= tasks.length - 1) return;
    const timeout = window.setTimeout(() => {
      const nextTask = tasks[taskIndex + 1];
      setTaskIndex((current) => current + 1);
      setAnswers(blankAnswers(nextTask));
      setActiveField(nextTask.answerFields[0].id);
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, solved, taskIndex, tasks]);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswers((current) => {
      const previous = current[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : `${previous}${key}`.slice(0, 3);
      return { ...current, [activeField]: next };
    });
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    const missing = task.answerFields.some((field) => !(answers[field.id] ?? "").trim());
    if (missing) {
      setFeedback("Uzupełnij wszystkie puste kratki.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = task.answerFields.every((field) => Number(answers[field.id]) === field.answer);
    if (!correct) {
      setFeedback("Jeszcze nie. Sprawdź, czy obliczasz pole wnętrza figury, długość boku czy obwód.");
      onResultChange?.(false, task.answerFields.map((field) => answers[field.id]).join(", "));
      return;
    }
    setSolved(true);
    setFeedback(taskIndex === tasks.length - 1 ? `${task.success} Cała seria jest ukończona.` : `${task.success} Za chwilę następne zadanie.`);
    onResultChange?.(taskIndex === tasks.length - 1 ? true : null, task.answerFields.map((field) => `${field.answer} ${field.unit}`).join(", "));
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 1"
      heading={heading}
      description={description}
      questionNumber={taskIndex + 1}
      questionCount={tasks.length}
      data-area-series={stories ? "stories" : "calculations"}
      data-series-complete={solved && taskIndex === tasks.length - 1 ? "true" : "false"}
    >
      <div className="space-y-5">
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
  if (activity === "area-definition") return <DefinitionSlide />;
  if (activity === "area-grid") return <AreaGridSlide readOnly={readOnly} />;
  if (activity === "area-formulas") return <FormulaSlide />;
  if (activity === "area-calculations") {
    return <TaskSeries tasks={AREA_CALCULATION_TASKS} heading="Obliczanie pola" description="Rozwiąż zadania po kolei. Zmieniaj jednostkę tylko wtedy, gdy wymaga tego treść." readOnly={readOnly} onResultChange={onResultChange} />;
  }
  return <TaskSeries tasks={AREA_STORY_TASKS} heading="Zadania tekstowe" description="Samodzielnie zdecyduj, jakie działanie należy wykonać. Pole i obwód opisują różne wielkości." readOnly={readOnly} stories onResultChange={onResultChange} />;
}
