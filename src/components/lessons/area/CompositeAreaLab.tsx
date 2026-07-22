"use client";

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  COMPOSITE_GRID_CHALLENGE_TASKS,
  COMPOSITE_GRID_PRACTICE_TASKS,
  COMPOSITE_GRID_REVIEW_TASKS,
  type CompositeAreaActivity,
  type CompositeAreaTask,
  type GridPoint,
} from "@/lib/math/area/compositeArea";
import { parsePolishDecimal } from "@/lib/math/area/unitConversion";

interface CompositeAreaLabProps {
  activity: CompositeAreaActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

const GRID_WIDTH = 10;
const GRID_HEIGHT = 8;
const CELL = 58;
const PADDING = 34;
const SVG_WIDTH = GRID_WIDTH * CELL + PADDING * 2;
const SVG_HEIGHT = GRID_HEIGHT * CELL + PADDING * 2;

function FormulaFraction({ numerator }: { numerator: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 flex-col items-center align-middle font-black leading-none" aria-label="ułamek przez 2">
      <span className="border-b-[3px] border-current px-2 pb-1">{numerator}</span>
      <span className="pt-1">2</span>
    </span>
  );
}

function FormulaRecap() {
  const formulas = [
    { name: "Kwadrat", formula: <><b>P = a · a</b></> },
    { name: "Prostokąt", formula: <><b>P = a · b</b></> },
    { name: "Równoległobok", formula: <><b>P = a · h</b></> },
    { name: "Trójkąt", formula: <><b>P = </b><FormulaFraction numerator={<>a · h</>} /></> },
    { name: "Romb", formula: <><b>P = a · h</b><span className="mx-2 text-slate-400">lub</span><b>P = </b><FormulaFraction numerator={<>e · f</>} /></> },
    { name: "Trapez", formula: <><b>P = </b><FormulaFraction numerator={<>(a + b) · h</>} /></> },
  ];

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 7"
      heading="Przypomnienie wzorów na pola"
      description="Za chwilę policzysz pole wielokąta złożonego z poznanych figur. Najpierw wybierz wzór pasujący do każdej części."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {formulas.map((item) => (
          <section key={item.name} className="min-h-36 overflow-x-auto rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50 p-4 text-center shadow-sm">
            <h3 className="text-lg font-black text-indigo-950">{item.name}</h3>
            <div className="mt-5 text-center text-xl text-slate-950 sm:text-2xl">
              <span className="inline-flex min-w-max items-center justify-center gap-1 whitespace-nowrap">{item.formula}</span>
            </div>
          </section>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-emerald-100 px-5 py-4 text-center font-black text-emerald-950">Plan pracy: podziel wielokąt na znane figury, oblicz pola części i dodaj wyniki.</p>
    </LessonTaskFrame>
  );
}

function pointKey(point: GridPoint) {
  return `${point[0]}:${point[1]}`;
}

function cutKey(first: GridPoint, second: GridPoint) {
  return [pointKey(first), pointKey(second)].sort().join("|");
}

function toSvg([x, y]: GridPoint) {
  return { x: PADDING + x * CELL, y: PADDING + y * CELL };
}

function GridFigure({
  task,
  selectedPoints,
  selectedCutIndexes,
  onPoint,
  interactive,
}: {
  task: CompositeAreaTask;
  selectedPoints: GridPoint[];
  selectedCutIndexes: number[];
  onPoint?: (point: GridPoint) => void;
  interactive: boolean;
}) {
  const polygon = task.polygon.map((point) => {
    const svg = toSvg(point);
    return `${svg.x},${svg.y}`;
  }).join(" ");

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !onPoint) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const rawX = (event.clientX - rect.left) * SVG_WIDTH / (rect.width || SVG_WIDTH);
    const rawY = (event.clientY - rect.top) * SVG_HEIGHT / (rect.height || SVG_HEIGHT);
    const x = Math.max(0, Math.min(GRID_WIDTH, Math.round((rawX - PADDING) / CELL)));
    const y = Math.max(0, Math.min(GRID_HEIGHT, Math.round((rawY - PADDING) / CELL)));
    onPoint([x, y]);
  };

  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-sky-200 bg-sky-50 p-2">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className={`mx-auto block min-w-[620px] max-w-none touch-none rounded-2xl bg-white ${interactive ? "cursor-crosshair" : ""}`}
        style={{ width: "min(100%, 760px)", height: "auto" }}
        role="img"
        aria-label="Kratownica. Jedna kratka ma bok długości 1 centymetra"
        onPointerDown={handlePointerDown}
        data-composite-grid="true"
      >
        <defs>
          <pattern id={`composite-grid-${task.id}`} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <path d={`M ${CELL} 0 L 0 0 0 ${CELL}`} fill="none" stroke="#60a5fa" strokeWidth="2.5" />
          </pattern>
        </defs>
        <rect x={PADDING} y={PADDING} width={GRID_WIDTH * CELL} height={GRID_HEIGHT * CELL} fill="#eff6ff" stroke="#0369a1" strokeWidth="4" rx="12" />
        <rect x={PADDING} y={PADDING} width={GRID_WIDTH * CELL} height={GRID_HEIGHT * CELL} fill={`url(#composite-grid-${task.id})`} rx="12" />
        <polygon points={polygon} fill="#c4b5fd" fillOpacity="0.38" stroke="#4c1d95" strokeWidth="5" strokeLinejoin="round" />
        {selectedCutIndexes.map((index) => {
          const cut = task.cuts[index];
          const start = toSvg(cut.from);
          const end = toSvg(cut.to);
          return <line key={index} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#e11d48" strokeWidth="6" strokeDasharray="12 7" strokeLinecap="round" data-composite-cut="true" />;
        })}
        {selectedPoints.map((point, index) => {
          const svg = toSvg(point);
          return <g key={`${pointKey(point)}-${index}`}><circle cx={svg.x} cy={svg.y} r="13" fill="#facc15" stroke="#a16207" strokeWidth="4" /><text x={svg.x} y={svg.y + 6} textAnchor="middle" className="pointer-events-none fill-slate-950 text-[17px] font-black">{index + 1}</text></g>;
        })}
        {selectedCutIndexes.length === task.cuts.length ? task.parts.map((part) => {
          const marker = toSvg(part.marker);
          return <g key={part.id}><circle cx={marker.x} cy={marker.y} r="18" fill="white" stroke="#4c1d95" strokeWidth="3" /><text x={marker.x} y={marker.y + 7} textAnchor="middle" className="pointer-events-none fill-violet-950 text-[20px] font-black">{part.id.toUpperCase()}</text></g>;
        }) : null}
      </svg>
      <p className="px-3 pt-2 text-center text-sm font-black text-sky-950">Jedna kratka ma wymiary 1 cm × 1 cm. Licz odległości między liniami kratownicy.</p>
    </div>
  );
}

function answersFor(task: CompositeAreaTask) {
  return Object.fromEntries([...task.parts, { id: "total", label: "Pole całego wielokąta", area: task.total, marker: [0, 0] as GridPoint }].map((part) => [part.id, ""])) as Record<string, string>;
}

function CompositeTaskSeries({
  tasks,
  heading,
  description,
  readOnly,
  onResultChange,
}: {
  tasks: CompositeAreaTask[];
  heading: string;
  description: string;
  readOnly: boolean;
  onResultChange?: CompositeAreaLabProps["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const task = tasks[taskIndex];
  const [answersByTask, setAnswersByTask] = useState<Record<number, Record<string, string>>>(() => ({ 0: answersFor(tasks[0]) }));
  const [activeField, setActiveField] = useState("a");
  const [selectedPoints, setSelectedPoints] = useState<GridPoint[]>([]);
  const [selectedCutIndexesByTask, setSelectedCutIndexesByTask] = useState<Record<number, number[]>>({});
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [feedbackByTask, setFeedbackByTask] = useState<Record<number, string>>({});
  const [pendingAdvance, setPendingAdvance] = useState<number | null>(null);

  const answers = answersByTask[taskIndex] ?? answersFor(task);
  const selectedCutIndexes = selectedCutIndexesByTask[taskIndex] ?? [];
  const cutsComplete = selectedCutIndexes.length === task.cuts.length;
  const solved = completedTasks.includes(taskIndex);
  const feedback = feedbackByTask[taskIndex] ?? null;
  const fields = useMemo(() => [...task.parts.map((part) => ({ id: part.id, label: part.label, answer: part.area })), { id: "total", label: "Pole całego wielokąta", answer: task.total }], [task]);

  useEffect(() => {
    if (pendingAdvance !== taskIndex || taskIndex >= tasks.length - 1) return;
    const timeout = window.setTimeout(() => {
      const nextIndex = taskIndex + 1;
      const nextTask = tasks[nextIndex];
      setTaskIndex(nextIndex);
      setAnswersByTask((current) => current[nextIndex] ? current : { ...current, [nextIndex]: answersFor(nextTask) });
      setActiveField(nextTask.parts[0]?.id ?? "total");
      setSelectedPoints([]);
      setPendingAdvance(null);
      onResultChange?.(null);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, pendingAdvance, taskIndex, tasks]);

  const selectPoint = (point: GridPoint) => {
    if (readOnly || solved || cutsComplete) return;
    setSelectedPoints((current) => current.length === 0 ? [point] : current.length === 1 ? [current[0], point] : [point]);
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
  };

  const addCut = () => {
    if (readOnly || solved) return;
    if (selectedPoints.length !== 2) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Dotknij dwóch węzłów kratownicy, aby wyznaczyć odcinek podziału." }));
      return;
    }
    const key = cutKey(selectedPoints[0], selectedPoints[1]);
    const correctCutIndex = task.cuts.findIndex((cut) => cutKey(cut.from, cut.to) === key);
    if (correctCutIndex < 0 || selectedCutIndexes.includes(correctCutIndex)) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Ten odcinek nie dzieli figury na potrzebne znane figury. Przemyśl podział i spróbuj ponownie." }));
      return;
    }
    const nextIndexes = [...selectedCutIndexes, correctCutIndex];
    setSelectedCutIndexesByTask((current) => ({ ...current, [taskIndex]: nextIndexes }));
    setSelectedPoints([]);
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: nextIndexes.length === task.cuts.length ? "Podział jest gotowy. Odczytaj wymiary z kratownicy, oblicz pola części i wpisz wyniki." : "Dobrze. Wybierz teraz kolejny odcinek podziału." }));
  };

  const onKey = (key: string) => {
    if (readOnly || solved || !cutsComplete) return;
    setAnswersByTask((current) => {
      const taskAnswers = current[taskIndex] ?? answersFor(task);
      const previous = taskAnswers[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : key === "," ? (previous.includes(",") ? previous : `${previous},`) : `${previous}${key}`.slice(0, 8);
      return { ...current, [taskIndex]: { ...taskAnswers, [activeField]: next } };
    });
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: "" }));
    onResultChange?.(null);
  };

  const confirm = () => {
    if (readOnly || solved) return;
    if (!cutsComplete) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Najpierw podziel figurę na znane figury." }));
      onResultChange?.(false, "brak podziału");
      return;
    }
    if (fields.some((field) => !(answers[field.id] ?? "").trim())) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: "Uzupełnij pola wszystkich części oraz pole całego wielokąta." }));
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = fields.every((field) => {
      const parsed = parsePolishDecimal(answers[field.id]);
      return parsed !== null && Math.abs(parsed - field.answer) < 0.00001;
    });
    if (!correct) {
      setFeedbackByTask((current) => ({ ...current, [taskIndex]: `Jeszcze nie. ${task.hint}` }));
      onResultChange?.(false, fields.map((field) => answers[field.id]).join(", "));
      return;
    }
    const nextCompleted = completedTasks.includes(taskIndex) ? completedTasks : [...completedTasks, taskIndex];
    const allCompleted = nextCompleted.length === tasks.length;
    setCompletedTasks(nextCompleted);
    setFeedbackByTask((current) => ({ ...current, [taskIndex]: allCompleted ? `${task.success} Cała seria jest ukończona.` : `${task.success} Za chwilę kolejne zadanie.` }));
    setPendingAdvance(taskIndex < tasks.length - 1 ? taskIndex : null);
    onResultChange?.(allCompleted ? true : null, `${task.total} cm²`);
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 7"
      heading={heading}
      description={description}
      questionNumber={taskIndex + 1}
      questionCount={tasks.length}
      data-composite-series="true"
    >
      <div className="space-y-5">
        <p className="rounded-2xl bg-indigo-50 px-4 py-3 text-center text-sm font-black text-indigo-950">Zaliczone: {completedTasks.length} z {tasks.length}. Najpierw podziel figurę, potem oblicz jej pole.</p>
        <GridFigure task={task} selectedPoints={selectedPoints} selectedCutIndexes={selectedCutIndexes} onPoint={selectPoint} interactive={!readOnly && !solved && !cutsComplete} />
        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
          {task.detail ? <p className="mt-2 font-bold text-amber-800">{task.detail}</p> : null}
        </section>
        {!cutsComplete ? <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4"><span className="font-black text-rose-950">Wybrane punkty: {selectedPoints.length}/2</span><button type="button" onClick={() => setSelectedPoints([])} disabled={!selectedPoints.length || readOnly} className="min-h-11 rounded-xl bg-white px-4 font-black text-rose-950 disabled:opacity-40">Wyczyść wybór</button><button type="button" onClick={addCut} disabled={selectedPoints.length !== 2 || readOnly} className="min-h-11 rounded-xl bg-rose-700 px-5 font-black text-white disabled:opacity-40">Dodaj odcinek podziału</button></div> : null}
        <div className={`grid gap-3 ${fields.length > 3 ? "sm:grid-cols-2" : "mx-auto max-w-3xl sm:grid-cols-3"}`}>
          {fields.map((field) => (
            <label key={field.id} className={`flex min-h-24 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 bg-white p-3 text-center font-black ${activeField === field.id && cutsComplete ? "border-emerald-700 ring-4 ring-emerald-100" : "border-slate-200"} ${cutsComplete ? "" : "opacity-55"}`}>
              <span className="w-full text-sm text-slate-700">{field.label}</span>
              <input aria-label={field.label} inputMode="none" readOnly value={answers[field.id] ?? ""} onFocus={() => cutsComplete && setActiveField(field.id)} onClick={() => cutsComplete && setActiveField(field.id)} className="h-14 w-24 rounded-xl border-2 border-emerald-400 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-emerald-700" />
              <span className="text-lg text-slate-950">cm²</span>
            </label>
          ))}
        </div>
        {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
        <LessonNumericKeypad onKey={onKey} onConfirm={confirm} disabled={readOnly || solved || !cutsComplete} allowSeparator label="Kalkulator do pola wielokąta" helperText={cutsComplete ? "Kliknij kratkę, wpisz pola części i na końcu pole całej figury." : "Najpierw wskaż na kratownicy odcinek lub odcinki podziału."} />
      </div>
    </LessonTaskFrame>
  );
}

function GuidedSplit({ readOnly, onResultChange }: Pick<CompositeAreaLabProps, "readOnly" | "onResultChange">) {
  return <CompositeTaskSeries tasks={[COMPOSITE_GRID_PRACTICE_TASKS[0]]} heading="Jak dzielić wielokąt na znane figury" description="Dotknij dwóch węzłów kratownicy, aby narysować odcinek podziału. Po podziale odczytaj wymiary z kratek i oblicz pola części." readOnly={readOnly ?? false} onResultChange={onResultChange} />;
}

export function CompositeAreaLab({ activity, readOnly = false, onResultChange }: CompositeAreaLabProps) {
  if (activity === "formula-recap") return <FormulaRecap />;
  if (activity === "guided-split") return <GuidedSplit readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "grid-practice") return <CompositeTaskSeries key="composite-practice" tasks={COMPOSITE_GRID_PRACTICE_TASKS} heading="Wielokąty na kratownicy" description="Każda kratka ma pole 1 cm². Samodzielnie dobierz podział na znane figury i oblicz pole." readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "grid-review") return <CompositeTaskSeries key="composite-review" tasks={COMPOSITE_GRID_REVIEW_TASKS} heading="Powtórzenie: wielokąty na kratownicy" description="To są nowe figury. Samodzielnie wybierz podział, odczytaj długości z kratownicy i oblicz pole każdej części." readOnly={readOnly} onResultChange={onResultChange} />;
  return <CompositeTaskSeries key="composite-challenge" tasks={COMPOSITE_GRID_CHALLENGE_TASKS} heading="Trudniejsze wielokąty na kratownicy" description="Nie odczytujesz gotowych długości — samodzielnie liczysz kratki, dzielisz figurę i dobierasz wzory." readOnly={readOnly} onResultChange={onResultChange} />;
}
