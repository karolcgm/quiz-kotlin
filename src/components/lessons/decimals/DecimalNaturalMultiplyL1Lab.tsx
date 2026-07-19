"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createPublicDecimalNaturalMultiplyL1Task,
  decimalNaturalMultiplyExpectedAnswer,
  decimalNaturalMultiplyWrittenAnswer,
  isDecimalNaturalMultiplyL1Activity,
  validateDecimalNaturalMultiplyAnswer,
  type DecimalNaturalMultiplyL1Activity,
  type DecimalNaturalStoryPicture,
} from "@/lib/math/decimals/decimalNaturalMultiplyL1";
import { createDecimalDiagnosticResult } from "@/lib/math/decimals/decimalDiagnostics";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES, type DecimalFeedbackCode } from "@/types/decimals";
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

const STORY_PICTURE_LABELS: Record<DecimalNaturalStoryPicture, string> = {
  bottles: "Ilustracja skrzynki z butelkami soku",
  ribbons: "Ilustracja stołu z kolorowymi wstążkami",
  tickets: "Ilustracja biletów na szkolne przedstawienie",
  apples: "Ilustracja worków i kosza z jabłkami",
  notebooks: "Ilustracja zeszytów dla koła plastycznego",
  boxes: "Ilustracja pudełek z kolorowymi koralikami",
};

const STORY_PICTURE_SOURCES: Record<DecimalNaturalStoryPicture, string> = {
  bottles: "/lessons/illustrations/decimals/story/natural-bottles.png",
  ribbons: "/lessons/illustrations/decimals/story/natural-ribbons.png",
  tickets: "/lessons/illustrations/decimals/story/natural-tickets.png",
  apples: "/lessons/illustrations/decimals/story/natural-apples.png",
  notebooks: "/lessons/illustrations/decimals/story/natural-notebooks.png",
  boxes: "/lessons/illustrations/decimals/story/natural-boxes.png",
};

function StoryMultiplyPicture({ kind }: { kind: DecimalNaturalStoryPicture }) {
  const source = STORY_PICTURE_SOURCES[kind];
  if (source) return <Image src={source} alt={STORY_PICTURE_LABELS[kind]} aria-label={STORY_PICTURE_LABELS[kind]} width={1536} height={1024} sizes="(min-width: 1024px) 768px, 100vw" className="h-auto w-full object-cover" />;
  return <svg viewBox="0 0 340 220" role="img" aria-label={STORY_PICTURE_LABELS[kind]} className="mx-auto h-auto w-full max-w-[340px]">
    <defs>
      <linearGradient id={`story-bg-${kind}`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ecfeff" />
        <stop offset="1" stopColor="#ecfdf5" />
      </linearGradient>
      <filter id={`story-shadow-${kind}`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity=".16" /></filter>
    </defs>
    <rect x="5" y="5" width="330" height="210" rx="28" fill={`url(#story-bg-${kind})`} stroke="#34d399" strokeWidth="4" />
    <ellipse cx="170" cy="186" rx="125" ry="14" fill="#a7f3d0" opacity=".65" />
    {kind === "bottles" ? <g filter={`url(#story-shadow-${kind})`}>
      <path d="M66 109h208l-17 78H83z" fill="#d97706" stroke="#92400e" strokeWidth="5" />
      <path d="M73 131h194M79 158h182M112 110l8 77M170 110v77M228 110l-8 77" fill="none" stroke="#fbbf24" strokeWidth="5" />
      {[91, 139, 187, 235].map((x, index) => <g key={x} transform={`translate(${x} ${index % 2 ? 30 : 23})`}><path d="M12 2h22v20l9 13v73H3V35l9-13z" fill={index % 2 ? "#fb923c" : "#facc15"} stroke="#0e7490" strokeWidth="4" /><path d="M5 56h36" stroke="#fff7ed" strokeWidth="6" /><rect x="12" y="2" width="22" height="11" rx="3" fill="#155e75" /></g>)}
    </g> : null}
    {kind === "ribbons" ? <g filter={`url(#story-shadow-${kind})`}>
      <path d="M53 155h234v31H53z" fill="#fbbf24" stroke="#92400e" strokeWidth="5" /><path d="M76 186v20m188-20v20" stroke="#92400e" strokeWidth="8" />
      <g transform="translate(90 62)"><circle cx="47" cy="47" r="42" fill="#f9a8d4" stroke="#be185d" strokeWidth="5" /><circle cx="47" cy="47" r="14" fill="#fff" stroke="#be185d" strokeWidth="4" /><path d="M81 66c60 5 47 65 100 56 31-5 28-41 7-47" fill="none" stroke="#db2777" strokeWidth="10" strokeLinecap="round" /></g>
      <path d="m219 53 59 67M278 53l-59 67" stroke="#64748b" strokeWidth="7" strokeLinecap="round" /><circle cx="218" cy="52" r="10" fill="#cbd5e1" stroke="#475569" strokeWidth="4" /><circle cx="279" cy="52" r="10" fill="#cbd5e1" stroke="#475569" strokeWidth="4" />
      <path d="M67 61c18-22 35-22 53 0-18 20-35 20-53 0z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="4" />
    </g> : null}
    {kind === "tickets" ? <g filter={`url(#story-shadow-${kind})`}>
      <path d="M43 104c13 0 23-10 23-23h208c0 13 10 23 23 23v72c-13 0-23 10-23 23H66c0-13-10-23-23-23z" fill="#fde68a" stroke="#b45309" strokeWidth="5" />
      <path d="M201 84v111" stroke="#b45309" strokeWidth="4" strokeDasharray="9 8" /><path d="m102 136 20 14 28-38 28 38 20-14-48 43z" fill="#f59e0b" stroke="#92400e" strokeWidth="3" /><text x="237" y="135" textAnchor="middle" fill="#78350f" fontSize="22" fontWeight="900">BILET</text><text x="237" y="164" textAnchor="middle" fill="#78350f" fontSize="18" fontWeight="800">SZKOŁA</text>
      <path d="M79 73 105 33l26 40 25-40 27 40" fill="none" stroke="#a855f7" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </g> : null}
    {kind === "apples" ? <g filter={`url(#story-shadow-${kind})`}>
      <path d="M70 102h204l-19 88H89z" fill="#fbbf24" stroke="#92400e" strokeWidth="5" /><path d="M77 126h190M82 153h178M114 103l7 87M170 103v87M226 103l-7 87" fill="none" stroke="#fef3c7" strokeWidth="5" />
      {[[102,82],[144,72],[188,78],[230,68],[122,111],[168,108],[214,108]].map(([x,y], index) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><circle cx="0" cy="0" r="24" fill={index % 2 ? "#ef4444" : "#fb7185"} stroke="#991b1b" strokeWidth="4" /><path d="M0-21c-1-15 9-18 17-19" fill="none" stroke="#166534" strokeWidth="5" /><path d="M7-31c14-7 21 2 19 11-11 3-19-1-19-11z" fill="#4ade80" stroke="#166534" strokeWidth="3" /></g>)}
    </g> : null}
    {kind === "notebooks" ? <g filter={`url(#story-shadow-${kind})`}>
      {[0,1,2,3].map((index) => <g key={index} transform={`translate(${74 + index * 28} ${132 - index * 22}) rotate(${-8 + index * 4} 76 36)`}><rect width="154" height="48" rx="7" fill={["#f9a8d4","#93c5fd","#c4b5fd","#86efac"][index]} stroke="#334155" strokeWidth="4" /><path d="M19 2v44M31 14h105M31 27h105" stroke="#475569" strokeWidth="3" /></g>)}
      <path d="m259 42 19 19-91 91-30 10 10-30z" fill="#facc15" stroke="#92400e" strokeWidth="5" /><path d="m157 162 10-30 20 20z" fill="#fef3c7" stroke="#92400e" strokeWidth="4" />
    </g> : null}
    {kind === "boxes" ? <g filter={`url(#story-shadow-${kind})`}>
      <path d="m62 91 79-40 79 40-79 41z" fill="#fed7aa" stroke="#9a3412" strokeWidth="5" /><path d="M62 91v81l79 39v-79zm158 0v81l-79 39v-79z" fill="#fb923c" stroke="#9a3412" strokeWidth="5" />
      {[90,116,142,168,194,220,246].map((x,index) => <circle key={x} cx={x} cy={66 + (index % 2) * 18} r="10" fill={["#ec4899","#8b5cf6","#0ea5e9","#22c55e","#f59e0b"][index % 5]} stroke="#fff" strokeWidth="3" />)}
      <path d="M239 79h53v87h-53z" fill="#fef3c7" stroke="#9a3412" strokeWidth="4" /><path d="M249 97h33M249 115h33M249 133h24" stroke="#fb923c" strokeWidth="4" />
    </g> : null}
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

function WrittenEditableOperandRow({
  value,
  columnCount,
  label,
  digits,
  activeIndex,
  onSelect,
}: {
  value: string;
  columnCount: number;
  label: string;
  digits: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  let digitIndex = -1;
  return <div
    className="grid justify-end"
    style={{ gridTemplateColumns: `repeat(${columnCount}, 3rem)` }}
    aria-label={label}
    data-written-column-grid
  >
    {[...value.padStart(columnCount, " ")].map((character, index) => {
      if (character === " ") return <span key={`operand-empty-${index}`} aria-hidden />;
      if (!/[0-9]/u.test(character)) return <span key={`operand-fixed-${character}-${index}`} className="grid h-12 w-12 place-items-center text-3xl font-black" aria-label={character === "," ? "przecinek" : "znak mnożenia"}>{character}</span>;
      digitIndex += 1;
      const current = digitIndex;
      return <button
        key={`operand-${label}-${current}`}
        type="button"
        onClick={() => onSelect(current)}
        className={`mx-auto grid h-12 w-12 place-items-center rounded-lg border-2 bg-white text-2xl font-black text-slate-950 ${activeIndex === current ? "border-indigo-600 ring-4 ring-indigo-100" : "border-slate-400"}`}
        aria-label={`${label}, cyfra ${current + 1}`}
      >
        {digits[current] || ""}
      </button>;
    })}
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
  const writtenExpectedAnswer = decimalNaturalMultiplyWrittenAnswer(task);
  const writtenColumnCount = Math.max(task.decimalFactor.length, writtenExpectedAnswer.length, String(task.naturalFactor).length + 1);
  const [answer, setAnswer] = useState(readOnly ? decimalNaturalMultiplyExpectedAnswer(task) : "");
  const [storyAnswer, setStoryAnswer] = useState(readOnly ? expectedAnswer : "");
  const [writtenDigits, setWrittenDigits] = useState<string[]>(() => readOnly ? [...writtenExpectedAnswer].filter((character) => character !== ",") : [...writtenExpectedAnswer].filter((character) => character !== ",").map(() => ""));
  const [activeWrittenDigit, setActiveWrittenDigit] = useState(0);
  const [carryDigits, setCarryDigits] = useState<string[]>(() => task.decimalFactor.replace(",", "").split("").map(() => ""));
  const [activeCarryDigit, setActiveCarryDigit] = useState(0);
  const [decimalOperandDigits, setDecimalOperandDigits] = useState<string[]>(() => readOnly ? task.decimalFactor.replace(",", "").split("") : task.decimalFactor.replace(",", "").split("").map(() => ""));
  const [naturalOperandDigits, setNaturalOperandDigits] = useState<string[]>(() => readOnly ? String(task.naturalFactor).split("") : String(task.naturalFactor).split("").map(() => ""));
  const [activeDecimalOperandDigit, setActiveDecimalOperandDigit] = useState(0);
  const [activeNaturalOperandDigit, setActiveNaturalOperandDigit] = useState(0);
  const [activeField, setActiveField] = useState<"decimalOperand" | "naturalOperand" | "result" | "carry" | "answer">(activity === "decimal-natural-story" ? "decimalOperand" : "result");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [success, setSuccess] = useState(false);
  const checkAnswer = () => {
    const writtenAnswer = [...writtenExpectedAnswer].reduce<{ result: string; index: number }>((state, character) => character === ","
      ? { ...state, result: `${state.result},` }
      : { result: `${state.result}${writtenDigits[state.index] ?? ""}`, index: state.index + 1 }, { result: "", index: 0 }).result;
    const result = validateDecimalNaturalMultiplyAnswer({ task, answer: activity === "decimal-natural-mental" ? answer : writtenAnswer });
    const storyResult = activity === "decimal-natural-story"
      ? validateDecimalNaturalMultiplyAnswer({ task, answer: storyAnswer })
      : null;
    const operandsCorrect = activity !== "decimal-natural-story" || (
      decimalOperandDigits.join("") === task.decimalFactor.replace(",", "")
      && naturalOperandDigits.join("") === String(task.naturalFactor)
    );
    const resultFieldsComplete = activity === "decimal-natural-mental" || writtenDigits.every((digit) => digit !== "");
    const correct = result.correct && (storyResult?.correct ?? true) && operandsCorrect && resultFieldsComplete;
    setDiagnosticCode(result.code);
    if (result.correct && storyResult && !storyResult.correct) setDiagnosticCode(storyResult.code);
    if (result.correct && (storyResult?.correct ?? true) && !operandsCorrect) setDiagnosticCode(DECIMAL_FEEDBACK_CODES.placeValue);
    if (result.correct && (storyResult?.correct ?? true) && operandsCorrect && !resultFieldsComplete) setDiagnosticCode(DECIMAL_FEEDBACK_CODES.empty);
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
    if (activeField === "decimalOperand" || activeField === "naturalOperand") {
      const isDecimalOperand = activeField === "decimalOperand";
      const activeIndex = isDecimalOperand ? activeDecimalOperandDigit : activeNaturalOperandDigit;
      const setDigits = isDecimalOperand ? setDecimalOperandDigits : setNaturalOperandDigits;
      const digitCount = isDecimalOperand ? decimalOperandDigits.length : naturalOperandDigits.length;
      setDigits((current) => current.map((value, index) => index === activeIndex ? (digit === "backspace" ? "" : digit) : value));
      if (isDecimalOperand) setActiveDecimalOperandDigit((index) => digit === "backspace" ? Math.max(0, index - 1) : Math.min(digitCount - 1, index + 1));
      else setActiveNaturalOperandDigit((index) => digit === "backspace" ? Math.max(0, index - 1) : Math.min(digitCount - 1, index + 1));
      setDiagnosticCode(null); setSuccess(false); onResultChange?.(null);
      return;
    }
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
    {activity === "decimal-natural-story" && task.story && task.storyQuestion && task.answerUnit && task.pictureKind ? <section className="space-y-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
      <div className="space-y-3">
        <h3 className="text-xl font-black text-emerald-950">Przeczytaj zadanie</h3>
        <p className="text-lg font-bold leading-relaxed text-emerald-950">{task.story}</p>
        <p className="text-lg font-black text-emerald-950">{task.storyQuestion}</p>
      </div>
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm"><StoryMultiplyPicture kind={task.pictureKind} /></div>
    </section> : null}
    <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-5">
      {activity !== "decimal-natural-mental" ? <>
        {activity === "decimal-natural-story" ? <div className="space-y-1 text-center">
          <h3 className="text-xl font-black text-slate-950">Samodzielnie zapisz działanie</h3>
          <p className="font-bold text-slate-700">Wpisz w puste kratki obie liczby z treści, a następnie wykonaj mnożenie.</p>
        </div> : null}
        <div className="mx-auto w-fit font-mono text-slate-950" aria-label={activity === "decimal-natural-story" ? "Samodzielny zapis mnożenia pisemnego" : `Mnożenie pisemne ${task.decimalFactor} razy ${task.naturalFactor}`}>
          <WrittenCarryBoxes
            factor={task.decimalFactor}
            columnCount={writtenColumnCount}
            digits={carryDigits}
            activeIndex={activeField === "carry" ? activeCarryDigit : -1}
            onSelect={(index) => { setActiveCarryDigit(index); setActiveField("carry"); }}
          />
          {activity === "decimal-natural-story" ? <>
            <WrittenEditableOperandRow
              value={task.decimalFactor}
              columnCount={writtenColumnCount}
              label="Pierwszy czynnik"
              digits={decimalOperandDigits}
              activeIndex={activeField === "decimalOperand" ? activeDecimalOperandDigit : -1}
              onSelect={(index) => { setActiveDecimalOperandDigit(index); setActiveField("decimalOperand"); }}
            />
            <WrittenEditableOperandRow
              value={`·${task.naturalFactor}`}
              columnCount={writtenColumnCount}
              label="Drugi czynnik"
              digits={naturalOperandDigits}
              activeIndex={activeField === "naturalOperand" ? activeNaturalOperandDigit : -1}
              onSelect={(index) => { setActiveNaturalOperandDigit(index); setActiveField("naturalOperand"); }}
            />
          </> : <>
            <WrittenTextRow value={task.decimalFactor} columnCount={writtenColumnCount} label={`Liczba ${task.decimalFactor}`} />
            <WrittenTextRow value={`·${task.naturalFactor}`} columnCount={writtenColumnCount} label={`razy ${task.naturalFactor}`} />
          </>}
          <div className="my-2 border-t-4 border-solid border-slate-950" aria-hidden />
          <WrittenResultBoxes expected={writtenExpectedAnswer} columnCount={writtenColumnCount} digits={writtenDigits} activeIndex={activeField === "result" ? activeWrittenDigit : -1} onSelect={(index) => { setActiveWrittenDigit(index); setActiveField("result"); }} />
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
          helperText={activeField === "decimalOperand"
            ? "Wpisujesz pierwszą liczbę odczytaną z treści zadania."
            : activeField === "naturalOperand"
              ? "Wpisujesz drugą liczbę odczytaną z treści zadania."
              : activeField === "carry"
            ? "Wpisujesz cyfrę w małej kratce. Potem wybierz kratkę wyniku."
            : activeField === "answer"
              ? "Wpisujesz pełną odpowiedź liczbową. Jednostka jest już podana."
              : "Wpisujesz wynik. Małe kratki nad liczbą wykorzystaj podczas obliczania."}
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
