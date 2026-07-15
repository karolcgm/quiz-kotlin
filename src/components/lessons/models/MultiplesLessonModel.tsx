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

export const MULTIPLES_DAILY_TASKS = [
  {
    title: "Pudełka kredek w pracowni Chrupka",
    story: "W każdym pudełku znajduje się 9 kredek. Wpisz, ile kredek mamy razem przy 0, 1, 2, 3 i 4 pudełkach.",
    unit: "pudełek",
    item: "kredek",
    base: 9,
  },
  {
    title: "Równe zestawy naklejek",
    story: "Jedna karta zawiera 6 naklejek. Wpisz, ile naklejek znajduje się łącznie na 0, 1, 2, 3 i 4 kartach.",
    unit: "kart",
    item: "naklejek",
    base: 6,
  },
] as const;

export const MULTIPLES_SEGMENT_TASKS = [
  { a: 4, b: 6, result: 12, aColor: "turkusowy", bColor: "koralowy" },
  { a: 6, b: 8, result: 24, aColor: "turkusowy", bColor: "koralowy" },
] as const;

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

export const LCM_STORY_TASKS = [
  {
    title: "Dwa świetlne sygnały",
    text: "Turkusowa lampka miga co 6 minut, a złota co 8 minut. Właśnie rozbłysły razem. Za ile minut po raz pierwszy znów rozbłysną jednocześnie?",
    a: 6,
    b: 8,
    result: 24,
    suffix: "minuty",
    explanation: "Szukamy pierwszej wspólnej chwili dla rytmów co 6 i co 8 minut, dlatego obliczamy NWW(6, 8) = 24.",
  },
  {
    title: "Dwa szkolne autobusy",
    text: "Pierwszy autobus odjeżdża z przystanku co 12 minut, a drugi co 18 minut. Oba właśnie odjechały. Za ile minut ponownie odjadą jednocześnie?",
    a: 12,
    b: 18,
    result: 36,
    suffix: "minut",
    explanation: "Oba odjazdy muszą przypaść na tę samą wielokrotność 12 i 18. Najmniejszą z nich jest 36.",
  },
  {
    title: "Kolorowe chorągiewki",
    text: "Turkusowe chorągiewki powtarzają się co 8 cm, a koralowe co 10 cm. Na początku wzory pokrywają się. Po ilu centymetrach po raz pierwszy znów znajdą się w tym samym miejscu?",
    a: 8,
    b: 10,
    result: 40,
    suffix: "cm",
    explanation: "Pierwsza wspólna długość musi być wielokrotnością 8 i 10, więc jest równa NWW(8, 10) = 40 cm.",
  },
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
  return (
    <p role="status" className={`mt-4 rounded-2xl px-4 py-3 text-center font-black ${correct ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>
      {correct ? "Świetnie! Wszystkie elementy pasują." : "Jeszcze nie. Popraw odpowiedź i sprawdź ponownie."}
    </p>
  );
}

function DailyLifeTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = MULTIPLES_DAILY_TASKS[taskIndex % MULTIPLES_DAILY_TASKS.length]!;
  const expected = Array.from({ length: 5 }, (_, index) => index * task.base);
  const [sequence, setSequence] = useState(() => expected.map(() => ""));
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);

  const reset = () => { setChecked(null); onResultChange?.(null); };
  const applyKey = (key: string) => {
    if (readOnly) return;
    reset();
    setSequence((values) => values.map((value, index) => index === active ? editText(value, key) : value));
  };
  const check = () => {
    const correct = sequence.every((value, index) => Number(value) === expected[index]);
    setChecked(correct);
    onResultChange?.(correct, sequence.join(", "));
  };

  return (
    <article className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
      <div
        data-lesson-hero="multiples"
        className="relative aspect-[4/3] min-h-60 w-full overflow-hidden bg-cyan-50 sm:aspect-[16/7] sm:max-h-96"
      >
        <Image
          src="/lessons/illustrations/number-properties/chrupek-multiples-crayons-v1.webp"
          alt="Chrupek przy jednakowych pudełkach kredek"
          fill
          priority={taskIndex === 0}
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover object-[center_30%]"
        />
      </div>
      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-4xl">
        <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Wielokrotności w życiu codziennym</p>
        <h4 className="mt-2 text-2xl font-black sm:text-4xl">{task.title}</h4>
        <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">{task.story}</p>
        <p className="mt-3 rounded-2xl bg-cyan-200/15 p-4 font-bold text-cyan-50">Każdy otrzymany wynik jest wielokrotnością liczby {task.base}. Pamiętaj, że zaczynamy od 0.</p>
        <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
          {sequence.map((value, index) => (
            <label key={index} className="text-center text-xs font-bold text-slate-200">
              <span>{index} {task.unit}</span>
              <input aria-label={`${index} ${task.unit} — liczba ${task.item}`} inputMode="none" disabled={readOnly} value={value} onFocus={() => setActive(index)} onClick={() => setActive(index)} onChange={(event) => { reset(); setSequence((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value.replace(/\D/g, "") : item)); }} className={`mt-1 min-h-12 w-full rounded-xl border-2 px-1 text-center text-lg font-black text-slate-950 outline-none ${active === index ? "border-cyan-300 bg-cyan-100 ring-4 ring-cyan-300/40" : "border-white/60 bg-white"}`} />
            </label>
          ))}
        </div>
        <p className="mt-3 text-center text-sm font-bold text-cyan-100">Wpisujesz wynik dla {active} {task.unit}.</p>
        <div className="mx-auto mt-2 max-w-xl"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura do wpisywania wielokrotności" /></div>
        <button type="button" disabled={readOnly || !sequence.every(Boolean)} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź wielokrotności</button>
        <Feedback correct={checked} />
        </div>
      </div>
    </article>
  );
}

type SegmentKind = "a" | "b";

export function segmentPixelWidth(lengthInCentimeters: number): number {
  return lengthInCentimeters * 10;
}

function SegmentTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = MULTIPLES_SEGMENT_TASKS[taskIndex % MULTIPLES_SEGMENT_TASKS.length]!;
  const expectedA = task.result / task.a;
  const expectedB = task.result / task.b;
  const [selected, setSelected] = useState<SegmentKind>("a");
  const [counts, setCounts] = useState({ a: 0, b: 0 });
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const place = (kind: SegmentKind) => {
    if (readOnly) return;
    reset();
    setCounts((value) => ({ ...value, [kind]: Math.min(10, value[kind] + 1) }));
  };
  const remove = (kind: SegmentKind) => {
    if (readOnly) return;
    reset();
    setCounts((value) => ({ ...value, [kind]: Math.max(0, value[kind] - 1) }));
  };
  const drop = (event: React.DragEvent<HTMLButtonElement>, target: SegmentKind) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData("text/plain");
    if (kind === target) place(target);
  };
  const check = () => {
    const correct = counts.a === expectedA && counts.b === expectedB && Number(answer) === task.result;
    setChecked(correct);
    onResultChange?.(correct, `${counts.a} × ${task.a}; ${counts.b} × ${task.b}; NWW=${answer}`);
  };
  const renderStrip = (kind: SegmentKind, length: number, colorClass: string) => (
    <div className="flex min-h-16 items-center gap-0 overflow-x-auto rounded-xl bg-slate-950/70 p-2" aria-live="polite">
      {Array.from({ length: counts[kind] }, (_, index) => (
        <span
          key={index}
          data-segment-kind={kind}
          data-segment-length={length}
          className={`block h-10 shrink-0 border-2 border-white/80 first:rounded-l-lg last:rounded-r-lg ${colorClass}`}
          style={{ width: `${segmentPixelWidth(length)}px` }}
        />
      ))}
      {counts[kind] === 0 ? <span className="px-3 text-sm font-bold text-slate-400">Tutaj ułóż odcinki.</span> : null}
    </div>
  );

  return (
    <article className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 p-5 text-white shadow-2xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Dwa odcinki — po co szukamy NWW?</p>
      <h4 className="mt-2 text-2xl font-black sm:text-4xl">Pierwsza wspólna długość bez przecinania</h4>
      <p className="mt-4 max-w-4xl leading-relaxed text-slate-200">Mamy jeden {task.aColor} odcinek długości <b>{task.a} cm</b> i jeden {task.bColor} odcinek długości <b>{task.b} cm</b>. Dokładaj całe odcinki, aż oba paski po raz pierwszy będą miały tę samą długość.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" draggable={!readOnly} disabled={readOnly} aria-pressed={selected === "a"} onDragStart={(event) => event.dataTransfer.setData("text/plain", "a")} onClick={() => setSelected("a")} className={`min-h-16 rounded-2xl border-4 px-4 font-black ${selected === "a" ? "border-white bg-cyan-400 text-slate-950 ring-4 ring-cyan-300/40" : "border-cyan-300/50 bg-cyan-400/20"}`}>Wybierz odcinek {task.a} cm</button>
        <button type="button" draggable={!readOnly} disabled={readOnly} aria-pressed={selected === "b"} onDragStart={(event) => event.dataTransfer.setData("text/plain", "b")} onClick={() => setSelected("b")} className={`min-h-16 rounded-2xl border-4 px-4 font-black ${selected === "b" ? "border-white bg-rose-400 text-slate-950 ring-4 ring-rose-300/40" : "border-rose-300/50 bg-rose-400/20"}`}>Wybierz odcinek {task.b} cm</button>
      </div>
      <p className="mt-3 text-center text-sm font-bold text-cyan-100">Zaznacz odcinek i naciśnij właściwe pole poniżej. Na komputerze możesz go także przeciągnąć.</p>

      <div className="mt-5 space-y-4 rounded-3xl bg-white/10 p-4">
        {(["a", "b"] as const).map((kind) => {
          const length = kind === "a" ? task.a : task.b;
          const isSelected = selected === kind;
          return (
            <div key={kind}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm font-black"><span>Pasek z odcinków po {length} cm · razem {counts[kind] * length} cm</span><button type="button" disabled={readOnly || counts[kind] === 0} onClick={() => remove(kind)} className="min-h-11 rounded-xl bg-white/15 px-4 disabled:opacity-30">Cofnij ostatni</button></div>
              <button type="button" aria-label={`Umieść odcinek ${length} cm na pasku`} disabled={readOnly} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, kind)} onClick={() => { if (isSelected) place(kind); else setSelected(kind); }} className="block min-h-20 w-full rounded-2xl border-2 border-dashed border-white/50 p-2 text-left">
                {renderStrip(kind, length, kind === "a" ? "bg-cyan-400" : "bg-rose-400")}
              </button>
            </div>
          );
        })}
      </div>

      <label className="mx-auto mt-5 block max-w-md text-center text-lg font-black">NWW({task.a}, {task.b}) =
        <input aria-label={`NWW długości ${task.a} i ${task.b}`} inputMode="none" disabled={readOnly} value={answer} onChange={(event) => { reset(); setAnswer(event.target.value.replace(/\D/g, "")); }} className="ml-3 min-h-14 w-28 rounded-xl border-2 border-amber-300 bg-amber-50 px-3 text-center text-2xl font-black text-slate-950" /> cm
      </label>
      <div className="mx-auto mt-3 max-w-xl"><NumericLessonKeypad onKey={(key) => { if (!readOnly) { reset(); setAnswer((value) => editText(value, key)); } }} disabled={readOnly} label="Klawiatura do wpisania wspólnej długości" /></div>
      <button type="button" disabled={readOnly || counts.a === 0 || counts.b === 0 || !answer} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź ułożone paski</button>
      <Feedback correct={checked} />
    </article>
  );
}

function OrbitTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = MULTIPLES_ORBIT_TASKS[taskIndex % MULTIPLES_ORBIT_TASKS.length]!;
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const toggle = (value: number) => { if (readOnly) return; const next = new Set(selected); if (next.has(value)) next.delete(value); else next.add(value); setSelected(next); setChecked(null); onResultChange?.(null); };
  const check = () => { const expected = task.candidates.filter((value) => value % task.base === 0); const correct = expected.length === selected.size && expected.every((value) => selected.has(value)); setChecked(correct); onResultChange?.(correct, [...selected].sort((a, b) => a - b).join(", ")); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-slate-950 to-teal-950 p-5 text-white shadow-2xl sm:p-8"><div className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold text-cyan-200">Liczba w centrum wyznacza rytm mnożenia.</p><h4 className="mt-1 text-2xl font-black sm:text-4xl">Zaznacz wszystkie wielokrotności liczby {task.base}</h4></div><div className="relative mx-auto mt-7 grid max-w-3xl grid-cols-3 gap-3 sm:grid-cols-4"><div className="col-span-3 row-start-2 mx-auto grid h-24 w-24 place-items-center rounded-full border-8 border-cyan-200 bg-cyan-400 text-4xl font-black text-slate-950 shadow-[0_0_40px_rgba(34,211,238,.6)] sm:col-span-4">{task.base}</div>{task.candidates.map((value) => <button key={value} type="button" aria-pressed={selected.has(value)} disabled={readOnly} onClick={() => toggle(value)} className={`min-h-16 rounded-full border-4 text-xl font-black shadow-lg transition ${selected.has(value) ? "scale-105 border-amber-200 bg-amber-300 text-slate-950" : "border-white/35 bg-white/10 text-white hover:bg-white/20"}`}>{value}</button>)}</div><button type="button" disabled={readOnly} onClick={check} className="mx-auto mt-7 block min-h-14 w-full max-w-3xl rounded-2xl bg-white px-5 text-lg font-black text-indigo-950 disabled:opacity-35">Sprawdź zaznaczone liczby</button><Feedback correct={checked} /></article>;
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
  const [lineA, setLineA] = useState(""); const [lineB, setLineB] = useState(""); const [result, setResult] = useState("");
  const [active, setActive] = useState<LcmTarget>("lineA"); const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const change = (setter: (value: string) => void, value: string) => { setter(value); reset(); };
  const applyKey = (key: string) => { if (readOnly || (active === "result" && key === ",")) return; reset(); if (active === "lineA") setLineA((value) => editText(value, key)); if (active === "lineB") setLineB((value) => editText(value, key)); if (active === "result") setResult((value) => editText(value, key)); };
  const check = () => { const correct = sameNumbers(parseNumberLine(lineA), task.aMultiples) && sameNumbers(parseNumberLine(lineB), task.bMultiples) && Number(result) === task.result; setChecked(correct); onResultChange?.(correct, `W(${task.a}): ${lineA}; W(${task.b}): ${lineB}; NWW=${result}`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-sm font-black text-cyan-200">Wypisz wielokrotności pierwszej liczby, a bezpośrednio pod nimi wielokrotności drugiej. Zacznij od 0 i zakończ na pierwszej wspólnej dodatniej liczbie.</p><h4 className="mt-2 text-3xl font-black">Oblicz NWW({task.a}, {task.b})</h4><div className="mt-6 space-y-4 rounded-3xl bg-white p-5 text-slate-950"><label className="block font-black">Wielokrotności {task.a}<input aria-label={`Wielokrotności liczby ${task.a}`} inputMode="none" disabled={readOnly} value={lineA} onFocus={() => setActive("lineA")} onClick={() => setActive("lineA")} onChange={(event) => change(setLineA, event.target.value)} placeholder={`0, ${task.a}, …`} className={`mt-2 min-h-14 w-full rounded-xl border-2 px-4 text-lg font-bold outline-none ${active === "lineA" ? "border-indigo-600 bg-indigo-100 ring-4 ring-indigo-200" : "border-indigo-200 bg-indigo-50"}`} /></label><label className="block font-black">Wielokrotności {task.b}<input aria-label={`Wielokrotności liczby ${task.b}`} inputMode="none" disabled={readOnly} value={lineB} onFocus={() => setActive("lineB")} onClick={() => setActive("lineB")} onChange={(event) => change(setLineB, event.target.value)} placeholder={`0, ${task.b}, …`} className={`mt-2 min-h-14 w-full rounded-xl border-2 px-4 text-lg font-bold outline-none ${active === "lineB" ? "border-cyan-600 bg-cyan-100 ring-4 ring-cyan-200" : "border-cyan-200 bg-cyan-50"}`} /></label><label className="flex flex-wrap items-center gap-3 text-xl font-black">NWW({task.a}, {task.b}) = <input aria-label={`NWW liczb ${task.a} i ${task.b}`} inputMode="none" disabled={readOnly} value={result} onFocus={() => setActive("result")} onClick={() => setActive("result")} onChange={(event) => change(setResult, event.target.value.replace(/\D/g, ""))} className={`min-h-14 w-32 rounded-xl border-2 px-4 text-center text-2xl font-black ${active === "result" ? "border-amber-600 bg-amber-100 ring-4 ring-amber-200" : "border-amber-300 bg-amber-50"}`} /></label><NumericLessonKeypad onKey={applyKey} disabled={readOnly} allowSeparator label="Klawiatura — przecinkiem oddzielaj kolejne wielokrotności" /></div><button type="button" disabled={readOnly || !lineA.trim() || !lineB.trim() || !result} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35">Sprawdź NWW</button><Feedback correct={checked} /></article>;
}

function StoryTask({ taskIndex, readOnly, onResultChange }: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = LCM_STORY_TASKS[taskIndex % LCM_STORY_TASKS.length]!;
  const [answer, setAnswer] = useState(""); const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const check = () => { const correct = Number(answer) === task.result; setChecked(correct); onResultChange?.(correct, `${answer} ${task.suffix}`); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-orange-50 to-teal-100 p-5 text-slate-950 shadow-2xl sm:p-8"><p className="text-sm font-black uppercase tracking-[.18em] text-orange-700">NWW w praktyce</p><h4 className="mt-2 text-3xl font-black">{task.title}</h4><p className="mt-4 max-w-4xl text-lg leading-relaxed">{task.text}</p><div className="mt-6 rounded-2xl bg-white p-4"><label className="block text-center text-lg font-black">Odpowiedź: <input aria-label={`Odpowiedź do zadania: ${task.title}`} inputMode="none" disabled={readOnly} value={answer} onChange={(event) => { reset(); setAnswer(event.target.value.replace(/\D/g, "")); }} className="mx-2 min-h-14 w-28 rounded-xl border-2 border-orange-300 bg-orange-50 px-3 text-center text-2xl font-black" /> {task.suffix}</label><div className="mx-auto mt-3 max-w-xl"><NumericLessonKeypad onKey={(key) => { if (!readOnly) { reset(); setAnswer((value) => editText(value, key)); } }} disabled={readOnly} label="Klawiatura do odpowiedzi" /></div></div><button type="button" disabled={readOnly || !answer} onClick={check} className="mt-5 min-h-14 w-full rounded-xl bg-slate-950 px-5 font-black text-white disabled:opacity-35">Sprawdź odpowiedź</button>{checked === true ? <p role="status" className="mt-4 rounded-2xl bg-emerald-200 p-4 font-bold text-emerald-950">{task.explanation}</p> : <Feedback correct={checked} />}</article>;
}

export function MultiplesLessonModel({ seed = 1, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const station = Math.min(6, Math.max(1, seed));
  const taskIndex = Math.max(0, questionNumber - 1);
  return <section data-seed={seed} className="rounded-[2.25rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-cyan-600 p-3 shadow-2xl sm:p-5"><header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dział II · Temat 1</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">Wielokrotności</h3></div>{questionCount > 1 ? <b className="rounded-2xl bg-white/20 px-4 py-2">Zadanie {questionNumber}/{questionCount}</b> : null}</header>
    {station === 1 ? <DailyLifeTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 2 ? <SegmentTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 3 ? <OrbitTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 4 ? <AcronymTask readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 5 ? <LcmCalculationTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
    {station === 6 ? <StoryTask key={taskIndex} taskIndex={taskIndex} readOnly={readOnly} onResultChange={onResultChange} /> : null}
  </section>;
}
