"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { DecimalDigitInput } from "@/components/lessons/decimals/DecimalDigitInput";
import { DecimalHundredGrid } from "@/components/lessons/decimals/DecimalHundredGrid";
import { DecimalComparisonLab } from "@/components/lessons/decimals/DecimalComparisonLab";
import { DecimalComparisonPracticeLab, isDecimalComparisonPracticeActivity } from "@/components/lessons/decimals/DecimalComparisonPracticeLab";
import { DecimalAddSubL1Lab } from "@/components/lessons/decimals/DecimalAddSubL1Lab";
import { DecimalAddSubL2Lab } from "@/components/lessons/decimals/DecimalAddSubL2Lab";
import { DecimalMeasurementL1Lab } from "@/components/lessons/decimals/DecimalMeasurementL1Lab";
import { DecimalUnitConversionLessonLab, isDecimalUnitLessonActivity } from "@/components/lessons/decimals/DecimalUnitConversionLessonLab";
import { DecimalMeasurementL2Lab } from "@/components/lessons/decimals/DecimalMeasurementL2Lab";
import { DecimalNotationL2Lab } from "@/components/lessons/decimals/DecimalNotationL2Lab";
import { DecimalNotationIntroLab, isDecimalNotationIntroActivity } from "@/components/lessons/decimals/DecimalNotationIntroLab";
import { DecimalPowerTenL1Lab } from "@/components/lessons/decimals/DecimalPowerTenL1Lab";
import { DecimalNaturalMultiplyL1Lab, isDecimalNaturalMultiplyL1Activity } from "@/components/lessons/decimals/DecimalNaturalMultiplyL1Lab";
import { DecimalDecimalMultiplyL1Lab, isDecimalDecimalMultiplyL1Activity } from "@/components/lessons/decimals/DecimalDecimalMultiplyL1Lab";
import { DecimalNaturalDivideL1Lab, isDecimalNaturalDivideL1Activity } from "@/components/lessons/decimals/DecimalNaturalDivideL1Lab";
import { DecimalDivideByDecimalL1Lab, isDecimalDivideByDecimalL1Activity } from "@/components/lessons/decimals/DecimalDivideByDecimalL1Lab";
import { DecimalEstimateL1Lab, isDecimalEstimateL1Activity } from "@/components/lessons/decimals/DecimalEstimateL1Lab";
import { DecimalFractionOperationsLab, isDecimalFractionOperationsActivity } from "@/components/lessons/decimals/DecimalFractionOperationsLab";
import { PercentFractionL1Lab, isPercentFractionL1Activity } from "@/components/lessons/decimals/PercentFractionL1Lab";
import { DecimalPlaceValueGrid } from "@/components/lessons/decimals/DecimalPlaceValueGrid";
import {
  areEquivalentDecimals,
  createDecimalDiagnosticResult,
  parseDecimalInput,
} from "@/lib/math/decimals";
import {
  createPublicDecimalNotationL1Task,
  decimalHundredthsDisplay,
  decimalHundredthsWords,
  type DecimalNotationActivity,
  type DecimalNotationL1Activity,
} from "@/lib/math/decimals/decimalNotationL1";
import { isDecimalComparisonActivity } from "@/lib/math/decimals/decimalComparisonL1";
import { isDecimalAddSubL1Activity } from "@/lib/math/decimals/decimalAddSubL1";
import { isDecimalAddSubL2Activity } from "@/lib/math/decimals/decimalAddSubL2";
import { isDecimalMeasurementL1Activity } from "@/lib/math/decimals/decimalMeasurementL1";
import { isDecimalMeasurementL2Activity } from "@/lib/math/decimals/decimalMeasurementL2";
import { isDecimalNotationL2Activity } from "@/lib/math/decimals/decimalNotationL2";
import { isDecimalPowerTenL1Activity } from "@/lib/math/decimals/decimalPowerTenL1";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode, DecimalPlaceValueState } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalNotationL1.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Start",
  core: "Dalej",
  challenge: "Mistrzowskie",
};

const ACTIVITY_TITLES: Record<DecimalNotationL1Activity, string> = {
  "place-names": "Nazwy miejsc w liczbie dziesiętnej",
  "decimal-to-fraction-example": "Z liczby dziesiętnej na ułamek zwykły — przykład",
  "decimal-to-fraction-practice": "Z liczby dziesiętnej na ułamek zwykły",
  "fraction-to-decimal-example": "Z ułamka zwykłego na dziesiętny — przykład",
  "fraction-to-decimal-practice": "Z ułamka zwykłego na dziesiętny",
  "decimal-number-line": "Ułamki dziesiętne na osi liczbowej",
  "tenths-hundredths": "Dziesiąte i setne",
  "hundred-grid": "Kratownica 10×10",
  "place-table": "Tabela wartości pozycyjnej",
  "word-digit": "Zapis słowny i cyfrowy",
  glass: "Barwienie szklanki",
  independent: "Praca samodzielna",
};

function blankPlaceState(): DecimalPlaceValueState {
  return { ones: "", tenths: "", hundredths: "" };
}

function hundredthsFromPlaces(value: DecimalPlaceValueState): number | null {
  if (value.ones !== "0" || value.tenths === undefined || value.tenths === "" || value.hundredths === undefined || value.hundredths === "") {
    return null;
  }
  return Number(value.tenths) * 10 + Number(value.hundredths);
}

function normalizeWords(value: string): string {
  return value.trim().toLocaleLowerCase("pl-PL").replace(/\s+/gu, " ");
}

function GlassModel({ value, label }: { value: number; label: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const fillHeight = safeValue * 1.5;
  const fillY = 180 - fillHeight;
  return (
    <AccessibleMathSvg
      title={label}
      description={`Szklanka ma zabarwione ${safeValue} ze 100 równych części, czyli ${decimalHundredthsDisplay(safeValue)} pojemności.`}
      viewBox="0 0 240 220"
      className={styles.glassSvg}
      columns={[
        { key: "hundredths", label: "Zabarwione setne" },
        { key: "decimal", label: "Zapis dziesiętny" },
      ]}
      rows={[{ hundredths: `${safeValue}/100`, decimal: decimalHundredthsDisplay(safeValue) }]}
    >
      <defs>
        <pattern id={`glass-hatch-${safeValue}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#cffafe" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="#0e7490" strokeWidth="4" />
        </pattern>
      </defs>
      <path d="M55 25 L75 190 Q78 205 95 205 H145 Q162 205 165 190 L185 25" fill="white" stroke="#334155" strokeWidth="7" />
      {safeValue > 0 ? <rect x="73" y={fillY} width="94" height={fillHeight} fill={`url(#glass-hatch-${safeValue})`} clipPath="inset(0 round 0 0 18px 18px)" data-glass-fill={safeValue} /> : null}
      <line x1="55" y1="25" x2="185" y2="25" stroke="#334155" strokeWidth="7" />
      <text x="120" y="215" textAnchor="middle" fill="#0f172a" fontSize="15" fontWeight="800">{safeValue}/100 = {decimalHundredthsDisplay(safeValue)}</text>
    </AccessibleMathSvg>
  );
}

export interface DecimalNotationL1LabProps {
  activity: DecimalNotationActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type DecimalNotationL1CoreProps = Omit<DecimalNotationL1LabProps, "activity"> & {
  activity: DecimalNotationL1Activity;
};

/** Zachowuje istniejący modelId, delegując etapy L2 do lokalnego adaptera. */
export function DecimalNotationL1Lab(props: DecimalNotationL1LabProps) {
  if (isPercentFractionL1Activity(props.activity)) {
    return <PercentFractionL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalFractionOperationsActivity(props.activity)) {
    return <DecimalFractionOperationsLab {...props} activity={props.activity} />;
  }
  if (isDecimalEstimateL1Activity(props.activity)) {
    return <DecimalEstimateL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalNotationIntroActivity(props.activity)) {
    return <DecimalNotationIntroLab {...props} activity={props.activity} />;
  }
  if (isDecimalPowerTenL1Activity(props.activity)) {
    return <DecimalPowerTenL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalNaturalMultiplyL1Activity(props.activity)) {
    return <DecimalNaturalMultiplyL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalDecimalMultiplyL1Activity(props.activity)) {
    return <DecimalDecimalMultiplyL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalNaturalDivideL1Activity(props.activity)) {
    return <DecimalNaturalDivideL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalDivideByDecimalL1Activity(props.activity)) {
    return <DecimalDivideByDecimalL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalAddSubL2Activity(props.activity)) {
    return <DecimalAddSubL2Lab {...props} activity={props.activity} />;
  }
  if (isDecimalAddSubL1Activity(props.activity)) {
    return <DecimalAddSubL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalMeasurementL2Activity(props.activity)) {
    return <DecimalMeasurementL2Lab {...props} activity={props.activity} />;
  }
  if (isDecimalUnitLessonActivity(props.activity)) {
    return <DecimalUnitConversionLessonLab {...props} activity={props.activity} />;
  }
  if (isDecimalMeasurementL1Activity(props.activity)) {
    return <DecimalMeasurementL1Lab {...props} activity={props.activity} />;
  }
  if (isDecimalComparisonPracticeActivity(props.activity)) {
    return <DecimalComparisonPracticeLab {...props} activity={props.activity} />;
  }
  if (isDecimalComparisonActivity(props.activity)) {
    return <DecimalComparisonLab {...props} activity={props.activity} />;
  }
  if (isDecimalNotationL2Activity(props.activity)) {
    return <DecimalNotationL2Lab {...props} activity={props.activity} />;
  }
  return <DecimalNotationL1Core {...props} activity={props.activity} />;
}

function DecimalNotationL1Core({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalNotationL1CoreProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(() => createPublicDecimalNotationL1Task({
    seed: effectiveSeed,
    difficulty: activeDifficulty,
    activity,
  }), [activeDifficulty, activity, effectiveSeed]);
  const [shaded, setShaded] = useState(0);
  const [placeState, setPlaceState] = useState<DecimalPlaceValueState>(blankPlaceState);
  const [digitInput, setDigitInput] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [glassTenths, setGlassTenths] = useState(0);
  const [glassHundredths, setGlassHundredths] = useState(0);
  const [composedHundredths, setComposedHundredths] = useState(0);
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    maxScore: activity === "independent" ? 4 : 1,
    partial: activity === "independent",
  }) : null;
  const placedHundredths = hundredthsFromPlaces(placeState);

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const resetWork = () => {
    setShaded(0);
    setPlaceState(blankPlaceState());
    setDigitInput("");
    setWordInput("");
    setGlassTenths(0);
    setGlassHundredths(0);
    setComposedHundredths(0);
    clearResult();
  };

  const chooseDifficulty = (nextDifficulty: LessonDifficulty) => {
    setActiveDifficulty(nextDifficulty);
    resetWork();
  };

  const fail = (code: DecimalFeedbackCode, answerLabel: string) => {
    setDiagnosticCode(code);
    setSuccessMessage(null);
    onResultChange?.(false, answerLabel);
  };

  const succeed = (message: string, answerLabel: string) => {
    setDiagnosticCode(null);
    setSuccessMessage(message);
    onResultChange?.(true, answerLabel);
  };

  const checkNumberAndWords = (): DecimalFeedbackCode | null => {
    if (!digitInput.trim() || !wordInput.trim()) return DECIMAL_FEEDBACK_CODES.empty;
    if (/^[,.]/u.test(digitInput.trim())) return DECIMAL_FEEDBACK_CODES.missingZero;
    const parsed = parseDecimalInput(digitInput);
    const expected = parseDecimalInput(task.decimalDisplay);
    if (!parsed.ok) return parsed.error.code === "DEC_EMPTY" ? DECIMAL_FEEDBACK_CODES.empty : DECIMAL_FEEDBACK_CODES.placeValue;
    if (!expected.ok || !areEquivalentDecimals(parsed.value, expected.value)) return DECIMAL_FEEDBACK_CODES.placeValue;
    if (normalizeWords(wordInput) !== normalizeWords(task.words)) return DECIMAL_FEEDBACK_CODES.placeValue;
    return null;
  };

  const checkActivity = () => {
    if (activity === "hundred-grid") {
      if (shaded !== 37) return fail(DECIMAL_FEEDBACK_CODES.placeValue, `${shaded}/100`);
      return succeed("37 pól, ułamek 37/100 i zapis 0,37 pokazują tę samą wartość.", "37/100 = 0,37");
    }
    if (activity === "place-table") {
      if (placedHundredths === null) return fail(DECIMAL_FEEDBACK_CODES.missingZero, "niepełna tabela");
      if (placedHundredths !== 37) return fail(DECIMAL_FEEDBACK_CODES.placeValue, `${placedHundredths}/100`);
      return succeed("Cyfra 3 oznacza trzy dziesiąte, a cyfra 7 — siedem setnych.", "0,37");
    }
    if (activity === "word-digit") {
      const code = checkNumberAndWords();
      if (code) return fail(code, `${digitInput || "□"}; ${wordInput || "□"}`);
      return succeed("Zapis słowny i cyfrowy opisują trzydzieści siedem setnych.", `${digitInput}; ${wordInput}`);
    }
    if (activity === "glass") {
      if (glassTenths !== 40 || glassHundredths !== 4) {
        return fail(DECIMAL_FEEDBACK_CODES.placeValue, `szklanki ${glassTenths}/100 i ${glassHundredths}/100`);
      }
      return succeed("0,4 to 40 setnych, a 0,04 to 4 setne — pierwsza ilość jest dziesięć razy większa.", "0,4 > 0,04");
    }
    if (activity === "independent") {
      if (shaded !== task.targetHundredths) return fail(DECIMAL_FEEDBACK_CODES.placeValue, `${shaded}/100`);
      if (placedHundredths === null) return fail(DECIMAL_FEEDBACK_CODES.missingZero, "niepełna tabela");
      if (placedHundredths !== task.targetHundredths) return fail(DECIMAL_FEEDBACK_CODES.placeValue, `${placedHundredths}/100 w tabeli`);
      const code = checkNumberAndWords();
      if (code) return fail(code, `${digitInput || "□"}; ${wordInput || "□"}`);
      return succeed("Wszystkie cztery reprezentacje są zgodne.", `${task.fractionDisplay} = ${digitInput}; ${wordInput}`);
    }
  };

  const changePlaceState = (value: DecimalPlaceValueState) => {
    setPlaceState(value);
    clearResult();
  };

  const renderGrid = (target: number) => (
    <div className="space-y-3">
      <p className="rounded-xl bg-cyan-50 px-4 py-3 font-black text-cyan-950">Cel: zaznacz {target} ze 100 pól.</p>
      <DecimalHundredGrid shaded={shaded} onChange={(value) => { setShaded(value); clearResult(); }} readOnly={readOnly} label={`Kratownica 10 na 10 — cel ${target} pól`} />
    </div>
  );

  const renderPlaceTable = () => (
    <div className="space-y-3">
      <p className="rounded-xl bg-violet-50 px-4 py-3 font-black text-violet-950">Jedna cyfra w jednej kolumnie. Puste miejsce nie jest zerem.</p>
      <DecimalPlaceValueGrid value={placeState} onChange={changePlaceState} minimumPower={-2} maximumPower={0} readOnly={readOnly} diagnosticCode={diagnosticCode === DECIMAL_FEEDBACK_CODES.placeValue || diagnosticCode === DECIMAL_FEEDBACK_CODES.missingZero ? diagnosticCode : undefined} />
      <p className="rounded-xl bg-slate-100 px-4 py-3 font-bold" aria-live="polite">
        Odczyt tabeli: {placedHundredths === null ? "uzupełnij jedności, dziesiąte i setne" : `${placedHundredths}/100 = ${decimalHundredthsDisplay(placedHundredths)} — ${decimalHundredthsWords(placedHundredths)}`}.
      </p>
    </div>
  );

  const renderWordAndDigit = () => (
    <div className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4">
      <div>
        <p className="mb-2 font-black">1. Zapisz cyframi: <span className="text-indigo-800">{task.words}</span></p>
        <DecimalDigitInput value={digitInput} onChange={(value) => { setDigitInput(value); clearResult(); }} label="Zapis cyfrowy" readOnly={readOnly} showKeypad={!readOnly} />
      </div>
      <label className="block font-black">
        <span className="mb-2 block">2. Zapisz słownie: <span className="font-mono text-indigo-800">{task.decimalDisplay}</span></span>
        <input type="text" value={wordInput} readOnly={readOnly} className={styles.wordField} aria-label="Zapis słowny liczby" autoComplete="off" onChange={(event) => { setWordInput(event.target.value); clearResult(); }} />
      </label>
      <p className="text-sm font-semibold text-slate-600">Podpowiedź nie pokazuje gotowego zapisu przed pierwszą próbą.</p>
    </div>
  );

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName="space-y-4"
      eyebrow="Dział 5 · Temat 1"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-decimal-notation-l1
      data-decimal-activity={activity}
      data-generator-id={task.generatorId}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-presentation-mode={presentationMode || undefined}
      data-answer-spec="server-only"
    >
      {!onResultChange && !readOnly ? (
        <div className={`${styles.controls} flex flex-wrap gap-2`} aria-label="Wybierz wariant zadania">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button key={level} type="button" aria-pressed={activeDifficulty === level} onClick={() => chooseDifficulty(level)} className={`${styles.touchTarget} rounded-xl border-2 px-4 text-sm font-black ${activeDifficulty === level ? "border-violet-700 bg-violet-700 text-white" : "border-violet-200 bg-white text-violet-950"}`}>
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      ) : <p className="w-fit rounded-xl bg-violet-100 px-3 py-2 text-sm font-black text-violet-950">Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p>}

      {activity === "tenths-hundredths" ? (
        <div className="space-y-4">
          <div className={`${styles.controls} flex flex-wrap gap-2`}>
            <button type="button" disabled={readOnly || composedHundredths > 89} className={`${styles.touchTarget} rounded-xl bg-cyan-700 px-4 font-black text-white disabled:opacity-40`} onClick={() => { setComposedHundredths((value) => value + 10); clearResult(); }}>+ 1 dziesiąta</button>
            <button type="button" disabled={readOnly || composedHundredths >= 99} className={`${styles.touchTarget} rounded-xl bg-indigo-700 px-4 font-black text-white disabled:opacity-40`} onClick={() => { setComposedHundredths((value) => value + 1); clearResult(); }}>+ 1 setna</button>
            <button type="button" disabled={readOnly || composedHundredths === 0} className={`${styles.touchTarget} rounded-xl border-2 border-slate-300 bg-white px-4 font-black disabled:opacity-40`} onClick={() => { setComposedHundredths(0); clearResult(); }}>Wyzeruj model</button>
          </div>
          <DecimalHundredGrid shaded={composedHundredths} readOnly label="Model części dziesiątych i setnych" />
          <p className="rounded-2xl bg-slate-950 p-4 text-center text-xl font-black text-white" aria-live="polite">
            {Math.floor(composedHundredths / 10)} dziesiątych + {composedHundredths % 10} setnych = {composedHundredths}/100 = {decimalHundredthsDisplay(composedHundredths)}
          </p>
        </div>
      ) : null}

      {activity === "hundred-grid" ? renderGrid(37) : null}
      {activity === "place-table" ? renderPlaceTable() : null}
      {activity === "word-digit" ? renderWordAndDigit() : null}

      {activity === "glass" ? (
        <div className={styles.glassGrid}>
          <div className="space-y-3 rounded-2xl border-2 border-cyan-100 bg-white p-4">
            <h3 className="text-center text-lg font-black">Szklanka A · 0,4</h3>
            <GlassModel value={glassTenths} label="Szklanka A — cztery dziesiąte" />
            {!readOnly ? <label className={`${styles.controls} block font-bold`}>Zabarwienie szklanki A: {glassTenths}/100<input type="range" min={0} max={100} step={1} value={glassTenths} className="min-h-11 w-full accent-cyan-700" aria-label="Zabarwienie szklanki A w setnych" onChange={(event) => { setGlassTenths(Number(event.target.value)); clearResult(); }} /></label> : null}
          </div>
          <div className="space-y-3 rounded-2xl border-2 border-violet-100 bg-white p-4">
            <h3 className="text-center text-lg font-black">Szklanka B · 0,04</h3>
            <GlassModel value={glassHundredths} label="Szklanka B — cztery setne" />
            {!readOnly ? <label className={`${styles.controls} block font-bold`}>Zabarwienie szklanki B: {glassHundredths}/100<input type="range" min={0} max={100} step={1} value={glassHundredths} className="min-h-11 w-full accent-violet-700" aria-label="Zabarwienie szklanki B w setnych" onChange={(event) => { setGlassHundredths(Number(event.target.value)); clearResult(); }} /></label> : null}
          </div>
        </div>
      ) : null}

      {activity === "independent" ? (
        <div className="space-y-5">
          <p className="rounded-2xl bg-indigo-700 p-4 text-center text-lg font-black text-white">Cel: {task.fractionDisplay} = {task.decimalDisplay}. Nie korzystaj z gotowego przykładu.</p>
          {renderGrid(task.targetHundredths)}
          {renderPlaceTable()}
          {renderWordAndDigit()}
        </div>
      ) : null}

      {!readOnly && activity !== "tenths-hundredths" ? (
        <button type="button" className={`${styles.controls} ${styles.touchTarget} w-full rounded-xl bg-slate-950 px-5 text-lg font-black text-white`} onClick={checkActivity}>
          Sprawdź zapis i model
        </button>
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
