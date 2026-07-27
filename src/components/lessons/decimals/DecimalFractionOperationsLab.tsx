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
  "fraction-decimal-order",
  "fraction-decimal-review-order",
] as const;

export type DecimalFractionOperationsActivity = typeof DECIMAL_FRACTION_OPERATIONS_ACTIVITIES[number];

export function isDecimalFractionOperationsActivity(value: string): value is DecimalFractionOperationsActivity {
  return DECIMAL_FRACTION_OPERATIONS_ACTIVITIES.includes(value as DecimalFractionOperationsActivity);
}

type Fraction = { numerator: number; denominator: number };
type Term = { kind: "whole"; value: string } | { kind: "decimal"; value: string } | { kind: "fraction"; value: Fraction };
type Answer = { kind: "decimal"; value: string } | { kind: "fraction"; value: Fraction };

type MixedOperationTask = {
  left: Term;
  operator: "+" | "−" | "·" | ":";
  right: Term;
  answer: Answer;
  suggestedMethod: string;
};

const TASKS: Record<Exclude<DecimalFractionOperationsActivity, "fraction-decimal-remember" | "fraction-decimal-order" | "fraction-decimal-review-order">, readonly MixedOperationTask[]> = {
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
    { left: { kind: "whole", value: "1" }, operator: "−", right: { kind: "decimal", value: "0,25" }, answer: { kind: "fraction", value: { numerator: 3, denominator: 4 } }, suggestedMethod: "Wybierz dogodny zapis i oblicz." },
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
  return term.kind === "fraction" ? <StaticFraction value={term.value} /> : <span>{term.value}</span>;
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
  const { activity, seed, readOnly = false, questionNumber = 1, questionCount = 1, onResultChange } = props;
  const eyebrow = seed >= 600000 ? "Dział 1 · Klasa 6" : "Dział 5 · Ułamki dziesiętne";
  if (activity === "fraction-decimal-remember") {
    return <LessonTaskFrame eyebrow={eyebrow} heading="Zapamiętaj" description="Te ułamki zwykłe warto znać w zapisie dziesiętnym. Ułatwią Ci wykonywanie działań mieszanych." contentClassName="grid gap-5" data-decimal-fraction-operations data-activity={activity}>
      <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
        <p className="text-center text-lg font-black text-amber-950">Najczęściej używane zamiany</p>
        <div className="mx-auto w-full max-w-2xl space-y-3">{REMEMBER.map((item) => <div key={`${item.fraction.numerator}-${item.fraction.denominator}`} data-fraction-decimal-remember-row className="grid min-h-16 grid-cols-[minmax(4.5rem,1fr)_auto_minmax(5rem,1fr)] items-center gap-4 rounded-2xl border-2 border-amber-200 bg-white px-5 py-2 text-2xl font-black text-slate-950"><span className="justify-self-end"><StaticFraction value={item.fraction} /></span><span>=</span><span className="justify-self-start">{item.decimal}</span></div>)}</div>
      </section>
      <p className="rounded-2xl bg-indigo-50 p-4 text-center font-bold text-indigo-950">W dalszych zadaniach samodzielnie zdecyduj, czy wygodniej zamienić ułamek zwykły na dziesiętny, czy dziesiętny na zwykły.</p>
    </LessonTaskFrame>;
  }

  if (activity === "fraction-decimal-order" || activity === "fraction-decimal-review-order") {
    return <DecimalFractionOrderRound review={activity === "fraction-decimal-review-order"} readOnly={readOnly} onResultChange={onResultChange} />;
  }

  return <DecimalFractionOperationRound key={`${activity}-${questionNumber}`} activity={activity} eyebrow={eyebrow} readOnly={readOnly} questionNumber={questionNumber} questionCount={questionCount} onResultChange={onResultChange} />;
}

type OrderToken = Term | { kind: "intermediate" } | "+" | "−" | "·" | ":" | "=" | "(" | ")";
type FractionDecimalOrderTask = {
  expression: readonly OrderToken[];
  firstTokens: readonly OrderToken[];
  finalTokens: readonly OrderToken[];
  firstAnswer: string;
  finalAnswer: string;
};

const ORDER_TASKS: readonly FractionDecimalOrderTask[] = [
  { expression: [{ kind: "fraction", value: { numerator: 1, denominator: 2 } }, "+", { kind: "decimal", value: "0,25" }, "·", { kind: "whole", value: "2" }], firstTokens: [{ kind: "decimal", value: "0,25" }, "·", { kind: "whole", value: "2" }, "="], finalTokens: [{ kind: "fraction", value: { numerator: 1, denominator: 2 } }, "+", { kind: "intermediate" }, "="], firstAnswer: "0,5", finalAnswer: "1" },
  { expression: ["(", { kind: "fraction", value: { numerator: 3, denominator: 4 } }, "+", { kind: "decimal", value: "0,25" }, ")", "·", { kind: "decimal", value: "0,8" }], firstTokens: [{ kind: "fraction", value: { numerator: 3, denominator: 4 } }, "+", { kind: "decimal", value: "0,25" }, "="], finalTokens: [{ kind: "intermediate" }, "·", { kind: "decimal", value: "0,8" }, "="], firstAnswer: "1", finalAnswer: "0,8" },
  { expression: [{ kind: "decimal", value: "1,2" }, "−", { kind: "fraction", value: { numerator: 1, denominator: 4 } }, ":", { kind: "decimal", value: "0,5" }], firstTokens: [{ kind: "fraction", value: { numerator: 1, denominator: 4 } }, ":", { kind: "decimal", value: "0,5" }, "="], finalTokens: [{ kind: "decimal", value: "1,2" }, "−", { kind: "intermediate" }, "="], firstAnswer: "0,5", finalAnswer: "0,7" },
  { expression: ["(", { kind: "decimal", value: "0,6" }, "+", { kind: "fraction", value: { numerator: 1, denominator: 5 } }, ")", ":", { kind: "decimal", value: "0,4" }], firstTokens: [{ kind: "decimal", value: "0,6" }, "+", { kind: "fraction", value: { numerator: 1, denominator: 5 } }, "="], finalTokens: [{ kind: "intermediate" }, ":", { kind: "decimal", value: "0,4" }, "="], firstAnswer: "0,8", finalAnswer: "2" },
  { expression: [{ kind: "fraction", value: { numerator: 3, denominator: 4 } }, "·", { kind: "decimal", value: "0,8" }, "+", { kind: "fraction", value: { numerator: 1, denominator: 5 } }], firstTokens: [{ kind: "fraction", value: { numerator: 3, denominator: 4 } }, "·", { kind: "decimal", value: "0,8" }, "="], finalTokens: [{ kind: "intermediate" }, "+", { kind: "fraction", value: { numerator: 1, denominator: 5 } }, "="], firstAnswer: "0,6", finalAnswer: "0,8" },
];

const REVIEW_ORDER_TASKS: readonly FractionDecimalOrderTask[] = [
  { expression: ["(", { kind: "fraction", value: { numerator: 3, denominator: 4 } }, "+", { kind: "decimal", value: "0,5" }, ")", "·", { kind: "decimal", value: "0,8" }], firstTokens: [{ kind: "fraction", value: { numerator: 3, denominator: 4 } }, "+", { kind: "decimal", value: "0,5" }, "="], finalTokens: [{ kind: "intermediate" }, "·", { kind: "decimal", value: "0,8" }, "="], firstAnswer: "1,25", finalAnswer: "1" },
  { expression: [{ kind: "decimal", value: "2,5" }, "−", "(", { kind: "fraction", value: { numerator: 3, denominator: 5 } }, ":", { kind: "decimal", value: "1,2" }, ")"], firstTokens: [{ kind: "fraction", value: { numerator: 3, denominator: 5 } }, ":", { kind: "decimal", value: "1,2" }, "="], finalTokens: [{ kind: "decimal", value: "2,5" }, "−", { kind: "intermediate" }, "="], firstAnswer: "0,5", finalAnswer: "2" },
  { expression: ["(", { kind: "decimal", value: "0,375" }, "+", { kind: "fraction", value: { numerator: 1, denominator: 8 } }, ")", "·", { kind: "decimal", value: "1,6" }], firstTokens: [{ kind: "decimal", value: "0,375" }, "+", { kind: "fraction", value: { numerator: 1, denominator: 8 } }, "="], finalTokens: [{ kind: "intermediate" }, "·", { kind: "decimal", value: "1,6" }, "="], firstAnswer: "0,5", finalAnswer: "0,8" },
  { expression: [{ kind: "fraction", value: { numerator: 7, denominator: 8 } }, "·", { kind: "decimal", value: "0,8" }, "+", { kind: "decimal", value: "0,3" }], firstTokens: [{ kind: "fraction", value: { numerator: 7, denominator: 8 } }, "·", { kind: "decimal", value: "0,8" }, "="], finalTokens: [{ kind: "intermediate" }, "+", { kind: "decimal", value: "0,3" }, "="], firstAnswer: "0,7", finalAnswer: "1" },
];

function OrderTokens({ tokens, intermediateValue = "" }: { tokens: readonly OrderToken[]; intermediateValue?: string }) {
  return <>{tokens.map((token, index) => {
    if (typeof token === "string") return <span key={`${token}-${index}`}>{token}</span>;
    if (token.kind === "intermediate") {
      return <input
        key={`intermediate-${index}`}
        aria-label="Przeniesiony wynik pierwszego kroku"
        value={intermediateValue}
        readOnly
        inputMode="none"
        tabIndex={-1}
        className="h-14 w-32 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-center text-2xl font-black text-slate-950 outline-none"
      />;
    }
    return <StaticTerm key={`${token.kind}-${index}`} term={token} />;
  })}</>;
}

function DecimalFractionOrderRound({ review = false, readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange"> & { review?: boolean }) {
  const tasks = review ? REVIEW_ORDER_TASKS : ORDER_TASKS;
  const [index, setIndex] = useState(0);
  const [first, setFirst] = useState("");
  const [final, setFinal] = useState("");
  const [active, setActive] = useState<"first" | "final">("first");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const task = tasks[index]!;
  const update = (setter: (value: string) => void, value: string, key: string) => {
    if (key === "backspace") setter(value.slice(0, -1));
    else if (key === "," && value.includes(",")) return;
    else setter(`${value}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    const correct = equivalentDecimal(first, task.firstAnswer) && equivalentDecimal(final, task.finalAnswer);
    if (!correct) {
      setFeedback("incorrect");
      onResultChange?.(false);
      return;
    }
    if (index === tasks.length - 1) {
      setFeedback("correct");
      onResultChange?.(true, final);
      return;
    }
    setIndex((current) => current + 1);
    setFirst("");
    setFinal("");
    setActive("first");
    setFeedback(null);
    onResultChange?.(null);
  };
  const field = (value: string, label: string, fieldName: "first" | "final") => <input aria-label={label} value={value} readOnly inputMode="none" onFocus={() => setActive(fieldName)} onClick={() => setActive(fieldName)} className={`h-14 w-32 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${active === fieldName ? "border-cyan-600 ring-4 ring-cyan-100" : "border-indigo-400"}`} />;

  return <LessonTaskFrame eyebrow="Dział 1 · Liczby naturalne i ułamki" heading="Kolejność działań" description="Najpierw wykonaj nawiasy, potem mnożenie lub dzielenie, a na końcu dodawanie albo odejmowanie." questionNumber={index + 1} questionCount={tasks.length} contentClassName="grid gap-5" data-decimal-fraction-operations data-activity={review ? "fraction-decimal-review-order" : "fraction-decimal-order"}>
    <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
      <p className="text-center font-bold text-indigo-950">Wybierz wygodny zapis: ułamek zwykły albo dziesiętny.</p>
      <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-black text-slate-950 sm:text-4xl"><OrderTokens tokens={task.expression} /><span>=</span><span>?</span></div>
    </section>
    <section className="grid gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5" aria-label="Kolejne kroki obliczeń">
      <h3 className="text-lg font-black text-amber-950">Zapis obliczeń</h3>
      <div className="flex flex-wrap items-center justify-center gap-3 text-2xl font-black text-slate-950"><OrderTokens tokens={task.firstTokens} />{field(first, "Wynik pierwszego kroku", "first")}</div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-2xl font-black text-slate-950"><OrderTokens tokens={task.finalTokens} intermediateValue={first} />{field(final, "Wynik działania", "final")}</div>
    </section>
    {!readOnly ? <LessonNumericKeypad allowSeparator label="Kalkulator do obliczeń" helperText={active === "first" ? "Wpisz wynik pierwszego działania." : "Wpisz wynik całego działania."} onKey={(key) => active === "first" ? update(setFirst, first, key) : update(setFinal, final, key)} onConfirm={check} /> : null}
    {feedback === "correct" ? <p role="status" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center font-black text-emerald-900">✓ Wszystkie kroki są poprawne.</p> : null}
    {feedback === "incorrect" ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-center font-black text-rose-900">Sprawdź kolejność działań i oba wpisane wyniki.</p> : null}
  </LessonTaskFrame>;
}

type CalculationMethod = "decimal" | "fraction";
type ActiveCalculationField = "converted-decimal" | "converted-numerator" | "converted-denominator" | "result-decimal" | "result-numerator" | "result-denominator" | "result-whole";

function decimalFromFraction(value: Fraction): string {
  return String(value.numerator / value.denominator).replace(".", ",");
}

function fractionFromDecimal(value: string): Fraction {
  const [whole, decimal = ""] = value.split(",");
  const denominator = 10 ** decimal.length;
  const numerator = Number(`${whole}${decimal}`);
  const divisor = (left: number, right: number): number => right === 0 ? left : divisor(right, left % right);
  const greatestCommonDivisor = divisor(Math.abs(numerator), denominator);
  return { numerator: numerator / greatestCommonDivisor, denominator: denominator / greatestCommonDivisor };
}

function DecimalCalculationField({ value, label, active, onActivate }: { value: string; label: string; active: boolean; onActivate: () => void }) {
  return <input aria-label={label} value={value} readOnly inputMode="none" onFocus={onActivate} onClick={onActivate} className={`h-14 w-32 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none sm:w-40 ${active ? "border-cyan-600 ring-4 ring-cyan-100" : "border-indigo-400"}`} />;
}

function FractionCalculationField({ numerator, denominator, numeratorLabel, denominatorLabel, active, onActivate }: { numerator: string; denominator: string; numeratorLabel: string; denominatorLabel: string; active: ActiveCalculationField; onActivate: (field: ActiveCalculationField) => void }) {
  return <span className="inline-grid min-w-20 grid-rows-2 text-center text-2xl leading-none"><button type="button" aria-label={numeratorLabel} onClick={() => onActivate("converted-numerator")} className={`min-h-9 border-b-2 border-slate-950 px-2 ${active === "converted-numerator" ? "bg-cyan-100" : "bg-white"}`}>{numerator || "□"}</button><button type="button" aria-label={denominatorLabel} onClick={() => onActivate("converted-denominator")} className={`min-h-9 px-2 ${active === "converted-denominator" ? "bg-cyan-100" : "bg-white"}`}>{denominator || "□"}</button></span>;
}

function ResultFractionField({ numerator, denominator, active, onActivate }: { numerator: string; denominator: string; active: ActiveCalculationField; onActivate: (field: ActiveCalculationField) => void }) {
  return <span className="inline-grid min-w-20 grid-rows-2 text-center text-2xl leading-none"><button type="button" aria-label="Licznik wyniku" onClick={() => onActivate("result-numerator")} className={`min-h-9 border-b-2 border-slate-950 px-2 ${active === "result-numerator" ? "bg-cyan-100" : "bg-white"}`}>{numerator || "□"}</button><button type="button" aria-label="Mianownik wyniku" onClick={() => onActivate("result-denominator")} className={`min-h-9 px-2 ${active === "result-denominator" ? "bg-cyan-100" : "bg-white"}`}>{denominator || "□"}</button></span>;
}

function DecimalFractionOperationRound({ activity, eyebrow, readOnly, questionNumber, questionCount, onResultChange }: Omit<Props, "seed" | "taskSeed" | "presentationMode"> & { eyebrow: string; activity: Exclude<DecimalFractionOperationsActivity, "fraction-decimal-remember" | "fraction-decimal-order" | "fraction-decimal-review-order"> }) {
  const safeQuestionNumber = questionNumber ?? 1;
  const safeQuestionCount = questionCount ?? 1;
  const index = Math.max(0, safeQuestionNumber - 1);
  const task = useMemo(() => TASKS[activity][index % TASKS[activity].length]!, [activity, index]);
  const fractionOperand = task.left.kind === "fraction" ? task.left.value : task.right.kind === "fraction" ? task.right.value : null;
  const decimalOperand = task.left.kind === "decimal" ? task.left.value : task.right.kind === "decimal" ? task.right.value : null;
  const expectedResultFraction = task.answer.kind === "fraction" ? task.answer.value : fractionFromDecimal(task.answer.value);
  const expectedResultDecimal = task.answer.kind === "decimal" ? task.answer.value : decimalFromFraction(task.answer.value);
  const fractionResultIsWhole = expectedResultFraction.denominator === 1;
  const defaultMethod: CalculationMethod = task.answer.kind === "decimal" ? "decimal" : "fraction";
  const firstActiveField = (chosenMethod: CalculationMethod): ActiveCalculationField => chosenMethod === "decimal"
    ? fractionOperand ? "converted-decimal" : "result-decimal"
    : decimalOperand ? "converted-numerator" : fractionResultIsWhole ? "result-whole" : "result-numerator";
  const [method, setMethod] = useState<CalculationMethod>(defaultMethod);
  const [convertedDecimal, setConvertedDecimal] = useState("");
  const [convertedNumerator, setConvertedNumerator] = useState("");
  const [convertedDenominator, setConvertedDenominator] = useState("");
  const [resultDecimal, setResultDecimal] = useState("");
  const [resultNumerator, setResultNumerator] = useState("");
  const [resultDenominator, setResultDenominator] = useState("");
  const [resultWhole, setResultWhole] = useState("");
  const [active, setActive] = useState<ActiveCalculationField>(() => firstActiveField(defaultMethod));
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const title = activity === "fraction-decimal-add" ? "Dodawanie ułamków zwykłych i dziesiętnych" : activity === "fraction-decimal-subtract" ? "Odejmowanie ułamków zwykłych i dziesiętnych" : activity === "fraction-decimal-multiply" ? "Mnożenie ułamków zwykłych i dziesiętnych" : "Dzielenie ułamków zwykłych i dziesiętnych";
  const shownAnswer = task.answer.kind === "decimal" ? task.answer.value : <StaticFraction value={task.answer.value} />;
  const clearFeedback = () => { setFeedback(null); onResultChange?.(null); };
  const chooseMethod = (nextMethod: CalculationMethod) => {
    if (readOnly) return;
    setMethod(nextMethod); setConvertedDecimal(""); setConvertedNumerator(""); setConvertedDenominator(""); setResultDecimal(""); setResultNumerator(""); setResultDenominator(""); setResultWhole(""); setActive(firstActiveField(nextMethod)); clearFeedback();
  };
  const inputKey = (key: string) => {
    if (readOnly) return;
    const update = (value: string, setter: (next: string) => void, allowComma = false) => {
      if (key === "backspace") setter(value.slice(0, -1));
      else if (key === "," && (!allowComma || value.includes(","))) return;
      else setter(`${value}${key}`);
    };
    if (active === "converted-decimal") update(convertedDecimal, setConvertedDecimal, true);
    if (active === "converted-numerator") update(convertedNumerator, setConvertedNumerator);
    if (active === "converted-denominator") update(convertedDenominator, setConvertedDenominator);
    if (active === "result-decimal") update(resultDecimal, setResultDecimal, true);
    if (active === "result-numerator") update(resultNumerator, setResultNumerator);
    if (active === "result-denominator") update(resultDenominator, setResultDenominator);
    if (active === "result-whole") update(resultWhole, setResultWhole);
    clearFeedback();
  };
  const check = () => {
    const conversionCorrect = method === "decimal"
      ? !fractionOperand || equivalentDecimal(convertedDecimal, decimalFromFraction(fractionOperand))
      : !decimalOperand || equivalentFraction(convertedNumerator, convertedDenominator, fractionFromDecimal(decimalOperand));
    const resultCorrect = method === "decimal"
      ? equivalentDecimal(resultDecimal, expectedResultDecimal)
      : fractionResultIsWhole
        ? Number(resultWhole) === expectedResultFraction.numerator
        : equivalentFraction(resultNumerator, resultDenominator, expectedResultFraction);
    const answerLabel = method === "decimal" ? resultDecimal : fractionResultIsWhole ? resultWhole : `${resultNumerator}/${resultDenominator}`;
    const correct = conversionCorrect && resultCorrect;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answerLabel);
  };
  const calculationTerm = (term: Term) => {
    if (readOnly) return <StaticTerm term={term} />;
    if (method === "decimal" && term.kind === "fraction") return <DecimalCalculationField value={convertedDecimal} label="Zapis dziesiętny po zamianie" active={active === "converted-decimal"} onActivate={() => setActive("converted-decimal")} />;
    if (method === "fraction" && term.kind === "decimal") return <FractionCalculationField numerator={convertedNumerator} denominator={convertedDenominator} numeratorLabel="Licznik ułamka po zamianie" denominatorLabel="Mianownik ułamka po zamianie" active={active} onActivate={setActive} />;
    return <StaticTerm term={term} />;
  };
  const resultField = readOnly ? <span className="flex items-center">{shownAnswer}</span> : method === "decimal"
    ? <DecimalCalculationField value={resultDecimal} label="Wynik dziesiętny" active={active === "result-decimal"} onActivate={() => setActive("result-decimal")} />
    : fractionResultIsWhole
      ? <DecimalCalculationField value={resultWhole} label="Wynik całkowity" active={active === "result-whole"} onActivate={() => setActive("result-whole")} />
      : <ResultFractionField numerator={resultNumerator} denominator={resultDenominator} active={active} onActivate={setActive} />;
  const requiresConversion = method === "decimal" ? Boolean(fractionOperand) : Boolean(decimalOperand);
  const helperText = active === "converted-decimal" ? "Wpisz zapis dziesiętny ułamka, który zamieniasz." : active === "converted-numerator" || active === "converted-denominator" ? "Wpisz ułamek zwykły po zamianie liczby dziesiętnej." : active === "result-decimal" ? "Wpisz wynik w zapisie dziesiętnym." : active === "result-whole" ? "Wpisz wynik całkowity." : "Wpisz licznik lub mianownik wyniku.";

  return <LessonTaskFrame eyebrow={eyebrow} heading={title} description="Wybierz dogodny zapis liczby, zapisz obliczenia i podaj wynik." questionNumber={safeQuestionNumber} questionCount={safeQuestionCount} contentClassName="grid gap-5" data-decimal-fraction-operations data-activity={activity}>
    <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
      <p className="text-center font-bold text-indigo-950">{task.suggestedMethod}</p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-4xl font-black text-slate-950 sm:text-5xl"><StaticTerm term={task.left} /><span>{task.operator}</span><StaticTerm term={task.right} /><span>=</span><span>?</span></div>
      {!readOnly ? <div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => chooseMethod("fraction")} aria-pressed={method === "fraction"} className={`min-h-12 rounded-xl border-2 px-5 font-black ${method === "fraction" ? "border-indigo-700 bg-indigo-700 text-white" : "border-indigo-300 bg-white text-indigo-950"}`}>Ułamki zwykłe</button><button type="button" onClick={() => chooseMethod("decimal")} aria-pressed={method === "decimal"} className={`min-h-12 rounded-xl border-2 px-5 font-black ${method === "decimal" ? "border-indigo-700 bg-indigo-700 text-white" : "border-indigo-300 bg-white text-indigo-950"}`}>Ułamki dziesiętne</button></div> : null}
    </section>
    <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5" aria-label="Zapis obliczeń">
      <div><h3 className="text-lg font-black text-amber-950">Zapis obliczeń</h3><p className="text-sm font-semibold text-amber-900">{requiresConversion ? "Uzupełnij liczbę po zamianie oraz wynik działania." : "Wykonaj działanie i zapisz wynik."}</p></div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-3xl font-black text-slate-950 sm:text-4xl">{calculationTerm(task.left)}<span>{task.operator}</span>{calculationTerm(task.right)}<span>=</span>{resultField}</div>
    </section>
    {!readOnly ? <LessonNumericKeypad allowSeparator={active === "converted-decimal" || active === "result-decimal"} label="Kalkulator do obliczeń" helperText={helperText} onKey={inputKey} onConfirm={check} /> : null}
    {feedback === "correct" ? <p role="status" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center font-black text-emerald-900">✓ Poprawnie. Wybrany zapis i obliczenia są poprawne.</p> : null}
    {feedback === "incorrect" ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 text-center font-black text-rose-900">Sprawdź zapis po zamianie oraz wynik działania.</p> : null}
  </LessonTaskFrame>;
}
