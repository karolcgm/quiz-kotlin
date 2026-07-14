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

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export const GCD_LCM_FACTOR_TASKS = [
  { a: 12, b: 18, gcd: 6, lcm: 36 },
  { a: 24, b: 36, gcd: 12, lcm: 72 },
  { a: 30, b: 45, gcd: 15, lcm: 90 },
  { a: 40, b: 60, gcd: 20, lcm: 120 },
] as const;

function AcronymTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const isGcd = taskIndex % 2 === 0;
  const answers = isGcd
    ? ["Największy wspólny dzielnik", "Najmniejszy wspólny dzielnik", "Największa wspólna dziesiątka", "Następny właściwy dzielnik"]
    : ["Najmniejsza wspólna wielokrotność", "Największa wspólna wielokrotność", "Najmniejszy wspólny wynik", "Następna wielka wartość"];
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  return <article className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-violet-200">Nie pomyl skrótów</p><h4 className="mt-2 text-3xl font-black">Co oznacza skrót {isGcd ? "NWD" : "NWW"}?</h4><div className="mt-6 grid gap-3 sm:grid-cols-2">{answers.map((answer, index) => <button key={answer} type="button" disabled={readOnly} onClick={() => { setSelected(index); onResultChange?.(index === 0, answer); }} className={`min-h-20 rounded-2xl border-2 p-4 text-left font-black ${selected === index ? index === 0 ? "border-emerald-200 bg-emerald-300 text-emerald-950" : "border-rose-200 bg-rose-300 text-rose-950" : "border-white/20 bg-white/10"}`}>{answer}</button>)}</div>{selected !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 font-black ${selected === 0 ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{selected === 0 ? isGcd ? "NWD szuka największej liczby dzielącej obie liczby bez reszty." : "NWW szuka najmniejszej dodatniej wielokrotności wspólnej dla obu liczb." : "Przeczytaj uważnie każde słowo skrótu."}</p> : null}</article>;
}

type ActiveTarget =
  | { kind: "cell"; ladder: "a" | "b"; side: "left" | "right"; index: number }
  | { kind: "result"; field: "nwd" | "nww" };

function Ladder({ ladder, label, initial, left, right, active, readOnly, onFocus, onUpdate }: {
  ladder: "a" | "b";
  label: string;
  initial: number;
  left: string[];
  right: string[];
  active: ActiveTarget;
  readOnly: boolean;
  onFocus: (side: "left" | "right", index: number) => void;
  onUpdate: (side: "left" | "right", index: number, value: string) => void;
}) {
  return <div className="rounded-3xl bg-white p-4 text-slate-950"><h5 className="mb-3 text-center text-xl font-black">{label}: {initial}</h5><div className="grid grid-cols-[1fr_4px_1fr] items-center gap-x-3 gap-y-2 text-center">{Array.from({ length: right.length + 1 }, (_, row) => <div key={row} className="contents">{row === 0 ? <span className="grid min-h-11 place-items-center rounded-xl bg-indigo-100 text-xl font-black">{initial}</span> : <input aria-label={`${label}, wynik dzielenia, wiersz ${row}`} inputMode="none" disabled={readOnly} value={left[row - 1]} onFocus={() => onFocus("left", row - 1)} onClick={() => onFocus("left", row - 1)} onChange={(event) => onUpdate("left", row - 1, event.target.value)} className={`min-h-11 w-full rounded-xl border-2 text-center text-lg font-black ${active.kind === "cell" && active.ladder === ladder && active.side === "left" && active.index === row - 1 ? "border-indigo-600 bg-indigo-100 ring-4 ring-indigo-200" : "border-indigo-200 bg-indigo-50"}`} />}<span className="h-full min-h-11 bg-slate-950" aria-hidden />{row < right.length ? <input aria-label={`${label}, dzielnik pierwszy, wiersz ${row + 1}`} inputMode="none" disabled={readOnly} value={right[row]} onFocus={() => onFocus("right", row)} onClick={() => onFocus("right", row)} onChange={(event) => onUpdate("right", row, event.target.value)} className={`min-h-11 w-full rounded-xl border-2 text-center text-lg font-black ${active.kind === "cell" && active.ladder === ladder && active.side === "right" && active.index === row ? "border-emerald-600 bg-emerald-100 ring-4 ring-emerald-200" : "border-emerald-200 bg-emerald-50"}`} /> : <span className="grid min-h-11 place-items-center text-xs font-black text-slate-500">koniec</span>}</div>)}</div></div>;
}

function FactorPairTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = GCD_LCM_FACTOR_TASKS[taskIndex % GCD_LCM_FACTOR_TASKS.length]!;
  const rowsA = useMemo(() => primeFactors(task.a).length, [task.a]);
  const rowsB = useMemo(() => primeFactors(task.b).length, [task.b]);
  const [leftA, setLeftA] = useState<string[]>(() => Array(rowsA).fill("")); const [rightA, setRightA] = useState<string[]>(() => Array(rowsA).fill(""));
  const [leftB, setLeftB] = useState<string[]>(() => Array(rowsB).fill("")); const [rightB, setRightB] = useState<string[]>(() => Array(rowsB).fill(""));
  const [nwd, setNwd] = useState(""); const [nww, setNww] = useState("");
  const [active, setActive] = useState<ActiveTarget>({ kind: "cell", ladder: "a", side: "right", index: 0 });
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const updateCell = (ladder: "a" | "b", side: "left" | "right", index: number, value: string) => {
    const setter = ladder === "a" ? side === "left" ? setLeftA : setRightA : side === "left" ? setLeftB : setRightB;
    setter((values) => values.map((item, itemIndex) => itemIndex === index ? value.replace(/\D/g, "") : item)); reset();
  };
  const applyKey = (key: string) => {
    reset();
    if (active.kind === "result") {
      const setter = active.field === "nwd" ? setNwd : setNww;
      setter((value) => key === "backspace" ? value.slice(0, -1) : `${value}${key}`);
      return;
    }
    const setter = active.ladder === "a" ? active.side === "left" ? setLeftA : setRightA : active.side === "left" ? setLeftB : setRightB;
    setter((values) => values.map((value, index) => index === active.index ? key === "backspace" ? value.slice(0, -1) : `${value}${key}` : value));
  };
  const complete = [...leftA, ...rightA, ...leftB, ...rightB, nwd, nww].every(Boolean);
  const check = () => {
    const correct = validateFactorLadder(task.a, leftA, rightA) && validateFactorLadder(task.b, leftB, rightB) && Number(nwd) === task.gcd && Number(nww) === task.lcm;
    setChecked(correct); onResultChange?.(correct, `${task.a}: ${rightA.join("×")}; ${task.b}: ${rightB.join("×")}; NWD=${nwd}; NWW=${nww}`);
  };
  return <article className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-sm font-bold text-cyan-200">Najpierw rozłóż obie liczby metodą kreski. NWD tworzymy ze wspólnych czynników, a NWW ze wszystkich potrzebnych czynników. Dzięki temu skróty nie mieszają się.</p><h4 className="mt-2 text-3xl font-black">Wyznacz NWD i NWW liczb {task.a} i {task.b}</h4><div className="mt-6 grid gap-4 lg:grid-cols-2"><Ladder ladder="a" label="Pierwsza liczba" initial={task.a} left={leftA} right={rightA} active={active} readOnly={Boolean(readOnly)} onFocus={(side, index) => setActive({ kind: "cell", ladder: "a", side, index })} onUpdate={(side, index, value) => updateCell("a", side, index, value)} /><Ladder ladder="b" label="Druga liczba" initial={task.b} left={leftB} right={rightB} active={active} readOnly={Boolean(readOnly)} onFocus={(side, index) => setActive({ kind: "cell", ladder: "b", side, index })} onUpdate={(side, index, value) => updateCell("b", side, index, value)} /></div><div className="mt-5 grid gap-3 rounded-3xl bg-white p-4 text-slate-950 sm:grid-cols-2"><label className="text-xl font-black">NWD({task.a}, {task.b}) = <input aria-label={`NWD liczb ${task.a} i ${task.b}`} inputMode="none" disabled={readOnly} value={nwd} onFocus={() => setActive({ kind: "result", field: "nwd" })} onClick={() => setActive({ kind: "result", field: "nwd" })} onChange={(event) => { setNwd(event.target.value.replace(/\D/g, "")); reset(); }} className="mt-2 min-h-14 w-full rounded-xl border-2 border-amber-300 bg-amber-50 px-3 text-center text-2xl font-black" /></label><label className="text-xl font-black">NWW({task.a}, {task.b}) = <input aria-label={`NWW liczb ${task.a} i ${task.b}`} inputMode="none" disabled={readOnly} value={nww} onFocus={() => setActive({ kind: "result", field: "nww" })} onClick={() => setActive({ kind: "result", field: "nww" })} onChange={(event) => { setNww(event.target.value.replace(/\D/g, "")); reset(); }} className="mt-2 min-h-14 w-full rounded-xl border-2 border-cyan-300 bg-cyan-50 px-3 text-center text-2xl font-black" /></label><div className="sm:col-span-2"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura do kreski i wyników" /></div></div><button type="button" disabled={readOnly || !complete} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź rozkłady, NWD i NWW</button>{checked !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 text-center font-black ${checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>{checked ? `Poprawnie: NWD = ${task.gcd}, a NWW = ${task.lcm}.` : "Sprawdź obie kreski i upewnij się, że nie zamieniono miejscami NWD oraz NWW."}</p> : null}</article>;
}

function StoryTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [method, setMethod] = useState<"NWD" | "NWW" | null>(null); const [answer, setAnswer] = useState(""); const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const check = () => { const correct = method === "NWD" && Number(answer) === gcd(48, 60); setChecked(correct); onResultChange?.(correct, `${method ?? "?"}: ${answer} zestawów`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-cyan-50 to-emerald-100 p-5 text-slate-950 shadow-2xl sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Zadanie praktyczne</p><h4 className="mt-2 text-3xl font-black">Paczki dla uczestników wyprawy</h4><p className="mt-4 max-w-4xl text-lg leading-relaxed">Chrupek ma <b>48 batonów zbożowych</b> i <b>60 soków</b>. Chce przygotować jak najwięcej jednakowych paczek, wykorzystując wszystko. Każda paczka ma zawierać tyle samo batonów i tyle samo soków. Czy trzeba użyć NWD, czy NWW? Ile paczek można przygotować?</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(["NWD", "NWW"] as const).map((value) => <button key={value} type="button" disabled={readOnly} aria-pressed={method === value} onClick={() => { setMethod(value); reset(); }} className={`min-h-20 rounded-2xl border-4 text-2xl font-black ${method === value ? "border-indigo-700 bg-indigo-600 text-white" : "border-white bg-white"}`}>{value}</button>)}</div><label className="mx-auto mt-5 block max-w-md text-center text-xl font-black">Liczba jednakowych paczek<input aria-label="Liczba jednakowych paczek" inputMode="numeric" disabled={readOnly} value={answer} onChange={(event) => { setAnswer(event.target.value.replace(/\D/g, "")); reset(); }} className="mt-2 min-h-14 w-full rounded-xl border-2 border-amber-300 bg-white px-3 text-center text-2xl font-black" /></label><button type="button" disabled={readOnly || !method || !answer} onClick={check} className="mt-6 min-h-14 w-full rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35">Sprawdź rozwiązanie</button>{checked !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 text-center font-black ${checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>{checked ? "Poprawnie — NWD(48, 60) = 12, więc powstanie 12 jednakowych paczek." : "Paczki dzielą oba zbiory bez reszty, dlatego szukamy największego wspólnego dzielnika."}</p> : null}</article>;
}

export function GcdLcmFactorLessonModel({ seed = 1, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const station = Math.min(3, Math.max(1, seed)); const taskIndex = Math.max(0, questionNumber - 1);
  return <section data-seed={seed} className="rounded-[2.25rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-emerald-700 p-3 shadow-2xl sm:p-5"><header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dział II · Temat 6</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">NWD i NWW z rozkładu na czynniki</h3></div><b className="rounded-2xl bg-white/20 px-4 py-2">Zadanie {questionNumber}/{questionCount}</b></header>{station === 1 ? <AcronymTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 2 ? <FactorPairTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}{station === 3 ? <StoryTask readOnly={readOnly} onResultChange={onResultChange} /> : null}</section>;
}
