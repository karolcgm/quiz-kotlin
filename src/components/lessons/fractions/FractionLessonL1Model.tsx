"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionCircleModel } from "@/components/lessons/fractions/FractionCircleModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import { FractionLessonL2Model } from "@/components/lessons/fractions/FractionLessonL2Model";
import { FractionQuotientLessonModel } from "@/components/lessons/fractions/FractionQuotientLessonModel";
import { FractionEquivalenceLessonModel } from "@/components/lessons/fractions/FractionEquivalenceLessonModel";
import { FractionComparisonLessonModel } from "@/components/lessons/fractions/FractionComparisonLessonModel";
import { FractionSameDenominatorLessonModel } from "@/components/lessons/fractions/FractionSameDenominatorLessonModel";
import { FractionSameDenominatorMixedLessonModel } from "@/components/lessons/fractions/FractionSameDenominatorMixedLessonModel";
import { FractionDifferentDenominatorMeasureLessonModel } from "@/components/lessons/fractions/FractionDifferentDenominatorMeasureLessonModel";
import { FractionDifferentDenominatorAdvancedLessonModel } from "@/components/lessons/fractions/FractionDifferentDenominatorAdvancedLessonModel";
import { FractionOperationsLessonModel } from "@/components/lessons/fractions/FractionOperationsLessonModel";
import { FractionTopicIntroModel } from "@/components/lessons/fractions/FractionTopicIntroModel";
import {
  areEquivalentFractions,
  createFractionDiagnosticResult,
  fractionStackValueFromFraction,
  parseFractionStackValue,
} from "@/lib/math/fractions";
import {
  createPublicFractionLessonL1Task,
  fractionPartitionAttempt,
  fractionWholesMatch,
  isEqualFractionPartition,
  type FractionLessonActivity,
  type FractionLessonL1Activity,
} from "@/lib/math/fractions/fractionLessonL1";
import { isFractionLessonL2Activity } from "@/lib/math/fractions/fractionLessonL2";
import { isFractionQuotientActivity } from "@/lib/math/fractions/fractionQuotientLesson";
import { isFractionEquivalenceActivity } from "@/lib/math/fractions/fractionEquivalenceLesson";
import { isFractionComparisonActivity } from "@/lib/math/fractions/fractionComparisonLesson";
import { isFractionSameDenominatorActivity } from "@/lib/math/fractions/fractionSameDenominatorLesson";
import { isFractionSameDenominatorMixedActivity } from "@/lib/math/fractions/fractionSameDenominatorMixedLesson";
import { isFractionDifferentDenominatorMeasureActivity } from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import { isFractionDifferentDenominatorAdvancedActivity } from "@/lib/math/fractions/fractionDifferentDenominatorAdvancedLesson";
import { isFractionOperationsActivity } from "@/lib/math/fractions/fractionOperationsLesson";
import { isFractionTopicIntroActivity } from "@/lib/math/fractions/fractionTopicIntro";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  FractionFeedbackCode,
  FractionStackValue,
  FractionValue,
} from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionLessonL1.module.css";

const ACTIVITY_TITLES: Record<FractionLessonL1Activity, string> = {
  "same-whole": "Ta sama całość",
  "model-notation": "Z modelu do zapisu",
  "parts-meaning": "Licznik i mianownik",
  "number-line": "Oś ułamków",
  independent: "Rozpoznawanie i zapisywanie ułamków",
};

function blankStack(): FractionStackValue {
  return { numerator: [""], denominator: [""] };
}

function stackText(value: FractionStackValue): string {
  return `${value.numerator.join("")}/${value.denominator.join("")}`;
}

function StaticFraction({ value, label }: { value: FractionValue; label: string }) {
  return (
    <span className="inline-grid min-w-16 justify-items-stretch align-middle text-center font-black" aria-label={`${label}: ${value.numerator}/${value.denominator}`}>
      <span>{value.numerator}</span>
      <span className="h-0 border-t-2 border-current" aria-hidden />
      <span>{value.denominator}</span>
    </span>
  );
}

export interface FractionNumberLineProps {
  value: FractionValue;
  readOnly?: boolean;
  onChange: (value: FractionValue) => void;
  label?: string;
}

/** Oś 0–1: natywny suwak obsługuje pointer/touch/klawiaturę, a obok są trzy jawne alternatywy. */
export function FractionNumberLine({
  value,
  readOnly = false,
  onChange,
  label = "Oś ułamków od 0 do 1",
}: FractionNumberLineProps) {
  const numerator = Math.max(0, Math.min(value.denominator, value.numerator));
  const ticks = Array.from({ length: value.denominator + 1 }, (_, index) => index);
  const xFor = (index: number) => 36 + index / value.denominator * 328;
  const update = (nextNumerator: number) => onChange({
    numerator: Math.max(0, Math.min(value.denominator, Math.trunc(nextNumerator))),
    denominator: value.denominator,
  });

  return (
    <section className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3" aria-label={label}>
      <AccessibleMathSvg
        title={label}
        description={`Oś od 0 do 1 jest podzielona na ${value.denominator} równych odcinków. Punkt leży na ${numerator}. kresce po zerze, czyli w ${numerator}/${value.denominator}.`}
        viewBox="0 0 400 124"
        className="h-auto w-full"
        columns={[
          { key: "numerator", label: "Numer kreski po zerze" },
          { key: "denominator", label: "Liczba równych odcinków" },
          { key: "value", label: "Wartość punktu" },
        ]}
        rows={[{ numerator, denominator: value.denominator, value: `${numerator}/${value.denominator}` }]}
      >
        <line x1="36" y1="58" x2="364" y2="58" stroke="#0f172a" strokeWidth="4" />
        {ticks.map((index) => (
          <g key={index} data-fraction-tick={index}>
            <line x1={xFor(index)} y1="45" x2={xFor(index)} y2="72" stroke="#334155" strokeWidth="3" />
            <text x={xFor(index)} y="101" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="800">
              {index === 0 || index === value.denominator ? index / value.denominator : `${index}/${value.denominator}`}
            </text>
          </g>
        ))}
        <circle cx={xFor(numerator)} cy="58" r="11" fill="#4f46e5" stroke="#fff" strokeWidth="4" data-fraction-axis-point />
      </AccessibleMathSvg>

      {!readOnly ? (
        <InteractionAlternativePanel
          title="Sterowanie punktem"
          instruction="Przeciągnij suwak albo użyj przycisków lewo/prawo i pola licznika. Każda pozycja wskakuje na kreskę podziałki."
        >
          <input
            type="range"
            min={0}
            max={value.denominator}
            step={1}
            value={numerator}
            aria-label="Przeciągnij punkt na osi ułamków"
            aria-valuetext={`${numerator}/${value.denominator}`}
            className="min-h-11 w-full accent-indigo-600"
            onChange={(event) => update(Number(event.target.value))}
          />
          <div className="grid w-full grid-cols-[auto_minmax(8rem,1fr)_auto] gap-2">
            <button type="button" className={`${styles.touchTarget} rounded-xl border-2 border-slate-300 bg-white px-3 font-black`} disabled={numerator <= 0} onClick={() => update(numerator - 1)}>
              ← lewo
            </button>
            <label className="grid gap-1 text-center text-xs font-black text-slate-700">
              Pole wartości — licznik
              <input
                type="number"
                min={0}
                max={value.denominator}
                step={1}
                value={numerator}
                aria-label="Pole wartości osi — licznik"
                className="min-h-11 rounded-xl border-2 border-slate-300 px-3 text-center text-lg font-black"
                onChange={(event) => update(Number(event.target.value))}
              />
            </label>
            <button type="button" className={`${styles.touchTarget} rounded-xl border-2 border-slate-300 bg-white px-3 font-black`} disabled={numerator >= value.denominator} onClick={() => update(numerator + 1)}>
              prawo →
            </button>
          </div>
        </InteractionAlternativePanel>
      ) : null}
    </section>
  );
}

export interface FractionLessonL1ModelProps {
  activity: FractionLessonActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionLessonL1Model({
  activity,
  ...props
}: FractionLessonL1ModelProps) {
  if (isFractionTopicIntroActivity(activity)) {
    return <FractionTopicIntroModel activity={activity} {...props} />;
  }
  if (isFractionOperationsActivity(activity)) {
    return <FractionOperationsLessonModel activity={activity} {...props} />;
  }
  if (isFractionDifferentDenominatorAdvancedActivity(activity)) {
    return <FractionDifferentDenominatorAdvancedLessonModel activity={activity} {...props} />;
  }
  if (isFractionDifferentDenominatorMeasureActivity(activity)) {
    return <FractionDifferentDenominatorMeasureLessonModel activity={activity} {...props} />;
  }
  if (isFractionSameDenominatorMixedActivity(activity)) {
    return <FractionSameDenominatorMixedLessonModel activity={activity} {...props} />;
  }
  if (isFractionSameDenominatorActivity(activity)) {
    return <FractionSameDenominatorLessonModel activity={activity} {...props} />;
  }
  if (isFractionComparisonActivity(activity)) {
    return <FractionComparisonLessonModel activity={activity} {...props} />;
  }
  if (isFractionEquivalenceActivity(activity)) {
    return <FractionEquivalenceLessonModel activity={activity} {...props} />;
  }
  if (isFractionQuotientActivity(activity)) {
    return <FractionQuotientLessonModel activity={activity} {...props} />;
  }
  if (isFractionLessonL2Activity(activity)) {
    return <FractionLessonL2Model activity={activity} {...props} />;
  }
  return <FractionLessonL1ActivityModel activity={activity} {...props} />;
}

type FractionLessonL1ActivityModelProps = Omit<FractionLessonL1ModelProps, "activity"> & {
  activity: FractionLessonL1Activity;
};

function FractionLessonL1ActivityModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: FractionLessonL1ActivityModelProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicFractionLessonL1Task({
    seed: effectiveSeed,
    difficulty,
    activity,
  }), [activity, difficulty, effectiveSeed]);
  const initialValue = activity === "independent"
    ? { numerator: 0, denominator: task.target.denominator }
    : task.target;
  const [fraction, setFraction] = useState<FractionValue>(initialValue);
  const [stack, setStack] = useState<FractionStackValue>(() => activity === "independent"
    ? blankStack()
    : fractionStackValueFromFraction(initialValue));
  const [direction, setDirection] = useState<"model-to-notation" | "notation-to-model">("model-to-notation");
  const [activePart, setActivePart] = useState<"numerator" | "denominator">("numerator");
  const [cutOffset, setCutOffset] = useState(0);
  const [sameWhole, setSameWhole] = useState(true);
  const [diagnosticCode, setDiagnosticCode] = useState<FractionFeedbackCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const partition = task.allowedDenominators.includes(fraction.denominator)
    ? fractionPartitionAttempt(fraction.denominator, cutOffset)
    : Array.from({ length: fraction.denominator }, () => 1 / fraction.denominator);
  const diagnostic = diagnosticCode ? createFractionDiagnosticResult(diagnosticCode) : null;
  const controlsLocked = readOnly || presentationMode && activity === "independent";

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const setVisualFraction = (value: FractionValue) => {
    if (!Number.isSafeInteger(value.denominator) || value.denominator <= 0) return;
    const next = {
      numerator: Math.max(0, Math.min(value.denominator, Math.trunc(value.numerator))),
      denominator: Math.trunc(value.denominator),
    };
    setFraction(next);
    setStack(fractionStackValueFromFraction(next));
    clearResult();
  };

  const changeStack = (value: FractionStackValue) => {
    setStack(value);
    const parsed = parseFractionStackValue(value);
    if (parsed.ok && parsed.value.numerator >= 0 && parsed.value.numerator <= parsed.value.denominator) {
      setFraction(parsed.value);
    }
    clearResult();
  };

  const changeDenominator = (denominator: number) => {
    setVisualFraction({ numerator: Math.min(fraction.numerator, denominator), denominator });
    setCutOffset(0);
  };

  const checkEqualPartition = () => {
    if (!isEqualFractionPartition(partition)) {
      setDiagnosticCode(FRACTION_FEEDBACK_CODES.unequalParts);
      setSuccessMessage(null);
      onResultChange?.(false, `nierówne części: ${partition.map((part) => part.toFixed(3)).join(", ")}`);
      return;
    }
    setDiagnosticCode(null);
    setSuccessMessage(`Podział przyjęty: każda z ${fraction.denominator} części ma tę samą wielkość.`);
    onResultChange?.(true, `${fraction.denominator} równych części`);
  };

  const checkIndependent = () => {
    if (!sameWhole || !fractionWholesMatch(1, sameWhole ? 1 : .75)) {
      setDiagnosticCode(FRACTION_FEEDBACK_CODES.wholeMismatch);
      setSuccessMessage(null);
      onResultChange?.(false, stackText(stack));
      return;
    }
    const parsed = parseFractionStackValue(stack);
    if (!parsed.ok) {
      const code = parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
        ? FRACTION_FEEDBACK_CODES.zeroDenominator
        : FRACTION_FEEDBACK_CODES.emptyPart;
      setDiagnosticCode(code);
      setSuccessMessage(null);
      onResultChange?.(false, stackText(stack));
      return;
    }
    if (parsed.value.numerator === task.target.denominator && parsed.value.denominator === task.target.numerator) {
      setDiagnosticCode(FRACTION_FEEDBACK_CODES.numeratorDenominatorSwapped);
      setSuccessMessage(null);
      onResultChange?.(false, stackText(stack));
      return;
    }
    if (!areEquivalentFractions(parsed.value, task.target)) {
      setDiagnosticCode(FRACTION_FEEDBACK_CODES.notEquivalent);
      setSuccessMessage(null);
      onResultChange?.(false, stackText(stack));
      return;
    }
    setFraction(parsed.value);
    setDiagnosticCode(null);
    setSuccessMessage("Trzy reprezentacje pokazują tę samą część tej samej całości.");
    onResultChange?.(true, stackText(stack));
  };

  const modelControls = !controlsLocked ? (
    <InteractionAlternativePanel
      title="Sterowanie modelem"
      instruction="Zmień liczbę równych części albo liczbę zaznaczonych części. Zapis w kratkach aktualizuje się od razu."
    >
      <div className="flex w-full flex-wrap justify-center gap-2" aria-label="Liczba równych części">
        {task.allowedDenominators.map((denominator) => (
          <button
            key={denominator}
            type="button"
            aria-pressed={fraction.denominator === denominator}
            className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black ${fraction.denominator === denominator ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-300 bg-white text-slate-950"}`}
            onClick={() => changeDenominator(denominator)}
          >
            {denominator} części
          </button>
        ))}
      </div>
      <div className="flex w-full justify-center gap-2">
        <button type="button" className={`${styles.touchTarget} rounded-xl border-2 border-slate-300 bg-white px-4 font-black`} disabled={fraction.numerator <= 0} onClick={() => setVisualFraction({ ...fraction, numerator: fraction.numerator - 1 })}>− zaznaczona część</button>
        <button type="button" className={`${styles.touchTarget} rounded-xl bg-indigo-700 px-4 font-black text-white`} disabled={fraction.numerator >= fraction.denominator} onClick={() => setVisualFraction({ ...fraction, numerator: fraction.numerator + 1 })}>+ zaznaczona część</button>
      </div>
    </InteractionAlternativePanel>
  ) : null;

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName="space-y-4"
      eyebrow="Dział 3 · Ułamki zwykłe"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-fraction-lesson-l1
      data-fraction-activity={activity}
      data-orientation-contract="portrait-landscape"
      data-generator-id={task.generatorId}
      data-seed={effectiveSeed}
      data-difficulty={difficulty}
    >
      {activity === "same-whole" ? (
        <div className="space-y-4">
          {modelControls}
          <div className={styles.modelGrid}>
            <FractionCircleModel value={fraction} variant="pizza" label="Pizza — ta sama całość" />
            <FractionBarModel bars={[{ id: "same-whole-bar", label: "Pasek", value: fraction, accent: "cyan" }]} />
          </div>
          {!controlsLocked ? (
            <InteractionAlternativePanel title="Próba cięcia" instruction="Przesuń jedno cięcie. Jeśli części przestaną być równe, system nie zmieni poprawnego modelu i wskaże miejsce naprawy.">
              <input type="range" min={-20} max={20} step={5} value={cutOffset} aria-label="Przesunięcie jednego cięcia" className="min-h-11 w-full accent-amber-600" onChange={(event) => { setCutOffset(Number(event.target.value)); clearResult(); }} />
              <div className={styles.attemptParts} aria-label={`Szkic ${fraction.denominator} części; przesunięcie cięcia ${cutOffset}%`}>
                {partition.map((part, index) => <span key={index} className={styles.attemptPart} style={{ width: `${part * 100}%` }} data-attempt-part={part} />)}
              </div>
              <button type="button" className={`${styles.touchTarget} w-full rounded-xl bg-slate-950 px-4 font-black text-white`} onClick={checkEqualPartition}>Prześlij zadanie</button>
            </InteractionAlternativePanel>
          ) : null}
        </div>
      ) : null}

      {activity === "model-notation" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" aria-label="Kierunek pracy">
            <button type="button" aria-pressed={direction === "model-to-notation"} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black ${direction === "model-to-notation" ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-300 bg-white"}`} onClick={() => setDirection("model-to-notation")}>Model → zapis</button>
            <button type="button" aria-pressed={direction === "notation-to-model"} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black ${direction === "notation-to-model" ? "border-indigo-700 bg-indigo-700 text-white" : "border-slate-300 bg-white"}`} onClick={() => setDirection("notation-to-model")}>Zapis → model</button>
          </div>
          <div className={styles.workspace}>
            <div className="space-y-3">
              <FractionCircleModel value={fraction} variant="pizza" label="Model aktualnego ułamka" />
              <FractionBarModel bars={[{ id: "notation-bar", label: "Ta sama wartość", value: fraction, accent: "indigo" }]} />
              {modelControls}
            </div>
            <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4">
              <p className="mb-3 text-center text-sm font-black text-indigo-800">{direction === "model-to-notation" ? "Model wypełnia kratki" : "Kratki budują model"}</p>
              <FractionStackInput value={stack} onChange={changeStack} readOnly={controlsLocked} onSubmit={(parsed) => setVisualFraction(parsed.value)} stepLabel={direction === "model-to-notation" ? "Odczytaj model" : "Zbuduj model z zapisu"} />
            </div>
          </div>
        </div>
      ) : null}

      {activity === "parts-meaning" ? (
        <div className={styles.workspace}>
          <div className="space-y-3">
            <FractionCircleModel value={fraction} variant="pizza" label="Znaczenie licznika i mianownika" />
            {modelControls}
          </div>
          <div className="space-y-4 rounded-2xl bg-white p-4">
            <FractionStackInput value={stack} onChange={changeStack} readOnly={controlsLocked} showKeypad={false} />
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" aria-pressed={activePart === "numerator"} onClick={() => setActivePart("numerator")} className={`${styles.touchTarget} rounded-xl border-4 p-3 text-left font-black ${activePart === "numerator" ? "border-cyan-600 bg-cyan-50" : "border-slate-200"}`}>Licznik · ile części zaznaczono</button>
              <button type="button" aria-pressed={activePart === "denominator"} onClick={() => setActivePart("denominator")} className={`${styles.touchTarget} rounded-xl border-4 p-3 text-left font-black ${activePart === "denominator" ? "border-violet-600 border-dashed bg-violet-50" : "border-slate-200"}`}>Mianownik · na ile równych części podzielono całość</button>
            </div>
            <p role="status" className="rounded-xl bg-slate-100 p-3 font-semibold">
              {activePart === "numerator"
                ? `W modelu policz ${fraction.numerator} zaznaczone części — to licznik.`
                : `W jednej całej pizzy policz ${fraction.denominator} równych części — to mianownik.`}
            </p>
          </div>
        </div>
      ) : null}

      {activity === "number-line" ? (
        <div className={styles.workspace}>
          <div className="space-y-3">
            <FractionNumberLine value={fraction} readOnly={controlsLocked} onChange={setVisualFraction} />
            {modelControls}
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="mb-3 text-center font-black">Punkt i zapis mają zawsze tę samą wartość</p>
            <FractionStackInput value={stack} onChange={changeStack} readOnly={controlsLocked} onSubmit={(parsed) => setVisualFraction(parsed.value)} stepLabel="Ustaw punkt z zapisu" />
          </div>
        </div>
      ) : null}

      {activity === "independent" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-violet-50 p-3 text-lg">
            <span className="font-black">Cel:</span><StaticFraction value={task.target} label="Ułamek do zbudowania" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <FractionCircleModel value={fraction} variant="pizza" label="Reprezentacja 1 — pizza" />
            <div className={sameWhole ? "" : styles.wholeMismatch} data-whole-size={sameWhole ? 1 : .75}>
              <FractionBarModel bars={[{ id: "independent-bar", label: "Reprezentacja 2", value: fraction, accent: "amber" }]} />
            </div>
            <FractionNumberLine value={fraction} readOnly={controlsLocked} onChange={setVisualFraction} label="Reprezentacja 3 — oś" />
          </div>
          <div className={styles.workspace}>
            <div className="space-y-3">
              {modelControls}
              {!controlsLocked ? <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3" aria-label="Wielkość porównywanej całości">
                <button type="button" aria-pressed={sameWhole} onClick={() => { setSameWhole(true); clearResult(); }} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black ${sameWhole ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 bg-white"}`}>Ta sama całość</button>
                <button type="button" aria-pressed={!sameWhole} onClick={() => { setSameWhole(false); clearResult(); }} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black ${!sameWhole ? "border-amber-700 bg-amber-700 text-white" : "border-slate-300 bg-white"}`}>Inna całość</button>
              </div> : null}
            </div>
            <div className="rounded-2xl bg-white p-4">
              <FractionStackInput value={stack} onChange={changeStack} readOnly={controlsLocked} onSubmit={() => checkIndependent()} stepLabel="Zapisz wspólną wartość trzech reprezentacji" />
              {!controlsLocked ? <button type="button" className={`${styles.touchTarget} mt-4 w-full rounded-xl bg-indigo-700 px-4 text-lg font-black text-white`} onClick={checkIndependent}>Prześlij zadanie</button> : null}
            </div>
          </div>
        </div>
      ) : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnostic ? (
        onResultChange ? (
          <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
        ) : (
          <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
        )
      ) : null}
    </LessonTaskFrame>
  );
}
