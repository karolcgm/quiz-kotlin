"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createPublicDecimalDecimalMultiplyL1Task,
  decimalDecimalMentalExpectedAnswer,
  decimalDecimalMultiplyExpectedAnswer,
  decimalDecimalWrittenTrace,
  isDecimalDecimalMultiplyL1Activity,
  validateDecimalDecimalMultiplyAnswer,
  type DecimalDecimalMultiplyL1Activity,
  type DecimalDecimalStoryPicture,
} from "@/lib/math/decimals/decimalDecimalMultiplyL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<DecimalDecimalMultiplyL1Activity, string> = {
  "decimal-decimal-mental": "Mnożenie w pamięci",
  "decimal-decimal-written": "Mnożenie pisemne ułamków dziesiętnych",
  "decimal-decimal-story": "Zadania tekstowe",
};

type ActiveCell =
  | { field: "mental" | "places" | "story" }
  | { field: "carry" | "partial" | "result"; row: number; index: number };

function decimalDigits(display: string): string {
  return display.replace(",", "");
}

function commaPosition(display: string): number {
  const commaIndex = display.indexOf(",");
  return commaIndex === -1 ? decimalDigits(display).length : commaIndex;
}

function placesAfterComma(display: string): number {
  const commaIndex = display.indexOf(",");
  return commaIndex === -1 ? 0 : display.length - commaIndex - 1;
}

function withComma(digits: string, position: number): string {
  return `${digits.slice(0, position)},${digits.slice(position)}`;
}

function writtenCalculationDisplay(rawProduct: string, decimalPlaces: number): string {
  if (decimalPlaces === 0) return rawProduct;
  const digits = rawProduct.padStart(decimalPlaces + 1, "0");
  return withComma(digits, digits.length - decimalPlaces);
}

function CommaPlacementRow({
  digits,
  position,
  label,
  small = false,
}: {
  digits: readonly string[];
  position: number;
  label: string;
  small?: boolean;
}) {
  return <span className={`flex items-end justify-center ${small ? "gap-1" : "gap-2"}`} aria-label={label} data-comma-position={position}>
    {digits.map((digit, index) => <span key={`${digit}-${index}`} className="relative grid">
      {position === 0 && index === 0 ? <span className={`absolute bottom-0 left-[-0.25rem] z-10 -translate-x-1/2 font-black text-indigo-700 ${small ? "text-2xl" : "text-4xl"}`} aria-label="przecinek">,</span> : null}
      <span className={`grid place-items-center rounded-lg border-2 border-slate-400 bg-white font-mono font-black text-slate-950 ${small ? "h-10 w-10 text-xl" : "h-14 w-14 text-3xl"}`}>{digit || ""}</span>
      {position === index + 1 ? <span className={`absolute bottom-0 left-[calc(100%+0.25rem)] z-10 -translate-x-1/2 font-black text-indigo-700 ${small ? "text-2xl" : "text-4xl"}`} aria-label="przecinek">,</span> : null}
    </span>)}
  </span>;
}

function CommaMoveButton({ position, digitCount, onMove, readOnly, label = "wyniku" }: { position: number; digitCount: number; onMove: () => void; readOnly: boolean; label?: string }) {
  return <div className="flex flex-wrap items-center justify-center gap-3">
    {!readOnly ? <button type="button" onClick={onMove} className="rounded-xl border-2 border-indigo-500 bg-indigo-50 px-4 py-2 font-black text-indigo-950" aria-label="Przesuń przecinek o jedno miejsce w lewo">
      Przesuń przecinek o jedno miejsce w lewo
    </button> : null}
    <p className="text-center text-sm font-bold text-slate-700" aria-live="polite">Przecinek w {label}: po {position} z {digitCount} cyfr.</p>
  </div>;
}

function MentalExample() {
  return <section className="space-y-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5">
    <h3 className="text-xl font-black text-cyan-950">Prosty przykład można obliczyć w pamięci</h3>
    <div className="grid gap-3 md:grid-cols-3">
      <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">0,2 · 0,3</p>
      <p className="rounded-xl bg-white p-4 text-center font-black">2 · 3 = 6<br /><span className="text-sm text-slate-600">łącznie 2 miejsca po przecinku</span></p>
      <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">0,06</p>
    </div>
  </section>;
}

function WrittenExample() {
  const ExampleRow = ({ digits, commaAfter, operator = "", label = "" }: { digits: readonly string[]; commaAfter?: number; operator?: string; label?: string }) => {
    const start = 4 - digits.length;
    return <div className="grid items-end gap-x-1 font-mono text-xl font-black text-slate-950" style={{ gridTemplateColumns: "2rem repeat(4, 2.4rem) minmax(6rem, auto)" }}>
      <span className="text-center text-2xl">{operator}</span>
      {Array.from({ length: 4 }, (_, column) => {
        const index = column - start;
        if (index < 0 || index >= digits.length) return <span key={column} className="h-8" aria-hidden />;
        return <span key={column} className="relative grid h-8 place-items-center">
          {digits[index]}
          {commaAfter === index + 1 ? <span className="absolute -right-1 bottom-0 text-2xl" aria-hidden>,</span> : null}
        </span>;
      })}
      <span className="pb-1 font-sans text-xs font-black text-indigo-700">{label}</span>
    </div>;
  };

  return <section className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <div>
      <h3 className="text-xl font-black text-amber-950">Przykład poprawnego zapisu</h3>
      <p className="mt-2 font-bold text-amber-950">Zapisujemy oba czynniki z przecinkami. Liczymy miejsca po przecinku w czynnikach, a ich sumę zaznaczamy w wyniku.</p>
    </div>
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(280px,1fr)] lg:items-center">
      <div className="rounded-2xl bg-white p-4 text-center font-black text-slate-950">
        <p className="text-2xl">1,2 · 0,35</p>
        <p className="mt-3 text-sm">1 miejsce + 2 miejsca = 3 miejsca po przecinku</p>
      </div>
      <div className="mx-auto w-full max-w-md overflow-x-auto rounded-2xl bg-white p-4" aria-label="Przykład pisemny 1,2 razy 0,35">
        <div className="mx-auto w-fit">
          <ExampleRow digits={["1", "2"]} commaAfter={1} label="1 miejsce" />
          <ExampleRow digits={["0", "3", "5"]} commaAfter={1} operator="·" label="2 miejsca" />
          <div className="ml-8 mr-24 my-1 border-t-2 border-slate-950" />
          <ExampleRow digits={["6", "0"]} />
          <ExampleRow digits={["3", "6", "0"]} operator="+" />
          <div className="ml-8 mr-24 my-1 border-t-2 border-slate-950" />
          <ExampleRow digits={["0", "4", "2", "0"]} commaAfter={1} label="3 miejsca" />
        </div>
        <p className="mt-3 border-t border-amber-200 pt-2 font-sans text-xs font-bold text-slate-600">Wynik zapisujemy z przecinkiem dokładnie między cyframi: 0,420.</p>
      </div>
    </div>
  </section>;
}

function StoryPicture({ kind }: { kind: DecimalDecimalStoryPicture }) {
  const source = {
    garden: "/lessons/illustrations/decimals/story/multiply-garden.png",
    apples: "/lessons/illustrations/decimals/story/multiply-apples.png",
    fabric: "/lessons/illustrations/decimals/story/multiply-fabric.png",
    panel: "/lessons/illustrations/decimals/story/multiply-panel.png",
  }[kind];
  if (source) return <Image src={source} alt={`Ilustracja do zadania: ${kind}`} aria-label={`Ilustracja do zadania: ${kind}`} width={1536} height={1024} sizes="(min-width: 1024px) 768px, 100vw" className="h-auto w-full object-cover" />;
  return <svg viewBox="0 0 280 190" role="img" aria-label={`Ilustracja do zadania: ${kind}`} className="mx-auto h-auto w-full max-w-[280px]">
    <rect x="4" y="4" width="272" height="182" rx="24" fill="#fff" stroke="#6ee7b7" strokeWidth="4" />
    {kind === "garden" ? <>
      <path d="M38 50 225 34l20 104-188 16z" fill="#bbf7d0" stroke="#166534" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, index) => <circle key={index} cx={72 + (index % 4) * 42} cy={68 + Math.floor(index / 4) * 33} r="9" fill={index % 2 ? "#f472b6" : "#facc15"} stroke="#166534" strokeWidth="2" />)}
    </> : kind === "apples" ? <>
      <path d="M55 145h170l-18 25H74z" fill="#a16207" stroke="#713f12" strokeWidth="4" />
      {Array.from({ length: 9 }, (_, index) => <g key={index} transform={`translate(${70 + (index % 5) * 34} ${55 + Math.floor(index / 5) * 42})`}><circle cx="14" cy="17" r="15" fill="#f87171" stroke="#b91c1c" strokeWidth="3" /><path d="M14 3c0-9 7-12 12-13" stroke="#166534" strokeWidth="4" /></g>)}
    </> : kind === "fabric" ? <>
      <path d="M45 45h165l27 36-36 78H60L38 116z" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="5" />
      <path d="M52 62h150M48 86h170M50 110h158M58 134h138" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="10 7" />
      <circle cx="224" cy="139" r="22" fill="#fef3c7" stroke="#b45309" strokeWidth="4" /><path d="M212 127l24 24M236 127l-24 24" stroke="#b45309" strokeWidth="4" />
    </> : <>
      <path d="M52 48h177v104H52z" fill="#bae6fd" stroke="#0369a1" strokeWidth="6" />
      <path d="M52 48l177 104M229 48 52 152" stroke="#38bdf8" strokeWidth="3" />
      <circle cx="52" cy="48" r="6" fill="#0f172a" /><circle cx="229" cy="48" r="6" fill="#0f172a" /><circle cx="52" cy="152" r="6" fill="#0f172a" /><circle cx="229" cy="152" r="6" fill="#0f172a" />
    </>}
  </svg>;
}

function cellClass(active: boolean, small = false): string {
  return `grid place-items-center rounded-lg border-2 bg-white font-mono font-black text-slate-950 ${small ? "h-7 w-7 text-sm" : "h-11 w-11 text-xl sm:h-12 sm:w-12 sm:text-2xl"} ${active ? "border-indigo-600 ring-4 ring-indigo-100" : small ? "border-amber-400" : "border-slate-400"}`;
}

export interface DecimalDecimalMultiplyL1LabProps {
  activity: DecimalDecimalMultiplyL1Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export { isDecimalDecimalMultiplyL1Activity };

export function DecimalDecimalMultiplyL1Lab(props: DecimalDecimalMultiplyL1LabProps) {
  return <DecimalDecimalMultiplyRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />;
}

function DecimalDecimalMultiplyRound({
  activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange,
}: DecimalDecimalMultiplyL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalDecimalMultiplyL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const trace = decimalDecimalWrittenTrace(task);
  const expected = activity === "decimal-decimal-mental"
    ? decimalDecimalMentalExpectedAnswer(task)
    : decimalDecimalMultiplyExpectedAnswer(task);
  const writtenDisplay = writtenCalculationDisplay(trace.rawProduct, trace.decimalPlaces);
  const expectedDigits = decimalDigits(activity === "decimal-decimal-mental" ? expected : writtenDisplay);
  const expectedCommaPosition = commaPosition(activity === "decimal-decimal-mental" ? expected : writtenDisplay);
  const digitColumns = Math.max(trace.rawProduct.length, expectedDigits.length, trace.leftDigits.length, trace.rightDigits.length, ...trace.partialProducts.map((partial) => partial.value.length + partial.shift));
  const columns = digitColumns + 1;
  const fixedMentalLeadingZero = activity === "decimal-decimal-mental" && expected.startsWith("0,");
  const [mentalAnswer, setMentalAnswer] = useState(readOnly ? expectedDigits : fixedMentalLeadingZero ? "0" : "");
  const [mentalCommaPosition, setMentalCommaPosition] = useState(readOnly ? expectedCommaPosition : expectedDigits.length);
  const [placeCount, setPlaceCount] = useState(readOnly ? String(trace.decimalPlaces) : "");
  const [partialValues, setPartialValues] = useState<string[][]>(() => trace.partialProducts.map((partial) => readOnly ? [...partial.value] : [...partial.value].map(() => "")));
  const [carryValues, setCarryValues] = useState<string[][]>(() => trace.partialProducts.map(() => Array(Math.max(0, trace.leftDigits.length - 1)).fill("")));
  const [resultDigits, setResultDigits] = useState<string[]>(() => readOnly ? [...expectedDigits] : [...expectedDigits].map(() => ""));
  const [resultCommaPosition, setResultCommaPosition] = useState(readOnly ? expectedCommaPosition : expectedDigits.length);
  const [storyAnswer, setStoryAnswer] = useState(readOnly ? expected : "");
  const [active, setActive] = useState<ActiveCell>(activity === "decimal-decimal-mental" ? { field: "mental" } : { field: "places" });
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);

  const clearResult = () => { setStatus(null); onResultChange?.(null); };
  const resultDisplay = withComma(resultDigits.join(""), resultCommaPosition);
  const mentalDisplay = withComma(mentalAnswer, mentalCommaPosition);

  const changeSimple = (current: string, key: string, limit = 10) => {
    if (key === "backspace") return current.slice(0, -1);
    if (key === "," && current.includes(",")) return current;
    return current.length < limit ? `${current}${key}` : current;
  };

  const change = (key: string) => {
    if (readOnly) return;
    if (active.field === "mental") setMentalAnswer((current) => key === "backspace"
      ? current.length <= (fixedMentalLeadingZero ? 1 : 0) ? current : current.slice(0, -1)
      : key === "," || current.length >= expectedDigits.length ? current : `${current}${key}`);
    else if (active.field === "places") setPlaceCount((current) => key === "backspace" ? "" : key === "," ? current : key);
    else if (active.field === "story") setStoryAnswer((current) => changeSimple(current, key));
    else if (active.field === "result") {
      if (key === ",") return;
      const resultIndex = active.index;
      setResultDigits((current) => current.map((value, index) => index === resultIndex ? (key === "backspace" ? "" : key) : value));
      if (key !== "backspace") setActive({ field: "result", row: 0, index: Math.min(resultDigits.length - 1, resultIndex + 1) });
    } else {
      if (key === ",") return;
      const rowActive = active as { field: "carry" | "partial"; row: number; index: number };
      const rowField = rowActive.field;
      const rowIndex = rowActive.row;
      const cellIndex = rowActive.index;
      const setter = rowField === "carry" ? setCarryValues : setPartialValues;
      setter((current) => current.map((row, index) => index === rowIndex ? row.map((value, innerIndex) => innerIndex === cellIndex ? (key === "backspace" ? "" : key) : value) : row));
      const length = rowField === "carry" ? carryValues[rowIndex]?.length ?? 1 : partialValues[rowIndex]?.length ?? 1;
      if (key !== "backspace") setActive({ field: rowField, row: rowIndex, index: Math.min(length - 1, cellIndex + 1) });
    }
    clearResult();
  };

  const check = () => {
    const mental = mentalCommaPosition === expectedCommaPosition
      && validateDecimalDecimalMultiplyAnswer({ task, answer: mentalDisplay }).correct;
    const result = resultCommaPosition === expectedCommaPosition
      && validateDecimalDecimalMultiplyAnswer({ task, answer: resultDisplay }).correct;
    const partials = trace.partialProducts.every((partial, row) => partialValues[row]?.join("") === partial.value);
    const written = placeCount === String(trace.decimalPlaces) && partials && result;
    const story = activity !== "decimal-decimal-story" || validateDecimalDecimalMultiplyAnswer({ task, answer: storyAnswer }).correct;
    const correct = activity === "decimal-decimal-mental" ? mental : written && story;
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, activity === "decimal-decimal-story" ? `${storyAnswer || "brak odpowiedzi"} ${task.answerUnit}` : activity === "decimal-decimal-mental" ? mentalDisplay : resultDisplay);
  };

  const moveMentalComma = () => setMentalCommaPosition((current) => current === 0 ? expectedDigits.length : current - 1);
  const moveResultComma = () => setResultCommaPosition((current) => current === 0 ? resultDigits.length : current - 1);

  const renderFixedRow = (display: string, label: string) => {
    const digits = decimalDigits(display);
    const fixedCommaPosition = commaPosition(display);
    const start = columns - digits.length;
    return Array.from({ length: columns }, (_, column) => {
      const index = column - start;
      if (index < 0 || index >= digits.length) return <span key={`${label}-${column}`} aria-hidden />;
      return <span key={`${label}-${column}`} className="relative grid h-11 w-11 place-items-center rounded-lg border-2 border-emerald-700 bg-white font-mono text-3xl font-black sm:h-12 sm:w-12">
        {digits[index]}
        {fixedCommaPosition === index + 1 ? <span className="absolute bottom-0 left-[calc(100%+0.25rem)] z-10 -translate-x-1/2 text-3xl font-black text-slate-950" aria-hidden>,</span> : null}
      </span>;
    });
  };

  const renderWrittenWork = () => <>
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-indigo-50 p-3 font-black text-indigo-950">
      <span>{task.leftFactor}: {placesAfterComma(task.leftFactor)} {placesAfterComma(task.leftFactor) === 1 ? "miejsce" : "miejsca"} po przecinku</span>
      <span>{task.rightFactor}: {placesAfterComma(task.rightFactor)} {placesAfterComma(task.rightFactor) === 1 ? "miejsce" : "miejsca"} po przecinku</span>
      <button type="button" disabled={readOnly} onClick={() => setActive({ field: "places" })} className={cellClass(active.field === "places")} aria-label="Liczba miejsc po przecinku">{placeCount}</button>
      <span>miejsca po przecinku w wyniku</span>
    </div>
    <div className="overflow-x-auto pb-2">
      <div className="mx-auto grid w-fit items-end gap-x-1.5 gap-y-1 text-slate-950" style={{ gridTemplateColumns: `2.25rem repeat(${columns}, 3rem)` }} aria-label={`Mnożenie pisemne ${task.leftFactor} razy ${task.rightFactor}`} data-decimal-written-grid>
        {trace.partialProducts.map((partial, row) => {
          const carryStart = columns - partial.shift - trace.leftDigits.length;
          return <Fragment key={`carry-row-${row}`}>
            <span aria-hidden />
            {Array.from({ length: columns }, (_, column) => {
              const index = column - carryStart;
              return index >= 0 && index < carryValues[row]!.length ? <button key={`carry-top-${column}`} type="button" disabled={readOnly} aria-label={`Mała kratka ${index + 1}, rząd ${row + 1}`} onClick={() => setActive({ field: "carry", row, index })} className={`justify-self-center ${cellClass(active.field === "carry" && active.row === row && active.index === index, true)}`}>{carryValues[row]![index]}</button> : <span key={`carry-top-${column}`} className="h-7 w-7" aria-hidden />;
            })}
          </Fragment>;
        })}
        <span aria-hidden />{renderFixedRow(task.leftFactor, "left")}
        <span className="text-center text-4xl font-black" aria-label="razy">·</span>{renderFixedRow(task.rightFactor, "right")}
        <span aria-hidden /><span className="border-b-4 border-slate-950" style={{ gridColumn: "2 / -1" }} />
        {trace.partialProducts.map((partial, row) => {
          const start = columns - partial.shift - partial.value.length;
          return <Fragment key={`partial-${row}`}>
            <span aria-hidden />
            <span className="text-center text-3xl font-black">{row === trace.partialProducts.length - 1 && row > 0 ? "+" : ""}</span>
            {Array.from({ length: columns }, (_, column) => {
              const index = column - start;
              if (column >= columns - partial.shift) return <span key={column} aria-hidden />;
              if (index < 0 || index >= partial.value.length) return <span key={column} aria-hidden />;
              return <button key={column} type="button" disabled={readOnly} aria-label={`Iloczyn częściowy ${row + 1}, kratka ${index + 1}`} onClick={() => setActive({ field: "partial", row, index })} className={cellClass(active.field === "partial" && active.row === row && active.index === index)}>{partialValues[row]![index]}</button>;
            })}
          </Fragment>;
        })}
        <span aria-hidden /><span className="border-b-4 border-slate-950" style={{ gridColumn: "2 / -1" }} />
        <span className="text-right text-[10px] font-black uppercase text-slate-600">wynik</span>
        {Array.from({ length: columns }, (_, column) => {
          const start = columns - resultDigits.length;
          const index = column - start;
          if (index < 0 || index >= resultDigits.length) return <span key={`result-empty-${column}`} aria-hidden />;
          return <span key={`result-${column}`} className="relative grid">
            <button type="button" disabled={readOnly} aria-label={`Wynik, kratka ${index + 1}`} onClick={() => setActive({ field: "result", row: 0, index })} className={cellClass(active.field === "result" && active.index === index)}>{resultDigits[index]}</button>
            {resultCommaPosition === index + 1 ? <span className="absolute bottom-0 left-[calc(100%+0.25rem)] z-10 -translate-x-1/2 text-3xl font-black text-indigo-700" aria-label="przecinek">,</span> : null}
          </span>;
        })}
      </div>
    </div>
    <CommaMoveButton position={resultCommaPosition} digitCount={resultDigits.length} onMove={moveResultComma} readOnly={readOnly} />
  </>;

  return <LessonTaskFrame
    className="space-y-5"
    contentClassName="space-y-5"
    eyebrow="Dział 5 · Ułamki dziesiętne"
    heading={TITLES[activity]}
    description={activity === "decimal-decimal-mental" ? "Oblicz proste iloczyny w pamięci." : activity === "decimal-decimal-story" ? "Przeczytaj zadanie, wykonaj mnożenie pisemne i zapisz odpowiedź." : "Uzupełnij wszystkie etapy mnożenia pisemnego."}
    questionNumber={questionNumber}
    questionCount={questionCount}
    data-decimal-decimal-multiply-l1
    data-decimal-activity={activity}
    data-seed={effectiveSeed}
    data-presentation-mode={presentationMode || undefined}
  >
    {activity === "decimal-decimal-mental" ? <MentalExample /> : activity === "decimal-decimal-written" ? <WrittenExample /> : null}
    {activity === "decimal-decimal-story" && task.story && task.storyQuestion && task.pictureKind ? <section className="space-y-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
      <div className="space-y-3"><h3 className="text-xl font-black text-emerald-950">Przeczytaj zadanie</h3><p className="text-lg font-bold text-emerald-950">{task.story}</p><p className="text-lg font-black text-emerald-950">{task.storyQuestion}</p></div>
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm"><StoryPicture kind={task.pictureKind} /></div>
    </section> : null}
    <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4 sm:p-5">
      {activity === "decimal-decimal-mental" ? <div className="space-y-4 rounded-2xl bg-indigo-50 p-4">
        <p className="text-center text-3xl font-black text-slate-950">{task.leftFactor} · {task.rightFactor} =</p>
        <button type="button" disabled={readOnly} onClick={() => setActive({ field: "mental" })} className={`mx-auto block rounded-2xl border-2 bg-white p-3 ${active.field === "mental" ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`} aria-label="Wynik działania w pamięci">
          <CommaPlacementRow digits={Array.from({ length: expectedDigits.length }, (_, index) => mentalAnswer[index] ?? "")} position={mentalCommaPosition} label="Wynik z przecinkiem do przesunięcia" />
        </button>
        <CommaMoveButton position={mentalCommaPosition} digitCount={expectedDigits.length} onMove={moveMentalComma} readOnly={readOnly} label="wyniku w pamięci" />
      </div> : <>
        {activity === "decimal-decimal-story" ? <div className="space-y-1 text-center"><h3 className="text-xl font-black text-slate-950">Schemat rozwiązania</h3><p className="font-bold text-slate-700">Zapisz czynniki z przecinkami, uzupełnij działanie i ustaw przecinek w wyniku.</p></div> : null}
        {renderWrittenWork()}
        {activity === "decimal-decimal-story" ? <button type="button" disabled={readOnly} onClick={() => setActive({ field: "story" })} className={`mx-auto flex min-h-14 max-w-md items-center justify-center gap-3 rounded-xl border-2 bg-emerald-50 px-4 text-lg font-black text-emerald-950 ${active.field === "story" ? "border-emerald-700 ring-4 ring-emerald-100" : "border-emerald-300"}`} aria-label="Odpowiedź do zadania tekstowego"><span>Odpowiedź:</span><span className="min-w-24 rounded-lg bg-white px-3 py-1 text-2xl">{storyAnswer}</span><span>{task.answerUnit}</span></button> : null}
      </>}
      {!readOnly ? <LessonNumericKeypad allowSeparator={active.field === "story"} onKey={change} onConfirm={check} label={activity === "decimal-decimal-story" ? "Kalkulator do rozwiązania zadania" : "Kalkulator do mnożenia"} helperText={active.field === "mental" ? "Wpisz cyfry wyniku, a przecinek ustaw przyciskiem przesuwania." : active.field === "places" ? "Wpisz łączną liczbę miejsc po przecinku." : active.field === "carry" ? "Wpisujesz cyfrę w małej kratce pomocniczej." : active.field === "partial" ? "Uzupełnij iloczyn częściowy." : active.field === "story" ? "Wpisz odpowiedź liczbową; jednostka jest już podana." : "Kliknij kratkę, wpisz cyfrę i uzupełnij wszystkie etapy."} /> : null}
      {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? `Dobrze! ${task.leftFactor} · ${task.rightFactor} = ${expected}${activity === "decimal-decimal-story" ? ` ${task.answerUnit}` : ""}.` : "Sprawdź iloczyny częściowe, liczbę miejsc po przecinku, wynik i odpowiedź."}</p> : null}
    </section>
  </LessonTaskFrame>;
}
