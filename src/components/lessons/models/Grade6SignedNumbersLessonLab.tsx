"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LessonTaskChoice, LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";

export type Grade6SignedNumbersActivity =
  | "g6-number-sets" | "g6-absolute-value" | "g6-number-line" | "g6-select" | "g6-compare" | "g6-opposites"
  | "g6-sign-rules" | "g6-add-different" | "g6-add-same" | "g6-subtract" | "g6-axis" | "g6-add-stories"
  | "g6-sign-table" | "g6-multiply" | "g6-divide" | "g6-cipher" | "g6-mul-stories"
  | "g6-review-sets" | "g6-review-absolute" | "g6-review-operations" | "g6-review-stories" | "g6-review-challenge";

interface Props {
  activity: Grade6SignedNumbersActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Option = { value: string; label: ReactNode };
type ChoiceTask = { id: string; prompt: string; model: ReactNode; options: Option[]; answer: string; answerNode?: ReactNode; hint?: string };
type InputTask = { id: string; prompt: string; model: ReactNode; answer: string; answerNode?: ReactNode; hint?: string };

function Fraction({ numerator, denominator, whole }: { numerator: ReactNode; denominator: ReactNode; whole?: ReactNode }) {
  return <span className="inline-flex items-center gap-1 align-middle font-black">{whole !== undefined ? <span>{whole}</span> : null}<span className="inline-grid min-w-8 grid-rows-2 text-center leading-none"><span className="border-b-2 border-current px-1 pb-1">{numerator}</span><span className="px-1 pt-1">{denominator}</span></span></span>;
}

const signed = (value: ReactNode, tone: "positive" | "negative" | "zero" = "zero") => (
  <span className={`inline-flex min-w-16 justify-center rounded-2xl px-3 py-2 text-2xl font-black ${tone === "positive" ? "bg-emerald-100 text-emerald-800" : tone === "negative" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-800"}`}>{value}</span>
);

const commonOptions = (values: Array<[string, ReactNode]>): Option[] => values.map(([value, label]) => ({ value, label }));

const choiceTasks: Partial<Record<Grade6SignedNumbersActivity, ChoiceTask[]>> = {
  "g6-number-sets": [
    { id: "sets-1", prompt: "Do jakiego zbioru należy liczba −7?", model: signed("−7", "negative"), options: commonOptions([["natural", "tylko naturalne"], ["integer", "całkowite, ale nie naturalne"], ["neither", "ani naturalne, ani całkowite"]]), answer: "integer", answerNode: <>całkowite, ale nie naturalne</> },
    { id: "sets-2", prompt: "Do jakich zbiorów należy zero?", model: signed("0"), options: commonOptions([["both", "naturalne i całkowite"], ["integer", "tylko całkowite"], ["neither", "do żadnego"]]), answer: "both", answerNode: <>naturalne i całkowite</>, hint: "W tej lekcji liczby naturalne zaczynamy od zera." },
    { id: "sets-3", prompt: "Które zdanie jest prawdziwe?", model: <Fraction numerator="3" denominator="4" />, options: commonOptions([["natural", "To liczba naturalna."], ["integer", "To liczba całkowita."], ["neither", "To nie jest liczba naturalna ani całkowita."]]), answer: "neither", answerNode: <>To nie jest liczba naturalna ani całkowita.</> },
    { id: "sets-4", prompt: "Które zdanie jest prawdziwe?", model: signed("−1,25", "negative"), options: commonOptions([["negative", "To liczba ujemna, ale nie całkowita."], ["integer", "To liczba całkowita."], ["positive", "To liczba dodatnia."]]), answer: "negative", answerNode: <>To liczba ujemna, ale nie całkowita.</> },
  ],
  "g6-absolute-value": [
    { id: "abs-1", prompt: "Wybierz wartość bezwzględną liczby.", model: <span className="text-4xl font-black">|−8|</span>, options: commonOptions([["8", "8"], ["-8", "−8"], ["0", "0"]]), answer: "8", answerNode: <>8</> },
    { id: "abs-2", prompt: "Wartość bezwzględna to odległość od zera. Wybierz wynik.", model: <span className="text-4xl font-black">|2,6|</span>, options: commonOptions([["2.6", "2,6"], ["-2.6", "−2,6"], ["26", "26"]]), answer: "2.6", answerNode: <>2,6</> },
    { id: "abs-3", prompt: "Wybierz poprawny wynik.", model: <span className="text-4xl font-black">|−<Fraction numerator="5" denominator="6" />|</span>, options: commonOptions([["5/6", <Fraction key="a" numerator="5" denominator="6" />], ["-5/6", <span key="b">−<Fraction numerator="5" denominator="6" /></span>], ["6/5", <Fraction key="c" numerator="6" denominator="5" />]]), answer: "5/6", answerNode: <Fraction numerator="5" denominator="6" /> },
    { id: "abs-4", prompt: "Która równość jest prawdziwa?", model: <span className="text-4xl font-black">|0|</span>, options: commonOptions([["0", "0"], ["1", "1"], ["-1", "−1"]]), answer: "0", answerNode: <>0</> },
  ],
  "g6-number-line": [
    { id: "line-1", prompt: "Punkt B oznacza −0,75. Jaką liczbę oznacza punkt A?", model: <NumberLine points={[[-1.5, "A"], [-0.75, "B"], [0.5, "C"], [1.25, "D"]]} />, options: commonOptions([["-3/2", <span key="a">−1 <Fraction numerator="1" denominator="2" /></span>], ["-5/4", <span key="b">−1 <Fraction numerator="1" denominator="4" /></span>], ["-3/4", <span key="c">−<Fraction numerator="3" denominator="4" /></span>], ["1.5", "1,5"]]), answer: "-3/2", answerNode: <span>−1 <Fraction numerator="1" denominator="2" /></span>, hint: "Odczytaj skalę osi: odległość między dwiema krótkimi kreskami wynosi 0,25." },
    { id: "line-2", prompt: "Który punkt przedstawia liczbę przeciwną do −0,75?", model: <NumberLine points={[[-1.5, "A"], [-0.75, "B"], [0.75, "C"], [1.5, "D"]]} />, options: commonOptions([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), answer: "C", answerNode: <>C</> },
    { id: "line-3", prompt: "Który punkt przedstawia liczbę −1,25?", model: <NumberLine points={[[-1.25, "A"], [-0.5, "B"], [0.25, "C"], [1.5, "D"]]} />, options: commonOptions([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), answer: "A", answerNode: <>A</> },
    { id: "line-4", prompt: "Który punkt leży w tej samej odległości od zera co punkt B?", model: <NumberLine points={[[-1.75, "A"], [-1.25, "B"], [0.5, "C"], [1.25, "D"]]} />, options: commonOptions([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]), answer: "D", answerNode: <>D</> },
  ],
  "g6-select": [
    { id: "select-1", prompt: "Wybierz liczbę większą od −0,8.", model: <span className="text-xl font-bold">Na osi większa liczba leży bardziej na prawo.</span>, options: commonOptions([["-1.2", "−1,2"], ["-0.75", "−0,75"], ["-1", "−1"], ["-2", "−2"]]), answer: "-0.75", answerNode: <>−0,75</> },
    { id: "select-2", prompt: "Wybierz liczbę mniejszą od przeciwnej do −1,4.", model: <span className="text-3xl font-black">liczba przeciwna do −1,4</span>, options: commonOptions([["1.2", "1,2"], ["1.5", "1,5"], ["2", "2"], ["1.4", "1,4"]]), answer: "1.2", answerNode: <>1,2</> },
    { id: "select-3", prompt: "Wybierz liczbę większą od podanej.", model: <span className="text-4xl font-black">−<Fraction numerator="5" denominator="8" /></span>, options: commonOptions([["-0.7", "−0,7"], ["-0.6", "−0,6"], ["-3/4", <span key="a">−<Fraction numerator="3" denominator="4" /></span>], ["-1", "−1"]]), answer: "-0.6", answerNode: <>−0,6</> },
    { id: "select-4", prompt: "Wybierz liczbę mniejszą od podanej.", model: <span className="text-4xl font-black">−1 <Fraction numerator="1" denominator="4" /></span>, options: commonOptions([["-1.2", "−1,2"], ["-1.3", "−1,3"], ["-1", "−1"], ["-0.75", "−0,75"]]), answer: "-1.3", answerNode: <>−1,3</> },
  ],
  "g6-compare": compareTasks(),
  "g6-opposites": oppositeTasks(),
  "g6-sign-rules": [
    { id: "rules-1", prompt: "Jaki znak zostanie po usunięciu nawiasu?", model: <span className="text-4xl font-black">+(−3,2)</span>, options: commonOptions([["plus", "+"], ["minus", "−"]]), answer: "minus", answerNode: <>−</> },
    { id: "rules-2", prompt: "Jaki znak zostanie po usunięciu nawiasu?", model: <span className="text-4xl font-black">−(−<Fraction numerator="2" denominator="5" />)</span>, options: commonOptions([["plus", "+"], ["minus", "−"]]), answer: "plus", answerNode: <>+</> },
    { id: "rules-3", prompt: "Który zapis otrzymamy po usunięciu nawiasu?", model: <span className="text-4xl font-black">4,1 − (−2,3)</span>, options: commonOptions([["add", "4,1 + 2,3"], ["sub", "4,1 − 2,3"]]), answer: "add", answerNode: <>4,1 + 2,3</> },
  ],
  "g6-axis": [
    { id: "axis-1", prompt: "Zaczynamy w punkcie −1,5 i przesuwamy się o 2,25 w prawo. Gdzie staniemy?", model: <NumberLine points={[[ -1.5, "start" ], [0.75, "?" ]]} />, options: commonOptions([["0.75", "0,75"], ["-0.75", "−0,75"], ["3.75", "3,75"]]), answer: "0.75", answerNode: <>0,75</> },
    { id: "axis-2", prompt: "Zaczynamy w punkcie 0,5 i odejmujemy 1,25. Gdzie staniemy?", model: <NumberLine points={[[0.5, "start"], [-0.75, "?"]]} />, options: commonOptions([["-0.75", "−0,75"], ["0.75", "0,75"], ["1.75", "1,75"]]), answer: "-0.75", answerNode: <>−0,75</> },
  ],
  "g6-sign-table": signTableTasks(),
  "g6-multiply": fractionMultiplyTasks(),
  "g6-divide": fractionDivideTasks(),
  "g6-cipher": cipherTasks(),
  "g6-review-sets": [...(compareTasks().slice(0, 2)), ...(oppositeTasks().slice(0, 2))],
  "g6-review-absolute": [
    { id: "review-abs-1", prompt: "Która liczba ma największą wartość bezwzględną?", model: <span className="text-3xl font-black">−2,4 &nbsp; 2,1 &nbsp; −<Fraction numerator="5" denominator="2" /></span>, options: commonOptions([["-2.4", "−2,4"], ["2.1", "2,1"], ["-5/2", <span key="x">−<Fraction numerator="5" denominator="2" /></span>]]), answer: "-5/2", answerNode: <span>−<Fraction numerator="5" denominator="2" /></span> },
    { id: "review-abs-2", prompt: "Wybierz liczbę, której odległość od zera wynosi 1,75.", model: <span className="text-xl font-bold">Szukamy jednej z dwóch liczb przeciwnych.</span>, options: commonOptions([["-1.75", "−1,75"], ["-1.5", "−1,5"], ["0.75", "0,75"]]), answer: "-1.75", answerNode: <>−1,75</> },
  ],
  "g6-review-challenge": [
    { id: "challenge-1", prompt: "Wybierz wynik działania z zachowaniem kolejności działań.", model: <span className="text-4xl font-black">−3 + 2 · (−4)</span>, options: commonOptions([["-11", "−11"], ["-20", "−20"], ["5", "5"]]), answer: "-11", answerNode: <>−11</> },
    { id: "challenge-2", prompt: "Wybierz wynik.", model: <span className="text-4xl font-black">(−2)³ − |−5|</span>, options: commonOptions([["-13", "−13"], ["3", "3"], ["-3", "−3"]]), answer: "-13", answerNode: <>−13</> },
    { id: "challenge-3", prompt: "Który wynik jest poprawny?", model: <span className="text-4xl font-black">−<Fraction numerator="3" denominator="4" /> : <Fraction numerator="1" denominator="2" /> + 2</span>, options: commonOptions([["0.5", "0,5"], ["-3.5", "−3,5"], ["1.25", "1,25"]]), answer: "0.5", answerNode: <>0,5</> },
  ],
};

const inputTasks: Partial<Record<Grade6SignedNumbersActivity, InputTask[]>> = {
  "g6-add-different": mixedInputTasks("add-different", [
    [<>−3,8 + 5,2</>, "1,4"],
    [<>−<Fraction numerator="3" denominator="4" /> + 1,25</>, "0,5"],
    [<>1 <Fraction numerator="1" denominator="2" /> + (−2,25)</>, "−0,75"],
    [<>−2,4 + <Fraction numerator="7" denominator="8" /></>, "−1,525"],
  ]),
  "g6-add-same": mixedInputTasks("add-same", [
    [<>−2,4 + (−1,85)</>, "−4,25"],
    [<>−<Fraction numerator="2" denominator="5" /> + (−0,35)</>, "−0,75"],
    [<>1 <Fraction numerator="3" denominator="4" /> + 2,125</>, "3,875"],
    [<>−6,02 + (−<Fraction numerator="49" denominator="50" />)</>, "−7"],
  ]),
  "g6-subtract": mixedInputTasks("subtract", [
    [<>1,5 − (−2,75)</>, "4,25"],
    [<><Fraction numerator="3" denominator="5" /> − (−1,25)</>, "1,85"],
    [<>−1 <Fraction numerator="1" denominator="2" /> − <Fraction numerator="3" denominator="4" /></>, "−2,25"],
    [<>4,05 − 6 <Fraction numerator="7" denominator="10" /></>, "−2,65"],
  ]),
  "g6-add-stories": storyTasks("add-story", [["Rano było −3,5°C. W południe temperatura wzrosła o 7,2°C. Ile wynosiła?", "3,7"], ["Nurek był 4,5 m poniżej poziomu morza i zanurzył się jeszcze o 2,75 m. Na jakiej wysokości względem poziomu morza się znalazł?", "−7,25"], ["Stan konta wynosił −12,50 zł. Wpłacono 20 zł. Jaki jest nowy stan?", "7,5"], ["Winda była na poziomie −2 i przejechała 7 pięter w górę. Na którym poziomie stanęła?", "5"]]),
  "g6-mul-stories": storyTasks("mul-story", [["Temperatura spadała przez 4 godziny o 1,5°C na godzinę. Jaka była łączna zmiana?", "−6"], ["Nurek wykonał 5 zejść po 2,4 m. Jaka była łączna zmiana wysokości?", "−12"], ["Dług 18 zł rozłożono równo na 6 dni. Jaka zmiana salda przypadała na jeden dzień?", "−3"], ["Iloczyn dwóch liczb wynosi −7,5. Jedna z nich to 2,5. Oblicz drugą.", "−3"]]),
  "g6-review-operations": mixedInputTasks("review-op", [
    [<>−4,2 + 7,35</>, "3,15"],
    [<><Fraction numerator="7" denominator="8" /> − (−1,125)</>, "2"],
    [<>−2 <Fraction numerator="2" denominator="5" /> · (−1,5)</>, "3,6"],
    [<>−8,4 : 2 <Fraction numerator="1" denominator="10" /></>, "−4"],
  ]),
  "g6-review-stories": storyTasks("review-story", [["Temperatura wynosiła 2,5°C, a w nocy spadła o 6,8°C. Ile wynosiła po spadku?", "−4,3"], ["Balon był 12,5 m nad punktem startu i opadł o 18,2 m. Na jakiej wysokości względem startu się znalazł?", "−5,7"], ["Cztery identyczne zmiany salda dały łącznie −15 zł. Jaka była jedna zmiana?", "−3,75"]]),
};

function compareTasks(): ChoiceTask[] {
  return [
    { id: "compare-1", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−1,25 □ −1,2</span>, options: commonOptions([["<", "<"], [">", ">"], ["=", "="]]), answer: "<", answerNode: <>&lt;</> },
    { id: "compare-2", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−<Fraction numerator="3" denominator="4" /> □ −0,8</span>, options: commonOptions([[">", ">"], ["<", "<"], ["=", "="]]), answer: ">", answerNode: <>&gt;</> },
    { id: "compare-3", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">|−2,4| □ 2,35</span>, options: commonOptions([[">", ">"], ["<", "<"], ["=", "="]]), answer: ">", answerNode: <>&gt;</> },
    { id: "compare-4", prompt: "Wstaw właściwy znak.", model: <span className="text-4xl font-black">−<Fraction numerator="5" denominator="8" /> □ −0,625</span>, options: commonOptions([["=", "="], ["<", "<"], [">", ">"]]), answer: "=", answerNode: <>=</> },
  ];
}

function oppositeTasks(): ChoiceTask[] {
  return [
    { id: "opp-1", prompt: "Wybierz liczbę przeciwną.", model: signed("−2,75", "negative"), options: commonOptions([["2.75", "2,75"], ["-2.75", "−2,75"], ["0.275", "0,275"]]), answer: "2.75", answerNode: <>2,75</> },
    { id: "opp-2", prompt: "Wybierz liczbę przeciwną.", model: <span className="text-4xl font-black"><Fraction numerator="7" denominator="9" /></span>, options: commonOptions([["-7/9", <span key="a">−<Fraction numerator="7" denominator="9" /></span>], ["9/7", <Fraction key="b" numerator="9" denominator="7" />], ["7/9", <Fraction key="c" numerator="7" denominator="9" />]]), answer: "-7/9", answerNode: <span>−<Fraction numerator="7" denominator="9" /></span> },
    { id: "opp-3", prompt: "Która para składa się z liczb przeciwnych?", model: <span className="text-xl font-bold">Liczby przeciwne mają tę samą odległość od zera.</span>, options: commonOptions([["pair-a", <span key="a">−1,4 i 1,4</span>], ["pair-b", <span key="b">−1,4 i 0,14</span>], ["pair-c", <span key="c">1,4 i 1,4</span>]]), answer: "pair-a", answerNode: <>−1,4 i 1,4</> },
  ];
}

function signTableTasks(): ChoiceTask[] {
  return [
    ["−3 · 2", "minus"], ["−0,5 · (−4)", "plus"], ["6 : (−2)", "minus"], ["−<f> : (−<f>)", "plus"]
  ].map(([raw, answer], index) => ({ id: `sign-${index}`, prompt: "Ustal znak wyniku bez wykonywania obliczenia.", model: raw.includes("<f>") ? <span className="text-4xl font-black">−<Fraction numerator="3" denominator="5" /> : (−<Fraction numerator="1" denominator="2" />)</span> : <span className="text-4xl font-black">{raw}</span>, options: commonOptions([["plus", "dodatni"], ["minus", "ujemny"]]), answer, answerNode: answer === "plus" ? <>dodatni</> : <>ujemny</> }));
}

function fractionMultiplyTasks(): ChoiceTask[] {
  return [
    { id: "mul-1", prompt: "Oblicz iloczyn.", model: <span className="text-4xl font-black">−<Fraction numerator="2" denominator="3" /> · <Fraction numerator="9" denominator="4" /></span>, options: commonOptions([["-3/2", <span key="a">−<Fraction numerator="3" denominator="2" /></span>], ["3/2", <Fraction key="b" numerator="3" denominator="2" />], ["-8/27", <span key="c">−<Fraction numerator="8" denominator="27" /></span>]]), answer: "-3/2", answerNode: <span>−<Fraction numerator="3" denominator="2" /></span> },
    { id: "mul-2", prompt: "Oblicz iloczyn.", model: <span className="text-4xl font-black">−1,2 · (−0,5)</span>, options: commonOptions([["0.6", "0,6"], ["-0.6", "−0,6"], ["6", "6"]]), answer: "0.6", answerNode: <>0,6</> },
    { id: "mul-3", prompt: "Oblicz iloczyn.", model: <span className="text-4xl font-black"><Fraction numerator="5" denominator="8" /> · (−<Fraction numerator="4" denominator="15" />)</span>, options: commonOptions([["-1/6", <span key="a">−<Fraction numerator="1" denominator="6" /></span>], ["1/6", <Fraction key="b" numerator="1" denominator="6" />], ["-1/3", <span key="c">−<Fraction numerator="1" denominator="3" /></span>]]), answer: "-1/6", answerNode: <span>−<Fraction numerator="1" denominator="6" /></span> },
  ];
}

function fractionDivideTasks(): ChoiceTask[] {
  return [
    { id: "div-1", prompt: "Oblicz iloraz.", model: <span className="text-4xl font-black">−<Fraction numerator="3" denominator="4" /> : <Fraction numerator="1" denominator="2" /></span>, options: commonOptions([["-3/2", <span key="a">−<Fraction numerator="3" denominator="2" /></span>], ["3/8", <Fraction key="b" numerator="3" denominator="8" />], ["3/2", <Fraction key="c" numerator="3" denominator="2" />]]), answer: "-3/2", answerNode: <span>−<Fraction numerator="3" denominator="2" /></span> },
    { id: "div-2", prompt: "Oblicz iloraz.", model: <span className="text-4xl font-black">−4,2 : (−0,7)</span>, options: commonOptions([["6", "6"], ["-6", "−6"], ["0.6", "0,6"]]), answer: "6", answerNode: <>6</> },
    { id: "div-3", prompt: "Oblicz iloraz.", model: <span className="text-4xl font-black"><Fraction numerator="7" denominator="10" /> : (−<Fraction numerator="14" denominator="15" />)</span>, options: commonOptions([["-3/4", <span key="a">−<Fraction numerator="3" denominator="4" /></span>], ["3/4", <Fraction key="b" numerator="3" denominator="4" />], ["-4/3", <span key="c">−<Fraction numerator="4" denominator="3" /></span>]]), answer: "-3/4", answerNode: <span>−<Fraction numerator="3" denominator="4" /></span> },
  ];
}

function cipherTasks(): ChoiceTask[] {
  return [
    ["−3 · (−4)", "L"], ["18 : (−3)", "I"], ["−2,5 · 2", "C"], ["−8 : (−2)", "Z"], ["−0,5 · (−6)", "B"], ["−14 : 7", "A"]
  ].map(([expression, letter], index) => ({ id: `cipher-${index}`, prompt: "Oblicz wynik i odczytaj przypisaną literę.", model: <div className="text-center"><p className="text-4xl font-black">{expression}</p><p className="mt-3 text-sm font-bold text-slate-600">−6 → I &nbsp; −5 → C &nbsp; −2 → A &nbsp; 3 → B &nbsp; 4 → Z &nbsp; 12 → L</p></div>, options: commonOptions([[letter, letter], [letter === "A" ? "M" : "A", letter === "A" ? "M" : "A"], ["R", "R"]]), answer: letter, answerNode: <>{letter}</> }));
}

function mixedInputTasks(prefix: string, rows: Array<[ReactNode, string]>): InputTask[] {
  return rows.map(([expression, answer], index) => ({
    id: `${prefix}-${index}`,
    prompt: "Oblicz działanie.",
    model: <span className="inline-flex flex-wrap items-center justify-center gap-2 text-4xl font-black">{expression}</span>,
    answer,
  }));
}

function storyTasks(prefix: string, rows: Array<[string, string]>): InputTask[] {
  const icons = prefix.includes("mul") ? ["🌡️", "🤿", "💳", "🧩"] : prefix.includes("review") ? ["🌙", "🎈", "🧾"] : ["🌡️", "🤿", "💳", "🛗"];
  return rows.map(([prompt, answer], index) => ({ id: `${prefix}-${index}`, prompt, model: <span className="text-6xl" aria-hidden>{icons[index % icons.length]}</span>, answer }));
}

function NumberLine({ points }: { points: Array<[number, string]> }) {
  const min = -2; const max = 2; const x = (value: number) => 50 + ((value - min) / (max - min)) * 600;
  return <svg viewBox="0 0 700 150" className="mx-auto w-full max-w-3xl" role="img" aria-label="Oś liczbowa od minus dwóch do dwóch">
    <rect x="10" y="12" width="680" height="126" rx="24" fill="#eff6ff" />
    <line x1="45" y1="82" x2="655" y2="82" stroke="#1e3a8a" strokeWidth="5" />
    {Array.from({ length: 17 }, (_, i) => min + i * .25).map((value) => <line key={value} x1={x(value)} y1={value % 1 === 0 ? 67 : 73} x2={x(value)} y2="92" stroke="#334155" strokeWidth={value % 1 === 0 ? 3 : 1.5} />)}
    {[-2, -1, 0, 1, 2].map((value) => <text key={value} x={x(value)} y="116" textAnchor="middle" className="fill-slate-700 text-sm font-bold">{value}</text>)}
    {points.map(([value, label], index) => <g key={`${value}-${label}`}><circle cx={x(value)} cy="82" r="10" fill={["#7c3aed", "#0891b2", "#db2777", "#ea580c"][index % 4]} /><text x={x(value)} y="52" textAnchor="middle" className="fill-slate-900 text-base font-black">{label}</text></g>)}
  </svg>;
}

function ActivityGuide({ activity }: { activity: Grade6SignedNumbersActivity }) {
  if (activity === "g6-number-sets") return <div data-testid="number-sets-guide" className="mb-4 grid gap-2 text-center sm:grid-cols-3">
    <div className="rounded-2xl bg-emerald-100 p-3"><b>Liczby ujemne</b><br />… −3, −2, −1</div>
    <div className="rounded-2xl bg-slate-100 p-3"><b>Zero</b><br />ani dodatnie, ani ujemne</div>
    <div className="rounded-2xl bg-sky-100 p-3"><b>Liczby dodatnie</b><br />1, 2, 3…</div>
    <p className="sm:col-span-3 rounded-2xl bg-violet-100 p-3 font-bold">Liczby całkowite: … −2, −1, 0, 1, 2… &nbsp; Liczby naturalne: 0, 1, 2, 3…</p>
  </div>;
  if (["g6-number-line", "g6-select", "g6-compare", "g6-opposites", "g6-absolute-value", "g6-axis", "g6-review-sets", "g6-review-absolute"].includes(activity)) return <div className="mb-4 rounded-2xl bg-sky-100 p-3 text-center font-bold text-sky-950">← mniejsze &nbsp;&nbsp; −2 &nbsp; −1 &nbsp; 0 &nbsp; 1 &nbsp; 2 &nbsp;&nbsp; większe →<br /><span className="text-sm">Liczby przeciwne leżą po dwóch stronach zera w tej samej odległości.</span></div>;
  if (activity === "g6-sign-rules" || activity === "g6-subtract") return <div className="mb-4 grid grid-cols-2 gap-3 text-center font-black"><div className="rounded-2xl bg-rose-100 p-3">+ (−a) = −a</div><div className="rounded-2xl bg-emerald-100 p-3">− (−a) = +a</div></div>;
  if (["g6-add-different", "g6-add-same", "g6-add-stories"].includes(activity)) return <div className="mb-4 grid gap-3 sm:grid-cols-2">
    <div className="rounded-2xl bg-amber-100 p-3 text-center"><b>Te same znaki</b><br />dodaj wartości i zachowaj znak</div>
    <div className="rounded-2xl bg-cyan-100 p-3 text-center"><b>Różne znaki</b><br />odejmij mniejszą wartość od większej; zachowaj znak większej</div>
  </div>;
  if (["g6-sign-table", "g6-multiply", "g6-divide", "g6-cipher", "g6-mul-stories"].includes(activity)) return <div data-testid="sign-table-guide" className="mb-4 overflow-hidden rounded-2xl border-2 border-violet-200 bg-white text-center font-black"><div className="grid grid-cols-2 bg-violet-100"><span className="p-2">Znaki</span><span className="p-2">Znak wyniku</span></div><div className="grid grid-cols-2 border-t"><span className="p-2">takie same</span><span className="p-2 text-emerald-700">+</span></div><div className="grid grid-cols-2 border-t"><span className="p-2">różne</span><span className="p-2 text-rose-700">−</span></div></div>;
  return null;
}

function taskTone(activity: Grade6SignedNumbersActivity) {
  if (["g6-number-line", "g6-select", "g6-compare", "g6-opposites", "g6-absolute-value", "g6-axis"].includes(activity)) return "border-sky-200 bg-sky-50";
  if (["g6-sign-rules", "g6-add-different", "g6-add-same", "g6-subtract", "g6-add-stories"].includes(activity)) return "border-amber-200 bg-amber-50";
  if (["g6-sign-table", "g6-multiply", "g6-divide", "g6-cipher", "g6-mul-stories"].includes(activity)) return "border-violet-200 bg-violet-50";
  return "border-emerald-200 bg-emerald-50";
}

function ChoiceSeries({ tasks, activity, readOnly, onResultChange }: { tasks: ChoiceTask[]; activity: Grade6SignedNumbersActivity; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState(""); const [state, setState] = useState<"idle" | "correct" | "wrong">("idle"); const allCorrect = useRef(true);
  const task = tasks[index];
  const showTeacherNavigator = readOnly || !onResultChange;
  const goToTask = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(tasks.length - 1, nextIndex)));
    setSelected("");
    setState("idle");
  };
  const onResultChangeRef = useRef(onResultChange);
  useEffect(() => { onResultChangeRef.current = onResultChange; }, [onResultChange]);
  const advance = () => { if (index < tasks.length - 1) { setIndex((value) => value + 1); setSelected(""); setState("idle"); onResultChangeRef.current?.(null); } else onResultChangeRef.current?.(allCorrect.current, selected); };
  const check = () => { if (!selected) return; if (selected === task.answer) { setState("correct"); if (index < tasks.length - 1) window.setTimeout(advance, 450); else onResultChangeRef.current?.(allCorrect.current, selected); } else { allCorrect.current = false; setState("wrong"); onResultChangeRef.current?.(false, selected); } };
  return <LessonTaskFrame eyebrow="Dział 7 · Liczby dodatnie i ujemne" heading={headingFor(activity)} description={descriptionFor(activity)} questionNumber={index + 1} questionCount={tasks.length}>
    {showTeacherNavigator ? <LessonTaskNavigator currentIndex={index} taskCount={tasks.length} onPrevious={() => goToTask(index - 1)} onNext={() => goToTask(index + 1)} showProgress={false} /> : null}
    <ActivityGuide activity={activity} />
    <section className={`rounded-3xl border-2 p-4 text-center sm:p-6 ${taskTone(activity)}`}><p className="text-lg font-black text-slate-900">{task.prompt}</p><div className="my-5">{task.model}</div>{task.hint ? <p className="text-sm font-bold text-indigo-700">{task.hint}</p> : null}</section>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{task.options.map((option) => <LessonTaskChoice key={option.value} selected={selected === option.value} disabled={readOnly || state !== "idle"} onClick={() => setSelected(option.value)} className="min-h-14 text-lg">{option.label}</LessonTaskChoice>)}</div>
    <button type="button" onClick={check} disabled={readOnly || !selected || state !== "idle"} className="mt-4 min-h-12 w-full rounded-2xl bg-cyan-300 px-4 font-black text-slate-950 disabled:opacity-40">Zatwierdź</button>
    {state === "correct" ? <p className="mt-3 rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-900">Dobrze!</p> : null}
    {state === "wrong" ? <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to <span className="inline-flex align-middle">{task.answerNode ?? task.options.find((o) => o.value === task.answer)?.label}</span>. Dziś bez punktu.</p><button type="button" onClick={advance} className="mt-3 rounded-xl bg-amber-300 px-4 py-2 font-black">Przejdź dalej bez punktu</button></div> : null}
  </LessonTaskFrame>;
}

function InputSeries({ tasks, activity, readOnly, onResultChange }: { tasks: InputTask[]; activity: Grade6SignedNumbersActivity; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [index, setIndex] = useState(0); const [value, setValue] = useState(""); const [state, setState] = useState<"idle" | "correct" | "wrong">("idle"); const allCorrect = useRef(true); const task = tasks[index];
  const showTeacherNavigator = readOnly || !onResultChange;
  const goToTask = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(tasks.length - 1, nextIndex)));
    setValue("");
    setState("idle");
  };
  const onResultChangeRef = useRef(onResultChange);
  useEffect(() => { onResultChangeRef.current = onResultChange; }, [onResultChange]);
  const normalized = (text: string) => text.replace(/,/g, ".").replace(/^\+/, "").replace(/\.0+$/, "");
  const advance = () => { if (index < tasks.length - 1) { setIndex((current) => current + 1); setValue(""); setState("idle"); onResultChangeRef.current?.(null); } else onResultChangeRef.current?.(allCorrect.current, value); };
  const check = () => { if (!value) return; if (Number(normalized(value)) === Number(normalized(task.answer))) { setState("correct"); if (index < tasks.length - 1) window.setTimeout(advance, 450); else onResultChangeRef.current?.(allCorrect.current, value); } else { allCorrect.current = false; setState("wrong"); onResultChangeRef.current?.(false, value); } };
  const press = (key: string) => { if (readOnly || state !== "idle") return; if (key === "delete") setValue((v) => v.slice(0, -1)); else if (key === "minus") setValue((v) => v.startsWith("-") ? v.slice(1) : `-${v}`); else if (key === "comma") setValue((v) => v.includes(",") ? v : `${v || "0"},`); else setValue((v) => `${v}${key}`); };
  return <LessonTaskFrame eyebrow="Dział 7 · Liczby dodatnie i ujemne" heading={headingFor(activity)} description={descriptionFor(activity)} questionNumber={index + 1} questionCount={tasks.length}>
    {showTeacherNavigator ? <LessonTaskNavigator currentIndex={index} taskCount={tasks.length} onPrevious={() => goToTask(index - 1)} onNext={() => goToTask(index + 1)} showProgress={false} /> : null}
    <ActivityGuide activity={activity} />
    <section className={`rounded-3xl border-2 p-4 text-center sm:p-6 ${taskTone(activity)}`}><p className="text-lg font-black text-slate-900">{task.prompt}</p><div className="my-5">{task.model}</div><label className="mx-auto flex max-w-sm items-center justify-center gap-2 text-lg font-black">Wynik <input value={value} inputMode="none" readOnly aria-label={`Odpowiedź do zadania ${index + 1}`} className="h-14 w-32 rounded-2xl border-2 border-violet-400 bg-white text-center text-2xl font-black" /></label></section>
    <div className="mt-4 rounded-3xl bg-slate-950 p-3"><p className="mb-2 text-center text-xs font-black uppercase tracking-widest text-cyan-200">Klawiatura do liczb dodatnich i ujemnych</p><div className="grid grid-cols-4 gap-2">{"1234567890".split("").map((digit) => <button type="button" key={digit} onClick={() => press(digit)} disabled={readOnly || state !== "idle"} className="min-h-11 rounded-xl bg-white font-black">{digit}</button>)}<button type="button" onClick={() => press("comma")} className="rounded-xl bg-cyan-200 font-black">, przecinek</button><button type="button" onClick={() => press("minus")} className="rounded-xl bg-violet-200 font-black">± znak</button><button type="button" onClick={() => press("delete")} className="rounded-xl bg-rose-300 font-black">← Usuń</button></div><button type="button" onClick={check} disabled={readOnly || !value || state !== "idle"} className="mt-2 min-h-12 w-full rounded-xl bg-cyan-300 font-black disabled:opacity-40">Zatwierdź</button></div>
    {state === "correct" ? <p className="mt-3 rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-900">Dobrze!</p> : null}
    {state === "wrong" ? <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {task.answerNode ?? task.answer}. Dziś bez punktu.</p><button type="button" onClick={advance} className="mt-3 rounded-xl bg-amber-300 px-4 py-2 font-black">Przejdź dalej bez punktu</button></div> : null}
  </LessonTaskFrame>;
}

function headingFor(activity: Grade6SignedNumbersActivity) {
  const map: Record<Grade6SignedNumbersActivity, string> = {
    "g6-number-sets": "Liczby naturalne, całkowite, dodatnie i ujemne", "g6-absolute-value": "Wartość bezwzględna liczby", "g6-number-line": "Liczby na osi liczbowej", "g6-select": "Liczby większe i mniejsze", "g6-compare": "Porównywanie liczb", "g6-opposites": "Liczby przeciwne",
    "g6-sign-rules": "Znaki przy nawiasach", "g6-add-different": "Dodawanie liczb o przeciwnych znakach", "g6-add-same": "Dodawanie liczb o tych samych znakach", "g6-subtract": "Odejmowanie liczb", "g6-axis": "Dodawanie i odejmowanie na osi", "g6-add-stories": "Dodawanie i odejmowanie w zadaniach",
    "g6-sign-table": "Znaki iloczynu i ilorazu", "g6-multiply": "Mnożenie liczb dodatnich i ujemnych", "g6-divide": "Dzielenie liczb dodatnich i ujemnych", "g6-cipher": "Szyfr działań", "g6-mul-stories": "Mnożenie i dzielenie w zadaniach",
    "g6-review-sets": "Porządkowanie i porównywanie", "g6-review-absolute": "Liczby przeciwne i wartość bezwzględna", "g6-review-operations": "Cztery działania", "g6-review-stories": "Zadania tekstowe", "g6-review-challenge": "Wyzwanie z kolejnością działań",
  }; return map[activity];
}

function descriptionFor(activity: Grade6SignedNumbersActivity) {
  if (activity === "g6-number-sets") return "Liczby naturalne to 0, 1, 2, 3… Liczby całkowite obejmują także ich ujemne odpowiedniki. Zero nie jest ani dodatnie, ani ujemne.";
  if (activity === "g6-absolute-value") return "Wartość bezwzględna liczby jest jej odległością od zera, dlatego nigdy nie jest ujemna.";
  if (activity === "g6-sign-rules") return "Plus obok minusa daje minus, a dwa minusy obok siebie dają plus.";
  if (activity === "g6-sign-table") return "Te same znaki dają wynik dodatni, a różne znaki dają wynik ujemny.";
  return "Rozwiąż serię zadań. Uzupełnij odpowiedź i zatwierdź ją przed przejściem dalej.";
}

export function Grade6SignedNumbersLessonLab({ activity, readOnly = false, onResultChange }: Props) {
  const choices = choiceTasks[activity];
  if (choices) return <ChoiceSeries key={activity} tasks={choices} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  const inputs = inputTasks[activity];
  if (inputs) return <InputSeries key={activity} tasks={inputs} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  return null;
}
