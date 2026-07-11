"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface Props {
  /** Numer stacji (1–10). */
  seed: number;
  /** Ziarno konkretnego zadania w obrębie stacji. */
  taskSeed?: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface FrameProps { index: number; title: string; instruction: string; accent: string; children: ReactNode; }

function Frame({ index, title, instruction, accent, children }: FrameProps) {
  return <section data-review-widget={index} className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7">
    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-25`} />
    <header className="flex items-start justify-between gap-4">
      <div><p className="text-xs font-black tracking-[.22em] text-cyan-200">POWTÓRKA · KLASA IV</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3><p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-lg">{instruction}</p></div>
      <span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-lg font-black">{index}/10</span>
    </header>
    <div className="mt-6">{children}</div>
  </section>;
}

const ResultReporterContext = createContext<((correct: boolean | null, answerLabel?: string) => void) | undefined>(undefined);

function AnswerReady({ correct, answerLabel }: { correct: boolean; answerLabel: string }) {
  const report = useContext(ResultReporterContext);
  useEffect(() => {
    report?.(correct, answerLabel);
    return () => report?.(null);
  }, [answerLabel, correct, report]);
  return <p role="status" className="mt-5 rounded-2xl bg-cyan-100 px-4 py-3 text-center font-bold text-cyan-950">Odpowiedź jest gotowa. Wyślij ją nauczycielowi.</p>;
}

function randomValues(seed: number, count: number): number[] {
  let state = (seed ^ 0x9e3779b9) >>> 0;
  return Array.from({ length: count }, () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  });
}

function pick(seed: number, offset: number, min: number, max: number) {
  return min + Math.floor((randomValues(seed, offset + 1)[offset] ?? 0) * (max - min + 1));
}

export function ClassFourReviewModel({ seed, taskSeed = seed * 1009, readOnly = false, presentationMode = false, onResultChange }: Props) {
  const index = ((Math.abs(seed) - 1) % 10) + 1;
  const common = { readOnly, taskSeed, teacher: presentationMode };
  let widget: ReactNode;
  if (index === 1) widget = <PlaceValueLab {...common} />;
  else if (index === 2) widget = <NumberOrderLab {...common} />;
  else if (index === 3) widget = <NumberLineLab {...common} />;
  else if (index === 4) widget = <RoundingLab {...common} />;
  else if (index === 5) widget = <MoneyLab {...common} />;
  else if (index === 6) widget = <ArrayLab {...common} />;
  else if (index === 7) widget = <DivisionLab {...common} />;
  else if (index === 8) widget = <FractionLab {...common} />;
  else if (index === 9) widget = <ShapeLab {...common} />;
  else widget = <ChartLab {...common} />;
  return <ResultReporterContext.Provider value={onResultChange}>{widget}</ResultReporterContext.Provider>;
}

interface LabProps { readOnly: boolean; taskSeed: number; teacher: boolean; }

function PlaceValueLab({ readOnly, taskSeed }: LabProps) {
  const target = useMemo(() => [pick(taskSeed, 0, 1, 9), pick(taskSeed, 1, 0, 9), pick(taskSeed, 2, 0, 9)], [taskSeed]);
  const [digits, setDigits] = useState([0, 0, 0]);
  const [touched, setTouched] = useState(false);
  const change = (place: number, delta: number) => { if (readOnly) return; setTouched(true); setDigits((current) => current.map((value, i) => i === place ? (value + delta + 10) % 10 : value)); };
  const value = digits[0]! * 100 + digits[1]! * 10 + digits[2]!;
  return <Frame index={1} title="Fabryka wartości" instruction={`Dodaj ${target[0]} setek, ${target[1]} dziesiątek i ${target[2]} jedności.`} accent="from-violet-600 to-indigo-800">
    <div className="grid gap-4 md:grid-cols-3">{["SETKI", "DZIESIĄTKI", "JEDNOŚCI"].map((label, i) => <div key={label} className="rounded-3xl border border-white/15 bg-white/10 p-4 text-center"><p className="text-xs font-black tracking-widest text-white/70">{label}</p><p className="my-3 text-7xl font-black">{digits[i]}</p><div className="grid grid-cols-2 gap-2"><button type="button" disabled={readOnly} onClick={() => change(i, -1)} className="min-h-14 rounded-xl bg-white/10 text-3xl font-black">−</button><button type="button" disabled={readOnly} onClick={() => change(i, 1)} className="min-h-14 rounded-xl bg-white text-3xl font-black text-slate-950">+</button></div></div>)}</div>
    <p className="mt-5 rounded-3xl bg-slate-950/60 p-4 text-center text-5xl font-black tabular-nums">{value}</p>
    {touched ? <AnswerReady correct={digits.every((valueAtPlace, i) => valueAtPlace === target[i])} answerLabel={String(value)} /> : null}
  </Frame>;
}

function NumberOrderLab({ readOnly, taskSeed }: LabProps) {
  const pool = useMemo(() => {
    const base = pick(taskSeed, 0, 20, 85) * 10;
    const values = [base + pick(taskSeed, 1, 1, 9), base + pick(taskSeed, 2, 11, 19), base + pick(taskSeed, 3, 21, 29), base + pick(taskSeed, 4, 31, 39)];
    return [values[2]!, values[0]!, values[3]!, values[1]!];
  }, [taskSeed]);
  const [order, setOrder] = useState<number[]>([]);
  const add = (value: number) => !readOnly && setOrder((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  const correctOrder = [...pool].sort((a, b) => a - b);
  return <Frame index={2} title="Wyścig liczb" instruction="Dotykaj liczby od najmniejszej do największej." accent="from-fuchsia-600 to-purple-900">
    <div className="flex min-h-28 flex-wrap items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/30 p-4">{order.map((value, i) => <button type="button" key={value} onClick={() => add(value)} className="min-h-16 rounded-2xl bg-white px-5 text-3xl font-black text-slate-950"><span className="mr-2 text-sm text-slate-400">{i + 1}</span>{value}</button>)}</div>
    <div className="mt-5 flex flex-wrap justify-center gap-3">{pool.filter((value) => !order.includes(value)).map((value) => <button type="button" key={value} disabled={readOnly} onClick={() => add(value)} className="min-h-16 rounded-2xl border-2 border-white/20 bg-white/10 px-5 text-3xl font-black">{value}</button>)}</div>
    {order.length === pool.length ? <AnswerReady correct={order.every((value, i) => value === correctOrder[i])} answerLabel={order.join(" < ")} /> : null}
  </Frame>;
}

function NumberLineLab({ readOnly, taskSeed }: LabProps) {
  const start = pick(taskSeed, 0, 2, 12) * 10;
  const jump = pick(taskSeed, 1, 2, 5) * 10;
  const values = Array.from({ length: 7 }, (_, i) => start - 10 + i * 10);
  const answer = start + jump;
  const [choice, setChoice] = useState<number | null>(null);
  return <Frame index={3} title="Oś liczbowa" instruction={`Zacznij na ${start}. Wykonaj skok +${jump} i wskaż miejsce lądowania.`} accent="from-cyan-500 to-blue-900">
    <div className="rounded-3xl bg-white/10 px-3 py-10"><div className="relative mx-auto grid max-w-4xl grid-cols-7 border-t-8 border-cyan-200 pt-5">{values.map((value) => <button aria-label={String(value)} type="button" key={value} disabled={readOnly} onClick={() => setChoice(value)} className={`relative mx-auto min-h-14 w-[clamp(2.4rem,8vw,4rem)] rounded-xl text-sm font-black sm:text-xl ${choice === value ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : value === start ? "bg-indigo-300 text-slate-950" : "bg-slate-900/70"}`}><span className="absolute -top-8 left-1/2 h-6 w-1 -translate-x-1/2 bg-cyan-200" />{value}</button>)}</div><p className="mt-5 text-center text-sm font-bold text-cyan-100">Niebieski punkt to start. Każda kreska oznacza 10.</p></div>
    {choice !== null ? <AnswerReady correct={choice === answer} answerLabel={String(choice)} /> : null}
  </Frame>;
}

function RoundingLab({ readOnly, taskSeed }: LabProps) {
  const lower = pick(taskSeed, 0, 1, 8) * 100;
  const number = lower + pick(taskSeed, 1, 11, 89);
  const upper = lower + 100;
  const expected = number - lower < upper - number ? lower : upper;
  const [choice, setChoice] = useState<number | null>(null);
  return <Frame index={4} title="Zaokrąglarka" instruction={`${number} leży między ${lower} i ${upper}. Wybierz bliższą setkę.`} accent="from-sky-500 to-cyan-900">
    <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">{[lower, upper].map((value, index) => <div key={value} className={index ? "sm:col-start-3" : ""}><button type="button" disabled={readOnly} onClick={() => setChoice(value)} className={`min-h-32 w-full rounded-3xl text-5xl font-black ${choice === value ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}>{value}</button></div>)}<div className="row-start-1 rounded-full bg-white px-5 py-4 text-center text-3xl font-black text-slate-950 sm:col-start-2">{number}</div></div>
    {choice !== null ? <AnswerReady correct={choice === expected} answerLabel={String(choice)} /> : null}
  </Frame>;
}

function MoneyLab({ readOnly, taskSeed }: LabProps) {
  const target = pick(taskSeed, 0, 4, 18) * 5;
  const [amount, setAmount] = useState(0);
  const [touched, setTouched] = useState(false);
  const add = (value: number) => { if (readOnly) return; setTouched(true); setAmount((current) => current + value); };
  return <Frame index={5} title="Kasa matematyczna" instruction={`Zapłać dokładnie ${target} zł. Możesz używać banknotów i monet wiele razy.`} accent="from-emerald-500 to-teal-900">
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center"><p className="text-sm font-black text-emerald-100">W KASIE</p><p className="mt-2 text-6xl font-black tabular-nums">{amount} zł</p></div>
    <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">{[1, 2, 5, 10, 20, 50].map((value) => <button type="button" key={value} disabled={readOnly} onClick={() => add(value)} className="min-h-16 rounded-2xl bg-emerald-100 text-xl font-black text-emerald-950">+{value} zł</button>)}</div>
    <button type="button" disabled={readOnly} onClick={() => { setAmount(0); setTouched(false); }} className="mx-auto mt-4 block rounded-xl border border-white/20 px-4 py-2 text-sm font-bold">Wyczyść kasę</button>
    {touched ? <AnswerReady correct={amount === target} answerLabel={`${amount} zł`} /> : null}
  </Frame>;
}

function ArrayLab({ readOnly, taskSeed }: LabProps) {
  const targetRows = pick(taskSeed, 0, 2, 6); const targetCols = pick(taskSeed, 1, 2, 7);
  const [rows, setRows] = useState(1); const [cols, setCols] = useState(1); const [touched, setTouched] = useState(false);
  const change = (kind: "rows" | "cols", delta: number) => { if (readOnly) return; setTouched(true); if (kind === "rows") setRows((value) => Math.max(1, Math.min(7, value + delta))); else setCols((value) => Math.max(1, Math.min(8, value + delta))); };
  return <Frame index={6} title="Rzędy i kolumny" instruction={`Zbuduj ${targetRows} rzędy po ${targetCols} pola.`} accent="from-amber-500 to-orange-900">
    <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]"><div className="grid grid-cols-2 gap-3 lg:grid-cols-1">{[["Rzędy", rows, "rows"], ["Kolumny", cols, "cols"]].map(([label, value, kind]) => <div key={String(label)} className="rounded-2xl bg-white/10 p-3"><p className="text-center text-xs font-black">{label}</p><div className="mt-2 flex items-center justify-center gap-3"><button type="button" onClick={() => change(kind as "rows" | "cols", -1)} className="h-12 w-12 rounded-xl bg-white/10 text-2xl">−</button><b className="w-8 text-center text-2xl">{value}</b><button type="button" onClick={() => change(kind as "rows" | "cols", 1)} className="h-12 w-12 rounded-xl bg-white text-2xl text-slate-950">+</button></div></div>)}</div><div className="flex min-h-64 items-center justify-center overflow-hidden rounded-3xl bg-amber-950/50 p-4"><div style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 2.4rem))` }} className="grid max-w-full gap-2">{Array.from({ length: rows * cols }).map((_, i) => <span key={i} className="h-[clamp(1.4rem,5vw,2.4rem)] w-[clamp(1.4rem,5vw,2.4rem)] rounded-lg border border-amber-100/40 bg-gradient-to-br from-amber-200 to-orange-500" />)}</div></div></div>
    <p className="mt-5 text-center text-3xl font-black">{rows} × {cols} = {rows * cols}</p>{touched ? <AnswerReady correct={rows === targetRows && cols === targetCols} answerLabel={`${rows} × ${cols}`} /> : null}
  </Frame>;
}

function DivisionLab({ readOnly, taskSeed }: LabProps) {
  const packSize = pick(taskSeed, 0, 3, 8); const fullPacks = pick(taskSeed, 1, 2, 6); const remainder = pick(taskSeed, 2, 1, packSize - 1); const total = packSize * fullPacks + remainder;
  const options = Array.from(new Set([remainder, (remainder + 1) % packSize, Math.max(0, remainder - 1)])).slice(0, 3);
  while (options.length < 3) options.push(options.length + packSize);
  const [choice, setChoice] = useState<number | null>(null);
  return <Frame index={7} title="Paczki z resztą" instruction={`${total} elementów pakujemy po ${packSize}. Ile zostanie poza pełnymi paczkami?`} accent="from-orange-500 to-rose-900">
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: fullPacks }).map((_, pack) => <div key={pack} className="flex min-h-20 flex-wrap content-center justify-center gap-1 rounded-2xl border border-white/20 bg-white/10 p-3">{Array.from({ length: packSize }).map((__, i) => <span key={i} className="h-5 w-5 rounded-full bg-orange-300" />)}</div>)}</div><div className="mt-5 flex justify-center gap-2">{Array.from({ length: remainder }).map((_, i) => <span key={i} className="h-9 w-9 rounded-full bg-rose-400" />)}</div>
    <div className="mt-6 flex justify-center gap-3">{options.sort((a, b) => a - b).map((value) => <button type="button" key={value} disabled={readOnly} onClick={() => setChoice(value)} className={`h-16 w-20 rounded-2xl text-2xl font-black ${choice === value ? "bg-rose-300 text-slate-950" : "bg-white/10"}`}>{value}</button>)}</div>{choice !== null ? <AnswerReady correct={choice === remainder} answerLabel={String(choice)} /> : null}
  </Frame>;
}

function FractionLab({ readOnly, taskSeed }: LabProps) {
  const denominator = [4, 6, 8][pick(taskSeed, 0, 0, 2)]!; const numerator = pick(taskSeed, 1, 1, denominator - 1);
  const [selected, setSelected] = useState(0); const [touched, setTouched] = useState(false);
  const change = (delta: number) => { if (readOnly) return; setTouched(true); setSelected((value) => Math.max(0, Math.min(denominator, value + delta))); };
  const fill = selected / denominator * 360;
  return <Frame index={8} title="Pizza ułamków" instruction={`Zaznacz ${numerator}/${denominator} pizzy.`} accent="from-pink-500 to-rose-900">
    <div className="mx-auto h-64 w-64 rounded-full border-8 border-amber-100 shadow-[0_18px_0_#9a3412]" style={{ background: `repeating-conic-gradient(from -90deg, transparent 0deg ${360 / denominator - 2}deg, rgba(120,53,15,.8) ${360 / denominator - 2}deg ${360 / denominator}deg), conic-gradient(from -90deg, #f43f5e 0deg ${fill}deg, #fbbf24 ${fill}deg 360deg)` }} aria-label={`Zaznaczono ${selected} z ${denominator} części`} />
    <div className="mx-auto mt-5 flex max-w-sm items-center justify-center gap-5"><button type="button" disabled={readOnly || selected === 0} onClick={() => change(-1)} className="h-16 w-16 rounded-2xl bg-white/10 text-3xl font-black">−</button><p className="min-w-28 text-center text-5xl font-black">{selected}/{denominator}</p><button type="button" disabled={readOnly || selected === denominator} onClick={() => change(1)} className="h-16 w-16 rounded-2xl bg-white text-3xl font-black text-slate-950">+</button></div>
    {touched ? <AnswerReady correct={selected === numerator} answerLabel={`${selected}/${denominator}`} /> : null}
  </Frame>;
}

const SHAPES = [
  { id: "square", label: "Kwadrat", symbol: "□", equalSides: 4, rightAngles: 4, sides: 4 },
  { id: "rectangle", label: "Prostokąt", symbol: "▭", equalSides: 2, rightAngles: 4, sides: 4 },
  { id: "triangle", label: "Trójkąt", symbol: "△", equalSides: 0, rightAngles: 0, sides: 3 },
  { id: "rhombus", label: "Romb", symbol: "◇", equalSides: 4, rightAngles: 0, sides: 4 },
] as const;

function ShapeLab({ readOnly, taskSeed }: LabProps) {
  const tasks = [
    { prompt: "Wybierz figurę, która ma dokładnie 3 boki.", answer: "triangle" },
    { prompt: "Wybierz figurę z 4 równymi bokami i 4 kątami prostymi.", answer: "square" },
    { prompt: "Wybierz figurę z 4 równymi bokami, ale bez kątów prostych.", answer: "rhombus" },
    { prompt: "Wybierz figurę z 4 kątami prostymi, której nie wszystkie boki są równe.", answer: "rectangle" },
  ];
  const task = tasks[pick(taskSeed, 0, 0, tasks.length - 1)]!; const [selected, setSelected] = useState<string | null>(null);
  return <Frame index={9} title="Park figur" instruction={task.prompt} accent="from-lime-500 to-emerald-900"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{SHAPES.map((shape) => <button type="button" key={shape.id} disabled={readOnly} onClick={() => setSelected(shape.id)} className={`min-h-40 rounded-2xl p-4 ${selected === shape.id ? "bg-lime-300 text-emerald-950 ring-4 ring-white" : "bg-white/10"}`}><span className="block text-7xl">{shape.symbol}</span><b>{shape.label}</b></button>)}</div>{selected ? <AnswerReady correct={selected === task.answer} answerLabel={SHAPES.find((shape) => shape.id === selected)?.label ?? selected} /> : null}</Frame>;
}

function ChartLab({ readOnly, taskSeed }: LabProps) {
  const targets = useMemo(() => [pick(taskSeed, 0, 1, 4) * 10, pick(taskSeed, 1, 2, 6) * 10, pick(taskSeed, 2, 4, 8) * 10], [taskSeed]);
  const [bars, setBars] = useState([0, 0, 0]); const [touched, setTouched] = useState(false);
  const change = (index: number, delta: number) => { if (readOnly) return; setTouched(true); setBars((current) => current.map((value, i) => i === index ? Math.max(0, Math.min(100, value + delta)) : value)); };
  return <Frame index={10} title="Wykres odkrywcy" instruction={`Ustaw miarki: A = ${targets[0]} ml, B = ${targets[1]} ml, C = ${targets[2]} ml.`} accent="from-indigo-500 to-violet-900"><div className="flex h-72 items-end justify-around gap-3 rounded-3xl border-b-4 border-white/40 bg-white/5 px-3 pt-6">{bars.map((value, index) => <div key={index} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"><div className="flex w-full max-w-28 flex-1 items-end rounded-t-2xl border-x-2 border-t-2 border-cyan-100/60 bg-white/5"><div style={{ height: `${value}%` }} className="w-full bg-gradient-to-t from-indigo-600 to-cyan-300 transition-[height]" /></div><b className="mt-2 text-xl">{String.fromCharCode(65 + index)} · {value} ml</b><div className="mt-2 flex gap-1"><button type="button" disabled={readOnly} onClick={() => change(index, -10)} className="h-10 w-10 rounded-lg bg-white/10">−</button><button type="button" disabled={readOnly} onClick={() => change(index, 10)} className="h-10 w-10 rounded-lg bg-white text-slate-950">+</button></div></div>)}</div>{touched ? <AnswerReady correct={bars.every((value, index) => value === targets[index])} answerLabel={`A ${bars[0]} ml, B ${bars[1]} ml, C ${bars[2]} ml`} /> : null}</Frame>;
}
