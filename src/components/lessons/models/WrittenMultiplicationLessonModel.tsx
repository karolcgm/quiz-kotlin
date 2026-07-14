"use client";

import { Fragment, useEffect, useState } from "react";

export const FIRST_SLIDE_EXAMPLES = [
  { a: 782, b: 36 },
  { a: 47, b: 183 },
  { a: 7, b: 4209 },
  { a: 724, b: 509 },
] as const;

export interface MultiplicationLayoutRow {
  multiplierDigit: number;
  position: number;
  partial: number;
  /** Liczba aktywnych kratek w tym piętrze. */
  digitCount: number;
  disabledRight: number;
  carryCount: number;
}

export interface MultiplicationLayout {
  result: number;
  columns: number;
  multiplicandDigits: number;
  rows: MultiplicationLayoutRow[];
}

/**
 * Pierwsze piętro wykorzystuje całą szerokość wyniku. Każde następne
 * wyłącza od prawej jedną kolejną kratkę, dokładnie jak w zapisie pisemnym.
 */
export function getWrittenMultiplicationLayout(a: number, b: number): MultiplicationLayout {
  const multiplicandDigits = String(Math.abs(a)).length;
  const multiplierDigits = String(Math.abs(b)).split("").reverse().map(Number);
  const partials = multiplierDigits.map((multiplierDigit, position) => ({
    multiplierDigit,
    position,
    partial: Math.abs(a) * multiplierDigit,
  }));
  const result = a * b;
  const columns = Math.max(
    String(Math.abs(result)).length,
    multiplicandDigits,
    ...partials.map((row) => String(row.partial).length + row.position),
  );
  const rows = partials.map((row) => ({
    ...row,
    digitCount: columns - row.position,
    disabledRight: row.position,
    carryCount: Math.max(0, multiplicandDigits - 1),
  }));
  return { result, columns, multiplicandDigits, rows };
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
  | { row: "carry" | "partial" | "result"; rowIndex: number; digitIndex: number }
  | null;

function clampTaskIndex(value: number) {
  return Math.min(FIRST_SLIDE_EXAMPLES.length - 1, Math.max(0, value));
}

function WrittenExample({
  a,
  b,
  taskNumber,
  readOnly,
  onResultChange,
}: {
  a: number;
  b: number;
  taskNumber: number;
  readOnly: boolean;
  onResultChange?: Props["onResultChange"];
}) {
  const layout = getWrittenMultiplicationLayout(a, b);
  const [carryValues, setCarryValues] = useState<string[][]>(() => layout.rows.map((row) => Array(row.carryCount).fill("")));
  const [partialValues, setPartialValues] = useState<string[][]>(() => layout.rows.map((row) => Array(row.digitCount).fill("")));
  const [resultValues, setResultValues] = useState<string[]>(() => Array(layout.columns).fill(""));
  const [active, setActive] = useState<ActiveCell>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  const inputClass = (selected: boolean, small = false) => `grid place-items-center rounded-lg border-2 font-mono font-black transition ${small ? "h-8 w-8 text-base sm:h-9 sm:w-9" : "h-11 w-11 text-xl sm:h-12 sm:w-12 sm:text-2xl"} ${selected ? "border-cyan-500 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50" : "border-slate-300 bg-white text-slate-950"}`;
  const blankClass = "h-11 w-11 sm:h-12 sm:w-12";
  const disabledClass = "grid h-11 w-11 place-items-center rounded-lg border-2 border-indigo-700 bg-indigo-600 sm:h-12 sm:w-12";

  const change = (digit: string) => {
    if (readOnly || !active) return;
    const update = (current: string[]) => current.map((value, cellIndex) => (
      cellIndex === active.digitIndex ? (digit === "←" ? "" : digit) : value
    ));

    if (active.row === "result") {
      const next = update(resultValues);
      const answer = next.join("");
      const complete = next.every(Boolean);
      setResultValues(next);
      onResultChange?.(complete ? Number(answer) === layout.result : null, answer || undefined);
    } else if (active.row === "partial") {
      setPartialValues((current) => current.map((row, rowIndex) => rowIndex === active.rowIndex ? update(row) : row));
    } else {
      setCarryValues((current) => current.map((row, rowIndex) => rowIndex === active.rowIndex ? update(row) : row));
    }

    if (digit !== "←" && active.digitIndex > 0) {
      setActive({ ...active, digitIndex: active.digitIndex - 1 });
    }
  };

  const renderCarryCells = (row: MultiplicationLayoutRow, rowIndex: number) => {
    const carryStart = layout.columns - layout.multiplicandDigits;
    return Array.from({ length: layout.columns }, (_, column) => {
      const carryIndex = column - carryStart;
      if (carryIndex >= 0 && carryIndex < row.carryCount) {
        return <button type="button" key={`carry-${rowIndex}-${column}`} aria-label={`Przeniesienie, piętro ${rowIndex + 1}, cyfra ${carryIndex + 1}`} disabled={readOnly} onClick={() => setActive({ row: "carry", rowIndex, digitIndex: carryIndex })} className={inputClass(active?.row === "carry" && active.rowIndex === rowIndex && active.digitIndex === carryIndex, true)}>{carryValues[rowIndex]?.[carryIndex] ?? ""}</button>;
      }
      return <span key={`carry-empty-${rowIndex}-${column}`} className={blankClass} aria-hidden />;
    });
  };

  const renderNumberCells = (value: number, rowName: string) => {
    const digits = String(Math.abs(value));
    const start = layout.columns - digits.length;
    return Array.from({ length: layout.columns }, (_, column) => column < start
      ? <span key={`${rowName}-empty-${column}`} className={blankClass} aria-hidden />
      : <span key={`${rowName}-${column}`} className="grid h-11 w-11 place-items-center font-mono text-3xl font-black text-slate-950 sm:h-12 sm:w-12 sm:text-4xl">{digits[column - start]}</span>);
  };

  const renderPartialCells = (row: MultiplicationLayoutRow, rowIndex: number) => Array.from({ length: layout.columns }, (_, column) => {
    if (column >= row.digitCount) {
      return <span key={`partial-disabled-${rowIndex}-${column}`} data-disabled-cell="true" className={disabledClass} aria-hidden />;
    }
    return <button type="button" key={`partial-${rowIndex}-${column}`} aria-label={`Iloczyn częściowy, piętro ${rowIndex + 1}, cyfra ${column + 1}`} disabled={readOnly} onClick={() => setActive({ row: "partial", rowIndex, digitIndex: column })} className={inputClass(active?.row === "partial" && active.rowIndex === rowIndex && active.digitIndex === column)}>{partialValues[rowIndex]?.[column] ?? ""}</button>;
  });

  const renderResultCells = () => Array.from({ length: layout.columns }, (_, column) => (
    <button type="button" key={`result-${column}`} aria-label={`Wynik końcowy, cyfra ${column + 1}`} disabled={readOnly} onClick={() => setActive({ row: "result", rowIndex: 0, digitIndex: column })} className={inputClass(active?.row === "result" && active.digitIndex === column)}>{resultValues[column]}</button>
  ));

  const resultComplete = resultValues.every(Boolean);
  const resultCorrect = resultComplete && Number(resultValues.join("")) === layout.result;

  return <article aria-label={`Zadanie ${taskNumber}: ${a} razy ${b}`} className="mx-auto w-fit max-w-full rounded-3xl bg-slate-100 p-4 text-slate-950 shadow-xl sm:p-7">
    <div className="overflow-x-auto pb-2"><div className="mx-auto grid w-fit items-center gap-2" style={{ gridTemplateColumns: `3rem repeat(${layout.columns}, 3rem)` }}>
      {layout.rows[0]?.carryCount ? layout.rows.map((row, rowIndex) => <Fragment key={`carry-row-${rowIndex}`}>
        <span aria-hidden />{renderCarryCells(row, rowIndex)}
      </Fragment>) : null}
      <span aria-hidden />{renderNumberCells(a, "multiplicand")}
      <span className="text-center text-4xl font-black" aria-label="razy">×</span>{renderNumberCells(b, "multiplier")}
      <span aria-hidden /><span className="col-span-full border-b-4 border-slate-900" />
      {layout.rows.map((row, rowIndex) => <Fragment key={`partial-row-${rowIndex}`}>
        <span className="text-center text-4xl font-black" aria-hidden>{rowIndex === layout.rows.length - 1 && layout.rows.length > 1 ? "+" : ""}</span>{renderPartialCells(row, rowIndex)}
      </Fragment>)}
      <span aria-hidden /><span className="col-span-full mt-1 border-b-4 border-slate-900" />
      <span className="text-right text-[10px] font-black uppercase text-slate-600">wynik</span>{renderResultCells()}
    </div></div>
    <p className="mt-4 text-center text-sm font-bold text-slate-600">Zamalowane kratki są wyłączone. Oceniany jest wyłącznie wynik w najniższym rzędzie.</p>
    <div className="mx-auto mt-5 grid max-w-sm grid-cols-3 gap-3">{"123456789".split("").map((digit) => <button type="button" key={digit} aria-label={digit} disabled={readOnly || !active} onClick={() => change(digit)} className="min-h-14 rounded-2xl bg-slate-900 text-2xl font-black text-white shadow disabled:opacity-35">{digit}</button>)}<button type="button" aria-label="0" disabled={readOnly || !active} onClick={() => change("0")} className="min-h-14 rounded-2xl bg-slate-900 text-2xl font-black text-white shadow disabled:opacity-35">0</button><button type="button" aria-label="Usuń cyfrę" disabled={readOnly || !active} onClick={() => change("←")} className="col-span-2 min-h-14 rounded-2xl bg-rose-300 text-lg font-black text-rose-950 disabled:opacity-35">← Usuń cyfrę</button></div>
    {resultComplete ? <p role="status" className={`mt-4 rounded-xl px-3 py-3 text-center font-black ${resultCorrect ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>{resultCorrect ? "Wynik końcowy jest poprawny." : "Wynik końcowy jest niepoprawny — popraw najniższy rząd."}</p> : null}
  </article>;
}

export function WrittenMultiplicationLessonModel({ seed = 1, taskSeed = seed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const [localIndex, setLocalIndex] = useState(() => clampTaskIndex((Math.abs(taskSeed) - 1) % FIRST_SLIDE_EXAMPLES.length));
  const taskIndex = questionNumber === undefined ? localIndex : clampTaskIndex(questionNumber - 1);
  const example = FIRST_SLIDE_EXAMPLES[taskIndex]!;
  const shownCount = questionCount ?? FIRST_SLIDE_EXAMPLES.length;

  return <section data-seed={seed} className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-indigo-700/15 to-violet-700/30" />
    <div className="relative">
      <header className="flex items-start justify-between gap-3"><div><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · TEMAT 7</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">Mnożenie pisemne piętrami</h3><p className="mt-2 max-w-3xl text-slate-200">Liczba pięter i rzędów przeniesień odpowiada liczbie cyfr mnożnika.</p></div><b className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm text-slate-950">Zadanie {taskIndex + 1}/{shownCount}</b></header>
      {questionNumber === undefined ? <nav aria-label="Zadania mnożenia" className="mx-auto mt-5 flex max-w-xl items-center justify-center gap-3"><button type="button" disabled={localIndex === 0} onClick={() => setLocalIndex((index) => Math.max(0, index - 1))} className="min-h-11 rounded-xl border border-white/25 px-4 font-bold disabled:opacity-35">← Poprzednie</button><button type="button" disabled={localIndex === FIRST_SLIDE_EXAMPLES.length - 1} onClick={() => setLocalIndex((index) => Math.min(FIRST_SLIDE_EXAMPLES.length - 1, index + 1))} className="min-h-11 rounded-xl bg-white px-4 font-bold text-slate-950 disabled:opacity-35">Następne →</button></nav> : null}
      <div className="mt-6"><WrittenExample key={`${example.a}-${example.b}`} {...example} taskNumber={taskIndex + 1} readOnly={readOnly} onResultChange={onResultChange} /></div>
    </div>
  </section>;
}
