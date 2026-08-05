"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type CuboidVolumeActivity = "formulas" | "pictured-solids" | "dimensions-only" | "word-problems";

interface CuboidVolumeLabProps {
  activity: CuboidVolumeActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
  eyebrow?: string;
}

type SolidKind = "cuboid" | "cube";
type LengthUnit = "mm" | "cm" | "dm" | "m";

interface VolumeTask {
  id: string;
  kind: SolidKind;
  dimensions: [number, number, number];
  unit: LengthUnit;
  title: string;
  prompt?: string;
}

interface StoryTask extends VolumeTask {
  illustrationSrc: string;
  illustrationAlt: string;
  story: string;
}

const PICTURED_SOLIDS: VolumeTask[] = [
  { id: "pictured-1", kind: "cuboid", dimensions: [4, 3, 2], unit: "cm", title: "Pudełko" },
  { id: "pictured-2", kind: "cube", dimensions: [4, 4, 4], unit: "cm", title: "Sześcian" },
  { id: "pictured-3", kind: "cuboid", dimensions: [5, 2, 4], unit: "dm", title: "Bryła" },
  { id: "pictured-4", kind: "cuboid", dimensions: [6, 3, 3], unit: "cm", title: "Prostopadłościan" },
  { id: "pictured-5", kind: "cube", dimensions: [5, 5, 5], unit: "dm", title: "Kostka" },
  { id: "pictured-6", kind: "cuboid", dimensions: [8, 2, 5], unit: "cm", title: "Skrzynka" },
  { id: "pictured-7", kind: "cuboid", dimensions: [3, 4, 6], unit: "mm", title: "Mała bryła" },
  { id: "pictured-8", kind: "cube", dimensions: [6, 6, 6], unit: "cm", title: "Sześcian" },
  { id: "pictured-9", kind: "cuboid", dimensions: [7, 3, 2], unit: "m", title: "Magazynowa bryła" },
  { id: "pictured-10", kind: "cuboid", dimensions: [9, 3, 2], unit: "dm", title: "Pojemnik" },
];

const DIMENSIONS_ONLY: VolumeTask[] = [
  { id: "dimensions-1", kind: "cuboid", dimensions: [3, 4, 5], unit: "cm", title: "Wymiary prostopadłościanu" },
  { id: "dimensions-2", kind: "cube", dimensions: [7, 7, 7], unit: "cm", title: "Wymiar sześcianu" },
  { id: "dimensions-3", kind: "cuboid", dimensions: [2, 8, 5], unit: "dm", title: "Wymiary prostopadłościanu" },
  { id: "dimensions-4", kind: "cuboid", dimensions: [10, 4, 3], unit: "cm", title: "Wymiary prostopadłościanu" },
  { id: "dimensions-5", kind: "cube", dimensions: [3, 3, 3], unit: "m", title: "Wymiar sześcianu" },
  { id: "dimensions-6", kind: "cuboid", dimensions: [6, 6, 2], unit: "mm", title: "Wymiary prostopadłościanu" },
  { id: "dimensions-7", kind: "cuboid", dimensions: [9, 2, 4], unit: "dm", title: "Wymiary prostopadłościanu" },
  { id: "dimensions-8", kind: "cube", dimensions: [8, 8, 8], unit: "cm", title: "Wymiar sześcianu" },
  { id: "dimensions-9", kind: "cuboid", dimensions: [7, 5, 2], unit: "cm", title: "Wymiary prostopadłościanu" },
  { id: "dimensions-10", kind: "cuboid", dimensions: [4, 5, 6], unit: "m", title: "Wymiary prostopadłościanu" },
];

const STORY_TASKS: StoryTask[] = [
  {
    id: "story-1", kind: "cuboid", dimensions: [30, 12, 8], unit: "cm", title: "Pudełko na kredki",
    story: "Pudełko na kredki ma długość 30 cm, szerokość 12 cm i wysokość 8 cm. Oblicz jego objętość.",
    illustrationSrc: "/lessons/illustrations/volume/pencil-box.webp", illustrationAlt: "Prostokątne pudełko i kolorowe kredki",
  },
  {
    id: "story-2", kind: "cuboid", dimensions: [50, 30, 25], unit: "cm", title: "Puste akwarium",
    story: "Puste akwarium ma długość 50 cm, szerokość 30 cm i wysokość 25 cm. Oblicz objętość jego wnętrza.",
    illustrationSrc: "/lessons/illustrations/volume/aquarium.webp", illustrationAlt: "Puste akwarium w klasie",
  },
  {
    id: "story-3", kind: "cube", dimensions: [12, 12, 12], unit: "cm", title: "Kostka prezentowa",
    story: "Kostka prezentowa ma wszystkie krawędzie długości 12 cm. Oblicz jej objętość.",
    illustrationSrc: "/lessons/illustrations/volume/cube-gift.webp", illustrationAlt: "Sześcienne pudełko prezentowe",
  },
  {
    id: "story-4", kind: "cuboid", dimensions: [40, 25, 20], unit: "cm", title: "Skrzynka na jabłka",
    story: "Skrzynka na jabłka ma długość 40 cm, szerokość 25 cm i wysokość 20 cm. Oblicz jej objętość.",
    illustrationSrc: "/lessons/illustrations/volume/apple-crate.webp", illustrationAlt: "Prostokątna skrzynka pełna jabłek",
  },
];

function volumeOf([a, b, c]: [number, number, number]) {
  return a * b * c;
}

function CubicUnit({ unit }: { unit: LengthUnit }) {
  return <>{unit}<sup>3</sup></>;
}

function Formula({ kind }: { kind: SolidKind }) {
  return kind === "cuboid" ? <span>V = a · b · c</span> : <span>V = a · a · a = a<sup>3</sup></span>;
}

function SolidDiagram({ task, compact = false }: { task: VolumeTask; compact?: boolean }) {
  const [a, b, c] = task.dimensions;
  const isCube = task.kind === "cube";
  const unit = Math.min(38, 210 / a, 155 / c, 170 / (b * 0.56));
  const frontWidth = a * unit;
  const frontHeight = c * unit;
  const depthX = b * unit * 0.56;
  const depthY = -b * unit * 0.34;
  const x = (430 - frontWidth - depthX) / 2;
  const bottom = 225;
  const top = bottom - frontHeight;
  const labelA = isCube ? `a = ${a} ${task.unit}` : `a = ${a} ${task.unit}`;
  const labelB = isCube ? `a = ${a} ${task.unit}` : `b = ${b} ${task.unit}`;
  const labelC = isCube ? `a = ${a} ${task.unit}` : `c = ${c} ${task.unit}`;

  return (
    <svg viewBox="0 0 430 290" className={`mx-auto block h-auto w-full ${compact ? "max-w-xs" : "max-w-md"}`} role="img" aria-label={`${task.title}: ${labelA}, ${labelB}, ${labelC}`}>
      <defs>
        <linearGradient id={`front-${task.id}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#e0f2fe" /><stop offset="1" stopColor="#bae6fd" /></linearGradient>
        <linearGradient id={`top-${task.id}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#f0f9ff" /><stop offset="1" stopColor="#a5f3fc" /></linearGradient>
      </defs>
      <polygon points={`${x},${top} ${x + frontWidth},${top} ${x + frontWidth + depthX},${top + depthY} ${x + depthX},${top + depthY}`} fill={`url(#top-${task.id})`} stroke="#0369a1" strokeWidth="4" strokeLinejoin="round" />
      <polygon points={`${x + frontWidth},${top} ${x + frontWidth},${bottom} ${x + frontWidth + depthX},${bottom + depthY} ${x + frontWidth + depthX},${top + depthY}`} fill="#99e6f7" stroke="#0369a1" strokeWidth="4" strokeLinejoin="round" />
      <rect x={x} y={top} width={frontWidth} height={frontHeight} fill={`url(#front-${task.id})`} stroke="#0369a1" strokeWidth="4" rx="2" />
      <text x={x + frontWidth / 2} y={bottom + 30} textAnchor="middle" className="fill-slate-950 text-[17px] font-black">{labelA}</text>
      <text x={Math.max(44, x - 52)} y={top + frontHeight / 2} textAnchor="middle" className="fill-slate-950 text-[17px] font-black">{labelC}</text>
      <text x={x + frontWidth + depthX / 2 + 28} y={Math.max(20, top + depthY - 14)} textAnchor="middle" className="fill-slate-950 text-[17px] font-black">{labelB}</text>
    </svg>
  );
}

function Feedback({ text, solved }: { text: string | null; solved: boolean }) {
  return text ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{text}</p> : null;
}

function FormulasSlide({ eyebrow }: Pick<CuboidVolumeLabProps, "eyebrow">) {
  const cuboid: VolumeTask = { id: "formula-cuboid", kind: "cuboid", dimensions: [5, 3, 4], unit: "cm", title: "Prostopadłościan" };
  const cube: VolumeTask = { id: "formula-cube", kind: "cube", dimensions: [4, 4, 4], unit: "cm", title: "Sześcian" };

  return (
    <LessonTaskFrame eyebrow={eyebrow ?? "Dział 8 · Temat 2"} heading="Objętość prostopadłościanu i sześcianu" description="Objętość mówi, ile sześcianów jednostkowych mieści się w bryle. Dla prostopadłościanu mnożymy krawędzie a, b i c.">
      <div className="grid gap-5 lg:grid-cols-2">
        {[
          { task: cuboid, sentence: "Wybierz trzy prostopadłe krawędzie i oznacz je kolejno: a, b oraz c." },
          { task: cube, sentence: "W sześcianie wszystkie krawędzie mają tę samą długość a." },
        ].map(({ task, sentence }) => (
          <section key={task.id} className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4">
            <h3 className="text-center text-2xl font-black text-indigo-950">{task.title}</h3>
            <SolidDiagram task={task} compact />
            <p className="mt-2 text-center font-bold leading-relaxed text-slate-700">{sentence}</p>
            <p className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-center text-2xl font-black text-emerald-800"><Formula kind={task.kind} /></p>
          </section>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-amber-50 px-5 py-4 text-center font-black text-amber-950">Zapisz wynik w jednostkach sześciennych, np. cm<sup>3</sup> lub dm<sup>3</sup>.</p>
    </LessonTaskFrame>
  );
}

function OneAnswerSeries({ tasks, activity, readOnly, onResultChange, eyebrow }: { tasks: VolumeTask[]; activity: "pictured-solids" | "dimensions-only"; readOnly: boolean; onResultChange?: CuboidVolumeLabProps["onResultChange"]; eyebrow?: string }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;
  const answerVolume = volumeOf(task.dimensions);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const moveNext = () => {
    timer.current = window.setTimeout(() => {
      setIndex((current) => current + 1);
      setAnswer("");
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 750);
  };

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 6));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (!answer) {
      setFeedback("Wpisz obliczoną objętość.");
      return;
    }
    if (Number(answer) !== answerVolume) {
      setFeedback("Jeszcze nie. Pomnóż wszystkie trzy wymiary bryły.");
      onResultChange?.(false, answer);
      return;
    }
    const last = index === tasks.length - 1;
    setSolved(true);
    setFeedback(last ? `Brawo! ${answerVolume} ${task.unit}³. Cała seria jest ukończona.` : `Dobrze! V = ${answerVolume} ${task.unit}³. Za chwilę kolejne zadanie.`);
    onResultChange?.(last ? true : null, `${answerVolume} ${task.unit}³`);
    if (!last) moveNext();
  };

  const [a, b, c] = task.dimensions;
  const description = activity === "pictured-solids"
    ? "Odczytaj długości przy krawędziach bryły. Oblicz jej objętość."
    : "Wymiary są podane bez rysunku. Dla prostopadłościanu użyj wzoru V = a · b · c.";

  return (
    <LessonTaskFrame eyebrow={eyebrow ?? "Dział 8 · Temat 2"} heading={activity === "pictured-solids" ? "Oblicz objętość bryły" : "Oblicz objętość z podanych wymiarów"} description={description} questionNumber={index + 1} questionCount={tasks.length} data-cuboid-volume-series={activity}>
      <div className="space-y-5">
        {activity === "pictured-solids" ? <SolidDiagram task={task} /> : (
          <section className="rounded-3xl bg-indigo-50 p-6 text-center">
            <p className="text-sm font-black uppercase tracking-[.16em] text-indigo-700">{task.title}</p>
            {task.kind === "cube" ? <p className="mt-3 text-3xl font-black text-indigo-950">a = {a} {task.unit}</p> : <p className="mt-3 text-3xl font-black text-indigo-950">a = {a} {task.unit}, b = {b} {task.unit}, c = {c} {task.unit}</p>}
            <p className="mt-4 font-bold text-slate-700">Ułóż właściwy wzór i wykonaj mnożenie.</p>
          </section>
        )}
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-xl font-black text-slate-900">{task.kind === "cube" ? <Formula kind="cube" /> : <Formula kind="cuboid" />}</p>
        <label className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black">
          <span>V =</span>
          <input aria-label="Objętość bryły" inputMode="none" readOnly value={answer} className="h-14 w-32 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700" />
          <span className="text-xl"><CubicUnit unit={task.unit} /></span>
        </label>
        <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} label="Kalkulator do objętości" helperText="Wpisz wynik i zatwierdź. Kolejne zadanie otworzy się automatycznie." />
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

function StoryProblemSeries({ readOnly, onResultChange, eyebrow }: Pick<CuboidVolumeLabProps, "readOnly" | "onResultChange" | "eyebrow">) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState(["", "", "", ""]);
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = STORY_TASKS[index]!;
  const expected = [...task.dimensions, volumeOf(task.dimensions)].map(String);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setValues((current) => current.map((value, field) => field === active ? (key === "backspace" ? value.slice(0, -1) : `${value}${key}`.slice(0, 6)) : value));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (values.some((value) => value === "")) {
      setFeedback("Uzupełnij wszystkie pola w zapisie działania.");
      return;
    }
    if (values.some((value, field) => value !== expected[field])) {
      setFeedback("Sprawdź kolejno trzy wymiary i wynik mnożenia.");
      onResultChange?.(false, values.join(" · "));
      return;
    }
    const answer = volumeOf(task.dimensions);
    const last = index === STORY_TASKS.length - 1;
    setSolved(true);
    setFeedback(last ? `Brawo! Objętość wynosi ${answer} ${task.unit}³. Cała seria jest ukończona.` : `Dobrze! Objętość wynosi ${answer} ${task.unit}³. Za chwilę kolejne zadanie tekstowe.`);
    onResultChange?.(last ? true : null, `${answer} ${task.unit}³`);
    if (!last) {
      timer.current = window.setTimeout(() => {
        setIndex((current) => current + 1);
        setValues(["", "", "", ""]);
        setActive(0);
        setFeedback(null);
        setSolved(false);
        onResultChange?.(null);
      }, 800);
    }
  };

  const [a, b, c] = task.dimensions;
  const fieldLabels = task.kind === "cube" ? ["pierwsza krawędź", "druga krawędź", "trzecia krawędź", "objętość"] : ["długość", "szerokość", "wysokość", "objętość"];

  return (
    <LessonTaskFrame eyebrow={eyebrow ?? "Dział 8 · Temat 2"} heading="Zadania tekstowe — objętość" description="Przeczytaj dane, ułóż mnożenie i wpisz kolejne liczby. Na końcu zapisz objętość w jednostce sześciennej." questionNumber={index + 1} questionCount={STORY_TASKS.length} data-cuboid-volume-series="word-problems">
      <div className="space-y-5">
        <section className="grid items-center gap-5 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-amber-50 p-4 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
          <Image src={task.illustrationSrc} alt={task.illustrationAlt} width={1200} height={800} className="h-auto w-full rounded-2xl object-cover shadow-sm" />
          <div>
            <p className="text-sm font-black uppercase tracking-[.15em] text-sky-700">{task.title}</p>
            <p className="mt-3 text-xl font-black leading-relaxed text-slate-950">{task.story}</p>
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-center font-bold text-slate-700">{task.kind === "cube" ? "Dla sześcianu pomnóż długość krawędzi trzy razy." : "Dla prostopadłościanu pomnóż długość, szerokość i wysokość."}</p>
          </div>
        </section>
        <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-4">
          <p className="mb-3 text-center font-black text-indigo-950">Zapis rozwiązania</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-indigo-950">
            {values.slice(0, 3).map((value, field) => (
              <span key={field} className="flex items-center gap-2">
                <input aria-label={fieldLabels[field]!} inputMode="none" readOnly value={value} onClick={() => setActive(field)} className={`h-14 w-20 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${active === field ? "border-violet-700 ring-2 ring-violet-200" : "border-violet-300"}`} />
                {field < 2 ? <span aria-hidden>·</span> : <span aria-hidden>=</span>}
              </span>
            ))}
            <input aria-label={fieldLabels[3]!} inputMode="none" readOnly value={values[3]} onClick={() => setActive(3)} className={`h-14 w-28 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${active === 3 ? "border-violet-700 ring-2 ring-violet-200" : "border-violet-300"}`} />
            <span><CubicUnit unit={task.unit} /></span>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-indigo-800">Dane w zadaniu: {task.kind === "cube" ? `a = ${a} ${task.unit}` : `a = ${a} ${task.unit}, b = ${b} ${task.unit}, c = ${c} ${task.unit}`}</p>
        </section>
        <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} label="Kalkulator do objętości" helperText="Kliknij wybrane pole zapisu, wpisz liczbę i na końcu zatwierdź." />
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

export function cuboidVolumeActivityFromStageId(stageId: string): CuboidVolumeActivity {
  if (stageId.endsWith("-s1")) return "formulas";
  if (stageId.endsWith("-s2")) return "pictured-solids";
  if (stageId.endsWith("-s3")) return "dimensions-only";
  return "word-problems";
}

export function CuboidVolumeLab({ activity, readOnly = false, onResultChange, eyebrow }: CuboidVolumeLabProps) {
  if (activity === "formulas") return <FormulasSlide eyebrow={eyebrow} />;
  if (activity === "pictured-solids") return <OneAnswerSeries tasks={PICTURED_SOLIDS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} eyebrow={eyebrow} />;
  if (activity === "dimensions-only") return <OneAnswerSeries tasks={DIMENSIONS_ONLY} activity={activity} readOnly={readOnly} onResultChange={onResultChange} eyebrow={eyebrow} />;
  return <StoryProblemSeries readOnly={readOnly} onResultChange={onResultChange} eyebrow={eyebrow} />;
}
