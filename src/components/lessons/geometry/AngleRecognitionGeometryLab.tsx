"use client";

import { useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import {
  COMPLETE_ANGLE_LABELS,
  classifyCompleteAngle,
  getAngleRecognitionActivity,
  isConvexAngle,
  type CompleteAngleType,
} from "@/lib/math/geometry/angleRecognition";
import type { GeometryLabMode } from "@/types/geometry";

const TYPE_COLORS: Record<CompleteAngleType, string> = {
  zero: "#64748b",
  acute: "#2563eb",
  right: "#dc2626",
  obtuse: "#16a34a",
  straight: "#7c3aed",
  reflex: "#d97706",
  full: "#db2777",
};

const NOTATION_TASKS = [
  { points: ["A", "B", "C"] as const, correct: "∠ABC", options: ["∠ABC", "∠BAC", "∠ACB"] },
  { points: ["D", "E", "F"] as const, correct: "∠DEF", options: ["∠DFE", "∠DEF", "∠EDF"] },
  { points: ["K", "L", "M"] as const, correct: "∠KLM", options: ["∠LMK", "∠MKL", "∠KLM"] },
] as const;

const SCATTER_MEASURES = [136, 0, 225, 72, 360, 91, 180, 35, 283, 90, 16, 157, 216, 88, 117, 43, 321, 99, 58, 172, 1, 179, 181, 359, 64] as const;
const PICTURE_SCATTER_MEASURES = [235, 45, 180, 112, 360, 30, 90, 275, 140, 65, 210, 155, 15, 320, 95, 80, 250, 125, 0, 179] as const;
const SCATTER_ROUNDS: CompleteAngleType[] = ["acute", "right", "obtuse", "straight", "reflex", "full", "zero"];
const SCATTER_RULES: Record<CompleteAngleType, string> = {
  zero: "α = 0°",
  acute: "0° < α < 90°",
  right: "α = 90°",
  obtuse: "90° < α < 180°",
  straight: "α = 180°",
  reflex: "180° < α < 360°",
  full: "α = 360°",
};

const FIGURE_ANGLE_TASKS = [
  { notation: "∠ABC", spoken: "kąt ABC", correct: "obtuse" as const },
  { notation: "∠BCD", spoken: "kąt BCD", correct: "obtuse" as const },
  { notation: "∠BAD", spoken: "kąt BAD", correct: "acute" as const },
] as const;

const POINT_CLOUD_TASKS = [
  {
    notation: "∠ABC", first: "A", vertex: "B", last: "C",
    points: [
      { label: "A", x: 510, y: 92 }, { label: "B", x: 285, y: 275 }, { label: "C", x: 92, y: 92 },
      { label: "D", x: 500, y: 320 }, { label: "E", x: 145, y: 215 }, { label: "F", x: 330, y: 52 },
    ],
  },
  {
    notation: "∠DEF", first: "D", vertex: "E", last: "F",
    points: [
      { label: "D", x: 115, y: 305 }, { label: "E", x: 315, y: 240 }, { label: "F", x: 485, y: 72 },
      { label: "G", x: 115, y: 95 }, { label: "H", x: 520, y: 300 }, { label: "I", x: 300, y: 52 },
    ],
  },
  {
    notation: "∠KLM", first: "K", vertex: "L", last: "M",
    points: [
      { label: "K", x: 100, y: 80 }, { label: "L", x: 235, y: 270 }, { label: "M", x: 510, y: 245 },
      { label: "N", x: 490, y: 75 }, { label: "P", x: 340, y: 65 }, { label: "R", x: 90, y: 315 },
    ],
  },
] as const;

const LINE_NETWORK_TASKS = [
  { notation: "∠BGF", spoken: "kąt BGF", correct: "obtuse" as const },
  { notation: "∠DFE", spoken: "kąt DFE", correct: "right" as const },
  { notation: "∠CAG", spoken: "kąt CAG", correct: "acute" as const },
  { notation: "∠BCD", spoken: "kąt BCD", correct: "obtuse" as const },
  { notation: "∠GFD", spoken: "kąt GFD", correct: "right" as const },
  { notation: "∠AGB", spoken: "kąt AGB", correct: "acute" as const },
] as const;

type LineNetworkKind = "acute" | "right" | "obtuse";

function lineNetworkKindLabel(kind: LineNetworkKind) {
  return kind === "acute" ? "ostry" : kind === "right" ? "prosty" : "rozwarty";
}

function AngleLineNetworkBoard({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [answers, setAnswers] = useState<Record<string, LineNetworkKind>>({});
  const [feedback, setFeedback] = useState("Odszukaj wierzchołek po środkowej literze i rozpoznaj rozwartość kąta.");
  const choose = (notation: string, answer: LineNetworkKind) => {
    const task = LINE_NETWORK_TASKS.find((candidate) => candidate.notation === notation)!;
    if (answer !== task.correct) {
      setFeedback(`Jeszcze nie. W ${task.spoken} wierzchołkiem jest środkowa litera ${notation[2]}. Odszukaj oba ramiona na rysunku.`);
      onResultChange?.(false, `${notation}: ${lineNetworkKindLabel(answer)}`);
      return;
    }
    const next = { ...answers, [notation]: answer };
    setAnswers(next);
    const complete = LINE_NETWORK_TASKS.every((candidate) => next[candidate.notation] === candidate.correct);
    setFeedback(complete ? "Dobrze. W układzie znaleziono po dwa kąty ostre, proste i rozwarte." : `Dobrze: ${task.spoken} jest ${lineNetworkKindLabel(answer)}.`);
    onResultChange?.(complete ? true : null, `${notation}: ${lineNetworkKindLabel(answer)}`);
  };

  const points = [
    { label: "A", x: 70, y: 260, dx: -25, dy: 30 }, { label: "B", x: 175, y: 170, dx: -28, dy: -12 },
    { label: "C", x: 280, y: 80, dx: -5, dy: -24 }, { label: "D", x: 410, y: 164, dx: 15, dy: -12 },
    { label: "E", x: 560, y: 260, dx: 17, dy: 10 }, { label: "F", x: 410, y: 260, dx: 15, dy: 28 },
    { label: "G", x: 240, y: 260, dx: -5, dy: 34 }, { label: "H", x: 300, y: 343, dx: 12, dy: 27 },
    { label: "I", x: 410, y: 345, dx: 16, dy: 23 },
  ] as const;

  return <section className="grid gap-4" data-angle-line-network>
    <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-cyan-900 p-5 text-white shadow-xl">
      <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Punkty na przecinających się prostych</p>
      <h3 className="mt-2 text-2xl font-black sm:text-3xl">Znajdź po dwa kąty ostre, proste i rozwarte</h3>
      <p className="mt-2 font-bold text-indigo-100">Każdy kąt odczytaj z trzech liter. Środkowa litera zawsze wskazuje wierzchołek.</p>
    </header>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_480px]">
      <div className="overflow-hidden rounded-[2rem] border-4 border-indigo-200 bg-gradient-to-br from-white via-cyan-50 to-amber-50 p-2 shadow-inner">
        <svg viewBox="0 0 630 400" className="min-h-[400px] w-full" role="img" aria-label="Układ przecinających się prostych z punktami od A do I">
          <rect width="630" height="400" rx="28" fill="transparent" />
          <line x1="35" y1="260" x2="600" y2="260" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
          <line x1="45" y1="282" x2="320" y2="45" stroke="#2563eb" strokeWidth="7" strokeLinecap="round" />
          <line x1="250" y1="61" x2="590" y2="280" stroke="#d97706" strokeWidth="7" strokeLinecap="round" />
          <line x1="145" y1="128" x2="323" y2="375" stroke="#7c3aed" strokeWidth="7" strokeLinecap="round" />
          <line x1="410" y1="38" x2="410" y2="375" stroke="#059669" strokeWidth="7" strokeLinecap="round" />
          {points.map((point) => <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="9" fill="#0f172a" stroke="#fff" strokeWidth="3" />
            <text x={point.x + point.dx} y={point.y + point.dy} fontSize="27" fontWeight="900" fill="#0f172a">{point.label}</text>
          </g>)}
          <path d="M385 260v-25h25" fill="none" stroke="#dc2626" strokeWidth="5" />
        </svg>
      </div>
      <aside className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2" aria-label="Klasyfikacja nazwanych kątów">
        {LINE_NETWORK_TASKS.map((task) => {
          const answer = answers[task.notation];
          const correct = answer === task.correct;
          return <div key={task.notation} className={`rounded-2xl border-2 p-3 ${correct ? "border-emerald-400 bg-emerald-50" : "border-indigo-100 bg-white"}`}>
            <p className="text-xl font-black text-slate-950">{task.notation}</p>
            <p className="text-sm font-bold text-slate-600">Wierzchołek: {task.notation[2]}</p>
            <div className="mt-2 grid grid-cols-3 gap-1" role="group" aria-label={`${task.spoken} jest`}>
              {(["acute", "right", "obtuse"] as const).map((kind) => <button key={kind} type="button" disabled={readOnly || correct} aria-pressed={answer === kind} onClick={() => choose(task.notation, kind)} className={`min-h-11 rounded-lg px-1 text-xs font-black sm:text-sm ${answer === kind ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-950"}`}>{lineNetworkKindLabel(kind)}</button>)}
            </div>
          </div>;
        })}
      </aside>
    </div>
    <p role="status" className="rounded-2xl bg-indigo-50 p-4 font-black text-indigo-950">{feedback}</p>
  </section>;
}

type PointCloudProgress = { vertexSelected: boolean; endpoints: string[] };

function PointCloudAngleBoard({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [progress, setProgress] = useState<Record<number, PointCloudProgress>>({});
  const [feedback, setFeedback] = useState("Najpierw wskaż środkową literę — to wierzchołek kąta.");
  const task = POINT_CLOUD_TASKS[taskIndex]!;
  const current = progress[taskIndex] ?? { vertexSelected: false, endpoints: [] };
  const vertexPoint = task.points.find((point) => point.label === task.vertex)!;

  const selectTask = (index: number) => {
    setTaskIndex(index);
    const nextTask = POINT_CLOUD_TASKS[index]!;
    const nextProgress = progress[index];
    setFeedback(nextProgress?.endpoints.length === 2
      ? `Narysowano ${nextTask.notation}: ramiona ${nextTask.vertex}${nextTask.first} i ${nextTask.vertex}${nextTask.last}.`
      : nextProgress?.vertexSelected
        ? `Wierzchołek ${nextTask.vertex} jest zaznaczony. Teraz wskaż punkty ${nextTask.first} i ${nextTask.last}.`
        : "Najpierw wskaż środkową literę — to wierzchołek kąta.");
  };

  const selectPoint = (label: string) => {
    if (readOnly || current.endpoints.length === 2) return;
    if (!current.vertexSelected) {
      if (label !== task.vertex) {
        setFeedback(`Nie ten punkt. W zapisie ${task.notation} środkowa litera ${task.vertex} oznacza wierzchołek.`);
        onResultChange?.(false, label);
        return;
      }
      const next = { ...progress, [taskIndex]: { vertexSelected: true, endpoints: [] } };
      setProgress(next);
      setFeedback(`Dobrze. Punkt ${task.vertex} jest wierzchołkiem. Teraz wskaż punkty ${task.first} i ${task.last}.`);
      onResultChange?.(null, label);
      return;
    }
    if (label !== task.first && label !== task.last) {
      setFeedback(`Punkt ${label} nie należy do nazwy ${task.notation}. Wskaż punkty ${task.first} i ${task.last}.`);
      onResultChange?.(false, label);
      return;
    }
    if (current.endpoints.includes(label)) {
      setFeedback(`Punkt ${label} jest już zaznaczony. Wskaż drugie ramię kąta.`);
      return;
    }
    const endpoints = [...current.endpoints, label];
    const next = { ...progress, [taskIndex]: { vertexSelected: true, endpoints } };
    setProgress(next);
    if (endpoints.length < 2) {
      const missing = label === task.first ? task.last : task.first;
      setFeedback(`Pierwsze ramię gotowe. Wskaż jeszcze punkt ${missing}.`);
      onResultChange?.(null, `${task.vertex}${label}`);
      return;
    }
    const allComplete = POINT_CLOUD_TASKS.every((_, index) => (next[index]?.endpoints.length ?? 0) === 2);
    setFeedback(`Narysowano ${task.notation}: ramiona ${task.vertex}${task.first} i ${task.vertex}${task.last}.`);
    onResultChange?.(allComplete ? true : null, task.notation);
  };

  return <section className="grid gap-4" data-angle-point-cloud>
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Zadania z rysowania kątów">
      {POINT_CLOUD_TASKS.map((item, index) => {
        const complete = (progress[index]?.endpoints.length ?? 0) === 2;
        return <button key={item.notation} type="button" role="tab" aria-selected={taskIndex === index} onClick={() => selectTask(index)} className={`min-h-12 rounded-xl px-4 font-black ${taskIndex === index ? "bg-indigo-700 text-white" : complete ? "bg-emerald-200 text-emerald-950" : "bg-indigo-100 text-indigo-950"}`}>{complete ? "✓ " : ""}Zadanie {index + 1}</button>;
      })}
    </div>
    <header className="rounded-3xl bg-gradient-to-r from-indigo-950 via-violet-900 to-fuchsia-900 p-5 text-white shadow-xl">
      <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Rozsypane punkty</p>
      <h3 className="mt-2 text-3xl font-black">Narysuj {task.notation}</h3>
      <p className="mt-2 font-bold text-indigo-100">Najpierw znajdź wierzchołek, czyli środkową literę. Następnie wskaż dwa punkty leżące na ramionach.</p>
    </header>
    <div className="overflow-hidden rounded-[2rem] border-4 border-indigo-200 bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-2 shadow-inner">
      <svg viewBox="0 0 620 380" className="min-h-[360px] w-full" role="img" aria-label={`Rozsypane punkty do narysowania ${task.notation}`}>
        <defs><marker id="angle-ray-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#4338ca" /></marker></defs>
        <rect width="620" height="380" rx="28" fill="transparent" />
        {current.endpoints.map((label) => {
          const point = task.points.find((candidate) => candidate.label === label)!;
          return <line key={label} data-angle-ray x1={vertexPoint.x} y1={vertexPoint.y} x2={point.x} y2={point.y} stroke="#4338ca" strokeWidth="10" strokeLinecap="round" markerEnd="url(#angle-ray-arrow)" />;
        })}
        {task.points.map((point) => {
          const selected = (point.label === task.vertex && current.vertexSelected) || current.endpoints.includes(point.label);
          return <g key={point.label} role="button" tabIndex={readOnly ? -1 : 0} aria-label={`Punkt ${point.label}`} aria-pressed={selected} onClick={() => selectPoint(point.label)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectPoint(point.label); } }} className={readOnly ? "cursor-default" : "cursor-pointer"}>
            <circle cx={point.x} cy={point.y} r="28" fill={selected ? "#fbbf24" : "#ffffff"} stroke={selected ? "#92400e" : "#4338ca"} strokeWidth="6" />
            <text x={point.x} y={point.y + 10} textAnchor="middle" fontSize="30" fontWeight="900" fill="#0f172a">{point.label}</text>
          </g>;
        })}
      </svg>
    </div>
    <div className="grid gap-2 sm:grid-cols-3">
      <p className={`rounded-2xl p-3 font-black ${current.vertexSelected ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>1. Wierzchołek: {current.vertexSelected ? task.vertex : "?"}</p>
      <p className={`rounded-2xl p-3 font-black ${current.endpoints.includes(task.first) ? "bg-emerald-100 text-emerald-950" : "bg-slate-100 text-slate-700"}`}>2. Ramię: {current.endpoints.includes(task.first) ? `${task.vertex}${task.first}` : "?"}</p>
      <p className={`rounded-2xl p-3 font-black ${current.endpoints.includes(task.last) ? "bg-emerald-100 text-emerald-950" : "bg-slate-100 text-slate-700"}`}>3. Ramię: {current.endpoints.includes(task.last) ? `${task.vertex}${task.last}` : "?"}</p>
    </div>
    <p role="status" className="rounded-2xl bg-indigo-50 p-4 font-black text-indigo-950">{feedback}</p>
  </section>;
}

function polar(cx: number, cy: number, radius: number, degrees: number) {
  const radians = degrees * Math.PI / 180;
  return { x: cx + Math.cos(radians) * radius, y: cy - Math.sin(radians) * radius };
}

function sectorPath(cx: number, cy: number, radius: number, measure: number): string {
  if (measure <= 0) return "";
  if (measure >= 360) return `M ${cx - radius} ${cy} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
  const start = polar(cx, cy, radius, 0);
  const end = polar(cx, cy, radius, measure);
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${measure > 180 ? 1 : 0} 0 ${end.x} ${end.y} Z`;
}

function MiniAngle({ measure, colored = false, revealMeasureToAssistive = true }: { measure: number; colored?: boolean; revealMeasureToAssistive?: boolean }) {
  const type = classifyCompleteAngle(measure);
  const end = polar(90, 78, 58, measure);
  return <svg viewBox="0 0 180 150" className="mx-auto h-32 w-full" role="img" aria-label={revealMeasureToAssistive ? `Rysunek kąta o mierze ${measure} stopni` : "Rysunek kąta do sklasyfikowania"}>
    <rect width="180" height="150" rx="18" fill="#f8fafc" />
    {measure === 360
      ? <circle cx="90" cy="78" r="48" fill={colored ? `${TYPE_COLORS[type]}33` : "#e2e8f0"} stroke={colored ? TYPE_COLORS[type] : "#94a3b8"} strokeWidth="5" />
      : <path d={sectorPath(90, 78, 48, measure)} fill={colored ? `${TYPE_COLORS[type]}55` : "#e2e8f0"} stroke="none" />}
    <line x1="90" y1="78" x2="151" y2="78" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
    <line x1="90" y1="78" x2={end.x} y2={end.y} stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
    <circle cx="90" cy="78" r="7" fill="#0f172a" />
    {measure === 90 ? <path d="M110 78v-20H90" fill="none" stroke="#dc2626" strokeWidth="4" /> : null}
  </svg>;
}

function MeasureScatterBoard({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [solved, setSolved] = useState<Set<CompleteAngleType>>(() => new Set());
  const [feedback, setFeedback] = useState("Zaznacz wszystkie pasujące miary i sprawdź cały wybór.");
  const target = SCATTER_ROUNDS[roundIndex]!;
  const toggle = (measure: number) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(measure)) next.delete(measure); else next.add(measure);
    return next;
  });
  const check = () => {
    const expected = SCATTER_MEASURES.filter((measure) => classifyCompleteAngle(measure) === target);
    const correct = selected.size === expected.length && expected.every((measure) => selected.has(measure));
    if (!correct) {
      setFeedback(`Sprawdź granicę: ${SCATTER_RULES[target]}. Zaznaczenie nie jest jeszcze kompletne.`);
      onResultChange?.(false, [...selected].join(", "));
      return;
    }
    const nextSolved = new Set(solved).add(target);
    setSolved(nextSolved);
    setFeedback(`Dobrze. Wszystkie miary dla kategorii „${COMPLETE_ANGLE_LABELS[target]}” są zaznaczone.`);
    const complete = nextSolved.size === SCATTER_ROUNDS.length;
    onResultChange?.(complete ? true : null, [...selected].join(", "));
    if (!complete) {
      setSelected(new Set());
      setRoundIndex((roundIndex + 1) % SCATTER_ROUNDS.length);
    }
  };
  return <section className="grid gap-4" data-angle-measure-scatter>
    <header className="rounded-3xl bg-gradient-to-r from-indigo-950 via-violet-900 to-fuchsia-900 p-5 text-white shadow-xl">
      <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Rozsypanka miar · runda {roundIndex + 1} z {SCATTER_ROUNDS.length}</p>
      <h3 className="mt-2 text-2xl font-black sm:text-3xl">Zaznacz wszystkie miary: {COMPLETE_ANGLE_LABELS[target]}</h3>
      <p className="mt-2 inline-block rounded-xl bg-white/15 px-4 py-2 text-lg font-black">{SCATTER_RULES[target]}</p>
    </header>
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-100 via-cyan-50 to-emerald-100 p-4 shadow-inner sm:p-7">
      <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-cyan-300/35" /><div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-fuchsia-300/25" />
      <div className="relative grid grid-cols-3 gap-3 sm:grid-cols-5" aria-label="Rozsypane miary kątów">
        {SCATTER_MEASURES.map((measure, index) => <button key={measure} type="button" disabled={readOnly} aria-pressed={selected.has(measure)} aria-label={`${measure}°`} onClick={() => toggle(measure)} className={`min-h-16 border-4 text-xl font-black shadow-lg transition sm:min-h-20 sm:text-2xl ${index % 3 === 0 ? "rounded-full" : index % 3 === 1 ? "rounded-[1.5rem]" : "rounded-xl"} ${selected.has(measure) ? "scale-105 border-amber-200 bg-indigo-700 text-white" : index % 4 === 0 ? "border-white bg-cyan-200 text-cyan-950" : index % 4 === 1 ? "border-white bg-amber-200 text-amber-950" : index % 4 === 2 ? "border-white bg-emerald-200 text-emerald-950" : "border-white bg-fuchsia-200 text-fuchsia-950"}`}>{measure}°</button>)}
      </div>
    </div>
    <button type="button" disabled={readOnly || selected.size === 0} onClick={check} className="min-h-14 rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35">Sprawdź zaznaczenie</button>
    <p role="status" className="rounded-2xl bg-indigo-50 p-4 font-black text-indigo-950">{feedback}</p>
    <div className="flex flex-wrap gap-2" aria-label="Postęp rodzajów kątów">{SCATTER_ROUNDS.map((kind) => <span key={kind} className={`rounded-full px-3 py-2 text-sm font-black ${solved.has(kind) ? "bg-emerald-200 text-emerald-950" : kind === target ? "bg-indigo-200 text-indigo-950" : "bg-slate-100 text-slate-500"}`}>{solved.has(kind) ? "✓ " : ""}{COMPLETE_ANGLE_LABELS[kind]}</span>)}</div>
  </section>;
}

function PictureScatterBoard({ readOnly, onResultChange }: { readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [solved, setSolved] = useState<Set<CompleteAngleType>>(() => new Set());
  const [feedback, setFeedback] = useState("Obejrzyj wszystkie rysunki i zaznacz pełny zestaw.");
  const target = SCATTER_ROUNDS[roundIndex]!;
  const toggle = (measure: number) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(measure)) next.delete(measure); else next.add(measure);
    return next;
  });
  const check = () => {
    const expected = PICTURE_SCATTER_MEASURES.filter((measure) => classifyCompleteAngle(measure) === target);
    const correct = selected.size === expected.length && expected.every((measure) => selected.has(measure));
    if (!correct) {
      setFeedback("Nie wszystkie zaznaczone rysunki należą do wskazanego rodzaju. Porównaj ich rozwartość z kątem prostym i półpełnym.");
      onResultChange?.(false, "niepełny wybór rysunków");
      return;
    }
    const nextSolved = new Set(solved).add(target);
    setSolved(nextSolved);
    setFeedback(`Dobrze. Wszystkie rysunki kategorii „${COMPLETE_ANGLE_LABELS[target]}” zostały pokolorowane.`);
    const complete = nextSolved.size === SCATTER_ROUNDS.length;
    onResultChange?.(complete ? true : null, COMPLETE_ANGLE_LABELS[target]);
    if (!complete) {
      setSelected(new Set());
      setRoundIndex((roundIndex + 1) % SCATTER_ROUNDS.length);
    }
  };
  return <section className="grid gap-4" data-angle-picture-scatter>
    <header className="rounded-3xl bg-gradient-to-r from-fuchsia-950 via-indigo-950 to-cyan-900 p-5 text-white shadow-xl"><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Kolorowa rozsypanka · runda {roundIndex + 1} z {SCATTER_ROUNDS.length}</p><h3 className="mt-2 text-2xl font-black sm:text-3xl">Znajdź wszystkie rysunki: {COMPLETE_ANGLE_LABELS[target]}</h3><p className="mt-2 font-bold text-indigo-100">Zaznacz pełny zestaw. Po poprawnym sprawdzeniu wnętrza tych kątów otrzymają kolor.</p></header>
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-100 via-white to-amber-100 p-4 shadow-inner sm:p-6"><div className="pointer-events-none absolute -left-16 top-20 h-48 w-48 rounded-full bg-cyan-300/20" /><div className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-fuchsia-300/20" /><div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5" aria-label="Rozsypane rysunki kątów">{PICTURE_SCATTER_MEASURES.map((measure, index) => { const kind = classifyCompleteAngle(measure); const colored = solved.has(kind); return <button key={measure} type="button" disabled={readOnly || colored} aria-pressed={selected.has(measure)} aria-label="Wybierz rysunek kąta" data-angle-measure={measure} onClick={() => toggle(measure)} className={`overflow-hidden border-4 p-1 shadow-lg transition ${index % 3 === 0 ? "rounded-[2rem]" : index % 3 === 1 ? "rounded-full" : "rounded-xl"} ${selected.has(measure) ? "scale-105 border-indigo-700 bg-indigo-100" : colored ? "border-emerald-400 bg-white" : "border-white bg-white/85 hover:border-indigo-300"}`}><MiniAngle measure={measure} colored={colored} revealMeasureToAssistive={false} /></button>; })}</div></div>
    <button type="button" disabled={readOnly || selected.size === 0} onClick={check} className="min-h-14 rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35">Sprawdź i pokoloruj</button>
    <p role="status" className="rounded-2xl bg-indigo-50 p-4 font-black text-indigo-950">{feedback}</p>
    <div className="flex flex-wrap gap-2" aria-label="Legenda pokolorowanych rodzajów">{SCATTER_ROUNDS.map((kind) => <span key={kind} className={`rounded-full px-3 py-2 text-sm font-black ${solved.has(kind) ? "text-white" : kind === target ? "bg-indigo-200 text-indigo-950" : "bg-slate-100 text-slate-500"}`} style={solved.has(kind) ? { backgroundColor: TYPE_COLORS[kind] } : undefined}>{solved.has(kind) ? "✓ " : ""}{COMPLETE_ANGLE_LABELS[kind]}</span>)}</div>
  </section>;
}

export function AngleRecognitionGeometryLab({ seed, readOnly = false, onResultChange }: { seed: number; mode?: GeometryLabMode; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const activity = getAngleRecognitionActivity(seed);
  const [selectedPart, setSelectedPart] = useState("inside");
  const [measure, setMeasure] = useState(45);
  const [greek, setGreek] = useState("α");
  const [notationTask, setNotationTask] = useState(0);
  const [notationAnswers, setNotationAnswers] = useState<Record<number, string>>({});
  const [figureAnswers, setFigureAnswers] = useState<Record<string, "acute" | "right" | "obtuse">>({});
  const type = classifyCompleteAngle(measure);
  const opennessMovingEnd = polar(360, 255, 250, measure);
  const opennessLabel = polar(360, 255, measure === 360 ? 135 : 120, measure === 0 ? 18 : measure / 2);

  if (activity === "anatomy") return <section className="grid gap-4" data-angle-recognition data-activity={activity}>
    <header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Budowa kąta</p><h2 className="mt-1 text-2xl font-black">Wierzchołek, ramiona i wnętrze kąta</h2><p className="mt-2 font-semibold text-indigo-100">Kąt tworzą dwie półproste o wspólnym początku. Ten wspólny punkt to wierzchołek, półproste są ramionami, a kąt jest częścią płaszczyzny między ramionami.</p></header>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <AccessibleMathSvg title="Budowa kąta ABC" description="Kąt ABC ma wierzchołek B, ramiona BA i BC oraz zaznaczone wnętrze między ramionami." viewBox="0 0 650 360" className="w-full rounded-2xl border-2 border-indigo-200 bg-slate-50" columns={[{ key: "element", label: "Element" }, { key: "opis", label: "Opis" }]} rows={[{ element: "wierzchołek", opis: "punkt B" }, { element: "ramiona", opis: "półproste BA i BC" }, { element: "wnętrze", opis: "część płaszczyzny między ramionami" }]}> 
        <rect width="650" height="360" rx="24" fill="#f8fafc" />
        <path d="M280 245 L505 245 A225 225 0 0 0 392 50 Z" fill={selectedPart === "inside" ? "#fbbf2466" : "#fde68a33"} />
        <line x1="280" y1="245" x2="545" y2="245" stroke={selectedPart === "arm-ba" ? "#dc2626" : "#1e3a8a"} strokeWidth="9" strokeLinecap="round" />
        <line x1="280" y1="245" x2="415" y2="30" stroke={selectedPart === "arm-bc" ? "#dc2626" : "#1e3a8a"} strokeWidth="9" strokeLinecap="round" />
        <circle cx="280" cy="245" r={selectedPart === "vertex" ? 15 : 9} fill="#be123c" />
        <text x="555" y="252" fontSize="28" fontWeight="900">A</text><text x="255" y="278" fontSize="28" fontWeight="900">B</text><text x="416" y="28" fontSize="28" fontWeight="900">C</text>
        <text x="375" y="182" fontSize="34" fontWeight="900" fill="#92400e">α</text><text x="58" y="70" fontSize="28" fontWeight="900" fill="#312e81">∠ABC</text>
      </AccessibleMathSvg>
      <aside className="grid content-start gap-2 rounded-2xl bg-indigo-50 p-4" aria-label="Elementy kąta">
        {[['vertex','wierzchołek B'],['arm-ba','ramię BA'],['arm-bc','ramię BC'],['inside','wnętrze kąta']].map(([id,label]) => <button key={id} type="button" disabled={readOnly} onClick={() => setSelectedPart(id!)} className={`min-h-12 rounded-xl px-3 text-left font-black ${selectedPart === id ? "bg-indigo-700 text-white" : "bg-white text-slate-900"}`}>{label}</button>)}
        <p className="rounded-xl bg-amber-100 p-3 font-bold text-amber-950">Łuk i kolor tylko wskazują, o którą część płaszczyzny chodzi. Sam kąt nie jest długością łuku.</p>
      </aside>
    </div>
  </section>;

  if (activity === "openness") return <section className="grid gap-4" data-angle-recognition data-activity={activity}>
    <header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Zmieniaj tylko rozwartość</p><h2 className="mt-1 text-2xl font-black">Jedna zmiana — inny rodzaj kąta</h2><p className="mt-2 font-semibold text-indigo-100">Przesuwaj suwak. Nie mierzymy długości ramion i nie obracamy całego kąta.</p></header>
    <div className="grid items-start gap-5" data-openness-layout>
      <div className="min-w-0 rounded-2xl border-2 border-indigo-200 bg-slate-50 p-2" data-openness-angle-stage>
        <svg viewBox="0 0 720 550" className="h-auto min-h-[560px] w-full overflow-visible" role="img" aria-label={`Kąt alfa ma ${measure} stopni i jest sklasyfikowany jako ${COMPLETE_ANGLE_LABELS[type]}`}>
          {measure === 360 ? <circle cx="360" cy="255" r="250" fill={`${TYPE_COLORS[type]}33`} stroke={TYPE_COLORS[type]} strokeWidth="8" /> : <path d={sectorPath(360,255,250,measure)} fill={`${TYPE_COLORS[type]}44`} />}
          <line x1="360" y1="255" x2="610" y2="255" stroke="#1e293b" strokeWidth="15" strokeLinecap="round" />
          <line x1="360" y1="255" x2={opennessMovingEnd.x} y2={opennessMovingEnd.y} stroke="#1e293b" strokeWidth="15" strokeLinecap="round" />
          <circle cx="360" cy="255" r="16" fill="#0f172a" />
          {measure === 90 ? <path d="M414 255v-54h-54" fill="none" stroke="#dc2626" strokeWidth="8" /> : null}
          <text x="360" y="535" textAnchor="middle" fontSize="42" fontWeight="900" fill={TYPE_COLORS[type]}>{measure}° · {COMPLETE_ANGLE_LABELS[type]}</text>
          <text x={opennessLabel.x} y={opennessLabel.y} textAnchor="middle" dominantBaseline="middle" fontSize="46" fontWeight="900" fill="#312e81">α</text>
        </svg>
      </div>
      <aside className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" data-openness-controls>
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-4 shadow-sm">
          <label className="block text-lg font-black text-slate-950">Rozwartość kąta: {measure}°<input aria-label="Rozwartość kąta" type="range" min="0" max="360" step="1" value={measure} disabled={readOnly} onChange={(event) => setMeasure(Number(event.target.value))} className="mt-3 min-h-12 w-full accent-indigo-700" /></label>
          <div className="mt-3 grid grid-cols-3 gap-2">{[0,35,90,125,180,225,360].map((value) => <button key={value} type="button" disabled={readOnly} onClick={() => setMeasure(value)} className="min-h-11 rounded-xl bg-indigo-50 px-2 font-black text-indigo-950 shadow-sm">{value}°</button>)}</div>
        </div>
        <div className="rounded-2xl bg-indigo-50 p-4"><h3 className="text-lg font-black text-indigo-950">Przedziały miar</h3><ul className="mt-3 grid gap-2 text-sm font-bold text-slate-900"><li>0° — zerowy</li><li>0° &lt; α &lt; 90° — ostry</li><li>α = 90° — prosty</li><li>90° &lt; α &lt; 180° — rozwarty</li><li>α = 180° — półpełny</li><li>180° &lt; α &lt; 360° — wklęsły</li><li>α = 360° — pełny</li></ul><p className="mt-4 rounded-xl bg-white p-3 font-black text-indigo-950">{isConvexAngle(measure) ? "Ten kąt jest wypukły, ponieważ 0° ≤ α ≤ 180°." : type === "full" ? "Kąt pełny ma dokładnie 360°." : "Ten kąt jest wklęsły, ponieważ 180° < α < 360°."}</p></div>
      </aside>
    </div>
  </section>;

  if (activity === "greek") return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Oznaczenia</p><h2 className="mt-1 text-2xl font-black">Kąty oznaczamy literami greckimi</h2><p className="mt-2 font-semibold text-indigo-100">Najczęściej używamy liter: α (alfa), β (beta), γ (gamma) i δ (delta).</p></header><div className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-slate-50 p-4 md:grid-cols-3">{[[50,'α'],[110,'β'],[230,'γ']].map(([value,label]) => <button key={label} type="button" disabled={readOnly} onClick={() => setGreek(String(label))} className={`rounded-2xl border-4 p-2 ${greek === label ? "border-indigo-700 bg-indigo-50" : "border-white bg-white"}`}><MiniAngle measure={Number(value)} colored={greek === label} /><span className="text-3xl font-black">{label}</span></button>)}</div><p role="status" className="rounded-2xl bg-amber-100 p-4 font-bold text-amber-950">Wybrano kąt {greek}. Litera grecka nazywa kąt, a nie jego ramię ani wierzchołek.</p></section>;

  if (activity === "notation") {
    const task = NOTATION_TASKS[notationTask]!;
    const answer = notationAnswers[notationTask] ?? null;
    const correct = answer === task.correct;
    const [first, vertex, last] = task.points;
    const chooseNotation = (option: string) => {
      const next = { ...notationAnswers, [notationTask]: option };
      setNotationAnswers(next);
      const complete = NOTATION_TASKS.every((item, index) => next[index] === item.correct);
      onResultChange?.(complete ? true : option === task.correct ? null : false, option);
    };
    return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Czytanie zapisu</p><h2 className="mt-1 text-2xl font-black">Wierzchołek zapisujemy w środku</h2><p className="mt-2 font-semibold text-indigo-100">Punkty na ramionach zapisujemy po bokach nazwy, a literę wierzchołka zawsze umieszczamy w środku.</p></header><div className="flex flex-wrap gap-2" role="tablist" aria-label="Wybierz zadanie z zapisu kąta">{NOTATION_TASKS.map((item, index) => <button key={item.correct} type="button" role="tab" aria-selected={notationTask === index} disabled={readOnly} onClick={() => setNotationTask(index)} className={`min-h-12 rounded-xl px-5 font-black ${notationTask === index ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-950"}`}>Zadanie {index + 1}{notationAnswers[index] === item.correct ? " ✓" : ""}</button>)}</div><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="rounded-2xl border-2 border-indigo-200 bg-slate-50 p-3"><svg viewBox="0 0 560 400" className="h-auto min-h-[400px] w-full" role="img" aria-label={`Kąt o ramionach ${vertex}${first} i ${vertex}${last}, z punktem ${vertex} w wierzchołku`}><rect width="560" height="400" rx="24" fill="#f8fafc" /><path d="M225 305L510 305M225 305L415 30" stroke="#1e3a8a" strokeWidth="12" strokeLinecap="round" /><path d="M315 305A90 90 0 0 0 276 231" fill="#fbbf2444" stroke="#d97706" strokeWidth="8" /><circle cx="225" cy="305" r="14" fill="#be123c" /><circle cx="485" cy="305" r="10" fill="#2563eb" /><circle cx="395" cy="60" r="10" fill="#2563eb" /><text x="500" y="294" fontSize="38" fontWeight="900">{first}</text><text x="185" y="355" fontSize="38" fontWeight="900" fill="#9f1239">{vertex}</text><text x="410" y="58" fontSize="38" fontWeight="900">{last}</text><text x="340" y="210" fontSize="34" fontWeight="900" fill="#92400e">?</text></svg></div><aside className="grid content-start gap-3 rounded-2xl bg-indigo-50 p-4"><p className="font-black text-indigo-950">Który zapis nazywa zaznaczony kąt? Wierzchołek to punkt <b className="text-xl">{vertex}</b>.</p>{task.options.map((option) => <button key={option} type="button" disabled={readOnly} onClick={() => chooseNotation(option)} className={`min-h-14 rounded-xl text-2xl font-black ${answer === option ? "bg-indigo-700 text-white" : "bg-white text-slate-900"}`}>{option}</button>)}<p role="status" className={`rounded-xl p-3 font-bold ${correct ? "bg-emerald-100 text-emerald-950" : answer ? "bg-rose-100 text-rose-950" : "bg-white text-slate-800"}`}>{correct ? `Dobrze. ${vertex} jest środkową literą, bo ${vertex} jest wierzchołkiem kąta.` : answer ? "Sprawdź, która litera oznacza wspólny początek obu ramion." : "Wybierz zapis."}</p>{correct && notationTask < NOTATION_TASKS.length - 1 ? <button type="button" onClick={() => setNotationTask(notationTask + 1)} className="min-h-12 rounded-xl bg-emerald-600 px-4 font-black text-white">Następne zadanie</button> : null}</aside></div></section>;
  }

  if (activity === "measures") return <MeasureScatterBoard readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "color-types") return <PictureScatterBoard readOnly={readOnly} onResultChange={onResultChange} />;

  if (activity === "figure") {
    const complete = FIGURE_ANGLE_TASKS.every((task) => figureAnswers[task.notation] === task.correct);
    const choose = (notation: string, answer: "acute" | "right" | "obtuse") => {
      const next = { ...figureAnswers, [notation]: answer };
      setFigureAnswers(next);
      const correct = FIGURE_ANGLE_TASKS.every((task) => next[task.notation] === task.correct);
      onResultChange?.(correct ? true : answer === FIGURE_ANGLE_TASKS.find((task) => task.notation === notation)?.correct ? null : false, answer);
    };
    return <section className="flex w-full flex-col gap-4" data-angle-recognition data-activity={activity}>
      <div className="order-first w-full rounded-2xl border-2 border-indigo-200 bg-slate-50 p-3" data-angle-figure-stage>
        <svg viewBox="0 0 920 480" className="h-auto min-h-[540px] w-full" role="img" aria-label="Duży trapez ABCD z zaznaczonymi kątami ABC, BCD i BAD">
          <rect width="920" height="480" rx="24" fill="#f8fafc" />
          <polygon points="90,390 225,70 700,70 815,390" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="12" />
          <path d="M225 70 L196 139 Q250 180 305 70 Z" fill={figureAnswers["∠ABC"] === "obtuse" ? "#16a34a66" : "#16a34a22"} stroke="#16a34a" strokeWidth="8" />
          <path d="M700 70 L615 70 Q640 175 728 148 Z" fill={figureAnswers["∠BCD"] === "obtuse" ? "#d9770666" : "#d9770622"} stroke="#d97706" strokeWidth="8" />
          <path d="M90 390 L122 314 Q158 345 175 390 Z" fill={figureAnswers["∠BAD"] === "acute" ? "#2563eb66" : "#2563eb22"} stroke="#2563eb" strokeWidth="8" />
          <circle cx="90" cy="390" r="13" fill="#1e3a8a" /><circle cx="225" cy="70" r="13" fill="#1e3a8a" /><circle cx="700" cy="70" r="13" fill="#1e3a8a" /><circle cx="815" cy="390" r="13" fill="#1e3a8a" />
          <text x="45" y="435" fontSize="42" fontWeight="900">A</text><text x="195" y="48" fontSize="42" fontWeight="900">B</text><text x="713" y="48" fontSize="42" fontWeight="900">C</text><text x="830" y="435" fontSize="42" fontWeight="900">D</text>
          <text x="245" y="175" fontSize="32" fontWeight="900" fill="#166534">∠ABC</text><text x="615" y="190" fontSize="32" fontWeight="900" fill="#92400e">∠BCD</text><text x="122" y="305" fontSize="32" fontWeight="900" fill="#1e40af">∠BAD</text>
        </svg>
      </div>
      <header className="w-full rounded-2xl bg-indigo-950 p-4 text-white" data-angle-figure-copy><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Kąty na figurze</p><h2 className="mt-1 text-2xl font-black">Wypisz i rozpoznaj kąty</h2><p className="mt-2 font-semibold text-indigo-100">Środkowa litera nazwy wskazuje wierzchołek. Odczytaj trzy zaznaczone kąty i określ ich rodzaj.</p></header>
      <div className="grid gap-3 rounded-2xl bg-indigo-50 p-4" data-angle-figure-tasks>
        <p className="text-lg font-black text-indigo-950">Wypisz kąty:</p>
        <aside className="grid gap-3 md:grid-cols-3" aria-label="Klasyfikacja kątów trapezu">
          {FIGURE_ANGLE_TASKS.map((task) => { const answer = figureAnswers[task.notation]; const isCorrect = answer === task.correct; return <div key={task.notation} className={`rounded-2xl border-2 p-3 ${isCorrect ? "border-emerald-400 bg-emerald-50" : answer ? "border-rose-300 bg-rose-50" : "border-indigo-100 bg-white"}`}><p className="font-black text-slate-950">{task.spoken} jest…</p><div className="mt-2 grid grid-cols-3 gap-1" role="group" aria-label={`${task.spoken} jest`}>{(["acute","right","obtuse"] as const).map((kind) => <button key={kind} type="button" disabled={readOnly} aria-pressed={answer === kind} onClick={() => choose(task.notation, kind)} className={`min-h-11 rounded-lg px-1 text-sm font-black ${answer === kind ? "bg-indigo-700 text-white" : "bg-indigo-100 text-indigo-950"}`}>{kind === "acute" ? "ostry" : kind === "right" ? "prosty" : "rozwarty"}</button>)}</div>{isCorrect ? <p className="mt-2 font-bold text-emerald-800">✓ {task.spoken} jest {task.correct === "acute" ? "ostry" : "rozwarty"}.</p> : null}</div>; })}
        </aside>
      </div>
      <p role="status" className={`rounded-xl p-3 font-bold ${complete ? "bg-emerald-200 text-emerald-950" : "bg-indigo-50 text-slate-800"}`}>{complete ? "Dobrze: kąt ABC jest rozwarty, kąt BCD jest rozwarty, a kąt BAD jest ostry." : "Uzupełnij rodzaj każdego z trzech kątów."}</p>
    </section>;
  }

  if (activity === "line-network") return <section className="grid gap-4" data-angle-recognition data-activity={activity}><AngleLineNetworkBoard readOnly={readOnly} onResultChange={onResultChange} /></section>;

  return <section className="grid gap-4" data-angle-recognition data-activity={activity}><PointCloudAngleBoard readOnly={readOnly} onResultChange={onResultChange} /></section>;
}
