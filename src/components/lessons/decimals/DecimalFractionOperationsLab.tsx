"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export const DECIMAL_FRACTION_OPERATIONS_ACTIVITIES = [
  "fraction-decimal-remember",
  "fraction-decimal-add",
  "fraction-decimal-subtract",
  "fraction-decimal-multiply",
  "fraction-decimal-divide",
] as const;

export type DecimalFractionOperationsActivity = typeof DECIMAL_FRACTION_OPERATIONS_ACTIVITIES[number];

export function isDecimalFractionOperationsActivity(value: string): value is DecimalFractionOperationsActivity {
  return DECIMAL_FRACTION_OPERATIONS_ACTIVITIES.includes(value as DecimalFractionOperationsActivity);
}

type Fraction = { numerator: number; denominator: number };
type Term = { kind: "decimal"; value: string } | { kind: "fraction"; value: Fraction };
type Answer = { kind: "decimal"; value: string } | { kind: "fraction"; value: Fraction };

type MixedOperationTask = {
  left: Term;
  operator: "+" | "−" | "·" | ":";
  right: Term;
  answer: Answer;
  suggestedMethod: string;
};

const TASKS: Record<Exclude<DecimalFractionOperationsActivity, "fraction-decimal-remember">, readonly MixedOperationTask[]> = {
  "fraction-decimal-add": [
    { left: { kind: "fraction", value: { numerator: 1, denominator: 2 } }, operator: "+", right: { kind: "decimal", value: "0,25" }, answer: { kind: "decimal", value: "0,75" }, suggestedMethod: "Wybierz wygodny zapis i oblicz." },
    { left: { kind: "decimal", value: "0,6" }, operator: "+", right: { kind: "fraction", value: { numerator: 1, denominator: 5 } }, answer: { kind: "decimal", value: "0,8" }, suggestedMethod: "Wybierz wygodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, operator: "+", right: { kind: "decimal", value: "0,125" }, answer: { kind: "decimal", value: "0,875" }, suggestedMethod: "Tutaj wygodnie będzie użyć zapisu dziesiętnego." },
    { left: { kind: "decimal", value: "1,25" }, operator: "+", right: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, answer: { kind: "decimal", value: "2" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 2, denominator: 5 } }, operator: "+", right: { kind: "decimal", value: "0,35" }, answer: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, suggestedMethod: "Tutaj wygodnie będzie użyć ułamków zwykłych." },
    { left: { kind: "fraction", value: { numerator: 1, denominator: 8 } }, operator: "+", right: { kind: "decimal", value: "0,375" }, answer: { kind: "fraction", value: { numerator: 1, denominator: 2 } }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "decimal", value: "0,2" }, operator: "+", right: { kind: "fraction", value: { numerator: 3, denominator: 5 } }, answer: { kind: "decimal", value: "0,8" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 5, denominator: 8 } }, operator: "+", right: { kind: "decimal", value: "0,25" }, answer: { kind: "decimal", value: "0,875" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
  ],
  "fraction-decimal-subtract": [
    { left: { kind: "fraction", value: { numerator: 1, denominator: 1 } }, operator: "−", right: { kind: "decimal", value: "0,25" }, answer: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "decimal", value: "1,25" }, operator: "−", right: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, answer: { kind: "decimal", value: "0,5" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 7, denominator: 8 } }, operator: "−", right: { kind: "decimal", value: "0,5" }, answer: { kind: "fraction", value: { numerator: 3, denominator: 8 } }, suggestedMethod: "Tutaj wygodnie będzie użyć ułamków zwykłych." },
    { left: { kind: "decimal", value: "0,9" }, operator: "−", right: { kind: "fraction", value: { numerator: 2, denominator: 5 } }, answer: { kind: "decimal", value: "0,5" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "decimal", value: "1,2" }, operator: "−", right: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, answer: { kind: "decimal", value: "0,45" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 3, denominator: 5 } }, operator: "−", right: { kind: "decimal", value: "0,125" }, answer: { kind: "decimal", value: "0,475" }, suggestedMethod: "Tutaj wygodnie będzie użyć zapisu dziesiętnego." },
    { left: { kind: "decimal", value: "2,5" }, operator: "−", right: { kind: "fraction", value: { numerator: 7, denominator: 8 } }, answer: { kind: "decimal", value: "1,625" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "decimal", value: "0,75" }, operator: "−", right: { kind: "fraction", value: { numerator: 1, denominator: 4 } }, answer: { kind: "fraction", value: { numerator: 1, denominator: 2 } }, suggestedMethod: "Tutaj wygodnie będzie użyć ułamków zwykłych." },
  ],
  "fraction-decimal-multiply": [
    { left: { kind: "decimal", value: "0,4" }, operator: "·", right: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, answer: { kind: "decimal", value: "0,3" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 1, denominator: 8 } }, operator: "·", right: { kind: "decimal", value: "0,6" }, answer: { kind: "decimal", value: "0,075" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "decimal", value: "1,25" }, operator: "·", right: { kind: "fraction", value: { numerator: 2, denominator: 5 } }, answer: { kind: "decimal", value: "0,5" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, operator: "·", right: { kind: "decimal", value: "0,8" }, answer: { kind: "decimal", value: "0,6" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "decimal", value: "0,25" }, operator: "·", right: { kind: "fraction", value: { numerator: 2, denominator: 5 } }, answer: { kind: "fraction", value: { numerator: 1, denominator: 10 } }, suggestedMethod: "Tutaj wygodnie będzie użyć ułamków zwykłych." },
    { left: { kind: "decimal", value: "0,125" }, operator: "·", right: { kind: "fraction", value: { numerator: 8, denominator: 5 } }, answer: { kind: "decimal", value: "0,2" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 1, denominator: 2 } }, operator: "·", right: { kind: "decimal", value: "0,4" }, answer: { kind: "fraction", value: { numerator: 1, denominator: 5 } }, suggestedMethod: "Tutaj wygodnie będzie użyć ułamków zwykłych." },
    { left: { kind: "decimal", value: "0,75" }, operator: "·", right: { kind: "fraction", value: { numerator: 4, denominator: 5 } }, answer: { kind: "decimal", value: "0,6" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
  ],
  "fraction-decimal-divide": [
    { left: { kind: "decimal", value: "0,75" }, operator: ":", right: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, answer: { kind: "decimal", value: "1" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 3, denominator: 5 } }, operator: ":", right: { kind: "decimal", value: "0,2" }, answer: { kind: "decimal", value: "3" }, suggestedMethod: "Tutaj wygodnie będzie użyć ułamków zwykłych." },
    { left: { kind: "decimal", value: "1,2" }, operator: ":", right: { kind: "fraction", value: { numerator: 3, denominator: 5 } }, answer: { kind: "decimal", value: "2" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 3, denominator: 8 } }, operator: ":", right: { kind: "decimal", value: "0,5" }, answer: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, suggestedMethod: "Tutaj wygodnie będzie użyć ułamków zwykłych." },
    { left: { kind: "decimal", value: "0,625" }, operator: ":", right: { kind: "fraction", value: { numerator: 5, denominator: 8 } }, answer: { kind: "decimal", value: "1" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 1, denominator: 2 } }, operator: ":", right: { kind: "decimal", value: "0,25" }, answer: { kind: "decimal", value: "2" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "decimal", value: "0,9" }, operator: ":", right: { kind: "fraction", value: { numerator: 3, denominator: 5 } }, answer: { kind: "decimal", value: "1,5" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
    { left: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, operator: ":", right: { kind: "decimal", value: "0,125" }, answer: { kind: "decimal", value: "6" }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
  ],
};

const REMEMBER: readonly { fraction: Fraction; decimal: string }[] = [
  { fraction: { numerator: 1, denominator: 2 }, decimal: "0,5" },
  { fraction: { numerator: 1, denominator: 4 }, decimal: "0,25" },
  { fraction: { numerator: 1, denominator: 5 }, decimal: "0,2" },
  { fraction: { numerator: 1, denominator: 8 }, decimal: "0,125" },
  { fraction: { numerator: 3, denominator: 4 }, decimal: "0,75" },
];

function StaticFraction({ value, className = "" }: { value: Fraction; className?: string }) {
  return <span className={`inline-grid min-w-8 grid-rows-2 text-center leading-none ${className}`} aria-label={`${value.numerator} przez ${value.denominator}`}><span className="border-b-2 border-current px-1 pb-0.5">{value.numerator}</span><span className="px-1 pt-0.5">{value.denominator}</span></span>;
}

function StaticTerm({ term }: { term: Term }) {
  return term.kind === "decimal" ? <span>{term.value}</span> : <StaticFraction value={term.value} />;
}

function equivalentDecimal(input: string, expected: string) {
  const normalized = input.replace(",", ".");
  const wanted = expected.replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/u.test(normalized)) return false;
  return Math.abs(Number(normalized) - Number(wanted)) < 0.00000001;
}

function equivalentFraction(numerator: string, denominator: string, expected: Fraction) {
  const numeratorValue = Number(numerator);
  const denominatorValue = Number(denominator);
  return Number.isInteger(numeratorValue) && Number.isInteger(denominatorValue) && denominatorValue !== 0
    && numeratorValue * expected.denominator === expected.numerator * denominatorValue;
}

type Props = {
  activity: DecimalFractionOperationsActivity;
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
};

export function DecimalFractionOperationsLab(props: Props) {
  const { activity, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange } = props;
  if (activity === "fraction-decimal-remember") {
    return <LessonTaskFrame eyebrow="Dział 5 · Ułamki dziesiętne" heading="Zapamiętaj" description="Te ułamki zwykłe warto znać w zapisie dziesiętnym. Ułatwią Ci wykonywanie działań mieszanych." contentClassName="grid gap-5" data-decimal-fraction-operations data-activity={activity}>
      <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
        <p className="text-center text-lg font-black text-amber-950">Najczęściej używane zamiany</p>
        <div className="grid gap-3 sm:grid-cols-5">{REMEMBER.map((item) => <div key={`${item.fraction.numerator}-${item.fraction.denominator}`} className="flex min-h-24 items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-white px-3 text-2xl font-black text-slate-950"><StaticFraction value={item.fraction} /><span>=</span><span>{item.decimal}</span></div>)}</div>
      </section>
      <p className="rounded-2xl bg-indigo-50 p-4 text-center font-bold text-indigo-950">W dalszych zadaniach samodzielnie zdecyduj, czy wygodniej zamienić ułamek zwykły na dziesiętny, czy dziesiętny na zwykły.</p>
    </LessonTaskFrame>;
  }

  return <DecimalFractionOperationRound key={`${activity}-${questionNumber}`} activity={activity} readOnly={readOnly} questionNumber={questionNumber} questionCount={questionCount} onResultChange={onResultChange} />;
}

function DecimalFractionOperationRound({ activity, readOnly, questionNumber, questionCount, onResultChange }: Omit<Props, "seed" | "taskSeed" | "presentationMode"> & { activity: Exclude<DecimalFractionOperationsActivity, "fraction-decimal-remember"> }) {
  const safeQuestionNumber = questionNumber ?? 1;
  const safeQuestionCount = questionCount ?? 1;
  const index = Math.max(0, safeQuestionNumber - 1);
  const task = useMemo(() => TASKS[activity][index % TASKS[activity].length]!, [activity, index]);
  const [decimalAnswer, setDecimalAnswer] = useState("");
  const [fractionNumerator, setFractionNumerator] = useState("");
  const [fractionDenominator, setFractionDenominator] = useState("");
  const [active, setActive] = useState<"decimal" | "numerator" | "denominator">(task.answer.kind === "decimal" ? "decimal" : "numerator");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const isDecimalAnswer = task.answer.kind === "decimal";
  const title = activity === "fraction-decimal-add" ? "Dodawanie ułamków zwykłych i dziesiętnych" : activity === "fraction-decimal-subtract" ? "Odejmowanie ułamków zwykłych i dziesiętnych" : activity === "fraction-decimal-multiply" ? "Mnożenie ułamków zwykłych i dziesiętnych" : "Dzielenie ułamków zwykłych i dziesiętnych";
  const clearFeedback = () => { setFeedback(null); onResultChange?.(null); };
  const inputKey = (key: string) => {
    if (readOnly) return;
    const update = (value: string, setter: (next: string) => void, allowComma = false) => {
      if (key === "backspace") setter(value.slice(0, -1));
      else if (key === "," && (!allowComma || value.includes(","))) return;
      else setter(`${value}${key}`);
    };
    if (active === "decimal") update(decimalAnswer, setDecimalAnswer, true);
    if (active === "numerator") update(fractionNumerator, setFractionNumerator);
    if (active === "denominator") update(fractionDenominator, setFractionDenominator);
    clearFeedback();
  };
  const check = () => {
    const correct = task.answer.kind === "decimal"
      ? equivalentDecimal(decimalAnswer, task.answer.value)
      : equivalentFraction(fractionNumerator, fractionDenominator, task.answer.value);
    const answerLabel = task.answer.kind === "decimal" ? decimalAnswer : `${fractionNumerator}/${fractionDenominator}`;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answerLabel);
  };
  const shownAnswer = task.answer.kind === "decimal" ? task.answer.value : <StaticFraction value={task.answer.value} />;

  return <LessonTaskFrame eyebrow="Dział 5 · Ułamki dziesiętne" heading={title} description="Wybierz dogodny zapis liczby. Najpierw pomyśl, którą liczbę warto zamienić." questionNumber={safeQuestionNumber} questionCount={safeQuestionCount} contentClassName="grid gap-5" data-decimal-fraction-operations data-activity={activity}>
    <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
      <p className="text-center font-bold text-indigo-950">{task.suggestedMethod}</p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-4xl font-black text-slate-950 sm:text-5xl"><StaticTerm term={task.left} /><span>{task.operator}</span><StaticTerm term={task.right} /><span>=</span>{readOnly ? <span className="flex items-center">{shownAnswer}</span> : isDecimalAnswer ? <input aria-label="Wynik działania" value={decimalAnswer} readOnly inputMode="none" onFocus={() => setActive("decimal")} onClick={() => setActive("decimal")} className="h-16 w-40 rounded-2xl border-2 border-indigo-400 bg-white text-center text-3xl font-black outline-none ring-indigo-400 focus:ring-4" /> : <span className="inline-grid min-w-20 grid-rows-2 text-center text-3xl leading-none"><button type="button" aria-label="Licznik wyniku" onClick={() => setActive("numerator")} className={`min-h-10 border-b-2 border-slate-950 px-2 ${active === "numerator" ? "bg-cyan-100" : "bg-white"}`}>{fractionNumerator || "□"}</button><button type="button" aria-label="Mianownik wyniku" onClick={() => setActive("denominator")} className={`min-h-10 px-2 ${active === "denominator" ? "bg-cyan-100" : "bg-white"}`}>{fractionDenominator || "□"}</button></span>}</div>
    </section>
    {!readOnly ? <LessonNumericKeypad allowSeparator={isDecimalAnswer} label="Kalkulator do wyniku" helperText={isDecimalAnswer ? "Kliknij kratkę wyniku i wpisz liczbę z przecinkiem." : "Kliknij licznik lub mianownik, a następnie wpisz cyfry."} onKey={inputKey} onConfirm={check} /> : null}
    {feedback === "correct" ? <p role="status" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center font-black text-emerald-900">✓ Poprawnie. Zapisz odpowiedź i przejdź do kolejnego zadania.</p> : null}
    {feedback === "incorrect" ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-center font-black text-rose-900">Sprawdź zamianę zapisu i wykonaj działanie jeszcze raz.</p> : null}
  </LessonTaskFrame>;
}
