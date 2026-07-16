"use client";

import { useMemo, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  createFractionDifferentDenominatorAdvancedDiagnosticResult,
  createPublicFractionDifferentDenominatorAdvancedTask,
  evaluateDifferentDenominatorAdvancedAttempt,
  leastCommonDenominatorAdvanced,
  simplifiedDifferentDenominatorAdvancedResult,
  type FractionDifferentDenominatorAdvancedActivity,
  type FractionDifferentDenominatorAdvancedDiagnosticCode,
  type FractionRepairStep,
  type WholeAssessment,
} from "@/lib/math/fractions/fractionDifferentDenominatorAdvancedLesson";
import { mixedToImproper, parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionStackValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<FractionDifferentDenominatorAdvancedActivity, string> = {
  "different-denom-l2-subtraction-bars": "Dodawanie o różnych mianownikach",
  "different-denom-l2-mixed-number": "Odejmowanie o różnych mianownikach",
  "different-denom-l2-greenhouse": "Mikstura dla szklarni",
  "different-denom-l2-repair": "Napraw rozwiązanie",
  "different-denom-l2-independent": "Samodzielna próba L2",
};

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = { support: "Start", core: "Dalej", challenge: "Mistrzowskie" };

const REPAIR_OPTIONS: Array<{ value: FractionRepairStep; label: string }> = [
  { value: "common-denominator", label: "Wybrano wspólny mianownik" },
  { value: "extension", label: "Rozszerzono ułamki" },
  { value: "numerator-operation", label: "Dodano liczniki" },
  { value: "denominator-operation", label: "Dodano mianowniki: 3 + 4 = 7" },
];

function blankStack(showWhole: boolean): FractionStackValue {
  return { wholePart: showWhole ? [""] : undefined, numerator: [""], denominator: [""] };
}

function mixedText(value: MixedFractionValue): string {
  return `${value.wholePart ? `${value.wholePart} ` : ""}${value.numerator}/${value.denominator}`;
}

function operandText(value: MixedFractionValue): string {
  return value.wholePart || value.numerator ? mixedText(value) : "0";
}

function FractionVisual({ value }: { value: MixedFractionValue }) {
  return <span className="inline-flex items-center gap-2 align-middle">
    {value.wholePart ? <b>{value.wholePart}</b> : null}
    <span className="grid min-w-8 text-center leading-none"><b>{value.numerator}</b><i className="my-1 border-t-2 border-slate-950" /><b>{value.denominator}</b></span>
  </span>;
}

function numberFromCells(cells: readonly string[] | undefined): number {
  const text = cells?.join("") ?? "";
  return text ? Number(text) : 0;
}

function SmartOperation({
  left,
  right,
  operation,
  commonDenominator,
  leftMultiplier,
  rightMultiplier,
  result,
}: {
  left: MixedFractionValue;
  right: MixedFractionValue;
  operation: "+" | "−";
  commonDenominator: number | null;
  leftMultiplier: number;
  rightMultiplier: number;
  result: MixedFractionValue;
}) {
  return (
    <section className="grid gap-3 rounded-2xl border-2 border-indigo-200 bg-white p-4" data-smart-different-denominator-operation>
      <div className="flex flex-nowrap items-center justify-center gap-3 overflow-x-auto py-2 text-xl font-black tabular-nums" aria-label={`${operandText(left)} ${operation} ${operandText(right)}`}>
        <FractionVisual value={left} /><strong>{operation}</strong><FractionVisual value={right} />
        {commonDenominator ? <><strong>=</strong><FractionVisual value={{ wholePart: 0, numerator: left.numerator * leftMultiplier, denominator: commonDenominator }} /><strong>{operation}</strong><FractionVisual value={{ wholePart: 0, numerator: right.numerator * rightMultiplier, denominator: commonDenominator }} /><strong>=</strong><FractionVisual value={result} /></> : null}
      </div>
      <p className="rounded-xl bg-slate-900 px-4 py-3 text-center font-black text-white" data-member-id="repair-common-denominator">Wspólny mianownik: {commonDenominator ?? "□"}</p>
    </section>
  );
}

export interface FractionDifferentDenominatorAdvancedLessonModelProps {
  activity: FractionDifferentDenominatorAdvancedActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionDifferentDenominatorAdvancedLessonModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: FractionDifferentDenominatorAdvancedLessonModelProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState(difficulty);
  const task = useMemo(() => createPublicFractionDifferentDenominatorAdvancedTask({ seed: effectiveSeed, difficulty: activeDifficulty, activity }), [activity, activeDifficulty, effectiveSeed]);
  const expected = simplifiedDifferentDenominatorAdvancedResult(task);
  const leastCommon = leastCommonDenominatorAdvanced(task.left.denominator, task.right.denominator);
  const repairDefaults = activity === "different-denom-l2-repair";
  const guidedExample = activity === "different-denom-l2-subtraction-bars" || activity === "different-denom-l2-mixed-number";
  const [commonDenominator, setCommonDenominator] = useState<number | null>(repairDefaults || guidedExample ? leastCommon : null);
  const [leftMultiplier, setLeftMultiplier] = useState(repairDefaults || guidedExample ? leastCommon / task.left.denominator : 1);
  const [rightMultiplier, setRightMultiplier] = useState(repairDefaults || guidedExample ? leastCommon / task.right.denominator : 1);
  const [resultStack, setResultStack] = useState<FractionStackValue>(() => blankStack(task.requiresMixedResult));
  const [wholeAssessment, setWholeAssessment] = useState<WholeAssessment | null>(null);
  const [repairStep, setRepairStep] = useState<FractionRepairStep | null>(null);
  const [diagnosticCode, setDiagnosticCode] = useState<FractionDifferentDenominatorAdvancedDiagnosticCode | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const controlsLocked = readOnly || presentationMode && activity === "different-denom-l2-independent";
  const commonIsValid = commonDenominator !== null
    && commonDenominator % task.left.denominator === 0
    && commonDenominator % task.right.denominator === 0;
  const diagnostic = diagnosticCode ? createFractionDifferentDenominatorAdvancedDiagnosticResult(diagnosticCode) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccess(null);
    onResultChange?.(null);
  };

  const chooseCommon = (value: number) => {
    setCommonDenominator(value);
    if (value % task.left.denominator === 0 && value % task.right.denominator === 0) {
      setLeftMultiplier(value / task.left.denominator);
      setRightMultiplier(value / task.right.denominator);
    }
    clearResult();
  };

  const chooseDifficulty = (value: LessonDifficulty) => {
    const next = createPublicFractionDifferentDenominatorAdvancedTask({ seed: effectiveSeed, difficulty: value, activity });
    setActiveDifficulty(value);
    const nextLeast = leastCommonDenominatorAdvanced(next.left.denominator, next.right.denominator);
    setCommonDenominator(repairDefaults || guidedExample ? nextLeast : null);
    setLeftMultiplier(repairDefaults || guidedExample ? nextLeast / next.left.denominator : 1);
    setRightMultiplier(repairDefaults || guidedExample ? nextLeast / next.right.denominator : 1);
    setResultStack(blankStack(next.requiresMixedResult));
    setWholeAssessment(null);
    setRepairStep(null);
    clearResult();
  };

  const check = () => {
    const parsed = parseFractionStackValue(resultStack);
    if (!parsed.ok) {
      const code = parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator ? FRACTION_FEEDBACK_CODES.zeroDenominator : FRACTION_FEEDBACK_CODES.emptyPart;
      setDiagnosticCode(code);
      setSuccess(null);
      onResultChange?.(false);
      return;
    }
    const code = evaluateDifferentDenominatorAdvancedAttempt({
      task,
      attempt: {
        commonDenominator,
        leftMultiplier,
        rightMultiplier,
        submitted: parsed.value,
        usedMixedFormat: numberFromCells(resultStack.wholePart) > 0,
        submittedFractionalNumerator: numberFromCells(resultStack.numerator),
        submittedFractionalDenominator: numberFromCells(resultStack.denominator),
        wholeAssessment,
        repairStep,
      },
    });
    if (code) {
      setDiagnosticCode(code);
      setSuccess(null);
      onResultChange?.(false, `${operandText(task.left)} ${task.operation} ${operandText(task.right)}`);
      return;
    }
    const label = mixedText(expected);
    setDiagnosticCode(null);
    setSuccess(`Poprawnie: wybrano wspólną miarę ${commonDenominator} i zapisano właściwy wynik.`);
    onResultChange?.(true, `${operandText(task.left)} ${task.operation} ${operandText(task.right)} = ${label}`);
  };

  const expandedLeft = commonIsValid && commonDenominator
    ? { numerator: mixedToImproper(task.left).numerator * (commonDenominator / task.left.denominator), denominator: commonDenominator }
    : { numerator: task.left.numerator, denominator: task.left.denominator };
  const expandedRight = commonIsValid && commonDenominator
    ? { numerator: mixedToImproper(task.right).numerator * (commonDenominator / task.right.denominator), denominator: commonDenominator }
    : { numerator: task.right.numerator, denominator: task.right.denominator };

  return (
    <LessonTaskFrame contentClassName="grid gap-4" eyebrow="Dział 3 · Ułamki zwykłe" heading={TITLES[activity]} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount} data-fraction-different-denominator-advanced data-fraction-activity={activity} data-generator-id={task.generatorId} data-diagnostic-code={diagnosticCode ?? undefined}>

      {activity === "different-denom-l2-independent" && !onResultChange && !readOnly ? (
        <div className="flex flex-wrap justify-center gap-2" aria-label="Wybierz wariant zadania">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => <button key={level} type="button" aria-pressed={activeDifficulty === level} className="min-h-11 rounded-xl border-2 border-indigo-300 bg-white px-4 font-black aria-pressed:bg-indigo-700 aria-pressed:text-white" onClick={() => chooseDifficulty(level)}>{DIFFICULTY_LABELS[level]}</button>)}
        </div>
      ) : null}

      <SmartOperation left={task.left} right={task.right} operation={task.operation} commonDenominator={commonDenominator} leftMultiplier={leftMultiplier} rightMultiplier={rightMultiplier} result={expected} />

      {activity === "different-denom-l2-subtraction-bars" ? (
        <section className="rounded-2xl border-2 border-amber-200 bg-white p-3" data-subtraction-bars>
          <FractionBarModel
            bars={success ? [
              { id: "start", label: "pierwszy ułamek", value: expandedLeft, accent: "cyan" },
              { id: "remove", label: task.operation === "+" ? "dodaj" : "odejmij", value: expandedRight, accent: "amber" },
              { id: "result", label: "wynik", value: mixedToImproper(expected), accent: "indigo" },
            ] : [
              { id: "start", label: "pierwszy ułamek", value: expandedLeft, accent: "cyan" },
              { id: "remove", label: task.operation === "+" ? "dodaj" : "odejmij", value: expandedRight, accent: "amber" },
            ]}
            title="Jedna wspólna podziałka"
            description="Najpierw oba paski dzielimy na tę samą liczbę równych części."
          />
        </section>
      ) : null}

      {activity === "different-denom-l2-greenhouse" ? (
        <section className="grid gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-950 p-4 text-white sm:grid-cols-[1fr_auto]" data-greenhouse-mixture>
          <div>
            <h3 className="text-xl font-black">Szklarnia badawcza</h3>
            <p className="mt-2 flex flex-wrap items-center gap-2 font-semibold text-emerald-100"><FractionVisual value={{ wholePart: 0, numerator: 2, denominator: 3 }} /> l pożywki <b>+</b> <FractionVisual value={{ wholePart: 0, numerator: 3, denominator: 4 }} /> l wody</p>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Ocena objętości względem jednego litra">
              {(["below-one", "equal-one", "above-one"] as WholeAssessment[]).map((value) => <button key={value} type="button" disabled={controlsLocked} aria-pressed={wholeAssessment === value} className="min-h-11 rounded-xl border-2 border-emerald-300 bg-white px-3 font-black text-emerald-950 aria-pressed:bg-amber-300" onClick={() => { setWholeAssessment(value); clearResult(); }}>{value === "below-one" ? "mniej niż 1 l" : value === "equal-one" ? "dokładnie 1 l" : "więcej niż 1 l"}</button>)}
            </div>
          </div>
          <div className="relative mx-auto h-44 w-28 overflow-hidden rounded-b-3xl border-4 border-emerald-200 bg-white/10" data-member-id="greenhouse-one-liter">
            <div className="absolute inset-x-0 bottom-0 h-[82%] bg-cyan-300/80 motion-safe:animate-pulse motion-reduce:animate-none" data-member-id="greenhouse-level" />
            <span className="absolute inset-x-0 top-[27%] border-t-2 border-dashed border-white" aria-hidden />
            <b className="absolute right-1 top-[22%] text-xs">1 l</b>
          </div>
        </section>
      ) : null}

      {activity === "different-denom-l2-repair" ? (
        <section className="grid gap-3 rounded-2xl border-2 border-violet-300 bg-violet-50 p-4" data-repair-solution>
          <h3 className="text-lg font-black">Ślad ucznia — znajdź błąd</h3>
          <div className="grid gap-2 rounded-xl bg-white p-3 text-lg font-black">
            <span className="flex items-center gap-2"><FractionVisual value={{ wholePart: 0, numerator: 2, denominator: 3 }} /> <b>+</b> <FractionVisual value={{ wholePart: 0, numerator: 1, denominator: 4 }} /></span>
            <span className="flex items-center gap-2">= <span>(2 + 1) nad kreską, (3 + 4) pod kreską</span></span>
            <span className={`flex items-center gap-2 ${repairStep === "denominator-operation" ? "line-through decoration-4 decoration-rose-600" : ""}`} data-member-id="repair-wrong-denominator">= <FractionVisual value={{ wholePart: 0, numerator: 3, denominator: 7 }} /></span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Wskaż pierwszy błędny krok">
            {REPAIR_OPTIONS.map((option) => <button key={option.value} type="button" disabled={controlsLocked} aria-pressed={repairStep === option.value} className="min-h-12 rounded-xl border-2 border-violet-300 bg-white px-3 text-left font-bold aria-pressed:bg-violet-700 aria-pressed:text-white" onClick={() => { setRepairStep(option.value); clearResult(); }}>{option.label}</button>)}
          </div>
        </section>
      ) : null}

      {!repairDefaults && !guidedExample ? (
        <section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <h3 className="font-black">1. Wybierz wspólny mianownik</h3>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Wspólny mianownik L2">
            {task.commonDenominatorOptions.map((option) => <button key={option} type="button" disabled={controlsLocked} aria-pressed={commonDenominator === option} className="min-h-11 min-w-14 rounded-xl border-2 border-slate-300 bg-white px-3 font-black aria-pressed:bg-indigo-700 aria-pressed:text-white" onClick={() => chooseCommon(option)}>{option}</button>)}
          </div>
          <p role="status" className={commonDenominator === null ? "text-slate-600" : commonIsValid ? "font-bold text-emerald-700" : "font-bold text-amber-800"}>{commonDenominator === null ? "Znajdź liczbę podzielną przez oba mianowniki." : commonIsValid ? `${commonDenominator} pasuje do obu podziałek.` : `${commonDenominator} nie jest wspólną miarą.`}</p>
        </section>
      ) : null}

      <section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4" data-member-id="different-denom-l2-operation">
        <h3 className="font-black">2. Zapisz wynik w pionowych kratkach</h3>
        <FractionStackInput value={resultStack} onChange={(value) => { setResultStack(value); clearResult(); }} showWholePart={task.requiresMixedResult} readOnly={controlsLocked} ariaLabel="Wynik działania L2 w pionowych kratkach" stepLabel="Wynik i najprostsza postać" onSubmit={check} />
        {!controlsLocked ? <button type="button" className="min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white" onClick={check}>Sprawdź rozwiązanie L2</button> : null}
      </section>

      {success ? <p className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 font-black text-emerald-900" role="status">✓ {success}</p> : null}
      {diagnostic ? onResultChange ? (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted />
      ) : (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
