"use client";

import { Fragment, useState } from "react";

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
  digitCount: number;
  disabledRight: number;
  carryCount: number;
}

export interface MultiplicationLayout {
  result: number;
  columns: number;
  rows: MultiplicationLayoutRow[];
}

/** Układ krat jest liczony z rzeczywistych cyfr każdego iloczynu częściowego. */
export function getWrittenMultiplicationLayout(a: number, b: number): MultiplicationLayout {
  const multiplierDigits = String(Math.abs(b)).split("").reverse().map(Number);
  const rows = multiplierDigits.map((multiplierDigit, position) => {
    const partial = a * multiplierDigit;
    return {
      multiplierDigit,
      position,
      partial,
      digitCount: String(partial).length,
      disabledRight: position,
      carryCount: Math.max(0, String(a).length - 1),
    };
  });
  const result = a * b;
  const columns = Math.max(
    String(result).length,
    String(a).length,
    ...rows.map((row) => row.digitCount + row.position),
  );
  return { result, columns, rows };
}

type ActiveCell =
  | { row: "carry" | "partial" | "result"; rowIndex: number; digitIndex: number }
  | null;

function WrittenExample({ a, b, index, readOnly }: { a: number; b: number; index: number; readOnly: boolean }) {
  const layout = getWrittenMultiplicationLayout(a, b);
  const [carryValues, setCarryValues] = useState<string[][]>(() => layout.rows.map((row) => Array(row.carryCount).fill("")));
  const [partialValues, setPartialValues] = useState<string[][]>(() => layout.rows.map((row) => Array(row.digitCount).fill("")));
  const [resultValues, setResultValues] = useState<string[]>(() => Array(String(layout.result).length).fill(""));
  const [active, setActive] = useState<ActiveCell>(null);

  const change = (digit: string) => {
    if (readOnly || !active) return;
    const update = (current: string[]) => current.map((value, cellIndex) => (
      cellIndex === active.digitIndex
        ? digit === "←" ? value.slice(0, -1) : digit
        : value
    ));

    if (active.row === "result") {
      setResultValues(update);
    } else if (active.row === "partial") {
      setPartialValues((current) => current.map((row, rowIndex) => rowIndex === active.rowIndex ? update(row) : row));
    } else {
      setCarryValues((current) => current.map((row, rowIndex) => rowIndex === active.rowIndex ? update(row) : row));
    }

    if (digit !== "←" && active.digitIndex > 0) {
      setActive({ ...active, digitIndex: active.digitIndex - 1 });
    }
  };

  const inputClass = (selected: boolean, small = false) => `grid place-items-center rounded-lg border-2 font-mono font-black transition ${small ? "h-8 w-8 text-base" : "h-10 w-10 text-xl sm:h-11 sm:w-11 sm:text-2xl"} ${selected ? "border-cyan-500 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50" : "border-slate-300 bg-white text-slate-950"}`;
  const blankClass = "h-10 w-10 sm:h-11 sm:w-11";
  const disabledClass = "grid h-10 w-10 place-items-center rounded-lg border-2 border-slate-400 bg-slate-300 text-sm font-black text-slate-500 sm:h-11 sm:w-11";

  const renderCarryCells = (row: MultiplicationLayoutRow, rowIndex: number) => {
    const digitStart = layout.columns - row.position - row.digitCount;
    const carryStart = Math.max(0, digitStart);
    return Array.from({ length: layout.columns }, (_, column) => {
      const carryIndex = column - carryStart;
      if (carryIndex >= 0 && carryIndex < row.carryCount) {
        return <button type="button" key={`carry-${rowIndex}-${column}`} aria-label={`Przeniesienie, zadanie ${index + 1}, piętro ${rowIndex + 1}, cyfra ${carryIndex + 1}`} disabled={readOnly} onClick={() => setActive({ row: "carry", rowIndex, digitIndex: carryIndex })} className={inputClass(active?.row === "carry" && active.rowIndex === rowIndex && active.digitIndex === carryIndex, true)}>{carryValues[rowIndex]?.[carryIndex] ?? ""}</button>;
      }
      return <span key={`carry-empty-${rowIndex}-${column}`} className={blankClass} aria-hidden />;
    });
  };

  const renderPartialCells = (row: MultiplicationLayoutRow, rowIndex: number) => {
    const digitStart = layout.columns - row.position - row.digitCount;
    const digitEnd = layout.columns - row.position;
    return Array.from({ length: layout.columns }, (_, column) => {
      if (column >= digitStart && column < digitEnd) {
        const digitIndex = column - digitStart;
        return <button type="button" key={`partial-${rowIndex}-${column}`} aria-label={`Iloczyn częściowy, zadanie ${index + 1}, piętro ${rowIndex + 1}, cyfra ${digitIndex + 1}`} disabled={readOnly} onClick={() => setActive({ row: "partial", rowIndex, digitIndex })} className={inputClass(active?.row === "partial" && active.rowIndex === rowIndex && active.digitIndex === digitIndex)}>{partialValues[rowIndex]?.[digitIndex] ?? ""}</button>;
      }
      if (column >= digitEnd) {
        return <span key={`partial-disabled-${rowIndex}-${column}`} className={disabledClass} aria-label={`Nieużywana kratka, zadanie ${index + 1}, piętro ${rowIndex + 1}`} aria-hidden />;
      }
      return <span key={`partial-empty-${rowIndex}-${column}`} className={blankClass} aria-hidden />;
    });
  };

  const resultStart = layout.columns - resultValues.length;
  const renderResultCells = () => Array.from({ length: layout.columns }, (_, column) => {
    if (column < resultStart) return <span key={`result-empty-${column}`} className={blankClass} aria-hidden />;
    const digitIndex = column - resultStart;
    return <button type="button" key={`result-${column}`} aria-label={`Wynik końcowy, zadanie ${index + 1}, cyfra ${digitIndex + 1}`} disabled={readOnly} onClick={() => setActive({ row: "result", rowIndex: 0, digitIndex })} className={inputClass(active?.row === "result" && active.digitIndex === digitIndex)}>{resultValues[digitIndex]}</button>;
  });

  const typedResult = resultValues.join("");
  const resultComplete = resultValues.every(Boolean);
  const resultCorrect = resultComplete && Number(typedResult) === layout.result;

  return <article aria-label={`Zadanie ${index + 1}: ${a} razy ${b}`} className="rounded-3xl bg-slate-100 p-4 text-slate-950 shadow-lg sm:p-5">
    <p className="mb-3 text-center font-mono text-2xl font-black">{a} × {b}</p>
    <div className="overflow-x-auto"><div className="mx-auto grid w-fit items-center gap-2" style={{ gridTemplateColumns: `6.5rem repeat(${layout.columns}, 2.75rem)` }}>
      <span /><span className="col-span-full text-right font-mono text-2xl font-black">{a}</span>
      <span className="text-right text-sm font-bold">mnożnik</span><span className="col-span-full text-right font-mono text-2xl font-black">{b}</span>
      <span /><span className="col-span-full border-b-4 border-slate-900" />
      {layout.rows.map((row, rowIndex) => <Fragment key={`row-${rowIndex}`}>
        <span className="text-right text-[10px] font-bold uppercase">przeniesienie {rowIndex + 1}</span>{renderCarryCells(row, rowIndex)}
        <span className="text-right text-[10px] font-bold">{rowIndex + 1}. piętro</span>{renderPartialCells(row, rowIndex)}
      </Fragment>)}
      <span /><span className="col-span-full mt-1 border-b-4 border-slate-900" />
      <span className="text-right text-xs font-black uppercase">wynik</span>{renderResultCells()}
    </div></div>
    <p className="mt-3 text-center text-xs font-bold text-slate-600">Kratki szare są nieużywane. Sprawdzany jest wyłącznie wynik końcowy.</p>
    <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">{"123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly || !active} onClick={() => change(digit)} className="min-h-11 rounded-xl bg-slate-900 font-black text-white disabled:opacity-40">{digit}</button>)}<button type="button" disabled={readOnly || !active} onClick={() => change("0")} className="min-h-11 rounded-xl bg-slate-900 font-black text-white disabled:opacity-40">0</button><button type="button" disabled={readOnly || !active} onClick={() => change("←")} className="col-span-2 min-h-11 rounded-xl bg-rose-300 font-black text-rose-950 disabled:opacity-40">← Usuń cyfrę</button></div>
    {resultComplete ? <p className={`mt-3 rounded-xl px-3 py-2 text-center text-sm font-black ${resultCorrect ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>{resultCorrect ? "Wynik końcowy jest poprawny." : "Wynik końcowy jest niepoprawny — popraw dolne kratki."}</p> : null}
  </article>;
}

export function WrittenMultiplicationLessonModel({ seed = 1, readOnly = false }: { seed?: number; readOnly?: boolean }) {
  return <section data-seed={seed} className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
    <p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · MNOŻENIE PISEMNE</p>
    <h3 className="mt-1 text-3xl font-black sm:text-5xl">Mnożenie pisemne piętrami</h3>
    <p className="mt-2 text-slate-200">Wykonaj cztery zadania. Liczba pięter odpowiada liczbie cyfr mnożnika. Szare kratki oznaczają zera wynikające z przesunięcia i nie wymagają wpisywania.</p>
    <div className="mt-6 grid gap-5 xl:grid-cols-2">{FIRST_SLIDE_EXAMPLES.map((example, index) => <WrittenExample key={`${example.a}-${example.b}`} {...example} index={index} readOnly={readOnly} />)}</div>
  </section>;
}
