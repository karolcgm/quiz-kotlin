"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import type { Grade6SignedNumbersActivity } from "@/components/lessons/models/Grade6SignedNumbersLessonLab";

interface Props {
  activity: Grade6SignedNumbersActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Sign = "+" | "−" | "0";
type NumberLineSpec = {
  values: number[];
  focus?: number[];
  labels?: string[];
  min?: number;
  max?: number;
  subdivisions?: number;
};
type TokenModelSpec = {
  expression: string;
  positive: number;
  negative: number;
};
type ChoiceTask = {
  id: string;
  prompt: string;
  model: ReactNode;
  options: Array<{ value: string; label: ReactNode }>;
  answer: string;
  answerNode: ReactNode;
  explanation: string;
  axis?: NumberLineSpec;
  tokens?: TokenModelSpec;
};
type WorkField = { id: string; label: string; expected: string; width?: "small" | "wide" };
type WorkTask = {
  id: string;
  prompt: string;
  model: ReactNode;
  fields: WorkField[];
  expectedSign?: Sign;
  answerNode: ReactNode;
  explanation: string;
  storyIcon?: string;
  stageLabels?: string[];
  tokens?: TokenModelSpec;
};
type FractionValue = { sign?: Sign; numerator: string; denominator: string };
type SignedFractionTask = {
  id: string;
  prompt: string;
  source: ReactNode;
  expandedLeft: FractionValue;
  operator: "+" | "−";
  expandedRight: FractionValue;
  intermediate?: FractionValue;
  result: FractionValue;
  answerNode: ReactNode;
  explanation: string;
};
type StoryTask = {
  id: string;
  title: string;
  prompt: string;
  imageSrc: string;
  imageAlt: string;
  data: Array<{ id: string; label: string; expected: string; unit: string }>;
  operands: [string, string, string];
  operators: ["+" | "−", "+" | "−"];
  result: string;
  answerLead: string;
  answerUnit: string;
  answerNode: ReactNode;
};

export const GRADE6_SIGNED_NUMBERS_TASK_COUNTS: Partial<Record<Grade6SignedNumbersActivity, number>> = {};

function Fraction({ numerator, denominator }: { numerator: ReactNode; denominator: ReactNode }) {
  return <span className="inline-grid min-w-9 grid-rows-2 align-middle text-center font-black leading-none" data-stacked-fraction>
    <span className="border-b-2 border-current px-1 pb-1">{numerator}</span>
    <span className="px-1 pt-1">{denominator}</span>
  </span>;
}

function SignedFraction({ sign = "+", numerator, denominator }: { sign?: Sign; numerator: ReactNode; denominator: ReactNode }) {
  return <span className="inline-flex items-center gap-1">{sign === "−" ? <span>−</span> : null}<Fraction numerator={numerator} denominator={denominator} /></span>;
}

function options(rows: Array<[string, ReactNode]>) {
  return rows.map(([value, label]) => ({ value, label }));
}

function NumberLine({ values, focus = [], labels = [], min: explicitMin, max: explicitMax, subdivisions = 1 }: NumberLineSpec) {
  const min = explicitMin ?? Math.floor(Math.min(-5, ...values));
  const max = explicitMax ?? Math.ceil(Math.max(5, ...values));
  const step = 1 / Math.max(1, subdivisions);
  const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, index) => min + index * step);
  const position = (value: number) => 7 + ((value - min) / (max - min)) * 86;
  const pointColors = ["#7c3aed", "#0891b2", "#db2777", "#ea580c"];
  return <div className="rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white px-3 py-5" role="img" aria-label={`Oś liczbowa od ${min} do ${max}`}>
    <div className="relative mx-auto h-28 max-w-4xl">
      <div className="absolute left-[5%] right-[5%] top-12 h-1 rounded-full bg-indigo-900" />
      <span className="absolute left-[3%] top-[38px] text-2xl font-black text-indigo-900">‹</span>
      <span className="absolute right-[3%] top-[38px] text-2xl font-black text-indigo-900">›</span>
      {ticks.map((value) => {
        const isInteger = Math.abs(value - Math.round(value)) < 0.0001;
        return <div key={value} className="absolute top-9 -translate-x-1/2 text-center" style={{ left: `${position(value)}%` }}>
          <span className={`mx-auto block rounded ${isInteger ? "h-7 w-1" : "mt-2 h-4 w-0.5"} ${value === 0 ? "bg-violet-700" : "bg-slate-500"}`} />
          {isInteger ? <b className={`mt-1 block text-sm ${value === 0 ? "text-violet-800" : "text-slate-700"}`}>{value < 0 ? `−${Math.abs(value)}` : value}</b> : null}
        </div>;
      })}
      {focus.map((value, index) => <div key={`${value}-${index}`} className="absolute top-1 -translate-x-1/2 text-center" style={{ left: `${position(value)}%` }}>
        <b className="mb-1 block text-sm text-slate-900">{labels[index] ?? ""}</b>
        <span className="block h-6 w-6 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: pointColors[index % pointColors.length] }} />
      </div>)}
    </div>
    <div className="flex justify-between text-sm font-black text-indigo-800"><span>mniejsze</span><span>większe</span></div>
  </div>;
}

function ContextCompass() {
  return <section className="grid gap-3 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 sm:grid-cols-3">
    <div className="rounded-2xl bg-rose-100 p-4 text-center"><span className="text-4xl">↓</span><b className="mt-2 block text-rose-900">poniżej zera</b><span className="text-sm font-bold text-rose-800">dług, mróz, poziom pod ziemią</span></div>
    <div className="rounded-2xl bg-violet-100 p-4 text-center"><span className="text-4xl">0</span><b className="mt-2 block text-violet-900">punkt odniesienia</b><span className="text-sm font-bold text-violet-800">od niego określamy kierunek</span></div>
    <div className="rounded-2xl bg-emerald-100 p-4 text-center"><span className="text-4xl">↑</span><b className="mt-2 block text-emerald-900">powyżej zera</b><span className="text-sm font-bold text-emerald-800">zysk, ciepło, poziom nad ziemią</span></div>
  </section>;
}

function NumberSetsGuide() {
  return <section className="space-y-4 rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 sm:p-5">
    <div className="text-center">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Rodziny liczb</p>
      <h3 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Jedna rodzina liczb mieści się w drugiej</h3>
      <p className="mt-1 text-sm font-bold text-slate-600">Najmniejsze koło jest częścią każdego większego koła.</p>
    </div>

    <div className="mx-auto max-w-3xl rounded-[50%] border-4 border-violet-300 bg-violet-100 px-4 py-6 shadow-inner sm:px-10 sm:py-8" data-number-set="wymierne">
      <div className="text-center text-violet-950">
        <b className="text-lg sm:text-xl">Liczby wymierne</b>
        <div className="mt-1 flex items-center justify-center gap-3 font-black">
          <SignedFraction sign="−" numerator="3" denominator="4" />
          <span>0,25</span>
          <Fraction numerator="1" denominator="2" />
        </div>
      </div>
      <div className="mx-auto mt-3 max-w-2xl rounded-[50%] border-4 border-sky-300 bg-sky-100 px-4 py-5 sm:px-8 sm:py-6" data-number-set="całkowite">
        <div className="text-center text-sky-950">
          <b className="text-lg sm:text-xl">Liczby całkowite</b>
          <div className="mt-1 font-black">…, −3, −2, −1</div>
        </div>
        <div className="mx-auto mt-3 max-w-lg rounded-[999px] border-4 border-emerald-300 bg-emerald-100 px-4 py-6 text-center text-emerald-950 sm:py-8" data-number-set="naturalne">
          <b className="text-lg sm:text-xl">Liczby naturalne</b>
          <div className="mt-1 text-lg font-black sm:text-xl">0, 1, 2, 3, …</div>
        </div>
      </div>
    </div>

    <div className="grid gap-2 text-center text-sm font-bold sm:grid-cols-2">
      <p className="rounded-xl bg-emerald-50 p-3 text-emerald-950">Każda liczba naturalna jest także całkowita.</p>
      <p className="rounded-xl bg-violet-50 p-3 text-violet-950">Każda liczba całkowita jest także wymierna.</p>
    </div>

    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h4 className="text-center text-lg font-black text-slate-950">Położenie liczby względem zera</h4>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-emerald-100 p-3 text-center"><b className="block text-emerald-950">dodatnia</b><span className="font-black text-emerald-800">większa od 0</span></div>
        <div className="rounded-xl bg-rose-100 p-3 text-center"><b className="block text-rose-950">ujemna</b><span className="font-black text-rose-800">mniejsza od 0</span></div>
        <div className="rounded-xl bg-cyan-100 p-3 text-center"><b className="block text-cyan-950">nieujemna</b><span className="font-black text-cyan-800">większa lub równa 0</span></div>
        <div className="rounded-xl bg-amber-100 p-3 text-center"><b className="block text-amber-950">niedodatnia</b><span className="font-black text-amber-800">mniejsza lub równa 0</span></div>
      </div>
      <p className="mt-3 rounded-xl bg-slate-900 px-3 py-2 text-center text-sm font-bold text-white">Zero jest liczbą nieujemną i niedodatnią, ale nie jest ani dodatnie, ani ujemne.</p>
    </div>
  </section>;
}

function SignRulesGuide() {
  return <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-4 shadow-sm">
    <h3 className="text-center text-xl font-black text-indigo-950">Najpierw uporządkuj znaki stojące obok siebie</h3>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-center">
        <p className="text-sm font-black uppercase tracking-wide text-rose-700">Plus i minus</p>
        <p className="mt-2 text-4xl font-black text-rose-950">+ (−4) → −4</p>
        <p className="mt-2 font-bold text-rose-900">Gdy obok siebie są plus i minus, zapisujemy minus.</p>
      </div>
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Dwa minusy</p>
        <p className="mt-2 text-4xl font-black text-emerald-950">− (−4) → +4</p>
        <p className="mt-2 font-bold text-emerald-900">Gdy obok siebie są dwa minusy, zapisujemy plus.</p>
      </div>
    </div>
  </section>;
}

function AdditionRulesGuide() {
  return <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 p-4 shadow-sm">
    <h3 className="text-center text-xl font-black text-indigo-950">Po uproszczeniu znaków wybierz jedną regułę</h3>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Te same znaki</p>
        <p className="mt-2 text-lg font-black text-emerald-950">Dodaj liczby i daj znak tych liczb.</p>
        <p className="mt-2 text-3xl font-black text-emerald-900">−4 − 3 = −7</p>
      </div>
      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-center">
        <p className="text-sm font-black uppercase tracking-wide text-rose-700">Różne znaki</p>
        <p className="mt-2 text-lg font-black text-rose-950">Odejmij liczby i wstaw znak większej liczby.</p>
        <p className="mt-2 text-3xl font-black text-rose-900">−6 + 1 = −5</p>
      </div>
    </div>
  </section>;
}

function ZeroPairLab({ readOnly, spec }: { readOnly: boolean; spec: TokenModelSpec }) {
  const [pairs, setPairs] = useState(0);
  const maxPairs = Math.min(spec.positive, spec.negative);
  const remainingPositive = spec.positive - pairs;
  const remainingNegative = spec.negative - pairs;
  const ready = pairs === maxPairs;
  const result = remainingPositive - remainingNegative;
  return <section className="rounded-3xl border-2 border-violet-200 bg-white p-4 shadow-sm">
    <div className="rounded-2xl bg-indigo-950 p-4 text-center text-white">
      <p className="text-sm font-black uppercase tracking-[.14em] text-cyan-200">Liczby o przeciwnych znakach</p>
      <p className="mt-1 text-lg font-black">Odejmij mniejszą liczbę bez znaku od większej. Wstaw znak tej liczby, która bez znaku jest większa.</p>
    </div>
    <p className="mt-4 text-center text-4xl font-black text-indigo-950 sm:text-5xl">{spec.expression} = ?</p>
    <p className="mt-2 text-center font-bold text-slate-700">Połącz dodatni i ujemny żeton. Każda taka para ma wartość 0.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-rose-50 p-3"><b className="block text-center text-rose-900">Ujemne żetony</b><div className="mt-3 flex flex-wrap justify-center gap-2">{Array.from({ length: spec.negative }, (_, index) => <span key={index} className={`grid h-10 w-10 place-items-center rounded-full border-2 font-black ${index < pairs ? "border-slate-300 bg-slate-100 text-slate-300 line-through" : "border-rose-700 bg-rose-300 text-rose-950"}`}>−1</span>)}</div></div>
      <div className="rounded-2xl bg-emerald-50 p-3"><b className="block text-center text-emerald-900">Dodatnie żetony</b><div className="mt-3 flex flex-wrap justify-center gap-2">{Array.from({ length: spec.positive }, (_, index) => <span key={index} className={`grid h-10 w-10 place-items-center rounded-full border-2 font-black ${index < pairs ? "border-slate-300 bg-slate-100 text-slate-300 line-through" : "border-emerald-700 bg-emerald-300 text-emerald-950"}`}>+1</span>)}</div></div>
    </div>
    <div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" disabled={readOnly || ready} onClick={() => setPairs((value) => Math.min(maxPairs, value + 1))} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Usuń następną parę zerową</button><button type="button" disabled={readOnly || pairs === 0} onClick={() => setPairs(0)} className="min-h-12 rounded-xl border-2 border-violet-300 px-4 font-black text-violet-900 disabled:opacity-40">Od początku</button></div>
    <p role="status" className="mt-3 rounded-2xl bg-slate-100 p-3 text-center font-black">{ready ? <>Pozostało: {remainingNegative} ujemnych i {remainingPositive} dodatnich, więc wynik to {displayInteger(result)}.</> : <>Pozostało: {remainingNegative} ujemnych i {remainingPositive} dodatnich. Usuń jeszcze {maxPairs - pairs} {maxPairs - pairs === 1 ? "parę" : "pary"}.</>}</p>
  </section>;
}

const contextTasks: ChoiceTask[] = [
  ["Temperatura wynosi 4°C poniżej zera. Która liczba ją opisuje?", "🌡️", "−4", [["−4", "−4"], ["4", "+4"], ["0", "0"]], "Poniżej zera oznacza znak minus."],
  ["Winda stoi trzy piętra pod parterem. Który poziom pokazuje wyświetlacz?", "🛗", "−3", [["−3", "−3"], ["3", "+3"], ["0", "0"]], "Parter jest punktem 0, a poziomy pod nim są ujemne."],
  ["Na koncie jest 25 zł długu. Jak zapisujemy saldo?", "💳", "−25", [["−25", "−25 zł"], ["25", "+25 zł"], ["0", "0 zł"]], "Dług opisujemy liczbą ujemną."],
  ["Punkt widokowy leży 7 m nad poziomem odniesienia. Jaka liczba go opisuje?", "⛰️", "7", [["7", "+7 m"], ["−7", "−7 m"], ["0", "0 m"]], "Położenie nad poziomem odniesienia jest dodatnie."],
  ["Temperatura wzrosła o 6°C. Jaka liczba opisuje zmianę?", "☀️", "6", [["6", "+6°C"], ["−6", "−6°C"], ["0", "0°C"]], "Wzrost jest zmianą dodatnią."],
  ["Nurek zanurzył się o 5 m. Jaka liczba opisuje zmianę wysokości?", "🤿", "−5", [["−5", "−5 m"], ["5", "+5 m"], ["0", "0 m"]], "Ruch w dół zmniejsza wysokość, więc ma znak minus."],
].map(([prompt, icon, answer, rows, explanation], index) => ({ id: `context-${index}`, prompt: prompt as string, model: <span className="text-7xl" aria-hidden>{icon as string}</span>, options: options(rows as Array<[string, ReactNode]>), answer: answer as string, answerNode: <>{answer as string}</>, explanation: explanation as string }));

const numberSetOptions = options([
  ["naturalna, całkowita i wymierna", "naturalna, całkowita i wymierna"],
  ["całkowita i wymierna, ale nie naturalna", "całkowita i wymierna, ale nie naturalna"],
  ["wymierna, ale nie całkowita", "wymierna, ale nie całkowita"],
]);
const numberSignOptions = options([
  ["dodatnia i nieujemna", "dodatnia i nieujemna"],
  ["ujemna i niedodatnia", "ujemna i niedodatnia"],
  ["nieujemna i niedodatnia", "nieujemna i niedodatnia"],
]);
const numberSetTasks: ChoiceTask[] = [
  { id: "sets-0", prompt: "Do jakich zbiorów należy ta liczba?", model: <span className="text-6xl font-black">0</span>, options: numberSetOptions, answer: "naturalna, całkowita i wymierna", answerNode: <>naturalna, całkowita i wymierna</>, explanation: "Zero należy do liczb naturalnych, całkowitych i wymiernych." },
  { id: "sets-1", prompt: "Do jakich zbiorów należy ta liczba?", model: <span className="text-6xl font-black">7</span>, options: numberSetOptions, answer: "naturalna, całkowita i wymierna", answerNode: <>naturalna, całkowita i wymierna</>, explanation: "Każda liczba naturalna jest także całkowita i wymierna." },
  { id: "sets-2", prompt: "Do jakich zbiorów należy ta liczba?", model: <span className="text-6xl font-black">−3</span>, options: numberSetOptions, answer: "całkowita i wymierna, ale nie naturalna", answerNode: <>całkowita i wymierna, ale nie naturalna</>, explanation: "Ujemna liczba całkowita nie jest naturalna, ale jest wymierna." },
  { id: "sets-3", prompt: "Do jakich zbiorów należy ta liczba?", model: <span className="text-5xl"><Fraction numerator="3" denominator="4" /></span>, options: numberSetOptions, answer: "wymierna, ale nie całkowita", answerNode: <>wymierna, ale nie całkowita</>, explanation: "Ten ułamek jest liczbą wymierną, lecz nie jest liczbą całkowitą." },
  { id: "sets-4", prompt: "Do jakich zbiorów należy ta liczba?", model: <span className="text-5xl"><Fraction numerator="−3" denominator="4" /></span>, options: numberSetOptions, answer: "wymierna, ale nie całkowita", answerNode: <>wymierna, ale nie całkowita</>, explanation: "Znak minus nie zmienia tego, że ułamek jest liczbą wymierną." },
  { id: "sets-5", prompt: "Jak określamy tę liczbę względem zera?", model: <span className="text-6xl font-black">0</span>, options: numberSignOptions, answer: "nieujemna i niedodatnia", answerNode: <>nieujemna i niedodatnia</>, explanation: "Zero spełnia jednocześnie warunek „większa lub równa zero” i „mniejsza lub równa zero”." },
  { id: "sets-6", prompt: "Jak określamy tę liczbę względem zera?", model: <span className="text-6xl font-black">−2</span>, options: numberSignOptions, answer: "ujemna i niedodatnia", answerNode: <>ujemna i niedodatnia</>, explanation: "−2 jest mniejsze od zera, więc jest ujemne i niedodatnie." },
  { id: "sets-7", prompt: "Jak określamy tę liczbę względem zera?", model: <span className="text-6xl font-black">2,5</span>, options: numberSignOptions, answer: "dodatnia i nieujemna", answerNode: <>dodatnia i nieujemna</>, explanation: "2,5 jest większe od zera, więc jest dodatnie i nieujemne." },
];

const integerCompareRows: Array<[number, number, "<" | ">" | "=", string]> = [[2, 5, "<", "2 leży na osi na lewo od 5."], [7, -2, ">", "Każda liczba dodatnia jest większa od ujemnej."], [-3, 1, "<", "−3 leży na lewo od 1."], [-2, -6, ">", "−2 leży bliżej zera i bardziej na prawo."], [-9, -4, "<", "−9 leży bardziej na lewo niż −4."], [0, -5, ">", "Zero jest większe od każdej liczby ujemnej."], [-7, -7, "=", "Obie liczby oznaczają ten sam punkt."], [4, 0, ">", "Liczba dodatnia jest większa od zera."]];
const integerCompareTasks = integerCompareRows.map(([left, right, answer, explanation], index) => ({ id: `int-compare-${index}`, prompt: "Wstaw właściwy znak.", model: <span className="text-5xl font-black">{left < 0 ? `−${Math.abs(left)}` : left} □ {right < 0 ? `−${Math.abs(right)}` : right}</span>, options: options([["<", "<"], [">", ">"], ["=", "="]]), answer, answerNode: <>{answer}</>, explanation, axis: { values: [left, right], focus: [left, right] } }));


const rationalAxis: NumberLineSpec = {
  values: [-2, 0, 2],
  focus: [-1.5, -0.75, 0.5, 1.25],
  labels: ["A", "B", "C", "D"],
  min: -2,
  max: 2,
  subdivisions: 4,
};

const rationalLineTasks: ChoiceTask[] = [
  {
    id: "rat-line-distance-a",
    prompt: "Jaka jest odległość punktu A od zera?",
    model: <span className="font-bold">Odległość od zera jest zawsze liczbą nieujemną.</span>,
    options: options([
      ["answer", <span key="answer">1 <Fraction numerator="1" denominator="2" /></span>],
      ["d1", <span key="d1">−1 <Fraction numerator="1" denominator="2" /></span>],
      ["d2", <Fraction key="d2" numerator="1" denominator="2" />],
    ]),
    answer: "answer",
    answerNode: <>1 <Fraction numerator="1" denominator="2" /></>,
    explanation: "Punkt A leży półtorej jednostki od zera.",
    axis: rationalAxis,
  },
  {
    id: "rat-line-opposite-b",
    prompt: "Która liczba jest przeciwna do liczby zaznaczonej w punkcie B?",
    model: <span className="font-bold">Liczba przeciwna leży po drugiej stronie zera w tej samej odległości.</span>,
    options: options([
      ["answer", <Fraction key="answer" numerator="3" denominator="4" />],
      ["d1", <SignedFraction key="d1" sign="−" numerator="3" denominator="4" />],
      ["d2", <Fraction key="d2" numerator="1" denominator="4" />],
    ]),
    answer: "answer",
    answerNode: <Fraction numerator="3" denominator="4" />,
    explanation: "Punkt B oznacza minus trzy czwarte, więc liczbą przeciwną jest trzy czwarte.",
    axis: rationalAxis,
  },
  {
    id: "rat-line-distance-c",
    prompt: "Jaka jest odległość punktu C od zera?",
    model: <span className="font-bold">Odległość od zera jest zawsze liczbą nieujemną.</span>,
    options: options([
      ["answer", <Fraction key="answer" numerator="1" denominator="2" />],
      ["d1", <SignedFraction key="d1" sign="−" numerator="1" denominator="2" />],
      ["d2", <span key="d2">1 <Fraction numerator="1" denominator="2" /></span>],
    ]),
    answer: "answer",
    answerNode: <Fraction numerator="1" denominator="2" />,
    explanation: "Punkt C leży pół jednostki od zera.",
    axis: rationalAxis,
  },
  {
    id: "rat-line-opposite-d",
    prompt: "Która liczba jest przeciwna do liczby zaznaczonej w punkcie D?",
    model: <span className="font-bold">Liczba przeciwna leży po drugiej stronie zera w tej samej odległości.</span>,
    options: options([
      ["answer", <span key="answer">−1 <Fraction numerator="1" denominator="4" /></span>],
      ["d1", <span key="d1">1 <Fraction numerator="1" denominator="4" /></span>],
      ["d2", <SignedFraction key="d2" sign="−" numerator="3" denominator="4" />],
    ]),
    answer: "answer",
    answerNode: <>−1 <Fraction numerator="1" denominator="4" /></>,
    explanation: "Punkt D oznacza jeden i jedną czwartą, więc liczba przeciwna leży symetrycznie po lewej stronie zera.",
    axis: rationalAxis,
  },
];

const signRulesTasks: ChoiceTask[] = [
  ["5 + (−2)", "5 − 2", ["5 + 2", "−5 − 2", "−5 + 2"], "Plus stojący obok minusa zmieniamy na minus."],
  ["−6 + (−3)", "−6 − 3", ["−6 + 3", "6 − 3", "6 + 3"], "Po usunięciu nawiasu plus i minus zmieniają się w minus."],
  ["8 − (−4)", "8 + 4", ["8 − 4", "−8 + 4", "−8 − 4"], "Dwa minusy stojące obok siebie zmieniamy na plus."],
  ["−7 − (−2)", "−7 + 2", ["−7 − 2", "7 + 2", "7 − 2"], "Odejmowanie liczby ujemnej zmienia się w dodawanie."],
  ["3 + (−9)", "3 − 9", ["3 + 9", "−3 − 9", "−3 + 9"], "Plus i minus stojące obok siebie zapisujemy jako minus."],
  ["−5 − (−8)", "−5 + 8", ["−5 − 8", "5 + 8", "5 − 8"], "Dwa sąsiadujące minusy zapisujemy jako plus."],
].map(([expression, answer, distractors, explanation], index) => ({
  id: `sign-rule-${index}`,
  prompt: "Jak zapisać działanie po usunięciu nawiasu?",
  model: <span className="text-5xl font-black">{expression as string}</span>,
  options: options([[answer as string, answer as string], ...(distractors as string[]).map((value) => [value, value] as [string, ReactNode])]),
  answer: answer as string,
  answerNode: <>{answer as string}</>,
  explanation: explanation as string,
}));

const rationalCompareTasks: ChoiceTask[] = [
  { id: "rat-1", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−<Fraction numerator="1" denominator="2" /> □ −<Fraction numerator="3" denominator="4" /></span>, answer: ">", answerNode: <>&gt;</>, explanation: "Minus jedna druga jest bliżej zera, więc leży bardziej na prawo." },
  { id: "rat-2", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−0,6 □ −0,4</span>, answer: "<", answerNode: <>&lt;</>, explanation: "−0,6 leży bardziej na lewo." },
  { id: "rat-3", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black"><Fraction numerator="2" denominator="5" /> □ 0,4</span>, answer: "=", answerNode: <>=</>, explanation: "Dwie piąte i 0,4 oznaczają tę samą liczbę." },
  { id: "rat-4", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−<Fraction numerator="7" denominator="8" /> □ −0,8</span>, answer: "<", answerNode: <>&lt;</>, explanation: "Siedem ósmych to 0,875; po stronie ujemnej większy moduł oznacza mniejszą liczbę." },
  { id: "rat-5", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−1 <Fraction numerator="1" denominator="4" /> □ −1,2</span>, answer: "<", answerNode: <>&lt;</>, explanation: "−1,25 leży na lewo od −1,2." },
  { id: "rat-6", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">0 □ −<Fraction numerator="1" denominator="10" /></span>, answer: ">", answerNode: <>&gt;</>, explanation: "Zero jest większe od każdej liczby ujemnej." },
  { id: "rat-7", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−<Fraction numerator="5" denominator="6" /> □ −<Fraction numerator="4" denominator="5" /></span>, answer: "<", answerNode: <>&lt;</>, explanation: "Po sprowadzeniu do mianownika 30 liczba z licznikiem −25 leży na lewo od liczby z licznikiem −24." },
  { id: "rat-8", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black"><Fraction numerator="3" denominator="2" /> □ 1,5</span>, answer: "=", answerNode: <>=</>, explanation: "Trzy drugie to 1,5." },
].map((task) => ({ ...task, options: options([["<", "<"], [">", ">"], ["=", "="]]) }));

const oppositeTasks: ChoiceTask[] = [
  ["−6", "6", "Liczby −6 i 6 leżą w tej samej odległości od zera."], ["4", "−4", "Zmiana znaku daje liczbę przeciwną."], ["0", "0", "Liczbą przeciwną do zera jest zero."], ["−0,75", "0,75", "Odległość obu liczb od zera wynosi 0,75."], ["ułamek", "minus", "Liczba przeciwna ma tę samą wartość bezwzględną i przeciwny znak."], ["−2,4", "2,4", "Wartość bezwzględna liczby −2,4 wynosi 2,4."],
].map(([given, answer, explanation], index) => ({ id: `opp-${index}`, prompt: index === 5 ? "Jaka jest wartość bezwzględna liczby?" : "Wybierz liczbę przeciwną.", model: given === "ułamek" ? <Fraction numerator="3" denominator="5" /> : <span className="text-5xl font-black">{given}</span>, options: given === "ułamek" ? options([["minus", <SignedFraction key="minus" sign="−" numerator="3" denominator="5" />], ["same", <Fraction key="same" numerator="3" denominator="5" />], ["inverse", <Fraction key="inverse" numerator="5" denominator="3" />]]) : options([[answer, answer], [given, given], ["0", "0"]]), answer, answerNode: given === "ułamek" ? <SignedFraction sign="−" numerator="3" denominator="5" /> : <>{answer}</>, explanation, axis: index < 3 ? { values: [-6, 6], focus: index === 0 ? [-6, 6] : undefined } : undefined }));

function work(id: string, prompt: string, model: ReactNode, expectedSign: Sign | undefined, fields: Array<[string, string, string]>, answerNode: ReactNode, explanation: string, stageLabels?: string[], storyIcon?: string): WorkTask {
  return { id, prompt, model, expectedSign, fields: fields.map(([fieldId, label, expected]) => ({ id: fieldId, label, expected })), answerNode, explanation, stageLabels, storyIcon };
}

const addSameTasks: WorkTask[] = [["−4 + (−3)", "−", "7", "−7"], ["5 + 8", "+", "13", "13"], ["−9 + (−6)", "−", "15", "−15"], ["12 + 7", "+", "19", "19"], ["−11 + (−2)", "−", "13", "−13"], ["6 + 14", "+", "20", "20"], ["−15 + (−5)", "−", "20", "−20"], ["21 + 9", "+", "30", "30"]].map(([expression, sign, magnitude, answer], index) => work(`same-${index}`, "Liczby mają ten sam znak: dodaj je i zachowaj ich znak.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["magnitude", "Wynik dodawania liczb bez znaków", magnitude]], <>{answer}</>, "Liczby o tych samych znakach dodajemy i dajemy znak tych liczb."));
const addDifferentTasks: WorkTask[] = [["−8 + 5", "−", "8", "5", "3", "−3"], ["7 + (−10)", "−", "10", "7", "3", "−3"], ["−4 + 11", "+", "11", "4", "7", "7"], ["13 + (−6)", "+", "13", "6", "7", "7"], ["−15 + 9", "−", "15", "9", "6", "−6"], ["18 + (−20)", "−", "20", "18", "2", "−2"], ["−12 + 12", "0", "12", "12", "0", "0"], ["25 + (−7)", "+", "25", "7", "18", "18"]].map(([expression, sign, bigger, smaller, difference, answer], index) => work(`different-${index}`, "Liczby mają różne znaki: odejmij mniejszą od większej i wstaw znak większej liczby.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["bigger", "Większa liczba", bigger], ["smaller", "Mniejsza liczba", smaller], ["difference", "Wynik odejmowania", difference]], <>{answer}</>, "Liczby o różnych znakach odejmujemy i wstawiamy znak większej liczby."));
const subtractIntegerTasks: WorkTask[] = [["6 − (−4)", "+", "10", "10"], ["−5 − 3", "−", "8", "−8"], ["−9 − (−2)", "−", "7", "−7"], ["7 − 12", "−", "5", "−5"], ["−4 − (−9)", "+", "5", "5"], ["15 − (−5)", "+", "20", "20"], ["−13 − 7", "−", "20", "−20"], ["3 − 11", "−", "8", "−8"]].map(([expression, sign, magnitude, answer], index) => work(`subtract-${index}`, "Zamień odejmowanie na dodawanie liczby przeciwnej, a potem oblicz.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["magnitude", "Wartość wyniku bez znaku", magnitude]], <>{answer}</>, "Odejmowanie liczby zamieniamy na dodawanie liczby do niej przeciwnej.", ["1. Zmień znak drugiej liczby", "2. Wykonaj dodawanie", "3. Ustal znak wyniku"]));

const mixedIntegerTasks: WorkTask[] = [
  { ...work("mixed-1", "Różne znaki: odejmij i wstaw znak większej liczby.", <div className="space-y-2"><p className="text-5xl font-black">−6 + 1</p><p className="font-black text-violet-800">znaki są już uproszczone</p></div>, "−", [["result", "Wynik odejmowania 6 − 1", "5"]], <>−5</>, "6 jest większe od 1, dlatego wynik otrzymuje znak minus."), tokens: { expression: "−6 + 1", positive: 1, negative: 6 } },
  { ...work("mixed-2", "Różne znaki: odejmij i wstaw znak większej liczby.", <div className="space-y-2"><p className="text-5xl font-black">−3 + 5</p><p className="font-black text-violet-800">znaki są już uproszczone</p></div>, "+", [["result", "Wynik odejmowania 5 − 3", "2"]], <>2</>, "5 jest większe od 3, dlatego wynik jest dodatni."), tokens: { expression: "−3 + 5", positive: 5, negative: 3 } },
  work("mixed-3", "Najpierw uprość znaki. Potem zdecyduj: dodaj czy odejmij?", <div className="space-y-2"><p className="text-5xl font-black">−4 + (−3)</p><p className="text-3xl font-black text-violet-800">−4 − 3</p></div>, "−", [["result", "Wynik dodawania 4 + 3", "7"]], <>−7</>, "Po uproszczeniu obie liczby są ujemne, więc dodajemy je i zachowujemy znak minus."),
  work("mixed-4", "Najpierw uprość znaki. Potem zdecyduj: dodaj czy odejmij?", <div className="space-y-2"><p className="text-5xl font-black">7 + (−10)</p><p className="text-3xl font-black text-violet-800">7 − 10</p></div>, "−", [["result", "Wynik odejmowania 10 − 7", "3"]], <>−3</>, "Znaki są różne, więc odejmujemy. Większa liczba to 10 ze znakiem minus."),
  work("mixed-5", "Najpierw uprość znaki. Potem zdecyduj: dodaj czy odejmij?", <div className="space-y-2"><p className="text-5xl font-black">6 − (−4)</p><p className="text-3xl font-black text-violet-800">6 + 4</p></div>, "+", [["result", "Wynik dodawania 6 + 4", "10"]], <>10</>, "Dwa minusy zmieniamy na plus. Obie liczby są dodatnie, więc je dodajemy."),
  work("mixed-6", "Najpierw uprość znaki. Potem zdecyduj: dodaj czy odejmij?", <div className="space-y-2"><p className="text-5xl font-black">−9 − (−2)</p><p className="text-3xl font-black text-violet-800">−9 + 2</p></div>, "−", [["result", "Wynik odejmowania 9 − 2", "7"]], <>−7</>, "Po uproszczeniu znaki są różne, więc odejmujemy i wstawiamy znak większej liczby."),
  work("mixed-7", "Najpierw uprość znaki. Potem zdecyduj: dodaj czy odejmij?", <div className="space-y-2"><p className="text-5xl font-black">8 + 5</p><p className="font-black text-violet-800">znaki są już uproszczone</p></div>, "+", [["result", "Wynik dodawania 8 + 5", "13"]], <>13</>, "Obie liczby są dodatnie, więc je dodajemy."),
  work("mixed-8", "Najpierw uprość znaki. Potem zdecyduj: dodaj czy odejmij?", <div className="space-y-2"><p className="text-5xl font-black">−12 + 12</p><p className="font-black text-violet-800">znaki są już uproszczone</p></div>, "0", [["result", "Wynik odejmowania 12 − 12", "0"]], <>0</>, "Liczby mają różne znaki i są równe, więc wynik to zero."),
];

const signedFractionTasks: SignedFractionTask[] = [
  { id: "fraction-chain-1", prompt: "Uprość znaki i rozpisz całe obliczenie po znaku równości.", source: <><SignedFraction sign="−" numerator="2" denominator="7" /> + (<SignedFraction sign="−" numerator="3" denominator="7" />)</>, expandedLeft: { sign: "−", numerator: "2", denominator: "7" }, operator: "−", expandedRight: { numerator: "3", denominator: "7" }, result: { sign: "−", numerator: "5", denominator: "7" }, answerNode: <SignedFraction sign="−" numerator="5" denominator="7" />, explanation: "Plus i minus zmieniamy na minus. Mianowniki są takie same, więc odejmujemy zapisane liczby zgodnie z regułą znaków." },
  { id: "fraction-chain-2", prompt: "Uprość znaki, wykonaj rachunek i skróć wynik.", source: <><Fraction numerator="5" denominator="8" /> + (<SignedFraction sign="−" numerator="3" denominator="8" />)</>, expandedLeft: { numerator: "5", denominator: "8" }, operator: "−", expandedRight: { numerator: "3", denominator: "8" }, intermediate: { numerator: "2", denominator: "8" }, result: { numerator: "1", denominator: "4" }, answerNode: <Fraction numerator="1" denominator="4" />, explanation: "Pięć ósmych minus trzy ósme daje dwie ósme, czyli jedną czwartą." },
  { id: "fraction-chain-3", prompt: "Sprowadź ułamki do wspólnego mianownika i wpisz kolejne równości.", source: <><SignedFraction sign="−" numerator="1" denominator="2" /> + <Fraction numerator="1" denominator="3" /></>, expandedLeft: { sign: "−", numerator: "3", denominator: "6" }, operator: "+", expandedRight: { numerator: "2", denominator: "6" }, result: { sign: "−", numerator: "1", denominator: "6" }, answerNode: <SignedFraction sign="−" numerator="1" denominator="6" />, explanation: "Po rozszerzeniu otrzymujemy minus trzy szóste i dwie szóste. Znaki są różne, więc odejmujemy." },
  { id: "fraction-chain-4", prompt: "Sprowadź ułamki do wspólnego mianownika i wpisz kolejne równości.", source: <><Fraction numerator="3" denominator="4" /> − <Fraction numerator="5" denominator="6" /></>, expandedLeft: { numerator: "9", denominator: "12" }, operator: "−", expandedRight: { numerator: "10", denominator: "12" }, result: { sign: "−", numerator: "1", denominator: "12" }, answerNode: <SignedFraction sign="−" numerator="1" denominator="12" />, explanation: "Dziewięć dwunastych minus dziesięć dwunastych daje minus jedną dwunastą." },
  { id: "fraction-chain-5", prompt: "Najpierw zmień dwa minusy na plus, potem rozpisz obliczenie.", source: <><SignedFraction sign="−" numerator="2" denominator="5" /> − (<SignedFraction sign="−" numerator="1" denominator="10" />)</>, expandedLeft: { sign: "−", numerator: "4", denominator: "10" }, operator: "+", expandedRight: { numerator: "1", denominator: "10" }, result: { sign: "−", numerator: "3", denominator: "10" }, answerNode: <SignedFraction sign="−" numerator="3" denominator="10" />, explanation: "Dwa minusy zmieniamy na plus. Znaki liczb są różne, więc odejmujemy i zachowujemy znak większej liczby." },
  { id: "fraction-chain-6", prompt: "Uprość znaki i rozpisz cały rachunek po znaku równości.", source: <><Fraction numerator="7" denominator="9" /> + (<SignedFraction sign="−" numerator="5" denominator="6" />)</>, expandedLeft: { numerator: "14", denominator: "18" }, operator: "−", expandedRight: { numerator: "15", denominator: "18" }, result: { sign: "−", numerator: "1", denominator: "18" }, answerNode: <SignedFraction sign="−" numerator="1" denominator="18" />, explanation: "Po rozszerzeniu odejmujemy czternaście od piętnastu i wstawiamy znak większej liczby." },
];

const decimalTasks: WorkTask[] = [["−3,8 + 5,2", "+", "3,8", "5,2", "1,4", "1,4"], ["4,5 + (−7,1)", "−", "4,5", "7,1", "2,6", "−2,6"], ["−2,4 + (−1,85)", "−", "2,4", "1,85", "4,25", "−4,25"], ["6,75 − 8,2", "−", "6,75", "8,2", "1,45", "−1,45"], ["−1,5 − (−2,75)", "+", "1,5", "2,75", "1,25", "1,25"], ["−6,02 + 0,98", "−", "6,02", "0,98", "5,04", "−5,04"]].map(([expression, sign, first, second, magnitude, answer], index) => work(`decimal-${index}`, "Uprość znaki. Te same znaki — dodaj; różne znaki — odejmij.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["first", "Pierwsza liczba bez znaku", first], ["second", "Druga liczba bez znaku", second], ["magnitude", "Wynik dodawania lub odejmowania", magnitude]], <>{answer}</>, "Przecinek nie zmienia reguły: te same znaki dodajemy, a różne odejmujemy."));

const multiplyIntegerTasks: WorkTask[] = [["−3 · 4", "−", "12", "−12"], ["−5 · (−6)", "+", "30", "30"], ["7 · (−8)", "−", "56", "−56"], ["9 · 3", "+", "27", "27"], ["−11 · 2", "−", "22", "−22"], ["−4 · (−12)", "+", "48", "48"], ["15 · (−3)", "−", "45", "−45"], ["−7 · (−7)", "+", "49", "49"]].map(([expression, sign, magnitude, answer], index) => work(`mul-int-${index}`, "Najpierw wybierz znak, potem pomnóż wartości bezwzględne.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["magnitude", "Iloczyn wartości bezwzględnych", magnitude]], <>{answer}</>, "Takie same znaki dają plus, a różne znaki dają minus."));
const divideIntegerTasks: WorkTask[] = [["−24 : 6", "−", "4", "−4"], ["−42 : (−7)", "+", "6", "6"], ["56 : (−8)", "−", "7", "−7"], ["81 : 9", "+", "9", "9"], ["−72 : 12", "−", "6", "−6"], ["−64 : (−8)", "+", "8", "8"], ["45 : (−5)", "−", "9", "−9"], ["−100 : (−20)", "+", "5", "5"]].map(([expression, sign, magnitude, answer], index) => work(`div-int-${index}`, "Najpierw wybierz znak, potem podziel wartości bezwzględne.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["magnitude", "Iloraz wartości bezwzględnych", magnitude]], <>{answer}</>, "Reguła znaków przy dzieleniu jest taka sama jak przy mnożeniu."));

const fractionMultiplyTasks: WorkTask[] = [
  ["mul-f-1", <span key="1"><SignedFraction sign="−" numerator="2" denominator="3" /> · <Fraction numerator="9" denominator="4" /></span>, "−", "3", "2"],
  ["mul-f-2", <span key="2"><SignedFraction sign="−" numerator="5" denominator="8" /> · <SignedFraction sign="−" numerator="4" denominator="15" /></span>, "+", "1", "6"],
  ["mul-f-3", <span key="3"><Fraction numerator="7" denominator="10" /> · <SignedFraction sign="−" numerator="5" denominator="14" /></span>, "−", "1", "4"],
  ["mul-f-4", <span key="4"><SignedFraction sign="−" numerator="3" denominator="5" /> · <SignedFraction sign="−" numerator="25" denominator="18" /></span>, "+", "5", "6"],
  ["mul-f-5", <span key="5"><Fraction numerator="4" denominator="9" /> · <SignedFraction sign="−" numerator="3" denominator="8" /></span>, "−", "1", "6"],
  ["mul-f-6", <span key="6"><SignedFraction sign="−" numerator="11" denominator="12" /> · <Fraction numerator="6" denominator="11" /></span>, "−", "1", "2"],
].map(([id, expression, sign, numerator, denominator]) => work(id as string, "Skróć przed mnożeniem i wpisz wynik w najprostszej postaci.", <span className="text-4xl font-black">{expression}</span>, sign as Sign, [["num", "Licznik po pomnożeniu i skróceniu", numerator as string], ["den", "Mianownik po pomnożeniu i skróceniu", denominator as string]], <SignedFraction sign={sign as Sign} numerator={numerator as string} denominator={denominator as string} />, "Znak ustalamy osobno, a dodatnie wartości ułamków mnożymy i skracamy."));
const fractionDivideTasks: WorkTask[] = [
  ["div-f-1", <span key="1"><SignedFraction sign="−" numerator="3" denominator="4" /> : <Fraction numerator="1" denominator="2" /></span>, "−", "2", "1", "3", "2"],
  ["div-f-2", <span key="2"><SignedFraction sign="−" numerator="7" denominator="10" /> : <SignedFraction sign="−" numerator="14" denominator="15" /></span>, "+", "15", "14", "3", "4"],
  ["div-f-3", <span key="3"><Fraction numerator="5" denominator="6" /> : <SignedFraction sign="−" numerator="10" denominator="9" /></span>, "−", "9", "10", "3", "4"],
  ["div-f-4", <span key="4"><SignedFraction sign="−" numerator="4" denominator="5" /> : <Fraction numerator="8" denominator="15" /></span>, "−", "15", "8", "3", "2"],
  ["div-f-5", <span key="5"><SignedFraction sign="−" numerator="9" denominator="14" /> : <SignedFraction sign="−" numerator="3" denominator="7" /></span>, "+", "7", "3", "3", "2"],
  ["div-f-6", <span key="6"><Fraction numerator="2" denominator="3" /> : <SignedFraction sign="−" numerator="4" denominator="9" /></span>, "−", "9", "4", "3", "2"],
].map(([id, expression, sign, reciprocalNum, reciprocalDen, numerator, denominator]) => work(id as string, "Zapisz odwrotność dzielnika, zamień dzielenie na mnożenie i oblicz.", <span className="text-4xl font-black">{expression}</span>, sign as Sign, [["rec-num", "Licznik odwrotności dzielnika", reciprocalNum as string], ["rec-den", "Mianownik odwrotności dzielnika", reciprocalDen as string], ["num", "Licznik wyniku", numerator as string], ["den", "Mianownik wyniku", denominator as string]], <SignedFraction sign={sign as Sign} numerator={numerator as string} denominator={denominator as string} />, "Przy dzieleniu mnożymy przez odwrotność dzielnika; znak ustalamy według reguły znaków."));

function simpleWorkRows(prefix: string, rows: Array<[string, Sign, string, string]>, explanation: string): WorkTask[] {
  return rows.map(([expression, sign, firstStep, answer], index) => work(`${prefix}-${index}`, "Wykonaj najpierw wskazane działanie, a potem całe wyrażenie.", <span className="text-4xl font-black">{expression}</span>, sign, [["first", "Wynik działania wykonywanego jako pierwsze", firstStep], ["result", "Wartość wyniku bez końcowego znaku", answer.replace("−", "")]], <>{answer}</>, explanation, ["1. Nawiasy", "2. Mnożenie lub dzielenie", "3. Dodawanie lub odejmowanie"]));
}
const orderNaturalTasks = simpleWorkRows("order-natural", [["6 + 3 · 4", "+", "12", "18"], ["24 : 6 + 7", "+", "4", "11"], ["5 · (8 − 3)", "+", "5", "25"], ["30 − 4 · 6", "+", "24", "6"], ["(12 + 8) : 4", "+", "20", "5"], ["7 + 18 : 3", "+", "6", "13"]], "Najpierw wykonujemy nawiasy, potem mnożenie i dzielenie, a na końcu dodawanie i odejmowanie.");
const orderIntegerTasks = simpleWorkRows("order-integer", [["−3 + 2 · (−4)", "−", "8", "11"], ["6 − (−2) · 5", "+", "10", "16"], ["−18 : 3 + 4", "−", "6", "2"], ["5 · (−3) − (−7)", "−", "15", "8"], ["−4 + 24 : (−6)", "−", "4", "8"], ["(−8 + 3) · 2", "−", "5", "10"], ["12 − 3 · (−2)", "+", "6", "18"], ["−30 : (−5) − 9", "−", "6", "3"]], "Znak działania wykonywanego jako pierwsze wpływa na dalszą część wyrażenia.");
const orderFractionTasks: WorkTask[] = [
  work("order-f-1", "Najpierw wykonaj mnożenie.", <span className="text-4xl font-black"><SignedFraction sign="−" numerator="1" denominator="2" /> + <Fraction numerator="3" denominator="4" /> · 2</span>, "+", [["first-num", "Licznik pierwszego wyniku", "3"], ["first-den", "Mianownik pierwszego wyniku", "2"], ["num", "Licznik wyniku końcowego", "1"], ["den", "Mianownik wyniku końcowego", "1"]], <>1</>, "Trzy czwarte razy dwa to trzy drugie; potem dodajemy minus jedną drugą."),
  work("order-f-2", "Najpierw wykonaj dzielenie.", <span className="text-4xl font-black"><Fraction numerator="5" denominator="6" /> − <SignedFraction sign="−" numerator="1" denominator="3" /> : 2</span>, "+", [["first-num", "Licznik pierwszego wyniku", "1"], ["first-den", "Mianownik pierwszego wyniku", "6"], ["num", "Licznik wyniku końcowego", "1"], ["den", "Mianownik wyniku końcowego", "1"]], <>1</>, "Minus jedna trzecia podzielone przez dwa to minus jedna szósta; odejmowanie liczby ujemnej daje dodawanie."),
  work("order-f-3", "Najpierw oblicz nawias.", <span className="text-4xl font-black">(<SignedFraction sign="−" numerator="3" denominator="4" /> + <Fraction numerator="1" denominator="4" />) · 2</span>, "−", [["first-num", "Licznik wyniku w nawiasie", "1"], ["first-den", "Mianownik wyniku w nawiasie", "2"], ["num", "Licznik wyniku końcowego", "1"], ["den", "Mianownik wyniku końcowego", "1"]], <>−1</>, "W nawiasie otrzymujemy minus jedną drugą, a po pomnożeniu przez dwa minus jeden."),
  work("order-f-4", "Najpierw wykonaj mnożenie.", <span className="text-4xl font-black"><SignedFraction sign="−" numerator="2" denominator="3" /> · <SignedFraction sign="−" numerator="3" denominator="4" /> − <Fraction numerator="1" denominator="2" /></span>, "0", [["first-num", "Licznik pierwszego wyniku", "1"], ["first-den", "Mianownik pierwszego wyniku", "2"], ["num", "Licznik wyniku końcowego", "0"], ["den", "Mianownik wyniku końcowego", "1"]], <>0</>, "Iloczyn dwóch liczb ujemnych wynosi jedną drugą; po odjęciu jednej drugiej zostaje zero."),
  work("order-f-5", "Najpierw wykonaj dzielenie.", <span className="text-4xl font-black"><SignedFraction sign="−" numerator="3" denominator="5" /> : <Fraction numerator="6" denominator="5" /> + <Fraction numerator="1" denominator="4" /></span>, "−", [["first-num", "Licznik pierwszego wyniku", "1"], ["first-den", "Mianownik pierwszego wyniku", "2"], ["num", "Licznik wyniku końcowego", "1"], ["den", "Mianownik wyniku końcowego", "4"]], <SignedFraction sign="−" numerator="1" denominator="4" />, "Dzielenie daje minus jedną drugą, a po dodaniu jednej czwartej zostaje minus jedna czwarta."),
  work("order-f-6", "Najpierw oblicz nawias.", <span className="text-4xl font-black">1 − (<Fraction numerator="1" denominator="2" /> + <Fraction numerator="1" denominator="4" />)</span>, "+", [["first-num", "Licznik wyniku w nawiasie", "3"], ["first-den", "Mianownik wyniku w nawiasie", "4"], ["num", "Licznik wyniku końcowego", "1"], ["den", "Mianownik wyniku końcowego", "4"]], <Fraction numerator="1" denominator="4" />, "W nawiasie otrzymujemy trzy czwarte; jedna całość minus trzy czwarte to jedna czwarta."),
];

const storyTasks: StoryTask[] = [
  { id: "story-temperature", title: "Temperatura wieczorem", prompt: "Rano było −4°C. Temperatura wzrosła o 9°C, a wieczorem spadła o 3°C. Jaka była temperatura wieczorem?", imageSrc: "/lessons/illustrations/integers/stories/temperature.png", imageAlt: "Termometr przy szkolnej stacji pogodowej", data: [{ id: "start", label: "Temperatura rano", expected: "-4", unit: "°C" }, { id: "up", label: "Wzrost temperatury", expected: "9", unit: "°C" }, { id: "down", label: "Spadek temperatury", expected: "3", unit: "°C" }], operands: ["-4", "9", "3"], operators: ["+", "−"], result: "2", answerLead: "Wieczorem temperatura wynosiła", answerUnit: "°C.", answerNode: <>2°C</> },
  { id: "story-elevator", title: "Podróż windą", prompt: "Winda była na poziomie −3, wjechała 8 pięter, a potem zjechała 2 piętra. Na którym poziomie się zatrzymała?", imageSrc: "/lessons/illustrations/integers/stories/elevator.png", imageAlt: "Winda poruszająca się między piętrami budynku", data: [{ id: "start", label: "Poziom początkowy", expected: "-3", unit: "" }, { id: "up", label: "Wjazd w górę", expected: "8", unit: "pięter" }, { id: "down", label: "Zjazd w dół", expected: "2", unit: "piętra" }], operands: ["-3", "8", "2"], operators: ["+", "−"], result: "3", answerLead: "Winda zatrzymała się na poziomie", answerUnit: ".", answerNode: <>poziom 3</> },
  { id: "story-diver", title: "Głębokość nurka", prompt: "Nurek był 6 m pod powierzchnią. Wypłynął o 4 m, a potem ponownie zanurzył się o 3 m. Na jakiej wysokości względem powierzchni jest teraz?", imageSrc: "/lessons/illustrations/integers/stories/diver.png", imageAlt: "Nurek pod powierzchnią wody", data: [{ id: "start", label: "Położenie początkowe", expected: "-6", unit: "m" }, { id: "up", label: "Ruch w górę", expected: "4", unit: "m" }, { id: "down", label: "Ruch w dół", expected: "3", unit: "m" }], operands: ["-6", "4", "3"], operators: ["+", "−"], result: "-5", answerLead: "Nurek znajduje się na wysokości", answerUnit: "m względem powierzchni.", answerNode: <>−5 m</> },
  { id: "story-game", title: "Punkty w grze", prompt: "Gracz zaczynał z wynikiem −7 punktów. Zdobył 12 punktów, a potem stracił 4 punkty. Jaki ma teraz wynik?", imageSrc: "/lessons/illustrations/integers/stories/board-game.png", imageAlt: "Kolorowe pionki i żetony gry planszowej", data: [{ id: "start", label: "Wynik początkowy", expected: "-7", unit: "pkt" }, { id: "gain", label: "Zdobyte punkty", expected: "12", unit: "pkt" }, { id: "loss", label: "Stracone punkty", expected: "4", unit: "pkt" }], operands: ["-7", "12", "4"], operators: ["+", "−"], result: "1", answerLead: "Gracz ma teraz", answerUnit: "punkt.", answerNode: <>1 punkt</> },
  { id: "story-balance", title: "Saldo konta", prompt: "Saldo wynosiło −18 zł. Wpłacono 25 zł, a potem zapłacono 9 zł. Jakie jest saldo po tych zmianach?", imageSrc: "/lessons/illustrations/integers/stories/balance.png", imageAlt: "Portfel, monety i karta płatnicza", data: [{ id: "start", label: "Saldo początkowe", expected: "-18", unit: "zł" }, { id: "deposit", label: "Wpłata", expected: "25", unit: "zł" }, { id: "payment", label: "Zapłata", expected: "9", unit: "zł" }], operands: ["-18", "25", "9"], operators: ["+", "−"], result: "-2", answerLead: "Saldo po zmianach wynosi", answerUnit: "zł.", answerNode: <>−2 zł</> },
  { id: "story-cable", title: "Kolejka przy bazie", prompt: "Wagonik był 12 m nad poziomem bazy. Zjechał o 17 m, a następnie wjechał o 4 m. Gdzie znalazł się względem poziomu bazy?", imageSrc: "/lessons/illustrations/integers/stories/cable-car.png", imageAlt: "Górska kolejka linowa przy stacji bazowej", data: [{ id: "start", label: "Położenie początkowe", expected: "12", unit: "m" }, { id: "down", label: "Zjazd", expected: "17", unit: "m" }, { id: "up", label: "Wjazd", expected: "4", unit: "m" }], operands: ["12", "17", "4"], operators: ["−", "+"], result: "-1", answerLead: "Wagonik znalazł się", answerUnit: "m względem poziomu bazy.", answerNode: <>−1 m</> },
];

const multiplicationStoryTasks: WorkTask[] = [
  ["🌡️", "Temperatura spadała przez 4 godziny o 2°C na godzinę. Jaka była łączna zmiana?", "−", "4", "2", "8", "−8°C"],
  ["🤿", "Nurek wykonał 5 zejść po 3 m. Jaka była łączna zmiana wysokości?", "−", "5", "3", "15", "−15 m"],
  ["🎮", "W każdej z 6 rund gracz tracił 4 punkty. Jaka była łączna zmiana wyniku?", "−", "6", "4", "24", "−24 punkty"],
  ["💳", "Dług 21 zł podzielono na 7 jednakowych części. Jaką zmianę salda oznacza jedna część?", "−", "21", "7", "3", "−3 zł"],
  ["🛗", "Winda wykonała 4 jednakowe zjazdy, łącznie o 20 pięter. Ile pięter obejmował jeden zjazd?", "−", "20", "4", "5", "−5 pięter"],
  ["🛰️", "Robot co minutę obniżał wysokość o 2,5 m. Robił to przez 4 minuty. Jaka była łączna zmiana?", "−", "4", "2,5", "10", "−10 m"],
].map(([icon, prompt, sign, first, second, result, answer], index) => work(`mul-story-${index}`, prompt as string, <span className="text-7xl">{icon}</span>, sign as Sign, [["first", "Liczba powtórzeń lub wartość całkowita", first as string], ["second", "Jedna zmiana lub liczba części", second as string], ["result", "Wartość wyniku bez znaku", result as string]], <>{answer}</>, "Oddziel znak zmiany od mnożenia albo dzielenia dodatnich wartości.", ["1. Rozpoznaj mnożenie lub dzielenie", "2. Ustal znak", "3. Oblicz wartość"], icon as string));

const signDiscoveryTasks: ChoiceTask[] = [["3 razy spadek o 2", "−", "Trzy ujemne zmiany dają wynik ujemny."], ["Odwrócenie trzech spadków o 2", "+", "Odwrócenie ujemnej zmiany zmienia znak wyniku."], ["(−4) · 5", "−", "Różne znaki dają wynik ujemny."], ["(−4) · (−5)", "+", "Dwa odwrócenia kierunku dają wynik dodatni."], ["18 : (−3)", "−", "Iloraz liczb o różnych znakach jest ujemny."], ["(−18) : (−3)", "+", "Iloraz liczb o takich samych znakach jest dodatni."]].map(([expression, answer, explanation], index) => ({ id: `sign-discovery-${index}`, prompt: "Ustal znak wyniku, zanim wykonasz rachunek.", model: <span className="text-4xl font-black">{expression}</span>, options: options([["+", "dodatni"], ["−", "ujemny"]]), answer, answerNode: <>{answer === "+" ? "dodatni" : "ujemny"}</>, explanation }));

const choiceByActivity: Partial<Record<Grade6SignedNumbersActivity, ChoiceTask[]>> = {
  "g6-number-sets": numberSetTasks,
  "g6-absolute-value": oppositeTasks,
  "g6-number-line": rationalLineTasks,
  "g6-select": rationalCompareTasks,
  "g6-compare": rationalCompareTasks,
  "g6-opposites": oppositeTasks,
  "g6-sign-table": signDiscoveryTasks,
  "g6-cipher": signDiscoveryTasks,
  "g6-review-sets": [...integerCompareTasks.slice(0, 3), ...oppositeTasks.slice(0, 3)],
  "g6-review-absolute": oppositeTasks,
  "g6-review-challenge": signDiscoveryTasks,
  "g6-context-integers": contextTasks,
  "g6-integer-compare": integerCompareTasks,
  "g6-rational-line": rationalLineTasks,
  "g6-rational-compare": rationalCompareTasks,
  "g6-absolute-opposites": oppositeTasks,
  "g6-sign-rules": signRulesTasks,
  "g6-sign-discovery": signDiscoveryTasks,
  "g6-review-map": [...integerCompareTasks.slice(0, 3), ...oppositeTasks.slice(0, 3)],
  "g6-review-escape": [...signDiscoveryTasks.slice(0, 2), ...rationalCompareTasks.slice(0, 3), ...oppositeTasks.slice(0, 3)],
};
const workByActivity: Partial<Record<Grade6SignedNumbersActivity, WorkTask[]>> = {
  "g6-add-model": mixedIntegerTasks,
  "g6-add-different": addDifferentTasks,
  "g6-add-same": addSameTasks,
  "g6-subtract": subtractIntegerTasks,
  "g6-axis": addDifferentTasks,
  "g6-multiply": fractionMultiplyTasks,
  "g6-divide": fractionDivideTasks,
  "g6-review-operations": orderIntegerTasks,
  "g6-add-integers-same": addSameTasks,
  "g6-add-integers-different": addDifferentTasks,
  "g6-subtract-integers": subtractIntegerTasks,
  "g6-add-decimals": decimalTasks,
  "g6-multiply-integers": multiplyIntegerTasks,
  "g6-divide-integers": divideIntegerTasks,
  "g6-multiply-fractions": fractionMultiplyTasks,
  "g6-divide-fractions": fractionDivideTasks,
  "g6-mul-stories": multiplicationStoryTasks,
  "g6-review-order-natural": orderNaturalTasks,
  "g6-review-order-integers": orderIntegerTasks,
  "g6-review-order-fractions": orderFractionTasks,
  "g6-review-stories": orderIntegerTasks.slice(0, 6),
};

Object.entries(choiceByActivity).forEach(([activity, tasks]) => { GRADE6_SIGNED_NUMBERS_TASK_COUNTS[activity as Grade6SignedNumbersActivity] = tasks?.length ?? 0; });
Object.entries(workByActivity).forEach(([activity, tasks]) => { GRADE6_SIGNED_NUMBERS_TASK_COUNTS[activity as Grade6SignedNumbersActivity] = tasks?.length ?? 0; });
GRADE6_SIGNED_NUMBERS_TASK_COUNTS["g6-add-fractions"] = signedFractionTasks.length;
GRADE6_SIGNED_NUMBERS_TASK_COUNTS["g6-add-stories"] = storyTasks.length;
GRADE6_SIGNED_NUMBERS_TASK_COUNTS["g6-integer-line"] = 4;

const headings: Partial<Record<Grade6SignedNumbersActivity, [string, string]>> = {
  "g6-context-integers": ["Punktem odniesienia jest zero", "Znak liczby mówi, po której stronie zera znajduje się położenie albo w jakim kierunku zaszła zmiana."],
  "g6-number-sets": ["Liczby naturalne, całkowite i wymierne", "Poznaj rodziny liczb, a następnie określaj, czy liczba jest dodatnia, ujemna, nieujemna albo niedodatnia."],
  "g6-integer-line": ["Liczby całkowite na osi", "Na osi liczby rosną w prawo. Najpierw ćwiczymy wyłącznie na liczbach całkowitych."],
  "g6-integer-compare": ["Porównywanie liczb całkowitych", "Liczba leżąca bardziej na prawo jest większa. Dla liczb ujemnych bliżej zera oznacza większą liczbę."],
  "g6-rational-line": ["Odległość od zera i liczby przeciwne", "Odczytaj punkty A–D. W zależności od polecenia podaj odległość od zera albo liczbę przeciwną."],
  "g6-rational-compare": ["Porównywanie ułamków ze znakiem", "Najpierw porównaj dodatnie wartości, a potem uwzględnij położenie po ujemnej stronie osi."],
  "g6-absolute-opposites": ["Liczby przeciwne i odległość od zera", "Liczby przeciwne leżą po dwóch stronach zera w tej samej odległości. Wartość bezwzględna jest odległością."],
  "g6-sign-rules": ["Znaki stojące obok siebie", "Plus obok minusa zmieniamy na minus, a dwa minusy obok siebie zmieniamy na plus."],
  "g6-add-model": ["Dodaj czy odejmij?", "Najpierw uprość znaki. Te same znaki — dodaj; różne znaki — odejmij i wstaw znak większej liczby. Wynik możesz sprawdzić na żetonach."],
  "g6-add-integers-same": ["Dodawanie całkowitych — te same znaki", "Najpierw oblicz na znanych liczbach naturalnych, potem dołącz wspólny znak."],
  "g6-add-integers-different": ["Dodawanie całkowitych — różne znaki", "Odejmij mniejszą liczbę bez znaku od większej i wstaw znak większej liczby bez znaku."],
  "g6-subtract-integers": ["Odejmowanie liczb całkowitych", "Odejmowanie zamień na dodawanie liczby przeciwnej. Dopiero potem zastosuj regułę dodawania."],
  "g6-add-fractions": ["Ułamki zwykłe — pełny zapis", "Uprość znaki, a po każdym znaku równości pokaż kolejny etap obliczenia."],
  "g6-add-decimals": ["Liczby dziesiętne ze znakiem", "Te same znaki — dodaj. Różne znaki — odejmij i wstaw znak większej liczby."],
  "g6-add-stories": ["Zadania tekstowe — zapisz całe rozwiązanie", "Uzupełnij dane, samodzielnie zapisz całe działanie z wynikiem i sformułuj odpowiedź."],
  "g6-sign-discovery": ["Reguły znaków w mnożeniu i dzieleniu", "Te same znaki dają wynik dodatni, a różne znaki dają wynik ujemny."],
  "g6-multiply-integers": ["Mnożenie liczb całkowitych", "Najpierw ustal znak wyniku. Potem pomnóż liczby bez znaków."],
  "g6-divide-integers": ["Dzielenie liczb całkowitych", "Najpierw ustal znak wyniku. Potem podziel liczby bez znaków."],
  "g6-multiply-fractions": ["Mnożenie ułamków ze znakiem", "Ustal znak, skróć ułamki i wpisz wynik pionowo w najprostszej postaci."],
  "g6-divide-fractions": ["Dzielenie ułamków ze znakiem", "Najpierw zapisz odwrotność dzielnika, potem pomnóż i skróć."],
  "g6-mul-stories": ["Powtarzane zmiany", "Mnożenie opisuje wielokrotne wykonanie tej samej zmiany, a dzielenie szuka jednej części."],
  "g6-review-map": ["Mapa liczb", "Rozpoznaj położenie, porządek, liczbę przeciwną i odległość od zera."],
  "g6-review-order-natural": ["Kolejność działań — rozgrzewka", "Najpierw przypominamy kolejność na liczbach naturalnych, bez dodatkowej trudności znaków."],
  "g6-review-order-integers": ["Kolejność działań z liczbami ujemnymi", "Wykonuj działania etapami i nie gub znaku wyniku pośredniego."],
  "g6-review-order-fractions": ["Kolejność działań z ułamkami", "Każdy wynik pośredni zapisuj jako zwykły ułamek pionowy."],
  "g6-review-stories": ["Misje wieloetapowe", "Ułóż plan obliczeń, zapisz wynik pośredni i zinterpretuj znak odpowiedzi."],
  "g6-review-escape": ["Kod stacji badawczej", "Finał łączy znaczenie liczb, porównywanie, znaki działań i liczby przeciwne."],
};

function pickTask<T extends { id: string }>(tasks: T[], seed = 0) {
  return tasks[Math.abs(seed) % tasks.length]!;
}

type IntegerLineRound = {
  id: string;
  mode: "read" | "mark";
  min: number;
  max: number;
  step: number;
  points: Array<{ id: "A" | "B" | "C" | "D"; value: number; color: string }>;
};

const integerLineRounds: IntegerLineRound[] = [
  { id: "read-tens", mode: "read", min: -60, max: 60, step: 10, points: [{ id: "A", value: -50, color: "#7c3aed" }, { id: "B", value: -20, color: "#0891b2" }, { id: "C", value: 10, color: "#db2777" }, { id: "D", value: 50, color: "#ea580c" }] },
  { id: "read-twenties", mode: "read", min: -140, max: 100, step: 20, points: [{ id: "A", value: -120, color: "#7c3aed" }, { id: "B", value: -60, color: "#0891b2" }, { id: "C", value: 20, color: "#db2777" }, { id: "D", value: 80, color: "#ea580c" }] },
  { id: "mark-tens", mode: "mark", min: -80, max: 80, step: 10, points: [{ id: "A", value: -60, color: "#7c3aed" }, { id: "B", value: -10, color: "#0891b2" }, { id: "C", value: 30, color: "#db2777" }, { id: "D", value: 70, color: "#ea580c" }] },
  { id: "mark-twenty-five", mode: "mark", min: -150, max: 150, step: 25, points: [{ id: "A", value: -125, color: "#7c3aed" }, { id: "B", value: -50, color: "#0891b2" }, { id: "C", value: 25, color: "#db2777" }, { id: "D", value: 125, color: "#ea580c" }] },
];

function displayInteger(value: number | string) {
  return `${value}`.replace("-", "−");
}

function LongIntegerLine({ round, placements, selectedPoint, readOnly, onPlace }: {
  round: IntegerLineRound;
  placements: Partial<Record<"A" | "B" | "C" | "D", number>>;
  selectedPoint: "A" | "B" | "C" | "D";
  readOnly: boolean;
  onPlace: (value: number) => void;
}) {
  const ticks = Array.from({ length: Math.round((round.max - round.min) / round.step) + 1 }, (_, index) => round.min + index * round.step);
  const x = (value: number) => 70 + ((value - round.min) / (round.max - round.min)) * 760;
  const shownPoints = round.mode === "read"
    ? round.points.map((point) => ({ ...point, value: point.value }))
    : round.points.filter((point) => placements[point.id] !== undefined).map((point) => ({ ...point, value: placements[point.id]! }));
  const anchorValues = [round.min, 0, round.max].filter((value, index, rows) => value >= round.min && value <= round.max && rows.indexOf(value) === index);

  return <div className="overflow-hidden rounded-3xl border-2 border-cyan-200 bg-gradient-to-b from-sky-50 to-white p-2 shadow-inner">
    <svg viewBox="0 0 900 250" className="block h-auto w-full" role="img" aria-label={`Oś liczbowa od ${displayInteger(round.min)} do ${displayInteger(round.max)}`}>
      <defs>
        <filter id={`shadow-${round.id}`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="4" floodOpacity="0.22" /></filter>
      </defs>
      <line x1="54" y1="132" x2="832" y2="132" stroke="#312e81" strokeWidth="10" strokeLinecap="round" data-number-axis-line />
      <path d="M860 132 L828 111 L828 153 Z" fill="#312e81" data-number-axis-arrow />
      {ticks.map((value) => <g key={value} onClick={() => !readOnly && round.mode === "mark" && onPlace(value)} className={round.mode === "mark" && !readOnly ? "cursor-pointer" : undefined}>
        <rect x={x(value) - 18} y="102" width="36" height="70" fill="transparent" />
        <line x1={x(value)} y1={value === 0 ? 103 : 111} x2={x(value)} y2={value === 0 ? 161 : 153} stroke={value === 0 ? "#111827" : "#475569"} strokeWidth={value === 0 ? 7 : 4} strokeLinecap="round" />
      </g>)}
      {anchorValues.map((value) => <text key={value} x={x(value)} y="194" textAnchor="middle" fontSize="25" fontWeight="900" fill="#172554">{displayInteger(value)}</text>)}
      {shownPoints.map((point) => <g key={point.id} transform={`translate(${x(point.value)} 0)`} filter={`url(#shadow-${round.id})`}>
        <line y1="82" y2="108" stroke={point.color} strokeWidth="5" />
        <circle cy="66" r="25" fill={point.color} stroke="white" strokeWidth="5" />
        <text y="75" textAnchor="middle" fontSize="25" fontWeight="900" fill="white">{point.id}</text>
      </g>)}
      {round.mode === "mark" ? <text x="450" y="230" textAnchor="middle" fontSize="19" fontWeight="800" fill="#475569">Wybierz literę, a następnie dotknij właściwej kreski.</text> : null}
    </svg>
    {round.mode === "mark" ? <p className="pb-2 text-center text-sm font-black text-indigo-900">Teraz ustawiasz punkt {selectedPoint}.</p> : null}
  </div>;
}

function IntegerLineRoundCard({ round, readOnly = false, questionNumber, questionCount, onResultChange }: Props & { round: IntegerLineRound }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState<"A" | "B" | "C" | "D">("A");
  const [placements, setPlacements] = useState<Partial<Record<"A" | "B" | "C" | "D", number>>>({});
  const [result, setResult] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const edit = (key: string) => {
    if (readOnly || result !== null || round.mode !== "read") return;
    setValues((current) => ({ ...current, [active]: key === "backspace" ? (current[active] ?? "").slice(0, -1) : `${current[active] ?? ""}${key}`.slice(0, 4) }));
    setMessage(""); onResultChange?.(null);
  };
  const toggleSign = () => {
    if (readOnly || result !== null) return;
    setValues((current) => ({ ...current, [active]: (current[active] ?? "").startsWith("-") ? (current[active] ?? "").slice(1) : `-${current[active] ?? ""}` }));
    setMessage(""); onResultChange?.(null);
  };
  const place = (value: number) => {
    if (readOnly || result !== null) return;
    const updatedPlacements = { ...placements, [active]: value };
    setPlacements(updatedPlacements);
    const ids = round.points.map((point) => point.id);
    const currentIndex = ids.indexOf(active);
    const next = ids.slice(currentIndex + 1).find((id) => updatedPlacements[id] === undefined)
      ?? ids.find((id) => updatedPlacements[id] === undefined);
    if (next) setActive(next);
    setMessage(""); onResultChange?.(null);
  };
  const answerText = round.points.map((point) => `${point.id} = ${displayInteger(point.value)}`).join(", ");
  const check = () => {
    const complete = round.mode === "read" ? round.points.every((point) => (values[point.id] ?? "").trim()) : round.points.every((point) => placements[point.id] !== undefined);
    if (!complete) { setResult(null); setMessage(round.mode === "read" ? "Uzupełnij liczby przy wszystkich czterech literach." : "Zaznacz na osi wszystkie cztery punkty."); onResultChange?.(null); return; }
    const correct = round.points.every((point) => round.mode === "read" ? Number(values[point.id]) === point.value : placements[point.id] === point.value);
    setResult(correct);
    setMessage(correct ? "Brawo! Wszystkie punkty zostały odczytane poprawnie." : `Spróbuj innym razem. Poprawne położenia to: ${answerText}. Dziś bez punktu.`);
    onResultChange?.(correct, round.mode === "read" ? JSON.stringify(values) : JSON.stringify(placements));
  };

  return <LessonTaskFrame eyebrow="Dział 7 · Liczby dodatnie i ujemne" heading={round.mode === "read" ? "Odczytaj kilka liczb z osi" : "Zaznacz liczby na osi"} description={round.mode === "read" ? "Skala osi jest stała. Odczytaj położenie punktów A, B, C i D." : "Wybierz literę, a potem zaznacz odpowiadającą jej liczbę na długiej osi."} questionNumber={questionNumber} questionCount={questionCount} data-signed-numbers-v2>
    <div className="space-y-5">
      {round.mode === "mark" ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{round.points.map((point) => <LessonTaskChoice key={point.id} selected={active === point.id} disabled={readOnly || result !== null} onClick={() => setActive(point.id)} className="min-h-14"><span className="font-black" style={{ color: point.color }}>{point.id}</span>&nbsp;=&nbsp;{displayInteger(point.value)}</LessonTaskChoice>)}</div> : null}
      <LongIntegerLine round={round} placements={placements} selectedPoint={active} readOnly={readOnly || result !== null} onPlace={place} />
      {round.mode === "read" ? <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Odczytane liczby">{round.points.map((point) => <label key={point.id} className={`rounded-2xl border-2 bg-white p-3 text-center ${active === point.id ? "border-cyan-500 ring-4 ring-cyan-100" : "border-slate-200"}`}><span className="mb-2 block text-lg font-black" style={{ color: point.color }}>{point.id} =</span><input inputMode="none" readOnly aria-label={`Liczba w punkcie ${point.id}`} value={values[point.id] ?? ""} onClick={() => setActive(point.id)} onFocus={() => setActive(point.id)} className="h-14 w-full rounded-xl border-2 border-slate-200 bg-white text-center text-2xl font-black outline-none" /></label>)}</section> : null}
      {!readOnly && result === null && round.mode === "read" ? <><button type="button" onClick={toggleSign} className="min-h-12 w-full rounded-2xl border-2 border-indigo-300 bg-indigo-50 font-black text-indigo-950">Zmień znak wpisywanej liczby: + / −</button><LessonNumericKeypad onKey={edit} onConfirm={check} label="Klawiatura do odczytywania osi" helperText="Wybierz pole A, B, C lub D, wpisz liczbę i zatwierdź wszystkie odpowiedzi na końcu." /></> : null}
      {!readOnly && result === null && round.mode === "mark" ? <button type="button" onClick={check} className="min-h-14 w-full rounded-2xl bg-indigo-700 px-5 text-lg font-black text-white">Zatwierdź położenie punktów</button> : null}
      {message ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${result === true ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{message}</p> : null}
    </div>
  </LessonTaskFrame>;
}

function IntegerLineWorkshop(props: Props) {
  const roundIndex = Math.max(0, Math.min(integerLineRounds.length - 1, (props.questionNumber ?? 1) - 1));
  const round = integerLineRounds[roundIndex]!;
  return <IntegerLineRoundCard key={round.id} {...props} round={round} questionCount={integerLineRounds.length} />;
}

function Guide({ activity, readOnly, task }: { activity: Grade6SignedNumbersActivity; readOnly: boolean; task?: { tokens?: TokenModelSpec; axis?: NumberLineSpec } }) {
  if (activity === "g6-context-integers") return <ContextCompass />;
  if (activity === "g6-number-sets") return <NumberSetsGuide />;
  if (activity === "g6-sign-rules") return <SignRulesGuide />;
  if (activity === "g6-add-model") return <div className="space-y-4"><AdditionRulesGuide />{task?.tokens ? <ZeroPairLab key={task.tokens.expression} readOnly={readOnly} spec={task.tokens} /> : null}</div>;
  if (task?.axis) return <NumberLine {...task.axis} />;
  if (["g6-integer-line", "g6-integer-compare", "g6-rational-line", "g6-rational-compare", "g6-absolute-opposites", "g6-review-map"].includes(activity)) return <NumberLine values={[-4, 0, 4]} />;
  if (activity.includes("fraction")) return <div className="grid gap-3 rounded-3xl bg-cyan-50 p-4 text-center font-bold text-cyan-950 sm:grid-cols-3"><span>1. Uprość sąsiadujące znaki</span><span>2. Dodaj albo odejmij</span><span>3. Skróć wynik</span></div>;
  if (activity.includes("order")) return <div className="grid gap-2 rounded-3xl bg-violet-50 p-4 text-center font-black text-violet-950 sm:grid-cols-3"><span>① Nawiasy</span><span>② Mnożenie i dzielenie</span><span>③ Dodawanie i odejmowanie</span></div>;
  if (activity.includes("multiply") || activity.includes("divide") || activity === "g6-sign-discovery") return <div className="grid grid-cols-2 gap-2 rounded-3xl bg-indigo-50 p-4 text-center font-black"><span className="rounded-xl bg-emerald-100 p-3">te same znaki → +</span><span className="rounded-xl bg-rose-100 p-3">różne znaki → −</span></div>;
  return null;
}

function ChoiceCard({ activity, task, readOnly = false, questionNumber, questionCount, onResultChange }: Props & { task: ChoiceTask }) {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const ordered = useMemo(() => [...task.options].sort((a, b) => `${task.id}-${a.value}`.localeCompare(`${task.id}-${b.value}`)), [task]);
  const check = () => {
    if (!selected) { setMessage("Wybierz odpowiedź, zanim ją sprawdzisz."); onResultChange?.(null); return; }
    const correct = selected === task.answer;
    setResult(correct);
    setMessage(correct ? `Brawo! ${task.explanation}` : `Spróbuj innym razem. Poprawny wynik to ${typeof task.answerNode === "string" ? task.answerNode : task.answer}. Dziś bez punktu. ${task.explanation}`);
    onResultChange?.(correct, selected);
  };
  const [heading, description] = headings[activity] ?? ["Liczby dodatnie i ujemne", "Rozwiąż zadanie krok po kroku."];
  return <LessonTaskFrame eyebrow="Dział 7 · Liczby dodatnie i ujemne" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount} data-signed-numbers-v2>
    <div className="space-y-5"><Guide activity={activity} readOnly={readOnly} task={task} /><section className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5 text-center"><p className="text-xl font-black leading-relaxed">{task.prompt}</p>{task.tokens ? null : <div className="my-5">{task.model}</div>}</section><div className="grid gap-3 sm:grid-cols-2">{ordered.map((option) => <LessonTaskChoice key={option.value} selected={selected === option.value} disabled={readOnly || result !== null} onClick={() => { setSelected(option.value); setMessage(""); onResultChange?.(null); }} className="min-h-16 text-lg">{option.label}</LessonTaskChoice>)}</div>{!readOnly && result === null ? <button type="button" onClick={check} className="min-h-14 w-full rounded-2xl bg-indigo-700 px-5 text-lg font-black text-white">Sprawdź odpowiedź</button> : null}{message ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${result === true ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{result === false ? <>Spróbuj innym razem. Poprawny wynik to <span className="inline-flex align-middle">{task.answerNode}</span>. Dziś bez punktu. {task.explanation}</> : message}</p> : null}</div>
  </LessonTaskFrame>;
}

function WorkCard({ activity, task, readOnly = false, questionNumber, questionCount, onResultChange }: Props & { task: WorkTask }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState(task.fields[0]?.id ?? "");
  const [sign, setSign] = useState<Sign | "">("");
  const [result, setResult] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const normalize = (value: string) => value.trim().replace(",", ".").replace(/^0+(?=\d)/, "");
  const edit = (key: string) => {
    if (readOnly || result !== null || !active) return;
    setValues((current) => ({ ...current, [active]: key === "backspace" ? (current[active] ?? "").slice(0, -1) : (current[active] ?? "").length < 7 ? `${current[active] ?? ""}${key}` : current[active] ?? "" }));
    setMessage(""); onResultChange?.(null);
  };
  const check = () => {
    const missingField = task.fields.some((field) => !(values[field.id] ?? "").trim());
    if (missingField || (task.expectedSign && !sign)) { setMessage("Uzupełnij wszystkie pola warsztatu i wybierz znak wyniku."); setResult(null); onResultChange?.(null); return; }
    const fieldsCorrect = task.fields.every((field) => normalize(values[field.id] ?? "") === normalize(field.expected));
    const correct = fieldsCorrect && (!task.expectedSign || sign === task.expectedSign);
    setResult(correct);
    setMessage(correct ? `Brawo! ${task.explanation}` : "Spróbuj innym razem.");
    onResultChange?.(correct, `${sign}${task.fields.map((field) => values[field.id]).join(";")}`);
  };
  const [heading, description] = headings[activity] ?? ["Warsztat liczb ze znakiem", "Rozpisz rachunek krok po kroku."];
  return <LessonTaskFrame eyebrow="Dział 7 · Liczby dodatnie i ujemne" heading={heading} description={description} questionNumber={questionNumber} questionCount={questionCount} data-signed-numbers-v2>
    <div className="space-y-5"><Guide activity={activity} readOnly={readOnly} task={task} /><section className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5 text-center"><p className="text-xl font-black leading-relaxed">{task.prompt}</p><div className="my-5">{task.model}</div>{task.stageLabels ? <div className="grid gap-2 text-sm font-black text-indigo-900 sm:grid-cols-3">{task.stageLabels.map((label) => <span key={label} className="rounded-xl bg-indigo-100 p-2">{label}</span>)}</div> : null}</section><section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Miejsce na obliczenia"><h3 className="text-center text-xl font-black text-cyan-950">Miejsce na obliczenia</h3><p className="mt-1 text-center text-sm font-bold text-cyan-800">Dotknij kratki i uzupełnij każdy etap rachunku.</p>{task.expectedSign ? <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2"><b>Znak wyniku:</b>{(["+", "−", "0"] as Sign[]).map((candidate) => <LessonTaskChoice key={candidate} selected={sign === candidate} disabled={readOnly || result !== null} onClick={() => { setSign(candidate); setMessage(""); onResultChange?.(null); }} className="min-h-12 min-w-16 text-xl">{candidate}</LessonTaskChoice>)}</div> : null}<div className="mt-4 grid gap-3 sm:grid-cols-2">{task.fields.map((field) => <label key={field.id} className={`rounded-2xl border-2 bg-white p-3 font-bold ${active === field.id ? "border-violet-600 ring-4 ring-violet-100" : "border-cyan-200"}`}><span className="mb-2 block text-sm text-slate-700">{field.label}</span><input aria-label={field.label} inputMode="none" readOnly value={values[field.id] ?? ""} onFocus={() => setActive(field.id)} onClick={() => setActive(field.id)} className="h-14 w-full rounded-xl border-2 border-slate-200 bg-white text-center text-2xl font-black text-slate-950 outline-none" /></label>)}</div></section>{!readOnly && result === null ? <LessonNumericKeypad onKey={edit} onConfirm={check} allowSeparator label="Klawiatura do miejsca na obliczenia" helperText="Wybierz kratkę, wpisz liczbę i zatwierdź wszystkie pola dopiero na końcu." /> : null}{message ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${result === true ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{result === false ? <>Spróbuj innym razem. Poprawny wynik to <span className="inline-flex align-middle">{task.answerNode}</span>. Dziś bez punktu. {task.explanation}</> : message}</p> : null}</div>
  </LessonTaskFrame>;
}

function FractionEntry({ prefix, value, values, active, disabled, onActivate }: { prefix: string; value: FractionValue; values: Record<string, string>; active: string; disabled: boolean; onActivate: (id: string) => void }) {
  const numeratorId = `${prefix}-numerator`;
  const denominatorId = `${prefix}-denominator`;
  const field = (id: string, label: string) => <input aria-label={label} inputMode="none" readOnly disabled={disabled} value={values[id] ?? ""} onClick={() => onActivate(id)} onFocus={() => onActivate(id)} className={`h-11 w-16 rounded-lg border-2 bg-white text-center text-xl font-black outline-none ${active === id ? "border-violet-600 ring-4 ring-violet-100" : "border-slate-300"}`} />;
  return <span className="inline-flex items-center gap-1" data-fraction-equation-entry>
    {value.sign === "−" ? <b className="text-3xl">−</b> : null}
    <span className="inline-grid grid-rows-2 gap-1 align-middle">
      <span className="border-b-2 border-slate-950 pb-1">{field(numeratorId, `Licznik: ${prefix}`)}</span>
      <span className="pt-1">{field(denominatorId, `Mianownik: ${prefix}`)}</span>
    </span>
  </span>;
}

function SignedFractionCard({ task, readOnly = false, questionNumber, questionCount, onResultChange }: Props & { task: SignedFractionTask }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState("left-numerator");
  const [result, setResult] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const entries = [["left", task.expandedLeft], ["right", task.expandedRight], ...(task.intermediate ? [["intermediate", task.intermediate] as [string, FractionValue]] : []), ["result", task.result]] as Array<[string, FractionValue]>;
  const edit = (key: string) => {
    if (readOnly || result !== null) return;
    setValues((current) => ({ ...current, [active]: key === "backspace" ? (current[active] ?? "").slice(0, -1) : `${current[active] ?? ""}${key}`.slice(0, 3) }));
    setMessage(""); onResultChange?.(null);
  };
  const check = () => {
    const expected = entries.flatMap(([prefix, value]) => [[`${prefix}-numerator`, value.numerator], [`${prefix}-denominator`, value.denominator]] as Array<[string, string]>);
    if (expected.some(([id]) => !(values[id] ?? "").trim())) { setResult(null); setMessage("Uzupełnij wszystkie liczniki i mianowniki po znakach równości."); onResultChange?.(null); return; }
    const correct = expected.every(([id, value]) => values[id] === value);
    setResult(correct);
    setMessage(correct ? `Brawo! ${task.explanation}` : "Spróbuj innym razem.");
    onResultChange?.(correct, JSON.stringify(values));
  };
  return <LessonTaskFrame eyebrow="Dział 7 · Liczby dodatnie i ujemne" heading="Ułamki zwykłe — pełny zapis" description="Najpierw uprość znaki. Po każdym znaku równości pokaż następny etap obliczenia." questionNumber={questionNumber} questionCount={questionCount} data-signed-numbers-v2>
    <div className="space-y-5">
      <Guide activity="g6-add-fractions" readOnly={readOnly} />
      <section className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5 text-center">
        <p className="text-xl font-black leading-relaxed">{task.prompt}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-3xl font-black" aria-label="Pełny zapis działania na ułamkach">
          <span className="inline-flex items-center gap-2">{task.source}</span><span>=</span>
          <FractionEntry prefix="left" value={task.expandedLeft} values={values} active={active} disabled={readOnly || result !== null} onActivate={setActive} />
          <span>{task.operator}</span>
          <FractionEntry prefix="right" value={task.expandedRight} values={values} active={active} disabled={readOnly || result !== null} onActivate={setActive} />
          {task.intermediate ? <><span>=</span><FractionEntry prefix="intermediate" value={task.intermediate} values={values} active={active} disabled={readOnly || result !== null} onActivate={setActive} /></> : null}
          <span>=</span><FractionEntry prefix="result" value={task.result} values={values} active={active} disabled={readOnly || result !== null} onActivate={setActive} />
        </div>
      </section>
      {!readOnly && result === null ? <LessonNumericKeypad onKey={edit} onConfirm={check} label="Klawiatura do zapisu ułamków" helperText="Dotknij licznika lub mianownika, a następnie wpisz liczbę. Zatwierdź cały zapis na końcu." /> : null}
      {message ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${result === true ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{result === false ? <>Spróbuj innym razem. Poprawny wynik to <span className="inline-flex align-middle">{task.answerNode}</span>. Dziś bez punktu. {task.explanation}</> : message}</p> : null}
    </div>
  </LessonTaskFrame>;
}

function StoryNumberInput({ id, label, value, active, disabled, onActivate, className = "" }: { id: string; label: string; value: string; active: string; disabled: boolean; onActivate: (id: string) => void; className?: string }) {
  return <input aria-label={label} inputMode="none" readOnly disabled={disabled} value={value} onClick={() => onActivate(id)} onFocus={() => onActivate(id)} className={`h-14 min-w-20 rounded-xl border-2 bg-white px-2 text-center text-2xl font-black text-slate-950 outline-none ${active === id ? "border-violet-600 ring-4 ring-violet-100" : "border-slate-300"} ${className}`} />;
}

function StoryCard({ task, readOnly = false, questionNumber, questionCount, onResultChange }: Props & { task: StoryTask }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [operators, setOperators] = useState<Array<"+" | "−" | "">>(["", ""]);
  const [active, setActive] = useState(`data-${task.data[0]!.id}`);
  const [result, setResult] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const normalize = (value: string) => value.trim().replace("−", "-").replace(",", ".").replace(/^\+/, "");
  const edit = (key: string) => {
    if (readOnly || result !== null) return;
    setValues((current) => {
      const oldValue = current[active] ?? "";
      const next = key === "backspace" ? oldValue.slice(0, -1) : key === "minus" ? (oldValue.startsWith("-") ? oldValue.slice(1) : `-${oldValue}`) : `${oldValue}${key}`.slice(0, 7);
      return { ...current, [active]: next };
    });
    setMessage(""); onResultChange?.(null);
  };
  const check = () => {
    const expected = [
      ...task.data.map((item) => [`data-${item.id}`, item.expected] as const),
      ...task.operands.map((value, index) => [`operand-${index}`, value] as const),
      ["expression-result", task.result] as const,
      ["answer", task.result] as const,
    ];
    if (expected.some(([id]) => !(values[id] ?? "").trim()) || operators.some((operator) => !operator)) { setResult(null); setMessage("Uzupełnij dane, całe działanie, wynik i odpowiedź."); onResultChange?.(null); return; }
    const correct = expected.every(([id, value]) => normalize(values[id] ?? "") === normalize(value)) && operators.every((operator, index) => operator === task.operators[index]);
    setResult(correct);
    setMessage(correct ? "Brawo! Dane, działanie i odpowiedź są zapisane poprawnie." : "Spróbuj innym razem.");
    onResultChange?.(correct, JSON.stringify({ values, operators }));
  };
  const chooseOperator = (index: number, operator: "+" | "−") => {
    setOperators((current) => current.map((value, position) => position === index ? operator : value));
    setMessage(""); onResultChange?.(null);
  };
  return <LessonTaskFrame eyebrow="Dział 7 · Liczby dodatnie i ujemne" heading="Zadania tekstowe — zapisz całe rozwiązanie" description="Wyodrębnij dane, samodzielnie zapisz całe działanie z wynikiem i sformułuj odpowiedź." questionNumber={questionNumber} questionCount={questionCount} data-signed-numbers-v2>
    <div className="space-y-5">
      <section className="grid items-center gap-5 rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5 md:grid-cols-[0.9fr_1.1fr]">
        <Image src={task.imageSrc} alt={task.imageAlt} width={1536} height={1024} className="max-h-56 w-full rounded-2xl object-contain" />
        <div><p className="text-sm font-black uppercase tracking-[.16em] text-violet-700">{task.title}</p><p className="mt-2 text-xl font-black leading-relaxed text-slate-950">{task.prompt}</p></div>
      </section>
      <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Dane">
        <h3 className="text-xl font-black text-cyan-950">Dane</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">{task.data.map((item) => { const id = `data-${item.id}`; return <label key={id} className="rounded-2xl bg-white p-3 font-bold"><span className="mb-2 block text-sm text-slate-700">{item.label}</span><span className="flex items-center gap-2"><StoryNumberInput id={id} label={item.label} value={values[id] ?? ""} active={active} disabled={readOnly || result !== null} onActivate={setActive} className="w-full" /><b>{item.unit}</b></span></label>; })}</div>
      </section>
      <section className="rounded-3xl border-2 border-violet-200 bg-violet-50 p-4" aria-label="Działanie">
        <h3 className="text-xl font-black text-violet-950">Działanie</h3><p className="mt-1 text-sm font-bold text-violet-800">Wpisz wszystkie liczby, wybierz znaki działań i dopisz wynik po znaku równości.</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {task.operands.map((_, index) => <span key={index} className="contents"><StoryNumberInput id={`operand-${index}`} label={`Liczba ${index + 1} w działaniu`} value={values[`operand-${index}`] ?? ""} active={active} disabled={readOnly || result !== null} onActivate={setActive} />{index < 2 ? <span className="inline-flex gap-1">{(["+", "−"] as const).map((operator) => <LessonTaskChoice key={operator} selected={operators[index] === operator} disabled={readOnly || result !== null} onClick={() => chooseOperator(index, operator)} className="min-h-12 min-w-12 text-xl" aria-label={`${index + 1}. znak działania: ${operator === "+" ? "plus" : "minus"}`}>{operator}</LessonTaskChoice>)}</span> : null}</span>)}
          <b className="text-3xl">=</b><StoryNumberInput id="expression-result" label="Wynik po znaku równości" value={values["expression-result"] ?? ""} active={active} disabled={readOnly || result !== null} onActivate={setActive} />
        </div>
      </section>
      <section className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4" aria-label="Odpowiedź">
        <h3 className="text-xl font-black text-emerald-950">Odpowiedź</h3><div className="mt-3 flex flex-wrap items-center gap-2 text-lg font-bold"><span>{task.answerLead}</span><StoryNumberInput id="answer" label="Liczba w odpowiedzi" value={values.answer ?? ""} active={active} disabled={readOnly || result !== null} onActivate={setActive} /><span>{task.answerUnit}</span></div>
      </section>
      {!readOnly && result === null ? <LessonNumericKeypad onKey={edit} onConfirm={check} allowSeparator allowNegative label="Klawiatura do pełnego rozwiązania" helperText="Najpierw dotknij wybranego pola. Klawisz minus zmienia znak wpisywanej liczby." /> : null}
      {message ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${result === true ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{result === false ? <>Spróbuj innym razem. Poprawny wynik to <span className="inline-flex align-middle">{task.answerNode}</span>. Dziś bez punktu.</> : message}</p> : null}
    </div>
  </LessonTaskFrame>;
}

export function Grade6SignedNumbersV2Lab(props: Props) {
  if (props.activity === "g6-integer-line") return <IntegerLineWorkshop {...props} />;
  if (props.activity === "g6-add-fractions") {
    const task = pickTask(signedFractionTasks, props.taskSeed);
    return <SignedFractionCard key={task.id} {...props} task={task} />;
  }
  if (props.activity === "g6-add-stories") {
    const task = pickTask(storyTasks, props.taskSeed);
    return <StoryCard key={task.id} {...props} task={task} />;
  }
  const choiceTasks = choiceByActivity[props.activity];
  if (choiceTasks?.length) {
    const task = pickTask(choiceTasks, props.taskSeed);
    return <ChoiceCard key={`${props.activity}-${task.id}`} {...props} task={task} />;
  }
  const workTasks = workByActivity[props.activity];
  if (workTasks?.length) {
    const task = pickTask(workTasks, props.taskSeed);
    return <WorkCard key={`${props.activity}-${task.id}`} {...props} task={task} />;
  }
  return null;
}
