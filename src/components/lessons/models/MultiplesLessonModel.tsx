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

export const MULTIPLES_ORBIT_TASKS = [
  { base: 6, candidates: [0, 6, 8, 12, 15, 18, 22, 24, 30, 35, 36, 42] },
  { base: 7, candidates: [0, 7, 10, 14, 20, 21, 28, 30, 35, 40, 42, 49] },
  { base: 9, candidates: [0, 9, 12, 18, 27, 32, 36, 45, 50, 54, 63, 72] },
] as const;

export const LCM_TASKS = [
  { a: 2, b: 10, aMultiples: [0, 2, 4, 6, 8, 10], bMultiples: [0, 10], result: 10 },
  { a: 3, b: 8, aMultiples: [0, 3, 6, 9, 12, 15, 18, 21, 24], bMultiples: [0, 8, 16, 24], result: 24 },
  { a: 4, b: 6, aMultiples: [0, 4, 8, 12], bMultiples: [0, 6, 12], result: 12 },
] as const;

function sameNumbers(left: readonly number[], right: readonly number[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function parseNumberLine(value: string) {
  return value.split(/[\s,;]+/).filter(Boolean).map(Number).filter(Number.isFinite);
}

function editText(value: string, key: string) {
  if (key === "backspace") return value.slice(0, -1);
  return `${value}${key}`;
}

function Feedback({ correct }: { correct: boolean | null }) {
  if (correct === null) return null;
  return <p role="status" className={`mt-4 rounded-2xl px-4 py-3 text-center font-black ${correct ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>
    {correct ? "Świetnie! Wszystkie elementy pasują." : "Jeszcze nie. Popraw odpowiedź i sprawdź ponownie."}
  </p>;
}

type IntroTarget = `sequence-${number}` | "twelve" | "fourteen" | "length";

function IntroTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const expectedSequence = [0, 9, 18, 27, 36];
  const [sequence, setSequence] = useState(() => expectedSequence.map(() => ""));
  const [twelveCount, setTwelveCount] = useState("");
  const [fourteenCount, setFourteenCount] = useState("");
  const [commonLength, setCommonLength] = useState("");
  const [active, setActive] = useState<IntroTarget>("sequence-0");
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  const resetCheck = () => {
    setChecked(null);
    onResultChange?.(null);
  };

  const applyKey = (key: string) => {
    if (readOnly) return;
    resetCheck();
    if (active.startsWith("sequence-")) {
      const index = Number(active.split("-")[1]);
      setSequence((items) => items.map((item, itemIndex) => itemIndex === index ? editText(item, key) : item));
      return;
    }
    if (active === "twelve") setTwelveCount((value) => editText(value, key));
    if (active === "fourteen") setFourteenCount((value) => editText(value, key));
    if (active === "length") setCommonLength((value) => editText(value, key));
  };

  const complete = sequence.every(Boolean) && Boolean(twelveCount && fourteenCount && commonLength);
  const check = () => {
    const correct = sequence.every((value, index) => Number(value) === expectedSequence[index])
      && Number(twelveCount) === 7
      && Number(fourteenCount) === 6
      && Number(commonLength) === 84;
    setChecked(correct);
    onResultChange?.(correct, `${sequence.join(", ")}; 12×${twelveCount}; 14×${fourteenCount}; ${commonLength} cm`);
  };

  const activeLabel = active.startsWith("sequence-")
    ? `Wpisujesz liczbę kredek dla ${active.split("-")[1]} pudełek`
    : active === "twelve" ? "Wpisujesz liczbę odcinków po 12 cm"
      : active === "fourteen" ? "Wpisujesz liczbę odcinków po 14 cm"
        : "Wpisujesz wspólną długość";

  return <div className="space-y-5">
    <article className="grid overflow-hidden rounded-3xl bg-white text-slate-950 shadow-xl lg:grid-cols-[1.05fr_.95fr]">
      <div className="p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.18em] text-teal-700">1. Wielokrotności w życiu</p>
        <h4 className="mt-2 text-2xl font-black">Pudełka kredek w pracowni Chrupka</h4>
        <p className="mt-3 leading-relaxed text-slate-700">Do szkolnej pracowni przyjechały jednakowe pudełka. W każdym pudełku znajduje się <b>9 kredek</b>. Gdy dokładamy następne pełne pudełko, liczba kredek zwiększa się zawsze o 9. Liczby 0, 9, 18, 27… są więc kolejnymi <b>wielokrotnościami liczby 9</b>.</p>
        <p className="mt-4 font-black">Wpisz, ile kredek mamy razem przy 0, 1, 2, 3 i 4 pudełkach.</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {sequence.map((value, index) => <label key={index} className="text-center text-xs font-bold text-slate-600"><span>{index} pud.</span><input aria-label={`${index} pudełek kredek`} inputMode="none" disabled={readOnly} value={value} onFocus={() => setActive(`sequence-${index}`)} onClick={() => setActive(`sequence-${index}`)} onChange={(event) => { resetCheck(); setSequence((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value.replace(/\D/g, "") : item)); }} className={`mt-1 min-h-12 w-full rounded-xl border-2 px-1 text-center text-lg font-black text-slate-950 outline-none ${active === `sequence-${index}` ? "border-teal-600 bg-teal-100 ring-4 ring-teal-200" : "border-teal-200 bg-teal-50"}`} /></label>)}
        </div>
        <p className="mt-3 text-center text-sm font-bold text-teal-800">{activeLabel}</p>
        <div className="mt-2"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura do wpisywania liczb" /></div>
      </div>
      <div className="relative min-h-72 bg-teal-50 lg:min-h-full"><Image src="/lessons/illustrations/number-properties/chrupek-multiples-crayons-v1.webp" alt="Chrupek pokazuje cztery jednakowe pudełka kolorowych kredek" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover object-left" /></div>
    </article>

    <article className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl sm:p-7">
      <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">2. Dwa odcinki — po co szukamy NWW?</p>
      <h4 className="mt-2 text-2xl font-black">Pierwsza wspólna długość bez przecinania</h4>
      <p className="mt-3 max-w-4xl leading-relaxed text-slate-200">Mamy <b>jeden turkusowy odcinek długości 12 cm</b> oraz <b>jeden koralowy odcinek długości 14 cm</b>. Możemy dokładać kolejne całe odcinki tego samego koloru, ale nie wolno ich przecinać ani skracać. Chcemy zbudować dwa paski o dokładnie tej samej długości. Szukamy więc pierwszej długości, która jest jednocześnie wielokrotnością 12 i 14 — to właśnie <b>NWW(12, 14)</b>.</p>
      <div className="mt-5 space-y-4 rounded-2xl bg-white/10 p-4">
        <div><div className="mb-1 flex justify-between text-sm font-black"><span>Jeden turkusowy odcinek</span><span>12 cm</span></div><div className="h-7 w-[48%] rounded-full border-4 border-white/70 bg-cyan-400 shadow-[inset_0_0_0_3px_rgba(15,23,42,.22)]" /></div>
        <div><div className="mb-1 flex justify-between text-sm font-black"><span>Jeden koralowy odcinek</span><span>14 cm</span></div><div className="h-7 w-[56%] rounded-full border-4 border-white/70 bg-rose-400 shadow-[inset_0_0_0_3px_rgba(15,23,42,.22)]" /></div>
      </div>
      <p className="mt-4 font-bold text-cyan-100">Ile całych odcinków każdego koloru trzeba połączyć i jaka będzie pierwsza wspólna długość?</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-bold">Odcinków po 12 cm<input aria-label="Liczba odcinków po 12 centymetrów" inputMode="none" disabled={readOnly} value={twelveCount} onFocus={() => setActive("twelve")} onClick={() => setActive("twelve")} onChange={(event) => { resetCheck(); setTwelveCount(event.target.value.replace(/\D/g, "")); }} className={`mt-1 min-h-12 w-full rounded-xl px-3 text-center text-xl font-black text-slate-950 ${active === "twelve" ? "bg-cyan-100 ring-4 ring-cyan-300" : "bg-white"}`} /></label>
        <label className="text-sm font-bold">Odcinków po 14 cm<input aria-label="Liczba odcinków po 14 centymetrów" inputMode="none" disabled={readOnly} value={fourteenCount} onFocus={() => setActive("fourteen")} onClick={() => setActive("fourteen")} onChange={(event) => { resetCheck(); setFourteenCount(event.target.value.replace(/\D/g, "")); }} className={`mt-1 min-h-12 w-full rounded-xl px-3 text-center text-xl font-black text-slate-950 ${active === "fourteen" ? "bg-rose-100 ring-4 ring-rose-300" : "bg-white"}`} /></label>
        <label className="text-sm font-bold">Wspólna długość w cm<input aria-label="Wspólna długość pasków" inputMode="none" disabled={readOnly} value={commonLength} onFocus={() => setActive("length")} onClick={() => setActive("length")} onChange={(event) => { resetCheck(); setCommonLength(event.target.value.replace(/\D/g, "")); }} className={`mt-1 min-h-12 w-full rounded-xl px-3 text-center text-xl font-black text-slate-950 ${active === "length" ? "bg-amber-100 ring-4 ring-amber-300" : "bg-white"}`} /></label>
      </div>
      <p className="mt-3 text-center text-sm font-bold text-cyan-200">{activeLabel}</p>
      <div className="mx-auto mt-2 max-w-xl"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura do odpowiedzi o odcinkach" /></div>
      <button type="button" disabled={readOnly || !complete} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź oba zadania</button>
      <Feedback correct={checked} />
    </article>
  </div>;
}

function OrbitTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = MULTIPLES_ORBIT_TASKS[taskIndex % MULTIPLES_ORBIT_TASKS.length]!;
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const toggle = (value: number) => {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(value)) next.delete(value); else next.add(value);
    setSelected(next); setChecked(null); onResultChange?.(null);
  };
  const check = () => {
    const expected = task.candidates.filter((value) => value % task.base === 0);
    const correct = expected.length === selected.size && expected.every((value) => selected.has(value));
    setChecked(correct); onResultChange?.(correct, [...selected].sort((a, b) => a - b).join(", "));
  };
  return <article className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-slate-950 to-teal-950 p-5 text-white shadow-2xl sm:p-8">
    <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold text-cyan-200">Liczba w centrum wyznacza rytm mnożenia.</p><h4 className="mt-1 text-2xl font-black sm:text-4xl">Zaznacz wszystkie wielokrotności liczby {task.base}</h4></div>
    <div className="relative mx-auto mt-7 grid max-w-3xl grid-cols-3 gap-3 sm:grid-cols-4"><div className="col-span-3 row-start-2 mx-auto grid h-24 w-24 place-items-center rounded-full border-8 border-cyan-200 bg-cyan-400 text-4xl font-black text-slate-950 shadow-[0_0_40px_rgba(34,211,238,.6)] sm:col-span-4">{task.base}</div>{task.candidates.map((value) => <button key={value} type="button" aria-pressed={selected.has(value)} disabled={readOnly} onClick={() => toggle(value)} className={`min-h-16 rounded-full border-4 text-xl font-black shadow-lg transition ${selected.has(value) ? "scale-105 border-amber-200 bg-amber-300 text-slate-950" : "border-white/35 bg-white/10 text-white hover:bg-white/20"}`}>{value}</button>)}</div>
    <button type="button" disabled={readOnly} onClick={check} className="mx-auto mt-7 block min-h-14 w-full max-w-3xl rounded-2xl bg-white px-5 text-lg font-black text-indigo-950 disabled:opacity-35">Sprawdź zaznaczone liczby</button><Feedback correct={checked} />
  </article>;
}

function AcronymTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const answers = ["Najmniejsza wspólna wielokrotność", "Największa wspólna wielokrotność", "Najmniejszy wspólny wynik", "Następna wielka wartość"];
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  return <article className="rounded-[2rem] bg-gradient-to-br from-violet-950 to-indigo-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-sm font-black uppercase tracking-[.18em] text-violet-200">Najpierw rozszyfruj nazwę</p><h4 className="mt-2 text-3xl font-black">Co oznacza skrót NWW?</h4><p className="mt-2 text-violet-100">NWW(12, 14) to pierwsza dodatnia liczba, która jest wielokrotnością zarówno 12, jak i 14.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{answers.map((answer, index) => <button key={answer} type="button" disabled={readOnly} onClick={() => { setSelected(index); onResultChange?.(index === 0, answer); }} className={`min-h-20 rounded-2xl border-2 px-4 text-left font-black ${selected === index ? index === 0 ? "border-emerald-300 bg-emerald-300 text-emerald-950" : "border-rose-300 bg-rose-300 text-rose-950" : "border-white/20 bg-white/10"}`}>{answer}</button>)}</div><Feedback correct={selected === null ? null : selected === 0} /></article>;
}

type LcmTarget = "lineA" | "lineB" | "result";

function LcmCalculationTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = LCM_TASKS[taskIndex % LCM_TASKS.length]!;
  const [lineA, setLineA] = useState("");
  const [lineB, setLineB] = useState("");
  const [result, setResult] = useState("");
  const [active, setActive] = useState<LcmTarget>("lineA");
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const change = (setter: (value: string) => void, value: string) => { setter(value); reset(); };
  const applyKey = (key: string) => {
    if (readOnly || (active === "result" && key === ",")) return;
    reset();
    if (active === "lineA") setLineA((value) => editText(value, key));
    if (active === "lineB") setLineB((value) => editText(value, key));
    if (active === "result") setResult((value) => editText(value, key));
  };
  const check = () => {
    const correct = sameNumbers(parseNumberLine(lineA), task.aMultiples) && sameNumbers(parseNumberLine(lineB), task.bMultiples) && Number(result) === task.result;
    setChecked(correct); onResultChange?.(correct, `W(${task.a}): ${lineA}; W(${task.b}): ${lineB}; NWW=${result}`);
  };
  return <article className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 p-5 text-white shadow-2xl sm:p-8">
    <p className="text-sm font-black text-cyan-200">Wypisz wielokrotności pierwszej liczby, a bezpośrednio pod nimi wielokrotności drugiej. Zacznij od 0 i zakończ na pierwszej wspólnej dodatniej liczbie.</p><h4 className="mt-2 text-3xl font-black">Oblicz NWW({task.a}, {task.b})</h4>
    <div className="mt-6 space-y-4 rounded-3xl bg-white p-5 text-slate-950"><label className="block font-black">Wielokrotności {task.a}<input aria-label={`Wielokrotności liczby ${task.a}`} inputMode="none" disabled={readOnly} value={lineA} onFocus={() => setActive("lineA")} onClick={() => setActive("lineA")} onChange={(event) => change(setLineA, event.target.value)} placeholder={`0, ${task.a}, …`} className={`mt-2 min-h-14 w-full rounded-xl border-2 px-4 text-lg font-bold outline-none ${active === "lineA" ? "border-indigo-600 bg-indigo-100 ring-4 ring-indigo-200" : "border-indigo-200 bg-indigo-50"}`} /></label><label className="block font-black">Wielokrotności {task.b}<input aria-label={`Wielokrotności liczby ${task.b}`} inputMode="none" disabled={readOnly} value={lineB} onFocus={() => setActive("lineB")} onClick={() => setActive("lineB")} onChange={(event) => change(setLineB, event.target.value)} placeholder={`0, ${task.b}, …`} className={`mt-2 min-h-14 w-full rounded-xl border-2 px-4 text-lg font-bold outline-none ${active === "lineB" ? "border-cyan-600 bg-cyan-100 ring-4 ring-cyan-200" : "border-cyan-200 bg-cyan-50"}`} /></label><label className="flex flex-wrap items-center gap-3 text-xl font-black">NWW({task.a}, {task.b}) = <input aria-label={`NWW liczb ${task.a} i ${task.b}`} inputMode="none" disabled={readOnly} value={result} onFocus={() => setActive("result")} onClick={() => setActive("result")} onChange={(event) => change(setResult, event.target.value.replace(/\D/g, ""))} className={`min-h-14 w-32 rounded-xl border-2 px-4 text-center text-2xl font-black ${active === "result" ? "border-amber-600 bg-amber-100 ring-4 ring-amber-200" : "border-amber-300 bg-amber-50"}`} /></label><NumericLessonKeypad onKey={applyKey} disabled={readOnly} allowSeparator label="Klawiatura — przecinkiem oddzielaj kolejne wielokrotności" /></div>
    <button type="button" disabled={readOnly || !lineA.trim() || !lineB.trim() || !result} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź NWW</button><Feedback correct={checked} />
  </article>;
}

function StoryTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [answer, setAnswer] = useState(""); const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const check = () => { const correct = Number(answer) === 24; setChecked(correct); onResultChange?.(correct, `${answer} min`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-orange-50 to-teal-100 p-5 text-slate-950 shadow-2xl sm:p-8"><p className="text-sm font-black uppercase tracking-[.18em] text-orange-700">Misja Chrupka</p><h4 className="mt-2 text-3xl font-black">Dwa świetlne sygnały</h4><p className="mt-4 max-w-3xl text-lg leading-relaxed">Turkusowa lampka miga co <b>6 minut</b>, a złota co <b>8 minut</b>. Właśnie rozbłysły razem. Za ile minut po raz pierwszy znów rozbłysną jednocześnie?</p><div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4"><label className="text-lg font-black">Odpowiedź: <input aria-label="Liczba minut do wspólnego sygnału" inputMode="numeric" disabled={readOnly} value={answer} onChange={(event) => { setAnswer(event.target.value.replace(/\D/g, "")); setChecked(null); onResultChange?.(null); }} className="mx-2 min-h-14 w-28 rounded-xl border-2 border-orange-300 bg-orange-50 px-3 text-center text-2xl font-black" /> minut</label><button type="button" disabled={readOnly || !answer} onClick={check} className="min-h-14 flex-1 rounded-xl bg-slate-950 px-5 font-black text-white disabled:opacity-35">Sprawdź odpowiedź</button></div><p className="mt-3 text-sm font-bold text-slate-600">Podpowiedź: szukasz najmniejszej wspólnej wielokrotności 6 i 8.</p><Feedback correct={checked} /></article>;
}

export function MultiplesLessonModel({ seed = 1, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const station = Math.min(5, Math.max(1, seed));
  const taskIndex = Math.max(0, questionNumber - 1);
  return <section data-seed={seed} className="rounded-[2.25rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-cyan-600 p-3 shadow-2xl sm:p-5"><header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dział II · Temat 1</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">Wielokrotności</h3></div>{questionCount > 1 ? <b className="rounded-2xl bg-white/20 px-4 py-2">Zadanie {questionNumber}/{questionCount}</b> : null}</header>
    {station === 1 ? <IntroTask readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 2 ? <OrbitTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 3 && taskIndex === 0 ? <AcronymTask readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 3 && taskIndex > 0 ? <LcmCalculationTask key={taskIndex} taskIndex={taskIndex - 1} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 4 ? <StoryTask readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 5 ? <LcmCalculationTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
  </section>;
}
