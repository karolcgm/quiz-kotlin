"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createPublicDecimalNaturalDivideL1Task,
  isDecimalNaturalDivideL1Activity,
  validateDecimalNaturalDivideL1Answer,
  type DecimalNaturalDivideL1Activity,
} from "@/lib/math/decimals/decimalNaturalDivideL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<DecimalNaturalDivideL1Activity, string> = {
  "decimal-natural-divide-mental": "Dzielenie w pamięci",
  "decimal-natural-divide-written": "Dzielenie pisemne",
};

function digitsOnly(value: string): string {
  return value.replace(",", "");
}

function commaIndex(value: string): number {
  const index = value.indexOf(",");
  return index === -1 ? value.length : index;
}

function DecimalBoxes({ value, digits, activeIndex, onSelect, label, readOnly = false }: {
  value: string;
  digits?: string[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  label: string;
  readOnly?: boolean;
}) {
  const rawDigits = digitsOnly(value);
  const separator = commaIndex(value);
  return <span className="flex items-end justify-end gap-1" aria-label={label}>
    {rawDigits.split("").map((digit, index) => <span key={`${digit}-${index}`} className="relative grid">
      {digits ? <button type="button" disabled={readOnly} onClick={() => onSelect?.(index)} aria-label={`${label}, kratka ${index + 1}`} className={`grid h-12 w-12 place-items-center rounded-lg border-2 bg-white font-mono text-2xl font-black text-slate-950 ${activeIndex === index ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`}>{digits[index] ?? ""}</button> : <span className="grid h-12 w-12 place-items-center rounded-lg border-2 border-emerald-700 bg-white font-mono text-2xl font-black text-slate-950">{digit}</span>}
      {separator === index + 1 ? <span className="absolute -right-2 bottom-0 z-10 text-3xl font-black text-slate-950" aria-label="przecinek">,</span> : null}
    </span>)}
  </span>;
}

function MentalExample() {
  return <section className="space-y-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5">
    <h3 className="text-xl font-black text-cyan-950">Proste dzielenie można wykonać w pamięci</h3>
    <div className="grid gap-3 md:grid-cols-3">
      <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">8,4 : 2</p>
      <p className="rounded-xl bg-white p-4 text-center font-black">84 dziesiąte : 2 = 42 dziesiąte</p>
      <p className="rounded-xl bg-white p-4 text-center text-2xl font-black">4,2</p>
    </div>
  </section>;
}

function WrittenExample() {
  return <section className="space-y-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <div><h3 className="text-xl font-black text-amber-950">Przykład poprawnego zapisu</h3><p className="mt-2 font-bold text-amber-950">Przecinek w ilorazie zapisujemy dokładnie nad przecinkiem w dzielnej. Gdy do dalszego dzielenia brakuje cyfry, po przecinku dopisujemy zero.</p></div>
    <div className="mx-auto grid w-fit grid-cols-[auto_auto] grid-rows-[auto_auto] rounded-2xl bg-white p-5 font-mono text-2xl font-black text-slate-950" aria-label="Przykład dzielenia pisemnego 4,2 przez 8">
      <div className="border-r-4 border-slate-950 px-3 py-2">4,2<span className="rounded bg-amber-100 px-1 text-amber-950">00</span><span className="ml-2 text-sm font-sans text-amber-950">dopisz 0 dwa razy</span></div>
      <div className="border-b-4 border-slate-950 px-3 py-2">8</div>
      <div className="border-r-4 border-slate-950 px-3 py-2 text-slate-500">42 : 8 = 5, reszta 2<br />20 : 8 = 2, reszta 4<br />40 : 8 = 5</div>
      <div className="px-3 py-2 text-indigo-700">0,525</div>
    </div>
    <p className="text-center font-black text-amber-950">4,2 : 8 = 0,525 — dzielenie kończymy bez reszty.</p>
  </section>;
}

export interface DecimalNaturalDivideL1LabProps {
  activity: DecimalNaturalDivideL1Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export { isDecimalNaturalDivideL1Activity };

export function DecimalNaturalDivideL1Lab(props: DecimalNaturalDivideL1LabProps) {
  return <DecimalNaturalDivideRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />;
}

function DecimalNaturalDivideRound({ activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: DecimalNaturalDivideL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalNaturalDivideL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const expectedDigits = digitsOnly(task.result);
  const [mentalAnswer, setMentalAnswer] = useState(readOnly ? task.result : "");
  const [resultDigits, setResultDigits] = useState<string[]>(() => readOnly ? expectedDigits.split("") : expectedDigits.split("").map(() => ""));
  const [activeResult, setActiveResult] = useState(0);
  const [appendedZeros, setAppendedZeros] = useState(readOnly ? task.appendedZeros : 0);
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);

  const clear = () => { setStatus(null); onResultChange?.(null); };
  const result = task.result.split("").reduce<{ text: string; index: number }>((state, character) => character === "," ? { ...state, text: `${state.text},` } : { text: `${state.text}${resultDigits[state.index] ?? ""}`, index: state.index + 1 }, { text: "", index: 0 }).text;
  const change = (key: string) => {
    if (readOnly) return;
    if (activity === "decimal-natural-divide-mental") {
      setMentalAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "," && current.includes(",") ? current : current.length < 9 ? `${current}${key}` : current);
    } else if (key !== ",") {
      setResultDigits((current) => current.map((digit, index) => index === activeResult ? key === "backspace" ? "" : key : digit));
      if (key !== "backspace") setActiveResult((index) => Math.min(expectedDigits.length - 1, index + 1));
    }
    clear();
  };
  const check = () => {
    const answer = activity === "decimal-natural-divide-mental" ? mentalAnswer : result;
    const correct = validateDecimalNaturalDivideL1Answer(task, answer) && (activity === "decimal-natural-divide-mental" || (resultDigits.every(Boolean) && appendedZeros === task.appendedZeros));
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, answer);
  };
  const displayDividend = `${task.dividend}${appendedZeros ? "0".repeat(appendedZeros) : ""}`;

  return <LessonTaskFrame
    className="space-y-5" contentClassName="space-y-5" eyebrow="Dział 5 · Ułamki dziesiętne" heading={TITLES[activity]}
    description={activity === "decimal-natural-divide-mental" ? "Oblicz proste ilorazy w pamięci." : "Zapisz przecinek nad przecinkiem dzielnej. Gdy jest potrzebna kolejna cyfra, dopisz zero po przecinku."}
    questionNumber={questionNumber} questionCount={questionCount} data-decimal-natural-divide-l1 data-decimal-activity={activity} data-seed={effectiveSeed} data-presentation-mode={presentationMode || undefined}
  >
    {activity === "decimal-natural-divide-mental" ? <MentalExample /> : <WrittenExample />}
    <section className="space-y-5 rounded-2xl border-2 border-indigo-100 bg-white p-5">
      {activity === "decimal-natural-divide-mental" ? <>
        <p className="text-center text-3xl font-black text-slate-950">{task.dividend} : {task.divisor} =</p>
        <button type="button" disabled={readOnly} onClick={() => clear()} className="mx-auto grid min-h-14 w-40 place-items-center rounded-xl border-2 border-slate-400 bg-white px-3 text-3xl font-black text-slate-950" aria-label="Wynik dzielenia w pamięci">{mentalAnswer}</button>
      </> : <>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-amber-50 p-3 font-black text-amber-950"><span>Gdy brakuje cyfry po przecinku:</span><button type="button" disabled={readOnly || appendedZeros >= task.appendedZeros} onClick={() => { setAppendedZeros((count) => count + 1); clear(); }} className="rounded-xl border-2 border-amber-500 bg-white px-4 py-2">Dopisz 0</button><span>Dopisano: {appendedZeros}</span></div>
        <div className="mx-auto grid w-fit grid-cols-[auto_auto] grid-rows-[auto_auto] font-mono text-slate-950" aria-label={`Dzielenie pisemne ${task.dividend} przez ${task.divisor}`}>
          <div className="border-r-4 border-slate-950 px-3 py-3"><DecimalBoxes value={displayDividend} label="Dzielna" readOnly /></div>
          <div className="border-b-4 border-slate-950 px-3 py-3 text-3xl font-black">{task.divisor}</div>
          <div className="min-h-24 border-r-4 border-slate-950 px-3 py-3 text-sm font-bold text-slate-500">Dziel kolejne cyfry.<br />Po przecinku możesz dopisać zera.</div>
          <div className="px-3 py-3"><DecimalBoxes value={task.result} digits={resultDigits} activeIndex={activeResult} onSelect={setActiveResult} label="Iloraz" readOnly={readOnly} /></div>
        </div>
        <p className="text-center font-bold text-indigo-950">Przecinek w ilorazie stoi nad przecinkiem dzielnej.</p>
      </>}
      {!readOnly ? <LessonNumericKeypad allowSeparator={activity === "decimal-natural-divide-mental"} onKey={change} onConfirm={check} label={activity === "decimal-natural-divide-mental" ? "Kalkulator do dzielenia w pamięci" : "Kalkulator do dzielenia pisemnego"} helperText={activity === "decimal-natural-divide-mental" ? "Wpisz wynik i zatwierdź." : "Uzupełnij iloraz. Jeśli trzeba, dopisz zero po przecinku w dzielnej."} /> : null}
      {status ? <p role="status" className={`rounded-xl p-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? `Dobrze! ${task.dividend} : ${task.divisor} = ${task.result}.` : "Sprawdź iloraz, przecinek oraz liczbę dopisanych zer."}</p> : null}
    </section>
  </LessonTaskFrame>;
}
