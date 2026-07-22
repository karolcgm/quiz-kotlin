"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  TRIANGLE_CALCULATION_TASKS,
  TRIANGLE_ORIENTATION_TASKS,
  TRIANGLE_STORY_TASKS,
  type TriangleAreaActivity,
  type TriangleAreaTask,
  type TriangleShape,
  type TriangleStoryTask,
} from "@/lib/math/area/triangleArea";
import { parsePolishDecimal } from "@/lib/math/area/unitConversion";

interface TriangleAreaLabProps {
  activity: TriangleAreaActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Point = { x: number; y: number };
type Vertex = Point & { id: "A" | "B" | "C" };
type SideId = "AB" | "BC" | "CA";

const CENTER = { x: 340, y: 200 };
const SIDE_IDS: SideId[] = ["AB", "BC", "CA"];

const TRIANGLE_POINTS: Record<TriangleShape, Vertex[]> = {
  acute: [
    { id: "A", x: 150, y: 290 },
    { id: "B", x: 530, y: 290 },
    { id: "C", x: 355, y: 70 },
  ],
  obtuse: [
    { id: "A", x: 180, y: 290 },
    { id: "B", x: 540, y: 290 },
    { id: "C", x: 75, y: 150 },
  ],
  right: [
    { id: "A", x: 165, y: 290 },
    { id: "B", x: 525, y: 290 },
    { id: "C", x: 165, y: 90 },
  ],
};

function rotatePoint(point: Point, degrees: number): Point {
  const radians = degrees * Math.PI / 180;
  const dx = point.x - CENTER.x;
  const dy = point.y - CENTER.y;
  return {
    x: CENTER.x + dx * Math.cos(radians) - dy * Math.sin(radians),
    y: CENTER.y + dx * Math.sin(radians) + dy * Math.cos(radians),
  };
}

function projectPoint(point: Point, start: Point, end: Point) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const scale = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  return { point: { x: start.x + scale * dx, y: start.y + scale * dy }, scale };
}

function oppositeVertexId(sideId: SideId): Vertex["id"] {
  if (sideId === "AB") return "C";
  if (sideId === "BC") return "A";
  return "B";
}

function sideGeometry(sideId: SideId, vertices: Vertex[]) {
  const byId = Object.fromEntries(vertices.map((point) => [point.id, point])) as Record<Vertex["id"], Vertex>;
  const [startId, endId] = sideId.split("") as [Vertex["id"], Vertex["id"]];
  const start = byId[startId];
  const end = byId[endId];
  const source = byId[oppositeVertexId(sideId)];
  const projection = projectPoint(source, start, end);
  return { start, end, source, foot: projection.point, footScale: projection.scale };
}

function rightAngleArc(foot: Point, start: Point, source: Point, size = 18) {
  const baseLength = Math.hypot(start.x - foot.x, start.y - foot.y) || 1;
  const heightLength = Math.hypot(source.x - foot.x, source.y - foot.y) || 1;
  const u = { x: (start.x - foot.x) / baseLength, y: (start.y - foot.y) / baseLength };
  const v = { x: (source.x - foot.x) / heightLength, y: (source.y - foot.y) / heightLength };
  const a = { x: foot.x + u.x * size, y: foot.y + u.y * size };
  const b = { x: foot.x + v.x * size, y: foot.y + v.y * size };
  const control = { x: foot.x + (u.x + v.x) * size, y: foot.y + (u.y + v.y) * size };
  const dot = { x: foot.x + (u.x + v.x) * size * 0.52, y: foot.y + (u.y + v.y) * size * 0.52 };
  return { path: `M ${a.x} ${a.y} Q ${control.x} ${control.y} ${b.x} ${b.y}`, dot };
}

function externalLabelPoint(start: Point, end: Point, center: Point, distance = 28) {
  const middle = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const length = Math.hypot(middle.x - center.x, middle.y - center.y) || 1;
  return {
    x: middle.x + (middle.x - center.x) / length * distance,
    y: middle.y + (middle.y - center.y) / length * distance,
  };
}

function TriangleSvg({
  shape,
  rotation = 0,
  selectedSide,
  selectedPoints = [],
  showHeight = false,
  interactive = false,
  onSide,
  onPoint,
  baseLabel,
  heightLabel,
  otherSideLabels = [],
  centerLabel,
}: {
  shape: TriangleShape;
  rotation?: number;
  selectedSide?: SideId | null;
  selectedPoints?: string[];
  showHeight?: boolean;
  interactive?: boolean;
  onSide?: (side: SideId) => void;
  onPoint?: (point: string) => void;
  baseLabel?: string;
  heightLabel?: string;
  otherSideLabels?: string[];
  centerLabel?: string;
}) {
  const vertices = TRIANGLE_POINTS[shape].map((point) => ({ ...point, ...rotatePoint(point, rotation) }));
  const polygon = vertices.map((point) => `${point.x},${point.y}`).join(" ");
  const geometry = selectedSide ? sideGeometry(selectedSide, vertices) : null;
  const footId = selectedSide ? `H${selectedSide}` : "";
  const arc = geometry ? rightAngleArc(geometry.foot, geometry.start, geometry.source) : null;
  const candidatePoints = geometry ? [...vertices, { id: footId, ...geometry.foot }] : vertices;
  const selectedLine = selectedPoints.length === 2
    ? selectedPoints.map((id) => candidatePoints.find((point) => point.id === id)).filter((point): point is (typeof candidatePoints)[number] => Boolean(point))
    : [];
  const otherSideIds = SIDE_IDS.filter((sideId) => sideId !== selectedSide);

  return (
    <svg viewBox="0 0 680 400" className="mx-auto block h-auto w-full max-w-4xl" role="img" aria-label="Trójkąt z podstawą i wysokością">
      <defs>
        <pattern id={`triangle-grid-${shape}-${rotation}`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#cbd5e1" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="676" height="396" rx="28" fill={`url(#triangle-grid-${shape}-${rotation})`} stroke="#cbd5e1" strokeWidth="2" />
      <polygon points={polygon} fill="#dbeafe" fillOpacity="0.82" stroke="#1e3a8a" strokeWidth="4" strokeLinejoin="round" />
      {SIDE_IDS.map((sideId, index) => {
        const start = vertices[index];
        const end = vertices[(index + 1) % vertices.length];
        const active = selectedSide === sideId;
        return (
          <g key={sideId}>
            {active ? <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#e11d48" strokeWidth="9" strokeLinecap="round" /> : null}
            {interactive ? (
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="transparent"
                strokeWidth="28"
                role="button"
                tabIndex={0}
                aria-label={`Wybierz odcinek ${sideId} jako podstawę`}
                onClick={() => onSide?.(sideId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSide?.(sideId);
                }}
                className="cursor-pointer outline-none focus:stroke-cyan-400/50"
              />
            ) : null}
          </g>
        );
      })}
      {geometry && (showHeight || selectedLine.length === 2) && (geometry.footScale < 0 || geometry.footScale > 1) ? (
        <line
          x1={geometry.footScale < 0 ? geometry.foot.x : geometry.end.x}
          y1={geometry.footScale < 0 ? geometry.foot.y : geometry.end.y}
          x2={geometry.footScale < 0 ? geometry.start.x : geometry.foot.x}
          y2={geometry.footScale < 0 ? geometry.start.y : geometry.foot.y}
          stroke="#64748b"
          strokeWidth="3"
          strokeDasharray="9 8"
        />
      ) : null}
      {geometry && showHeight ? (
        <>
          <line x1={geometry.source.x} y1={geometry.source.y} x2={geometry.foot.x} y2={geometry.foot.y} stroke="#0f766e" strokeWidth="5" strokeDasharray="11 8" />
          {arc ? <path d={arc.path} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" /> : null}
          {arc ? <circle cx={arc.dot.x} cy={arc.dot.y} r="4.5" fill="#0f766e" /> : null}
        </>
      ) : null}
      {!showHeight && selectedLine.length === 2 ? <line x1={selectedLine[0].x} y1={selectedLine[0].y} x2={selectedLine[1].x} y2={selectedLine[1].y} stroke="#e11d48" strokeWidth="5" strokeDasharray="11 8" /> : null}
      {geometry && baseLabel ? (
        <text x={(geometry.start.x + geometry.end.x) / 2} y={(geometry.start.y + geometry.end.y) / 2 + 32} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-rose-800 text-[24px] font-black">{baseLabel}</text>
      ) : null}
      {geometry && heightLabel ? (
        <text x={(geometry.source.x + geometry.foot.x) / 2 + 25} y={(geometry.source.y + geometry.foot.y) / 2} paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-teal-800 text-[24px] font-black">{heightLabel}</text>
      ) : null}
      {otherSideIds.map((sideId, index) => {
        const label = otherSideLabels[index];
        if (!label) return null;
        const sideIndex = SIDE_IDS.indexOf(sideId);
        const point = externalLabelPoint(vertices[sideIndex], vertices[(sideIndex + 1) % vertices.length], CENTER);
        return <text key={sideId} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="middle" paintOrder="stroke" stroke="white" strokeWidth="8" className="fill-violet-800 text-[22px] font-black">{label}</text>;
      })}
      {centerLabel ? <text x={CENTER.x} y={CENTER.y + 8} textAnchor="middle" paintOrder="stroke" stroke="white" strokeWidth="10" className="fill-slate-950 text-[27px] font-black">{centerLabel}</text> : null}
      {candidatePoints.map((point) => {
        const selected = selectedPoints.includes(point.id);
        const isFoot = point.id.startsWith("H");
        return (
          <g
            key={point.id}
            role={interactive && selectedSide ? "button" : undefined}
            tabIndex={interactive && selectedSide ? 0 : undefined}
            aria-label={interactive && selectedSide ? `Wybierz punkt ${isFoot ? "na prostej" : point.id}` : undefined}
            onClick={() => interactive && selectedSide && onPoint?.(point.id)}
            onKeyDown={(event) => {
              if (interactive && selectedSide && (event.key === "Enter" || event.key === " ")) onPoint?.(point.id);
            }}
            className={interactive && selectedSide ? "cursor-pointer outline-none" : ""}
          >
            <circle cx={point.x} cy={point.y} r={interactive && selectedSide ? 13 : 7} fill={selected ? "#e11d48" : isFoot ? "#0f766e" : "#1e3a8a"} stroke="white" strokeWidth="4" />
            <text x={point.x + 13} y={point.y - 13} className="fill-slate-950 text-[21px] font-black">{isFoot ? "E" : point.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TriangleAreaFormula({ compact = false, testId }: { compact?: boolean; testId?: string }) {
  return (
    <span
      data-testid={testId}
      aria-label="P równa się iloczyn podstawy a i wysokości h podzielony przez 2"
      className={`inline-flex items-center gap-3 whitespace-nowrap font-black ${compact ? "text-base" : "text-5xl"}`}
    >
      <span>P =</span>
      <span className="inline-flex flex-col items-center leading-none">
        <span className="border-b-[3px] border-current px-2 pb-1">a · h</span>
        <span className="pt-1">2</span>
      </span>
    </span>
  );
}

function BaseHeightSeries({ readOnly, onResultChange }: Pick<TriangleAreaLabProps, "readOnly" | "onResultChange">) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [selectedSide, setSelectedSide] = useState<SideId | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const task = TRIANGLE_ORIENTATION_TASKS[taskIndex];

  useEffect(() => {
    if (!solved || taskIndex === TRIANGLE_ORIENTATION_TASKS.length - 1) return;
    const timeout = window.setTimeout(() => {
      setTaskIndex((current) => current + 1);
      setSelectedSide(null);
      setSelectedPoints([]);
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, solved, taskIndex]);

  const selectSide = (side: SideId) => {
    if (readOnly || solved) return;
    setSelectedSide(side);
    setSelectedPoints([]);
    setFeedback(null);
  };

  const selectPoint = (pointId: string) => {
    if (readOnly || solved || !selectedSide) return;
    setSelectedPoints((current) => current.includes(pointId) ? current.filter((id) => id !== pointId) : [...current.slice(-1), pointId]);
    setFeedback(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (!selectedSide || selectedPoints.length !== 2) {
      setFeedback("Najpierw wybierz podstawę, a potem dwa końce wysokości.");
      onResultChange?.(false, "niepełne wskazanie");
      return;
    }
    const expected = [oppositeVertexId(selectedSide), `H${selectedSide}`].sort().join("-");
    const answer = [...selectedPoints].sort().join("-");
    if (answer !== expected) {
      setFeedback("Ta wysokość nie jest prostopadła do wybranej podstawy. Spróbuj ponownie.");
      onResultChange?.(false, answer);
      return;
    }
    const last = taskIndex === TRIANGLE_ORIENTATION_TASKS.length - 1;
    setSolved(true);
    setFeedback(last ? "Dobrze! Umiesz dobrać wysokość do podstawy trójkąta." : "Dobrze! Wysokość jest prostopadła do wybranej podstawy. Za chwilę kolejny układ.");
    onResultChange?.(last ? true : null, `${selectedSide} i wysokość`);
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 5"
      heading="Podstawa i odpowiadająca jej wysokość"
      description="Wybierz dowolny bok jako podstawę. Następnie wskaż wierzchołek i punkt na prostej zawierającej podstawę, które połączy wysokość. W trójkącie rozwartokątnym punkt może leżeć poza figurą."
      questionNumber={taskIndex + 1}
      questionCount={TRIANGLE_ORIENTATION_TASKS.length}
      data-triangle-series="base-height"
    >
      <div className="space-y-4">
        <TriangleSvg shape={task.shape} rotation={task.rotation} selectedSide={selectedSide} selectedPoints={selectedPoints} showHeight={solved} interactive={!readOnly && !solved} onSide={selectSide} onPoint={selectPoint} />
        <div className="grid gap-3 rounded-2xl bg-indigo-50 p-4 text-center font-bold text-indigo-950 sm:grid-cols-2">
          <p>1. Podstawa: <strong>{selectedSide ?? "wybierz bok"}</strong></p>
          <p>2. Końce wysokości: <strong>{selectedPoints.length ? selectedPoints.map((id) => id.startsWith("H") ? "E" : id).join(" i ") : "wybierz dwa punkty"}</strong></p>
        </div>
        {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
        <button type="button" onClick={check} disabled={Boolean(readOnly) || solved} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-8 font-black text-white disabled:opacity-40">Zatwierdź wskazanie</button>
      </div>
    </LessonTaskFrame>
  );
}

function FormulaSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 6 · Temat 5" heading="Wzór na pole trójkąta" description="Pole trójkąta jest równe połowie iloczynu długości podstawy i wysokości prostopadłej do tej podstawy.">
      <div className="space-y-5">
        <TriangleSvg shape="acute" selectedSide="AB" showHeight baseLabel="a — podstawa" heightLabel="h — wysokość" />
        <div className="mx-auto max-w-2xl rounded-3xl bg-amber-100 p-6 text-center shadow-sm">
          <p className="text-lg font-bold text-amber-950">Pole to połowa iloczynu podstawy i odpowiadającej jej wysokości.</p>
          <p className="mt-3 text-indigo-950"><TriangleAreaFormula testId="triangle-area-formula" /></p>
        </div>
        <p className="rounded-2xl bg-teal-50 px-5 py-4 text-center font-bold text-teal-950">Wysokość musi tworzyć z wybraną podstawą kąt prosty. Pokazuje go łuk z kropką.</p>
      </div>
    </LessonTaskFrame>
  );
}

function CalculationDiagram({ task }: { task: TriangleAreaTask }) {
  return <TriangleSvg shape={task.shape} rotation={task.rotation} selectedSide="AB" showHeight baseLabel={task.baseLabel} heightLabel={task.heightLabel} otherSideLabels={task.otherSideLabels} centerLabel={task.centerLabel} />;
}

function CalculationSeries({ readOnly, onResultChange }: Pick<TriangleAreaLabProps, "readOnly" | "onResultChange">) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState(TRIANGLE_CALCULATION_TASKS[0].answerFields[0].id);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const task = TRIANGLE_CALCULATION_TASKS[taskIndex];

  useEffect(() => {
    if (!solved || taskIndex === TRIANGLE_CALCULATION_TASKS.length - 1) return;
    const timeout = window.setTimeout(() => {
      const nextTask = TRIANGLE_CALCULATION_TASKS[taskIndex + 1];
      setTaskIndex((current) => current + 1);
      setAnswers({});
      setActiveField(nextTask.answerFields[0].id);
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, solved, taskIndex]);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswers((current) => {
      const previous = current[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : key === "," ? (previous.includes(",") ? previous : `${previous},`) : `${previous}${key}`.slice(0, 8);
      return { ...current, [activeField]: next };
    });
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    const missing = task.answerFields.some((field) => parsePolishDecimal(answers[field.id] ?? "") === null);
    if (missing) {
      setFeedback("Uzupełnij wszystkie puste kratki, także zamianę jednostki.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const correct = task.answerFields.every((field) => {
      const value = parsePolishDecimal(answers[field.id] ?? "");
      return value !== null && Math.abs(value - field.answer) <= 0.0001;
    });
    if (!correct) {
      setFeedback(`Jeszcze nie. ${task.hint}`);
      onResultChange?.(false, task.answerFields.map((field) => answers[field.id] ?? "").join(", "));
      return;
    }
    const last = taskIndex === TRIANGLE_CALCULATION_TASKS.length - 1;
    setSolved(true);
    setFeedback(last ? `Dobrze! ${task.success} Cała seria jest ukończona.` : `Dobrze! ${task.success} Za chwilę następne zadanie.`);
    onResultChange?.(last ? true : null, task.answerFields.map((field) => `${field.answer} ${field.unit}`).join(", "));
  };

  return (
    <LessonTaskFrame eyebrow="Dział 6 · Temat 5" heading="Pole, podstawa i wysokość trójkąta" description="Odczytaj z rysunku podstawę i wysokość. Najpierw zapisz długości w tej samej jednostce, a potem oblicz szukaną wielkość." questionNumber={taskIndex + 1} questionCount={TRIANGLE_CALCULATION_TASKS.length} data-triangle-series="calculations">
      <div className="space-y-5">
        <CalculationDiagram task={task} />
        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
          {task.detail ? <p className="mt-2 font-bold text-amber-800">{task.detail}</p> : null}
        </section>
        <div className={`grid gap-3 ${task.answerFields.length > 1 ? "sm:grid-cols-2" : "mx-auto max-w-lg"}`}>
          {task.answerFields.map((field) => (
            <label key={field.id} className={`flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 bg-white p-4 font-black ${activeField === field.id ? "border-violet-700 ring-4 ring-violet-100" : "border-slate-200"}`}>
              <span className="text-sm text-slate-700 sm:text-base">{field.label}</span>
              <input aria-label={field.label} inputMode="none" readOnly value={answers[field.id] ?? ""} onFocus={() => setActiveField(field.id)} onClick={() => setActiveField(field.id)} className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700" data-triangle-answer={field.id} />
              <span className="text-xl text-slate-950">{field.unit}</span>
            </label>
          ))}
        </div>
        {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
        <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={Boolean(readOnly) || solved} allowSeparator label="Kalkulator do pola trójkąta" helperText="Dotknij wybranej kratki. Najpierw uzupełnij zamianę jednostki, jeżeli jest potrzebna, a potem wynik." />
      </div>
    </LessonTaskFrame>
  );
}

type SketchMode = "draw" | "base" | "height";
type SketchLabel = Point & { text: string; kind: "base" | "height" };

const SKETCH_WIDTH = 700;
const SKETCH_HEIGHT = 330;
const SKETCH_GRID_SIZE = 25;

function clampSketchCoordinate(value: number, maximum: number) {
  return Math.min(maximum - SKETCH_GRID_SIZE, Math.max(SKETCH_GRID_SIZE, value));
}

function snapToSketchGrid(point: Point): Point {
  return {
    x: clampSketchCoordinate(Math.round(point.x / SKETCH_GRID_SIZE) * SKETCH_GRID_SIZE, SKETCH_WIDTH),
    y: clampSketchCoordinate(Math.round(point.y / SKETCH_GRID_SIZE) * SKETCH_GRID_SIZE, SKETCH_HEIGHT),
  };
}

function sameSketchPoint(first: Point, second: Point) {
  return first.x === second.x && first.y === second.y;
}

function TriangleSketchPad({ task, readOnly }: { task: TriangleStoryTask; readOnly: boolean }) {
  const [mode, setMode] = useState<SketchMode>("draw");
  const [vertices, setVertices] = useState<Point[]>([]);
  const [closed, setClosed] = useState(false);
  const [labels, setLabels] = useState<SketchLabel[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const localPoint = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return snapToSketchGrid({
      x: (event.clientX - rect.left) * SKETCH_WIDTH / (rect.width || SKETCH_WIDTH),
      y: (event.clientY - rect.top) * SKETCH_HEIGHT / (rect.height || SKETCH_HEIGHT),
    });
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (readOnly) return;
    event.preventDefault();
    const point = localPoint(event);
    if (mode === "base" || mode === "height") {
      setLabels((current) => [...current, { ...point, text: mode === "base" ? task.baseStamp : task.heightStamp, kind: mode }]);
      setMode("draw");
      return;
    }
    if (closed) return;
    if (vertices.length === 3 && sameSketchPoint(point, vertices[0])) {
      setClosed(true);
      return;
    }
    if (vertices.length >= 3 || vertices.some((vertex) => sameSketchPoint(vertex, point))) return;
    setVertices((current) => [...current, point]);
  };

  const resetSketch = () => {
    setMode("draw");
    setVertices([]);
    setClosed(false);
    setLabels([]);
  };

  const undoPoint = () => {
    if (closed) {
      setClosed(false);
      return;
    }
    setVertices((current) => current.slice(0, -1));
  };

  const sketchInstruction = closed
    ? "Trójkąt jest zamknięty. Umieść na szkicu podpis podstawy i wysokości."
    : vertices.length === 0
      ? "Dotknij węzła siatki, aby postawić pierwszy punkt trójkąta."
      : vertices.length < 3
        ? "Dotknij jeszcze kolejnych miejsc. Każdy punkt zostanie przyciągnięty do siatki."
        : "Dotknij ponownie pierwszego, różowego punktu, aby zamknąć trójkąt.";
  const polygonPoints = vertices.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section className="space-y-3 rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-3" aria-label="Szkicownik do zadania">
      <div className="flex flex-wrap justify-center gap-2">
        <LessonTaskChoice type="button" selected={mode === "draw"} disabled={readOnly || closed} onClick={() => setMode("draw")}>Dodawaj punkty</LessonTaskChoice>
        <LessonTaskChoice type="button" selected={mode === "base"} disabled={readOnly || !closed} onClick={() => setMode("base")}>Wstaw „{task.baseStamp}”</LessonTaskChoice>
        <LessonTaskChoice type="button" selected={mode === "height"} disabled={readOnly || !closed} onClick={() => setMode("height")}>Wstaw „{task.heightStamp}”</LessonTaskChoice>
        <button type="button" disabled={readOnly || vertices.length === 0} onClick={undoPoint} className="min-h-10 rounded-xl bg-amber-100 px-4 text-sm font-black text-amber-950 disabled:opacity-40">Cofnij punkt</button>
        <button type="button" disabled={readOnly || (vertices.length === 0 && labels.length === 0)} onClick={resetSketch} className="min-h-10 rounded-xl bg-rose-100 px-4 text-sm font-black text-rose-950 disabled:opacity-40">Wyczyść szkic</button>
      </div>
      <p role="status" className={`rounded-2xl px-4 py-3 text-center text-sm font-black ${closed ? "bg-emerald-100 text-emerald-950" : "bg-white text-indigo-950"}`}>{sketchInstruction}</p>
      <svg ref={svgRef} viewBox="0 0 700 330" className="block aspect-[2.12/1] w-full touch-none cursor-crosshair rounded-2xl border-2 border-indigo-300 bg-white" onPointerDown={onPointerDown} role="img" aria-label="Kratownica do szkicu trójkąta. Dotknij, aby dodać punkt przyciągany do siatki" data-sketch-closed={closed}>
        <defs>
          <pattern id={`triangle-sketch-grid-${task.id}`} width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#dbeafe" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="700" height="330" fill={`url(#triangle-sketch-grid-${task.id})`} />
        {closed ? <polygon data-sketch-polygon="true" points={polygonPoints} fill="#bfdbfe" fillOpacity="0.72" stroke="#1e3a8a" strokeWidth="5" strokeLinejoin="round" /> : vertices.length >= 2 ? <polyline data-sketch-polyline="true" points={polygonPoints} fill="none" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {vertices.map((vertex, index) => <g key={`${vertex.x}-${vertex.y}`} data-sketch-vertex="true"><circle cx={vertex.x} cy={vertex.y} r={index === 0 && !closed ? 14 : 10} fill={index === 0 ? "#e11d48" : "#1e3a8a"} stroke="white" strokeWidth="4" /><text x={vertex.x} y={vertex.y + 5} textAnchor="middle" className="pointer-events-none fill-white text-[14px] font-black">{index + 1}</text></g>)}
        {labels.map((label, index) => <text key={`${label.kind}-${index}`} x={label.x} y={label.y} textAnchor="middle" className={`text-[24px] font-black ${label.kind === "base" ? "fill-rose-700" : "fill-teal-700"}`}>{label.text}</text>)}
      </svg>
    </section>
  );
}

function StorySeries({ readOnly, onResultChange }: Pick<TriangleAreaLabProps, "readOnly" | "onResultChange">) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const task = TRIANGLE_STORY_TASKS[taskIndex];

  useEffect(() => {
    if (!solved || taskIndex === TRIANGLE_STORY_TASKS.length - 1) return;
    const timeout = window.setTimeout(() => {
      setTaskIndex((current) => current + 1);
      setAnswer("");
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 750);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, solved, taskIndex]);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "," ? (current.includes(",") ? current : `${current},`) : `${current}${key}`.slice(0, 8));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    const value = parsePolishDecimal(answer);
    if (value === null) {
      setFeedback("Uzupełnij odpowiedź.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    if (Math.abs(value - task.answer) > 0.0001) {
      setFeedback("Jeszcze nie. Skorzystaj ze szkicu: pomnóż podstawę przez wysokość, a następnie podziel wynik przez 2.");
      onResultChange?.(false, answer);
      return;
    }
    const last = taskIndex === TRIANGLE_STORY_TASKS.length - 1;
    setSolved(true);
    setFeedback(last ? `${task.explanation} Cała seria jest ukończona.` : `${task.explanation} Za chwilę następne zadanie.`);
    onResultChange?.(last ? true : null, `${task.answer} ${task.answerUnit}`);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 6 · Temat 5" heading="Zadania tekstowe z polem trójkąta" description="Samodzielnie narysuj szkic, podpisz dane i zdecyduj, czy trzeba mnożyć, czy dzielić." questionNumber={taskIndex + 1} questionCount={TRIANGLE_STORY_TASKS.length} data-triangle-series="stories">
      <div className="space-y-5">
        <p className="rounded-3xl bg-amber-50 p-5 text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
        <TriangleSketchPad key={task.id} task={task} readOnly={Boolean(readOnly) || solved} />
        <label className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black">
          <span>{task.answerLabel}:</span>
          <input aria-label={task.answerLabel} inputMode="none" readOnly value={answer} className="h-14 w-32 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black text-slate-950" />
          <span className="text-xl">{task.answerUnit}</span>
        </label>
        {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
        <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={Boolean(readOnly) || solved} allowSeparator label="Kalkulator do zadania" helperText="Wpisz tylko wartość liczbową. Jednostka jest już podana." />
      </div>
    </LessonTaskFrame>
  );
}

export function TriangleAreaLab({ activity, readOnly = false, onResultChange }: TriangleAreaLabProps) {
  if (activity === "base-height") return <BaseHeightSeries readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "area-formula") return <FormulaSlide />;
  if (activity === "area-calculations") return <CalculationSeries readOnly={readOnly} onResultChange={onResultChange} />;
  return <StorySeries readOnly={readOnly} onResultChange={onResultChange} />;
}
