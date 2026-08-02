"use client";

import { useMemo, useState, type ReactNode } from "react";
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
type ChoiceTask = {
  id: string;
  prompt: string;
  model: ReactNode;
  options: Array<{ value: string; label: ReactNode }>;
  answer: string;
  answerNode: ReactNode;
  explanation: string;
  axis?: { values: number[]; focus?: number[] };
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

function NumberLine({ values, focus = [] }: { values: number[]; focus?: number[] }) {
  const min = Math.floor(Math.min(-5, ...values));
  const max = Math.ceil(Math.max(5, ...values));
  const position = (value: number) => 7 + ((value - min) / (max - min)) * 86;
  return <div className="rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white px-3 py-5" role="img" aria-label={`Oś liczbowa od ${min} do ${max}`}>
    <div className="relative mx-auto h-28 max-w-4xl">
      <div className="absolute left-[5%] right-[5%] top-12 h-1 rounded-full bg-indigo-900" />
      <span className="absolute left-[3%] top-[38px] text-2xl font-black text-indigo-900">‹</span>
      <span className="absolute right-[3%] top-[38px] text-2xl font-black text-indigo-900">›</span>
      {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((value) => <div key={value} className="absolute top-9 -translate-x-1/2 text-center" style={{ left: `${position(value)}%` }}>
        <span className={`mx-auto block h-7 w-1 rounded ${value === 0 ? "bg-violet-700" : "bg-slate-500"}`} />
        <b className={`mt-1 block text-sm ${value === 0 ? "text-violet-800" : "text-slate-700"}`}>{value < 0 ? `−${Math.abs(value)}` : value}</b>
      </div>)}
      {focus.map((value, index) => <div key={`${value}-${index}`} className="absolute top-5 -translate-x-1/2" style={{ left: `${position(value)}%` }}>
        <span className={`block h-6 w-6 rounded-full border-4 border-white shadow-lg ${index === 0 ? "bg-rose-500" : "bg-emerald-500"}`} />
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

function ZeroPairLab({ readOnly }: { readOnly: boolean }) {
  const [pairs, setPairs] = useState(0);
  return <section className="rounded-3xl border-2 border-violet-200 bg-white p-4 shadow-sm">
    <h3 className="text-center text-xl font-black text-indigo-950">Para zerowa: +1 i −1 razem dają 0</h3>
    <p className="mt-1 text-center font-bold text-slate-700">W modelu −6 + 4 połącz żetony w pary zerowe.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-rose-50 p-3"><b className="block text-center text-rose-900">Ujemne żetony</b><div className="mt-3 flex flex-wrap justify-center gap-2">{Array.from({ length: 6 }, (_, index) => <span key={index} className={`grid h-10 w-10 place-items-center rounded-full border-2 font-black ${index < pairs ? "border-slate-300 bg-slate-100 text-slate-300 line-through" : "border-rose-700 bg-rose-300 text-rose-950"}`}>−1</span>)}</div></div>
      <div className="rounded-2xl bg-emerald-50 p-3"><b className="block text-center text-emerald-900">Dodatnie żetony</b><div className="mt-3 flex flex-wrap justify-center gap-2">{Array.from({ length: 4 }, (_, index) => <span key={index} className={`grid h-10 w-10 place-items-center rounded-full border-2 font-black ${index < pairs ? "border-slate-300 bg-slate-100 text-slate-300 line-through" : "border-emerald-700 bg-emerald-300 text-emerald-950"}`}>+1</span>)}</div></div>
    </div>
    <div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" disabled={readOnly || pairs === 4} onClick={() => setPairs((value) => Math.min(4, value + 1))} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Połącz następną parę</button><button type="button" disabled={readOnly || pairs === 0} onClick={() => setPairs(0)} className="min-h-12 rounded-xl border-2 border-violet-300 px-4 font-black text-violet-900 disabled:opacity-40">Od początku</button></div>
    <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-center font-black">Pozostało: {6 - pairs} ujemnych i {4 - pairs} dodatnich{pairs === 4 ? ", czyli −2" : ""}.</p>
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

const numberSetTasks: ChoiceTask[] = [
  ["0", "naturalna i całkowita", "W tej lekcji liczby naturalne zaczynamy od zera."], ["7", "naturalna i całkowita", "Każda liczba naturalna jest także całkowita."], ["−3", "całkowita, ale nie naturalna", "Ujemne liczby całkowite nie są naturalne."], ["18", "naturalna i całkowita", "18 jest liczbą naturalną i całkowitą."], ["−12", "całkowita, ale nie naturalna", "−12 nie jest naturalna, ale jest całkowita."], ["−1", "całkowita, ale nie naturalna", "−1 należy do liczb całkowitych."],
].map(([value, answer, explanation], index) => ({ id: `sets-${index}`, prompt: "Do jakich zbiorów należy ta liczba?", model: <span className="text-6xl font-black">{value}</span>, options: options([["naturalna i całkowita", "naturalna i całkowita"], ["całkowita, ale nie naturalna", "całkowita, ale nie naturalna"], ["ani naturalna, ani całkowita", "ani naturalna, ani całkowita"]]), answer, answerNode: <>{answer}</>, explanation }));

const integerCompareRows: Array<[number, number, "<" | ">" | "=", string]> = [[2, 5, "<", "2 leży na osi na lewo od 5."], [7, -2, ">", "Każda liczba dodatnia jest większa od ujemnej."], [-3, 1, "<", "−3 leży na lewo od 1."], [-2, -6, ">", "−2 leży bliżej zera i bardziej na prawo."], [-9, -4, "<", "−9 leży bardziej na lewo niż −4."], [0, -5, ">", "Zero jest większe od każdej liczby ujemnej."], [-7, -7, "=", "Obie liczby oznaczają ten sam punkt."], [4, 0, ">", "Liczba dodatnia jest większa od zera."]];
const integerCompareTasks = integerCompareRows.map(([left, right, answer, explanation], index) => ({ id: `int-compare-${index}`, prompt: "Wstaw właściwy znak.", model: <span className="text-5xl font-black">{left < 0 ? `−${Math.abs(left)}` : left} □ {right < 0 ? `−${Math.abs(right)}` : right}</span>, options: options([["<", "<"], [">", ">"], ["=", "="]]), answer, answerNode: <>{answer}</>, explanation, axis: { values: [left, right], focus: [left, right] } }));

const integerLineTasks: ChoiceTask[] = [[-4, "−4"], [-1, "−1"], [0, "0"], [3, "3"], [-5, "−5"], [2, "2"]].map(([value, answer], index) => ({ id: `line-${index}`, prompt: "Która liczba jest zaznaczona na osi?", model: <span className="font-bold">Odczytaj położenie kolorowego punktu.</span>, options: options([[answer as string, answer as string], [`${-(value as number)}`, `${-(value as number)}`], [`${(value as number) + 1}`, `${(value as number) + 1}`]]), answer: answer as string, answerNode: <>{answer as string}</>, explanation: "Położenie odczytujemy względem zera; w prawo wartości rosną.", axis: { values: [value as number], focus: [value as number] } }));

const rationalLineTasks: ChoiceTask[] = [
  { id: "rat-line-1", value: -0.5, label: <SignedFraction sign="−" numerator="1" denominator="2" />, distractors: [<Fraction key="a" numerator="1" denominator="2" />, <SignedFraction key="b" sign="−" numerator="2" denominator="1" />] },
  { id: "rat-line-2", value: -1.5, label: <>−1 <Fraction numerator="1" denominator="2" /></>, distractors: [<>−1,25</>, <>1,5</>] },
  { id: "rat-line-3", value: 0.75, label: <Fraction numerator="3" denominator="4" />, distractors: [<SignedFraction key="a" sign="−" numerator="3" denominator="4" />, <Fraction key="b" numerator="4" denominator="3" />] },
  { id: "rat-line-4", value: -0.25, label: <>−0,25</>, distractors: [<>0,25</>, <>−2,5</>] },
  { id: "rat-line-5", value: 1.25, label: <>1 <Fraction numerator="1" denominator="4" /></>, distractors: [<>−1,25</>, <>1,4</>] },
  { id: "rat-line-6", value: -0.75, label: <SignedFraction sign="−" numerator="3" denominator="4" />, distractors: [<SignedFraction key="a" sign="−" numerator="4" denominator="3" />, <Fraction key="b" numerator="3" denominator="4" />] },
].map((task) => ({ id: task.id, prompt: "Która liczba jest zaznaczona na osi?", model: <span className="font-bold">Odczytaj położenie punktu między liczbami całkowitymi.</span>, options: options([["answer", task.label], ["distractor-a", task.distractors[0]!], ["distractor-b", task.distractors[1]!]]), answer: "answer", answerNode: task.label, explanation: "Ułamek zajmuje dokładne miejsce między sąsiednimi liczbami całkowitymi.", axis: { values: [task.value], focus: [task.value] } }));

const zeroPairTasks: ChoiceTask[] = [
  ["Ile jest warta jedna para złożona z +1 i −1?", "0", "Para liczb przeciwnych ma sumę zero."],
  ["W modelu −6 + 4 utworzono cztery pary zerowe. Ile ujemnych żetonów zostało?", "2", "Cztery dodatnie żetony skreślają cztery z sześciu ujemnych."],
  ["Jaki znak ma wynik działania −6 + 4?", "−", "Po usunięciu par zerowych pozostają tylko żetony ujemne."],
  ["Ile par zerowych można utworzyć w działaniu −3 + 5?", "3", "Każdy z trzech ujemnych żetonów łączy się z jednym dodatnim."],
  ["Co zostanie po usunięciu par w działaniu −3 + 5?", "+2", "Z pięciu dodatnich żetonów trzy tworzą pary, więc zostają dwa dodatnie."],
  ["Co otrzymamy, gdy liczby mają takie same moduły i przeciwne znaki?", "0", "Wszystkie żetony połączą się w pary zerowe."],
].map(([prompt, answer, explanation], index) => ({ id: `zero-pair-${index}`, prompt, model: <span className="text-5xl font-black">+1 &nbsp; + &nbsp; (−1)</span>, options: options([[answer, answer], [answer === "0" ? "1" : "0", answer === "0" ? "1" : "0"], [answer === "−" ? "+" : "−", answer === "−" ? "+" : "−"]]), answer, answerNode: <>{answer}</>, explanation }));

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

const addSameTasks: WorkTask[] = [["−4 + (−3)", "−", "7", "−7"], ["5 + 8", "+", "13", "13"], ["−9 + (−6)", "−", "15", "−15"], ["12 + 7", "+", "19", "19"], ["−11 + (−2)", "−", "13", "−13"], ["6 + 14", "+", "20", "20"], ["−15 + (−5)", "−", "20", "−20"], ["21 + 9", "+", "30", "30"]].map(([expression, sign, magnitude, answer], index) => work(`same-${index}`, "Najpierw dodaj wartości bezwzględne, potem dopisz wspólny znak.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["magnitude", "Suma wartości bezwzględnych", magnitude]], <>{answer}</>, "Przy jednakowych znakach dodajemy wartości bezwzględne i zachowujemy wspólny znak."));
const addDifferentTasks: WorkTask[] = [["−8 + 5", "−", "8", "5", "3", "−3"], ["7 + (−10)", "−", "10", "7", "3", "−3"], ["−4 + 11", "+", "11", "4", "7", "7"], ["13 + (−6)", "+", "13", "6", "7", "7"], ["−15 + 9", "−", "15", "9", "6", "−6"], ["18 + (−20)", "−", "20", "18", "2", "−2"], ["−12 + 12", "0", "12", "12", "0", "0"], ["25 + (−7)", "+", "25", "7", "18", "18"]].map(([expression, sign, bigger, smaller, difference, answer], index) => work(`different-${index}`, "Wpisz większy moduł, mniejszy moduł i ich różnicę.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["bigger", "Większa wartość bezwzględna", bigger], ["smaller", "Mniejsza wartość bezwzględna", smaller], ["difference", "Różnica", difference]], <>{answer}</>, "Przy różnych znakach odejmujemy moduły, a wynik ma znak liczby o większym module."));
const subtractIntegerTasks: WorkTask[] = [["6 − (−4)", "+", "10", "10"], ["−5 − 3", "−", "8", "−8"], ["−9 − (−2)", "−", "7", "−7"], ["7 − 12", "−", "5", "−5"], ["−4 − (−9)", "+", "5", "5"], ["15 − (−5)", "+", "20", "20"], ["−13 − 7", "−", "20", "−20"], ["3 − 11", "−", "8", "−8"]].map(([expression, sign, magnitude, answer], index) => work(`subtract-${index}`, "Zamień odejmowanie na dodawanie liczby przeciwnej, a potem oblicz.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["magnitude", "Wartość wyniku bez znaku", magnitude]], <>{answer}</>, "Odejmowanie liczby zamieniamy na dodawanie liczby do niej przeciwnej.", ["1. Zmień znak drugiej liczby", "2. Wykonaj dodawanie", "3. Ustal znak wyniku"]));

const fractionAddTasks: WorkTask[] = [
  work("fraction-add-1", "Uzupełnij cały zapis obliczenia.", <span className="text-4xl font-black"><SignedFraction sign="−" numerator="2" denominator="7" /> + <SignedFraction sign="−" numerator="3" denominator="7" /></span>, "−", [["common", "Wspólny mianownik", "7"], ["left", "Pierwszy licznik", "2"], ["right", "Drugi licznik", "3"], ["result-num", "Licznik wyniku", "5"], ["result-den", "Mianownik wyniku", "7"]], <SignedFraction sign="−" numerator="5" denominator="7" />, "Mianowniki są jednakowe, więc działamy na licznikach."),
  work("fraction-add-2", "Uzupełnij cały zapis obliczenia.", <span className="text-4xl font-black"><Fraction numerator="5" denominator="8" /> + <SignedFraction sign="−" numerator="3" denominator="8" /></span>, "+", [["common", "Wspólny mianownik", "8"], ["left", "Pierwszy licznik", "5"], ["right", "Drugi licznik", "3"], ["result-num", "Licznik wyniku", "1"], ["result-den", "Mianownik wyniku", "4"]], <Fraction numerator="1" denominator="4" />, "Po odjęciu liczników otrzymujemy dwie ósme, czyli jedną czwartą."),
  work("fraction-add-3", "Najpierw znajdź wspólny mianownik.", <span className="text-4xl font-black"><SignedFraction sign="−" numerator="1" denominator="2" /> + <Fraction numerator="1" denominator="3" /></span>, "−", [["common", "Wspólny mianownik", "6"], ["left", "Pierwszy licznik po rozszerzeniu", "3"], ["right", "Drugi licznik po rozszerzeniu", "2"], ["result-num", "Licznik wyniku", "1"], ["result-den", "Mianownik wyniku", "6"]], <SignedFraction sign="−" numerator="1" denominator="6" />, "Po sprowadzeniu oba ułamki mają mianownik 6, a ich liczniki to −3 i 2."),
  work("fraction-add-4", "Najpierw znajdź wspólny mianownik.", <span className="text-4xl font-black"><Fraction numerator="3" denominator="4" /> − <Fraction numerator="5" denominator="6" /></span>, "−", [["common", "Wspólny mianownik", "12"], ["left", "Pierwszy licznik po rozszerzeniu", "9"], ["right", "Drugi licznik po rozszerzeniu", "10"], ["result-num", "Licznik wyniku", "1"], ["result-den", "Mianownik wyniku", "12"]], <SignedFraction sign="−" numerator="1" denominator="12" />, "Dziewięć dwunastych minus dziesięć dwunastych daje minus jedną dwunastą."),
  work("fraction-add-5", "Uzupełnij cały zapis obliczenia.", <span className="text-4xl font-black"><SignedFraction sign="−" numerator="2" denominator="5" /> − <SignedFraction sign="−" numerator="1" denominator="10" /></span>, "−", [["common", "Wspólny mianownik", "10"], ["left", "Pierwszy licznik po rozszerzeniu", "4"], ["right", "Drugi licznik po rozszerzeniu", "1"], ["result-num", "Licznik wyniku", "3"], ["result-den", "Mianownik wyniku", "10"]], <SignedFraction sign="−" numerator="3" denominator="10" />, "Odejmowanie liczby ujemnej zmieniamy na dodawanie dodatniej jednej dziesiątej."),
  work("fraction-add-6", "Uzupełnij cały zapis obliczenia.", <span className="text-4xl font-black"><Fraction numerator="7" denominator="9" /> + <SignedFraction sign="−" numerator="5" denominator="6" /></span>, "−", [["common", "Wspólny mianownik", "18"], ["left", "Pierwszy licznik po rozszerzeniu", "14"], ["right", "Drugi licznik po rozszerzeniu", "15"], ["result-num", "Licznik wyniku", "1"], ["result-den", "Mianownik wyniku", "18"]], <SignedFraction sign="−" numerator="1" denominator="18" />, "Czternaście osiemnastych jest o jedną osiemnastą mniejsze od piętnastu osiemnastych."),
];

const decimalTasks: WorkTask[] = [["−3,8 + 5,2", "+", "3,8", "5,2", "1,4", "1,4"], ["4,5 + (−7,1)", "−", "4,5", "7,1", "2,6", "−2,6"], ["−2,4 + (−1,85)", "−", "2,4", "1,85", "4,25", "−4,25"], ["6,75 − 8,2", "−", "6,75", "8,2", "1,45", "−1,45"], ["−1,5 − (−2,75)", "+", "1,5", "2,75", "1,25", "1,25"], ["−6,02 + 0,98", "−", "6,02", "0,98", "5,04", "−5,04"]].map(([expression, sign, first, second, magnitude, answer], index) => work(`decimal-${index}`, "Zapisz moduły obu liczb i oblicz wynik.", <span className="text-5xl font-black">{expression}</span>, sign as Sign, [["first", "Pierwsza wartość bezwzględna", first], ["second", "Druga wartość bezwzględna", second], ["magnitude", "Wartość wyniku bez znaku", magnitude]], <>{answer}</>, "Znak ustalamy z położenia liczb, a przecinek nie zmienia reguły działania."));

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

const storyTasks: WorkTask[] = [["🌡️", "Rano było −4°C. Temperatura wzrosła o 9°C, a wieczorem spadła o 3°C. Jaka była wieczorem?", "+", "5", "2", "2°C"], ["🛗", "Winda była na poziomie −3, wjechała 8 pięter, a potem zjechała 2 piętra. Gdzie się zatrzymała?", "+", "5", "3", "poziom 3"], ["🤿", "Nurek był 6 m pod powierzchnią. Wypłynął o 4 m i ponownie zanurzył się o 3 m. Na jakiej głębokości jest?", "−", "2", "5", "−5 m"], ["🎮", "Gracz trzykrotnie stracił po 4 punkty, a potem zdobył 15 punktów. Jaka jest łączna zmiana?", "+", "12", "3", "+3 punkty"], ["💳", "Saldo wynosiło −18 zł. Wpłacono 25 zł i zapłacono 9 zł. Jakie jest saldo?", "−", "7", "2", "−2 zł"], ["🏔️", "Robot był 12 m nad bazą, zjechał 5 razy po 3 m. Gdzie znalazł się względem bazy?", "−", "15", "3", "−3 m"]].map(([icon, prompt, sign, first, result, answer], index) => work(`story-${index}`, prompt as string, <span className="text-7xl">{icon}</span>, sign as Sign, [["first", "Wynik pierwszego etapu", first as string], ["result", "Wartość końcowa bez znaku", result as string]], <>{answer}</>, "Rozpisanie zmian etapami pomaga kontrolować znak i kolejność.", ["1. Zapisz pierwszą zmianę", "2. Oblicz wynik pośredni", "3. Uwzględnij kolejną zmianę"], icon as string));

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
  "g6-sign-rules": signDiscoveryTasks,
  "g6-sign-table": signDiscoveryTasks,
  "g6-cipher": signDiscoveryTasks,
  "g6-review-sets": [...integerCompareTasks.slice(0, 3), ...oppositeTasks.slice(0, 3)],
  "g6-review-absolute": oppositeTasks,
  "g6-review-challenge": signDiscoveryTasks,
  "g6-context-integers": contextTasks,
  "g6-integer-line": integerLineTasks,
  "g6-integer-compare": integerCompareTasks,
  "g6-rational-line": rationalLineTasks,
  "g6-rational-compare": rationalCompareTasks,
  "g6-absolute-opposites": oppositeTasks,
  "g6-add-model": zeroPairTasks,
  "g6-sign-discovery": signDiscoveryTasks,
  "g6-review-map": [...integerCompareTasks.slice(0, 3), ...oppositeTasks.slice(0, 3)],
  "g6-review-escape": [...signDiscoveryTasks.slice(0, 2), ...rationalCompareTasks.slice(0, 3), ...oppositeTasks.slice(0, 3)],
};
const workByActivity: Partial<Record<Grade6SignedNumbersActivity, WorkTask[]>> = {
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
  "g6-add-fractions": fractionAddTasks,
  "g6-add-decimals": decimalTasks,
  "g6-add-stories": storyTasks,
  "g6-multiply-integers": multiplyIntegerTasks,
  "g6-divide-integers": divideIntegerTasks,
  "g6-multiply-fractions": fractionMultiplyTasks,
  "g6-divide-fractions": fractionDivideTasks,
  "g6-mul-stories": multiplicationStoryTasks,
  "g6-review-order-natural": orderNaturalTasks,
  "g6-review-order-integers": orderIntegerTasks,
  "g6-review-order-fractions": orderFractionTasks,
  "g6-review-stories": storyTasks,
};

Object.entries(choiceByActivity).forEach(([activity, tasks]) => { GRADE6_SIGNED_NUMBERS_TASK_COUNTS[activity as Grade6SignedNumbersActivity] = tasks?.length ?? 0; });
Object.entries(workByActivity).forEach(([activity, tasks]) => { GRADE6_SIGNED_NUMBERS_TASK_COUNTS[activity as Grade6SignedNumbersActivity] = tasks?.length ?? 0; });

const headings: Partial<Record<Grade6SignedNumbersActivity, [string, string]>> = {
  "g6-context-integers": ["Punktem odniesienia jest zero", "Znak liczby mówi, po której stronie zera znajduje się położenie albo w jakim kierunku zaszła zmiana."],
  "g6-number-sets": ["Najpierw liczby naturalne i całkowite", "Utrwalamy znane liczby bez ułamków. Zero jest naturalne i całkowite, ale nie jest dodatnie ani ujemne."],
  "g6-integer-line": ["Liczby całkowite na osi", "Na osi liczby rosną w prawo. Najpierw ćwiczymy wyłącznie na liczbach całkowitych."],
  "g6-integer-compare": ["Porównywanie liczb całkowitych", "Liczba leżąca bardziej na prawo jest większa. Dla liczb ujemnych bliżej zera oznacza większą liczbę."],
  "g6-rational-line": ["Ułamki na tej samej osi", "Reguła osi się nie zmienia: ułamki i liczby dziesiętne także mają swoje miejsce względem zera."],
  "g6-rational-compare": ["Porównywanie ułamków ze znakiem", "Najpierw porównaj dodatnie wartości, a potem uwzględnij położenie po ujemnej stronie osi."],
  "g6-absolute-opposites": ["Liczby przeciwne i odległość od zera", "Liczby przeciwne leżą po dwóch stronach zera w tej samej odległości. Wartość bezwzględna jest odległością."],
  "g6-add-model": ["Pary zerowe", "Każdy dodatni żeton i jeden ujemny żeton tworzą parę o wartości zero."],
  "g6-add-integers-same": ["Dodawanie całkowitych — te same znaki", "Najpierw oblicz na znanych liczbach naturalnych, potem dołącz wspólny znak."],
  "g6-add-integers-different": ["Dodawanie całkowitych — różne znaki", "Skreśl pary zerowe: odejmij mniejszy moduł od większego i zachowaj znak większego modułu."],
  "g6-subtract-integers": ["Odejmowanie liczb całkowitych", "Odejmowanie zamień na dodawanie liczby przeciwnej. Dopiero potem zastosuj regułę dodawania."],
  "g6-add-fractions": ["Warsztat dodawania i odejmowania ułamków", "Uzupełnij wspólny mianownik, nowe liczniki i wynik. Każdy etap obliczenia ma własne miejsce."],
  "g6-add-decimals": ["Liczby dziesiętne ze znakiem", "Reguły znaków są te same jak dla liczb całkowitych; przecinek pozostaje częścią rachunku na wartościach."],
  "g6-add-stories": ["Historie zmian", "Rozpisz sytuację na etapy i dopiero potem oblicz końcowe położenie albo zmianę."],
  "g6-sign-discovery": ["Skąd bierze się znak iloczynu i ilorazu", "Najpierw ustalamy kierunek zmiany. Regułę znaków wyprowadzamy z przykładów."],
  "g6-multiply-integers": ["Mnożenie liczb całkowitych", "Oddziel dwie decyzje: znak wyniku oraz iloczyn wartości bezwzględnych."],
  "g6-divide-integers": ["Dzielenie liczb całkowitych", "Oddziel znak wyniku od zwykłego dzielenia dodatnich wartości."],
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

function Guide({ activity, readOnly, task }: { activity: Grade6SignedNumbersActivity; readOnly: boolean; task?: ChoiceTask }) {
  if (activity === "g6-context-integers" || activity === "g6-number-sets") return <ContextCompass />;
  if (activity === "g6-add-model" || activity === "g6-add-integers-different") return <ZeroPairLab readOnly={readOnly} />;
  if (task?.axis) return <NumberLine values={task.axis.values} focus={task.axis.focus} />;
  if (["g6-integer-line", "g6-integer-compare", "g6-rational-line", "g6-rational-compare", "g6-absolute-opposites", "g6-review-map"].includes(activity)) return <NumberLine values={[-4, 0, 4]} />;
  if (activity.includes("fraction")) return <div className="grid gap-3 rounded-3xl bg-cyan-50 p-4 text-center font-bold text-cyan-950 sm:grid-cols-3"><span>1. Ustal znak</span><span>2. Wykonaj rachunek na ułamkach dodatnich</span><span>3. Skróć wynik</span></div>;
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
    <div className="space-y-5"><Guide activity={activity} readOnly={readOnly} task={task} /><section className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5 text-center"><p className="text-xl font-black leading-relaxed">{task.prompt}</p><div className="my-5">{task.model}</div></section><div className="grid gap-3 sm:grid-cols-2">{ordered.map((option) => <LessonTaskChoice key={option.value} selected={selected === option.value} disabled={readOnly || result !== null} onClick={() => { setSelected(option.value); setMessage(""); onResultChange?.(null); }} className="min-h-16 text-lg">{option.label}</LessonTaskChoice>)}</div>{!readOnly && result === null ? <button type="button" onClick={check} className="min-h-14 w-full rounded-2xl bg-indigo-700 px-5 text-lg font-black text-white">Sprawdź odpowiedź</button> : null}{message ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${result === true ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{result === false ? <>Spróbuj innym razem. Poprawny wynik to <span className="inline-flex align-middle">{task.answerNode}</span>. Dziś bez punktu. {task.explanation}</> : message}</p> : null}</div>
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
    <div className="space-y-5"><Guide activity={activity} readOnly={readOnly} /><section className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5 text-center"><p className="text-xl font-black leading-relaxed">{task.prompt}</p><div className="my-5">{task.model}</div>{task.stageLabels ? <div className="grid gap-2 text-sm font-black text-indigo-900 sm:grid-cols-3">{task.stageLabels.map((label) => <span key={label} className="rounded-xl bg-indigo-100 p-2">{label}</span>)}</div> : null}</section><section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Miejsce na obliczenia"><h3 className="text-center text-xl font-black text-cyan-950">Miejsce na obliczenia</h3><p className="mt-1 text-center text-sm font-bold text-cyan-800">Dotknij kratki i uzupełnij każdy etap rachunku.</p>{task.expectedSign ? <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2"><b>Znak wyniku:</b>{(["+", "−", "0"] as Sign[]).map((candidate) => <LessonTaskChoice key={candidate} selected={sign === candidate} disabled={readOnly || result !== null} onClick={() => { setSign(candidate); setMessage(""); onResultChange?.(null); }} className="min-h-12 min-w-16 text-xl">{candidate}</LessonTaskChoice>)}</div> : null}<div className="mt-4 grid gap-3 sm:grid-cols-2">{task.fields.map((field) => <label key={field.id} className={`rounded-2xl border-2 bg-white p-3 font-bold ${active === field.id ? "border-violet-600 ring-4 ring-violet-100" : "border-cyan-200"}`}><span className="mb-2 block text-sm text-slate-700">{field.label}</span><input aria-label={field.label} inputMode="none" readOnly value={values[field.id] ?? ""} onFocus={() => setActive(field.id)} onClick={() => setActive(field.id)} className="h-14 w-full rounded-xl border-2 border-slate-200 bg-white text-center text-2xl font-black text-slate-950 outline-none" /></label>)}</div></section>{!readOnly && result === null ? <LessonNumericKeypad onKey={edit} onConfirm={check} allowSeparator label="Klawiatura do miejsca na obliczenia" helperText="Wybierz kratkę, wpisz liczbę i zatwierdź wszystkie pola dopiero na końcu." /> : null}{message ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${result === true ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{result === false ? <>Spróbuj innym razem. Poprawny wynik to <span className="inline-flex align-middle">{task.answerNode}</span>. Dziś bez punktu. {task.explanation}</> : message}</p> : null}</div>
  </LessonTaskFrame>;
}

export function Grade6SignedNumbersV2Lab(props: Props) {
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
