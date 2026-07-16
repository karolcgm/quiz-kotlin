"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { greatestCommonDivisor, normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionDigit, FractionValue, MixedFractionValue } from "@/types/fractions";
import type { FractionOperationsPhase } from "@/lib/math/fractions/fractionOperationsLesson";

type MultiplicationMode = "basic" | "mixed" | "cancel";

interface NaturalMultiplicationTask {
  id: string;
  mode: MultiplicationMode;
  natural: number;
  operand: MixedFractionValue;
  prompt: string;
}

const BASIC_TASKS: readonly NaturalMultiplicationTask[] = [
  { id: "basic-1", mode: "basic", natural: 2, operand: { wholePart: 0, numerator: 1, denominator: 3 }, prompt: "Pomnóż licznik przez 2. Mianownik pozostaw bez zmiany." },
  { id: "basic-2", mode: "basic", natural: 3, operand: { wholePart: 0, numerator: 2, denominator: 7 }, prompt: "Wpisz iloczyn, którego nie trzeba skracać." },
  { id: "basic-3", mode: "basic", natural: 4, operand: { wholePart: 0, numerator: 1, denominator: 5 }, prompt: "Pomnóż liczbę naturalną przez licznik ułamka." },
];

const MIXED_TASKS: readonly NaturalMultiplicationTask[] = [
  { id: "mixed-1", mode: "mixed", natural: 2, operand: { wholePart: 1, numerator: 1, denominator: 3 }, prompt: "Najpierw zamień liczbę mieszaną na ułamek niewłaściwy." },
  { id: "mixed-2", mode: "mixed", natural: 3, operand: { wholePart: 1, numerator: 2, denominator: 5 }, prompt: "Zapisz ułamek niewłaściwy, a potem wykonaj mnożenie." },
  { id: "mixed-3", mode: "mixed", natural: 3, operand: { wholePart: 2, numerator: 1, denominator: 4 }, prompt: "Wykonaj dwa kroki bez skracania wyniku." },
];

const CANCEL_TASKS: readonly NaturalMultiplicationTask[] = [
  { id: "cancel-1", mode: "cancel", natural: 8, operand: { wholePart: 0, numerator: 3, denominator: 4 }, prompt: "Skróć 8 z mianownikiem 4, a dopiero potem mnóż." },
  { id: "cancel-2", mode: "cancel", natural: 6, operand: { wholePart: 1, numerator: 1, denominator: 2 }, prompt: "Zamień liczbę mieszaną, następnie skróć przed mnożeniem." },
  { id: "cancel-3", mode: "cancel", natural: 10, operand: { wholePart: 2, numerator: 3, denominator: 5 }, prompt: "Po zamianie liczby mieszanej skróć liczbę naturalną z mianownikiem." },
];

const CHECK_TASKS: readonly NaturalMultiplicationTask[] = [
  { id: "check-1", mode: "basic", natural: 2, operand: { wholePart: 0, numerator: 2, denominator: 5 }, prompt: "Wykonaj mnożenie bez skracania." },
  { id: "check-2", mode: "mixed", natural: 2, operand: { wholePart: 1, numerator: 2, denominator: 3 }, prompt: "Najpierw zamień liczbę mieszaną." },
  { id: "check-3", mode: "cancel", natural: 12, operand: { wholePart: 0, numerator: 5, denominator: 18 }, prompt: "Skróć przed mnożeniem." },
  { id: "check-4", mode: "basic", natural: 3, operand: { wholePart: 0, numerator: 1, denominator: 8 }, prompt: "Pomnóż licznik, mianownika nie zmieniaj." },
  { id: "check-5", mode: "cancel", natural: 15, operand: { wholePart: 1, numerator: 2, denominator: 5 }, prompt: "Połącz zamianę liczby mieszanej ze skracaniem." },
];

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

function improper(value: MixedFractionValue): FractionValue {
  return { numerator: value.wholePart * value.denominator + value.numerator, denominator: value.denominator };
}

function resultOf(task: NaturalMultiplicationTask): FractionValue {
  const fraction = improper(task.operand);
  const normalized = normalizeFraction({ numerator: task.natural * fraction.numerator, denominator: fraction.denominator });
  return { numerator: normalized.numerator, denominator: normalized.denominator };
}

function StaticFraction({ value }: { value: FractionValue }) {
  return <span className="inline-grid min-w-10 shrink-0 text-center font-black leading-none"><b>{value.numerator}</b><i className="my-1 border-t-2 border-slate-950" /><b>{value.denominator}</b></span>;
}

function StaticMixed({ value }: { value: MixedFractionValue }) {
  return <span className="inline-flex shrink-0 items-center gap-2">{value.wholePart > 0 ? <b>{value.wholePart}</b> : null}<StaticFraction value={value} /></span>;
}

function EntryCell({ value, label, active, disabled, onActivate }: { value: string; label: string; active: boolean; disabled: boolean; onActivate: () => void }) {
  return <input value={value} inputMode="none" readOnly disabled={disabled} aria-label={label} onFocus={onActivate} onClick={onActivate} className={`h-11 w-11 rounded-lg border-2 bg-white text-center text-xl font-black disabled:text-slate-950 disabled:opacity-100 ${active ? "border-indigo-600 ring-2 ring-indigo-200" : "border-indigo-300"}`} />;
}

type WorkStep =
  | { id: string; label: string; kind: "integer"; target: number }
  | { id: string; label: string; kind: "fraction"; target: FractionValue };

interface EntryValue {
  integer: FractionDigit[];
  numerator: FractionDigit[];
  denominator: FractionDigit[];
}

type ActivePart = "integer" | "numerator" | "denominator";

function buildSteps(task: NaturalMultiplicationTask): WorkStep[] {
  const source = improper(task.operand);
  const result = resultOf(task);
  const resultStep: WorkStep = result.denominator === 1
    ? { id: "result", label: "Wynik", kind: "integer", target: result.numerator }
    : { id: "result", label: "Wynik", kind: "fraction", target: result };
  if (task.mode === "basic") return [resultStep];
  if (task.mode === "mixed") return [{ id: "improper", label: "Ułamek niewłaściwy", kind: "fraction", target: source }, resultStep];
  const divisor = greatestCommonDivisor(task.natural, source.denominator);
  return [
    ...(task.operand.wholePart > 0 ? [{ id: "improper", label: "Ułamek niewłaściwy", kind: "fraction" as const, target: source }] : []),
    { id: "reduced-natural", label: "Liczba naturalna po skróceniu", kind: "integer", target: task.natural / divisor },
    { id: "reduced-denominator", label: "Mianownik po skróceniu", kind: "integer", target: source.denominator / divisor },
    resultStep,
  ];
}

function blankEntries(steps: WorkStep[]): Record<string, EntryValue> {
  return Object.fromEntries(steps.map((step) => [step.id, { integer: [""], numerator: [""], denominator: [""] }])) as Record<string, EntryValue>;
}

function InstructionCard({ mode }: { mode: MultiplicationMode }) {
  if (mode === "mixed") return <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><h3 className="text-lg font-black">Instrukcja: najpierw zamiana</h3><p className="font-semibold">Najpierw zamień liczbę mieszaną na ułamek niewłaściwy. Dopiero potem pomnóż liczbę naturalną przez licznik.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><b>2</b><b>·</b><StaticMixed value={{ wholePart: 2, numerator: 1, denominator: 5 }} /><b>=</b><b>2</b><b>·</b><StaticFraction value={{ numerator: 11, denominator: 5 }} /><b>=</b><StaticFraction value={{ numerator: 22, denominator: 5 }} /></div><p className="text-sm font-bold text-amber-900">Ten przykład nie wymaga skracania.</p></section>;
  if (mode === "cancel") return <section className="grid gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"><h3 className="text-lg font-black">Instrukcja: skracanie przed mnożeniem</h3><p className="font-semibold">Liczbę naturalną i mianownik podziel przez tę samą liczbę. Jeśli występuje liczba mieszana, najpierw zamień ją na ułamek niewłaściwy.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><b>6</b><b>·</b><StaticFraction value={{ numerator: 5, denominator: 9 }} /><b>=</b><b>2</b><b>·</b><StaticFraction value={{ numerator: 5, denominator: 3 }} /><b>=</b><StaticFraction value={{ numerator: 10, denominator: 3 }} /></div></section>;
  return <section className="grid gap-3 rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4"><h3 className="text-lg font-black">Instrukcja: liczba naturalna razy ułamek</h3><p className="font-semibold">Pomnóż liczbę naturalną przez licznik. Mianownik pozostaje bez zmiany.</p><div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black"><b>5</b><b>·</b><StaticFraction value={{ numerator: 1, denominator: 7 }} /><b>=</b><StaticFraction value={{ numerator: 5, denominator: 7 }} /></div><p className="text-sm font-bold text-indigo-900">Ten przykład nie wymaga skracania.</p></section>;
}

function NaturalMultiplicationRound({ task, locked, onComplete, onIncorrect }: { task: NaturalMultiplicationTask; locked: boolean; onComplete: (answer: string) => void; onIncorrect: () => void }) {
  const steps = useMemo(() => buildSteps(task), [task]);
  const [entries, setEntries] = useState<Record<string, EntryValue>>(() => blankEntries(steps));
  const [stepIndex, setStepIndex] = useState(0);
  const [activePart, setActivePart] = useState<ActivePart>(steps[0]!.kind === "integer" ? "integer" : "numerator");
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const source = improper(task.operand);

  const renderStep = (step: WorkStep) => {
    const entry = entries[step.id]!;
    const index = steps.findIndex((item) => item.id === step.id);
    const interactive = !locked && index === stepIndex;
    const renderCells = (part: ActivePart, count: number) => <span className="flex justify-center gap-1">{Array.from({ length: count }, (_, digitIndex) => <EntryCell key={digitIndex} value={entry[part][digitIndex] ?? ""} label={`${step.label}: ${part === "integer" ? "liczba" : part === "numerator" ? "licznik" : "mianownik"}, cyfra ${digitIndex + 1} z ${count}`} active={interactive && activePart === part && activeIndex === digitIndex} disabled={!interactive} onActivate={() => { if (interactive) { setActivePart(part); setActiveIndex(digitIndex); } }} />)}</span>;
    if (step.kind === "integer") return <span className="inline-flex shrink-0" data-work-step={step.id}>{renderCells("integer", digitCount(step.target))}</span>;
    return <span className="inline-grid shrink-0 gap-1 text-center" data-work-step={step.id}>{renderCells("numerator", digitCount(step.target.numerator))}<i className="border-t-2 border-slate-950" />{renderCells("denominator", digitCount(step.target.denominator))}</span>;
  };

  const stepById = (id: string) => renderStep(steps.find((step) => step.id === id)!);

  const edit = (keyValue: string) => {
    const step = steps[stepIndex]!;
    if (keyValue !== "backspace" && !/^[0-9]$/u.test(keyValue)) return;
    setEntries((current) => {
      const next = { ...current, [step.id]: { ...current[step.id]!, [activePart]: [...current[step.id]![activePart]] } };
      next[step.id]![activePart][activeIndex] = keyValue === "backspace" ? "" : keyValue as FractionDigit;
      return next;
    });
    if (keyValue !== "backspace") {
      const parts: Array<{ part: ActivePart; count: number }> = step.kind === "integer"
        ? [{ part: "integer", count: digitCount(step.target) }]
        : [{ part: "numerator", count: digitCount(step.target.numerator) }, { part: "denominator", count: digitCount(step.target.denominator) }];
      const order = parts.flatMap((item) => Array.from({ length: item.count }, (_, index) => ({ part: item.part, index })));
      const currentIndex = order.findIndex((cell) => cell.part === activePart && cell.index === activeIndex);
      const next = order[Math.min(order.length - 1, currentIndex + 1)]!;
      setActivePart(next.part);
      setActiveIndex(next.index);
    }
    setFeedback(null);
  };

  const confirm = () => {
    const step = steps[stepIndex]!;
    const value = entries[step.id]!;
    const correct = step.kind === "integer"
      ? Number(value.integer.join("")) === step.target
      : Number(value.numerator.join("")) === step.target.numerator && Number(value.denominator.join("")) === step.target.denominator;
    if (!correct) {
      setFeedback("Sprawdź aktywne kratki i wykonaj tylko opisany krok.");
      onIncorrect();
      return;
    }
    if (stepIndex < steps.length - 1) {
      const nextStep = steps[stepIndex + 1]!;
      setStepIndex(stepIndex + 1);
      setActivePart(nextStep.kind === "integer" ? "integer" : "numerator");
      setActiveIndex(0);
      setFeedback(null);
      return;
    }
    const result = resultOf(task);
    onComplete(`${result.numerator}/${result.denominator}`);
  };

  return <div className="grid gap-4">
    <section className="grid gap-3 rounded-2xl border-2 border-slate-200 bg-white p-4"><h3 className="font-black">Wykonaj działanie w kratkach</h3><p className="font-semibold text-slate-700">{task.prompt}</p><div className="flex max-w-full flex-wrap items-center justify-center gap-3 overflow-x-auto py-2 text-xl font-black"><b>{task.natural}</b><b>·</b><StaticMixed value={task.operand} />{task.mode === "basic" ? <><b>=</b>{stepById("result")}</> : null}{task.mode === "mixed" ? <><b>=</b><b>{task.natural}</b><b>·</b>{stepById("improper")}<b>=</b>{stepById("result")}</> : null}{task.mode === "cancel" ? <>{task.operand.wholePart > 0 ? <><b>=</b><b>{task.natural}</b><b>·</b>{stepById("improper")}</> : null}<b>=</b>{stepById("reduced-natural")}<b>·</b><span className="inline-grid shrink-0 gap-1 text-center"><b>{source.numerator}</b><i className="border-t-2 border-slate-950" />{stepById("reduced-denominator")}</span><b>=</b>{stepById("result")}</> : null}</div>{task.mode === "cancel" ? <p className="text-center text-sm font-bold text-emerald-800">Najpierw samodzielnie wpisz liczby po skróceniu. Poprzednie obliczenia pozostaną widoczne.</p> : null}</section>
    {!locked ? <LessonNumericKeypad label="Kalkulator do mnożenia ułamków" helperText={steps[stepIndex]!.label} onKey={edit} onConfirm={confirm} /> : null}
    {feedback ? <p role="status" className="rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-3 font-black text-rose-900">{feedback}</p> : null}
  </div>;
}

export interface FractionNaturalMultiplicationLessonModelProps {
  phase: FractionOperationsPhase;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionNaturalMultiplicationLessonModel({ phase, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: FractionNaturalMultiplicationLessonModelProps) {
  const series = phase === "visual" ? BASIC_TASKS : phase === "reasoning" ? MIXED_TASKS : phase === "context" ? CANCEL_TASKS : CHECK_TASKS;
  const [roundIndex, setRoundIndex] = useState(0);
  const selectedIndex = phase === "independent" ? Math.min(series.length - 1, Math.max(0, (questionNumber ?? 1) - 1)) : roundIndex;
  const task = series[selectedIndex]!;
  const locked = readOnly || presentationMode && phase === "independent";
  const heading = phase === "visual" ? "Liczba naturalna · ułamek" : phase === "reasoning" ? "Liczba naturalna · liczba mieszana" : phase === "context" ? "Skracanie przed mnożeniem" : "Sprawdź trzy rodzaje mnożenia";
  const description = phase === "visual" ? "Pomnóż licznik przez liczbę naturalną. Te przykłady nie wymagają skracania." : phase === "reasoning" ? "Najpierw zamień liczbę mieszaną na ułamek niewłaściwy, a dopiero potem mnóż." : phase === "context" ? "Skróć liczbę naturalną z mianownikiem przed mnożeniem. W zadaniach pojawiają się ułamki i liczby mieszane." : task.prompt;

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const complete = (answer: string) => {
    if (phase !== "independent" && roundIndex < series.length - 1) {
      setRoundIndex((index) => index + 1);
      onResultChange?.(null);
      return;
    }
    onResultChange?.(true, answer);
  };

  return <LessonTaskFrame eyebrow="Dział 3 · Ułamki zwykłe" heading={heading} description={description} questionNumber={phase === "independent" ? questionNumber : roundIndex + 1} questionCount={phase === "independent" ? questionCount : series.length} contentClassName="grid gap-4" data-fraction-natural-multiplication data-mode={task.mode}>
    <InstructionCard mode={task.mode} />
    <NaturalMultiplicationRound key={task.id} task={task} locked={locked} onComplete={complete} onIncorrect={() => onResultChange?.(phase === "independent" ? false : null)} />
  </LessonTaskFrame>;
}
