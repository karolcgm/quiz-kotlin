"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Props {
  seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}
const ReporterContext = createContext<Props["onResultChange"]>(undefined);
const ProgressContext = createContext<{ number: number; count: number } | null>(null);

function Frame({ title, instruction, accent, children }: { title: string; instruction: string; accent: string; children: ReactNode }) {
  const progress = useContext(ProgressContext);
  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7"><div className={`absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-25`} /><header className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 3</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3><p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-lg">{instruction}</p></div>{progress ? <span className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Zadanie {progress.number}/{progress.count}</span> : null}</header><div className="mt-6">{children}</div></section>;
}
function Ready({ correct, answer }: { correct: boolean; answer: string }) { const report = useContext(ReporterContext); useEffect(() => { report?.(correct, answer); return () => report?.(null); }, [answer, correct, report]); if (!report) return null; return <p className="mt-5 rounded-2xl bg-cyan-100 px-4 py-3 text-center font-bold text-cyan-950">Odpowiedź gotowa — wyślij ją nauczycielowi.</p>; }
function random(seed: number, offset: number) { let value = (seed + offset * 2654435761) >>> 0; value = Math.imul(value ^ (value >>> 16), 2246822507); return ((value ^ (value >>> 13)) >>> 0) / 4294967296; }
function integer(seed: number, offset: number, min: number, max: number) { return min + Math.floor(random(seed, offset) * (max - min + 1)); }

export function MentalMulDivLessonModel({ seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const station = ((Math.abs(seed) - 1) % 7) + 1; const progress = questionNumber && questionCount ? { number: questionNumber, count: questionCount } : null;
  let task: ReactNode;
  const seriesSeed = seed * 1000 + (questionNumber ?? 1);
  if (station === 1) task = <NamesTask readOnly={readOnly} />;
  else if (station === 2) task = <MentalTask taskSeed={seriesSeed} readOnly={readOnly} variant={(questionNumber ?? 1) - 1} />;
  else if (station === 3) task = <RemainderTask readOnly={readOnly} questionNumber={questionNumber ?? 1} />;
  else task = <UnitTask station={station} taskSeed={seriesSeed} readOnly={readOnly} questionNumber={questionNumber ?? 1} />;
  return <ProgressContext.Provider value={progress}><ReporterContext.Provider value={onResultChange}>{task}</ReporterContext.Provider></ProgressContext.Provider>;
}

const NAMES = [
  { id: "factor-a", text: "czynnik" }, { id: "factor-b", text: "czynnik" }, { id: "product", text: "iloczyn" },
  { id: "dividend", text: "dzielna" }, { id: "divisor", text: "dzielnik" }, { id: "quotient", text: "iloraz" },
];
function NamesTask({ readOnly }: { readOnly: boolean }) {
  const [placed, setPlaced] = useState<Record<string, string | null>>(Object.fromEntries(NAMES.map((item) => [item.id, null]))); const [selected, setSelected] = useState<string | null>(null);
  const put = (slot: string, id: string) => { if (readOnly) return; setPlaced((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, key === slot ? id : value === id ? null : value]))); setSelected(null); };
  const complete = Object.values(placed).every(Boolean); const factors = [placed["factor-a"], placed["factor-b"]];
  const correct = new Set(factors).size === 2 && factors.every((value) => value === "factor-a" || value === "factor-b") && placed.product === "product" && placed.dividend === "dividend" && placed.divisor === "divisor" && placed.quotient === "quotient";
  const equation = (values: string[], slots: string[]) => <div className="grid grid-cols-3 gap-2">{values.map((value, index) => <div key={slots[index]} className="text-center"><div className="rounded-2xl bg-white py-4 text-2xl font-black text-slate-950 sm:text-4xl">{value}</div><button type="button" disabled={readOnly} onDragOver={(event) => event.preventDefault()} onDrop={(event) => put(slots[index]!, event.dataTransfer.getData("text/plain"))} onClick={() => selected && put(slots[index]!, selected)} className="mt-2 min-h-16 w-full rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-2 text-xs font-bold">{NAMES.find((item) => item.id === placed[slots[index]!])?.text ?? "upuść nazwę"}</button></div>)}</div>;
  return <Frame title="Nazwy elementów działań" instruction="Przenieś nazwy do kratek pod właściwymi elementami mnożenia i dzielenia." accent="from-violet-600 to-indigo-900"><div className="space-y-6 rounded-3xl bg-white/5 p-4"><div><p className="mb-2 text-xs font-black uppercase text-cyan-200">Mnożenie</p>{equation(["7", "× 8", "= 56"], ["factor-a", "factor-b", "product"])}</div><div><p className="mb-2 text-xs font-black uppercase text-amber-200">Dzielenie</p>{equation(["56", ": 7", "= 8"], ["dividend", "divisor", "quotient"])}</div></div><div className="mt-5 flex flex-wrap justify-center gap-2">{NAMES.filter((item) => !Object.values(placed).includes(item.id)).map((item) => <button type="button" key={item.id} draggable={!readOnly} onDragStart={(event) => event.dataTransfer.setData("text/plain", item.id)} onClick={() => setSelected(item.id)} className={`min-h-12 rounded-xl px-4 text-sm font-black ${selected === item.id ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}>{item.text}</button>)}</div>{complete ? <Ready correct={correct} answer="nazwy mnożenia i dzielenia" /> : null}</Frame>;
}

function PlaceStepper({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (value: number) => void }) { return <div className={`rounded-2xl border p-2 text-center ${disabled ? "border-slate-700 bg-slate-800 text-slate-500" : "border-white/15 bg-white/10"}`}><p className="min-h-6 text-[9px] font-black uppercase tracking-wide">{label}</p><p className="my-1 text-4xl font-black">{value}</p><div className="grid grid-cols-2 gap-1"><button type="button" disabled={disabled || value <= 0} onClick={() => onChange(value - 1)} className="min-h-11 rounded-lg bg-white/10 text-xl font-black disabled:opacity-20">−</button><button type="button" disabled={disabled || value >= 9} onClick={() => onChange(value + 1)} className="min-h-11 rounded-lg bg-white text-xl font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-500">+</button></div></div>; }
function DigitAnswer({ expected, readOnly }: { expected: number; readOnly: boolean }) {
  const [digits, setDigits] = useState([0, 0, 0, 0, 0]); const [touched, setTouched] = useState(false); const value = digits[0]! * 10000 + digits[1]! * 1000 + digits[2]! * 100 + digits[3]! * 10 + digits[4]!;
  return <><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{["dziesiątki tysięcy", "tysiące", "setki", "dziesiątki", "jedności"].map((label, index) => <PlaceStepper key={label} label={label} value={digits[index]!} disabled={readOnly} onChange={(digit) => { setTouched(true); setDigits((current) => current.map((item, i) => i === index ? digit : item)); }} />)}</div><p className="mt-4 rounded-2xl bg-white/10 p-3 text-center text-4xl font-black">Wynik: {value}</p>{touched ? <Ready correct={value === expected} answer={String(value)} /> : null}</>;
}

function MentalTask({ taskSeed, readOnly, variant }: { taskSeed: number; readOnly: boolean; variant: number }) {
  let left: number; let right: number; let operator: "×" | ":" | "^"; let expected: number;
  const kind = variant === 2 ? 5 : ((variant % 6) + 6) % 6;
  if (kind === 5) { left = 30; right = 2; operator = "^"; expected = 900; }
  else if (kind === 0) { left = integer(taskSeed, 1, 10, 99); right = integer(taskSeed, 2, 2, 9); operator = "×"; expected = left * right; }
  else if (kind === 1) { left = integer(taskSeed, 1, 2, 9); right = integer(taskSeed, 2, 10, 99); operator = "×"; expected = left * right; }
  else if (kind === 2) { left = integer(taskSeed, 1, 2, 9) * 10; right = integer(taskSeed, 2, 2, 9) * 10; operator = "×"; expected = left * right; }
  else if (kind === 3) { right = integer(taskSeed, 1, 2, 9); expected = integer(taskSeed, 2, 2, 11); left = right * expected; operator = ":"; }
  else { right = integer(taskSeed, 1, 2, 9) * 10; const minQuotient = Math.max(2, Math.ceil(100 / right)); const maxQuotient = Math.min(9, Math.floor(990 / right)); expected = integer(taskSeed, 2, minQuotient, maxQuotient); left = right * expected; operator = ":"; }
  return <Frame title="Mnożenie i dzielenie w pamięci" instruction="Oblicz działanie i zbuduj wynik cyframi wartości pozycyjnych." accent="from-emerald-500 to-teal-900"><p className="mb-5 rounded-3xl bg-white/10 p-5 text-center text-4xl font-black sm:text-6xl">{operator === "^" ? <>{left}<sup className="ml-1 align-super text-2xl">{right}</sup></> : <>{left} {operator} {right}</>} = □</p><DigitAnswer expected={expected} readOnly={readOnly} /></Frame>;
}

function Counter({ label, value, max, readOnly, onChange }: { label: string; value: number; max: number; readOnly: boolean; onChange: (value: number) => void }) { return <div className="rounded-3xl bg-white/10 p-5 text-center"><p className="text-xs font-black uppercase tracking-wide text-cyan-200">{label}</p><p className="my-4 text-7xl font-black">{value}</p><div className="grid grid-cols-2 gap-3"><button type="button" disabled={readOnly || value <= 0} onClick={() => onChange(value - 1)} className="min-h-14 rounded-xl bg-white/10 text-3xl font-black disabled:opacity-20">−</button><button type="button" disabled={readOnly || value >= max} onClick={() => onChange(value + 1)} className="min-h-14 rounded-xl bg-white text-3xl font-black text-slate-950 disabled:opacity-30">+</button></div></div>; }
function RemainderTask({ readOnly, questionNumber }: { readOnly: boolean; questionNumber: number }) {
  const tasks = [{ divisor: 5, quotient: 10, remainder: 3 }, { divisor: 6, quotient: 12, remainder: 2 }, { divisor: 7, quotient: 12, remainder: 5 }] as const;
  const task = tasks[Math.max(0, Math.min(questionNumber - 1, tasks.length - 1))]!;
  const { divisor, quotient, remainder } = task; const dividend = divisor * quotient + remainder;
  const [whole, setWhole] = useState(0); const [rest, setRest] = useState(0); const [touched, setTouched] = useState(false);
  return <Frame title="Dzielenie z resztą" instruction="Ustaw liczbę pełnych całości i pozostałą resztę." accent="from-orange-500 to-rose-900"><p className="rounded-3xl bg-white/10 p-5 text-center text-4xl font-black sm:text-6xl">{dividend} : {divisor} = ?</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Counter label="Całych" value={whole} max={20} readOnly={readOnly} onChange={(value) => { setTouched(true); setWhole(value); }} /><Counter label="Reszty" value={rest} max={9} readOnly={readOnly} onChange={(value) => { setTouched(true); setRest(value); }} /></div>{touched ? <Ready correct={whole === quotient && rest === remainder} answer={`${whole} całych i ${rest} reszty`} /> : null}</Frame>;
}

function UnitTask({ station, taskSeed, readOnly, questionNumber }: { station: number; taskSeed: number; readOnly: boolean; questionNumber: number }) {
  let source: number; let sourceUnit: string; let targetUnit: string; let expected: number; let title: string;
  if (station === 4) { source = integer(taskSeed, 1, 1, 80); sourceUnit = "zł"; targetUnit = "gr"; expected = source * 100; title = "Złotówki na grosze"; }
  else if (station === 5) { expected = integer(taskSeed, 1, 1, 80); source = expected * 100; sourceUnit = "gr"; targetUnit = "zł"; title = "Grosze na złotówki"; }
  else if (station === 6 && questionNumber % 2 === 1) { source = integer(taskSeed, 1, 1, 80); sourceUnit = "m"; targetUnit = "cm"; expected = source * 100; title = "Jednostki długości"; }
  else if (station === 6) { expected = integer(taskSeed, 1, 1, 80); source = expected * 100; sourceUnit = "cm"; targetUnit = "m"; title = "Jednostki długości"; }
  else if (questionNumber % 2 === 1) { source = integer(taskSeed, 1, 1, 20); sourceUnit = "kg"; targetUnit = "g"; expected = source * 1000; title = "Jednostki masy"; }
  else { expected = integer(taskSeed, 1, 1, 20); source = expected * 1000; sourceUnit = "g"; targetUnit = "kg"; title = "Jednostki masy"; }
  return <Frame title={title} instruction="Zamień jednostki. Wynik jest liczbą całkowitą — bez ułamków dziesiętnych." accent="from-sky-500 to-indigo-900"><p className="mb-5 rounded-3xl bg-white/10 p-5 text-center text-4xl font-black sm:text-6xl">{source.toLocaleString("pl-PL")} {sourceUnit} = □ {targetUnit}</p><DigitAnswer expected={expected} readOnly={readOnly} /></Frame>;
}
