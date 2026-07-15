"use client";

import { useEffect, useMemo, useState } from "react";
import { NumericLessonKeypad } from "@/components/lessons/models/NumericLessonKeypad";
import { primeFactors, validateFactorLadder } from "@/components/lessons/models/PrimeFactorizationLessonModel";

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export const GCD_LCM_FACTOR_TASKS = [
  { a: 12, b: 18, gcd: 6, lcm: 36, guided: true },
  { a: 18, b: 30, gcd: 6, lcm: 90, guided: true },
  { a: 24, b: 36, gcd: 12, lcm: 72, guided: true },
  { a: 30, b: 45, gcd: 15, lcm: 90, guided: false },
  { a: 28, b: 42, gcd: 14, lcm: 84, guided: false },
] as const;

type FactorTask = { a: number; b: number; gcd: number; lcm: number; guided?: boolean };
type Method = "nwd" | "nww";
type LadderName = "a" | "b";
type ActiveTarget =
  | { kind: "cell"; ladder: LadderName; side: "left" | "right"; index: number }
  | { kind: "product"; method: Method; index: number }
  | { kind: "result"; method: Method };

function sameFactors(values: string[], expected: number[]) {
  return values.length === expected.length
    && values.every(Boolean)
    && values.map(Number).sort((a, b) => a - b).every((value, index) => value === [...expected].sort((a, b) => a - b)[index]);
}

function commonFactorIndexes(a: readonly string[] | readonly number[], b: readonly string[] | readonly number[]) {
  const usedB = new Set<number>();
  const indexesA = new Set<number>();
  const indexesB = new Set<number>();
  a.forEach((rawValue, indexA) => {
    const value = Number(rawValue);
    if (!value) return;
    const indexB = b.findIndex((candidate, candidateIndex) => !usedB.has(candidateIndex) && Number(candidate) === value);
    if (indexB < 0) return;
    usedB.add(indexB);
    indexesA.add(indexA);
    indexesB.add(indexB);
  });
  return { a: indexesA, b: indexesB };
}

function AcronymTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const isGcd = taskIndex % 2 === 0;
  const answers = isGcd
    ? ["Największy wspólny dzielnik", "Najmniejszy wspólny dzielnik", "Największa wspólna dziesiątka", "Następny właściwy dzielnik"]
    : ["Najmniejsza wspólna wielokrotność", "Największa wspólna wielokrotność", "Najmniejszy wspólny wynik", "Następna wielka wartość"];
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);

  return <article className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-5 text-white shadow-2xl sm:p-8">
    <p className="text-xs font-black uppercase tracking-[.18em] text-violet-200">Najpierw znaczenie skrótu</p>
    <h4 className="mt-2 text-3xl font-black">Co oznacza skrót {isGcd ? "NWD" : "NWW"}?</h4>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{answers.map((answer, index) => <button key={answer} type="button" disabled={readOnly} onClick={() => { setSelected(index); onResultChange?.(index === 0, answer); }} className={`min-h-20 rounded-2xl border-2 p-4 text-left font-black ${selected === index ? index === 0 ? "border-emerald-200 bg-emerald-300 text-emerald-950" : "border-rose-200 bg-rose-300 text-rose-950" : "border-white/20 bg-white/10"}`}>{answer}</button>)}</div>
    {selected !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 font-black ${selected === 0 ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{selected === 0 ? isGcd ? "NWD tworzymy ze wspólnych czynników obu liczb." : "NWW tworzymy z czynników potrzebnych do odtworzenia obu liczb." : "Przeczytaj uważnie każde słowo skrótu."}</p> : null}
  </article>;
}

function Ladder({ ladder, label, initial, left, right, active, method, common, crossed, readOnly, onFocus, onUpdate }: {
  ladder: LadderName;
  label: string;
  initial: number;
  left: string[];
  right: string[];
  active: ActiveTarget;
  method: Method | null;
  common: Set<number>;
  crossed: Set<number>;
  readOnly: boolean;
  onFocus: (side: "left" | "right", index: number) => void;
  onUpdate: (side: "left" | "right", index: number, value: string) => void;
}) {
  return <div className="rounded-3xl bg-white p-4 text-slate-950">
    <h5 className="mb-3 text-center text-xl font-black">{label}: {initial}</h5>
    <div className="grid grid-cols-[1fr_4px_1fr] items-center gap-x-3 gap-y-2 text-center">
      {Array.from({ length: right.length + 1 }, (_, row) => <div key={row} className="contents">
        {row === 0 ? <span className="grid min-h-11 place-items-center rounded-xl bg-indigo-100 text-xl font-black">{initial}</span> : <input aria-label={`${label}, wynik dzielenia, wiersz ${row}`} inputMode="none" disabled={readOnly} value={left[row - 1]} onFocus={() => onFocus("left", row - 1)} onClick={() => onFocus("left", row - 1)} onChange={(event) => onUpdate("left", row - 1, event.target.value)} className={`min-h-11 w-full rounded-xl border-2 text-center text-lg font-black ${active.kind === "cell" && active.ladder === ladder && active.side === "left" && active.index === row - 1 ? "border-indigo-600 bg-indigo-100 ring-4 ring-indigo-200" : "border-indigo-200 bg-indigo-50"}`} />}
        <span className="h-full min-h-11 bg-slate-950" aria-hidden />
        {row < right.length ? <input aria-label={`${label}, dzielnik pierwszy, wiersz ${row + 1}`} inputMode="none" disabled={readOnly} value={right[row]} onFocus={() => onFocus("right", row)} onClick={() => onFocus("right", row)} onChange={(event) => onUpdate("right", row, event.target.value)} className={`min-h-11 w-full rounded-xl border-2 text-center text-lg font-black transition ${active.kind === "cell" && active.ladder === ladder && active.side === "right" && active.index === row ? "border-emerald-600 bg-emerald-100 ring-4 ring-emerald-200" : method === "nwd" && common.has(row) ? "border-amber-500 bg-amber-200 ring-4 ring-amber-100" : method === "nww" && crossed.has(row) ? "border-rose-400 bg-rose-100 text-slate-400 line-through decoration-4" : method === "nww" ? "border-cyan-500 bg-cyan-100 ring-2 ring-cyan-100" : "border-emerald-200 bg-emerald-50"}`} /> : <span className="grid min-h-11 place-items-center text-xs font-black text-slate-500">koniec</span>}
      </div>)}
    </div>
  </div>;
}

function ProductRow({ method, task, values, result, active, guided, readOnly, onFactorFocus, onFactorChange, onResultFocus, onResultChange }: {
  method: Method;
  task: FactorTask;
  values: string[];
  result: string;
  active: ActiveTarget;
  guided: boolean;
  readOnly: boolean;
  onFactorFocus: (index: number) => void;
  onFactorChange: (index: number, value: string) => void;
  onResultFocus: () => void;
  onResultChange: (value: string) => void;
}) {
  const isNwd = method === "nwd";
  const productComplete = values.every(Boolean);
  const focused = active.kind !== "cell" && active.method === method;
  return <section data-active-calculation={focused ? method : undefined} className={`rounded-3xl border-4 p-4 transition ${focused ? isNwd ? "border-amber-500 bg-amber-50 shadow-lg" : "border-cyan-500 bg-cyan-50 shadow-lg" : "border-slate-200 bg-white"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h5 className="text-xl font-black">{isNwd ? `NWD(${task.a}, ${task.b})` : `NWW(${task.a}, ${task.b})`}</h5>
      <span className={`rounded-full px-3 py-1 text-xs font-black ${isNwd ? "bg-amber-200 text-amber-950" : "bg-cyan-200 text-cyan-950"}`}>
        {guided ? isNwd ? "wspólne czynniki" : "czynniki nieskreślone" : "wybór samodzielny"}
      </span>
    </div>
    <p className="mt-2 text-sm font-bold text-slate-600">
      {guided ? "1. Wpisz czynniki widoczne w rozkładach. 2. Oblicz ich iloczyn." : "1. Samodzielnie wybierz potrzebne czynniki. 2. Oblicz ich iloczyn."}
    </p>
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xl font-black">
      {values.map((value, index) => <div key={index} className="contents">{index > 0 ? <span aria-hidden>×</span> : null}<input aria-label={`${isNwd ? "NWD" : "NWW"}, czynnik iloczynu ${index + 1}`} inputMode="none" disabled={readOnly} value={value} onFocus={() => onFactorFocus(index)} onClick={() => onFactorFocus(index)} onChange={(event) => onFactorChange(index, event.target.value.replace(/\D/g, "").slice(0, 2))} className={`min-h-12 w-16 rounded-xl border-2 text-center font-black ${active.kind === "product" && active.method === method && active.index === index ? isNwd ? "border-amber-600 bg-amber-100 ring-4 ring-amber-200" : "border-cyan-600 bg-cyan-100 ring-4 ring-cyan-200" : "border-slate-200 bg-white"}`} /></div>)}
      <span aria-hidden>=</span>
      <input aria-label={`Wynik ${isNwd ? "NWD" : "NWW"} liczb ${task.a} i ${task.b}`} inputMode="none" disabled={readOnly || !productComplete} value={result} onFocus={onResultFocus} onClick={onResultFocus} onChange={(event) => onResultChange(event.target.value.replace(/\D/g, "").slice(0, 4))} className={`min-h-12 w-24 rounded-xl border-2 text-center text-2xl font-black disabled:cursor-not-allowed disabled:bg-slate-100 ${active.kind === "result" && active.method === method ? isNwd ? "border-amber-600 bg-amber-100 ring-4 ring-amber-200" : "border-cyan-600 bg-cyan-100 ring-4 ring-cyan-200" : "border-slate-300 bg-white"}`} />
    </div>
  </section>;
}

function FactorCalculation({ task, mode = "both", guided = true, readOnly, onResultChange }: { task: FactorTask; mode?: "both" | "nwd"; guided?: boolean } & Pick<Props, "readOnly" | "onResultChange">) {
  const expectedA = useMemo(() => primeFactors(task.a), [task.a]);
  const expectedB = useMemo(() => primeFactors(task.b), [task.b]);
  const expectedCommon = useMemo(() => commonFactorIndexes(expectedA, expectedB), [expectedA, expectedB]);
  const smaller: LadderName = task.a <= task.b ? "a" : "b";
  const expectedNwdFactors = useMemo(() => expectedA.filter((_, index) => expectedCommon.a.has(index)), [expectedA, expectedCommon]);
  const expectedNwwFactors = useMemo(() => {
    const smallerFactors = smaller === "a" ? expectedA : expectedB;
    const largerFactors = smaller === "a" ? expectedB : expectedA;
    const crossed = smaller === "a" ? expectedCommon.a : expectedCommon.b;
    return [...largerFactors, ...smallerFactors.filter((_, index) => !crossed.has(index))];
  }, [expectedA, expectedB, expectedCommon, smaller]);
  const [leftA, setLeftA] = useState<string[]>(() => Array(expectedA.length).fill(""));
  const [rightA, setRightA] = useState<string[]>(() => Array(expectedA.length).fill(""));
  const [leftB, setLeftB] = useState<string[]>(() => Array(expectedB.length).fill(""));
  const [rightB, setRightB] = useState<string[]>(() => Array(expectedB.length).fill(""));
  const [nwdProduct, setNwdProduct] = useState<string[]>(() => Array(expectedNwdFactors.length).fill(""));
  const [nwwProduct, setNwwProduct] = useState<string[]>(() => Array(expectedNwwFactors.length).fill(""));
  const [nwd, setNwd] = useState("");
  const [nww, setNww] = useState("");
  const [active, setActive] = useState<ActiveTarget>({ kind: "cell", ladder: "a", side: "right", index: 0 });
  const [checked, setChecked] = useState<boolean | null>(null);
  const currentCommon = useMemo(() => commonFactorIndexes(rightA, rightB), [rightA, rightB]);
  const activeMethod = active.kind === "cell" ? null : active.method;
  const guidanceMethod = guided ? activeMethod : null;
  const crossedA = guidanceMethod === "nww" && smaller === "a" ? currentCommon.a : new Set<number>();
  const crossedB = guidanceMethod === "nww" && smaller === "b" ? currentCommon.b : new Set<number>();

  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const updateCell = (ladder: LadderName, side: "left" | "right", index: number, value: string) => {
    const setter = ladder === "a" ? side === "left" ? setLeftA : setRightA : side === "left" ? setLeftB : setRightB;
    setter((values) => values.map((item, itemIndex) => itemIndex === index ? value.replace(/\D/g, "").slice(0, 3) : item));
    reset();
  };
  const updateProduct = (method: Method, index: number, value: string) => {
    const setter = method === "nwd" ? setNwdProduct : setNwwProduct;
    setter((values) => values.map((item, itemIndex) => itemIndex === index ? value : item));
    reset();
  };
  const applyKey = (key: string) => {
    reset();
    if (active.kind === "cell") {
      const setter = active.ladder === "a" ? active.side === "left" ? setLeftA : setRightA : active.side === "left" ? setLeftB : setRightB;
      setter((values) => values.map((value, index) => index === active.index ? key === "backspace" ? value.slice(0, -1) : `${value}${key}`.slice(0, 3) : value));
      return;
    }
    if (active.kind === "product") {
      const values = active.method === "nwd" ? nwdProduct : nwwProduct;
      updateProduct(active.method, active.index, key === "backspace" ? (values[active.index] ?? "").slice(0, -1) : `${values[active.index] ?? ""}${key}`.slice(0, 2));
      return;
    }
    const setter = active.method === "nwd" ? setNwd : setNww;
    setter((value) => key === "backspace" ? value.slice(0, -1) : `${value}${key}`.slice(0, 4));
  };
  const laddersComplete = [...leftA, ...rightA, ...leftB, ...rightB].every(Boolean);
  const nwdComplete = nwdProduct.every(Boolean) && Boolean(nwd);
  const nwwComplete = nwwProduct.every(Boolean) && Boolean(nww);
  const complete = laddersComplete && nwdComplete && (mode === "nwd" || nwwComplete);
  const check = () => {
    const laddersCorrect = validateFactorLadder(task.a, leftA, rightA) && validateFactorLadder(task.b, leftB, rightB);
    const nwdCorrect = sameFactors(nwdProduct, expectedNwdFactors) && Number(nwd) === task.gcd;
    const nwwCorrect = mode === "nwd" || sameFactors(nwwProduct, expectedNwwFactors) && Number(nww) === task.lcm;
    const correct = laddersCorrect && nwdCorrect && nwwCorrect;
    setChecked(correct);
    onResultChange?.(correct, `${task.a}: ${rightA.join("×")}; ${task.b}: ${rightB.join("×")}; NWD=${nwd}${mode === "both" ? `; NWW=${nww}` : ""}`);
  };

  return <div>
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <Ladder ladder="a" label="Pierwsza liczba" initial={task.a} left={leftA} right={rightA} active={active} method={guidanceMethod} common={currentCommon.a} crossed={crossedA} readOnly={Boolean(readOnly)} onFocus={(side, index) => setActive({ kind: "cell", ladder: "a", side, index })} onUpdate={(side, index, value) => updateCell("a", side, index, value)} />
      <Ladder ladder="b" label="Druga liczba" initial={task.b} left={leftB} right={rightB} active={active} method={guidanceMethod} common={currentCommon.b} crossed={crossedB} readOnly={Boolean(readOnly)} onFocus={(side, index) => setActive({ kind: "cell", ladder: "b", side, index })} onUpdate={(side, index, value) => updateCell("b", side, index, value)} />
    </div>
    <div className="mt-5 grid gap-4 rounded-3xl bg-slate-50 p-4 text-slate-950 lg:grid-cols-2">
      <ProductRow method="nwd" task={task} values={nwdProduct} result={nwd} active={active} guided={guided} readOnly={Boolean(readOnly)} onFactorFocus={(index) => setActive({ kind: "product", method: "nwd", index })} onFactorChange={(index, value) => updateProduct("nwd", index, value)} onResultFocus={() => setActive({ kind: "result", method: "nwd" })} onResultChange={(value) => { setNwd(value); reset(); }} />
      {mode === "both" ? <ProductRow method="nww" task={task} values={nwwProduct} result={nww} active={active} guided={guided} readOnly={Boolean(readOnly)} onFactorFocus={(index) => setActive({ kind: "product", method: "nww", index })} onFactorChange={(index, value) => updateProduct("nww", index, value)} onResultFocus={() => setActive({ kind: "result", method: "nww" })} onResultChange={(value) => { setNww(value); reset(); }} /> : null}
      <div className="lg:col-span-2"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura do kreski, iloczynów i wyników" /></div>
    </div>
    <button type="button" disabled={readOnly || !complete} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź rozkłady i obliczenia</button>
    {checked !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 text-center font-black ${checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>{checked ? mode === "nwd" ? `Poprawnie: NWD(${task.a}, ${task.b}) = ${task.gcd}.` : `Poprawnie: NWD = ${task.gcd}, a NWW = ${task.lcm}.` : "Sprawdź kreski, wpisane czynniki iloczynów i końcowe wyniki."}</p> : null}
  </div>;
}

function FactorPairTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = GCD_LCM_FACTOR_TASKS[taskIndex % GCD_LCM_FACTOR_TASKS.length]!;
  return <article className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-950 p-5 text-white shadow-2xl sm:p-8">
    <p className="text-sm font-bold text-cyan-200">
      {task.guided ? "Uzupełnij dwa rozkłady. Następnie dotknij pola NWD albo NWW — potrzebne czynniki zostaną wskazane w obu kreskach." : "Zadanie samodzielne: uzupełnij dwie kreski i dwa iloczyny. Tym razem liczby nie będą podświetlane ani skreślane."}
    </p>
    <h4 className="mt-2 text-3xl font-black">NWD i NWW liczb {task.a} i {task.b}</h4>
    <FactorCalculation task={task} guided={task.guided} readOnly={readOnly} onResultChange={onResultChange} />
  </article>;
}

function StoryTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [method, setMethod] = useState<"NWD" | "NWW" | null>(null);
  const task: FactorTask = { a: 48, b: 60, gcd: 12, lcm: 240 };
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const choose = (value: "NWD" | "NWW") => {
    setMethod(value);
    onResultChange?.(null);
  };
  return <article className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-cyan-50 to-emerald-100 p-5 text-slate-950 shadow-2xl sm:p-8">
    <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Zadanie praktyczne</p>
    <h4 className="mt-2 text-3xl font-black">Paczki dla uczestników wyprawy</h4>
    <p className="mt-4 max-w-4xl text-lg leading-relaxed">Chrupek ma <b>48 batonów zbożowych</b> i <b>60 soków</b>. Chce przygotować jak najwięcej jednakowych paczek i wykorzystać wszystkie produkty. Czy trzeba użyć NWD, czy NWW?</p>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{(["NWD", "NWW"] as const).map((value) => <button key={value} type="button" disabled={readOnly} aria-pressed={method === value} onClick={() => choose(value)} className={`min-h-20 rounded-2xl border-4 text-2xl font-black ${method === value ? value === "NWD" ? "border-emerald-700 bg-emerald-600 text-white" : "border-rose-700 bg-rose-500 text-white" : "border-white bg-white"}`}>{value}</button>)}</div>
    {method === "NWW" ? <p role="status" className="mt-4 rounded-2xl bg-rose-100 p-4 text-center font-black text-rose-900">Tu dzielimy oba zbiory na jak największą liczbę jednakowych paczek. Wybierz NWD.</p> : null}
    {method === "NWD" ? <div className="mt-6 rounded-[2rem] bg-slate-950 p-4 text-white sm:p-6"><p className="font-bold text-cyan-200">Teraz udowodnij wybór: rozłóż 48 i 60 metodą kreski, wpisz wspólne czynniki, ich iloczyn i liczbę paczek.</p><FactorCalculation task={task} mode="nwd" readOnly={readOnly} onResultChange={onResultChange} /></div> : null}
  </article>;
}

export function GcdLcmFactorLessonModel({ seed = 1, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const station = Math.min(3, Math.max(1, seed));
  const taskIndex = Math.max(0, questionNumber - 1);
  const titles = ["Rozwiń skróty", "Dwie kreski i dwa iloczyny", "Paczki dla wyprawy"] as const;
  return <section data-seed={seed} className="rounded-[2.25rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-emerald-700 p-3 shadow-2xl sm:p-5">
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dział II · Temat 6</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">{titles[station - 1]}</h3></div><b className="rounded-2xl bg-white/20 px-4 py-2">Zadanie {questionNumber}/{questionCount}</b></header>
    {station === 1 ? <AcronymTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 2 ? <FactorPairTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 3 ? <StoryTask readOnly={readOnly} onResultChange={onResultChange} /> : null}
  </section>;
}
