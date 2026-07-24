"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type DecimalMentalActivity = "add-sub" | "multiply-power" | "divide-shift" | "powers" | "story";
interface Props { activity: DecimalMentalActivity; seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answer?: string) => void; }
type Task = { expression: string; answer: string; hint: string; story?: string; fraction?: boolean };

const TASKS: Record<DecimalMentalActivity, Task[]> = {
  "add-sub": [
    { expression: "3,75 + 0,25", answer: "4", hint: "Dopełnij 0,75 do pełnej liczby." },
    { expression: "12,4 − 0,4", answer: "12", hint: "Odejmujesz cztery dziesiąte." },
    { expression: "5,6 + 2,4", answer: "8", hint: "Połącz części dziesiąte, aby otrzymać całość." },
    { expression: "10 − 3,75", answer: "6,25", hint: "Od pełnej liczby odejmij najpierw 3, a potem 0,75." },
    { expression: "18,05 − 0,05", answer: "18", hint: "Setne części się znoszą." },
    { expression: "7,25 + 1,75", answer: "9", hint: "Części setne tworzą jedną całość." },
  ],
  "multiply-power": [
    { expression: "0,6²", answer: "0,36", hint: "Potęga druga oznacza 0,6 · 0,6." },
    { expression: "0,07²", answer: "0,0049", hint: "Pomnóż 7 · 7 i ustaw cztery miejsca po przecinku." },
    { expression: "2,5 · 0,4", answer: "1", hint: "Cztery dziesiąte z 2,5 to jedna całość." },
    { expression: "1,2 · 0,5", answer: "0,6", hint: "Mnożenie przez 0,5 oznacza połowę." },
    { expression: "0,25 · 4", answer: "1", hint: "Cztery ćwiartki tworzą całość." },
    { expression: "0,8²", answer: "0,64", hint: "Osiem dziesiątych razy osiem dziesiątych." },
  ],
  powers: [
    { expression: "4³", answer: "64", hint: "4³ to 4 · 4 · 4 — liczba 4 występuje trzy razy." },
    { expression: "2⁴", answer: "16", hint: "2⁴ to 2 · 2 · 2 · 2." },
    { expression: "5³", answer: "125", hint: "Najpierw 5 · 5 = 25, potem 25 · 5." },
    { expression: "10⁶", answer: "1000000", hint: "Jedynka i sześć zer." },
    { expression: "0,5²", answer: "0,25", hint: "0,5 · 0,5 to jedna czwarta." },
    { expression: "0,2³", answer: "0,008", hint: "Dwie dziesiąte pomnóż trzy razy przez siebie." },
    { expression: "7²", answer: "49", hint: "Kwadrat liczby 7 to 7 · 7." },
    { expression: "9⁰", answer: "1", hint: "Każda liczba różna od zera podniesiona do potęgi zerowej daje 1." },
  ],
  "divide-shift": [
    { expression: "0,6 : 0,04", answer: "15", hint: "Pomnóż obie liczby przez 100: 60 : 4." , fraction: true },
    { expression: "4,8 : 0,6", answer: "8", hint: "Pomnóż obie liczby przez 10: 48 : 6.", fraction: true },
    { expression: "3,6 · 100", answer: "360", hint: "Przesuń przecinek o dwa miejsca w prawo." },
    { expression: "560 : 1000", answer: "0,56", hint: "Przesuń przecinek o trzy miejsca w lewo." },
    { expression: "7,2 : 10", answer: "0,72", hint: "Przesuń przecinek o jedno miejsce w lewo." },
    { expression: "0,45 · 1000", answer: "450", hint: "Przesuń przecinek o trzy miejsca w prawo." },
  ],
  story: [
    { expression: "", answer: "6", hint: "Najpierw oblicz cenę sześciu jednakowych soków.", story: "🥤 Sześć soków po 1,25 zł. Ile złotych trzeba zapłacić?" },
    { expression: "", answer: "0,75", hint: "Podziel długość wstążki przez cztery równe części.", story: "🎀 Wstążkę długości 3 m podzielono na 4 równe części. Ile metrów ma jedna część?" },
    { expression: "", answer: "2,4", hint: "Wykonaj odejmowanie: całość minus wykorzystana część.", story: "🧃 W dzbanku było 5 l lemoniady. Wypito 2,6 l. Ile litrów zostało?" },
    { expression: "", answer: "15", hint: "Podziel 4,5 l na porcje po 0,3 l.", story: "🍓 Z 4,5 l koktajlu nalewamy porcje po 0,3 l. Ile porcji otrzymamy?" },
  ],
};

const normalized = (value: string) => value.replace(".", ",").replace(/,0+$/u, "").replace(/(,\d*?)0+$/u, "$1");
function FractionDivision({ expression }: { expression: string }) { const [top, bottom] = expression.split(" : "); return <span className="inline-flex flex-col align-middle leading-none"><span className="border-b-2 border-current px-2 pb-1">{top}</span><span className="px-2 pt-1">{bottom}</span></span>; }

function DecimalLessonKeypad({ onKey, disabled }: { onKey: (key: string) => void; disabled: boolean }) {
  return <section aria-label="Kalkulator do rachunków pamięciowych" className="rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-3"><p className="mb-3 text-center text-xs font-black uppercase tracking-[.14em] text-indigo-800">Kalkulator do rachunków pamięciowych</p><div className="mx-auto grid max-w-md grid-cols-4 gap-2">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "separator", "0", "backspace"].map((key) => <button key={key} type="button" disabled={disabled} onClick={() => onKey(key)} className={`min-h-12 rounded-xl border-2 font-black disabled:opacity-35 ${key === "backspace" ? "border-rose-200 bg-rose-100 text-rose-950" : key === "separator" ? "border-cyan-200 bg-cyan-100 text-cyan-950" : "border-indigo-200 bg-white text-indigo-950"}`}>{key === "backspace" ? "← Usuń" : key === "separator" ? "," : key}</button>)}</div></section>;
}

export function DecimalMentalArithmeticModel({ activity, seed, taskSeed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const task = useMemo(() => {
    const index = questionNumber ? questionNumber - 1 : (taskSeed ?? seed);
    return TASKS[activity][index % TASKS[activity].length]!;
  }, [activity, questionNumber, seed, taskSeed]);
  const [answer, setAnswer] = useState("");
  const correct = normalized(answer) === task.answer;
  useEffect(() => { onResultChange?.(answer ? correct : null, answer); }, [answer, correct, onResultChange]);
  const onKey = (key: string) => setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "separator" ? (current.includes(",") ? current : `${current},`) : `${current}${key}`.slice(0, 8));
  return <LessonTaskFrame eyebrow="Dział 1 · Ułamki dziesiętne" heading={activity === "add-sub" ? "Dodawanie i odejmowanie w pamięci" : activity === "multiply-power" ? "Mnożenie i potęgowanie w pamięci" : activity === "divide-shift" ? "Dzielenie i przesuwanie przecinka" : activity === "powers" ? "Potęgowanie liczb" : "Zadania tekstowe"} description={task.hint} questionNumber={questionNumber} questionCount={questionCount} className="space-y-5" contentClassName="space-y-5">
    {task.story ? <div className="rounded-3xl bg-amber-50 p-6 text-center text-xl font-black text-amber-950 sm:text-2xl">{task.story}</div> : <div className="rounded-3xl bg-indigo-50 p-7 text-center text-4xl font-black text-indigo-950 sm:text-6xl">{task.fraction ? <FractionDivision expression={task.expression} /> : task.expression} = □</div>}
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4"><p className="text-sm font-bold text-slate-700">Wynik</p><input value={answer} readOnly inputMode="none" aria-label="Wynik działania" className="mt-2 h-14 w-full rounded-xl border-2 border-indigo-200 bg-slate-50 px-4 text-center text-2xl font-black text-indigo-950" />{!readOnly ? <div className="mt-3"><DecimalLessonKeypad onKey={onKey} disabled={readOnly} /></div> : null}</div>
  </LessonTaskFrame>;
}

export function decimalMentalActivityFromStageId(stageId: string): DecimalMentalActivity { if (stageId.includes("multiply-power")) return "multiply-power"; if (stageId.includes("divide-shift")) return "divide-shift"; if (stageId.includes("power-")) return "powers"; if (stageId.includes("story")) return "story"; return "add-sub"; }
