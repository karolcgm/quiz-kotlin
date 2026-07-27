"use client";

import { useMemo, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
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
import { mixedToImproper, parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionDigit, FractionStackValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";

const TITLES: Record<FractionDifferentDenominatorAdvancedActivity, string> = {
  "different-denom-l2-subtraction-bars": "Dodawanie ułamków o różnych mianownikach",
  "different-denom-l2-mixed-number": "Odejmowanie o różnych mianownikach",
  "different-denom-l2-greenhouse": "Mikstura dla szklarni",
  "different-denom-l2-repair": "Napraw rozwiązanie",
  "different-denom-l2-independent": "Dodawanie i odejmowanie ułamków o różnych mianownikach",
  "different-denom-review-independent": "Dodawanie i odejmowanie ułamków o różnych mianownikach",
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

type AppleCellName = "leftExpanded" | "rightExpanded" | "borrowedNumerator" | "resultWhole" | "resultNumerator";
type IndependentCellPart = "wholePart" | "numerator" | "denominator";
type IndependentActiveCell = { step: number; part: IndependentCellPart; index: number };
type GuidedCellName = "left" | "right" | "result";
type GuidedActiveCell = { name: GuidedCellName; index: number };

function AppleCell({ value, label, active, disabled = false, onActivate }: { value: string; label: string; active: boolean; disabled?: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly disabled={disabled} aria-label={label} onFocus={onActivate} onClick={onActivate} className={`h-11 w-11 rounded-lg border-2 bg-white text-center text-xl font-black disabled:text-slate-950 disabled:opacity-100 ${active ? "border-indigo-600 ring-2 ring-indigo-200" : "border-indigo-300"}`} />;
}

function IndependentFractionInput({
  value,
  target,
  showWholePart,
  step,
  activeCell,
  interactive,
  labelPrefix,
  onActivate,
}: {
  value: FractionStackValue;
  target: MixedFractionValue;
  showWholePart: boolean;
  step: number;
  activeCell: IndependentActiveCell;
  interactive: boolean;
  labelPrefix: string;
  onActivate: (part: IndependentCellPart, index: number) => void;
}) {
  const renderRow = (part: "numerator" | "denominator", count: number) => (
    <span className="flex justify-center gap-1">
      {Array.from({ length: count }, (_, index) => (
        <AppleCell
          key={`${part}-${index}`}
          value={value[part][index] ?? ""}
          label={`${labelPrefix}: ${part === "numerator" ? "licznik" : "mianownik"}, cyfra ${index + 1} z ${count}`}
          active={interactive && activeCell.step === step && activeCell.part === part && activeCell.index === index}
          disabled={!interactive}
          onActivate={() => { if (interactive) onActivate(part, index); }}
        />
      ))}
    </span>
  );

  return (
    <span className="inline-flex shrink-0 items-center gap-2 align-middle" data-independent-fraction-entry>
      {showWholePart ? <span className="flex justify-center gap-1">{Array.from({ length: digitCells(target.wholePart) }, (_, index) => <AppleCell key={index} value={value.wholePart?.[index] ?? ""} label={`${labelPrefix}: część całkowita, cyfra ${index + 1} z ${digitCells(target.wholePart)}`} active={interactive && activeCell.step === step && activeCell.part === "wholePart" && activeCell.index === index} disabled={!interactive} onActivate={() => { if (interactive) onActivate("wholePart", index); }} />)}</span> : null}
      <span className="grid gap-1 text-center leading-none">
        {renderRow("numerator", digitCells(target.numerator))}
        <i className="border-t-2 border-slate-950" />
        {renderRow("denominator", digitCells(target.denominator))}
      </span>
    </span>
  );
}

function GuidedNumeratorCells({ value, count, label, activeCell, name, onActivate }: { value: readonly FractionDigit[]; count: number; label: string; activeCell: GuidedActiveCell; name: GuidedCellName; onActivate: (name: GuidedCellName, index: number) => void }) {
  return <span className="flex justify-center gap-1">{Array.from({ length: count }, (_, index) => <AppleCell key={index} value={value[index] ?? ""} label={`${label}, cyfra ${index + 1} z ${count}`} active={activeCell.name === name && activeCell.index === index} onActivate={() => onActivate(name, index)} />)}</span>;
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
  const activeDifficulty = difficulty;
  const task = useMemo(() => createPublicFractionDifferentDenominatorAdvancedTask({ seed: effectiveSeed, difficulty: activeDifficulty, activity }), [activity, activeDifficulty, effectiveSeed]);
  const expected = simplifiedDifferentDenominatorAdvancedResult(task);
  const leastCommon = leastCommonDenominatorAdvanced(task.left.denominator, task.right.denominator);
  const repairDefaults = activity === "different-denom-l2-repair";
  const guidedExample = activity === "different-denom-l2-subtraction-bars" || activity === "different-denom-l2-mixed-number";
  const [commonDenominator, setCommonDenominator] = useState<number | null>(guidedExample ? leastCommon : null);
  const [repairCommonDigits, setRepairCommonDigits] = useState<[string, string]>(["", ""]);
  const [activeRepairCommonDigit, setActiveRepairCommonDigit] = useState<0 | 1>(0);
  const [leftMultiplier, setLeftMultiplier] = useState(guidedExample ? leastCommon / task.left.denominator : 1);
  const [rightMultiplier, setRightMultiplier] = useState(guidedExample ? leastCommon / task.right.denominator : 1);
  const [independentEntries, setIndependentEntries] = useState<FractionStackValue[]>(() => Array.from({ length: 5 }, () => blankStack(false)));
  const [independentActiveCell, setIndependentActiveCell] = useState<IndependentActiveCell>({ step: 0, part: "numerator", index: 0 });
  const [storyOperation, setStoryOperation] = useState<"+" | "−" | null>(null);
  const [appleStep, setAppleStep] = useState<1 | 2>(1);
  const [appleCells, setAppleCells] = useState<Record<AppleCellName, string>>({ leftExpanded: "", rightExpanded: "", borrowedNumerator: "", resultWhole: "", resultNumerator: "" });
  const [activeAppleCell, setActiveAppleCell] = useState<AppleCellName>("leftExpanded");
  const [guidedCells, setGuidedCells] = useState<Record<GuidedCellName, FractionDigit[]>>({ left: [""], right: [""], result: [""] });
  const [activeGuidedCell, setActiveGuidedCell] = useState<GuidedActiveCell>({ name: "left", index: 0 });
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
  const independentPractice = activity === "different-denom-l2-independent" || activity === "different-denom-review-independent" || activity === "different-denom-l2-apples";
  const appleStory = activity === "different-denom-l2-apples";
  const stepwiseCalculation = activity === "different-denom-l2-independent" || activity === "different-denom-review-independent" || activity === "different-denom-l2-greenhouse" || activity === "different-denom-l2-repair";
  const guidedNumeratorEntry = activity === "different-denom-l2-subtraction-bars" || activity === "different-denom-l2-mixed-number";
  const leftImproper = mixedToImproper(task.left);
  const rightImproper = mixedToImproper(task.right);
  const rawResult = applyDifferentDenominatorAdvancedOperation(task);
  const workingCommon = commonDenominator ?? leastCommon;
  const expandedLeftMixed: MixedFractionValue = { wholePart: task.left.wholePart, numerator: task.left.numerator * (workingCommon / task.left.denominator), denominator: workingCommon };
  const expandedRightMixed: MixedFractionValue = { wholePart: task.right.wholePart, numerator: task.right.numerator * (workingCommon / task.right.denominator), denominator: workingCommon };
  const borrowingNeeded = task.operation === "−" && expandedLeftMixed.numerator < expandedRightMixed.numerator;
  const borrowedLeft: MixedFractionValue = borrowingNeeded
    ? { wholePart: expandedLeftMixed.wholePart - 1, numerator: expandedLeftMixed.numerator + workingCommon, denominator: workingCommon }
    : expandedLeftMixed;
  const calculationResult: MixedFractionValue = task.operation === "+"
    ? { wholePart: expandedLeftMixed.wholePart + expandedRightMixed.wholePart, numerator: expandedLeftMixed.numerator + expandedRightMixed.numerator, denominator: workingCommon }
    : { wholePart: borrowedLeft.wholePart - expandedRightMixed.wholePart, numerator: borrowedLeft.numerator - expandedRightMixed.numerator, denominator: workingCommon };
  const calculationNeedsFinalForm = calculationResult.wholePart !== expected.wholePart
    || calculationResult.numerator !== expected.numerator
    || calculationResult.denominator !== expected.denominator;
  const independentTargets = [
    expandedLeftMixed,
    expandedRightMixed,
    ...(borrowingNeeded ? [borrowedLeft] : []),
    calculationResult,
    ...(calculationNeedsFinalForm ? [expected] : []),
  ];
  const calculationResultStep = borrowingNeeded ? 3 : 2;
  const finalIndependentStep = independentTargets.length - 1;
  const guidedAnswers: Record<GuidedCellName, string> = {
    left: String(leftImproper.numerator * (leastCommon / leftImproper.denominator)),
    right: String(rightImproper.numerator * (leastCommon / rightImproper.denominator)),
    result: String(rawResult.numerator),
  };

  const resetIndependentEntry = (step = 0) => {
    const showWholePart = (independentTargets[step]?.wholePart ?? 0) > 0;
    setIndependentEntries(independentTargets.map((target) => blankStack(target.wholePart > 0)));
    setIndependentActiveCell({ step, part: showWholePart ? "wholePart" : "numerator", index: 0 });
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
    if (stepwiseCalculation) {
      setResultStack(blankStack(task.requiresMixedResult));
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

  const check = () => {
    if (guidedNumeratorEntry) {
      if ((Object.keys(guidedAnswers) as GuidedCellName[]).every((name) => guidedCells[name].join("") === guidedAnswers[name])) {
        setDiagnosticCode(null);
        setSuccess(activity === "different-denom-l2-subtraction-bars" ? "Poprawnie: oba ułamki zapisano w szóstych częściach, a liczniki dają pięć szóstych." : "Poprawnie: dziesięć dwunastych minus trzy dwunaste daje siedem dwunastych.");
        onResultChange?.(true, `${operandText(task.left)} ${task.operation} ${operandText(task.right)} = ${mixedText(expected)}`);
      } else {
        setDiagnosticCode(FRACTION_FEEDBACK_CODES.wrongOperationPair);
        setSuccess(null);
        onResultChange?.(false);
      }
      return;
    }
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
    let submittedStack = resultStack;
    if (stepwiseCalculation) {
      const requiredEntries = independentEntries.slice(0, finalIndependentStep + 1);
      if (!commonDenominator || requiredEntries.some((entry) => !parseFractionStackValue(entry).ok)) {
        setDiagnosticCode(FRACTION_FEEDBACK_CODES.emptyPart);
        setSuccess(null);
        onResultChange?.(false);
        return;
      }
      const allStepsCorrect = requiredEntries.every((entry, index) => {
        const target = independentTargets[index]!;
        return numberFromCells(entry.numerator) === target.numerator
          && numberFromCells(entry.denominator) === target.denominator
          && numberFromCells(entry.wholePart) === target.wholePart;
      });
      if (!allStepsCorrect) {
        setDiagnosticCode(FRACTION_FEEDBACK_CODES.wrongOperationPair);
        setSuccess(null);
        onResultChange?.(false);
        return;
      }
      submittedStack = independentEntries[finalIndependentStep]!;
    }
    const parsed = parseFractionStackValue(submittedStack);
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
        usedMixedFormat: numberFromCells(submittedStack.wholePart) > 0,
        submittedFractionalNumerator: numberFromCells(submittedStack.numerator),
        submittedFractionalDenominator: numberFromCells(submittedStack.denominator),
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

  const editIndependentEntry = (keyValue: string) => {
    const { step, part, index } = independentActiveCell;
    if (step > finalIndependentStep) return;
    const currentEntry = independentEntries[step]!;
    const next = { wholePart: currentEntry.wholePart ? [...currentEntry.wholePart] : undefined, numerator: [...currentEntry.numerator], denominator: [...currentEntry.denominator] };
    if (part === "wholePart" && !next.wholePart) next.wholePart = [""];
    const row = part === "wholePart" ? next.wholePart! : next[part];
    if (keyValue === "backspace") row[index] = "";
    else if (/^[0-9]$/u.test(keyValue)) row[index] = keyValue as FractionDigit;
    else return;
    setIndependentEntries((current) => current.map((entry, entryStep) => entryStep === step ? next : entry));
    if (keyValue !== "backspace") {
      const cellOrder: IndependentActiveCell[] = independentTargets
        .slice(0, finalIndependentStep + 1)
        .flatMap((target, targetStep) => [
          ...((target.wholePart ?? 0) > 0 ? Array.from({ length: digitCells(target.wholePart) }, (_, cellIndex) => ({ step: targetStep, part: "wholePart" as const, index: cellIndex })) : []),
          ...Array.from({ length: digitCells(target.numerator) }, (_, cellIndex) => ({ step: targetStep, part: "numerator" as const, index: cellIndex })),
          ...Array.from({ length: digitCells(target.denominator) }, (_, cellIndex) => ({ step: targetStep, part: "denominator" as const, index: cellIndex })),
        ]);
      const activeIndex = cellOrder.findIndex((cell) => cell.step === step && cell.part === part && cell.index === index);
      setIndependentActiveCell(cellOrder[Math.min(cellOrder.length - 1, activeIndex + 1)]!);
    }
    clearResult();
  };

  const renderIndependentSlot = (step: number) => {
    const showWholePart = independentTargets[step]!.wholePart > 0;
    return <IndependentFractionInput value={independentEntries[step]!} target={independentTargets[step]!} showWholePart={showWholePart} step={step} activeCell={independentActiveCell} interactive={commonIsValid && !controlsLocked} labelPrefix={`Krok ${step + 1}`} onActivate={(part, index) => setIndependentActiveCell({ step, part, index })} />;
  };

  const editGuidedCells = (keyValue: string) => {
    const { name, index } = activeGuidedCell;
    if (keyValue !== "backspace" && !/^[0-9]$/u.test(keyValue)) return;
    setGuidedCells((current) => {
      const next = { left: [...current.left], right: [...current.right], result: [...current.result] };
      next[name][index] = keyValue === "backspace" ? "" : keyValue as FractionDigit;
      return next;
    });
    if (keyValue !== "backspace") {
      const order = (Object.keys(guidedAnswers) as GuidedCellName[]).flatMap((cellName) => Array.from({ length: guidedAnswers[cellName].length }, (_, cellIndex) => ({ name: cellName, index: cellIndex })));
      const activeIndex = order.findIndex((cell) => cell.name === name && cell.index === index);
      setActiveGuidedCell(order[Math.min(order.length - 1, activeIndex + 1)]!);
    }
    clearResult();
  };

  const renderStepwiseWorkspace = (keypadLabel: string, enterCommonWithSameKeypad = false) => commonIsValid || enterCommonWithSameKeypad ? <>
    <section className="grid gap-3 rounded-xl border-2 border-slate-200 bg-white p-3" data-stepwise-fraction-workspace>
      <h3 className="font-black">Zapis rozwiązania krok po kroku</h3>
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-4 py-2 text-xl font-black" data-independent-equation-chain>
        <span className="inline-flex shrink-0 items-center gap-3" data-equation-group="source"><FractionVisual value={task.left} /><span>{task.operation}</span><FractionVisual value={task.right} /></span>
        <span className="flex max-w-full min-w-0 items-center gap-3 overflow-x-auto px-1 py-1" data-equation-group="common"><span>=</span>{renderIndependentSlot(0)}<span>{task.operation}</span>{renderIndependentSlot(1)}</span>
        {borrowingNeeded ? <span className="flex max-w-full min-w-0 items-center gap-3 overflow-x-auto px-1 py-1" data-equation-group="borrowing"><span>=</span>{renderIndependentSlot(2)}<span>{task.operation}</span><FractionVisual value={expandedRightMixed} /></span> : null}
        <span className="inline-flex shrink-0 items-center gap-3" data-equation-group="calculation"><span>=</span>{renderIndependentSlot(calculationResultStep)}</span>
        {calculationNeedsFinalForm ? <span className="inline-flex shrink-0 items-center gap-3" data-equation-group="simplified-final"><span className="text-sm font-bold text-indigo-700">po skróceniu</span><span>=</span>{renderIndependentSlot(finalIndependentStep)}</span> : null}
      </div>
    </section>
    <section className="grid gap-3 rounded-xl border-2 border-indigo-200 bg-white p-3"><h3 className="font-black">{commonIsValid ? "Uzupełnij wszystkie kratki i zatwierdź całe rozwiązanie" : "Najpierw wpisz wspólny mianownik"}</h3>{!controlsLocked ? <LessonNumericKeypad label={keypadLabel} helperText={commonIsValid ? "Kliknij dowolną kratkę w działaniu, wpisz cyfry i zatwierdź całe rozwiązanie jeden raz na końcu." : "Wpisz wspólny mianownik. Potem tym samym kalkulatorem uzupełnisz całe działanie."} onKey={commonIsValid ? editIndependentEntry : editRepairCommonDenominator} onConfirm={commonIsValid ? check : undefined} /> : null}</section>
  </> : null;

  const expandedLeft = commonIsValid && commonDenominator
    ? { numerator: mixedToImproper(task.left).numerator * (commonDenominator / task.left.denominator), denominator: commonDenominator }
    : { numerator: task.left.numerator, denominator: task.left.denominator };
  const expandedRight = commonIsValid && commonDenominator
    ? { numerator: mixedToImproper(task.right).numerator * (commonDenominator / task.right.denominator), denominator: commonDenominator }
    : { numerator: task.right.numerator, denominator: task.right.denominator };

  return (
    <LessonTaskFrame contentClassName="grid gap-4" eyebrow="Dział 3 · Ułamki zwykłe" heading={TITLES[activity]} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount} data-fraction-different-denominator-advanced data-fraction-activity={activity} data-generator-id={task.generatorId} data-diagnostic-code={diagnosticCode ?? undefined}>

      {!stepwiseCalculation && !independentPractice && !guidedNumeratorEntry ? <SmartOperation left={task.left} right={task.right} operation={task.operation} commonDenominator={commonDenominator} leftMultiplier={leftMultiplier} rightMultiplier={rightMultiplier} result={expected} /> : null}

      {guidedNumeratorEntry ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-4" data-guided-operation-chain><h3 className="font-black">Wpisz liczniki po sprowadzeniu do wspólnego mianownika</h3><div className="flex flex-nowrap items-center justify-center gap-3 overflow-x-auto py-2 text-xl font-black"><FractionVisual value={task.left} /><span>{task.operation}</span><FractionVisual value={task.right} /><span>=</span><span className="grid shrink-0 text-center leading-none"><GuidedNumeratorCells value={guidedCells.left} count={guidedAnswers.left.length} label="Pierwszy licznik" activeCell={activeGuidedCell} name="left" onActivate={(name, index) => setActiveGuidedCell({ name, index })} /><i className="my-1 border-t-2 border-slate-950" /><b>{leastCommon}</b></span><span>{task.operation}</span><span className="grid shrink-0 text-center leading-none"><GuidedNumeratorCells value={guidedCells.right} count={guidedAnswers.right.length} label="Drugi licznik" activeCell={activeGuidedCell} name="right" onActivate={(name, index) => setActiveGuidedCell({ name, index })} /><i className="my-1 border-t-2 border-slate-950" /><b>{leastCommon}</b></span><span>=</span><span className="grid shrink-0 text-center leading-none"><GuidedNumeratorCells value={guidedCells.result} count={guidedAnswers.result.length} label="Licznik wyniku" activeCell={activeGuidedCell} name="result" onActivate={(name, index) => setActiveGuidedCell({ name, index })} /><i className="my-1 border-t-2 border-slate-950" /><b>{leastCommon}</b></span></div>{!controlsLocked ? <><LessonNumericKeypad label={`Kalkulator do ${task.operation === "+" ? "dodawania" : "odejmowania"} o różnych mianownikach`} helperText="Wybierz kratkę, potem wpisz cyfrę." onKey={editGuidedCells} /><button type="button" className="min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white" onClick={check}>Sprawdź rozwiązanie</button></> : null}</section> : null}

      {independentPractice ? <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-4" data-independent-fraction-workspace>
        {appleStory ? <section className="grid gap-4 rounded-2xl border-2 border-rose-200 bg-amber-50 p-4" data-apple-basket-problem>
          <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-end gap-1 text-5xl" aria-label="Kosz pełen jabłek"><span aria-hidden>🧺</span><span aria-hidden>🍎</span><span aria-hidden>🍎</span><span aria-hidden>🍎</span></div>
            <div><h3 className="text-xl font-black">Kosz z jabłkami</h3><p className="flex flex-wrap items-center gap-2">Kosz z jabłkami waży <FractionVisual value={task.left} /><b>kg</b>. Pusty kosz waży <FractionVisual value={task.right} /><b>kg</b>. Ile ważą jabłka?</p></div>
          </div>
          <section className="grid gap-3 rounded-xl bg-white p-3">
            <h3 className="font-black">Zadanie 1/2 · Wybierz działanie</h3>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="grid justify-items-center gap-2 text-center"><b>Pełny kosz</b><FractionVisual value={task.left} /></div><div className="flex justify-center gap-2" role="group" aria-label="Znak działania">{(["+", "−"] as const).map((symbol) => <button key={symbol} type="button" disabled={controlsLocked || appleStep === 2} aria-pressed={storyOperation === symbol} onClick={() => { setStoryOperation(symbol); clearResult(); }} className="min-h-11 min-w-12 rounded-xl border-2 border-indigo-300 bg-white text-xl font-black aria-pressed:bg-indigo-700 aria-pressed:text-white">{symbol}</button>)}</div><div className="grid justify-items-center gap-2 text-center"><b>Pusty kosz</b><FractionVisual value={task.right} /></div></div>
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
            <div className="flex flex-wrap gap-2" role="group" aria-label="Wspólny mianownik działania">
              {task.commonDenominatorOptions.map((option) => <button key={option} type="button" disabled={controlsLocked} aria-pressed={commonDenominator === option} className="min-h-11 min-w-14 rounded-xl border-2 border-slate-300 bg-white px-3 font-black aria-pressed:bg-indigo-700 aria-pressed:text-white" onClick={() => chooseCommon(option)}>{option}</button>)}
            </div>
          </section>
          {commonIsValid ? renderStepwiseWorkspace("Kalkulator do dodawania i odejmowania ułamków") : <p className="font-bold text-slate-600">Najpierw wybierz wspólny mianownik.</p>}
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
            {REPAIR_OPTIONS.map((option) => <button key={option.value} type="button" disabled={controlsLocked} aria-pressed={repairStep === option.value} className="min-h-12 rounded-xl border-2 border-violet-300 bg-white px-3 text-left font-bold aria-pressed:bg-violet-700 aria-pressed:text-white" onClick={() => { setRepairStep(option.value); setRepairCommonDigits(["", ""]); setCommonDenominator(null); setLeftMultiplier(1); setRightMultiplier(1); setResultStack(blankStack(task.requiresMixedResult)); resetIndependentEntry(); clearResult(); }}>{option.label}</button>)}
          </div>
        </section>
      ) : null}

      {activity === "different-denom-l2-repair" && repairStep === "denominator-operation" ? <>
        <section className="grid gap-3 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3" data-repair-common-denominator>
          <h3 className="font-black">Wpisz wspólny mianownik</h3>
          <div className="flex justify-center gap-2" role="group" aria-label="Wspólny mianownik do naprawy">
            {repairCommonDigits.map((digit, index) => <input key={index} value={digit} inputMode="none" readOnly disabled={commonIsValid} aria-label={`Wspólny mianownik, cyfra ${index + 1} z 2`} className="h-12 w-12 rounded-xl border-2 border-indigo-300 bg-white text-center text-xl font-black disabled:text-slate-950 disabled:opacity-100" onFocus={() => setActiveRepairCommonDigit(index as 0 | 1)} onClick={() => setActiveRepairCommonDigit(index as 0 | 1)} />)}
          </div>
          {commonIsValid && !controlsLocked ? <button type="button" className="min-h-11 rounded-xl border-2 border-indigo-300 bg-white px-4 font-black text-indigo-800" onClick={() => { setRepairCommonDigits(["", ""]); setCommonDenominator(null); setLeftMultiplier(1); setRightMultiplier(1); setResultStack(blankStack(task.requiresMixedResult)); resetIndependentEntry(); clearResult(); }}>Zmień wspólny mianownik</button> : null}
        </section>
        {renderStepwiseWorkspace("Kalkulator do naprawy rozwiązania", true)}
      </> : null}

      {!repairDefaults && !guidedExample && !independentPractice ? (
        <section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4">
          <h3 className="font-black">1. Wybierz wspólny mianownik</h3>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Wspólny mianownik L2">
            {task.commonDenominatorOptions.map((option) => <button key={option} type="button" disabled={controlsLocked} aria-pressed={commonDenominator === option} className="min-h-11 min-w-14 rounded-xl border-2 border-slate-300 bg-white px-3 font-black aria-pressed:bg-indigo-700 aria-pressed:text-white" onClick={() => chooseCommon(option)}>{option}</button>)}
          </div>
          <p role="status" className={commonDenominator === null ? "text-slate-600" : commonIsValid ? "font-bold text-emerald-700" : "font-bold text-amber-800"}>{commonDenominator === null ? "Znajdź liczbę podzielną przez oba mianowniki." : commonIsValid ? `${commonDenominator} pasuje do obu podziałek.` : `${commonDenominator} nie jest wspólną miarą.`}</p>
        </section>
      ) : null}

      {activity === "different-denom-l2-greenhouse" && commonIsValid ? renderStepwiseWorkspace("Kalkulator do mikstury w szklarni") : null}

      {success ? <p className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 font-black text-emerald-900" role="status">✓ {success}</p> : null}
      {diagnostic ? onResultChange ? (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted />
      ) : (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
