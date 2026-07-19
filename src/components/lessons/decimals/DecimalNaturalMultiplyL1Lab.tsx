"use client";

import { useMemo, useState } from "react";
import { DecimalDigitInput } from "@/components/lessons/decimals/DecimalDigitInput";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
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
};

function MentalExample() {
  return <section className="space-y-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-5">
    <h3 className="text-xl font-black text-cyan-950">Możemy mnożyć w pamięci</h3>
    <p className="font-bold text-cyan-950">Najpierw mnożymy całości, potem części dziesiąte. Na końcu łączymy wyniki.</p>
    <div className="grid gap-3 md:grid-cols-3">
      <p className="rounded-xl bg-white p-3 text-center text-lg font-black">2,3 × 4</p>
      <p className="rounded-xl bg-white p-3 text-center font-bold"><span className="text-indigo-700">2 × 4 = 8</span><br /><span className="text-emerald-700">0,3 × 4 = 1,2</span></p>
      <p className="rounded-xl bg-white p-3 text-center text-lg font-black">8 + 1,2 = 9,2</p>
    </div>
  </section>;
}

function WrittenExample() {
  return <section className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
    <h3 className="text-xl font-black text-amber-950">Przykład poprawnego zapisu</h3>
    <p className="font-bold text-amber-950">Mnożymy jak liczby naturalne. W wyniku zapisujemy przecinek tak, aby zostały dwie cyfry po przecinku — tyle, ile było w liczbie 2,35.</p>
    <table className="mx-auto border-separate border-spacing-x-2 border-spacing-y-1 font-mono text-3xl font-black" aria-label="Przykład mnożenia pisemnego 2,35 razy 3">
      <tbody>
        <tr><td className="w-8" /><td className="w-10 text-center">2</td><td className="w-4 text-center">,</td><td className="w-10 text-center">3</td><td className="w-10 text-center">5</td></tr>
        <tr><td className="w-8 text-center">×</td><td colSpan={3} className="text-right">3</td><td /></tr>
        <tr><td className="border-t-4 border-slate-900" /><td className="border-t-4 border-slate-900 text-center">7</td><td className="border-t-4 border-slate-900 text-center">,</td><td className="border-t-4 border-slate-900 text-center">0</td><td className="border-t-4 border-slate-900 text-center">5</td></tr>
      </tbody>
    </table>
  </section>;
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
  const [answer, setAnswer] = useState(readOnly ? decimalNaturalMultiplyExpectedAnswer(task) : "");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [success, setSuccess] = useState(false);
  const checkAnswer = () => {
    const result = validateDecimalNaturalMultiplyAnswer({ task, answer });
    setDiagnosticCode(result.code);
    setSuccess(result.correct);
    onResultChange?.(result.correct, result.answerLabel);
  };
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, { memberIds: ["decimal-natural-result"] }) : null;

  return <LessonTaskFrame
    className="space-y-5"
    contentClassName="space-y-5"
    eyebrow="Dział 5 · Ułamki dziesiętne"
    heading={TITLES[activity]}
    description={activity === "decimal-natural-mental" ? "Najpierw zobacz sposób liczenia w pamięci, a potem wykonuj działania jedno po drugim." : "Najpierw zobacz poprawny zapis pisemny, a potem rozwiąż kolejne działania."}
    questionNumber={questionNumber}
    questionCount={questionCount}
    data-decimal-natural-multiply-l1
    data-decimal-activity={activity}
    data-generator-id={task.generatorId}
    data-seed={effectiveSeed}
    data-presentation-mode={presentationMode || undefined}
    data-answer-spec="server-only"
  >
    {activity === "decimal-natural-mental" ? <MentalExample /> : <WrittenExample />}
    <section className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-5">
      <p className="text-center text-3xl font-black text-slate-950">{task.decimalFactor} × {task.naturalFactor} =</p>
      <DecimalDigitInput
        value={answer}
        onChange={(value) => { setAnswer(value); setDiagnosticCode(null); setSuccess(false); onResultChange?.(null); }}
        onSubmit={checkAnswer}
        label="Wynik"
        readOnly={readOnly}
        showKeypad
        diagnosticCode={diagnosticCode ?? undefined}
      />
      {!readOnly ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkAnswer}>Zatwierdź</button> : null}
      {success ? <p className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! {task.decimalFactor} × {task.naturalFactor} = {decimalNaturalMultiplyExpectedAnswer(task)}.</p> : null}
      {diagnostic ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted /> : null}
    </section>
  </LessonTaskFrame>;
}
