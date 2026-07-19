"use client";

import { useMemo, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createPublicDecimalNaturalMultiplyL1Task,
  decimalNaturalMultiplyExpectedAnswer,
  isDecimalNaturalMultiplyL1Activity,
  validateDecimalNaturalMultiplyAnswer,
  type DecimalNaturalMultiplyL1Activity,
} from "@/lib/math/decimals/decimalNaturalMultiplyL1";
import { createDecimalDiagnosticResult } from "@/lib/math/decimals/decimalDiagnostics";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<DecimalNaturalMultiplyL1Activity, string> = {
  "decimal-natural-mental": "Mnożenie w pamięci",
  "decimal-natural-written": "Mnożenie pisemne",
  "decimal-natural-story": "Zadania tekstowe",
};

function MentalExample() {
  return <section className="space-y-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5">
    <h3 className="text-xl font-black text-cyan-950">Możemy mnożyć w pamięci</h3>
    <p className="font-bold text-cyan-950">Najpierw mnożymy całości, potem części dziesiąte. Na końcu łączymy wyniki.</p>
    <div className="grid gap-3 md:grid-cols-3">
      <p className="rounded-xl bg-white p-3 text-center text-lg font-black">2,3 · 4</p>
      <p className="rounded-xl bg-white p-3 text-center font-bold"><span className="text-indigo-700">2 · 4 = 8</span><br /><span className="text-emerald-700">0,3 · 4 = 1,2</span></p>
      <p className="rounded-xl bg-white p-3 text-center text-lg font-black">8 + 1,2 = 9,2</p>
    </div>
  </section>;
}

function StoryMultiplyPicture({ kind, count }: { kind: "bottles" | "ribbons" | "tickets" | "apples"; count: number }) {
  const colors = {
    bottles: { fill: "#67e8f9", stroke: "#0e7490" },
    ribbons: { fill: "#f9a8d4", stroke: "#be185d" },
    tickets: { fill: "#fde68a", stroke: "#b45309" },
    apples: { fill: "#fca5a5", stroke: "#b91c1c" },
  }[kind];
  return <svg viewBox="0 0 260 180" role="img" aria-label={`Ilustracja do zadania: ${count} jednakowych elementów`} className="mx-auto h-auto w-full max-w-[260px]">
    <rect x="4" y="4" width="252" height="172" rx="24" fill="#ffffff" stroke="#6ee7b7" strokeWidth="4" />
    {Array.from({ length: Math.min(count, 6) }, (_, index) => {
      const x = 30 + (index % 3) * 76;
      const y = 35 + Math.floor(index / 3) * 76;
      if (kind === "bottles") return <g key={index} transform={`translate(${x} ${y})`}><path d="M18 0h18v12l8 10v38H10V22l8-10z" fill={colors.fill} stroke={colors.stroke} strokeWidth="3" /><path d="M13 32h28" stroke={colors.stroke} strokeWidth="3" /></g>;
      if (kind === "ribbons") return <g key={index} transform={`translate(${x + 4} ${y + 4})`}><path d="M12 10c24-20 48 18 20 32C6 55 2 26 22 20c22-6 32 24 12 42" fill="none" stroke={colors.stroke} strokeWidth="8" strokeLinecap="round" /><circle cx="20" cy="20" r="8" fill={colors.fill} /></g>;
      if (kind === "tickets") return <g key={index} transform={`translate(${x - 2} ${y + 10}) rotate(-8 30 20)`}><path d="M0 4a8 8 0 0 0 8-4h48a8 8 0 0 0 8 4v36a8 8 0 0 0-8 4H8a8 8 0 0 0-8-4z" fill={colors.fill} stroke={colors.stroke} strokeWidth="3" /><path d="M32 4v36" stroke={colors.stroke} strokeWidth="2" strokeDasharray="4 4" /></g>;
      return <g key={index} transform={`translate(${x + 4} ${y + 5})`}><circle cx="25" cy="28" r="22" fill={colors.fill} stroke={colors.stroke} strokeWidth="3" /><path d="M25 7c0-10 8-12 14-12" fill="none" stroke="#166534" strokeWidth="4" /><path d="M28 2c10-7 18-1 18 6-9 2-15 0-18-6z" fill="#86efac" stroke="#166534" strokeWidth="2" /></g>;
    })}
  </svg>;
}

function WrittenExample() {
  return <section className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <h3 className="text-xl font-black text-amber-950">Przykład poprawnego zapisu</h3>
    <p className="font-bold text-amber-950">Mnożymy jak liczby naturalne. W wyniku zapisujemy przecinek tak, aby zostały dwie cyfry po przecinku — tyle, ile było w liczbie 2,35.</p>
    <div className="mx-auto w-48 font-mono text-3xl font-black text-slate-950" aria-label="Przykład mnożenia pisemnego 2,35 razy 3">
      <p className="text-right">2,35</p>
      <p className="text-right">·&nbsp;&nbsp;&nbsp;3</p>
      <div className="my-1 border-t-4 border-solid border-slate-950" aria-hidden />
      <p className="text-right">7,05</p>
    </div>
  </section>;
}

function WrittenResultBoxes({
  expected,
  columnCount,
  digits,
  activeIndex,
  onSelect,
}: {
  expected: string;
  columnCount: number;
  digits: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  let digitIndex = -1;
  const characters = [...expected.padStart(columnCount, " ")];
  return <div
    className="grid justify-end"
    style={{ gridTemplateColumns: `repeat(${columnCount}, 3rem)` }}
    aria-label="Puste kratki wyniku"
    data-written-column-grid
  >
    {characters.map((character, index) => {
      if (character === " ") return <span key={`empty-${index}`} aria-hidden />;
      if (character === ",") return <span key={`${character}-${index}`} className="grid h-12 w-12 place-items-center text-3xl font-black" aria-label="przecinek">,</span>;
      digitIndex += 1;
      const current = digitIndex;
      return <button
        key={`digit-${current}`}
        type="button"
        onClick={() => onSelect(current)}
        className={`mx-auto grid h-12 w-12 place-items-center rounded-lg border-2 bg-white text-2xl font-black text-slate-950 ${activeIndex === current ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`}
        aria-label={`Kratka ${current + 1} wyniku`}
      >
        {digits[current] || ""}
      </button>;
    })}
  </div>;
}

function WrittenCarryBoxes({
  factor,
  columnCount,
  digits,
  activeIndex,
  onSelect,
}: {
  factor: string;
  columnCount: number;
  digits: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  let digitIndex = -1;
  const characters = [...factor.padStart(columnCount, " ")];
  return <div
    className="grid justify-end"
    style={{ gridTemplateColumns: `repeat(${columnCount}, 3rem)` }}
    aria-label="Małe kratki nad działaniem"
    data-written-column-grid
  >
    {characters.map((character, index) => {
      if (character === " " || character === ",") return <span key={`carry-empty-${index}`} aria-hidden />;
      digitIndex += 1;
      const current = digitIndex;
      return <button
      key={current}
      type="button"
      onClick={() => onSelect(current)}
      className={`mx-auto grid h-7 w-7 place-items-center rounded border-2 bg-amber-50 text-sm font-black text-slate-950 ${activeIndex === current ? "border-indigo-600 ring-2 ring-indigo-100" : "border-amber-400"}`}
      aria-label={`Mała kratka ${current + 1} nad działaniem`}
    >
      {digits[current] || ""}
    </button>;
    })}
  </div>;
}

function WrittenTextRow({ value, columnCount, label }: { value: string; columnCount: number; label: string }) {
  return <div
    className="grid justify-end"
    style={{ gridTemplateColumns: `repeat(${columnCount}, 3rem)` }}
    aria-label={label}
    data-written-column-grid
  >
    {[...value.padStart(columnCount, " ")].map((character, index) => <span key={`${character}-${index}`} className="grid h-12 w-12 place-items-center text-3xl font-black">
      {character === " " ? null : character}
    </span>)}
  </div>;
}

export interface DecimalNaturalMultiplyL1LabProps {
  activity: DecimalNaturalMultiplyL1Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export { isDecimalNaturalMultiplyL1Activity };

export function DecimalNaturalMultiplyL1Lab(props: DecimalNaturalMultiplyL1LabProps) {
  return <DecimalNaturalMultiplyRound key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />;
}

function DecimalNaturalMultiplyRound({
  activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange,
}: DecimalNaturalMultiplyL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicDecimalNaturalMultiplyL1Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const expectedAnswer = decimalNaturalMultiplyExpectedAnswer(task);
  const writtenColumnCount = Math.max(task.decimalFactor.length, expectedAnswer.length, String(task.naturalFactor).length + 1);
  const [answer, setAnswer] = useState(readOnly ? decimalNaturalMultiplyExpectedAnswer(task) : "");
  const [storyAnswer, setStoryAnswer] = useState(readOnly ? expectedAnswer : "");
  const [writtenDigits, setWrittenDigits] = useState<string[]>(() => readOnly ? [...expectedAnswer].filter((character) => character !== ",") : [...expectedAnswer].filter((character) => character !== ",").map(() => ""));
  const [activeWrittenDigit, setActiveWrittenDigit] = useState(0);
  const [carryDigits, setCarryDigits] = useState<string[]>(() => task.decimalFactor.replace(",", "").split("").map(() => ""));
  const [activeCarryDigit, setActiveCarryDigit] = useState(0);
  const [activeField, setActiveField] = useState<"result" | "carry" | "answer">("result");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [success, setSuccess] = useState(false);
  const checkAnswer = () => {
    const writtenAnswer = [...expectedAnswer].reduce<{ result: string; index: number }>((state, character) => character === ","
      ? { ...state, result: `${state.result},` }
      : { result: `${state.result}${writtenDigits[state.index] ?? ""}`, index: state.index + 1 }, { result: "", index: 0 }).result;
    const result = validateDecimalNaturalMultiplyAnswer({ task, answer: activity === "decimal-natural-mental" ? answer : writtenAnswer });
    const storyResult = activity === "decimal-natural-story"
      ? validateDecimalNaturalMultiplyAnswer({ task, answer: storyAnswer })
      : null;
    const correct = result.correct && (storyResult?.correct ?? true);
    setDiagnosticCode(result.code);
    if (result.correct && storyResult && !storyResult.correct) setDiagnosticCode(storyResult.code);
    setSuccess(correct);
    onResultChange?.(correct, activity === "decimal-natural-story" ? `${storyAnswer || "brak odpowiedzi"} ${task.answerUnit}` : result.answerLabel);
  };
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, { memberIds: ["decimal-natural-result"] }) : null;
  const updateWrittenDigit = (digit: string) => {
    if (readOnly) return;
    if (activeField === "answer") {
      setStoryAnswer((current) => {
        if (digit === "backspace") return current.slice(0, -1);
        if (digit === "," && current.includes(",")) return current;
        return current.length < 8 ? `${current}${digit}` : current;
      });
      setDiagnosticCode(null); setSuccess(false); onResultChange?.(null);
      return;
    }
    if (digit === ",") return;
    if (activeField === "carry") {
      setCarryDigits((current) => current.map((value, index) => index === activeCarryDigit ? (digit === "backspace" ? "" : digit) : value));
      if (digit !== "backspace") setActiveCarryDigit((index) => Math.min(carryDigits.length - 1, index + 1));
      else setActiveCarryDigit((index) => Math.max(0, index - 1));
      setDiagnosticCode(null); setSuccess(false); onResultChange?.(null);
      return;
    }
    if (digit === "backspace") {
      setWrittenDigits((current) => current.map((value, index) => index === activeWrittenDigit ? "" : value));
      setActiveWrittenDigit((index) => Math.max(0, index - 1));
    } else {
      setWrittenDigits((current) => current.map((value, index) => index === activeWrittenDigit ? digit : value));
      setActiveWrittenDigit((index) => Math.min(writtenDigits.length - 1, index + 1));
    }
    setDiagnosticCode(null); setSuccess(false); onResultChange?.(null);
  };
  const updateMentalAnswer = (key: string) => {
    if (readOnly) return;
    setAnswer((current) => {
      if (key === "backspace") return current.slice(0, -1);
      if (key === "," && current.includes(",")) return current;
      return current.length < 8 ? `${current}${key}` : current;
    });
    setDiagnosticCode(null);
    setSuccess(false);
    onResultChange?.(null);
  };

  return <LessonTaskFrame
    className="space-y-5"
    contentClassName="space-y-5"
    eyebrow="Dział 5 · Ułamki dziesiętne"
    heading={TITLES[activity]}
    description={activity === "decimal-natural-mental"
      ? "Najpierw zobacz sposób liczenia w pamięci, a potem wykonuj działania jedno po drugim."
      : activity === "decimal-natural-story"
        ? "Przeczytaj zadanie, wykonaj mnożenie pisemne i zapisz odpowiedź z jednostką."
        : "Najpierw zobacz poprawny zapis pisemny, a potem rozwiąż kolejne działania."}
    questionNumber={questionNumber}
    questionCount={questionCount}
    data-decimal-natural-multiply-l1
    data-decimal-activity={activity}
    data-generator-id={task.generatorId}
    data-seed={effectiveSeed}
    data-presentation-mode={presentationMode || undefined}
    data-answer-spec="server-only"
  >
    {activity === "decimal-natural-mental" ? <MentalExample /> : activity === "decimal-natural-written" ? <WrittenExample /> : null}
    {activity === "decimal-natural-story" && task.story && task.storyQuestion && task.answerUnit && task.pictureKind ? <section className="grid gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
      <div className="space-y-3">
        <h3 className="text-xl font-black text-emerald-950">Przeczytaj zadanie</h3>
        <p className="text-lg font-bold leading-relaxed text-emerald-950">{task.story}</p>
        <p className="text-lg font-black text-emerald-950">{task.storyQuestion}</p>
      </div>
      <StoryMultiplyPicture kind={task.pictureKind} count={task.naturalFactor} />
    </section> : null}
    <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-5">
      {activity !== "decimal-natural-mental" ? <>
        {activity === "decimal-natural-story" ? <h3 className="text-center text-xl font-black text-slate-950">Schemat rozwiązania</h3> : null}
        <div className="mx-auto w-fit font-mono text-slate-950" aria-label={`Mnożenie pisemne ${task.decimalFactor} razy ${task.naturalFactor}`}>
          <WrittenCarryBoxes
            factor={task.decimalFactor}
            columnCount={writtenColumnCount}
            digits={carryDigits}
            activeIndex={activeField === "carry" ? activeCarryDigit : -1}
            onSelect={(index) => { setActiveCarryDigit(index); setActiveField("carry"); }}
          />
          <WrittenTextRow value={task.decimalFactor} columnCount={writtenColumnCount} label={`Liczba ${task.decimalFactor}`} />
          <WrittenTextRow value={`·${task.naturalFactor}`} columnCount={writtenColumnCount} label={`razy ${task.naturalFactor}`} />
          <div className="my-2 border-t-4 border-solid border-slate-950" aria-hidden />
          <WrittenResultBoxes expected={expectedAnswer} columnCount={writtenColumnCount} digits={writtenDigits} activeIndex={activeField === "result" ? activeWrittenDigit : -1} onSelect={(index) => { setActiveWrittenDigit(index); setActiveField("result"); }} />
        </div>
        {activity === "decimal-natural-story" ? <button
          type="button"
          disabled={readOnly}
          onClick={() => setActiveField("answer")}
          className={`mx-auto flex min-h-14 max-w-md items-center justify-center gap-3 rounded-xl border-2 bg-emerald-50 px-4 text-lg font-black text-emerald-950 ${activeField === "answer" ? "border-emerald-700 ring-4 ring-emerald-100" : "border-emerald-300"}`}
          aria-label="Odpowiedź do zadania tekstowego"
        >
          <span>Odpowiedź:</span>
          <span className="min-w-24 rounded-lg bg-white px-3 py-1 text-2xl tabular-nums">{storyAnswer}</span>
          <span>{task.answerUnit}</span>
        </button> : null}
        {!readOnly ? <LessonNumericKeypad
          allowSeparator={activity === "decimal-natural-story"}
          onKey={updateWrittenDigit}
          onConfirm={checkAnswer}
          label={activity === "decimal-natural-story" ? "Kalkulator do rozwiązania zadania" : "Kalkulator do mnożenia pisemnego"}
          helperText={activeField === "carry"
            ? "Wpisujesz cyfrę w małej kratce. Potem wybierz kratkę wyniku."
            : activeField === "answer"
              ? "Wpisujesz pełną odpowiedź liczbową. Jednostka jest już podana."
              : "Wpisujesz wynik. Małe kratki nad liczbą służą do zapisu przeniesień."}
        /> : null}
      </> : <>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-indigo-50 p-4" aria-label={`Działanie ${task.decimalFactor} razy ${task.naturalFactor}`}>
          <span className="text-3xl font-black text-slate-950">{task.decimalFactor} · {task.naturalFactor} =</span>
          <output
            aria-label="Wynik działania w pamięci"
            className="grid min-h-14 w-32 place-items-center rounded-xl border-2 border-slate-400 bg-white px-3 text-center text-3xl font-black tabular-nums text-slate-950"
          >
            {answer}
          </output>
        </div>
        {!readOnly ? <LessonNumericKeypad
          allowSeparator
          label="Kalkulator do mnożenia w pamięci"
          helperText="Wpisz wynik i zatwierdź."
          onKey={updateMentalAnswer}
          onConfirm={checkAnswer}
        /> : null}
      </>}
      {success ? <p className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! {task.decimalFactor} · {task.naturalFactor} = {decimalNaturalMultiplyExpectedAnswer(task)}{activity === "decimal-natural-story" ? ` ${task.answerUnit}.` : "."}</p> : null}
      {diagnostic && activity === "decimal-natural-mental" ? <p role="status" className="rounded-xl bg-rose-100 px-4 py-3 text-center font-black text-rose-950">
        {answer.trim() ? "Spróbuj jeszcze raz. Sprawdź mnożenie i położenie przecinka." : "Najpierw wpisz wynik działania."}
      </p> : null}
      {diagnostic && activity === "decimal-natural-story" ? <p role="status" className="rounded-xl bg-rose-100 px-4 py-3 text-center font-black text-rose-950">Uzupełnij obliczenie i odpowiedź. Sprawdź mnożenie oraz przecinek.</p> : null}
      {diagnostic && activity === "decimal-natural-written" ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted /> : null}
    </section>
  </LessonTaskFrame>;
}
