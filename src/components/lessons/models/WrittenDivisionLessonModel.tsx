"use client";

import { Fragment, useEffect, useState } from "react";

export const WRITTEN_DIVISION_EXAMPLES = [
  { dividend: 864, divisor: 6 },
  { dividend: 1728, divisor: 12 },
  { dividend: 7392, divisor: 24 },
  { dividend: 985, divisor: 16 },
] as const;

export interface DivisionLayoutStep {
  partialDividend: number;
  quotientDigit: number;
  product: number;
  remainder: number;
  endColumn: number;
  startColumn: number;
}

export interface WrittenDivisionLayout {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  columns: number;
  steps: DivisionLayoutStep[];
}

/**
 * Buduje zapis dzielenia cyfra po cyfrze. Po rozpoczęciu ilorazu każdy
 * sprowadzony znak tworzy krok — również wtedy, gdy jego cyfrą jest zero.
 */
export function getWrittenDivisionLayout(dividend: number, divisor: number): WrittenDivisionLayout {
  if (!Number.isInteger(dividend) || !Number.isInteger(divisor) || dividend < 0 || divisor <= 0) {
    throw new Error("Dzielenie pisemne wymaga nieujemnej dzielnej i dodatniego dzielnika całkowitego.");
  }

  const digits = String(dividend).split("").map(Number);
  const steps: DivisionLayoutStep[] = [];
  let carried = 0;
  let started = false;

  digits.forEach((digit, endColumn) => {
    const partialDividend = carried * 10 + digit;
    if (!started && partialDividend < divisor && endColumn < digits.length - 1) {
      carried = partialDividend;
      return;
    }

    started = true;
    const quotientDigit = Math.floor(partialDividend / divisor);
    const product = quotientDigit * divisor;
    const remainder = partialDividend - product;
    steps.push({
      partialDividend,
      quotientDigit,
      product,
      remainder,
      endColumn,
      startColumn: Math.max(0, endColumn - String(partialDividend).length + 1),
    });
    carried = remainder;
  });

  return {
    dividend,
    divisor,
    quotient: Math.floor(dividend / divisor),
    remainder: dividend % divisor,
    columns: digits.length,
    steps,
  };
}

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type ActiveCell =
  | { row: "quotient"; digitIndex: number }
  | { row: "scratch-product" | "scratch-remainder"; stepIndex: number; digitIndex: number }
  | { row: "final-remainder"; digitIndex: number }
  | null;

function clampTaskIndex(value: number) {
  return Math.min(WRITTEN_DIVISION_EXAMPLES.length - 1, Math.max(0, value));
}

function DivisionTower({
  dividend,
  divisor,
  taskNumber,
  readOnly,
  onResultChange,
}: {
  dividend: number;
  divisor: number;
  taskNumber: number;
  readOnly: boolean;
  onResultChange?: Props["onResultChange"];
}) {
  const layout = getWrittenDivisionLayout(dividend, divisor);
  const quotientDigits = String(layout.quotient).split("");
  const remainderDigits = String(layout.remainder).split("");
  const [quotientValues, setQuotientValues] = useState<string[]>(() => Array(quotientDigits.length).fill(""));
  const [productValues, setProductValues] = useState<string[][]>(() => layout.steps.map((step) => Array(String(step.product).length).fill("")));
  const [scratchRemainders, setScratchRemainders] = useState<string[][]>(() => layout.steps.map((step) => Array(String(step.remainder).length).fill("")));
  const [finalRemainder, setFinalRemainder] = useState<string[]>(() => layout.remainder === 0 ? ["0"] : Array(remainderDigits.length).fill(""));
  const [active, setActive] = useState<ActiveCell>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  const resultComplete = quotientValues.every(Boolean) && (layout.remainder === 0 || finalRemainder.every(Boolean));
  const resultCorrect = resultComplete
    && Number(quotientValues.join("")) === layout.quotient
    && Number(finalRemainder.join("")) === layout.remainder;

  const reportFinalResult = (nextQuotient: string[], nextRemainder: string[]) => {
    const complete = nextQuotient.every(Boolean) && (layout.remainder === 0 || nextRemainder.every(Boolean));
    const answer = nextQuotient.join("")
      ? `${nextQuotient.join("")}${layout.remainder === 0 ? "" : ` r ${nextRemainder.join("")}`}`
      : undefined;
    onResultChange?.(
      complete
        ? Number(nextQuotient.join("")) === layout.quotient && Number(nextRemainder.join("")) === layout.remainder
        : null,
      answer,
    );
  };

  const updateCell = (digit: string) => {
    if (readOnly || !active) return;
    const replacement = digit === "←" ? "" : digit;

    if (active.row === "quotient") {
      const next = quotientValues.map((value, index) => index === active.digitIndex ? replacement : value);
      setQuotientValues(next);
      reportFinalResult(next, finalRemainder);
      if (digit !== "←" && active.digitIndex < next.length - 1) setActive({ row: "quotient", digitIndex: active.digitIndex + 1 });
      return;
    }

    if (active.row === "final-remainder") {
      const next = finalRemainder.map((value, index) => index === active.digitIndex ? replacement : value);
      setFinalRemainder(next);
      reportFinalResult(quotientValues, next);
      if (digit !== "←" && active.digitIndex < next.length - 1) setActive({ row: "final-remainder", digitIndex: active.digitIndex + 1 });
      return;
    }

    const setRows = active.row === "scratch-product" ? setProductValues : setScratchRemainders;
    setRows((rows) => rows.map((row, stepIndex) => stepIndex === active.stepIndex
      ? row.map((value, index) => index === active.digitIndex ? replacement : value)
      : row));
    // Pola robocze są wyłącznie brudnopisem i nigdy nie wysyłają wyniku.
    const rowLength = active.row === "scratch-product"
      ? productValues[active.stepIndex]?.length ?? 0
      : scratchRemainders[active.stepIndex]?.length ?? 0;
    if (digit !== "←" && active.digitIndex < rowLength - 1) setActive({ ...active, digitIndex: active.digitIndex + 1 });
  };

  const cellClass = (selected: boolean, compact = false) => `grid place-items-center rounded-lg border-2 font-mono font-black transition ${compact ? "h-9 w-9 text-lg sm:h-10 sm:w-10" : "h-11 w-11 text-2xl sm:h-12 sm:w-12 sm:text-3xl"} ${selected ? "border-cyan-500 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50" : "border-slate-300 bg-white text-slate-950"}`;
  const blankClass = "h-11 w-11 sm:h-12 sm:w-12";
  const quotientByColumn = new Map(layout.steps.map((step, index) => [step.endColumn, index]));
  const dividendDigits = String(dividend).split("");

  const renderScratchRow = (step: DivisionLayoutStep, stepIndex: number, row: "scratch-product" | "scratch-remainder") => {
    const values = row === "scratch-product" ? productValues[stepIndex]! : scratchRemainders[stepIndex]!;
    const endColumn = step.endColumn;
    const startColumn = Math.max(0, endColumn - values.length + 1);
    return Array.from({ length: layout.columns }, (_, column) => {
      const valueIndex = column - startColumn;
      if (valueIndex < 0 || valueIndex >= values.length) return <span key={`${row}-${stepIndex}-${column}`} className={blankClass} aria-hidden />;
      const label = row === "scratch-product" ? "Iloczyn do odjęcia" : "Reszta robocza";
      return <button
        type="button"
        key={`${row}-${stepIndex}-${column}`}
        aria-label={`${label}, krok ${stepIndex + 1}, cyfra ${valueIndex + 1}`}
        disabled={readOnly}
        onClick={() => setActive({ row, stepIndex, digitIndex: valueIndex })}
        className={cellClass(active?.row === row && active.stepIndex === stepIndex && active.digitIndex === valueIndex, true)}
      >{values[valueIndex]}</button>;
    });
  };

  return <article aria-label={`Zadanie ${taskNumber}: ${dividend} podzielić przez ${divisor}`} className="mx-auto w-fit max-w-full rounded-3xl bg-slate-100 p-4 text-slate-950 shadow-xl sm:p-7">
    <div className="overflow-x-auto pb-2">
      <div className="mx-auto grid w-fit items-center gap-x-1 gap-y-2" style={{ gridTemplateColumns: `4.5rem repeat(${layout.columns}, 3rem)` }}>
        <span className="text-right text-[10px] font-black uppercase text-indigo-700">iloraz</span>
        {Array.from({ length: layout.columns }, (_, column) => {
          const quotientIndex = quotientByColumn.get(column);
          return quotientIndex === undefined
            ? <span key={`quotient-empty-${column}`} className={blankClass} aria-hidden />
            : <button type="button" key={`quotient-${column}`} aria-label={`Iloraz końcowy, cyfra ${quotientIndex + 1}`} disabled={readOnly} onClick={() => setActive({ row: "quotient", digitIndex: quotientIndex })} className={cellClass(active?.row === "quotient" && active.digitIndex === quotientIndex)}>{quotientValues[quotientIndex]}</button>;
        })}

        <span className="self-stretch border-r-4 border-slate-900 pr-3 text-center font-mono text-2xl font-black leading-[3rem]" aria-label={`dzielnik ${divisor}`}>{divisor}</span>
        {dividendDigits.map((digit, index) => <span key={`dividend-${index}`} className="grid h-12 w-12 place-items-center border-t-4 border-slate-900 font-mono text-3xl font-black">{digit}</span>)}

        {layout.steps.map((step, stepIndex) => <Fragment key={`step-${stepIndex}`}>
          <span className="text-right text-xs font-black text-slate-500">krok {stepIndex + 1} · odejmij</span>
          {renderScratchRow(step, stepIndex, "scratch-product")}
          <span aria-hidden />
          {Array.from({ length: layout.columns }, (_, column) => <span key={`line-${stepIndex}-${column}`} className={`${column >= step.startColumn && column <= step.endColumn ? "border-t-2 border-slate-700" : ""} h-1 w-11 sm:w-12`} aria-hidden />)}
          <span className="text-right text-xs font-black text-slate-500">zostaje</span>
          {renderScratchRow(step, stepIndex, "scratch-remainder")}
          {stepIndex < layout.steps.length - 1 ? <><span className="text-right text-[10px] font-bold uppercase text-indigo-600">sprowadź cyfrę</span>{Array.from({ length: layout.columns }, (_, column) => <span key={`bring-${stepIndex}-${column}`} className="grid h-6 w-11 place-items-center text-xl font-black text-indigo-500 sm:w-12" aria-hidden>{column === layout.steps[stepIndex + 1]?.endColumn ? "↓" : ""}</span>)}</> : null}
        </Fragment>)}
      </div>
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white p-3">
      <span className="font-black text-slate-700">Reszta końcowa:</span>
      {layout.remainder === 0 ? <b className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 font-mono text-2xl text-emerald-900">0</b> : finalRemainder.map((value, index) => <button type="button" key={`final-remainder-${index}`} aria-label={`Reszta końcowa, cyfra ${index + 1}`} disabled={readOnly} onClick={() => setActive({ row: "final-remainder", digitIndex: index })} className={cellClass(active?.row === "final-remainder" && active.digitIndex === index)}>{value}</button>)}
    </div>
    <p className="mt-4 max-w-2xl text-center text-sm font-bold text-slate-600">Pola „odejmij” i „zostaje” są brudnopisem. Możesz wpisać w nich dowolne kroki — oceniany jest wyłącznie końcowy iloraz i reszta.</p>

    <div className="mx-auto mt-5 grid max-w-sm grid-cols-3 gap-3">
      {"123456789".split("").map((digit) => <button type="button" key={digit} aria-label={digit} disabled={readOnly || !active} onClick={() => updateCell(digit)} className="min-h-14 rounded-2xl bg-slate-900 text-2xl font-black text-white shadow disabled:opacity-35">{digit}</button>)}
      <button type="button" aria-label="0" disabled={readOnly || !active} onClick={() => updateCell("0")} className="min-h-14 rounded-2xl bg-slate-900 text-2xl font-black text-white shadow disabled:opacity-35">0</button>
      <button type="button" aria-label="Usuń cyfrę" disabled={readOnly || !active} onClick={() => updateCell("←")} className="col-span-2 min-h-14 rounded-2xl bg-rose-300 text-lg font-black text-rose-950 disabled:opacity-35">← Usuń cyfrę</button>
    </div>
    {resultComplete ? <p role="status" className={`mt-4 rounded-xl px-3 py-3 text-center font-black ${resultCorrect ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>{resultCorrect ? "Końcowy iloraz i reszta są poprawne." : "Końcowy wynik jest niepoprawny — popraw iloraz lub resztę."}</p> : null}
  </article>;
}

export function WrittenDivisionLessonModel({ seed = 1, taskSeed = seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const [localIndex, setLocalIndex] = useState(() => clampTaskIndex((Math.abs(taskSeed) - 1) % WRITTEN_DIVISION_EXAMPLES.length));
  const taskIndex = questionNumber === undefined ? localIndex : clampTaskIndex(questionNumber - 1);
  const example = WRITTEN_DIVISION_EXAMPLES[taskIndex]!;
  const shownCount = questionCount ?? WRITTEN_DIVISION_EXAMPLES.length;

  return <section data-seed={seed} className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-indigo-700/15 to-violet-700/30" />
    <div className="relative">
      <header className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 8</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">Dzielenie pisemne wieżami</h3><p className="mt-2 max-w-3xl text-slate-200">Dziel, pomnóż, odejmij i sprowadź kolejną cyfrę. Nie pomijaj zera w ilorazie.</p></div><b className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm text-slate-950">Zadanie {taskIndex + 1}/{shownCount}</b></header>
      {questionNumber === undefined ? <nav aria-label="Zadania dzielenia" className="mx-auto mt-5 flex max-w-xl items-center justify-center gap-3"><button type="button" disabled={localIndex === 0} onClick={() => setLocalIndex((index) => Math.max(0, index - 1))} className="min-h-11 rounded-xl border border-white/25 px-4 font-bold disabled:opacity-35">← Poprzednie</button><button type="button" disabled={localIndex === WRITTEN_DIVISION_EXAMPLES.length - 1} onClick={() => setLocalIndex((index) => Math.min(WRITTEN_DIVISION_EXAMPLES.length - 1, index + 1))} className="min-h-11 rounded-xl bg-white px-4 font-bold text-slate-950 disabled:opacity-35">Następne →</button></nav> : null}
      <div className="mt-6"><DivisionTower key={`${example.dividend}-${example.divisor}`} {...example} taskNumber={taskIndex + 1} readOnly={readOnly} onResultChange={onResultChange} /></div>
    </div>
  </section>;
}
