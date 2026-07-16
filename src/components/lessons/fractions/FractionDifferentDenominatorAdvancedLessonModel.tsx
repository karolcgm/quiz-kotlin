"use client";

import { useMemo, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  applyDifferentDenominatorAdvancedOperation,
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
import { greatestCommonDivisor, mixedToImproper, parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionStackValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<FractionDifferentDenominatorAdvancedActivity, string> = {
  "different-denom-l2-subtraction-bars": "Dodawanie o różnych mianownikach",
  "different-denom-l2-mixed-number": "Odejmowanie o różnych mianownikach",
  "different-denom-l2-greenhouse": "Mikstura dla szklarni",
  "different-denom-l2-repair": "Napraw rozwiązanie",
  "different-denom-l2-independent": "Samodzielne ćwiczenia",
  "different-denom-l2-apples": "Kosz z jabłkami",
};

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

function digitCells(value: number): number {
  return String(Math.abs(value)).length;
}

function fixedCells(value: { numerator: number; denominator: number }) {
  return { numerator: digitCells(value.numerator), denominator: digitCells(value.denominator) };
}

type AppleCellName = "leftExpanded" | "rightExpanded" | "borrowedNumerator" | "resultWhole" | "resultNumerator";

function AppleCell({ value, label, active, onActivate }: { value: string; label: string; active: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly aria-label={label} onFocus={onActivate} onClick={onActivate} className={`h-11 w-11 rounded-lg border-2 bg-white text-center text-xl font-black ${active ? "border-indigo-600 ring-2 ring-indigo-200" : "border-indigo-300"}`} />;
}

function SolutionFraction({ complete, value, denominator, mixed = false }: { complete: boolean; value: MixedFractionValue; denominator: number; mixed?: boolean }) {
  if (complete) return <FractionVisual value={value} />;
  return <span className="inline-flex items-center gap-2 align-middle" aria-label="puste kratki do uzupełnienia">
    {mixed ? <b className="grid size-8 place-items-center rounded border-2 border-dashed border-slate-400">□</b> : null}
    <span className="grid min-w-8 text-center leading-none"><b>□</b><i className="my-1 border-t-2 border-slate-950" /><b>{denominator || "□"}</b></span>
  </span>;
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
  const fixedResultCells = {
    wholePart: task.requiresMixedResult ? digitCells(expected.wholePart) : undefined,
    numerator: digitCells(expected.numerator),
    denominator: digitCells(expected.denominator),
  };
  const leastCommon = leastCommonDenominatorAdvanced(task.left.denominator, task.right.denominator);
  const repairDefaults = activity === "different-denom-l2-repair";
  const guidedExample = activity === "different-denom-l2-subtraction-bars" || activity === "different-denom-l2-mixed-number";
  const [commonDenominator, setCommonDenominator] = useState<number | null>(guidedExample ? leastCommon : null);
  const [repairCommonDigits, setRepairCommonDigits] = useState<[string, string]>(["", ""]);
  const [activeRepairCommonDigit, setActiveRepairCommonDigit] = useState<0 | 1>(0);
  const [leftMultiplier, setLeftMultiplier] = useState(guidedExample ? leastCommon / task.left.denominator : 1);
  const [rightMultiplier, setRightMultiplier] = useState(guidedExample ? leastCommon / task.right.denominator : 1);
  const [expandedLeftStack, setExpandedLeftStack] = useState<FractionStackValue>(() => blankStack(false));
  const [expandedRightStack, setExpandedRightStack] = useState<FractionStackValue>(() => blankStack(false));
  const [rawResultStack, setRawResultStack] = useState<FractionStackValue>(() => blankStack(false));
  const [independentEntryStep, setIndependentEntryStep] = useState(0);
  const [independentEntry, setIndependentEntry] = useState<FractionStackValue>(() => blankStack(false));
  const [storyOperation, setStoryOperation] = useState<"+" | "−" | null>(null);
  const [appleStep, setAppleStep] = useState<1 | 2>(1);
  const [appleCells, setAppleCells] = useState<Record<AppleCellName, string>>({ leftExpanded: "", rightExpanded: "", borrowedNumerator: "", resultWhole: "", resultNumerator: "" });
  const [activeAppleCell, setActiveAppleCell] = useState<AppleCellName>("leftExpanded");
  const [storyAnswer, setStoryAnswer] = useState("");
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
  const independentPractice = activity === "different-denom-l2-independent" || activity === "different-denom-l2-apples";
  const appleStory = activity === "different-denom-l2-apples";
  const leftImproper = mixedToImproper(task.left);
  const rightImproper = mixedToImproper(task.right);
  const rawResult = applyDifferentDenominatorAdvancedOperation(task);
  const needsSimplification = greatestCommonDivisor(rawResult.numerator, rawResult.denominator) > 1 || rawResult.numerator >= rawResult.denominator;
  const independentTargets = [
    { numerator: leftImproper.numerator * ((commonDenominator ?? 1) / leftImproper.denominator), denominator: commonDenominator ?? 1, wholePart: 0 },
    { numerator: rightImproper.numerator * ((commonDenominator ?? 1) / rightImproper.denominator), denominator: commonDenominator ?? 1, wholePart: 0 },
    { numerator: rawResult.numerator, denominator: rawResult.denominator, wholePart: 0 },
    expected,
  ];

  const resetIndependentEntry = (step = 0) => {
    setIndependentEntryStep(step);
    setIndependentEntry(blankStack(step === 3 && task.requiresMixedResult));
  };

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
    if (activity === "different-denom-l2-independent") {
      setExpandedLeftStack(blankStack(false));
      setExpandedRightStack(blankStack(false));
      setRawResultStack(blankStack(false));
      resetIndependentEntry();
    }
    clearResult();
  };

  const editRepairCommonDenominator = (keyValue: string) => {
    const next = [...repairCommonDigits] as [string, string];
    if (keyValue === "backspace") {
      next[activeRepairCommonDigit] = "";
    } else if (/^[0-9]$/u.test(keyValue)) {
      next[activeRepairCommonDigit] = keyValue;
      if (activeRepairCommonDigit === 0) setActiveRepairCommonDigit(1);
    } else {
      return;
    }
    setRepairCommonDigits(next);
    const value = Number(next.join(""));
    if (next.every(Boolean)) chooseCommon(value);
    else {
      setCommonDenominator(null);
      setLeftMultiplier(1);
      setRightMultiplier(1);
      clearResult();
    }
  };

  const chooseDifficulty = (value: LessonDifficulty) => {
    const next = createPublicFractionDifferentDenominatorAdvancedTask({ seed: effectiveSeed, difficulty: value, activity });
    setActiveDifficulty(value);
    const nextLeast = leastCommonDenominatorAdvanced(next.left.denominator, next.right.denominator);
    setCommonDenominator(guidedExample ? nextLeast : null);
    setLeftMultiplier(guidedExample ? nextLeast / next.left.denominator : 1);
    setRightMultiplier(guidedExample ? nextLeast / next.right.denominator : 1);
    setResultStack(blankStack(next.requiresMixedResult));
    setExpandedLeftStack(blankStack(false));
    setExpandedRightStack(blankStack(false));
    setRawResultStack(blankStack(false));
    resetIndependentEntry();
    setWholeAssessment(null);
    setRepairStep(null);
    clearResult();
  };

  const check = () => {
    if (independentPractice) {
      if (appleStory) {
        if (storyOperation !== task.operation || !commonIsValid || storyAnswer.trim().length < 12) {
          setDiagnosticCode(FRACTION_FEEDBACK_CODES.wrongOperationPair);
          setSuccess(null);
          onResultChange?.(false);
          return;
        }
        if (appleCells.leftExpanded !== "3" || appleCells.rightExpanded !== "4" || appleCells.borrowedNumerator !== "9" || appleCells.resultWhole !== "2" || appleCells.resultNumerator !== "5") {
          setDiagnosticCode(FRACTION_FEEDBACK_CODES.wrongOperationPair);
          setSuccess(null);
          onResultChange?.(false);
          return;
        }
        setDiagnosticCode(null);
        setSuccess("Poprawnie — jabłka ważą 2 i 5/6 kg.");
        onResultChange?.(true, "Jabłka ważą 2 i 5/6 kg.");
        return;
      }
      const expandedLeft = parseFractionStackValue(expandedLeftStack);
      const expandedRight = parseFractionStackValue(expandedRightStack);
      const raw = parseFractionStackValue(rawResultStack);
      if (!expandedLeft.ok || !expandedRight.ok || !raw.ok || !commonDenominator) {
        setDiagnosticCode(FRACTION_FEEDBACK_CODES.emptyPart);
        setSuccess(null);
        onResultChange?.(false);
        return;
      }
      const expectedLeft = { numerator: leftImproper.numerator * (commonDenominator / leftImproper.denominator), denominator: commonDenominator };
      const expectedRight = { numerator: rightImproper.numerator * (commonDenominator / rightImproper.denominator), denominator: commonDenominator };
      const expandedCorrect = expandedLeft.value.numerator === expectedLeft.numerator && expandedLeft.value.denominator === expectedLeft.denominator
        && expandedRight.value.numerator === expectedRight.numerator && expandedRight.value.denominator === expectedRight.denominator;
      const rawCorrect = raw.value.numerator === rawResult.numerator && raw.value.denominator === rawResult.denominator;
      if (!expandedCorrect || !rawCorrect) {
        setDiagnosticCode(FRACTION_FEEDBACK_CODES.wrongOperationPair);
        setSuccess(null);
        onResultChange?.(false);
        return;
      }
    }
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

  const submitIndependentEntry = (parsed: Extract<ReturnType<typeof parseFractionStackValue>, { ok: true }>) => {
    if (!commonDenominator) return;
    const target = independentTargets[independentEntryStep]!;
    const wholePart = numberFromCells(independentEntry.wholePart);
    if (parsed.value.numerator !== target.numerator || parsed.value.denominator !== target.denominator || wholePart !== target.wholePart) {
      setDiagnosticCode(FRACTION_FEEDBACK_CODES.wrongOperationPair);
      return;
    }
    if (independentEntryStep === 0) setExpandedLeftStack(independentEntry);
    if (independentEntryStep === 1) setExpandedRightStack(independentEntry);
    if (independentEntryStep === 2) setRawResultStack(independentEntry);
    if (independentEntryStep === 3) setResultStack(independentEntry);
    setDiagnosticCode(null);
    setSuccess(null);
    if (independentEntryStep < 3) resetIndependentEntry(independentEntryStep + 1);
    else setIndependentEntryStep(4);
  };

  const renderIndependentSlot = (step: number, denominator: number, mixed = false) => {
    if (independentEntryStep !== step) return <SolutionFraction complete={independentEntryStep > step} value={independentTargets[step]!} denominator={denominator} mixed={mixed} />;
    return <FractionStackInput key={step} inline value={independentEntry} onChange={(value) => { setIndependentEntry(value); clearResult(); }} showWholePart={mixed} fixedDigitCells={fixedCells(independentTargets[step]!)} readOnly={controlsLocked} ariaLabel="Kratki w zapisie działania" stepLabel="Wpisz liczbę bezpośrednio w działaniu i zatwierdź kalkulatorem" onSubmit={submitIndependentEntry} />;
  };

  const expandedLeft = commonIsValid && commonDenominator
    ? { numerator: mixedToImproper(task.left).numerator * (commonDenominator / task.left.denominator), denominator: commonDenominator }
    : { numerator: task.left.numerator, denominator: task.left.denominator };
  const expandedRight = commonIsValid && commonDenominator
    ? { numerator: mixedToImproper(task.right).numerator * (commonDenominator / task.right.denominator), denominator: commonDenominator }
    : { numerator: task.right.numerator, denominator: task.right.denominator };

  return (
    <LessonTaskFrame contentClassName="grid gap-4" eyebrow="Dział 3 · Ułamki zwykłe" heading={TITLES[activity]} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount} data-fraction-different-denominator-advanced data-fraction-activity={activity} data-generator-id={task.generatorId} data-diagnostic-code={diagnosticCode ?? undefined}>

      {activity !== "different-denom-l2-repair" && !independentPractice ? <SmartOperation left={task.left} right={task.right} operation={task.operation} commonDenominator={commonDenominator} leftMultiplier={leftMultiplier} rightMultiplier={rightMultiplier} result={expected} /> : null}

      {independentPractice ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-4" data-independent-fraction-workspace>
        {appleStory ? <section className="grid gap-4 rounded-2xl border-2 border-rose-200 bg-amber-50 p-4" data-apple-basket-problem>
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-end gap-1 text-5xl" aria-label="Kosz pełen jabłek"><span aria-hidden>🧺</span><span aria-hidden>🍎</span><span aria-hidden>🍎</span><span aria-hidden>🍎</span></div>
            <div><h3 className="text-xl font-black">Kosz z jabłkami</h3><p className="flex flex-wrap items-center gap-2">Kosz z jabłkami waży <FractionVisual value={task.left} /><b>kg</b>. Pusty kosz waży <FractionVisual value={task.right} /><b>kg</b>. Ile ważą jabłka?</p></div>
          </div>
          <section className="grid gap-3 rounded-xl bg-white p-3">
            <h3 className="font-black">Zadanie 1/2 · Wybierz działanie</h3>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="text-center"><b>Pełny kosz</b><FractionVisual value={task.left} /></div><div className="flex justify-center gap-2" role="group" aria-label="Znak działania">{(["+", "−"] as const).map((symbol) => <button key={symbol} type="button" disabled={controlsLocked || appleStep === 2} aria-pressed={storyOperation === symbol} onClick={() => { setStoryOperation(symbol); clearResult(); }} className="min-h-11 min-w-12 rounded-xl border-2 border-indigo-300 bg-white text-xl font-black aria-pressed:bg-indigo-700 aria-pressed:text-white">{symbol}</button>)}</div><div className="text-center"><b>Pusty kosz</b><FractionVisual value={task.right} /></div></div>
            {appleStep === 1 && !controlsLocked ? <button type="button" className="min-h-11 rounded-xl bg-indigo-700 px-4 font-black text-white" onClick={() => { if (storyOperation === task.operation) { setAppleStep(2); clearResult(); } else setDiagnosticCode(FRACTION_FEEDBACK_CODES.wrongOperationPair); }}>Przejdź do zadania 2</button> : null}
          </section>
          {appleStep === 2 ? <section className="grid gap-3 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3">
            <h3 className="font-black">Zadanie 2/2 · Pokaż kolejne kroki</h3>
            <p>Wybierz wspólny mianownik:</p><div className="flex flex-wrap gap-2">{task.commonDenominatorOptions.map((option) => <button key={option} type="button" disabled={controlsLocked} aria-pressed={commonDenominator === option} className="min-h-11 min-w-14 rounded-xl border-2 border-slate-300 bg-white px-3 font-black aria-pressed:bg-indigo-700 aria-pressed:text-white" onClick={() => chooseCommon(option)}>{option}</button>)}</div>
            {commonIsValid ? <><div className="grid gap-3 rounded-xl bg-white p-3 text-center font-black"><div className="flex flex-wrap items-center justify-center gap-2"><FractionVisual value={task.left} /><span>=</span><b>4</b><span className="grid min-w-8 leading-none"><AppleCell value={appleCells.leftExpanded} label="Licznik pierwszego ułamka po rozszerzeniu" active={activeAppleCell === "leftExpanded"} onActivate={() => setActiveAppleCell("leftExpanded")} /><i className="my-1 border-t-2 border-slate-950" /><b>6</b></span></div><div className="flex flex-wrap items-center justify-center gap-2"><FractionVisual value={task.right} /><span>=</span><b>1</b><span className="grid min-w-8 leading-none"><AppleCell value={appleCells.rightExpanded} label="Licznik drugiego ułamka po rozszerzeniu" active={activeAppleCell === "rightExpanded"} onActivate={() => setActiveAppleCell("rightExpanded")} /><i className="my-1 border-t-2 border-slate-950" /><b>6</b></span></div><p>Po zamianie jednej całości:</p><div className="flex flex-wrap items-center justify-center gap-2"><b>3</b><span className="grid min-w-8 leading-none"><AppleCell value={appleCells.borrowedNumerator} label="Licznik po zamianie jednej całości" active={activeAppleCell === "borrowedNumerator"} onActivate={() => setActiveAppleCell("borrowedNumerator")} /><i className="my-1 border-t-2 border-slate-950" /><b>6</b></span><b>−</b><b>1</b><span className="grid min-w-8 leading-none"><b>4</b><i className="my-1 border-t-2 border-slate-950" /><b>6</b></span><b>=</b><AppleCell value={appleCells.resultWhole} label="Część całkowita wyniku" active={activeAppleCell === "resultWhole"} onActivate={() => setActiveAppleCell("resultWhole")} /><span className="grid min-w-8 leading-none"><AppleCell value={appleCells.resultNumerator} label="Licznik wyniku" active={activeAppleCell === "resultNumerator"} onActivate={() => setActiveAppleCell("resultNumerator")} /><i className="my-1 border-t-2 border-slate-950" /><b>6</b></span></div></div>{!controlsLocked ? <LessonNumericKeypad label="Kalkulator do kosza z jabłkami" helperText="Wybierz pustą kratkę, potem cyfrę." onKey={(keyValue) => { const order: AppleCellName[] = ["leftExpanded", "rightExpanded", "borrowedNumerator", "resultWhole", "resultNumerator"]; if (keyValue === "backspace") { setAppleCells((current) => ({ ...current, [activeAppleCell]: "" })); return; } if (!/^[0-9]$/u.test(keyValue)) return; setAppleCells((current) => ({ ...current, [activeAppleCell]: keyValue })); const next = order[Math.min(order.length - 1, order.indexOf(activeAppleCell) + 1)]!; setActiveAppleCell(next); clearResult(); }} /> : null}</> : null}
            {commonIsValid ? <><label className="grid gap-2 font-black">Odpowiedź pełnym zdaniem<textarea value={storyAnswer} onChange={(event) => { setStoryAnswer(event.target.value); clearResult(); }} readOnly={controlsLocked} rows={2} className="rounded-xl border-2 border-slate-300 bg-white p-3 font-normal" placeholder="Jabłka ważą… kg." /></label>{!controlsLocked ? <button type="button" className="min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white" onClick={check}>Sprawdź rozwiązanie</button> : null}</> : null}
          </section> : null}
        </section> : <div className="flex items-center justify-center gap-3 text-xl font-black">
          <FractionVisual value={task.left} /><span>{task.operation}</span><FractionVisual value={task.right} />
        </div>}
        {!appleStory ? <>
          <section className="grid gap-3 rounded-xl bg-indigo-50 p-3">
            <h3 className="font-black">1. Wybierz wspólny mianownik</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Wspólny mianownik do samodzielnego ćwiczenia">
              {task.commonDenominatorOptions.map((option) => <button key={option} type="button" disabled={controlsLocked} aria-pressed={commonDenominator === option} className="min-h-11 min-w-14 rounded-xl border-2 border-slate-300 bg-white px-3 font-black aria-pressed:bg-indigo-700 aria-pressed:text-white" onClick={() => chooseCommon(option)}>{option}</button>)}
            </div>
          </section>
          {commonIsValid ? <><section className="grid gap-3 rounded-xl border-2 border-slate-200 p-3"><h3 className="font-black">2. Zapis rozwiązania</h3><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><FractionVisual value={task.left} /><span>{task.operation}</span><FractionVisual value={task.right} /><span>=</span>{renderIndependentSlot(0, commonDenominator)}<span>{task.operation}</span>{renderIndependentSlot(1, commonDenominator)}<span>=</span>{renderIndependentSlot(2, rawResult.denominator)}<span>=</span>{renderIndependentSlot(3, expected.denominator, task.requiresMixedResult)}</div></section>{independentEntryStep < 4 ? <p className="rounded-xl bg-indigo-50 p-3 text-center font-bold">{["Wpisz pierwszy ułamek ze wspólnym mianownikiem", "Wpisz drugi ułamek ze wspólnym mianownikiem", "Wpisz wynik działania", needsSimplification ? "Skróć lub zapisz liczbę mieszaną" : "Zapisz wynik końcowy"][independentEntryStep]}</p> : <button type="button" className="min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white" onClick={check}>Sprawdź całe rozwiązanie</button>}</> : <p className="font-bold text-slate-600">Najpierw wybierz wspólny mianownik.</p>}
        </> : null}
      </section> : null}

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

      {!repairDefaults && !guidedExample && !independentPractice ? (
        <section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <h3 className="font-black">1. Wybierz wspólny mianownik</h3>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Wspólny mianownik L2">
            {task.commonDenominatorOptions.map((option) => <button key={option} type="button" disabled={controlsLocked} aria-pressed={commonDenominator === option} className="min-h-11 min-w-14 rounded-xl border-2 border-slate-300 bg-white px-3 font-black aria-pressed:bg-indigo-700 aria-pressed:text-white" onClick={() => chooseCommon(option)}>{option}</button>)}
          </div>
          <p role="status" className={commonDenominator === null ? "text-slate-600" : commonIsValid ? "font-bold text-emerald-700" : "font-bold text-amber-800"}>{commonDenominator === null ? "Znajdź liczbę podzielną przez oba mianowniki." : commonIsValid ? `${commonDenominator} pasuje do obu podziałek.` : `${commonDenominator} nie jest wspólną miarą.`}</p>
        </section>
      ) : null}

      {!independentPractice && (activity !== "different-denom-l2-repair" || repairStep === "denominator-operation") ? <section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4" data-member-id="different-denom-l2-operation">
        <h3 className="font-black">
          {activity === "different-denom-l2-repair"
            ? "2. Wpisz wspólny mianownik, potem wynik dodawania"
            : "2. Zapisz wynik w pionowych kratkach"}
        </h3>
        {activity === "different-denom-l2-repair" ? <div className="grid gap-3 rounded-xl bg-indigo-50 p-3" data-repair-common-denominator>
          <p className="font-black">Najpierw wpisz wspólny mianownik dla dodawania.</p>
          <div className="flex justify-center gap-2" role="group" aria-label="Wspólny mianownik do naprawy">
            {repairCommonDigits.map((digit, index) => <input key={index} value={digit} inputMode="none" readOnly aria-label={`Wspólny mianownik, cyfra ${index + 1} z 2`} className="h-12 w-12 rounded-xl border-2 border-indigo-300 bg-white text-center text-xl font-black" onFocus={() => setActiveRepairCommonDigit(index as 0 | 1)} onClick={() => setActiveRepairCommonDigit(index as 0 | 1)} />)}
          </div>
          {!controlsLocked ? <LessonNumericKeypad label="Klawiatura wspólnego mianownika" helperText="Wybierz kratkę wspólnego mianownika, a potem wpisz cyfry." onKey={editRepairCommonDenominator} /> : null}
        </div> : null}
        <FractionStackInput value={resultStack} onChange={(value) => { setResultStack(value); clearResult(); }} showWholePart={task.requiresMixedResult} fixedDigitCells={fixedResultCells} readOnly={controlsLocked} ariaLabel="Wynik działania L2 w pionowych kratkach" stepLabel="Wynik i najprostsza postać" onSubmit={check} />
        {!controlsLocked ? <button type="button" className="min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white" onClick={check}>Sprawdź rozwiązanie L2</button> : null}
      </section> : null}

      {success ? <p className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 font-black text-emerald-900" role="status">✓ {success}</p> : null}
      {diagnostic ? onResultChange ? (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted />
      ) : (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
