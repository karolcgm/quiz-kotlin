"use client";

import { useMemo, useState } from "react";
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
] as const;

const FRACTION_TO_DECIMAL = [
  { source: [3, 5], expanded: [6, 10], decimal: "0,6" },
  { source: [7, 20], expanded: [35, 100], decimal: "0,35" },
  { source: [9, 25], expanded: [36, 100], decimal: "0,36" },
  { source: [3, 8], expanded: [375, 1000], decimal: "0,375" },
  { source: [11, 20], expanded: [55, 100], decimal: "0,55" },
] as const;

const AXIS_TASKS = [
  { label: "0,7", tick: 7, scale: "tenths" },
  { label: "0,35", tick: 5, scale: "hundredths" },
  { label: "1,4", tick: 4, scale: "ones" },
  { label: "0,08", tick: 8, scale: "small-hundredths" },
] as const;

const PLACE_OPTIONS = ["setki", "dziesiątki", "jedności", "części dziesiąte", "części setne", "części tysięczne"];

function StaticFraction({ numerator, denominator }: { numerator: string | number; denominator: string | number }) {
  return <span className="inline-grid min-w-12 justify-items-stretch text-center align-middle font-black" aria-label={`${numerator}/${denominator}`} data-stacked-fraction><span>{numerator}</span><span className="my-1 border-t-2 border-slate-950" aria-hidden /><span>{denominator}</span></span>;
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
  return <div className="rounded-2xl border-2 border-indigo-200 bg-white p-2"><table className="w-full table-fixed border-collapse text-center"><thead><tr>{["setki", "dziesiątki", "jedności", "przecinek", "części dziesiąte", "części setne", "części tysięczne"].map((label) => <th key={label} className="break-words border border-indigo-200 bg-indigo-50 p-1 text-[0.68rem] font-black leading-tight sm:p-2 sm:text-sm">{label}</th>)}</tr></thead><tbody><tr>{["4", "7", "2", ",", "6", "3", "8"].map((digit, index) => <td key={`${digit}-${index}`} className={`border border-indigo-200 p-2 text-2xl font-black sm:p-3 sm:text-3xl ${digit === "," ? "bg-amber-100" : ""}`}>{digit}</td>)}</tr></tbody></table></div>;
}

function axisConfig(scale: string) {
  if (scale === "hundredths") return { start: "0,30", end: "0,40", labels: ["0,30", "0,35", "0,40"] };
  if (scale === "ones") return { start: "1", end: "2", labels: ["1", "1,5", "2"] };
  if (scale === "small-hundredths") return { start: "0", end: "0,10", labels: ["0", "0,05", "0,10"] };
  return { start: "0", end: "1", labels: ["0", "0,5", "1"] };
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

function DecimalNotationIntroRound({ activity, readOnly = false, presentationMode = false, questionNumber = 1, questionCount = 1, onResultChange }: DecimalNotationIntroLabProps) {
  const index = Math.max(0, (questionNumber ?? 1) - 1);
  const [values, setValues] = useState<CellValue>({});
  const [active, setActive] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const [selectedTick, setSelectedTick] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const title = useMemo(() => ({
    "place-names": "Nazwy miejsc w liczbie dziesiętnej",
    "decimal-to-fraction-example": "Z liczby dziesiętnej na ułamek zwykły — przykład",
    "decimal-to-fraction-practice": "Z liczby dziesiętnej na ułamek zwykły",
    "fraction-to-decimal-example": "Z ułamka zwykłego na dziesiętny — przykład",
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
      const task = PLACE_TASKS[index % PLACE_TASKS.length]!;
      correct = selectedPlace === task.answer;
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
    {activity === "place-names" ? <><section className="grid gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4"><h3 className="text-lg font-black">Każda cyfra ma swoje miejsce</h3>{placeTable()}<p className="font-bold">Przed przecinkiem: jedności, dziesiątki, setki. Po przecinku: części dziesiąte, setne, tysięczne.</p></section><section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><p className="text-lg font-black">Jak nazywa się miejsce cyfry <span className="rounded-lg bg-amber-300 px-2">{PLACE_TASKS[index % PLACE_TASKS.length]!.digit}</span> w liczbie {PLACE_TASKS[index % PLACE_TASKS.length]!.number}?</p><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{PLACE_OPTIONS.map((option) => <button key={option} type="button" disabled={readOnly} aria-pressed={selectedPlace === option} className="min-h-12 rounded-xl border-2 border-indigo-300 bg-white px-3 font-black aria-pressed:border-indigo-800 aria-pressed:bg-indigo-800 aria-pressed:text-white" onClick={() => { setSelectedPlace(option); setFeedback(null); }}>{option}</button>)}</div></section></> : null}

    {activity === "decimal-to-fraction-example" ? <section className="grid gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5"><h3 className="text-xl font-black">Przykład: 0,35</h3><p className="font-bold">Po przecinku są <b>2 cyfry</b>, więc mianownik ma 1 i <b>2 zera</b>: 100.</p><div className="flex flex-wrap items-center justify-center gap-4 text-2xl"><b>0,35</b><b>=</b><StaticFraction numerator={35} denominator={100} /><b>=</b><StaticFraction numerator={7} denominator={20} /></div><p className="font-bold">Na końcu skracamy ułamek do postaci nieskracalnej: licznik i mianownik dzielimy przez 5.</p></section> : null}

    {activity === "decimal-to-fraction-practice" ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-5"><p className="text-center text-3xl font-black">{decimalTask.decimal}</p><div className="flex flex-wrap items-center justify-center gap-4 text-2xl font-black"><span>{decimalTask.decimal}</span><span>=</span>{readOnly ? <StaticFraction numerator={decimalTask.raw[0]} denominator={decimalTask.raw[1]} /> : <FractionFields prefix="raw" values={values} setActive={setActive} readOnly={false} />}<span>=</span>{readOnly ? <StaticFraction numerator={decimalTask.reduced[0]} denominator={decimalTask.reduced[1]} /> : <FractionFields prefix="reduced" values={values} setActive={setActive} readOnly={false} />}</div><p className="text-center font-bold text-indigo-800">Pierwszy ułamek wynika z liczby miejsc po przecinku. Drugi ma być nieskracalny.</p></section> : null}

    {activity === "fraction-to-decimal-example" ? <section className="grid gap-4 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5"><h3 className="text-xl font-black">Przykład: rozszerz mianownik do 10, 100 lub 1000</h3><div className="flex flex-wrap items-center justify-center gap-4 text-2xl"><StaticFraction numerator={3} denominator={4} /><b className="text-base">· 25/25</b><b>=</b><StaticFraction numerator={75} denominator={100} /><b>=</b><b>0,75</b></div><p className="font-bold">Mianownik 4 rozszerzamy do 100. Skoro mnożymy mianownik przez 25, licznik też mnożymy przez 25.</p></section> : null}

    {activity === "fraction-to-decimal-practice" ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-5"><div className="flex flex-wrap items-center justify-center gap-4 text-2xl font-black"><StaticFraction numerator={fractionTask.source[0]} denominator={fractionTask.source[1]} /><span>=</span>{readOnly ? <StaticFraction numerator={fractionTask.expanded[0]} denominator={fractionTask.expanded[1]} /> : <FractionFields prefix="expanded" values={values} setActive={setActive} readOnly={false} />}<span>=</span>{readOnly ? <b>{fractionTask.decimal}</b> : <input aria-label="wynik dziesiętny" value={values.decimal ?? ""} readOnly className="h-12 w-28 rounded-xl border-2 border-indigo-300 text-center text-xl font-black" onFocus={() => setActive("decimal")} onClick={() => setActive("decimal")} />}</div><p className="text-center font-bold text-indigo-800">Rozszerz ułamek tak, aby mianownik był równy 10, 100 albo 1000. Potem zapisz liczbę z przecinkiem.</p></section> : null}

    {activity === "decimal-number-line" ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-5"><p className="text-center text-xl font-black">Zaznacz na osi liczbę {axisTask.label}</p><div className="grid grid-cols-11 items-end gap-1 border-b-4 border-slate-800 px-2 pb-0" role="group" aria-label={`Oś liczbowa od ${axis.start} do ${axis.end}`}>{Array.from({ length: 11 }, (_, tick) => <button key={tick} type="button" disabled={readOnly} aria-label={`kreska ${tick}`} aria-pressed={selectedTick === tick} className="relative min-h-20 border-l-2 border-slate-700 bg-transparent aria-pressed:border-indigo-700 after:absolute after:-left-2 after:top-0 after:hidden after:h-4 after:w-4 after:rounded-full after:bg-indigo-700 aria-pressed:after:block" onClick={() => { setSelectedTick(tick); setFeedback(null); }}><span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-black">{tick === 0 ? axis.labels[0] : tick === 5 ? axis.labels[1] : tick === 10 ? axis.labels[2] : ""}</span></button>)}</div><div className="h-6" /></section> : null}

    {interactive && (activity === "decimal-to-fraction-practice" || activity === "fraction-to-decimal-practice") ? <LessonNumericKeypad allowSeparator={activity === "fraction-to-decimal-practice"} label="Kalkulator do zapisu ułamków" helperText="Kliknij dowolną kratkę i wpisz wszystkie etapy. Zatwierdź jeden raz na końcu." onKey={enter} onConfirm={check} /> : null}
    {interactive && (activity === "place-names" || activity === "decimal-number-line") ? <button type="button" className="min-h-12 rounded-xl bg-slate-950 px-5 font-black text-white" onClick={check}>Zatwierdź</button> : null}
    {feedback === "correct" ? <p role="status" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 font-black text-emerald-900">✓ Poprawnie. Możesz przejść do następnego zadania.</p> : null}
    {feedback === "incorrect" ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">Sprawdź jeszcze raz każde miejsce i wszystkie etapy zapisu.</p> : null}
  </LessonTaskFrame>;
}
