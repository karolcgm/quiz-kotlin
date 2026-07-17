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

export function AngleRecognitionGeometryLab({ seed, readOnly = false, onResultChange }: { seed: number; mode?: GeometryLabMode; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const activity = getAngleRecognitionActivity(seed);
  const [selectedPart, setSelectedPart] = useState("inside");
  const [measure, setMeasure] = useState(45);
  const [greek, setGreek] = useState("α");
  const [notation, setNotation] = useState<string | null>(null);
  const [vertices, setVertices] = useState<string[]>([]);
  const type = classifyCompleteAngle(measure);
  const movingEnd = polar(300, 175, 125, measure);

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
        <svg viewBox="0 0 620 350" className="w-full" role="img" aria-label={`Kąt alfa ma ${measure} stopni i jest sklasyfikowany jako ${COMPLETE_ANGLE_LABELS[type]}`}>
          <rect width="620" height="350" rx="24" fill="#f8fafc" />
          {measure === 360 ? <circle cx="300" cy="175" r="105" fill={`${TYPE_COLORS[type]}33`} stroke={TYPE_COLORS[type]} strokeWidth="5" /> : <path d={sectorPath(300,175,105,measure)} fill={`${TYPE_COLORS[type]}44`} />}
          <line x1="300" y1="175" x2="440" y2="175" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
          <line x1="300" y1="175" x2={movingEnd.x} y2={movingEnd.y} stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
          <circle cx="300" cy="175" r="10" fill="#0f172a" />
          {measure === 90 ? <path d="M330 175v-30h-30" fill="none" stroke="#dc2626" strokeWidth="5" /> : null}
          <text x="300" y="320" textAnchor="middle" fontSize="30" fontWeight="900" fill={TYPE_COLORS[type]}>{measure}° · {COMPLETE_ANGLE_LABELS[type]}</text>
          <text x="350" y="135" fontSize="30" fontWeight="900" fill="#312e81">α</text>
        </svg>
        <label className="mt-3 block text-lg font-black text-slate-950">Rozwartość kąta: {measure}°<input aria-label="Rozwartość kąta" type="range" min="0" max="360" step="1" value={measure} disabled={readOnly} onChange={(event) => setMeasure(Number(event.target.value))} className="mt-2 min-h-12 w-full accent-indigo-700" /></label>
        <div className="mt-2 flex flex-wrap gap-2">{[0,35,90,125,180,225,360].map((value) => <button key={value} type="button" disabled={readOnly} onClick={() => setMeasure(value)} className="min-h-11 rounded-xl bg-white px-4 font-black shadow">{value}°</button>)}</div>
      </div>
      <aside className="rounded-2xl bg-indigo-50 p-4"><h3 className="text-lg font-black text-indigo-950">Przedziały miar</h3><ul className="mt-3 grid gap-2 text-sm font-bold text-slate-900"><li>0° — zerowy</li><li>0° &lt; α &lt; 90° — ostry</li><li>α = 90° — prosty</li><li>90° &lt; α &lt; 180° — rozwarty</li><li>α = 180° — półpełny</li><li>180° &lt; α &lt; 360° — wklęsły</li><li>α = 360° — pełny</li></ul><p className="mt-4 rounded-xl bg-white p-3 font-black text-indigo-950">{isConvexAngle(measure) ? "Ten kąt jest wypukły, ponieważ 0° ≤ α ≤ 180°." : type === "full" ? "Kąt pełny ma dokładnie 360°." : "Ten kąt jest wklęsły, ponieważ 180° < α < 360°."}</p></aside>
    </div>
  </section>;

  if (activity === "greek") return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Oznaczenia</p><h2 className="mt-1 text-2xl font-black">Kąty oznaczamy literami greckimi</h2><p className="mt-2 font-semibold text-indigo-100">Najczęściej używamy liter: α (alfa), β (beta), γ (gamma) i δ (delta).</p></header><div className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-slate-50 p-4 md:grid-cols-3">{[[50,'α'],[110,'β'],[230,'γ']].map(([value,label]) => <button key={label} type="button" disabled={readOnly} onClick={() => setGreek(String(label))} className={`rounded-2xl border-4 p-2 ${greek === label ? "border-indigo-700 bg-indigo-50" : "border-white bg-white"}`}><MiniAngle measure={Number(value)} colored={greek === label} /><span className="text-3xl font-black">{label}</span></button>)}</div><p role="status" className="rounded-2xl bg-amber-100 p-4 font-bold text-amber-950">Wybrano kąt {greek}. Litera grecka nazywa kąt, a nie jego ramię ani wierzchołek.</p></section>;

  if (activity === "notation") {
    const correct = notation === "∠ABC";
    return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Czytanie zapisu</p><h2 className="mt-1 text-2xl font-black">Wierzchołek zapisujemy w środku</h2><p className="mt-2 font-semibold text-indigo-100">Jeżeli punkty A i C leżą na ramionach, a B jest wierzchołkiem, zapisujemy ∠ABC albo ∠CBA.</p></header><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="rounded-2xl border-2 border-indigo-200 bg-slate-50 p-3"><svg viewBox="0 0 600 330" className="w-full" role="img" aria-label="Kąt o ramionach BA i BC, z punktem B w wierzchołku"><path d="M260 245L520 245M260 245L400 45" stroke="#1e3a8a" strokeWidth="9" strokeLinecap="round" /><circle cx="260" cy="245" r="10" fill="#be123c" /><circle cx="480" cy="245" r="8" fill="#2563eb" /><circle cx="375" cy="80" r="8" fill="#2563eb" /><text x="488" y="235" fontSize="30" fontWeight="900">A</text><text x="230" y="280" fontSize="30" fontWeight="900">B</text><text x="388" y="78" fontSize="30" fontWeight="900">C</text><path d="M325 245A65 65 0 0 0 297 192" fill="none" stroke="#d97706" strokeWidth="6" /></svg></div><aside className="grid content-start gap-3 rounded-2xl bg-indigo-50 p-4"><p className="font-black text-indigo-950">Który zapis nazywa zaznaczony kąt?</p>{["∠ABC","∠BAC","∠ACB"].map((option) => <button key={option} type="button" disabled={readOnly} onClick={() => { setNotation(option); onResultChange?.(option === "∠ABC", option); }} className={`min-h-14 rounded-xl text-2xl font-black ${notation === option ? "bg-indigo-700 text-white" : "bg-white text-slate-900"}`}>{option}</button>)}<p role="status" className={`rounded-xl p-3 font-bold ${correct ? "bg-emerald-100 text-emerald-950" : "bg-white text-slate-800"}`}>{correct ? "Dobrze. B jest środkową literą, bo B jest wierzchołkiem kąta." : notation ? "Sprawdź, która litera oznacza wspólny początek obu ramion." : "Wybierz zapis."}</p></aside></div></section>;
  }

  if (activity === "measures") return <ClassificationBoard measures={[0,36,90,136,180,216,283,360]} pictures={false} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "color-types") return <ClassificationBoard measures={[35,90,125,180,235,360]} pictures readOnly={readOnly} onResultChange={onResultChange} />;

  if (activity === "figure") {
    const all = ["A","B","C","D"].every((vertex) => vertices.includes(vertex));
    const toggle = (vertex: string) => setVertices((current) => current.includes(vertex) ? current.filter((item) => item !== vertex) : [...current, vertex]);
    return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Kąty na figurze</p><h2 className="mt-1 text-2xl font-black">Wskaż kąty wewnętrzne czworokąta</h2><p className="mt-2 font-semibold text-indigo-100">Kąt figury znajduje się przy wierzchołku — między dwoma bokami, które się w nim spotykają.</p></header><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="rounded-2xl border-2 border-indigo-200 bg-slate-50 p-3"><svg viewBox="0 0 620 360" className="w-full" role="img" aria-label="Czworokąt ABCD z czterema kątami wewnętrznymi"><polygon points="130,270 205,70 465,95 520,280" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="9" />{[[130,270,'A'],[205,70,'B'],[465,95,'C'],[520,280,'D']].map(([x,y,label]) => <g key={String(label)}><circle cx={Number(x)} cy={Number(y)} r={vertices.includes(String(label)) ? 24 : 11} fill={vertices.includes(String(label)) ? "#f59e0b" : "#1e3a8a"} /><text x={Number(x)+(label === 'A' ? -35 : 18)} y={Number(y)+(label === 'B' || label === 'C' ? -12 : 28)} fontSize="28" fontWeight="900">{label}</text></g>)}</svg></div><aside className="grid content-start gap-3 rounded-2xl bg-indigo-50 p-4"><p className="font-black text-indigo-950">Zaznacz wszystkie wierzchołki, przy których znajdują się kąty figury.</p>{["A","B","C","D"].map((vertex) => <button key={vertex} type="button" disabled={readOnly} aria-pressed={vertices.includes(vertex)} onClick={() => toggle(vertex)} className={`min-h-12 rounded-xl font-black ${vertices.includes(vertex) ? "bg-amber-400 text-amber-950" : "bg-white text-slate-900"}`}>kąt przy {vertex}</button>)}<p role="status" className={`rounded-xl p-3 font-bold ${all ? "bg-emerald-100 text-emerald-950" : "bg-white text-slate-800"}`}>{all ? "Dobrze. Czworokąt ma cztery kąty wewnętrzne — po jednym przy każdym wierzchołku." : `Zaznaczono ${vertices.length} z 4 kątów.`}</p></aside></div></section>;
  }

  return <section className="grid gap-4" data-angle-recognition data-activity={activity}><header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-wider text-cyan-200">Samodzielna próba</p><h2 className="mt-1 text-2xl font-black">Rozpoznaj kąty po mierze</h2><p className="mt-2 font-semibold text-indigo-100">Nazwij każdy kąt bez podpowiedzi. Korzystaj z granic 90°, 180° i 360°.</p></header><ClassificationBoard measures={[72,90,180,305]} pictures readOnly={readOnly} onResultChange={onResultChange} /></section>;
}
