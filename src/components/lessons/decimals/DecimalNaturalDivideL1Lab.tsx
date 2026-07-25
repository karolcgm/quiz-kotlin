"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  buildDecimalNaturalLongDivisionSteps,
  createPublicDecimalNaturalDivideL1Task,
  isDecimalNaturalDivideL1Activity,
  validateDecimalNaturalDivideL1Answer,
  type DecimalNaturalDivideL1Activity,
  type DecimalNaturalLongDivisionStep,
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

function commaPosition(value: string): number {
  const index = value.indexOf(",");
  return index === -1 ? value.replace(",", "").length : index;
}

function digitsOnly(value: string): string {
  return value.replace(",", "");
}

type DivisionGridSelection = Exclude<ActiveCell, null>;

export function AlignedDecimalDivisionGrid({
  dividend,
  divisor,
  quotient,
  resultCommaAfter,
  products,
  remainders,
  steps,
  active,
  onSelect,
  readOnly = false,
  showDividendComma = dividend.includes(","),
  showQuotientComma = true,
  label,
}: {
  dividend: string;
  divisor: number;
  quotient: string[];
  resultCommaAfter: number;
  products: string[][];
  remainders: string[][];
  steps: DecimalNaturalLongDivisionStep[];
  active?: ActiveCell;
  onSelect?: (selection: DivisionGridSelection) => void;
  readOnly?: boolean;
  showDividendComma?: boolean;
  showQuotientComma?: boolean;
  label: string;
}) {
  const rawDigits = digitsOnly(dividend);
  const decimalAfter = commaPosition(dividend);
  const quotientDigits = quotient;
  const quotientOffset = Math.max(0, decimalAfter - resultCommaAfter);
  const digitCount = Math.max(rawDigits.length, quotientOffset + quotientDigits.length);
  const cellSize = "2.75rem";
  const gridStyle = { gridTemplateColumns: `2.1rem repeat(${decimalAfter}, ${cellSize}) 1rem repeat(${Math.max(0, digitCount - decimalAfter)}, ${cellSize}) 1.5rem ${cellSize}` };
  const digitColumn = (index: number) => 2 + index + (index >= decimalAfter ? 1 : 0);
  const commaColumn = 2 + decimalAfter;
  const dividendLastColumn = digitColumn(rawDigits.length - 1);
  const colonColumn = dividendLastColumn + 1;
  const divisorColumn = colonColumn + 1;
  const editableCellClass = (selected: boolean, accent: "slate" | "emerald" = "slate") => `grid h-11 w-11 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black tabular-nums text-slate-950 transition ${selected ? "border-indigo-600 ring-4 ring-indigo-100" : accent === "emerald" ? "border-emerald-600" : "border-slate-400"}`;
  const staticCellClass = (accent: "slate" | "emerald" = "slate") => `grid h-11 w-11 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black tabular-nums text-slate-950 ${accent === "emerald" ? "border-emerald-600" : "border-slate-400"}`;
  const renderCell = ({ value, gridColumn, cellLabel, selection, accent = "slate", editable = false }: { value: string; gridColumn: number; cellLabel: string; selection?: DivisionGridSelection; accent?: "slate" | "emerald"; editable?: boolean }) => {
    const selected = Boolean(selection && active && selection.row === active.row && (selection.row === "quotient" ? active.row === "quotient" && selection.index === active.index : active.row !== "quotient" && "step" in selection && "step" in active && selection.step === active.step && selection.index === active.index));
    const style = { gridColumnStart: gridColumn, gridRowStart: 1 };
    if (editable && onSelect && selection) return <button type="button" key={`${cellLabel}-${gridColumn}`} data-answer-cell aria-label={cellLabel} disabled={readOnly} onClick={() => onSelect(selection)} className={editableCellClass(selected, accent)} style={style}>{value}</button>;
    return <span key={`${cellLabel}-${gridColumn}`} aria-label={cellLabel} className={staticCellClass(accent)} style={style}>{value}</span>;
  };
  const renderComma = (key: string) => <span key={key} data-decimal-comma aria-hidden className="grid h-11 items-end justify-center pb-1 font-mono text-4xl font-black leading-none text-slate-950" style={{ gridColumnStart: commaColumn, gridRowStart: 1 }}>,</span>;
  const renderWorkRow = (values: string[], row: "product" | "remainder", stepIndex: number, end: number) => {
    const start = Math.max(0, end - values.length + 1);
    const rowLabel = row === "product" ? "Iloczyn do odjęcia" : "Liczba po sprowadzeniu";
    return <div key={`${row}-${stepIndex}`} data-division-grid-row className="grid items-center" style={gridStyle}>
      {row === "product" ? <span aria-hidden className="grid h-11 place-items-center font-mono text-2xl font-black" style={{ gridColumnStart: Math.max(1, digitColumn(start) - 1), gridRowStart: 1 }}>−</span> : null}
      {values.map((value, index) => renderCell({ value, gridColumn: digitColumn(start + index), cellLabel: `${rowLabel}, krok ${stepIndex + 1}, cyfra ${index + 1}`, selection: { row, step: stepIndex, index }, editable: true }))}
    </div>;
  };

  return <div className="overflow-x-auto pb-2"><div className="mx-auto w-fit min-w-max space-y-1 px-2 text-slate-950" aria-label={label} data-decimal-long-division={onSelect ? "true" : undefined} data-decimal-division-example={onSelect ? undefined : "true"}>
    <div data-division-grid-row className="grid items-center" style={gridStyle}>
      {quotientDigits.map((value, index) => renderCell({ value, gridColumn: digitColumn(quotientOffset + index), cellLabel: `Iloraz, cyfra ${index + 1}`, selection: { row: "quotient", index }, editable: true }))}
      {showQuotientComma ? renderComma("quotient-comma") : null}
    </div>
    <div data-division-grid-row className="grid h-2" style={gridStyle}><span aria-hidden className="border-t-2 border-slate-950" style={{ gridColumnStart: digitColumn(0), gridColumnEnd: divisorColumn + 1 }} /></div>
    <div data-division-grid-row className="grid items-center" style={gridStyle}>
      {rawDigits.split("").map((value, index) => renderCell({ value, gridColumn: digitColumn(index), cellLabel: `Dzielna, cyfra ${index + 1}: ${value}`, accent: "emerald" }))}
      {showDividendComma ? renderComma("dividend-comma") : null}
      <span aria-label="Znak dzielenia" className="grid h-11 place-items-center font-mono text-3xl font-black" style={{ gridColumnStart: colonColumn, gridRowStart: 1 }}>:</span>
      <span aria-label={`Dzielnik: ${divisor}`} className={staticCellClass()} style={{ gridColumnStart: divisorColumn, gridRowStart: 1 }}>{divisor}</span>
    </div>
    {steps.map((step, stepIndex) => {
      const nextEnd = steps[stepIndex + 1]?.end ?? step.end;
      const productStart = Math.max(0, step.end - products[stepIndex]!.length + 1);
      const partialDividendStart = Math.max(0, step.end - step.partialDividendDisplay.length + 1);
      return <div key={`step-${stepIndex}`} className="space-y-1">
        {renderWorkRow(products[stepIndex] ?? [], "product", stepIndex, step.end)}
        <div data-division-grid-row className="grid h-2" style={gridStyle}><span aria-hidden className="border-t-2 border-slate-800" style={{ gridColumnStart: digitColumn(Math.min(productStart, partialDividendStart)), gridColumnEnd: digitColumn(step.end) + 1 }} /></div>
        {renderWorkRow(remainders[stepIndex] ?? [], "remainder", stepIndex, nextEnd)}
      </div>;
    })}
  </div></div>;
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
  const exampleDividend = "4,200";
  const exampleDivisor = 8;
  const exampleResult = "0,525";
  const exampleSteps = buildDecimalNaturalLongDivisionSteps("4,2", exampleDivisor, 2);
  return <section className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <div><h3 className="text-xl font-black text-amber-950">Schemat dzielenia pisemnego</h3><p className="mt-2 font-bold text-amber-950">Iloraz zapisujemy nad dzielną. Przecinek w ilorazie zapisujemy dokładnie nad przecinkiem dzielnej. Przecinki są tylko w dzielnej i w ilorazie — w kolejnych krokach zapisujemy same cyfry.</p></div>
    <aside className="rounded-xl border-2 border-amber-400 bg-white p-4 text-amber-950">
      <p className="font-black">Gdy po przecinku zabraknie cyfry, dopisujemy 0 do dzielnej i kontynuujemy dzielenie.</p>
      <p className="mt-2 text-center font-mono text-2xl font-black">4,2 <span aria-hidden>→</span> 4,20 <span aria-hidden>→</span> 4,200</p>
      <p className="mt-2 font-bold">Nie zostawiamy reszty: kończymy dopiero wtedy, gdy po odejmowaniu otrzymamy 0.</p>
    </aside>
    <AlignedDecimalDivisionGrid
      dividend={exampleDividend}
      divisor={exampleDivisor}
      quotient={[...digitsOnly(exampleResult)]}
      resultCommaAfter={commaPosition(exampleResult)}
      products={exampleSteps.map((step) => [...digitsOnly(step.productDisplay)])}
      remainders={exampleSteps.map((step) => [...digitsOnly(step.nextDisplay)])}
      steps={exampleSteps}
      readOnly
      label="Przykład dzielenia pisemnego 4,2 przez 8 po dopisaniu dwóch zer"
    />
  </section>;
}

function DecimalLongDivision({ task, readOnly, onResultChange }: { task: DecimalNaturalDivideL1Task; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [appendedZeros, setAppendedZeros] = useState(readOnly ? task.appendedZeros : 0);
  const rawBase = digitsOnly(task.dividend);
  const rawDigits = `${rawBase}${"0".repeat(appendedZeros)}`;
  const resultDigits = digitsOnly(task.result);
  const resultCommaAfter = commaPosition(task.result);
  const steps = useMemo(() => buildDecimalNaturalLongDivisionSteps(task.dividend, task.divisor, appendedZeros), [appendedZeros, task.dividend, task.divisor]);
  const [quotient, setQuotient] = useState<string[]>(() => readOnly ? [...resultDigits] : [...resultDigits].map(() => ""));
  const [products, setProducts] = useState<string[][]>(() => steps.map((step) => readOnly ? [...digitsOnly(step.productDisplay)] : digitsOnly(step.productDisplay).split("").map(() => "")));
  const [remainders, setRemainders] = useState<string[][]>(() => steps.map((step) => readOnly ? [...digitsOnly(step.nextDisplay)] : digitsOnly(step.nextDisplay).split("").map(() => "")));
  const [answer, setAnswer] = useState(readOnly ? task.result : "");
  const [active, setActive] = useState<ActiveCell>({ row: "quotient", index: 0 });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);

  const appendZero = (zeros: number) => {
    const nextSteps = buildDecimalNaturalLongDivisionSteps(task.dividend, task.divisor, zeros);
    setAppendedZeros(zeros);
    setProducts((previous) => nextSteps.map((step, index) => Array.from({ length: digitsOnly(step.productDisplay).length }, (_, digitIndex) => previous[index]?.[digitIndex] ?? "")));
    setRemainders((previous) => nextSteps.map((step, index) => Array.from({ length: digitsOnly(step.nextDisplay).length }, (_, digitIndex) => previous[index]?.[digitIndex] ?? "")));
    setStatus(null); onResultChange?.(null);
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
  return <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-amber-50 p-3 font-black text-amber-950"><span>Gdy po przecinku brakuje cyfry, dopisz 0 i kontynuuj dzielenie aż otrzymasz 0.</span><button type="button" disabled={readOnly || appendedZeros >= task.appendedZeros} onClick={() => appendZero(appendedZeros + 1)} className="rounded-xl border-2 border-amber-500 bg-white px-4 py-2 disabled:opacity-40">Dopisz 0</button><span>Dopisano: {appendedZeros}</span></div>
    <AlignedDecimalDivisionGrid
      dividend={`${rawDigits.slice(0, commaPosition(task.dividend))},${rawDigits.slice(commaPosition(task.dividend))}`}
      divisor={task.divisor}
      quotient={quotient}
      resultCommaAfter={resultCommaAfter}
      products={products}
      remainders={remainders}
      steps={steps}
      active={active}
      onSelect={setActive}
      readOnly={readOnly}
      label={`Dzielenie pisemne ${task.dividend} przez ${task.divisor}`}
    />
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
