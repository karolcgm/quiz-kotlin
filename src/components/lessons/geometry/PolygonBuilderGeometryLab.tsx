"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice } from "@/components/lessons/LessonTaskFrame";
import { getPolygonSeedConfig, type PolygonLessonActivity } from "@/lib/math/geometry/polygons";
import type { GeometryLabMode, GeometryLabState } from "@/types/geometry";

export interface PolygonBuilderGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Point = readonly [number, number];
type ShapeKind = "polygon" | "open" | "curved" | "crossed";

const REGULAR_POINTS: Record<number, Point[]> = {
  3: [[160, 32], [278, 218], [42, 218]],
  4: [[60, 45], [265, 45], [250, 215], [42, 215]],
  5: [[160, 25], [285, 112], [238, 235], [82, 235], [35, 112]],
  6: [[90, 35], [230, 35], [290, 130], [230, 225], [90, 225], [30, 130]],
  7: [[160, 22], [265, 74], [292, 188], [218, 236], [102, 236], [28, 188], [55, 74]],
  8: [[92, 28], [228, 28], [292, 92], [292, 190], [228, 234], [92, 234], [28, 190], [28, 92]],
};

const IDENTIFY_TASKS: Array<{ kind: ShapeKind; label: string; isPolygon: boolean }> = [
  { kind: "polygon", label: "zamknięta figura z pięciu odcinków", isPolygon: true },
  { kind: "curved", label: "zamknięta figura z jednym bokiem krzywym", isPolygon: false },
  { kind: "polygon", label: "nieregularny sześciokąt", isPolygon: true },
  { kind: "open", label: "łamana, która nie jest domknięta", isPolygon: false },
  { kind: "polygon", label: "wklęsły pięciokąt bez skrzyżowań", isPolygon: true },
  { kind: "crossed", label: "figura, której odcinki się przecinają", isPolygon: false },
];

const COUNT_TASKS = [3, 6, 4, 7, 5, 8] as const;

const PERIMETER_TASKS = [
  {
    id: "all-sides",
    title: "Wszystkie długości są podane",
    instruction: "Dodaj długości wszystkich boków pięciokąta i oblicz jego obwód.",
    fields: [{ label: "Obwód", value: 30 }],
  },
  {
    id: "opposite-sides",
    title: "Wykorzystaj równe boki prostokąta",
    instruction: "Uzupełnij długości boków leżących naprzeciwko, a następnie oblicz obwód.",
    fields: [{ label: "Dolny bok", value: 9 }, { label: "Prawy bok", value: 5 }, { label: "Obwód", value: 28 }],
  },
] as const;

function PolygonSvg({ sides, diagonal = false, concave = false, className = "" }: { sides: number; diagonal?: boolean; concave?: boolean; className?: string }) {
  const points = concave
    ? ([[45, 55], [268, 38], [194, 128], [268, 222], [45, 205]] as Point[])
    : REGULAR_POINTS[sides] ?? REGULAR_POINTS[5];
  const labels = "ABCDEFGH";
  return (
    <svg viewBox="0 0 320 260" className={`mx-auto block h-auto w-full max-w-[34rem] ${className}`} role="img" aria-label={`${sides}-kąt`}>
      <polygon points={points.map(([x, y]) => `${x},${y}`).join(" ")} fill="#eef2ff" stroke="#172554" strokeWidth="4" strokeLinejoin="round" />
      {diagonal ? <line x1={points[0][0]} y1={points[0][1]} x2={points[2][0]} y2={points[2][1]} stroke="#dc2626" strokeWidth="4" strokeDasharray="10 7" data-polygon-diagonal /> : null}
      {points.map(([x, y], index) => <g key={index}><circle cx={x} cy={y} r="5" fill="#172554" /><text x={x + (x < 160 ? -18 : 10)} y={y + (y < 80 ? -10 : 22)} fontSize="18" fontWeight="800" fill="#172554">{labels[index]}</text></g>)}
    </svg>
  );
}

function InvalidShapeSvg({ kind }: { kind: Exclude<ShapeKind, "polygon"> }) {
  if (kind === "curved") return <svg viewBox="0 0 320 250" className="mx-auto block w-full max-w-[34rem]" role="img" aria-label="Figura z krzywym fragmentem"><path d="M55 205 L65 55 L245 45 Q310 125 250 215 Z" fill="#fff7ed" stroke="#172554" strokeWidth="4" /></svg>;
  if (kind === "open") return <svg viewBox="0 0 320 250" className="mx-auto block w-full max-w-[34rem]" role="img" aria-label="Otwarta łamana"><polyline points="45,205 65,55 245,45 275,195" fill="none" stroke="#172554" strokeWidth="4" strokeLinejoin="round" /></svg>;
  return <svg viewBox="0 0 320 250" className="mx-auto block w-full max-w-[34rem]" role="img" aria-label="Skrzyżowane odcinki"><polygon points="55,45 268,210 52,210 268,45" fill="#fff7ed" stroke="#172554" strokeWidth="4" strokeLinejoin="round" /></svg>;
}

function CountTheory() {
  const examples = [[3, "trójkąt"], [4, "czworokąt"], [5, "pięciokąt"], [6, "sześciokąt"]] as const;
  return <section className="grid gap-5" data-polygon-count-theory>
    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-center">
      <h3 className="text-2xl font-black text-indigo-950">W wielokącie liczby są równe</h3>
      <p className="mt-2 text-lg font-bold">Liczba boków = liczba wierzchołków = liczba kątów.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {examples.map(([sides, name]) => <article key={sides} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center shadow-sm"><PolygonSvg sides={sides} /><h4 className="text-xl font-black capitalize">{name}</h4><p className="font-bold text-slate-700">{sides} boki · {sides} wierzchołki · {sides} kąty</p></article>)}
    </div>
  </section>;
}

function DiagonalTheory() {
  return <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,.8fr)]" data-polygon-diagonal-theory>
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-4"><PolygonSvg sides={5} diagonal /></div>
    <div className="grid content-center gap-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-5">
      <h3 className="text-2xl font-black text-rose-950">Co to jest przekątna?</h3>
      <p className="text-lg font-bold leading-relaxed">Przekątna to odcinek, który łączy dwa <strong>niesąsiednie wierzchołki</strong> wielokąta.</p>
      <p className="rounded-xl bg-white p-3 font-black">Na rysunku czerwona, przerywana przekątna to AC.</p>
      <p className="text-sm font-bold text-rose-900">AB i AE są bokami, ponieważ łączą sąsiednie wierzchołki.</p>
    </div>
  </section>;
}

function RecognitionSeries({ locked, onResultChange }: { locked: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState("");
  const [finished, setFinished] = useState(false);
  const task = IDENTIFY_TASKS[index];
  const correct = choice === task.isPolygon;

  useEffect(() => {
    if (!correct || finished) return;
    const timer = window.setTimeout(() => {
      if (index === IDENTIFY_TASKS.length - 1) { setFinished(true); onResultChange?.(true, "Rozpoznano wszystkie wielokąty."); return; }
      setIndex((value) => value + 1); setChoice(null); setFeedback("");
    }, 650);
    return () => window.clearTimeout(timer);
  }, [correct, finished, index, onResultChange]);

  const check = () => {
    if (choice === null) { setFeedback("Wybierz jedną odpowiedź."); onResultChange?.(false, "Brak odpowiedzi."); return; }
    if (!correct) onResultChange?.(false, `Błędna odpowiedź w zadaniu ${index + 1}.`);
    setFeedback(correct ? (index === IDENTIFY_TASKS.length - 1 ? "Świetnie — rozpoznajesz wielokąty." : "Dobrze! Za chwilę pojawi się następny rysunek.") : "Sprawdź, czy figura jest domknięta i czy jej brzeg składa się wyłącznie z odcinków, które się nie krzyżują.");
  };

  return <section className="grid gap-4" data-polygon-recognition-series>
      <div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-700">Oceń rysunek. Po poprawnej odpowiedzi pojawi się następny.</p><b className="shrink-0 rounded-xl bg-indigo-100 px-3 py-2 text-indigo-950">Zadanie {index + 1}/{IDENTIFY_TASKS.length}</b></div>
      <div className="min-h-[18rem] rounded-2xl border-2 border-slate-200 bg-slate-50 p-3">{task.kind === "polygon" ? <PolygonSvg sides={task.label.includes("sześciokąt") ? 6 : 5} concave={task.label.includes("wklęsły")} /> : <InvalidShapeSvg kind={task.kind} />}</div>
      <p className="text-center text-lg font-black">Czy ten rysunek jest wielokątem?</p>
      <div className="grid grid-cols-2 gap-3"><LessonTaskChoice disabled={locked || finished} selected={choice === true} onClick={() => { setChoice(true); setFeedback(""); }}>Tak</LessonTaskChoice><LessonTaskChoice disabled={locked || finished} selected={choice === false} onClick={() => { setChoice(false); setFeedback(""); }}>Nie</LessonTaskChoice></div>
      <button type="button" disabled={locked || finished} onClick={check} className="min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white disabled:opacity-40">Zatwierdź</button>
      {feedback ? <p role="status" className={`rounded-xl border-2 p-3 text-center font-black ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>{feedback}</p> : null}
  </section>;
}

function CountingSeries({ locked, onResultChange }: { locked: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState(["", "", ""]);
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const sides = COUNT_TASKS[index];

  useEffect(() => {
    if (!correct || finished) return;
    const timer = window.setTimeout(() => {
      if (index === COUNT_TASKS.length - 1) { setFinished(true); onResultChange?.(true, "Policzono elementy wszystkich wielokątów."); return; }
      setIndex((value) => value + 1); setValues(["", "", ""]); setActive(0); setFeedback(""); setCorrect(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [correct, finished, index, onResultChange]);

  const edit = (key: string) => {
    if (locked || finished) return;
    setValues((current) => current.map((value, fieldIndex) => fieldIndex === active ? key === "backspace" ? value.slice(0, -1) : `${value}${key}`.slice(0, 2) : value));
    setFeedback(""); setCorrect(false);
  };
  const check = () => {
    if (values.some((value) => value === "")) { setFeedback("Uzupełnij wszystkie trzy pola."); onResultChange?.(false, "Niepełny wiersz tabeli."); return; }
    const isCorrect = values.every((value) => Number(value) === sides);
    setCorrect(isCorrect);
    if (!isCorrect) onResultChange?.(false, `Błędne liczby w zadaniu ${index + 1}.`);
    setFeedback(isCorrect ? (index === COUNT_TASKS.length - 1 ? "Brawo — poprawnie policzone wszystkie elementy." : "Dobrze! Za chwilę pojawi się następny wielokąt.") : "Policz jeszcze raz boki, zaznaczone wierzchołki i kąty. W każdym wielokącie te trzy liczby są równe.");
  };

  const labels = ["Wierzchołki", "Boki", "Kąty"];
  return <section className="grid gap-4" data-polygon-counting-series>
      <div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-700">Uzupełnij jeden wiersz tabeli. Potem pojawi się następna figura.</p><b className="shrink-0 rounded-xl bg-indigo-100 px-3 py-2 text-indigo-950">Zadanie {index + 1}/{COUNT_TASKS.length}</b></div>
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3"><PolygonSvg sides={sides} concave={sides === 5} /></div>
      <div className="overflow-x-auto rounded-2xl border-2 border-slate-300"><table className="w-full min-w-[34rem] border-collapse text-center"><thead><tr className="bg-slate-100">{labels.map((label) => <th key={label} className="border-r border-slate-300 p-3 text-lg last:border-r-0">{label}</th>)}</tr></thead><tbody><tr>{values.map((value, fieldIndex) => <td key={labels[fieldIndex]} className="border-r border-t border-slate-300 p-3 last:border-r-0"><input aria-label={`Liczba: ${labels[fieldIndex]}`} inputMode="none" readOnly value={value} onClick={() => setActive(fieldIndex)} className={`mx-auto block h-14 w-20 rounded-xl border-4 bg-white text-center text-2xl font-black ${active === fieldIndex ? "border-indigo-600" : "border-slate-300"}`} /></td>)}</tr></tbody></table></div>
      {!locked && !finished ? <LessonNumericKeypad label="Kalkulator do wielokątów" helperText="Kliknij kratkę w tabeli, wpisz liczbę i zatwierdź cały wiersz." onKey={edit} onConfirm={check} /> : null}
      {feedback ? <p role="status" className={`rounded-xl border-2 p-3 text-center font-black ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>{feedback}</p> : null}
  </section>;
}

function PerimeterDiagram({ taskId }: { taskId: (typeof PERIMETER_TASKS)[number]["id"] }) {
  if (taskId === "all-sides") {
    return <svg viewBox="0 0 360 280" className="mx-auto block w-full max-w-[38rem]" role="img" aria-label="Pięciokąt o bokach 7, 5, 6, 4 i 8 centymetrów">
      <polygon points="72,58 250,42 310,137 218,232 48,204" fill="#eef2ff" stroke="#172554" strokeWidth="4" strokeLinejoin="round" />
      <g fill="#172554" fontSize="20" fontWeight="900" textAnchor="middle">
        <text x="160" y="37">7 cm</text>
        <text x="302" y="87">5 cm</text>
        <text x="286" y="199">6 cm</text>
        <text x="132" y="250">4 cm</text>
        <text x="42" y="130">8 cm</text>
      </g>
    </svg>;
  }
  return <svg viewBox="0 0 360 280" className="mx-auto block w-full max-w-[38rem]" role="img" aria-label="Prostokąt z podanym górnym bokiem 9 centymetrów i lewym bokiem 5 centymetrów">
    <rect x="58" y="48" width="244" height="174" rx="2" fill="#eef2ff" stroke="#172554" strokeWidth="4" />
    <g fill="#172554" fontSize="21" fontWeight="900" textAnchor="middle">
      <text x="180" y="36">9 cm</text>
      <text x="32" y="142">5 cm</text>
    </g>
    <g stroke="#be123c" strokeWidth="4" strokeLinecap="round">
      <line x1="178" y1="42" x2="182" y2="54" /><line x1="178" y1="216" x2="182" y2="228" />
      <line x1="52" y1="135" x2="64" y2="139" /><line x1="52" y1="147" x2="64" y2="151" />
      <line x1="296" y1="135" x2="308" y2="139" /><line x1="296" y1="147" x2="308" y2="151" />
    </g>
  </svg>;
}

function PerimeterSeries({ locked, onResultChange }: { locked: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<string[]>(() => PERIMETER_TASKS[0].fields.map(() => ""));
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const task = PERIMETER_TASKS[index];

  useEffect(() => {
    if (!correct || finished) return;
    const timer = window.setTimeout(() => {
      if (index === PERIMETER_TASKS.length - 1) {
        setFinished(true);
        onResultChange?.(true, "Poprawnie obliczono oba obwody.");
        return;
      }
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setValues(PERIMETER_TASKS[nextIndex].fields.map(() => ""));
      setActive(0);
      setFeedback("");
      setCorrect(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [correct, finished, index, onResultChange]);

  const edit = (key: string) => {
    if (locked || finished || correct) return;
    setValues((current) => current.map((value, fieldIndex) => fieldIndex !== active
      ? value
      : key === "backspace" ? value.slice(0, -1) : /^\d$/u.test(key) && value.length < 3 ? `${value}${key}` : value));
    setFeedback("");
  };

  const check = () => {
    if (values.some((value) => !value)) {
      setFeedback("Uzupełnij wszystkie kratki.");
      onResultChange?.(false, "Niepełne obliczenie obwodu.");
      return;
    }
    const isCorrect = task.fields.every((field, fieldIndex) => Number(values[fieldIndex]) === field.value);
    setCorrect(isCorrect);
    if (!isCorrect) {
      setFeedback(index === 0
        ? "Obwód to suma długości wszystkich pięciu boków. Dodaj każdą podaną długość jeden raz."
        : "W prostokącie boki leżące naprzeciwko mają równe długości. Najpierw uzupełnij dwa brakujące boki.");
      onResultChange?.(false, `Błędny obwód w zadaniu ${index + 1}.`);
      return;
    }
    setFeedback(index === PERIMETER_TASKS.length - 1
      ? "✓ Poprawnie. Wykorzystano równość boków leżących naprzeciwko."
      : "✓ Poprawnie. Za chwilę pojawi się drugie zadanie.");
  };

  return <section className="grid gap-4" data-polygon-perimeter-series>
    <div className="flex items-center justify-between gap-3">
      <div><h3 className="text-xl font-black text-indigo-950">{task.title}</h3><p className="mt-1 font-bold text-slate-700">{task.instruction}</p></div>
      <b className="shrink-0 rounded-xl bg-indigo-100 px-3 py-2 text-indigo-950">Zadanie {index + 1}/{PERIMETER_TASKS.length}</b>
    </div>
    <div className="min-h-[18rem] rounded-2xl border-2 border-slate-200 bg-slate-50 p-3"><PerimeterDiagram taskId={task.id} /></div>
    {index === 0
      ? <p className="rounded-xl bg-indigo-50 p-3 text-center text-lg font-black text-indigo-950">7 + 5 + 6 + 4 + 8 = <span className="text-rose-700">?</span> cm</p>
      : <p className="rounded-xl bg-indigo-50 p-3 text-center text-lg font-black text-indigo-950">9 + 5 + <span className="text-rose-700">?</span> + <span className="text-rose-700">?</span> = <span className="text-rose-700">?</span> cm</p>}
    <div className="flex flex-wrap justify-center gap-3" aria-label="Obliczenie obwodu">
      {task.fields.map((field, fieldIndex) => <label key={field.label} className={`grid grid-cols-[auto_5rem_auto] items-center gap-2 rounded-xl border-4 bg-white p-3 font-black ${active === fieldIndex ? "border-indigo-600" : "border-slate-300"}`}>
        <span>{field.label}:</span>
        <input aria-label={field.label} inputMode="none" readOnly value={values[fieldIndex]} onClick={() => setActive(fieldIndex)} className="h-12 w-20 rounded-lg border-2 border-slate-500 text-center text-xl font-black" />
        <span>cm</span>
      </label>)}
    </div>
    {!locked && !finished ? <LessonNumericKeypad label="Kalkulator do obwodu" helperText="Kliknij kratkę, wpisz liczby i zatwierdź całe rozwiązanie." onKey={edit} onConfirm={check} disabled={correct} /> : null}
    {feedback ? <p role="status" className={`rounded-xl border-2 p-3 text-center font-black ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>{feedback}</p> : null}
  </section>;
}

function contentFor(activity: PolygonLessonActivity, locked: boolean, onResultChange?: (correct: boolean | null, answer?: string) => void) {
  if (activity === "builder") return <CountTheory />;
  if (activity === "elements") return <DiagonalTheory />;
  if (activity === "validity" || activity === "stained-glass") return <RecognitionSeries locked={locked} onResultChange={onResultChange} />;
  if (activity === "independent") return <PerimeterSeries locked={locked} onResultChange={onResultChange} />;
  return <CountingSeries locked={locked} onResultChange={onResultChange} />;
}

export function PolygonBuilderGeometryLab({ seed, mode = "practice", readOnly = false, highContrast = false, onResultChange }: PolygonBuilderGeometryLabProps) {
  const activity = useMemo(() => getPolygonSeedConfig(seed).activity, [seed]);
  const locked = readOnly || mode === "demo";
  return <section className={highContrast ? "contrast-125" : ""} data-polygon-builder data-activity={activity} data-mode={mode}>{contentFor(activity, locked, onResultChange)}</section>;
}
