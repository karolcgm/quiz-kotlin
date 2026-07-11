"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Props {
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export interface OrderTask {
  expression: string;
  operators: string[];
  executionOrder: string[];
  result: number;
  numbers: number[];
}

const ReporterContext = createContext<Props["onResultChange"]>(undefined);
const ProgressContext = createContext<{ number: number; count: number } | null>(null);

function random(seed: number, offset: number) {
  let value = (seed + offset * 2654435761) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 2246822507);
  return ((value ^ (value >>> 13)) >>> 0) / 4294967296;
}

function integer(seed: number, offset: number, min: number, max: number) {
  return min + Math.floor(random(seed, offset) * (max - min + 1));
}

/** Tworzy działania z różnymi operatorami i liczbami nie większymi niż 99. */
export function createOrderTask(seed: number, operatorCount: 2 | 3): OrderTask {
  const variant = integer(seed, 1, 0, 3);
  const a = integer(seed, 2, 8, 24);
  const b = integer(seed, 3, 2, 9);
  const c = integer(seed, 4, 2, 9);
  const d = integer(seed, 5, 2, 9);

  if (operatorCount === 2) {
    if (variant === 0) return { expression: `${a} + ${b} × ${c}`, operators: ["+", "×"], executionOrder: ["×", "+"], result: a + b * c, numbers: [a, b, c] };
    if (variant === 1) return { expression: `${a} × ${b} − ${c}`, operators: ["×", "−"], executionOrder: ["×", "−"], result: a * b - c, numbers: [a, b, c] };
    if (variant === 2) return { expression: `${a + b} − ${b} + ${c}`, operators: ["−", "+"], executionOrder: ["−", "+"], result: a + c, numbers: [a + b, b, c] };
    return { expression: `${a} × ${c} : ${c}`, operators: ["×", ":"], executionOrder: ["×", ":"], result: a, numbers: [a, c, c] };
  }

  if (variant === 0) return { expression: `${a} + ${b} × ${c} − ${d}`, operators: ["+", "×", "−"], executionOrder: ["×", "+", "−"], result: a + b * c - d, numbers: [a, b, c, d] };
  if (variant === 1) return { expression: `${a} × ${b} + ${c * d} : ${d}`, operators: ["×", "+", ":"], executionOrder: ["×", ":", "+"], result: a * b + c, numbers: [a, b, c * d, d] };
  if (variant === 2) return { expression: `${a + b} − ${b} + ${c} × ${d}`, operators: ["−", "+", "×"], executionOrder: ["×", "−", "+"], result: a + c * d, numbers: [a + b, b, c, d] };
  return { expression: `${a} + ${b} − ${c * d} : ${d}`, operators: ["+", "−", ":"], executionOrder: [":", "+", "−"], result: a + b - c, numbers: [a, b, c * d, d] };
}

function Frame({ title, instruction, children }: { title: string; instruction: string; children: ReactNode }) {
  const progress = useContext(ProgressContext);
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-600 via-indigo-700 to-cyan-700 opacity-30" />
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 4</p>
          <h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-lg">{instruction}</p>
        </div>
        {progress ? <span className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Zadanie {progress.number}/{progress.count}</span> : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Ready({ correct, answer }: { correct: boolean; answer: string }) {
  const report = useContext(ReporterContext);
  useEffect(() => {
    report?.(correct, answer);
    return () => report?.(null);
  }, [answer, correct, report]);
  if (!report) return null;
  return <p className="mt-5 rounded-2xl bg-cyan-100 px-4 py-3 text-center font-bold text-cyan-950">Odpowiedź gotowa — wyślij ją nauczycielowi.</p>;
}

function OrderedSlots({ items, expected, readOnly, slotLabel }: { items: string[]; expected: string[]; readOnly: boolean; slotLabel: string }) {
  const [placed, setPlaced] = useState<(string | null)[]>(Array(expected.length).fill(null));
  const [selected, setSelected] = useState<string | null>(null);
  const put = (slot: number, value: string) => {
    if (readOnly || !items.includes(value)) return;
    setPlaced((current) => current.map((item, index) => index === slot ? value : item === value ? null : item));
    setSelected(null);
  };
  const complete = placed.every(Boolean);
  const correct = complete && placed.every((value, index) => value === expected[index]);
  return <>
    <div className={`grid gap-3 ${expected.length === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
      {placed.map((value, index) => <button type="button" key={index} disabled={readOnly} onDragOver={(event) => event.preventDefault()} onDrop={(event) => put(index, event.dataTransfer.getData("text/plain"))} onClick={() => selected && put(index, selected)} className="min-h-24 rounded-2xl border-2 border-dashed border-white/30 bg-white/10 p-3 text-center font-black"><span className="block text-xs uppercase text-cyan-200">{index + 1}. {slotLabel}</span><span className="mt-2 block text-lg">{value ?? "upuść tutaj"}</span></button>)}
    </div>
    <div className="mt-5 flex flex-wrap justify-center gap-3">
      {items.filter((item) => !placed.includes(item)).map((item) => <button type="button" key={item} draggable={!readOnly} onDragStart={(event) => event.dataTransfer.setData("text/plain", item)} onClick={() => !readOnly && setSelected(item)} className={`min-h-14 rounded-2xl px-5 text-lg font-black ${selected === item ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white text-slate-950"}`}>{item}</button>)}
    </div>
    {complete ? <Ready correct={correct} answer={placed.join(" → ")} /> : null}
  </>;
}

function RuleRace({ readOnly }: { readOnly: boolean }) {
  const expected = ["Nawiasy", "Potęgowanie", "Mnożenie i dzielenie", "Dodawanie i odejmowanie"];
  return <Frame title="Wyścig reguł" instruction="Ustaw etapy od tego, który wykonujemy jako pierwszy, do tego, który wykonujemy jako ostatni."><OrderedSlots items={[expected[2]!, expected[0]!, expected[3]!, expected[1]!]} expected={expected} readOnly={readOnly} slotLabel="miejsce" /></Frame>;
}

function OperatorOrder({ taskSeed, readOnly, questionNumber }: { taskSeed: number; readOnly: boolean; questionNumber: number }) {
  const count: 2 | 3 = questionNumber % 2 === 0 ? 3 : 2;
  const task = createOrderTask(taskSeed, count);
  return <Frame title="Który znak jest następny?" instruction="Przenieś wszystkie znaki działania w takiej kolejności, w jakiej należy je wykonać. Każdy znak występuje tylko raz."><p className="mb-6 rounded-3xl bg-white/10 p-5 text-center text-4xl font-black sm:text-6xl">{task.expression}</p><OrderedSlots items={[...task.operators].reverse()} expected={task.executionOrder} readOnly={readOnly} slotLabel="wykonuję" /></Frame>;
}

function ResultTask({ taskSeed, readOnly, questionNumber }: { taskSeed: number; readOnly: boolean; questionNumber: number }) {
  const task = createOrderTask(taskSeed, questionNumber % 2 === 0 ? 3 : 2);
  const [answer, setAnswer] = useState("");
  const numericAnswer = Number(answer);
  const complete = answer.trim() !== "" && Number.isInteger(numericAnswer);
  return <Frame title="Oblicz wynik" instruction="Zastosuj właściwą kolejność działań i wpisz wynik."><p className="rounded-3xl bg-white/10 p-5 text-center text-4xl font-black sm:text-6xl">{task.expression} = ?</p><label className="mx-auto mt-6 block max-w-sm text-center"><span className="text-sm font-black uppercase tracking-wide text-cyan-200">Twój wynik</span><input aria-label="Twój wynik" type="number" inputMode="numeric" value={answer} disabled={readOnly} onChange={(event) => setAnswer(event.target.value)} className="mt-2 min-h-20 w-full rounded-2xl border-4 border-white/20 bg-white px-4 text-center text-5xl font-black text-slate-950 outline-none focus:border-cyan-300" /></label>{complete ? <Ready correct={numericAnswer === task.result} answer={answer} /> : null}</Frame>;
}

export function OrderOfOperationsLessonModel({ seed, taskSeed = seed * 6427, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const station = ((Math.abs(seed) - 1) % 3) + 1;
  const progress = questionNumber && questionCount ? { number: questionNumber, count: questionCount } : null;
  const task = station === 1
    ? <RuleRace readOnly={readOnly} />
    : station === 2
      ? <OperatorOrder taskSeed={taskSeed} readOnly={readOnly} questionNumber={questionNumber ?? 1} />
      : <ResultTask taskSeed={taskSeed} readOnly={readOnly} questionNumber={questionNumber ?? 1} />;
  return <ProgressContext.Provider value={progress}><ReporterContext.Provider value={onResultChange}>{task}</ReporterContext.Provider></ProgressContext.Provider>;
}
