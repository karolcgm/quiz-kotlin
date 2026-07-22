"use client";

import { useEffect, useRef, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type VolumeUnitsActivity = "definition" | "solid-builder" | "unit-cubes" | "capacity-match";

interface VolumeUnitsLabProps {
  activity: VolumeUnitsActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface CubeTask {
  id: string;
  dimensions: [number, number, number];
  answer: number;
}

interface CapacityTask {
  id: string;
  icon: string;
  object: string;
  answer: VolumeUnit;
}

type VolumeUnit = "mm³" | "cm³" | "dm³" | "m³" | "km³";

const VOLUME_UNITS: { symbol: VolumeUnit; name: string; side: string }[] = [
  { symbol: "mm³", name: "milimetr sześcienny", side: "1 mm" },
  { symbol: "cm³", name: "centymetr sześcienny", side: "1 cm" },
  { symbol: "dm³", name: "decymetr sześcienny", side: "1 dm" },
  { symbol: "m³", name: "metr sześcienny", side: "1 m" },
  { symbol: "km³", name: "kilometr sześcienny", side: "1 km" },
];

const CUBE_TASKS: CubeTask[] = [
  { id: "cubes-1", dimensions: [2, 3, 2], answer: 12 },
  { id: "cubes-2", dimensions: [4, 2, 3], answer: 24 },
  { id: "cubes-3", dimensions: [5, 3, 2], answer: 30 },
  { id: "cubes-4", dimensions: [4, 4, 2], answer: 32 },
  { id: "cubes-5", dimensions: [6, 2, 3], answer: 36 },
  { id: "cubes-6", dimensions: [3, 3, 5], answer: 45 },
  { id: "cubes-7", dimensions: [5, 4, 3], answer: 60 },
  { id: "cubes-8", dimensions: [7, 2, 4], answer: 56 },
  { id: "cubes-9", dimensions: [3, 5, 4], answer: 60 },
  { id: "cubes-10", dimensions: [10, 10, 1], answer: 100 },
];

const CAPACITY_TASKS: CapacityTask[] = [
  { id: "capacity-1", icon: "💧", object: "kropla wody", answer: "mm³" },
  { id: "capacity-2", icon: "🧊", object: "kostka lodu", answer: "cm³" },
  { id: "capacity-3", icon: "🛁", object: "wanna", answer: "dm³" },
  { id: "capacity-4", icon: "🏊", object: "basen", answer: "m³" },
  { id: "capacity-5", icon: "🌊", object: "woda w Morzu Bałtyckim", answer: "km³" },
];

function VolumePrism({ dimensions, label = "Bryła z sześcianów jednostkowych" }: { dimensions: [number, number, number]; label?: string }) {
  const [length, width, height] = dimensions;
  const unit = Math.min(28, 230 / (length + width * 0.55), 205 / (height + width * 0.4));
  const frontWidth = length * unit;
  const frontHeight = height * unit;
  const depthX = width * unit * 0.55;
  const depthY = -width * unit * 0.34;
  const x = (390 - frontWidth - depthX) / 2;
  const bottom = 255;
  const top = bottom - frontHeight;
  const frontVerticals = Array.from({ length: Math.max(0, length - 1) }, (_, index) => index + 1);
  const frontHorizontals = Array.from({ length: Math.max(0, height - 1) }, (_, index) => index + 1);
  const depthLines = Array.from({ length: Math.max(0, width - 1) }, (_, index) => index + 1);

  return (
    <svg viewBox="0 0 390 280" className="mx-auto block h-auto w-full max-w-lg" role="img" aria-label={`${label}: ${length} na ${width} na ${height} klocków`}>
      <polygon points={`${x},${top} ${x + frontWidth},${top} ${x + frontWidth + depthX},${top + depthY} ${x + depthX},${top + depthY}`} fill="#bae6fd" stroke="#0369a1" strokeWidth="3" strokeLinejoin="round" />
      <polygon points={`${x + frontWidth},${top} ${x + frontWidth},${bottom} ${x + frontWidth + depthX},${bottom + depthY} ${x + frontWidth + depthX},${top + depthY}`} fill="#a5f3fc" stroke="#0369a1" strokeWidth="3" strokeLinejoin="round" />
      <rect x={x} y={top} width={frontWidth} height={frontHeight} fill="#dbeafe" stroke="#0369a1" strokeWidth="3" rx="2" />
      {frontVerticals.map((index) => <line key={`front-v-${index}`} x1={x + index * unit} y1={top} x2={x + index * unit} y2={bottom} stroke="#38bdf8" strokeWidth="1.3" />)}
      {frontHorizontals.map((index) => <line key={`front-h-${index}`} x1={x} y1={top + index * unit} x2={x + frontWidth} y2={top + index * unit} stroke="#38bdf8" strokeWidth="1.3" />)}
      {frontVerticals.map((index) => <line key={`top-l-${index}`} x1={x + index * unit} y1={top} x2={x + index * unit + depthX} y2={top + depthY} stroke="#38bdf8" strokeWidth="1.3" />)}
      {depthLines.map((index) => {
        const ratio = index / width;
        return <line key={`top-d-${index}`} x1={x + depthX * ratio} y1={top + depthY * ratio} x2={x + frontWidth + depthX * ratio} y2={top + depthY * ratio} stroke="#38bdf8" strokeWidth="1.3" />;
      })}
      {depthLines.map((index) => {
        const ratio = index / width;
        return <line key={`side-v-${index}`} x1={x + frontWidth + depthX * ratio} y1={top + depthY * ratio} x2={x + frontWidth + depthX * ratio} y2={bottom + depthY * ratio} stroke="#38bdf8" strokeWidth="1.3" />;
      })}
      {frontHorizontals.map((index) => <line key={`side-h-${index}`} x1={x + frontWidth} y1={top + index * unit} x2={x + frontWidth + depthX} y2={top + index * unit + depthY} stroke="#38bdf8" strokeWidth="1.3" />)}
      <text x={x + frontWidth / 2} y={bottom + 18} textAnchor="middle" className="fill-slate-950 text-[17px] font-black">{length}</text>
      <text x={x - 14} y={top + frontHeight / 2} textAnchor="middle" className="fill-slate-950 text-[17px] font-black">{height}</text>
      <text x={x + frontWidth + depthX / 2 + 18} y={top + depthY / 2 + 8} textAnchor="middle" className="fill-slate-950 text-[17px] font-black">{width}</text>
    </svg>
  );
}

function UnitCube({ unit }: { unit: typeof VOLUME_UNITS[number] }) {
  return (
    <div className="rounded-2xl border-2 border-cyan-200 bg-white p-3 text-center shadow-sm">
      <svg viewBox="0 0 110 75" className="mx-auto h-16 w-24" role="img" aria-label={`Sześcian o objętości 1 ${unit.symbol}`}>
        <polygon points="26,22 62,22 83,10 47,10" fill="#bae6fd" stroke="#0369a1" strokeWidth="3" />
        <polygon points="62,22 62,59 83,47 83,10" fill="#a5f3fc" stroke="#0369a1" strokeWidth="3" />
        <rect x="26" y="22" width="36" height="37" fill="#dbeafe" stroke="#0369a1" strokeWidth="3" />
      </svg>
      <strong className="mt-1 block text-2xl font-black text-indigo-950">1 {unit.symbol}</strong>
      <span className="mt-1 block text-xs font-bold text-slate-600">{unit.name}</span>
      <span className="mt-1 block text-xs font-bold text-cyan-800">bok: {unit.side}</span>
    </div>
  );
}

function Feedback({ text, solved }: { text: string | null; solved: boolean }) {
  return text ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{text}</p> : null;
}

function DefinitionSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 8 · Temat 1" heading="Co to jest objętość?" description="Objętość mówi, ile mieści się w bryle — ile sześcianów jednostkowych można ułożyć w jej wnętrzu.">
      <div className="space-y-6">
        <section className="grid items-center gap-5 rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-indigo-50 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,390px)]">
          <div>
            <h3 className="text-2xl font-black text-indigo-950">Bryła ma wnętrze</h3>
            <p className="mt-3 text-lg font-bold leading-relaxed text-slate-800">Sprawdzamy, ile jednakowych małych sześcianów zmieści się w środku. To właśnie jest jej objętość.</p>
            <p className="mt-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Jeden sześcian jednostkowy ma objętość 1 wybranej jednostki sześciennej.</p>
          </div>
          <VolumePrism dimensions={[4, 3, 3]} label="Bryła z 36 sześcianów jednostkowych" />
        </section>
        <section aria-label="Podstawowe jednostki objętości" className="rounded-3xl bg-slate-50 p-5">
          <h3 className="text-center text-xl font-black text-slate-950">Podstawowe jednostki objętości</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {VOLUME_UNITS.map((unit) => <UnitCube key={unit.symbol} unit={unit} />)}
          </div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function SolidBuilder({ readOnly }: { readOnly: boolean }) {
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const volume = length * width * height;
  const layerSize = length * width;
  const isCube = length === width && width === height;

  return (
    <LessonTaskFrame eyebrow="Dział 8 · Temat 1" heading="Bryła z sześcianów jednostkowych" description="Zmieniaj długość, szerokość i wysokość. Każda mała komórka oznacza jeden sześcian o objętości 1 cm³.">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(250px,360px)_minmax(0,1fr)]">
        <section className="space-y-5 rounded-3xl bg-indigo-50 p-5">
          {[
            { label: "Długość", value: length, setValue: setLength },
            { label: "Szerokość", value: width, setValue: setWidth },
            { label: "Wysokość", value: height, setValue: setHeight },
          ].map(({ label, value, setValue }) => (
            <label key={label} className="block font-black text-indigo-950">
              {label}: <span className="text-2xl">{value}</span> cm
              <input aria-label={`${label} bryły`} type="range" min="1" max="10" value={value} disabled={readOnly} onChange={(event) => setValue(Number(event.target.value))} className="mt-2 w-full accent-indigo-700" />
            </label>
          ))}
          <div className="rounded-2xl bg-white p-4 text-center shadow-sm" aria-live="polite">
            <p className="text-sm font-black uppercase tracking-wide text-slate-500">{isCube ? "Sześcian" : "Prostopadłościan"}</p>
            <p className="mt-1 text-2xl font-black text-indigo-950">V = {length} · {width} · {height} = {volume} cm³</p>
            <p className="mt-1 font-bold text-slate-700">W jednej warstwie jest {layerSize} klocków, a warstw jest {height}.</p>
          </div>
        </section>
        <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-3">
          <VolumePrism dimensions={[length, width, height]} label="Zmieniana bryła z sześcianów jednostkowych" />
          <p className="text-center font-bold text-slate-700">Wymiary odczytujesz przy trzech krawędziach bryły.</p>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function UnitCubeSeries({ readOnly, onResultChange }: Pick<VolumeUnitsLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = CUBE_TASKS[index]!;
  const [length, width, height] = task.dimensions;

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 4));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    if (answer === "") {
      setFeedback("Wpisz liczbę klocków z klawiatury.");
      return;
    }
    if (Number(answer) !== task.answer) {
      setFeedback("Jeszcze nie. Policz klocki w jednej warstwie, a potem tyle samo warstw.");
      onResultChange?.(false, answer);
      return;
    }
    const last = index === CUBE_TASKS.length - 1;
    setSolved(true);
    setFeedback(last ? `Brawo! Bryła ma ${task.answer} cm³. Cała seria jest ukończona.` : `Dobrze! ${task.answer} klocków po 1 cm³ daje objętość ${task.answer} cm³. Za chwilę kolejne zadanie.`);
    onResultChange?.(last ? true : null, `${task.answer} cm³`);
    if (!last) {
      timer.current = window.setTimeout(() => {
        setIndex((current) => current + 1);
        setAnswer("");
        setFeedback(null);
        setSolved(false);
        onResultChange?.(null);
      }, 750);
    }
  };

  return (
    <LessonTaskFrame eyebrow="Dział 8 · Temat 1" heading="Ile sześcianów jednostkowych?" description="Każdy klocek ma objętość 1 cm³. Oblicz, ile takich klocków tworzy bryłę." questionNumber={index + 1} questionCount={CUBE_TASKS.length} data-volume-series="unit-cubes">
      <div className="space-y-5">
        <VolumePrism dimensions={task.dimensions} label={`Bryła o wymiarach ${length} na ${width} na ${height}`} />
        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-xl font-black leading-relaxed text-amber-950">Bryła ma {length} klocków wzdłuż, {width} wszerz i {height} warstwy.</p>
          <p className="mt-2 font-bold text-amber-800">Ile sześcianów o objętości 1 cm³ mieści się w całej bryle?</p>
        </section>
        <label className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4 font-black">
          <span>Objętość bryły:</span>
          <input aria-label="Objętość bryły z klocków" inputMode="none" readOnly value={answer} onClick={() => undefined} className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700" />
          <span className="text-xl">cm³</span>
        </label>
        <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} label="Kalkulator do objętości" helperText="Wpisz liczbę sześcianów jednostkowych i zatwierdź." />
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

function CapacitySeries({ readOnly, onResultChange }: Pick<VolumeUnitsLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<VolumeUnit | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = CAPACITY_TASKS[index]!;

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const choose = (unit: VolumeUnit) => {
    if (readOnly || solved) return;
    setSelected(unit);
    if (unit !== task.answer) {
      setFeedback("Jeszcze nie. Pomyśl, czy opisujesz bardzo małą, codzienną czy ogromną objętość.");
      onResultChange?.(false, unit);
      return;
    }
    const last = index === CAPACITY_TASKS.length - 1;
    setSolved(true);
    setFeedback(last ? `Brawo! ${task.object} najrozsądniej opisujemy w ${unit}. Cała seria jest ukończona.` : `Dobrze! Dla ${task.object} pasuje jednostka ${unit}. Za chwilę kolejne zadanie.`);
    onResultChange?.(last ? true : null, unit);
    if (!last) {
      timer.current = window.setTimeout(() => {
        setIndex((current) => current + 1);
        setSelected(null);
        setFeedback(null);
        setSolved(false);
        onResultChange?.(null);
      }, 750);
    }
  };

  return (
    <LessonTaskFrame eyebrow="Dział 8 · Temat 1" heading="Dopasuj jednostkę objętości" description="Wybierz najbardziej rozsądną jednostkę do opisu objętości. Nie szukamy dokładnej liczby, tylko odpowiedniej skali." questionNumber={index + 1} questionCount={CAPACITY_TASKS.length} data-volume-series="capacity">
      <div className="space-y-5">
        <section className="rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-6 text-center">
          <p aria-hidden className="text-7xl">{task.icon}</p>
          <p className="mt-4 text-2xl font-black text-slate-950">Jaka jednostka najlepiej pasuje do objętości: <span className="text-indigo-700">{task.object}</span>?</p>
        </section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {VOLUME_UNITS.map((unit) => <LessonTaskChoice key={unit.symbol} selected={selected === unit.symbol} disabled={readOnly || solved} onClick={() => choose(unit.symbol)} className="min-h-16 text-2xl">{unit.symbol}</LessonTaskChoice>)}
        </div>
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

export function volumeUnitsActivityFromStageId(stageId: string): VolumeUnitsActivity {
  if (stageId.endsWith("-s1")) return "definition";
  if (stageId.endsWith("-s2")) return "solid-builder";
  if (stageId.endsWith("-s3")) return "unit-cubes";
  return "capacity-match";
}

export function VolumeUnitsLab({ activity, readOnly = false, onResultChange }: VolumeUnitsLabProps) {
  if (activity === "definition") return <DefinitionSlide />;
  if (activity === "solid-builder") return <SolidBuilder readOnly={readOnly} />;
  if (activity === "unit-cubes") return <UnitCubeSeries readOnly={readOnly} onResultChange={onResultChange} />;
  return <CapacitySeries readOnly={readOnly} onResultChange={onResultChange} />;
}
