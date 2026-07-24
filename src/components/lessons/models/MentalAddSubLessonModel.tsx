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
  const brightFrame = true;
  if (brightFrame) return <section className={`relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br ${accent} p-4 text-white shadow-2xl sm:p-7`}><header className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-cyan-100">LICZBY I DZIAŁANIA · TEMAT 2</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3><p className="mt-2 max-w-3xl text-sm text-white/90 sm:text-lg">{instruction}</p></div>{progress ? <span className="shrink-0 rounded-2xl bg-cyan-100 px-4 py-2 text-sm font-black text-slate-950">Zadanie {progress.number}/{progress.count}</span> : null}</header><div className="mt-6">{children}</div></section>;
  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7"><div className={`absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-25`} /><header className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 2</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3><p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-lg">{instruction}</p></div>{progress ? <span className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Zadanie {progress.number}/{progress.count}</span> : null}</header><div className="mt-6">{children}</div></section>;
}

function Ready({ correct, answer }: { correct: boolean; answer: string }) {
  const report = useContext(ReporterContext);
  useEffect(() => { report?.(correct, answer); return () => report?.(null); }, [answer, correct, report]);
  if (!report) return null;
  return <p className="mt-5 rounded-2xl bg-cyan-100 px-4 py-3 text-center font-bold text-cyan-950">Odpowiedź gotowa — wyślij ją nauczycielowi.</p>;
}

export function MentalAddSubLessonModel({ seed, taskSeed = seed * 3571, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const progress = questionNumber && questionCount ? { number: questionNumber, count: questionCount } : null;
  const station = ((Math.abs(seed) - 1) % 3) + 1;
  const grade6 = seed >= 600;
  return <ProgressContext.Provider value={progress}><ReporterContext.Provider value={onResultChange}>{station === 1 ? <OperationNamesTask readOnly={readOnly} /> : station === 2 ? <MentalCalculationTask questionNumber={questionNumber} readOnly={readOnly} grade6={grade6} /> : <WordProblemsTask readOnly={readOnly} />}</ReporterContext.Provider></ProgressContext.Provider>;
}

function WordProblemsTask({ readOnly }: { readOnly: boolean }) {
  const [answers, setAnswers] = useState(["", ""]); const change = (index: number, digit: string) => !readOnly && setAnswers((current) => current.map((value, i) => i === index ? (digit === "←" ? value.slice(0, -1) : `${value}${digit}`.slice(0, 2)) : value));
  const problems = [
    "Jedna liczba to 12, a druga jest od niej o 8 większa. Oblicz sumę tych dwóch liczb.",
    "Różnica dwóch liczb wynosi 13, a odjemna jest równa 37. Oblicz, jaki jest odjemnik.",
  ];
  return <Frame title="Suma i różnica — zadania tekstowe" instruction="Przeczytaj treść, nazwij działanie i wpisz odpowiedź." accent="from-amber-500 to-orange-900"><div className="space-y-4">{problems.map((problem, index) => <div key={problem} className="rounded-2xl bg-white/10 p-4"><p className="font-bold">{index + 1}. {problem}</p><p className="mt-3 text-sm font-semibold text-amber-100">Odpowiedź: <span className="text-2xl text-white">{answers[index] || "□"}</span></p><div className="mt-3 flex flex-wrap gap-2">{"0123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly} onClick={() => change(index, digit)} className="h-10 w-10 rounded-lg bg-white font-black text-slate-950">{digit}</button>)}<button type="button" disabled={readOnly} onClick={() => change(index, "←")} className="rounded-lg bg-rose-300 px-3 font-black text-rose-950">←</button></div></div>)}</div>{answers.every(Boolean) ? <Ready correct={answers[0] === "32" && answers[1] === "24"} answer={answers.join(", ")} /> : null}</Frame>;
}

const LABELS = [
  { id: "add-a", text: "składnik" }, { id: "add-b", text: "składnik" }, { id: "sum", text: "suma" },
  { id: "minuend", text: "odjemna" }, { id: "subtrahend", text: "odjemnik" }, { id: "difference", text: "różnica" },
];

function OperationNamesTask({ readOnly }: { readOnly: boolean }) {
  const [placed, setPlaced] = useState<Record<string, string | null>>(Object.fromEntries(LABELS.map((label) => [label.id, null])));
  const [selected, setSelected] = useState<string | null>(null);
  const put = (slot: string, labelId: string) => { if (readOnly) return; setPlaced((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, key === slot ? labelId : value === labelId ? null : value]))); setSelected(null); };
  const complete = Object.values(placed).every(Boolean);
  const correct = new Set([placed["add-a"], placed["add-b"]]).size === 2
    && [placed["add-a"], placed["add-b"]].every((value) => value === "add-a" || value === "add-b")
    && placed.sum === "sum" && placed.minuend === "minuend"
    && placed.subtrahend === "subtrahend" && placed.difference === "difference";
  const equation = (values: string[], slots: string[]) => <div className="grid grid-cols-3 gap-2">{values.map((value, index) => <div key={slots[index]} className="text-center"><div className="rounded-2xl bg-white py-4 text-2xl font-black text-slate-950 sm:text-4xl">{value}</div><button type="button" disabled={readOnly} onDragOver={(event) => event.preventDefault()} onDrop={(event) => put(slots[index]!, event.dataTransfer.getData("text/plain"))} onClick={() => selected && put(slots[index]!, selected)} className="mt-2 min-h-16 w-full rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-2 text-xs font-bold">{LABELS.find((label) => label.id === placed[slots[index]!])?.text ?? "upuść nazwę"}</button></div>)}</div>;
  return <Frame title="Nazwy elementów działań" instruction="Przenieś każdą nazwę do kratki pod odpowiednim elementem działania." accent="from-violet-600 to-indigo-900">
    <div className="space-y-6 rounded-3xl bg-white/5 p-4"><div><p className="mb-2 text-xs font-black uppercase tracking-wide text-cyan-200">Dodawanie</p>{equation(["230", "+ 150", "= 380"], ["add-a", "add-b", "sum"])}</div><div><p className="mb-2 text-xs font-black uppercase tracking-wide text-amber-200">Odejmowanie</p>{equation(["700", "− 240", "= 460"], ["minuend", "subtrahend", "difference"])}</div></div>
    <div className="mt-5 flex flex-wrap justify-center gap-2">{LABELS.filter((label) => !Object.values(placed).includes(label.id)).map((label) => <button type="button" key={label.id} draggable={!readOnly} onDragStart={(event) => event.dataTransfer.setData("text/plain", label.id)} onClick={() => setSelected(label.id)} className={`min-h-12 rounded-xl px-4 text-sm font-black ${selected === label.id ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}>{label.text}</button>)}</div>
    {complete ? <Ready correct={correct} answer={LABELS.map((label) => `${label.text}: ${placed[label.id]}`).join(", ")} /> : null}
  </Frame>;
}

function DigitStepper({ label, value, disabled, onChange }: { label: string; value: number; disabled: boolean; onChange: (value: number) => void }) {
  return <div className={`rounded-2xl border p-3 text-center ${disabled ? "border-slate-600 bg-slate-800 text-slate-500" : "border-white/15 bg-white/10"}`}><p className="text-[10px] font-black uppercase tracking-wide">{label}</p><p className="my-2 text-5xl font-black">{value}</p><div className="grid grid-cols-2 gap-2"><button type="button" disabled={disabled || value <= 0} onClick={() => onChange(value - 1)} className="min-h-12 rounded-xl bg-white/10 text-2xl font-black disabled:cursor-not-allowed disabled:opacity-20">−</button><button type="button" disabled={disabled || value >= 9} onClick={() => onChange(value + 1)} className="min-h-12 rounded-xl bg-white text-2xl font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500">+</button></div></div>;
}

const MENTAL_EXAMPLES = [
  { left: 120, operation: "+", right: 450, expected: 570 },
  { left: 67, operation: "+", right: 48, expected: 115 },
  { left: 54, operation: "−", right: 28, expected: 26 },
  { left: 970, operation: "−", right: 230, expected: 740 },
  { left: 58, operation: "+", right: 17, expected: 75 },
  { left: 150, operation: "+", right: 121, expected: 271 },
  { left: 121, operation: "+", right: 460, expected: 581 },
  { left: 34, operation: "+", right: 29, expected: 63 },
  { left: 76, operation: "−", right: 39, expected: 37 },
  { left: 240, operation: "+", right: 130, expected: 370 },
  { left: 680, operation: "−", right: 240, expected: 440 },
  { left: 42, operation: "+", right: 36, expected: 78 },
  { left: 190, operation: "+", right: 120, expected: 310 },
  { left: 860, operation: "−", right: 420, expected: 440 },
] as const;

const GRADE6_MENTAL_EXAMPLES = [
  { left: 480, operation: "+", right: 120, expected: 600 },
  { left: 750, operation: "−", right: 250, expected: 500 },
  { left: 390, operation: "+", right: 110, expected: 500 },
  { left: 1000, operation: "−", right: 450, expected: 550 },
  { left: 625, operation: "+", right: 375, expected: 1000 },
  { left: 840, operation: "−", right: 240, expected: 600 },
] as const;

function MentalCalculationTask({ questionNumber, readOnly, grade6 }: { questionNumber?: number; readOnly: boolean; grade6: boolean }) {
  const examples = grade6 ? GRADE6_MENTAL_EXAMPLES : MENTAL_EXAMPLES;
  const ordinal = Math.min(Math.max(0, (questionNumber ?? 1) - 1), examples.length - 1);
  const example = examples[ordinal]!;
  const { left, operation, right, expected } = example;
  const [digits, setDigits] = useState([0, 0, 0, 0]); const [touched, setTouched] = useState(false);
  const update = (index: number, value: number) => { if (readOnly) return; setTouched(true); setDigits((current) => current.map((digit, i) => i === index ? value : digit)); };
  const answer = digits[0]! * 1000 + digits[1]! * 100 + digits[2]! * 10 + digits[3]!;
  return <Frame title="Liczenie w pamięci" instruction={grade6 ? "Dobierz wygodną strategię: dopełnij do pełnej setki lub tysiąca albo rozbij jedną liczbę." : "Oblicz wynik. Przykłady są po równo dwu- i trzycyfrowe."} accent="from-emerald-500 to-teal-900">
    <p className="rounded-3xl bg-white/10 p-5 text-center text-4xl font-black sm:text-6xl">{left} {operation} {right} = <span className="inline-block min-w-32 rounded-2xl bg-white px-3 py-2 text-slate-950">{answer}</span></p>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{["tysiące", "setki", "dziesiątki", "jedności"].map((label, index) => <DigitStepper key={label} label={label} value={digits[index]!} disabled={readOnly} onChange={(value) => update(index, value)} />)}</div>
    {touched ? <Ready correct={answer === expected} answer={String(answer)} /> : null}
  </Frame>;
}
