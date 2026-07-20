"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createPublicDecimalNaturalDivideL1Task,
  isDecimalNaturalDivideL1Activity,
  validateDecimalNaturalDivideL1Answer,
  type DecimalNaturalDivideL1Activity,
  type DecimalNaturalDivideL1Task,
} from "@/lib/math/decimals/decimalNaturalDivideL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<DecimalNaturalDivideL1Activity, string> = {
  "decimal-natural-divide-mental": "Dzielenie w pamięci",
  "decimal-natural-divide-written": "Dzielenie pisemne",
  "decimal-natural-divide-story": "Zadania tekstowe",
};

type ActiveCell =
  | { row: "quotient"; index: number }
  | { row: "product" | "remainder"; step: number; index: number }
  | { row: "answer" }
  | null;

interface DivisionStep {
  productDisplay: string;
  nextDisplay: string;
  indent: number;
}

function commaPosition(value: string): number {
  const index = value.indexOf(",");
  return index === -1 ? value.replace(",", "").length : index;
}

function digitsOnly(value: string): string {
  return value.replace(",", "");
}

function formatDecimal(value: string, decimalPlaces: number): string {
  if (decimalPlaces === 0) return value;
  const padded = value.padStart(decimalPlaces + 1, "0");
  return `${padded.slice(0, -decimalPlaces)},${padded.slice(-decimalPlaces)}`;
}

function buildSteps(rawDigits: string, divisor: number, decimalAfter: number): DivisionStep[] {
  let collected = "";
  let started = false;
  const values: { product: string; remainder: number; end: number }[] = [];
  [...rawDigits].forEach((digit, index) => {
    collected = `${collected}${digit}`.replace(/^0+(?=\d)/u, "");
    const current = Number(collected || "0");
    if (!started && current < divisor && index < rawDigits.length - 1) return;
    started = true;
    const quotientDigit = Math.floor(current / divisor);
    const product = quotientDigit * divisor;
    const remainder = current - product;
    values.push({ product: String(product), remainder, end: index });
    collected = String(remainder);
  });
  return values.map((value, index) => {
    const productPlaces = Math.max(0, value.end - decimalAfter + 1);
    const nextRaw = index < values.length - 1 ? String(Number(`${value.remainder}${rawDigits[value.end + 1] ?? ""}`)) : String(value.remainder);
    const nextPlaces = productPlaces + 1;
    return {
      productDisplay: formatDecimal(value.product, productPlaces),
      nextDisplay: index < values.length - 1 ? formatDecimal(nextRaw, nextPlaces) : nextRaw,
      indent: Math.max(0, productPlaces - 1),
    };
  });
}

function Box({ value, active, onClick, label, readOnly = false, accent = "slate" }: { value: string; active?: boolean; onClick?: () => void; label?: string; readOnly?: boolean; accent?: "slate" | "emerald" | "amber" }) {
  const border = accent === "emerald" ? "border-emerald-700" : accent === "amber" ? "border-amber-400 bg-amber-50" : "border-slate-400";
  const className = `grid h-11 w-11 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black text-slate-950 sm:h-12 sm:w-12 sm:text-3xl ${active ? "border-indigo-600 ring-4 ring-indigo-100" : border}`;
  return onClick ? <button type="button" aria-label={label} disabled={readOnly} onClick={onClick} className={className}>{value}</button> : <span aria-label={label} className={className}>{value}</span>;
}

function DecimalCells({ text, digits, activeIndex, onSelect, label, readOnly = false, accent = "slate" }: {
  text: string;
  digits?: string[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  label: string;
  readOnly?: boolean;
  accent?: "slate" | "emerald" | "amber";
}) {
  let digitIndex = 0;
  return <span className="inline-flex items-end gap-1.5" aria-label={label}>
    {[...text].map((character, index) => {
      if (character === ",") return <span key={`comma-${index}`} aria-hidden data-decimal-comma className="-mx-1 inline-block w-3 translate-y-1 text-center text-4xl font-black leading-none text-slate-950">,</span>;
      const currentIndex = digitIndex++;
      return <span key={`${character}-${index}`}>
        <Box value={digits ? digits[currentIndex] ?? "" : character} active={activeIndex === currentIndex} onClick={digits ? () => onSelect?.(currentIndex) : undefined} label={digits ? `${label}, cyfra ${currentIndex + 1}` : label} readOnly={readOnly} accent={accent} />
      </span>;
    })}
  </span>;
}

function DecimalStoryPicture({ kind }: { kind: NonNullable<DecimalNaturalDivideL1Task["pictureKind"]> }) {
  const label = { juice: "Butelki z sokiem", ribbon: "Równe części wstążki", paint: "Puszki z farbą", apples: "Skrzynki z jabłkami" }[kind];
  const source = {
    juice: "/lessons/illustrations/decimals/story/divide-juice.png",
    ribbon: "/lessons/illustrations/decimals/story/divide-ribbon.png",
    paint: "/lessons/illustrations/decimals/story/divide-paint.png",
    apples: "/lessons/illustrations/decimals/story/divide-apples.png",
  }[kind];
  return <Image src={source} alt={label} aria-label={label} width={1536} height={864} sizes="(min-width: 1024px) 768px, 100vw" className="h-auto w-full object-cover" />;
}

function MentalExample() {
  return <section className="grid gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5 md:grid-cols-3">
    <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">8,4 : 2</p>
    <p className="rounded-xl bg-white p-4 text-center font-black">84 dziesiąte : 2 = 42 dziesiąte</p>
    <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">4,2</p>
  </section>;
}

function WrittenExample() {
  return <section className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <div><h3 className="text-xl font-black text-amber-950">Schemat dzielenia pisemnego</h3><p className="mt-2 font-bold text-amber-950">Iloraz zapisujemy nad dzielną. Przecinek w ilorazie zapisujemy dokładnie nad przecinkiem dzielnej. Pod dzielną wpisujemy kolejne iloczyny i liczby po sprowadzeniu.</p></div>
    <aside className="rounded-xl border-2 border-amber-400 bg-white p-4 text-amber-950">
      <p className="font-black">Gdy po przecinku zabraknie cyfry, dopisujemy 0 do dzielnej i kontynuujemy dzielenie.</p>
      <p className="mt-2 text-center font-mono text-2xl font-black">4,2 <span aria-hidden>→</span> 4,20 <span aria-hidden>→</span> 4,200</p>
      <p className="mt-2 font-bold">Nie zostawiamy reszty: kończymy dopiero wtedy, gdy po odejmowaniu otrzymamy 0.</p>
    </aside>
    <div className="mx-auto w-fit min-w-max px-2 font-mono text-slate-950">
      <div className="mb-2"><DecimalCells text="0,525" label="Iloraz w przykładzie" /></div>
      <div className="flex items-center gap-3"><DecimalCells text="4,200" label="Dzielna w przykładzie" accent="emerald" /><span className="text-3xl font-black">:</span><span className="text-3xl font-black">8</span></div>
      <div className="my-2 h-1 w-56 border-b-4 border-slate-950" />
      <div className="space-y-1">
        <div className="flex items-center gap-2"><span className="text-2xl font-black">−</span><DecimalCells text="4,0" label="Pierwszy iloczyn w przykładzie" /></div>
        <div className="h-1 w-32 border-b-2 border-slate-900" />
        <DecimalCells text="0,20" label="Pierwsza liczba po sprowadzeniu w przykładzie" />
        <div className="ml-5 flex items-center gap-2"><span className="text-2xl font-black">−</span><DecimalCells text="0,16" label="Drugi iloczyn w przykładzie" /></div>
        <div className="ml-5 h-1 w-40 border-b-2 border-slate-900" />
        <div className="ml-5"><DecimalCells text="0,040" label="Druga liczba po sprowadzeniu w przykładzie" /></div>
      </div>
    </div>
  </section>;
}

function DecimalLongDivision({ task, readOnly, onResultChange }: { task: DecimalNaturalDivideL1Task; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [appendedZeros, setAppendedZeros] = useState(readOnly ? task.appendedZeros : 0);
  const rawBase = digitsOnly(task.dividend);
  const decimalAfter = commaPosition(task.dividend);
  const rawDigits = `${rawBase}${"0".repeat(appendedZeros)}`;
  const resultDigits = digitsOnly(task.result);
  const resultCommaAfter = commaPosition(task.result);
  const quotientOffset = Math.max(0, decimalAfter - resultCommaAfter);
  const steps = useMemo(() => buildSteps(rawDigits, task.divisor, decimalAfter), [rawDigits, task.divisor, decimalAfter]);
  const [quotient, setQuotient] = useState<string[]>(() => readOnly ? [...resultDigits] : [...resultDigits].map(() => ""));
  const [products, setProducts] = useState<string[][]>(() => steps.map((step) => readOnly ? [...digitsOnly(step.productDisplay)] : digitsOnly(step.productDisplay).split("").map(() => "")));
  const [remainders, setRemainders] = useState<string[][]>(() => steps.map((step) => readOnly ? [...digitsOnly(step.nextDisplay)] : digitsOnly(step.nextDisplay).split("").map(() => "")));
  const [answer, setAnswer] = useState(readOnly ? task.result : "");
  const [active, setActive] = useState<ActiveCell>({ row: "quotient", index: 0 });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);

  const reset = (zeros: number) => {
    const nextSteps = buildSteps(`${rawBase}${"0".repeat(zeros)}`, task.divisor, decimalAfter);
    setAppendedZeros(zeros); setQuotient([...resultDigits].map(() => "")); setProducts(nextSteps.map((step) => digitsOnly(step.productDisplay).split("").map(() => ""))); setRemainders(nextSteps.map((step) => digitsOnly(step.nextDisplay).split("").map(() => ""))); setStatus(null); onResultChange?.(null);
  };
  const fill = (key: string) => {
    if (readOnly || !active) return;
    const value = key === "backspace" ? "" : key;
    if (active.row === "answer") { setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "," && current.includes(",") ? current : current.length < 8 ? `${current}${key}` : current); setStatus(null); onResultChange?.(null); return; }
    if (key === ",") return;
    const update = (rows: string[][], setter: (next: string[][]) => void, row: number, index: number, rowName: "product" | "remainder") => { const next = rows.map((cells, currentRow) => currentRow === row ? cells.map((cell, currentIndex) => currentIndex === index ? value : cell) : cells); setter(next); if (key !== "backspace") setActive({ row: rowName, step: row, index: Math.min(next[row]!.length - 1, index + 1) }); };
    if (active.row === "quotient") { const next = quotient.map((cell, index) => index === active.index ? value : cell); setQuotient(next); if (key !== "backspace") setActive({ row: "quotient", index: Math.min(next.length - 1, active.index + 1) }); }
    if (active.row === "product") update(products, setProducts, active.step, active.index, "product");
    if (active.row === "remainder") update(remainders, setRemainders, active.step, active.index, "remainder");
    setStatus(null); onResultChange?.(null);
  };
  const check = () => {
    const quotientText = `${quotient.slice(0, resultCommaAfter).join("")},${quotient.slice(resultCommaAfter).join("")}`;
    const writtenStepsCorrect = steps.every((step, index) => products[index]?.join("") === digitsOnly(step.productDisplay) && remainders[index]?.join("") === digitsOnly(step.nextDisplay));
    const correct = appendedZeros === task.appendedZeros && quotient.every(Boolean) && writtenStepsCorrect && validateDecimalNaturalDivideL1Answer(task, quotientText) && (!task.story || validateDecimalNaturalDivideL1Answer(task, answer));
    setStatus(correct ? "correct" : "wrong"); onResultChange?.(correct, task.story ? `${answer || "brak odpowiedzi"} ${task.answerUnit}` : quotientText);
  };
  const displayDividend = `${rawDigits.slice(0, decimalAfter)},${rawDigits.slice(decimalAfter)}`;
  const workCells = (text: string, digits: string[], row: "product" | "remainder", step: number) => <DecimalCells
    text={text}
    digits={digits}
    activeIndex={active?.row === row && active.step === step ? active.index : undefined}
    onSelect={(index) => setActive({ row, step, index })}
    label={`${row === "product" ? "Iloczyn do odjęcia" : "Liczba po sprowadzeniu"}, krok ${step + 1}`}
    readOnly={readOnly}
  />;
  return <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-amber-50 p-3 font-black text-amber-950"><span>Gdy po przecinku brakuje cyfry, dopisz 0 i kontynuuj dzielenie aż otrzymasz 0.</span><button type="button" disabled={readOnly || appendedZeros >= task.appendedZeros} onClick={() => reset(appendedZeros + 1)} className="rounded-xl border-2 border-amber-500 bg-white px-4 py-2 disabled:opacity-40">Dopisz 0</button><span>Dopisano: {appendedZeros}</span></div>
    <div className="overflow-x-auto pb-2"><div className="mx-auto w-fit min-w-max px-2 font-mono text-slate-950" aria-label={`Dzielenie pisemne ${task.dividend} przez ${task.divisor}`} data-decimal-long-division>
      <div className="mb-1" style={{ marginLeft: `${quotientOffset * 3.375}rem` }}><DecimalCells text={task.result} digits={quotient} activeIndex={active?.row === "quotient" ? active.index : undefined} onSelect={(index) => setActive({ row: "quotient", index })} label="Iloraz" readOnly={readOnly} /></div>
      <div className="flex items-center gap-3"><DecimalCells text={displayDividend} label="Dzielna" accent="emerald" /><span className="text-3xl font-black">:</span><span className="text-3xl font-black">{task.divisor}</span></div>
      <div className="my-2 h-1 w-56 border-b-4 border-slate-950" />
      <div className="space-y-2">
        {steps.map((step, index) => <div key={`step-${index}`} className="space-y-1" style={{ marginLeft: `${step.indent * 1.25}rem` }}>
          <div className="flex items-center gap-2"><span className="text-2xl font-black">−</span>{workCells(step.productDisplay, products[index] ?? [], "product", index)}</div>
          <div className="ml-6 h-1 w-40 border-b-2 border-slate-900" />
          {workCells(step.nextDisplay, remainders[index] ?? [], "remainder", index)}
        </div>)}
      </div>
    </div></div>
    {task.story ? <button type="button" disabled={readOnly} onClick={() => setActive({ row: "answer" })} className={`mx-auto flex min-h-14 max-w-md items-center gap-3 rounded-xl border-2 bg-emerald-50 px-4 text-lg font-black text-emerald-950 ${active?.row === "answer" ? "border-emerald-700 ring-4 ring-emerald-100" : "border-emerald-300"}`}><span>Odpowiedź:</span><span className="min-w-24 rounded-lg bg-white px-3 py-1 text-2xl">{answer}</span><span>{task.answerUnit}</span></button> : null}
    {!readOnly ? <LessonNumericKeypad allowSeparator={active?.row === "answer"} onKey={fill} onConfirm={check} label="Kalkulator do dzielenia pisemnego" helperText={active?.row === "quotient" ? "Uzupełnij iloraz. Przecinek jest ustawiony nad przecinkiem dzielnej." : active?.row === "product" ? "Wpisz iloczyn, który odejmujesz." : active?.row === "remainder" ? "Wpisz liczbę po odjęciu i sprowadzeniu kolejnej cyfry." : "Wpisz odpowiedź liczbową."} /> : null}
    {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Wszystkie kroki dzielenia są poprawne." : "Sprawdź dopisane zera, iloczyny do odjęcia, liczby po sprowadzeniu i iloraz."}</p> : null}
  </section>;
}

export interface DecimalNaturalDivideL1LabProps { activity: DecimalNaturalDivideL1Activity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void; }
export { isDecimalNaturalDivideL1Activity };

export function DecimalNaturalDivideL1Lab(props: DecimalNaturalDivideL1LabProps) { return <DecimalNaturalDivideRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />; }

function DecimalNaturalDivideRound({ activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalNaturalDivideL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalNaturalDivideL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const [mentalAnswer, setMentalAnswer] = useState(readOnly ? task.result : "");
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const checkMental = () => { const correct = validateDecimalNaturalDivideL1Answer(task, mentalAnswer); setStatus(correct ? "correct" : "wrong"); onResultChange?.(correct, mentalAnswer); };
  const updateMental = (key: string) => { if (readOnly) return; setMentalAnswer((value) => key === "backspace" ? value.slice(0, -1) : key === "," && value.includes(",") ? value : value.length < 8 ? `${value}${key}` : value); setStatus(null); onResultChange?.(null); };
  return <LessonTaskFrame className="space-y-5" contentClassName="space-y-5" eyebrow="Dział 5 · Ułamki dziesiętne" heading={TITLES[activity]} description={activity === "decimal-natural-divide-mental" ? "Oblicz proste ilorazy w pamięci." : activity === "decimal-natural-divide-story" ? "Przeczytaj treść, zapisz dzielenie pisemne w kratkach i uzupełnij odpowiedź." : "Wpisuj kolejne kroki tak, jak w dzieleniu pisemnym liczb naturalnych."} questionNumber={questionNumber} questionCount={questionCount} data-decimal-natural-divide-l1 data-decimal-activity={activity} data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined}>
    {activity === "decimal-natural-divide-mental" ? <MentalExample /> : activity === "decimal-natural-divide-written" ? <WrittenExample /> : null}
    {activity === "decimal-natural-divide-story" && task.story && task.storyQuestion && task.pictureKind ? <section className="space-y-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5"><div><h3 className="text-xl font-black text-emerald-950">Przeczytaj zadanie</h3><p className="mt-2 text-lg font-bold text-emerald-950">{task.story}</p><p className="mt-2 text-lg font-black text-emerald-950">{task.storyQuestion}</p></div><div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-200 bg-white"><DecimalStoryPicture kind={task.pictureKind} /></div></section> : null}
    {activity === "decimal-natural-divide-mental" ? <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-5"><p className="text-center text-3xl font-black">{task.dividend} : {task.divisor} =</p><button type="button" disabled={readOnly} onClick={() => undefined} className="mx-auto grid min-h-14 w-40 place-items-center rounded-xl border-2 border-slate-400 bg-white px-3 text-3xl font-black">{mentalAnswer}</button>{!readOnly ? <LessonNumericKeypad allowSeparator onKey={updateMental} onConfirm={checkMental} label="Kalkulator do dzielenia w pamięci" helperText="Wpisz wynik i zatwierdź." /> : null}{status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze!" : "Sprawdź wynik."}</p> : null}</section> : <DecimalLongDivision task={task} readOnly={readOnly} onResultChange={onResultChange} />}
  </LessonTaskFrame>;
}
