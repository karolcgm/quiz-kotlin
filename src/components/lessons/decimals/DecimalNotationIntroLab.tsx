"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export const DECIMAL_NOTATION_INTRO_ACTIVITIES = [
  "place-names",
  "decimal-to-fraction-example",
  "decimal-to-fraction-practice",
  "fraction-to-decimal-example",
  "fraction-to-decimal-practice",
  "decimal-number-line",
] as const;

export type DecimalNotationIntroActivity = typeof DECIMAL_NOTATION_INTRO_ACTIVITIES[number];

export function isDecimalNotationIntroActivity(value: string): value is DecimalNotationIntroActivity {
  return DECIMAL_NOTATION_INTRO_ACTIVITIES.includes(value as DecimalNotationIntroActivity);
}

type CellValue = Record<string, string>;

const PLACE_TASKS = [
  { number: "472,638", digit: "7", answer: "dziesiątki" },
  { number: "472,638", digit: "4", answer: "setki" },
  { number: "472,638", digit: "2", answer: "jedności" },
  { number: "472,638", digit: "6", answer: "części dziesiąte" },
  { number: "472,638", digit: "3", answer: "części setne" },
  { number: "472,638", digit: "8", answer: "części tysięczne" },
] as const;

const DECIMAL_TO_FRACTION = [
  { decimal: "0,6", raw: [6, 10], reduced: [3, 5] },
  { decimal: "0,24", raw: [24, 100], reduced: [6, 25] },
  { decimal: "0,125", raw: [125, 1000], reduced: [1, 8] },
  { decimal: "0,45", raw: [45, 100], reduced: [9, 20] },
  { decimal: "0,72", raw: [72, 100], reduced: [18, 25] },
  { decimal: "0,08", raw: [8, 100], reduced: [2, 25] },
  { decimal: "0,375", raw: [375, 1000], reduced: [3, 8] },
  { decimal: "0,14", raw: [14, 100], reduced: [7, 50] },
  { decimal: "0,005", raw: [5, 1000], reduced: [1, 200] },
  { decimal: "0,84", raw: [84, 100], reduced: [21, 25] },
] as const;

const FRACTION_TO_DECIMAL = [
  { source: [3, 5], expanded: [6, 10], decimal: "0,6" },
  { source: [7, 20], expanded: [35, 100], decimal: "0,35" },
  { source: [9, 25], expanded: [36, 100], decimal: "0,36" },
  { source: [3, 8], expanded: [375, 1000], decimal: "0,375" },
  { source: [11, 20], expanded: [55, 100], decimal: "0,55" },
  { source: [13, 25], expanded: [52, 100], decimal: "0,52" },
  { source: [7, 8], expanded: [875, 1000], decimal: "0,875" },
  { source: [17, 20], expanded: [85, 100], decimal: "0,85" },
  { source: [3, 40], expanded: [75, 1000], decimal: "0,075" },
  { source: [9, 50], expanded: [18, 100], decimal: "0,18" },
] as const;

const AXIS_TASKS = [
  { label: "0,7", tick: 7, scale: "tenths" },
  { label: "0,35", tick: 5, scale: "hundredths" },
  { label: "1,4", tick: 4, scale: "ones" },
  { label: "0,08", tick: 8, scale: "small-hundredths" },
  { label: "0,2", tick: 2, scale: "tenths" },
  { label: "0,37", tick: 7, scale: "hundredths" },
  { label: "1,8", tick: 8, scale: "ones" },
  { label: "0,03", tick: 3, scale: "small-hundredths" },
  { label: "2,6", tick: 6, scale: "two-to-three" },
  { label: "1,25", tick: 5, scale: "one-twenties" },
] as const;

const PLACE_OPTIONS = ["setki", "dziesiątki", "jedności", "części dziesiąte", "części setne", "części tysięczne"];

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  let state = (seed >>> 0) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

function StaticFraction({ numerator, denominator }: { numerator: string | number; denominator: string | number }) {
  return <span className="inline-grid min-w-12 justify-items-stretch text-center align-middle font-black" aria-label={`${numerator}/${denominator}`} data-stacked-fraction><span>{numerator}</span><span className="my-1 border-t-2 border-slate-950" aria-hidden /><span>{denominator}</span></span>;
}

function ExpansionArrow({ label }: { label: string }) {
  return <div className="relative h-11 w-28" aria-label={`pomnóż przez ${label}`}>
    <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-md bg-cyan-100 px-2 text-sm font-black text-cyan-950">· {label}</span>
    <svg className="absolute inset-x-0 bottom-0 h-9 w-full overflow-visible" viewBox="0 0 112 36" aria-hidden>
      <path d="M4 29 Q56 2 103 27" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-cyan-700" />
      <path d="M94 20 L104 27 L94 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-700" />
    </svg>
  </div>;
}

function FractionExpansionExample() {
  return <div className="flex flex-wrap items-center justify-center gap-4 text-2xl">
    <div className="grid grid-cols-[3rem_7rem_4rem] grid-rows-2 items-center gap-y-3 text-center font-black" aria-label="Licznik i mianownik mnożymy przez 25" data-fraction-expansion>
      <span className="contents" aria-label="3/4" data-stacked-fraction>
        <span className="col-start-1 row-start-1 border-b-2 border-slate-950 pb-1">3</span>
        <span className="col-start-1 row-start-2">4</span>
      </span>
      <div className="col-start-2 row-start-1"><ExpansionArrow label="25" /></div>
      <div className="col-start-2 row-start-2"><ExpansionArrow label="25" /></div>
      <span className="contents" aria-label="75/100" data-stacked-fraction>
        <span className="col-start-3 row-start-1 border-b-2 border-slate-950 pb-1">75</span>
        <span className="col-start-3 row-start-2">100</span>
      </span>
    </div>
    <b>=</b>
    <b>0,75</b>
  </div>;
}

function FractionFields({ prefix, values, setActive, readOnly }: { prefix: string; values: CellValue; setActive: (id: string) => void; readOnly: boolean }) {
  const field = (part: "numerator" | "denominator") => {
    const id = `${prefix}-${part}`;
    return <input aria-label={`${prefix} ${part === "numerator" ? "licznik" : "mianownik"}`} value={values[id] ?? ""} readOnly className="h-12 w-20 rounded-xl border-2 border-indigo-300 bg-white text-center text-xl font-black focus:border-indigo-700 focus:outline-none" onFocus={() => setActive(id)} onClick={() => setActive(id)} />;
  };
  if (readOnly) return null;
  return <span className="inline-grid justify-items-stretch gap-1" data-fraction-fields>{field("numerator")}<span className="border-t-2 border-slate-950" aria-hidden />{field("denominator")}</span>;
}

function placeTable() {
  return <div className="rounded-2xl border-2 border-indigo-200 bg-white p-2"><table className="w-full table-fixed border-collapse text-center"><thead><tr>{["setki", "dziesiątki", "jedności", "przecinek", "części dziesiąte", "części setne", "części tysięczne"].map((label) => <th key={label} className="break-normal border border-indigo-200 bg-indigo-50 p-1 text-[0.56rem] font-black leading-tight hyphens-none sm:text-[0.68rem] lg:text-xs">{label}</th>)}</tr></thead><tbody><tr>{["4", "7", "2", ",", "6", "3", "8"].map((digit, index) => <td key={`${digit}-${index}`} className={`border border-indigo-200 p-2 text-2xl font-black sm:p-3 sm:text-3xl ${digit === "," ? "bg-amber-100" : ""}`}>{digit}</td>)}</tr></tbody></table></div>;
}

function axisConfig(scale: string) {
  if (scale === "hundredths") return { start: "0,30", end: "0,40", startValue: 0.3, step: 0.01, precision: 2 };
  if (scale === "ones") return { start: "1", end: "2", startValue: 1, step: 0.1, precision: 1 };
  if (scale === "small-hundredths") return { start: "0", end: "0,10", startValue: 0, step: 0.01, precision: 2 };
  if (scale === "two-to-three") return { start: "2", end: "3", startValue: 2, step: 0.1, precision: 1 };
  if (scale === "one-twenties") return { start: "1,20", end: "1,30", startValue: 1.2, step: 0.01, precision: 2 };
  return { start: "0", end: "1", startValue: 0, step: 0.1, precision: 1 };
}

type DecimalAxisConfig = ReturnType<typeof axisConfig>;

function decimalAxisLabel(axis: DecimalAxisConfig, tick: number) {
  const value = axis.startValue + axis.step * tick;
  const fixed = value.toFixed(axis.precision).replace(".", ",");
  if (tick === 0) return axis.start;
  if (tick === 10) return axis.end;
  return fixed;
}

function visibleDecimalAxisLabel(axis: DecimalAxisConfig, tick: number) {
  if (tick === 0 || tick === 10) return decimalAxisLabel(axis, tick);
  return "";
}

function DecimalNumberLine({
  axis,
  selectedTick,
  readOnly,
  onChange,
}: {
  axis: DecimalAxisConfig;
  selectedTick: number | null;
  readOnly: boolean;
  onChange: (tick: number) => void;
}) {
  const ticks = Array.from({ length: 11 }, (_, tick) => tick);
  const currentTick = selectedTick ?? 0;
  const xFor = (tick: number) => 48 + tick * 66.4;
  const label = `Oś liczbowa od ${axis.start} do ${axis.end}`;

  return <div className="grid gap-4">
    <AccessibleMathSvg
      title={label}
      description={`Oś podzielono na 10 równych odcinków. ${selectedTick === null ? "Punkt nie został jeszcze ustawiony." : `Punkt leży na kresce ${decimalAxisLabel(axis, selectedTick)}.`}`}
      viewBox="0 0 760 156"
      className="h-auto w-full"
      columns={[{ key: "tick", label: "Numer kreski" }, { key: "value", label: "Wartość" }]}
      rows={ticks.map((tick) => ({ tick, value: decimalAxisLabel(axis, tick) }))}
    >
      <line x1="48" y1="68" x2="712" y2="68" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
      {ticks.map((tick) => <g key={tick} data-decimal-axis-tick={tick}>
        <line x1={xFor(tick)} y1="51" x2={xFor(tick)} y2="85" stroke="#334155" strokeWidth="3" />
        {visibleDecimalAxisLabel(axis, tick) ? <text x={xFor(tick)} y="118" textAnchor="middle" fill="#0f172a" fontSize="15" fontWeight="800" data-decimal-axis-visible-label>
          {visibleDecimalAxisLabel(axis, tick)}
        </text> : null}
      </g>)}
      {selectedTick !== null ? <circle cx={xFor(selectedTick)} cy="68" r="13" fill="#4f46e5" stroke="#fff" strokeWidth="5" data-decimal-axis-point /> : null}
    </AccessibleMathSvg>

    {!readOnly ? <InteractionAlternativePanel
      title="Ustaw punkt na osi"
      instruction="Przeciągnij suwak albo użyj przycisków lewo i prawo. Punkt zawsze wskakuje dokładnie na kreskę podziałki."
    >
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={currentTick}
        aria-label="Przeciągnij punkt na osi ułamków dziesiętnych"
        aria-valuetext={selectedTick === null ? "Nie wybrano położenia" : decimalAxisLabel(axis, selectedTick)}
        className="min-h-11 w-full accent-indigo-600"
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="grid w-full grid-cols-[auto_minmax(9rem,1fr)_auto] items-center gap-2">
        <button type="button" className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 font-black disabled:opacity-40" disabled={currentTick <= 0} onClick={() => onChange(currentTick - 1)}>← lewo</button>
        <output className="grid min-h-11 place-items-center rounded-xl bg-indigo-50 px-3 text-center font-black text-indigo-950" aria-live="polite">
          {selectedTick === null ? "Ustaw punkt" : `Wybrano: ${decimalAxisLabel(axis, selectedTick)}`}
        </output>
        <button type="button" className="min-h-11 rounded-xl border-2 border-slate-300 bg-white px-3 font-black disabled:opacity-40" disabled={currentTick >= 10} onClick={() => onChange(currentTick + 1)}>prawo →</button>
      </div>
    </InteractionAlternativePanel> : null}
  </div>;
}

export interface DecimalNotationIntroLabProps {
  activity: DecimalNotationIntroActivity;
  seed: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalNotationIntroLab(props: DecimalNotationIntroLabProps) {
  return <DecimalNotationIntroRound key={`${props.activity}-${props.questionNumber ?? 1}`} {...props} />;
}

function DecimalNotationIntroRound({ activity, seed, readOnly = false, presentationMode = false, questionNumber = 1, questionCount = 1, onResultChange }: DecimalNotationIntroLabProps) {
  const index = Math.max(0, (questionNumber ?? 1) - 1);
  const placeTasks = useMemo(() => shuffled(PLACE_TASKS, seed), [seed]);
  const placeTask = placeTasks[index % placeTasks.length]!;
  const placeOptions = useMemo(() => shuffled(PLACE_OPTIONS, seed + index * 7919 + 17), [index, seed]);
  const [values, setValues] = useState<CellValue>({});
  const [active, setActive] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedTick, setSelectedTick] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const title = useMemo(() => ({
    "place-names": "Nazwy miejsc w liczbie dziesiętnej",
    "decimal-to-fraction-example": "Przykład zamiany ułamka dziesiętnego na zwykły",
    "decimal-to-fraction-practice": "Z ułamka dziesiętnego na ułamek zwykły",
    "fraction-to-decimal-example": "Przykład zamiany ułamka zwykłego na dziesiętny",
    "fraction-to-decimal-practice": "Z ułamka zwykłego na dziesiętny",
    "decimal-number-line": "Ułamki dziesiętne na osi liczbowej",
  }[activity]), [activity]);

  const enter = (key: string) => {
    if (!active) return;
    setValues((current) => ({ ...current, [active]: key === "backspace" ? (current[active] ?? "").slice(0, -1) : `${current[active] ?? ""}${key}` }));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    let correct = false;
    let label = "";
    if (activity === "place-names") {
      correct = selectedPlace === placeTask.answer;
      label = selectedPlace;
    } else if (activity === "decimal-to-fraction-practice") {
      const task = DECIMAL_TO_FRACTION[index % DECIMAL_TO_FRACTION.length]!;
      correct = values["raw-numerator"] === String(task.raw[0]) && values["raw-denominator"] === String(task.raw[1]) && values["reduced-numerator"] === String(task.reduced[0]) && values["reduced-denominator"] === String(task.reduced[1]);
      label = `${values["raw-numerator"]}/${values["raw-denominator"]} = ${values["reduced-numerator"]}/${values["reduced-denominator"]}`;
    } else if (activity === "fraction-to-decimal-practice") {
      const task = FRACTION_TO_DECIMAL[index % FRACTION_TO_DECIMAL.length]!;
      correct = values["expanded-numerator"] === String(task.expanded[0]) && values["expanded-denominator"] === String(task.expanded[1]) && values.decimal === task.decimal;
      label = `${values["expanded-numerator"]}/${values["expanded-denominator"]} = ${values.decimal}`;
    } else if (activity === "decimal-number-line") {
      const task = AXIS_TASKS[index % AXIS_TASKS.length]!;
      correct = selectedTick === task.tick;
      label = task.label;
    }
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, label);
  };

  const example = activity.includes("example");
  const interactive = !example && !readOnly;
  const decimalTask = DECIMAL_TO_FRACTION[index % DECIMAL_TO_FRACTION.length]!;
  const fractionTask = FRACTION_TO_DECIMAL[index % FRACTION_TO_DECIMAL.length]!;
  const axisTask = AXIS_TASKS[index % AXIS_TASKS.length]!;
  const axis = axisConfig(axisTask.scale);

  return <LessonTaskFrame eyebrow="Dział 5 · Ułamki dziesiętne" heading={title} description={activity === "place-names" ? "Nazwij miejsce wskazanej cyfry. Cyfry po przecinku oznaczają kolejno części dziesiąte, setne i tysięczne." : activity === "decimal-number-line" ? "Odczytaj podziałkę i zaznacz podaną liczbę." : "Zapisz wszystkie etapy zamiany. Ułamki zwykłe zapisujemy pionowo."} questionNumber={questionNumber} questionCount={questionCount} contentClassName="grid gap-4" data-decimal-notation-intro data-activity={activity} data-presentation-mode={presentationMode || undefined}>
    {activity === "place-names" ? <><section className="grid gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4"><h3 className="text-lg font-black">Każda cyfra ma swoje miejsce</h3>{placeTable()}<p className="font-bold">Przed przecinkiem: jedności, dziesiątki, setki. Po przecinku: części dziesiąte, setne, tysięczne.</p></section><section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><p className="text-lg font-black">Jak nazywa się miejsce cyfry <span className="rounded-lg bg-amber-300 px-2">{placeTask.digit}</span> w liczbie {placeTask.number}?</p><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{placeOptions.map((option) => <button key={option} type="button" disabled={readOnly} aria-pressed={selectedPlace === option} className="min-h-12 rounded-xl border-2 border-indigo-300 bg-white px-3 font-black aria-pressed:border-indigo-800 aria-pressed:bg-indigo-800 aria-pressed:text-white" onClick={() => { setSelectedPlace(option); setFeedback(null); }}>{option}</button>)}</div></section></> : null}

    {activity === "decimal-to-fraction-example" ? <section className="grid gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5"><h3 className="text-xl font-black">Przykład: 0,35</h3><p className="font-bold">Po przecinku są <b>2 cyfry</b>, więc mianownik ma 1 i <b>2 zera</b>: 100.</p><div className="flex flex-wrap items-center justify-center gap-4 text-2xl"><b>0,35</b><b>=</b><StaticFraction numerator={35} denominator={100} /><b>=</b><StaticFraction numerator={7} denominator={20} /></div><p className="font-bold">Na końcu skracamy ułamek do postaci nieskracalnej: licznik i mianownik dzielimy przez 5.</p></section> : null}

    {activity === "decimal-to-fraction-practice" ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-5"><p className="text-center text-3xl font-black">{decimalTask.decimal}</p><div className="flex flex-wrap items-center justify-center gap-4 text-2xl font-black"><span>{decimalTask.decimal}</span><span>=</span>{readOnly ? <StaticFraction numerator={decimalTask.raw[0]} denominator={decimalTask.raw[1]} /> : <FractionFields prefix="raw" values={values} setActive={setActive} readOnly={false} />}<span>=</span>{readOnly ? <StaticFraction numerator={decimalTask.reduced[0]} denominator={decimalTask.reduced[1]} /> : <FractionFields prefix="reduced" values={values} setActive={setActive} readOnly={false} />}</div><p className="text-center font-bold text-indigo-800">Pierwszy ułamek wynika z liczby miejsc po przecinku. Drugi ma być nieskracalny.</p></section> : null}

    {activity === "fraction-to-decimal-example" ? <section className="grid gap-4 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5"><h3 className="text-xl font-black">Przykład: rozszerz mianownik do 10, 100 lub 1000</h3><FractionExpansionExample /><p className="font-bold">Mianownik 4 rozszerzamy do 100. Skoro mnożymy mianownik przez 25, licznik też mnożymy przez 25. Dwie strzałki pokazują oba mnożenia.</p></section> : null}

    {activity === "fraction-to-decimal-practice" ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-5"><div className="flex flex-wrap items-center justify-center gap-4 text-2xl font-black"><StaticFraction numerator={fractionTask.source[0]} denominator={fractionTask.source[1]} /><span>=</span>{readOnly ? <StaticFraction numerator={fractionTask.expanded[0]} denominator={fractionTask.expanded[1]} /> : <FractionFields prefix="expanded" values={values} setActive={setActive} readOnly={false} />}<span>=</span>{readOnly ? <b>{fractionTask.decimal}</b> : <input aria-label="wynik dziesiętny" value={values.decimal ?? ""} readOnly className="h-12 w-28 rounded-xl border-2 border-indigo-300 text-center text-xl font-black" onFocus={() => setActive("decimal")} onClick={() => setActive("decimal")} />}</div><p className="text-center font-bold text-indigo-800">Rozszerz ułamek tak, aby mianownik był równy 10, 100 albo 1000. Potem zapisz liczbę z przecinkiem.</p></section> : null}

    {activity === "decimal-number-line" ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-5"><p className="text-center text-xl font-black">Zaznacz na osi liczbę {axisTask.label}</p><DecimalNumberLine axis={axis} selectedTick={selectedTick} readOnly={readOnly} onChange={(tick) => { setSelectedTick(tick); setFeedback(null); onResultChange?.(null); }} /></section> : null}

    {interactive && (activity === "decimal-to-fraction-practice" || activity === "fraction-to-decimal-practice") ? <LessonNumericKeypad allowSeparator={activity === "fraction-to-decimal-practice"} label="Kalkulator do zapisu ułamków" helperText="Kliknij dowolną kratkę i wpisz wszystkie etapy. Zatwierdź jeden raz na końcu." onKey={enter} onConfirm={check} /> : null}
    {interactive && (activity === "place-names" || activity === "decimal-number-line") ? <button type="button" className="min-h-12 rounded-xl bg-slate-950 px-5 font-black text-white" onClick={check}>Zatwierdź</button> : null}
    {feedback === "correct" ? <p role="status" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 font-black text-emerald-900">✓ Poprawnie. Możesz przejść do następnego zadania.</p> : null}
    {feedback === "incorrect" ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">Sprawdź jeszcze raz każde miejsce i wszystkie etapy zapisu.</p> : null}
  </LessonTaskFrame>;
}
