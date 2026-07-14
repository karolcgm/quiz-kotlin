"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { NumericLessonKeypad } from "@/components/lessons/models/NumericLessonKeypad";

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export const DIVISOR_ORBIT_TASKS = [
  { center: 18, candidates: [1, 2, 3, 4, 6, 7, 9, 10, 12, 18, 24, 36] },
  { center: 24, candidates: [1, 2, 3, 4, 5, 6, 8, 9, 12, 16, 24, 48] },
  { center: 30, candidates: [1, 2, 3, 5, 6, 7, 10, 12, 15, 20, 30, 60] },
] as const;

export const GCD_TASKS = [
  { a: 12, b: 18, aDivisors: [1, 2, 3, 4, 6, 12], bDivisors: [1, 2, 3, 6, 9, 18], result: 6 },
  { a: 16, b: 24, aDivisors: [1, 2, 4, 8, 16], bDivisors: [1, 2, 3, 4, 6, 8, 12, 24], result: 8 },
  { a: 20, b: 30, aDivisors: [1, 2, 4, 5, 10, 20], bDivisors: [1, 2, 3, 5, 6, 10, 15, 30], result: 10 },
] as const;

function parseNumberLine(value: string) {
  return value.split(/[\s,;]+/).filter(Boolean).map(Number).filter(Number.isFinite);
}

function sameNumbers(left: readonly number[], right: readonly number[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function editText(value: string, key: string) {
  return key === "backspace" ? value.slice(0, -1) : `${value}${key}`;
}

function Feedback({ correct }: { correct: boolean | null }) {
  if (correct === null) return null;
  return <p role="status" className={`mt-4 rounded-2xl px-4 py-3 text-center font-black ${correct ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{correct ? "Brawo! Każda grupa powstaje bez reszty." : "Sprawdź jeszcze raz: po podziale nie może zostać żaden element."}</p>;
}

function IntroTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const expectedDivisors = [1, 2, 4, 7, 14, 28];
  const arrangements = [
    { label: "1 × 28", valid: true }, { label: "2 × 14", valid: true }, { label: "4 × 7", valid: true },
    { label: "3 × 9", valid: false }, { label: "5 × 6", valid: false },
  ];
  const [divisors, setDivisors] = useState("");
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const toggle = (index: number) => { const next = new Set(selected); if (next.has(index)) next.delete(index); else next.add(index); setSelected(next); reset(); };
  const applyKey = (key: string) => { setDivisors((value) => editText(value, key)); reset(); };
  const check = () => {
    const correctArrangements = arrangements.every((item, index) => selected.has(index) === item.valid);
    const correct = sameNumbers(parseNumberLine(divisors), expectedDivisors) && correctArrangements;
    setChecked(correct); onResultChange?.(correct, `Dzielniki 28: ${divisors}; układy: ${[...selected].map((index) => arrangements[index]?.label).join(", ")}`);
  };
  return <div className="space-y-5">
    <article className="overflow-hidden rounded-3xl bg-white text-slate-950 shadow-xl">
      <div data-lesson-hero="divisors" className="relative aspect-[4/3] min-h-60 w-full overflow-hidden bg-emerald-50 sm:aspect-[16/7] sm:max-h-96"><Image src="/lessons/illustrations/number-properties/chrupek-divisors-badges-v1.webp" alt="Chrupek układa kolorowe okrągłe odznaki w równych rzędach" fill priority sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover object-[center_34%]" /></div>
      <div className="p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700">1. Dzielniki w życiu</p><h4 className="mt-2 text-2xl font-black">Odznaki w równych rzędach</h4><p className="mt-3 leading-relaxed text-slate-700">Chrupek ma <b>28 odznak</b>. Chce układać je w równe rzędy tak, aby wykorzystać wszystkie odznaki. Liczba odznak w jednym rzędzie jest <b>dzielnikiem liczby 28</b>, jeśli 28 można przez nią podzielić bez reszty.</p><p className="mt-4 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-950"><b>Dzielnik liczby naturalnej</b> to liczba naturalna, przez którą daną liczbę można podzielić bez reszty.</p><label className="mt-4 block font-black">Wypisz rosnąco wszystkie dzielniki 28<input aria-label="Wszystkie dzielniki liczby 28" inputMode="none" disabled={readOnly} value={divisors} onChange={(event) => { setDivisors(event.target.value); reset(); }} placeholder="1, 2, …" className="mt-2 min-h-14 w-full rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 text-lg font-bold outline-none focus:border-emerald-700" /></label><div className="mt-3"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} allowSeparator label="Klawiatura — przecinkiem oddzielaj dzielniki" /></div></div>
    </article>
    <article className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">2. Prostokąty bez reszty</p><h4 className="mt-2 text-2xl font-black">Które układy wykorzystają dokładnie 28 odznak?</h4><p className="mt-2 text-slate-200">Zaznacz wszystkie poprawne układy: liczba rzędów × liczba odznak w rzędzie.</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{arrangements.map((item, index) => <button key={item.label} type="button" aria-pressed={selected.has(index)} disabled={readOnly} onClick={() => toggle(index)} className={`min-h-16 rounded-2xl border-2 text-xl font-black ${selected.has(index) ? "border-amber-200 bg-amber-300 text-slate-950" : "border-white/25 bg-white/10"}`}>{item.label}</button>)}</div><button type="button" disabled={readOnly || !divisors.trim()} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-300 px-5 text-lg font-black text-emerald-950 disabled:opacity-35">Sprawdź oba zadania</button><Feedback correct={checked} /></article>
  </div>;
}

function OrbitTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = DIVISOR_ORBIT_TASKS[taskIndex % DIVISOR_ORBIT_TASKS.length]!;
  const [selected, setSelected] = useState<Set<number>>(() => new Set()); const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const toggle = (value: number) => { if (readOnly) return; const next = new Set(selected); if (next.has(value)) next.delete(value); else next.add(value); setSelected(next); setChecked(null); onResultChange?.(null); };
  const check = () => { const expected = task.candidates.filter((value) => task.center % value === 0); const correct = expected.length === selected.size && expected.every((value) => selected.has(value)); setChecked(correct); onResultChange?.(correct, [...selected].sort((a, b) => a - b).join(", ")); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-emerald-950 via-slate-950 to-indigo-950 p-5 text-white shadow-2xl sm:p-8"><div className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold text-emerald-200">Dzielnik mieści się w liczbie całkowitą liczbę razy.</p><h4 className="mt-1 text-2xl font-black sm:text-4xl">Znajdź wszystkie dzielniki liczby {task.center}</h4></div><div className="mx-auto mt-7 grid max-w-3xl grid-cols-3 gap-3 sm:grid-cols-4"><div className="col-span-3 row-start-2 mx-auto grid h-24 w-24 place-items-center rounded-full border-8 border-emerald-200 bg-emerald-400 text-4xl font-black text-slate-950 shadow-[0_0_40px_rgba(52,211,153,.55)] sm:col-span-4">{task.center}</div>{task.candidates.map((value) => <button key={value} type="button" aria-pressed={selected.has(value)} disabled={readOnly} onClick={() => toggle(value)} className={`min-h-16 rounded-full border-4 text-xl font-black transition ${selected.has(value) ? "scale-105 border-amber-200 bg-amber-300 text-slate-950" : "border-white/30 bg-white/10 hover:bg-white/20"}`}>{value}</button>)}</div><button type="button" disabled={readOnly} onClick={check} className="mx-auto mt-7 block min-h-14 w-full max-w-3xl rounded-2xl bg-white px-5 text-lg font-black text-emerald-950 disabled:opacity-35">Sprawdź zaznaczone dzielniki</button><Feedback correct={checked} /></article>;
}

function AcronymTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const answers = ["Największy wspólny dzielnik", "Najmniejszy wspólny dzielnik", "Największa wspólna dziesiątka", "Następny właściwy dzielnik"];
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  return <article className="rounded-[2rem] bg-gradient-to-br from-emerald-950 to-indigo-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-sm font-black uppercase tracking-[.18em] text-emerald-200">Najpierw rozszyfruj nazwę</p><h4 className="mt-2 text-3xl font-black">Co oznacza skrót NWD?</h4><p className="mt-2 text-emerald-100">NWD(12, 18) to największa liczba, przez którą można podzielić zarówno 12, jak i 18 bez reszty.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{answers.map((answer, index) => <button key={answer} type="button" disabled={readOnly} onClick={() => { setSelected(index); onResultChange?.(index === 0, answer); }} className={`min-h-20 rounded-2xl border-2 px-4 text-left font-black ${selected === index ? index === 0 ? "border-emerald-300 bg-emerald-300 text-emerald-950" : "border-rose-300 bg-rose-300 text-rose-950" : "border-white/20 bg-white/10"}`}>{answer}</button>)}</div><Feedback correct={selected === null ? null : selected === 0} /></article>;
}

type GcdTarget = "lineA" | "lineB" | "result";

function GcdCalculationTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = GCD_TASKS[taskIndex % GCD_TASKS.length]!;
  const [lineA, setLineA] = useState(""); const [lineB, setLineB] = useState(""); const [result, setResult] = useState("");
  const [active, setActive] = useState<GcdTarget>("lineA"); const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const change = (setter: (value: string) => void, value: string) => { setter(value); reset(); };
  const applyKey = (key: string) => { if (readOnly || (active === "result" && key === ",")) return; reset(); if (active === "lineA") setLineA((value) => editText(value, key)); if (active === "lineB") setLineB((value) => editText(value, key)); if (active === "result") setResult((value) => editText(value, key)); };
  const check = () => { const correct = sameNumbers(parseNumberLine(lineA), task.aDivisors) && sameNumbers(parseNumberLine(lineB), task.bDivisors) && Number(result) === task.result; setChecked(correct); onResultChange?.(correct, `D(${task.a}): ${lineA}; D(${task.b}): ${lineB}; NWD=${result}`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-indigo-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-sm font-black text-emerald-200">Wypisz dzielniki pierwszej liczby, a bezpośrednio pod nimi dzielniki drugiej liczby. Największa liczba obecna na obu listach to NWD.</p><h4 className="mt-2 text-3xl font-black">Oblicz NWD({task.a}, {task.b})</h4><div className="mt-6 space-y-4 rounded-3xl bg-white p-5 text-slate-950"><label className="block font-black">Dzielniki {task.a}<input aria-label={`Dzielniki liczby ${task.a}`} inputMode="none" disabled={readOnly} value={lineA} onFocus={() => setActive("lineA")} onClick={() => setActive("lineA")} onChange={(event) => change(setLineA, event.target.value)} placeholder="1, 2, …" className={`mt-2 min-h-14 w-full rounded-xl border-2 px-4 text-lg font-bold outline-none ${active === "lineA" ? "border-emerald-600 bg-emerald-100 ring-4 ring-emerald-200" : "border-emerald-200 bg-emerald-50"}`} /></label><label className="block font-black">Dzielniki {task.b}<input aria-label={`Dzielniki liczby ${task.b}`} inputMode="none" disabled={readOnly} value={lineB} onFocus={() => setActive("lineB")} onClick={() => setActive("lineB")} onChange={(event) => change(setLineB, event.target.value)} placeholder="1, 2, …" className={`mt-2 min-h-14 w-full rounded-xl border-2 px-4 text-lg font-bold outline-none ${active === "lineB" ? "border-indigo-600 bg-indigo-100 ring-4 ring-indigo-200" : "border-indigo-200 bg-indigo-50"}`} /></label><label className="flex flex-wrap items-center gap-3 text-xl font-black">NWD({task.a}, {task.b}) = <input aria-label={`NWD liczb ${task.a} i ${task.b}`} inputMode="none" disabled={readOnly} value={result} onFocus={() => setActive("result")} onClick={() => setActive("result")} onChange={(event) => change(setResult, event.target.value.replace(/\D/g, ""))} className={`min-h-14 w-32 rounded-xl border-2 px-4 text-center text-2xl font-black ${active === "result" ? "border-amber-600 bg-amber-100 ring-4 ring-amber-200" : "border-amber-300 bg-amber-50"}`} /></label><NumericLessonKeypad onKey={applyKey} disabled={readOnly} allowSeparator label="Klawiatura — przecinkiem oddzielaj kolejne dzielniki" /></div><button type="button" disabled={readOnly || !lineA.trim() || !lineB.trim() || !result} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-emerald-300 px-5 text-lg font-black text-emerald-950 disabled:opacity-35">Sprawdź NWD</button><Feedback correct={checked} /></article>;
}

function StoryTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [sets, setSets] = useState(""); const [teal, setTeal] = useState(""); const [coral, setCoral] = useState(""); const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const change = (setter: (value: string) => void, value: string) => { setter(value.replace(/\D/g, "")); setChecked(null); onResultChange?.(null); };
  const check = () => { const correct = Number(sets) === 12 && Number(teal) === 2 && Number(coral) === 3; setChecked(correct); onResultChange?.(correct, `${sets} zestawów: ${teal} turkusowe, ${coral} koralowe`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-emerald-50 to-cyan-100 p-5 text-slate-950 shadow-2xl sm:p-8"><p className="text-sm font-black uppercase tracking-[.18em] text-emerald-700">Pracownia Chrupka</p><h4 className="mt-2 text-3xl font-black">Najwięcej identycznych zestawów</h4><p className="mt-4 max-w-3xl text-lg leading-relaxed">Chrupek ma <b>24 turkusowe</b> i <b>36 koralowych</b> odznak. Chce przygotować jak najwięcej jednakowych zestawów, zużywając wszystkie odznaki. Ile zestawów zrobi i ile odznak każdego koloru będzie w jednym zestawie?</p><div className="mt-6 grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-3"><label className="font-black">Liczba zestawów<input aria-label="Liczba jednakowych zestawów" inputMode="numeric" disabled={readOnly} value={sets} onChange={(event) => change(setSets, event.target.value)} className="mt-1 min-h-14 w-full rounded-xl border-2 border-amber-300 bg-amber-50 px-3 text-center text-2xl font-black" /></label><label className="font-black">Turkusowych w zestawie<input aria-label="Turkusowych odznak w zestawie" inputMode="numeric" disabled={readOnly} value={teal} onChange={(event) => change(setTeal, event.target.value)} className="mt-1 min-h-14 w-full rounded-xl border-2 border-cyan-300 bg-cyan-50 px-3 text-center text-2xl font-black" /></label><label className="font-black">Koralowych w zestawie<input aria-label="Koralowych odznak w zestawie" inputMode="numeric" disabled={readOnly} value={coral} onChange={(event) => change(setCoral, event.target.value)} className="mt-1 min-h-14 w-full rounded-xl border-2 border-rose-300 bg-rose-50 px-3 text-center text-2xl font-black" /></label></div><button type="button" disabled={readOnly || !sets || !teal || !coral} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35">Sprawdź rozwiązanie</button><p className="mt-3 text-sm font-bold text-slate-600">Podpowiedź: liczba zestawów to NWD(24, 36).</p><Feedback correct={checked} /></article>;
}

export function DivisorsLessonModel({ seed = 1, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const station = Math.min(5, Math.max(1, seed)); const taskIndex = Math.max(0, questionNumber - 1);
  return <section data-seed={seed} className="rounded-[2.25rem] bg-gradient-to-br from-emerald-700 via-teal-700 to-indigo-700 p-3 shadow-2xl sm:p-5"><header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-100">Dział II · Temat 2</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">Dzielniki</h3></div>{questionCount > 1 ? <b className="rounded-2xl bg-white/20 px-4 py-2">Zadanie {questionNumber}/{questionCount}</b> : null}</header>{station === 1 ? <IntroTask readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 2 ? <OrbitTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 3 && taskIndex === 0 ? <AcronymTask readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 3 && taskIndex > 0 ? <GcdCalculationTask key={taskIndex} taskIndex={taskIndex - 1} readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 4 ? <StoryTask readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 5 ? <GcdCalculationTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}</section>;
}
