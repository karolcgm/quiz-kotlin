"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  AlignedDecimalDivisionGrid,
  type ActiveCell,
  type DivisionGridSelection,
} from "@/components/lessons/decimals/DecimalNaturalDivideL1Lab";
import {
  buildDecimalNaturalLongDivisionSteps,
  type DecimalNaturalLongDivisionStep,
} from "@/lib/math/decimals/decimalNaturalDivideL1";

export const DECIMAL_EXPANSION_ACTIVITIES = ["decimal-expansion-example", "decimal-expansion-practice", "decimal-long-division"] as const;
export type DecimalExpansionActivity = typeof DECIMAL_EXPANSION_ACTIVITIES[number];
export const isDecimalExpansionActivity = (value: string): value is DecimalExpansionActivity => DECIMAL_EXPANSION_ACTIVITIES.includes(value as DecimalExpansionActivity);

type Fraction = { n: number; d: number };
const FractionView = ({ value }: { value: Fraction }) => <span className="inline-grid min-w-10 grid-rows-2 text-center leading-none"><span className="border-b-2 border-current px-1 pb-1">{value.n}</span><span className="px-1 pt-1">{value.d}</span></span>;

const expansionTasks = [
  { f: { n: 3, d: 4 }, k: 25, result: "0,75" }, { f: { n: 7, d: 20 }, k: 5, result: "0,35" }, { f: { n: 9, d: 25 }, k: 4, result: "0,36" }, { f: { n: 11, d: 50 }, k: 2, result: "0,22" },
  { f: { n: 13, d: 40 }, k: 25, result: "0,325" }, { f: { n: 17, d: 125 }, k: 8, result: "0,136" }, { f: { n: 19, d: 200 }, k: 5, result: "0,095" }, { f: { n: 7, d: 8 }, k: 125, result: "0,875" },
] as const;
const divisionTasks = [
  { f: { n: 1, d: 3 }, result: "0,(3)", type: "okresowe", period: "3", quotient: "0,333", appendedZeros: 3 },
  { f: { n: 1, d: 8 }, result: "0,125", type: "skończone", period: "brak", quotient: "0,125", appendedZeros: 3 },
  { f: { n: 5, d: 9 }, result: "0,(5)", type: "okresowe", period: "5", quotient: "0,555", appendedZeros: 3 },
  { f: { n: 7, d: 20 }, result: "0,35", type: "skończone", period: "brak", quotient: "0,35", appendedZeros: 2 },
  { f: { n: 5, d: 6 }, result: "0,8(3)", type: "okresowe", period: "3", quotient: "0,8333", appendedZeros: 4 },
  { f: { n: 3, d: 40 }, result: "0,075", type: "skończone", period: "brak", quotient: "0,075", appendedZeros: 3 },
] as const;

type Props = { activity: DecimalExpansionActivity; seed: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void };
const normalized = (value: string) => value.replace(/\s/gu, "").replace(".", ",");
const decimalDigits = (value: string) => value.replace(",", "");
const decimalCommaPosition = (value: string) => {
  const position = value.indexOf(",");
  return position === -1 ? value.length : position;
};

function DecimalExpansionLongDivision({
  task,
  taskIndex,
  readOnly,
  questionNumber,
  questionCount,
  onResultChange,
}: {
  task: { f: Fraction; result: string };
  taskIndex: number;
  readOnly: boolean;
  questionNumber: number;
  questionCount: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}) {
  const work = divisionTasks[taskIndex % divisionTasks.length]!;
  const dividend = `${task.f.n},${"0".repeat(work.appendedZeros)}`;
  const quotientDigits = decimalDigits(work.quotient).split("");
  const steps = useMemo(
    () => buildDecimalNaturalLongDivisionSteps(String(task.f.n), task.f.d, work.appendedZeros),
    [task.f.d, task.f.n, work.appendedZeros],
  );
  const [quotient, setQuotient] = useState(() => readOnly ? quotientDigits : quotientDigits.map(() => ""));
  const [products, setProducts] = useState(() => steps.map((step) => readOnly ? decimalDigits(step.productDisplay).split("") : decimalDigits(step.productDisplay).split("").map(() => "")));
  const [remainders, setRemainders] = useState(() => steps.map((step) => readOnly ? decimalDigits(step.nextDisplay).split("") : decimalDigits(step.nextDisplay).split("").map(() => "")));
  const [answer, setAnswer] = useState(readOnly ? task.result : "");
  const [selectedType, setSelectedType] = useState(readOnly ? work.type : "");
  const [period, setPeriod] = useState(readOnly ? work.period : "");
  const [periodActive, setPeriodActive] = useState(false);
  const [active, setActive] = useState<ActiveCell>({ row: "quotient", index: 0 });
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);

  const clearFeedback = () => {
    setFeedback(null);
    onResultChange?.(null);
  };
  const select = (selection: DivisionGridSelection) => {
    if (!readOnly) {
      setPeriodActive(false);
      setActive(selection);
    }
  };
  const updateGridRow = (
    rows: string[][],
    setter: (next: string[][]) => void,
    selection: Extract<DivisionGridSelection, { row: "product" | "remainder" }>,
    value: string,
  ) => {
    const next = rows.map((cells, rowIndex) => rowIndex === selection.step
      ? cells.map((cell, cellIndex) => cellIndex === selection.index ? value : cell)
      : cells);
    setter(next);
    if (value) {
      setActive({
        row: selection.row,
        step: selection.step,
        index: Math.min(next[selection.step]!.length - 1, selection.index + 1),
      });
    }
  };
  const enterKey = (key: string) => {
    if (readOnly) return;
    clearFeedback();
    if (periodActive) {
      if (selectedType !== "okresowe") return;
      setPeriod((current) => key === "backspace" ? current.slice(0, -1) : key === "," ? current : current.length < 8 ? `${current}${key}` : current);
      return;
    }
    if (!active) return;
    if (active.row === "answer") {
      setAnswer((current) => key === "backspace"
        ? current.slice(0, -1)
        : key === "," && current.includes(",")
          ? current
          : current.length < 12 ? `${current}${key}` : current);
      return;
    }
    if (key === ",") return;
    const value = key === "backspace" ? "" : key;
    if (active.row === "quotient") {
      const next = quotient.map((cell, index) => index === active.index ? value : cell);
      setQuotient(next);
      if (value) setActive({ row: "quotient", index: Math.min(next.length - 1, active.index + 1) });
      return;
    }
    if (active.row === "product") updateGridRow(products, setProducts, active, value);
    if (active.row === "remainder") updateGridRow(remainders, setRemainders, active, value);
  };
  const addPeriodToken = (token: "(" | ")") => {
    if (readOnly) return;
    setActive({ row: "answer" });
    setAnswer((current) => `${current}${token}`);
    clearFeedback();
  };
  const confirm = () => {
    const quotientCorrect = quotient.join("") === quotientDigits.join("");
    const productsCorrect = steps.every((step, index) => products[index]?.join("") === decimalDigits(step.productDisplay));
    const remaindersCorrect = steps.every((step, index) => remainders[index]?.join("") === decimalDigits(step.nextDisplay));
    const classificationCorrect = selectedType === work.type && period === work.period;
    const correct = quotientCorrect && productsCorrect && remaindersCorrect && normalized(answer) === task.result && classificationCorrect;
    setFeedback(correct ? "good" : "bad");
    onResultChange?.(correct, `${answer}; ${selectedType}; okres: ${period}`);
  };

  return <LessonTaskFrame
    eyebrow="Dział 1 · Klasa 6"
    heading="Rozwinięcie dziesiętne przez dzielenie"
    description="Wykonaj dzielenie, a następnie rozpoznaj, czy rozwinięcie jest skończone, czy okresowe."
    questionNumber={questionNumber}
    questionCount={questionCount}
    contentClassName="grid gap-5"
    data-decimal-expansion="decimal-long-division"
  >
    <section className="grid gap-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-4 text-3xl font-black text-slate-950">
        <FractionView value={task.f} /><span>=</span><span>{task.f.n} : {task.f.d}</span>
      </div>
      <p className="text-center font-bold text-indigo-950">Dopisuj zera po przecinku i kontynuuj dzielenie. Powtarzająca się reszta wskazuje okres rozwinięcia.</p>
      <div className="rounded-2xl border-2 border-indigo-200 bg-white p-3 sm:p-5">
        <AlignedDecimalDivisionGrid
          dividend={dividend}
          divisor={task.f.d}
          quotient={quotient}
          resultCommaAfter={decimalCommaPosition(work.quotient)}
          products={products}
          remainders={remainders}
          steps={steps as DecimalNaturalLongDivisionStep[]}
          active={active}
          onSelect={select}
          readOnly={readOnly}
          label={`Dzielenie pisemne ${task.f.n} przez ${task.f.d}`}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black text-slate-950">
        <span>Rozwinięcie:</span>
        <input
          aria-label="Zapis rozwinięcia dziesiętnego"
          value={answer}
          readOnly
          inputMode="none"
          onClick={() => {
            setPeriodActive(false);
            setActive({ row: "answer" });
          }}
          onFocus={() => {
            setPeriodActive(false);
            setActive({ row: "answer" });
          }}
          className={`h-14 w-44 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${active?.row === "answer" && !periodActive ? "border-cyan-600 ring-4 ring-cyan-100" : "border-indigo-300"}`}
        />
        {!readOnly ? <>
          <button type="button" onClick={() => addPeriodToken("(")} className="rounded-lg border-2 border-indigo-300 bg-white px-5 py-2 text-xl">(</button>
          <button type="button" onClick={() => addPeriodToken(")")} className="rounded-lg border-2 border-indigo-300 bg-white px-5 py-2 text-xl">)</button>
        </> : null}
      </div>
      <div className="grid gap-4 rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4">
        <p className="text-center text-lg font-black text-cyan-950">Nazwij otrzymane rozwinięcie i wpisz jego najkrótszy okres.</p>
        <div className="grid gap-3 sm:grid-cols-2" aria-label="Wybierz rodzaj rozwinięcia">
          {(["skończone", "okresowe"] as const).map((value) => <button
            key={value}
            type="button"
            disabled={readOnly}
            aria-pressed={selectedType === value}
            onClick={() => {
              setSelectedType(value);
              setPeriod(value === "skończone" ? "brak" : period === "brak" ? "" : period);
              setPeriodActive(value === "okresowe");
              clearFeedback();
            }}
            className={`rounded-xl border-2 px-5 py-3 text-lg font-black ${selectedType === value ? "border-indigo-700 bg-indigo-700 text-white" : "border-indigo-200 bg-white text-indigo-950"}`}
          >
            {value}
          </button>)}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-lg font-black text-cyan-950">Okres:</span>
          <input
            aria-label="Okres rozwinięcia"
            value={period}
            readOnly
            inputMode="none"
            onClick={() => {
              if (selectedType === "okresowe") setPeriodActive(true);
            }}
            onFocus={() => {
              if (selectedType === "okresowe") setPeriodActive(true);
            }}
            className={`h-14 w-40 rounded-xl border-2 bg-white text-center text-2xl font-black text-slate-950 outline-none ${periodActive ? "border-cyan-600 ring-4 ring-cyan-100" : "border-cyan-300"}`}
          />
          <button
            type="button"
            disabled={readOnly}
            aria-pressed={period === "brak"}
            onClick={() => {
              setSelectedType("skończone");
              setPeriod("brak");
              setPeriodActive(false);
              clearFeedback();
            }}
            className={`rounded-xl border-2 px-4 py-3 font-black ${period === "brak" ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-300 bg-white text-cyan-950"}`}
          >
            brak okresu
          </button>
        </div>
      </div>
    </section>
    {!readOnly ? <LessonNumericKeypad
      allowSeparator={active?.row === "answer"}
      label="Kalkulator do dzielenia pisemnego"
      helperText={periodActive
        ? "Wpisz najkrótszy blok powtarzających się cyfr."
        : active?.row === "quotient"
        ? "Uzupełnij iloraz u góry."
        : active?.row === "product"
          ? "Wpisz liczbę, którą odejmujesz."
          : active?.row === "remainder"
            ? "Wpisz wynik odejmowania i sprowadź kolejną cyfrę."
            : "Zapisz rozwinięcie dziesiętne; okres ujmij w nawias."}
      onKey={enterKey}
      onConfirm={confirm}
    /> : null}
    {feedback === "good" ? <p role="status" className="rounded-xl bg-emerald-100 p-4 text-center font-black text-emerald-900">✓ Poprawnie wykonane dzielenie i rozpoznane rozwinięcie.</p> : null}
    {feedback === "bad" ? <p role="status" className="rounded-xl bg-rose-100 p-4 text-center font-black text-rose-900">Sprawdź dzielenie, nazwę rozwinięcia oraz najkrótszy okres.</p> : null}
  </LessonTaskFrame>;
}

export function DecimalExpansionL6Lab({ activity, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const index = Math.max(0, questionNumber - 1);
  const [answer, setAnswer] = useState(""); const [factor, setFactor] = useState(""); const [active, setActive] = useState<"factor" | "answer">("answer"); const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const reset = () => { setFeedback(null); onResultChange?.(null); };
  const key = (value: string) => { const setter = active === "factor" ? setFactor : setAnswer; const current = active === "factor" ? factor : answer; if (value === "backspace") setter(current.slice(0, -1)); else if (value === "," && current.includes(",")) return; else setter(`${current}${value}`); reset(); };
  const task: { f: Fraction; k?: number; result?: string } = useMemo(() => activity === "decimal-expansion-practice" ? expansionTasks[index % expansionTasks.length] : divisionTasks[index % divisionTasks.length], [activity, index]);
  if (activity === "decimal-long-division") {
    return <DecimalExpansionLongDivision
      key={`${task.f.n}-${task.f.d}-${index}`}
      task={{ f: task.f, result: task.result! }}
      taskIndex={index}
      readOnly={readOnly}
      questionNumber={questionNumber}
      questionCount={questionCount}
      onResultChange={onResultChange}
    />;
  }
  const confirm = () => { const correct = Number(factor) === task.k && normalized(answer) === task.result; setFeedback(correct ? "good" : "bad"); onResultChange?.(correct, answer); };
  const field = (name: "factor" | "answer", label: string, width = "w-32") => <input aria-label={label} value={name === "factor" ? factor : answer} readOnly inputMode="none" onClick={() => setActive(name)} onFocus={() => setActive(name)} className={`h-14 ${width} rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${active === name ? "border-cyan-600 ring-4 ring-cyan-100" : "border-indigo-300"}`} />;
  if (activity === "decimal-expansion-example") return <LessonTaskFrame eyebrow="Dział 1 · Klasa 6" heading="Zamiana przez rozszerzanie" description="Jeżeli mianownik można rozszerzyć do 10, 100 lub 1000, otrzymujemy zapis dziesiętny bez dzielenia pisemnego." contentClassName="grid gap-5"><section className="grid gap-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-center text-3xl font-black text-slate-950"><div className="flex flex-wrap items-center justify-center gap-4"><FractionView value={{ n: 3, d: 4 }} /><span>=</span><FractionView value={{ n: 75, d: 100 }} /><span>= 0,75</span></div><p className="text-base text-amber-950">Licznik i mianownik rozszerzamy przez 25 — mianownik wynosi wtedy 100.</p></section></LessonTaskFrame>;
  return <LessonTaskFrame eyebrow="Dział 1 · Klasa 6" heading="Rozszerz i zapisz dziesiętnie" description="Rozszerz licznik i mianownik przez tę samą liczbę. Następnie zapisz wynik dziesiętnie." questionNumber={questionNumber} questionCount={questionCount} contentClassName="grid gap-5" data-decimal-expansion={activity}><section className="grid gap-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6 text-center text-3xl font-black text-slate-950"><div className="flex flex-wrap items-center justify-center gap-4"><FractionView value={task.f} /><span>=</span><span>rozszerz przez</span>{field("factor", "Mnożnik rozszerzenia", "w-20")}</div><div className="flex flex-wrap items-center justify-center gap-3"><span>=</span>{field("answer", "Zapis dziesiętny", "w-44")}</div></section>{!readOnly ? <LessonNumericKeypad allowSeparator label="Kalkulator do rozwinięć dziesiętnych" helperText={active === "factor" ? "Wpisz mnożnik rozszerzenia." : "Wpisz zapis dziesiętny."} onKey={key} onConfirm={confirm} /> : null}{feedback === "good" ? <p role="status" className="rounded-xl bg-emerald-100 p-4 text-center font-black text-emerald-900">✓ Poprawnie.</p> : null}{feedback === "bad" ? <p role="status" className="rounded-xl bg-rose-100 p-4 text-center font-black text-rose-900">Sprawdź rozszerzenie i zapis dziesiętny.</p> : null}</LessonTaskFrame>;
}
