"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createDecimalReviewTask,
  isDecimalReviewActivity,
  type DecimalReviewActivity,
  type DecimalReviewTask,
} from "@/lib/math/decimals/decimalReview";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface Props {
  activity: DecimalReviewActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

const TITLES: Record<DecimalReviewActivity, string> = {
  "decimal-review-notation": "Zapis, zamiana i oś liczbowa",
  "decimal-review-compare-units": "Porównywanie i jednostki",
  "decimal-review-add-sub": "Dodawanie i odejmowanie",
  "decimal-review-multiply-divide": "Mnożenie i dzielenie",
  "decimal-review-fraction-percent": "Ułamki, procenty i szacowanie",
  "decimal-review-problems": "Zadania tekstowe",
};

type FieldId = "answer" | "numerator" | "denominator" | "left" | "right" | "result";

function normalizeDecimal(value: string): number | null {
  const normalized = value.trim().replace(/\s/gu, "").replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/u.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function decimalMatches(value: string, expected: string): boolean {
  const left = normalizeDecimal(value);
  const right = normalizeDecimal(expected);
  return left !== null && right !== null && Math.abs(left - right) < 1e-9;
}

function StackedFraction({ numerator, denominator }: { numerator: string | number; denominator: string | number }) {
  return <span className="inline-grid min-w-12 grid-rows-2 text-center text-2xl font-black leading-none" aria-label={`${numerator || "puste"} przez ${denominator || "puste"}`}>
    <span className="border-b-2 border-current px-2 pb-1">{numerator || "□"}</span>
    <span className="px-2 pt-1">{denominator || "□"}</span>
  </span>;
}

const STORY_PICTURE_SOURCES: Record<Extract<DecimalReviewTask, { kind: "story" }>["illustration"], string> = {
  ribbon: "/lessons/illustrations/decimals/review/review-ribbon.png",
  apples: "/lessons/illustrations/decimals/review/review-apples.png",
  bottles: "/lessons/illustrations/decimals/review/review-bottles.png",
  fabric: "/lessons/illustrations/decimals/review/review-fabric.png",
  bags: "/lessons/illustrations/decimals/review/review-bags.png",
};

const STORY_PICTURE_LABELS: Record<Extract<DecimalReviewTask, { kind: "story" }>["illustration"], string> = {
  ribbon: "Rolka i sześć równych kawałków fioletowej wstążki",
  apples: "Dwie skrzynki wypełnione jabłkami",
  bottles: "Dwanaście jednakowych butelek soku",
  fabric: "Rolka materiału i odcięty fragment tkaniny",
  bags: "Osiem równych opakowań kaszy",
};

function StoryIllustration({ kind }: { kind: Extract<DecimalReviewTask, { kind: "story" }>["illustration"] }) {
  return <div className="relative mx-auto aspect-[5/2] w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-white bg-slate-100 shadow-md">
    <Image
      src={STORY_PICTURE_SOURCES[kind]}
      alt={STORY_PICTURE_LABELS[kind]}
      aria-label={STORY_PICTURE_LABELS[kind]}
      fill
      sizes="(min-width: 1024px) 768px, 100vw"
      className="object-cover"
    />
  </div>;
}

function NumberLine({ task }: { task: Extract<DecimalReviewTask, { kind: "number-line" }> }) {
  return <svg viewBox="0 0 760 180" role="img" aria-label="Oś liczbowa od zera do jedności z punktami A, B, C i D" className="mx-auto w-full max-w-4xl">
    <line x1="70" y1="92" x2="700" y2="92" stroke="#334155" strokeWidth="5" />
    <path d="M700 92 l-18 -12 v24 z" fill="#334155" />
    {Array.from({ length: 11 }, (_, index) => {
      const x = 70 + index * 60;
      return <line key={index} x1={x} y1="78" x2={x} y2="106" stroke="#64748b" strokeWidth="3" />;
    })}
    <text x="70" y="140" textAnchor="middle" fontSize="24" fontWeight="800" fill="#0f172a">0</text>
    <text x="670" y="140" textAnchor="middle" fontSize="24" fontWeight="800" fill="#0f172a">1</text>
    {task.points.map((point) => {
      const x = 70 + point.position * 600;
      return <g key={point.label}><circle cx={x} cy="92" r="10" fill="#7c3aed" /><text x={x} y="55" textAnchor="middle" fontSize="27" fontWeight="900" fill="#4c1d95">{point.label}</text></g>;
    })}
  </svg>;
}

function AnswerField({ label, value, active, disabled, onClick, unit }: { label: string; value: string; active: boolean; disabled: boolean; onClick: () => void; unit?: string }) {
  return <button type="button" disabled={disabled} onClick={onClick} aria-label={label} aria-pressed={active} className={`inline-flex min-h-16 min-w-24 items-center justify-center rounded-2xl border-3 bg-white px-4 text-3xl font-black shadow-sm ${active ? "border-violet-700 ring-4 ring-violet-200" : "border-slate-300"} disabled:cursor-default`}>
    {value || "□"}{unit ? <span className="ml-2 text-xl">{unit}</span> : null}
  </button>;
}

function initialFields(task: DecimalReviewTask, readOnly: boolean): Record<FieldId, string> {
  return {
    answer: readOnly && task.kind === "numeric" ? task.answer : "",
    numerator: readOnly && task.kind === "fraction" ? String(task.numerator) : "",
    denominator: readOnly && task.kind === "fraction" ? String(task.denominator) : "",
    left: readOnly && task.kind === "story" ? task.left : "",
    right: readOnly && task.kind === "story" ? task.right : "",
    result: readOnly && task.kind === "story" ? task.answer : "",
  };
}

export function DecimalReviewLab({ activity, seed, taskSeed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createDecimalReviewTask(activity, effectiveSeed), [activity, effectiveSeed]);
  const [fields, setFields] = useState<Record<FieldId, string>>(() => initialFields(task, readOnly));
  const [activeField, setActiveField] = useState<FieldId>(task.kind === "fraction" ? "numerator" : task.kind === "story" ? "left" : "answer");
  const expectedChoice = task.kind === "choice" || task.kind === "sign" || task.kind === "number-line" ? task.answer : "";
  const [selection, setSelection] = useState(readOnly ? expectedChoice : "");
  const [operator, setOperator] = useState<"+" | "−" | "·" | ":" | "">(readOnly && task.kind === "story" ? task.operator : "");
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);

  const clearResult = () => {
    setStatus(null);
    onResultChange?.(null);
  };

  const updateField = (key: string) => {
    if (readOnly) return;
    setFields((current) => {
      const value = current[activeField];
      if (key === "backspace") return { ...current, [activeField]: value.slice(0, -1) };
      if (key === "," && (value.includes(",") || activeField === "numerator" || activeField === "denominator")) return current;
      if (value.length >= 7) return current;
      return { ...current, [activeField]: `${value}${key}` };
    });
    clearResult();
  };

  const choose = (value: string) => {
    if (readOnly) return;
    setSelection(value);
    clearResult();
  };

  const check = () => {
    let correct = false;
    let answerLabel = "";
    if (task.kind === "numeric") {
      correct = decimalMatches(fields.answer, task.answer);
      answerLabel = fields.answer || "brak";
    } else if (task.kind === "fraction") {
      correct = Number(fields.numerator) === task.numerator && Number(fields.denominator) === task.denominator;
      answerLabel = `${fields.numerator || "□"} przez ${fields.denominator || "□"}`;
    } else if (task.kind === "story") {
      correct = decimalMatches(fields.left, task.left) && operator === task.operator && decimalMatches(fields.right, task.right) && decimalMatches(fields.result, task.answer);
      answerLabel = `${fields.left || "□"} ${operator || "□"} ${fields.right || "□"} = ${fields.result || "□"} ${task.unit}`;
    } else {
      correct = selection === task.answer;
      answerLabel = selection || "brak";
    }
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, answerLabel);
  };

  const hasKeypad = task.kind === "numeric" || task.kind === "fraction" || task.kind === "story";
  const allowSeparator = activeField !== "numerator" && activeField !== "denominator";

  return <LessonTaskFrame eyebrow="Dział 5 · Powtórzenie" heading={TITLES[activity]} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount} contentClassName="space-y-5" data-decimal-review data-review-activity={activity} data-task-kind={task.kind} data-seed={effectiveSeed}>
    {task.kind === "numeric" ? <div className="space-y-5 text-center">
      {task.fractionExpression ? <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-indigo-50 p-5 text-3xl font-black">
        {task.fractionExpression.fractionFirst ? <><StackedFraction numerator={task.fractionExpression.numerator} denominator={task.fractionExpression.denominator} /><span>{task.fractionExpression.operator}</span><span>{task.fractionExpression.decimal}</span></> : <><span>{task.fractionExpression.decimal}</span><span>{task.fractionExpression.operator}</span><StackedFraction numerator={task.fractionExpression.numerator} denominator={task.fractionExpression.denominator} /></>}
        <span>=</span>
      </div> : <p className="rounded-2xl bg-indigo-50 p-5 text-3xl font-black tracking-wide">{task.expression}</p>}
      <AnswerField label="Wynik" value={fields.answer} active disabled={readOnly} onClick={() => setActiveField("answer")} unit={task.unit} />
    </div> : null}

    {task.kind === "fraction" ? <div className="flex flex-wrap items-center justify-center gap-5 rounded-2xl bg-indigo-50 p-6 text-3xl font-black">
      <span>{task.decimal}</span><span>=</span>
      <span className="inline-grid min-w-20 grid-rows-2 text-center leading-none">
        <button type="button" disabled={readOnly} aria-label="Licznik ułamka" aria-pressed={activeField === "numerator"} onClick={() => setActiveField("numerator")} className={`min-h-14 border-b-3 border-slate-900 px-3 ${activeField === "numerator" ? "bg-violet-100" : "bg-white"}`}>{fields.numerator || "□"}</button>
        <button type="button" disabled={readOnly} aria-label="Mianownik ułamka" aria-pressed={activeField === "denominator"} onClick={() => setActiveField("denominator")} className={`min-h-14 px-3 ${activeField === "denominator" ? "bg-violet-100" : "bg-white"}`}>{fields.denominator || "□"}</button>
      </span>
    </div> : null}

    {task.kind === "choice" ? <div className="space-y-4">
      {task.expression ? <p className="rounded-2xl bg-indigo-50 p-5 text-center text-2xl font-black">{task.expression}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">{task.choices.map((choice) => <LessonTaskChoice key={choice} type="button" selected={selection === choice} disabled={readOnly} onClick={() => choose(choice)} className="min-h-14 text-base">{choice}</LessonTaskChoice>)}</div>
    </div> : null}

    {task.kind === "sign" ? <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-5 rounded-2xl bg-indigo-50 p-6 text-3xl font-black"><span>{task.left}</span><span className="min-w-14 text-center text-violet-800">{selection || "□"}</span><span>{task.right}</span></div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">{["<", ">", "="].map((sign) => <LessonTaskChoice key={sign} type="button" selected={selection === sign} disabled={readOnly} onClick={() => choose(sign)} className="min-h-14 text-2xl">{sign}</LessonTaskChoice>)}</div>
    </div> : null}

    {task.kind === "number-line" ? <div className="space-y-4">
      <p className="text-center text-3xl font-black text-violet-900">Liczba: {task.target}</p>
      <NumberLine task={task} />
      <div className="mx-auto grid max-w-2xl grid-cols-4 gap-3">{task.points.map((point) => <LessonTaskChoice key={point.label} type="button" selected={selection === point.label} disabled={readOnly} onClick={() => choose(point.label)} className="min-h-14 text-xl">{point.label}</LessonTaskChoice>)}</div>
    </div> : null}

    {task.kind === "story" ? <div className="space-y-5">
      <StoryIllustration kind={task.illustration} />
      <p className="rounded-2xl bg-amber-50 p-5 text-xl font-black leading-relaxed text-amber-950">{task.story}</p>
      <section className="space-y-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4" aria-label="Zapis działania">
        <p className="text-center text-sm font-black uppercase tracking-wider text-indigo-900">Działanie</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AnswerField label="Pierwsza liczba działania" value={fields.left} active={activeField === "left"} disabled={readOnly} onClick={() => setActiveField("left")} />
          <span className="text-3xl font-black">{operator || "□"}</span>
          <AnswerField label="Druga liczba działania" value={fields.right} active={activeField === "right"} disabled={readOnly} onClick={() => setActiveField("right")} />
          <span className="text-3xl font-black">=</span>
          <AnswerField label="Wynik działania" value={fields.result} active={activeField === "result"} disabled={readOnly} onClick={() => setActiveField("result")} />
        </div>
        {!readOnly ? <div className="mx-auto grid max-w-md grid-cols-4 gap-2" aria-label="Wybierz znak działania">{(["+", "−", "·", ":"] as const).map((sign) => <LessonTaskChoice key={sign} type="button" selected={operator === sign} onClick={() => { setOperator(sign); clearResult(); }} className="min-h-12 text-xl">{sign}</LessonTaskChoice>)}</div> : null}
      </section>
      <p className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center text-lg font-black text-emerald-950">Odpowiedź: <span className="inline-block min-w-24 border-b-2 border-emerald-800 px-2">{fields.result || ""}</span> {task.unit}</p>
    </div> : null}

    {hasKeypad && !readOnly ? <LessonNumericKeypad onKey={updateField} onConfirm={check} allowSeparator={allowSeparator} label="Kalkulator do powtórzenia" helperText={task.kind === "story" ? "Kliknij wybraną kratkę działania, a następnie wpisz liczbę." : "Wpisz odpowiedź i zatwierdź ją jeden raz na końcu."} /> : null}
    {!hasKeypad && !readOnly ? <button type="button" onClick={check} className="mx-auto block min-h-12 rounded-xl bg-slate-950 px-7 font-black text-white">Zatwierdź</button> : null}
    {status ? <p role="status" className={`rounded-2xl p-4 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? "Dobrze! Przechodzisz do kolejnego zadania." : task.kind === "story" ? "Sprawdź, które liczby z treści trzeba wykorzystać, wybierz działanie i popraw wynik." : task.kind === "fraction" ? "Sprawdź zamianę i skróć ułamek do postaci nieskracalnej." : "Sprawdź zapis, położenie przecinka i sens wyniku."}</p> : null}
  </LessonTaskFrame>;
}

export { isDecimalReviewActivity };
