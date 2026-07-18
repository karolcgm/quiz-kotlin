"use client";

import { useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { compareDecimalStrings, comparisonSign, validateComparisonSign } from "@/lib/math/decimals/decimalComparisonL1";

export const DECIMAL_COMPARISON_PRACTICE_ACTIVITIES = ["pair-comparison", "ascending-order", "open-inequality"] as const;
export type DecimalComparisonPracticeActivity = typeof DECIMAL_COMPARISON_PRACTICE_ACTIVITIES[number];

export function isDecimalComparisonPracticeActivity(value: string): value is DecimalComparisonPracticeActivity {
  return DECIMAL_COMPARISON_PRACTICE_ACTIVITIES.includes(value as DecimalComparisonPracticeActivity);
}

const PAIRS = [
  ["10,05", "10,5"],
  ["0,7", "0,70"],
  ["3,08", "3,8"],
  ["12,4", "12,04"],
  ["0,099", "0,1"],
  ["5,500", "5,5"],
  ["2,305", "2,299"],
  ["9,01", "9,1"],
  ["0,45", "0,405"],
  ["7,007", "7,07"],
] as const;

const ORDER_TASKS = [
  ["0,5", "0,05", "0,505", "0,55"],
  ["10,5", "10,05", "10,505", "10,055"],
  ["1,2", "1,02", "1,22", "1,202"],
  ["0,9", "0,09", "0,909", "0,99"],
  ["4,04", "4,4", "4,004", "4,404", "4,044"],
] as const;

const OPEN_TASKS = [
  { left: "0,15", sign: ">", right: null, solution: "0,1" },
  { left: null, sign: ">", right: "2,08", solution: "2,1" },
  { left: "3,4", sign: "<", right: null, solution: "3,5" },
  { left: null, sign: "<", right: "0,09", solution: "0,08" },
  { left: "10,05", sign: "<", right: null, solution: "10,5" },
  { left: null, sign: ">", right: "0,999", solution: "1" },
] as const;

type Props = {
  activity: DecimalComparisonPracticeActivity;
  seed: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
};

export function DecimalComparisonPracticeLab(props: Props) {
  return <DecimalComparisonRound key={`${props.activity}-${props.questionNumber ?? 1}`} {...props} />;
}

function DecimalComparisonRound({ activity, readOnly = false, presentationMode = false, questionNumber = 1, questionCount = 1, onResultChange }: Props) {
  const index = Math.max(0, questionNumber - 1);
  const pair = PAIRS[index % PAIRS.length]!;
  const orderItems = ORDER_TASKS[index % ORDER_TASKS.length]!;
  const openTask = OPEN_TASKS[index % OPEN_TASKS.length]!;
  const [sign, setSign] = useState<"<" | ">" | "=" | "">("");
  const [order, setOrder] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const clear = () => {
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    let correct = false;
    let answer = "";
    if (activity === "pair-comparison") {
      correct = validateComparisonSign(pair[0], pair[1], sign);
      answer = `${pair[0]} ${sign} ${pair[1]}`;
    } else if (activity === "ascending-order") {
      correct = order.length === orderItems.length && order.every((value, itemIndex) => itemIndex === 0 || compareDecimalStrings(order[itemIndex - 1]!, value) <= 0);
      answer = order.join(" < ");
    } else {
      try {
        const left = openTask.left ?? input;
        const right = openTask.right ?? input;
        correct = input.length > 0 && comparisonSign(left, right) === openTask.sign;
        answer = `${left} ${openTask.sign} ${right}`;
      } catch {
        correct = false;
        answer = input;
      }
    }
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answer);
  };

  const title = activity === "pair-comparison" ? "Porównaj ułamki dziesiętne" : activity === "ascending-order" ? "Od najmniejszego do największego" : "Wpisz liczbę spełniającą nierówność";

  return <LessonTaskFrame eyebrow="Dział 5 · Ułamki dziesiętne" heading={title} description={activity === "pair-comparison" ? "Wstaw znak <, > albo =. Zwróć uwagę na wartość cyfr, a nie długość zapisu." : activity === "ascending-order" ? "Klikaj liczby w kolejności rosnącej. Każda wybrana liczba trafia do zapisu rozwiązania." : "Wpisz dowolną liczbę dziesiętną, dla której nierówność będzie prawdziwa."} questionNumber={questionNumber} questionCount={questionCount} contentClassName="grid gap-4" data-decimal-comparison-practice data-activity={activity} data-presentation-mode={presentationMode || undefined}>
    {activity === "pair-comparison" ? <section className="grid gap-5 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5"><div className="flex flex-wrap items-center justify-center gap-4 text-3xl font-black"><span>{pair[0]}</span><span className="min-w-14 rounded-xl border-2 border-indigo-300 bg-white p-2 text-center">{readOnly ? comparisonSign(pair[0], pair[1]) : sign || "□"}</span><span>{pair[1]}</span></div>{!readOnly ? <div className="grid grid-cols-3 gap-3" role="group" aria-label="Wybierz znak porównania">{(["<", ">", "="] as const).map((value) => <button key={value} type="button" aria-pressed={sign === value} className="min-h-14 rounded-xl border-2 border-indigo-300 bg-white text-2xl font-black aria-pressed:border-indigo-800 aria-pressed:bg-indigo-800 aria-pressed:text-white" onClick={() => { setSign(value); clear(); }}>{value}</button>)}</div> : null}</section> : null}

    {activity === "ascending-order" ? <section className="grid gap-5 rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-5"><div className="flex min-h-16 flex-wrap items-center justify-center gap-3 rounded-2xl bg-white p-4 text-xl font-black" aria-label="Ułożona kolejność">{(readOnly ? [...orderItems].sort(compareDecimalStrings) : order).map((value, itemIndex) => <span key={`${value}-${itemIndex}`} className="contents"><span className="rounded-xl bg-indigo-100 px-3 py-2">{value}</span>{itemIndex < (readOnly ? orderItems.length : order.length) - 1 ? <span>&lt;</span> : null}</span>)}{!readOnly && order.length === 0 ? <span className="text-slate-500">Tutaj pojawi się Twoja kolejność</span> : null}</div>{!readOnly ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{orderItems.map((value) => <button key={value} type="button" disabled={order.includes(value)} className="min-h-12 rounded-xl border-2 border-cyan-400 bg-white px-3 text-lg font-black disabled:opacity-30" onClick={() => { setOrder((current) => [...current, value]); clear(); }}>{value}</button>)}</div> : null}{!readOnly ? <div className="flex flex-wrap gap-2"><button type="button" disabled={order.length === 0} className="min-h-12 flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 font-black disabled:opacity-30" onClick={() => { setOrder((current) => current.slice(0, -1)); clear(); }}>Cofnij ostatnią</button><button type="button" disabled={order.length === 0} className="min-h-12 flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 font-black disabled:opacity-30" onClick={() => { setOrder([]); clear(); }}>Ułóż od początku</button></div> : null}</section> : null}

    {activity === "open-inequality" ? <section className="grid gap-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5"><div className="flex flex-wrap items-center justify-center gap-4 text-3xl font-black"><span>{openTask.left ?? (readOnly ? openTask.solution : input || "□")}</span><span>{openTask.sign}</span><span>{openTask.right ?? (readOnly ? openTask.solution : input || "□")}</span></div>{!readOnly ? <input aria-label="Wpisywana liczba dziesiętna" value={input} readOnly className="mx-auto h-14 w-40 rounded-xl border-2 border-amber-500 bg-white text-center text-2xl font-black" /> : null}<p className="text-center font-bold text-amber-950">Możliwych poprawnych odpowiedzi jest wiele. Wystarczy podać jedną.</p></section> : null}

    {!readOnly && activity === "open-inequality" ? <LessonNumericKeypad allowSeparator label="Kalkulator do wpisania liczby" helperText="Wpisz liczbę z przecinkiem i zatwierdź jeden raz na końcu." onKey={(key) => { setInput((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`); clear(); }} onConfirm={check} /> : null}
    {!readOnly && activity !== "open-inequality" ? <button type="button" className="min-h-12 rounded-xl bg-slate-950 px-5 font-black text-white" onClick={check}>Zatwierdź</button> : null}
    {feedback === "correct" ? <p role="status" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 font-black text-emerald-900">✓ Poprawnie. Przejdź do następnego zadania.</p> : null}
    {feedback === "incorrect" ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3 font-black text-rose-900">Sprawdź wartość cyfr na kolejnych miejscach i spróbuj ponownie.</p> : null}
  </LessonTaskFrame>;
}
