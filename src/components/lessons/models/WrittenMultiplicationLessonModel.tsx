"use client";

import { Fragment, useMemo, useState } from "react";

const FIRST_SLIDE_EXAMPLES = [
  { a: 782, b: 36 },
  { a: 47, b: 183 },
  { a: 7, b: 4209 },
  { a: 724, b: 509 },
] as const;

const SECOND_SLIDE_EXAMPLES = [
  { a: 23, b: 14 },
  { a: 36, b: 24 },
] as const;

type ActiveCell = { row: "partial" | "result"; rowIndex: number; digitIndex: number } | null;

function digitsFor(value: number) { return String(value); }

function WrittenExample({ a, b, readOnly }: { a: number; b: number; readOnly: boolean }) {
  const multiplierDigits = String(b).split("").reverse().map(Number);
  const partialExpected = multiplierDigits.map((digit, position) => a * digit * (10 ** position));
  const resultExpected = a * b;
  const columns = Math.max(String(a).length, String(b).length, String(resultExpected).length, ...partialExpected.map((value) => String(value).length));
  const [partials, setPartials] = useState<string[][]>(() => partialExpected.map((value) => Array(String(value).length).fill("")));
  const [result, setResult] = useState<string[]>(() => Array(String(resultExpected).length).fill(""));
  const [active, setActive] = useState<ActiveCell>(null);

  const change = (digit: string) => {
    if (readOnly || !active) return;
    if (active.row === "result") {
      setResult((current) => current.map((value, index) => index === active.digitIndex ? digit === "←" ? value.slice(0, -1) : digit : value));
    } else {
      setPartials((current) => current.map((row, rowIndex) => rowIndex === active.rowIndex ? row.map((value, index) => index === active.digitIndex ? digit === "←" ? value.slice(0, -1) : digit : value) : row));
    }
    if (digit !== "←" && active.digitIndex > 0) setActive({ ...active, digitIndex: active.digitIndex - 1 });
  };

  const renderRow = (value: number, row: "partial" | "result", rowIndex: number, values: string[]) => {
    const expectedDigits = digitsFor(value);
    const offset = columns - expectedDigits.length;
    return Array.from({ length: columns }, (_, column) => {
      if (column < offset) return <span key={`${row}-${rowIndex}-empty-${column}`} className="h-11 w-11" aria-hidden />;
      const digitIndex = column - offset;
      return <button type="button" key={`${row}-${rowIndex}-${digitIndex}`} aria-label={`${row === "result" ? "Wynik" : `Iloczyn częściowy ${rowIndex + 1}`}, cyfra ${digitIndex + 1}`} disabled={readOnly} onClick={() => setActive({ row, rowIndex, digitIndex })} className={`grid h-11 w-11 place-items-center rounded-lg border-2 font-mono text-xl font-black ${active?.row === row && active.rowIndex === rowIndex && active.digitIndex === digitIndex ? "border-cyan-500 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50" : "border-slate-300 bg-white text-slate-950"}`}>{values[digitIndex] || ""}</button>;
    });
  };

  return <article className="rounded-3xl bg-slate-100 p-4 text-slate-950 shadow-lg sm:p-5"><p className="mb-3 text-center font-mono text-2xl font-black">{a} × {b}</p><div className="overflow-x-auto"><div className="mx-auto grid w-fit items-center gap-2" style={{ gridTemplateColumns: `2.5rem repeat(${columns}, 2.75rem)` }}><span /><span className="col-span-full text-right font-mono text-2xl font-black">{a}</span><span className="text-2xl font-black">×</span><span className="col-span-full text-right font-mono text-2xl font-black">{b}</span><span /><span className="col-span-full border-b-4 border-slate-900" />{partials.map((values, index) => <Fragment key={`partial-row-${index}`}><span className="text-[10px] font-bold">{index + 1}. piętro</span>{renderRow(partialExpected[index]!, "partial", index, values)}</Fragment>)}<span /><span className="col-span-full mt-1 border-b-4 border-slate-900" /><span className="font-bold">Σ</span>{renderRow(resultExpected, "result", 0, result)}</div></div><p className="mt-3 text-center text-xs font-bold text-slate-600">Uzupełnij każde piętro, a pod kreską wpisz wynik końcowy.</p><div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">{"123456789".split("").map((digit) => <button type="button" key={digit} disabled={readOnly} onClick={() => change(digit)} className="min-h-11 rounded-xl bg-slate-900 font-black text-white">{digit}</button>)}<button type="button" disabled={readOnly} onClick={() => change("0")} className="min-h-11 rounded-xl bg-slate-900 font-black text-white">0</button><button type="button" disabled={readOnly} onClick={() => change("←")} className="col-span-2 min-h-11 rounded-xl bg-rose-300 font-black text-rose-950">← Usuń cyfrę</button></div></article>;
}

export function WrittenMultiplicationLessonModel({ seed = 1, readOnly = false }: { seed?: number; readOnly?: boolean }) {
  const examples = useMemo(() => seed === 1 ? FIRST_SLIDE_EXAMPLES : SECOND_SLIDE_EXAMPLES, [seed]);
  return <section className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8"><p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · MNOŻENIE PISEMNE</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">Mnożenie piętrami</h3><p className="mt-2 text-slate-200">Wpisz cyfry każdego iloczynu częściowego, oddziel je kreską i uzupełnij wynik końcowy. Każde pole ma własną kratkę i klawiaturę kalkulatora.</p><div className="mt-6 grid gap-5 xl:grid-cols-2">{examples.map((example) => <WrittenExample key={`${example.a}-${example.b}`} {...example} readOnly={readOnly} />)}</div></section>;
}
