"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface Props {
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

const ReporterContext = createContext<Props["onResultChange"]>(undefined);
const ProgressContext = createContext<{ number: number; count: number } | null>(null);

function Frame({ title, instruction, accent, children }: { title: string; instruction: string; accent: string; children: ReactNode }) {
  const progress = useContext(ProgressContext);
  return <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7">
    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-25`} />
    <header className="flex items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.22em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 1</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3><p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-lg">{instruction}</p></div>{progress ? <span className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Zadanie {progress.number}/{progress.count}</span> : null}</header>
    <div className="mt-6">{children}</div>
  </section>;
}

function Ready({ correct, answer }: { correct: boolean; answer: string }) {
  const report = useContext(ReporterContext);
  useEffect(() => { report?.(correct, answer); return () => report?.(null); }, [answer, correct, report]);
  if (!report) return null;
  return <p className="mt-5 rounded-2xl bg-cyan-100 px-4 py-3 text-center font-bold text-cyan-950">Odpowiedź gotowa — wyślij ją nauczycielowi.</p>;
}

function seeded(seed: number, offset: number) {
  let value = (seed + offset * 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x21f0aaad);
  value = Math.imul(value ^ (value >>> 15), 0x735a2d97);
  return ((value ^ (value >>> 15)) >>> 0) / 4294967296;
}

function integer(seed: number, offset: number, min: number, max: number) {
  return min + Math.floor(seeded(seed, offset) * (max - min + 1));
}

const ONES = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"];
const TEENS = ["dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
const TENS = ["", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
const HUNDREDS = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset"];

function underThousand(value: number) {
  const parts = [HUNDREDS[Math.floor(value / 100)]!];
  const rest = value % 100;
  if (rest >= 10 && rest < 20) parts.push(TEENS[rest - 10]!);
  else { parts.push(TENS[Math.floor(rest / 10)]!); parts.push(ONES[rest % 10]!); }
  return parts.filter(Boolean).join(" ");
}

function thousandForm(value: number) {
  const lastTwo = value % 100; const last = value % 10;
  if (value === 1) return "tysiąc";
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return `${underThousand(value)} tysiące`;
  return `${underThousand(value)} tysięcy`;
}

export function numberToPolishWords(value: number) {
  if (value === 0) return "zero";
  const thousands = Math.floor(value / 1000); const rest = value % 1000;
  return [thousands ? thousandForm(thousands) : "", rest ? underThousand(rest) : ""].filter(Boolean).join(" ");
}

export function NaturalNumbersLessonModel({ seed, taskSeed = seed * 7919, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const station = ((Math.abs(seed) - 1) % 5) + 1;
  const progress = questionNumber && questionCount ? { number: questionNumber, count: questionCount } : null;
  let content: ReactNode;
  if (station === 1) content = <PlaceNamesTask taskSeed={taskSeed} readOnly={readOnly} />;
  else if (station === 2) content = <WordsChoiceTask taskSeed={taskSeed} readOnly={readOnly} direction="number-to-words" />;
  else if (station === 3) content = <WordsChoiceTask taskSeed={taskSeed} readOnly={readOnly} direction="words-to-number" />;
  else if (station === 4) content = <ComparisonScaleTask taskSeed={taskSeed} readOnly={readOnly} />;
  else content = <NumberLinePlacementTask taskSeed={taskSeed} readOnly={readOnly} />;
  return <ProgressContext.Provider value={progress}><ReporterContext.Provider value={onResultChange}>{content}</ReporterContext.Provider></ProgressContext.Provider>;
}

const PLACE_LABELS = ["setki milionów", "dziesiątki milionów", "miliony", "setki tysięcy", "dziesiątki tysięcy", "tysiące", "setki", "dziesiątki", "jedności"];

function PlaceNamesTask({ taskSeed, readOnly }: { taskSeed: number; readOnly: boolean }) {
  const digits = useMemo(() => Array.from({ length: 9 }, (_, index) => integer(taskSeed, index, index === 0 ? 1 : 0, 9)), [taskSeed]);
  const [placed, setPlaced] = useState<Array<string | null>>(Array(9).fill(null));
  const [selected, setSelected] = useState<string | null>(null);
  const put = (index: number, label: string) => { if (readOnly) return; setPlaced((current) => current.map((value, i) => i === index ? label : value === label ? null : value)); setSelected(null); };
  const complete = placed.every(Boolean); const correct = placed.every((label, index) => label === PLACE_LABELS[index]);
  return <Frame title="Domy cyfr" instruction="Przenieś nazwy rzędów pod właściwe cyfry. Cyfry są pogrupowane po trzy." accent="from-emerald-500 to-teal-900"> 
    <div className="grid grid-cols-1 gap-3 rounded-3xl bg-white/5 p-3 sm:grid-cols-3 sm:gap-4">{[0, 1, 2].map((group) => <div key={group} className="rounded-2xl border border-white/15 bg-white/10 p-2"><p className="mb-2 text-center text-[10px] font-black uppercase tracking-wide text-cyan-200">{["grupa milionów", "grupa tysięcy", "grupa jedności"][group]}</p><div className="grid grid-cols-3 gap-1">{digits.slice(group * 3, group * 3 + 3).map((digit, local) => { const index = group * 3 + local; return <div key={index} className="text-center"><div className="rounded-xl bg-white py-3 text-3xl font-black text-slate-950">{digit}</div><button type="button" disabled={readOnly} onDragOver={(event) => event.preventDefault()} onDrop={(event) => put(index, event.dataTransfer.getData("text/plain"))} onClick={() => selected && put(index, selected)} className="mt-2 min-h-20 w-full rounded-xl border-2 border-dashed border-white/25 bg-slate-900/70 p-1 text-[10px] font-bold sm:text-xs">{placed[index] ?? "upuść nazwę"}</button></div>; })}</div></div>)}</div>
    <div className="mt-5 flex flex-wrap justify-center gap-2">{PLACE_LABELS.filter((label) => !placed.includes(label)).map((_, index, remaining) => remaining[(index + integer(taskSeed, 20, 1, 8)) % remaining.length]!).map((label) => <button type="button" key={label} draggable={!readOnly} onDragStart={(event) => event.dataTransfer.setData("text/plain", label)} onClick={() => setSelected(label)} className={`min-h-11 rounded-xl px-3 text-xs font-black ${selected === label ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}>{label}</button>)}</div>
    {complete ? <Ready correct={correct} answer={placed.join(" | ")} /> : null}
  </Frame>;
}

function taskNumber(seed: number) { return integer(seed, 0, 1, 100) * 1000 + integer(seed, 1, 0, 999); }

function WordsChoiceTask({ taskSeed, readOnly, direction }: { taskSeed: number; readOnly: boolean; direction: "number-to-words" | "words-to-number" }) {
  const target = Math.min(100000, Math.max(1000, taskNumber(taskSeed)));
  const candidates = useMemo(() => {
    const values = new Set<number>([target]);
    for (const delta of [1000, -1000, 100, -100, 2000, -2000, 10]) values.add(Math.min(100000, Math.max(1000, target + delta)));
    return Array.from(values).slice(0, 4);
  }, [target]);
  const options = useMemo(() => [...candidates].sort((a, b) => seeded(taskSeed, a % 17) - seeded(taskSeed, b % 17)), [candidates, taskSeed]);
  const [choice, setChoice] = useState<number | null>(null);
  const prompt = direction === "number-to-words" ? target.toLocaleString("pl-PL") : numberToPolishWords(target);
  return <Frame title={direction === "number-to-words" ? "Liczba zapisana słownie" : "Liczba zapisana cyframi"} instruction={direction === "number-to-words" ? "Wybierz poprawny zapis słowny liczby." : "Wybierz poprawny zapis cyfrowy liczby."} accent="from-violet-600 to-fuchsia-900">
    <p className="rounded-3xl bg-white/10 p-5 text-center text-2xl font-black sm:text-4xl">{prompt}</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{options.map((value, index) => <button type="button" key={value} disabled={readOnly} onClick={() => setChoice(value)} className={`min-h-20 rounded-2xl p-4 text-left text-sm font-bold sm:text-base ${choice === value ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}><span className="mr-3 text-lg font-black">{String.fromCharCode(65 + index)}.</span>{direction === "number-to-words" ? numberToPolishWords(value) : value.toLocaleString("pl-PL")}</button>)}</div>
    {choice !== null ? <Ready correct={choice === target} answer={direction === "number-to-words" ? numberToPolishWords(choice) : String(choice)} /> : null}
  </Frame>;
}

function ComparisonScaleTask({ taskSeed, readOnly }: { taskSeed: number; readOnly: boolean }) {
  const left = Math.min(100000, taskNumber(taskSeed)); const right = Math.min(100000, Math.max(1000, left + (integer(taskSeed, 3, 0, 1) ? 1 : -1) * integer(taskSeed, 4, 10, 9000)));
  const expected = left > right ? ">" : left < right ? "<" : "="; const [choice, setChoice] = useState<string | null>(null);
  const tilt = left > right ? -7 : left < right ? 7 : 0;
  return <Frame title="Waga liczb" instruction="Wybierz znak, który tworzy prawdziwe porównanie." accent="from-amber-500 to-orange-900">
    <div className="rounded-3xl bg-white p-3 text-slate-950 [perspective:900px]"><svg viewBox="0 0 600 310" className="w-full" role="img" aria-label={`Waga porównuje ${left} i ${right}`}><defs><linearGradient id="beam3d" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#94a3b8"/><stop offset="1" stopColor="#334155"/></linearGradient><linearGradient id="pan3d" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fde68a"/><stop offset="1" stopColor="#d97706"/></linearGradient></defs><ellipse cx="300" cy="286" rx="100" ry="15" fill="#cbd5e1"/><path d="M270 270 L290 145 L310 145 L330 270Z" fill="url(#beam3d)"/><g transform={`rotate(${tilt} 300 135)`} className="transition-transform duration-700"><rect x="65" y="125" width="470" height="22" rx="10" fill="url(#beam3d)"/><line x1="145" y1="140" x2="145" y2="210" stroke="#475569" strokeWidth="5"/><line x1="455" y1="140" x2="455" y2="210" stroke="#475569" strokeWidth="5"/><ellipse cx="145" cy="220" rx="100" ry="22" fill="url(#pan3d)"/><ellipse cx="455" cy="220" rx="100" ry="22" fill="url(#pan3d)"/><text x="145" y="215" textAnchor="middle" className="fill-slate-950 text-2xl font-black">{left.toLocaleString("pl-PL")}</text><text x="455" y="215" textAnchor="middle" className="fill-slate-950 text-2xl font-black">{right.toLocaleString("pl-PL")}</text></g></svg></div>
    <div className="mt-5 grid grid-cols-3 gap-3">{["<", "=", ">"].map((sign) => <button type="button" key={sign} disabled={readOnly} onClick={() => setChoice(sign)} className={`min-h-16 rounded-2xl text-4xl font-black ${choice === sign ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}>{sign}</button>)}</div>
    {choice ? <Ready correct={choice === expected} answer={`${left} ${choice} ${right}`} /> : null}
  </Frame>;
}

function NumberLinePlacementTask({ taskSeed, readOnly }: { taskSeed: number; readOnly: boolean }) {
  const step = integer(taskSeed, 0, 1, 5) * 1000; const start = integer(taskSeed, 1, 1, 10) * 10000; const targetIndex = integer(taskSeed, 2, 1, 5); const target = start + targetIndex * step;
  const [choice, setChoice] = useState<number | null>(null);
  return <Frame title="Miejsce na osi" instruction={`Wskaż na osi miejsce liczby ${target.toLocaleString("pl-PL")}. Każdy odstęp to ${step.toLocaleString("pl-PL")}.`} accent="from-cyan-500 to-blue-900">
    <div className="overflow-x-auto rounded-3xl bg-white/10 px-3 py-10"><div className="relative mx-auto grid min-w-[34rem] max-w-4xl grid-cols-7 border-t-8 border-cyan-200 pt-5">{Array.from({ length: 7 }, (_, index) => { const value = start + index * step; return <button type="button" key={value} disabled={readOnly} onClick={() => setChoice(value)} className={`relative mx-auto min-h-14 w-16 rounded-xl text-sm font-black ${choice === value ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-slate-900/70"}`}><span className="absolute -top-8 left-1/2 h-6 w-1 -translate-x-1/2 bg-cyan-200" />{index === 0 || index === 6 ? value.toLocaleString("pl-PL") : "?"}</button>; })}</div></div>
    {choice !== null ? <Ready correct={choice === target} answer={String(choice)} /> : null}
  </Frame>;
}
