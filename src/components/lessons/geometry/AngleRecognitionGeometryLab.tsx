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

const TYPE_ORDER = Object.keys(COMPLETE_ANGLE_LABELS) as CompleteAngleType[];

const NOTATION_TASKS = [
  { points: ["A", "B", "C"] as const, correct: "∠ABC", options: ["∠ABC", "∠BAC", "∠ACB"] },
  { points: ["D", "E", "F"] as const, correct: "∠DEF", options: ["∠DFE", "∠DEF", "∠EDF"] },
  { points: ["K", "L", "M"] as const, correct: "∠KLM", options: ["∠LMK", "∠MKL", "∠KLM"] },
] as const;

const SCATTER_MEASURES = [136, 0, 225, 72, 360, 91, 180, 35, 283, 90, 16, 157, 216, 88, 117, 43, 321, 99, 58, 172, 1, 179, 181, 359, 64] as const;
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

function MiniAngle({ measure, colored = false }: { measure: number; colored?: boolean }) {
  const type = classifyCompleteAngle(measure);
  const end = polar(90, 78, 58, measure);
  return <svg viewBox="0 0 180 150" className="mx-auto h-32 w-full" role="img" aria-label={`Rysunek kąta o mierze ${measure} stopni`}>
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

function AngleTypeButtons({ disabled, onChoose }: { disabled: boolean; onChoose: (type: CompleteAngleType) => void }) {
  return <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Wybierz rodzaj kąta">
    {TYPE_ORDER.map((type) => <button key={type} type="button" disabled={disabled} onClick={() => onChoose(type)} className="min-h-12 rounded-xl border-2 border-indigo-200 bg-white px-3 py-2 font-black text-slate-900 hover:border-indigo-600 disabled:opacity-50">{COMPLETE_ANGLE_LABELS[type]}</button>)}
  </div>;
}

function ClassificationBoard({ measures, pictures, readOnly, onResultChange }: { measures: number[]; pictures: boolean; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState<Record<number, CompleteAngleType>>({});
  const [feedback, setFeedback] = useState("Wybierz przykład, a następnie jego rodzaj.");
  const current = measures[active]!;
  const choose = (type: CompleteAngleType) => {
    const correct = classifyCompleteAngle(current);
    if (type !== correct) {
      setFeedback(`Jeszcze nie. Porównaj rozwartość z 90°, 180° i 360°.`);
      onResultChange?.(false, COMPLETE_ANGLE_LABELS[type]);
      return;
    }
    const next = { ...answers, [active]: type };
    setAnswers(next);
    const complete = measures.every((_, index) => next[index]);
    setFeedback(complete ? "Wszystkie kąty sklasyfikowane poprawnie." : `Dobrze: ${COMPLETE_ANGLE_LABELS[type]}. Wybierz kolejny przykład.`);
    onResultChange?.(complete ? true : null, COMPLETE_ANGLE_LABELS[type]);
  };
  return <section className="grid gap-4" data-angle-classification-board data-pictures={pictures ? "true" : "false"}>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {measures.map((measure, index) => {
        const solved = answers[index];
        return <button key={`${measure}-${index}`} type="button" disabled={readOnly} onClick={() => setActive(index)} aria-pressed={active === index} className={`rounded-2xl border-4 p-2 ${active === index ? "border-indigo-700" : "border-slate-200"}`} style={solved ? { backgroundColor: `${TYPE_COLORS[solved]}22` } : undefined}>
          {pictures ? <MiniAngle measure={measure} colored={Boolean(solved)} /> : <span className="grid min-h-24 place-items-center text-3xl font-black text-slate-950">{measure}°</span>}
          <span className="block min-h-7 text-sm font-black" style={solved ? { color: TYPE_COLORS[solved] } : undefined}>{solved ? COMPLETE_ANGLE_LABELS[solved] : `Przykład ${index + 1}`}</span>
        </button>;
      })}
    </div>
    <AngleTypeButtons disabled={readOnly} onChoose={choose} />
    <p role="status" className="rounded-2xl bg-indigo-50 p-4 font-bold text-indigo-950">{feedback}</p>
  </section>;
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

export function AngleRecognitionGeometryLab({ seed, readOnly = false, onResultChange }: { seed: number; mode?: GeometryLabMode; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const activity = getAngleRecognitionActivity(seed);
  const [selectedPart, setSelectedPart] = useState("inside");
  const [measure, setMeasure] = useState(45);
  const [greek, setGreek] = useState("α");
  const [notationTask, setNotationTask] = useState(0);
  const [notationAnswers, setNotationAnswers] = useState<Record<number, string>>({});
  const [vertices, setVertices] = useState<string[]>([]);
  const type = classifyCompleteAngle(measure);
  const movingEnd = polar(280, 165, 155, measure);

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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="rounded-2xl border-2 border-indigo-200 bg-slate-50 p-3">
        <svg viewBox="0 0 560 360" className="h-auto min-h-[360px] w-full" role="img" aria-label={`Kąt alfa ma ${measure} stopni i jest sklasyfikowany jako ${COMPLETE_ANGLE_LABELS[type]}`}>
          <rect width="560" height="360" rx="24" fill="#f8fafc" />
          {measure === 360 ? <circle cx="280" cy="165" r="145" fill={`${TYPE_COLORS[type]}33`} stroke={TYPE_COLORS[type]} strokeWidth="6" /> : <path d={sectorPath(280,165,145,measure)} fill={`${TYPE_COLORS[type]}44`} />}
          <line x1="280" y1="165" x2="435" y2="165" stroke="#1e293b" strokeWidth="11" strokeLinecap="round" />
          <line x1="280" y1="165" x2={movingEnd.x} y2={movingEnd.y} stroke="#1e293b" strokeWidth="11" strokeLinecap="round" />
          <circle cx="280" cy="165" r="12" fill="#0f172a" />
          {measure === 90 ? <path d="M318 165v-38h-38" fill="none" stroke="#dc2626" strokeWidth="6" /> : null}
          <text x="280" y="340" textAnchor="middle" fontSize="32" fontWeight="900" fill={TYPE_COLORS[type]}>{measure}° · {COMPLETE_ANGLE_LABELS[type]}</text>
          <text x="348" y="115" fontSize="34" fontWeight="900" fill="#312e81">α</text>
        </svg>
        <label className="mt-3 block text-lg font-black text-slate-950">Rozwartość kąta: {measure}°<input aria-label="Rozwartość kąta" type="range" min="0" max="360" step="1" value={measure} disabled={readOnly} onChange={(event) => setMeasure(Number(event.target.value))} className="mt-2 min-h-12 w-full accent-indigo-700" /></label>
        <div className="mt-2 flex flex-wrap gap-2">{[0,35,90,125,180,225,360].map((value) => <button key={value} type="button" disabled={readOnly} onClick={() => setMeasure(value)} className="min-h-11 rounded-xl bg-white px-4 font-black shadow">{value}°</button>)}</div>
      </div>
      <aside className="rounded-2xl bg-indigo-50 p-4"><h3 className="text-lg font-black text-indigo-950">Przedziały miar</h3><ul className="mt-3 grid gap-2 text-sm font-bold text-slate-900"><li>0° — zerowy</li><li>0° &lt; α &lt; 90° — ostry</li><li>α = 90° — prosty</li><li>90° &lt; α &lt; 180° — rozwarty</li><li>α = 180° — półpełny</li><li>180° &lt; α &lt; 360° — wklęsły</li><li>α = 360° — pełny</li></ul><p className="mt-4 rounded-xl bg-white p-3 font-black text-indigo-950">{isConvexAngle(measure) ? "Ten kąt jest wypukły, ponieważ 0° ≤ α ≤ 180°." : type === "full" ? "Kąt pełny ma dokładnie 360°." : "Ten kąt jest wklęsły, ponieważ 180° < α < 360°."}</p></aside>
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
  if (activity === "color-types") return <ClassificationBoard measures={[35,90,125,180,235,360]} pictures readOnly={readOnly} onResultChange={onResultChange} />;

  if (activity === "figure") {
    const all = ["A","B","C","D"].every((vertex) => vertices.includes(vertex));
    const toggle = (vertex: string) => setVertices((current) => current.includes(vertex) ? current.filter((item) => item !== vertex) : [...current, vertex]);
    return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Kąty na figurze</p><h2 className="mt-1 text-2xl font-black">Wskaż kąty wewnętrzne czworokąta</h2><p className="mt-2 font-semibold text-indigo-100">Kąt figury znajduje się przy wierzchołku — między dwoma bokami, które się w nim spotykają.</p></header><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="rounded-2xl border-2 border-indigo-200 bg-slate-50 p-3"><svg viewBox="0 0 620 360" className="w-full" role="img" aria-label="Czworokąt ABCD z czterema kątami wewnętrznymi"><polygon points="130,270 205,70 465,95 520,280" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="9" />{[[130,270,'A'],[205,70,'B'],[465,95,'C'],[520,280,'D']].map(([x,y,label]) => <g key={String(label)}><circle cx={Number(x)} cy={Number(y)} r={vertices.includes(String(label)) ? 24 : 11} fill={vertices.includes(String(label)) ? "#f59e0b" : "#1e3a8a"} /><text x={Number(x)+(label === 'A' ? -35 : 18)} y={Number(y)+(label === 'B' || label === 'C' ? -12 : 28)} fontSize="28" fontWeight="900">{label}</text></g>)}</svg></div><aside className="grid content-start gap-3 rounded-2xl bg-indigo-50 p-4"><p className="font-black text-indigo-950">Zaznacz wszystkie wierzchołki, przy których znajdują się kąty figury.</p>{["A","B","C","D"].map((vertex) => <button key={vertex} type="button" disabled={readOnly} aria-pressed={vertices.includes(vertex)} onClick={() => toggle(vertex)} className={`min-h-12 rounded-xl font-black ${vertices.includes(vertex) ? "bg-amber-400 text-amber-950" : "bg-white text-slate-900"}`}>kąt przy {vertex}</button>)}<p role="status" className={`rounded-xl p-3 font-bold ${all ? "bg-emerald-100 text-emerald-950" : "bg-white text-slate-800"}`}>{all ? "Dobrze. Czworokąt ma cztery kąty wewnętrzne — po jednym przy każdym wierzchołku." : `Zaznaczono ${vertices.length} z 4 kątów.`}</p></aside></div></section>;
  }

  return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Samodzielna próba</p><h2 className="mt-1 text-2xl font-black">Rozpoznaj kąty po mierze</h2><p className="mt-2 font-semibold text-indigo-100">Nazwij każdy kąt bez podpowiedzi. Korzystaj z granic 90°, 180° i 360°.</p></header><ClassificationBoard measures={[72,90,180,305]} pictures readOnly={readOnly} onResultChange={onResultChange} /></section>;
}
