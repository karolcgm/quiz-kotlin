"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DecimalDigitInput } from "@/components/lessons/decimals/DecimalDigitInput";
import { DecimalPlaceValueGrid } from "@/components/lessons/decimals/DecimalPlaceValueGrid";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import {
  createPublicDecimalMeasurementTask,
  expectedLengthDisplay,
  lengthDisplaysFromMillimeters,
  taskScaleOperation,
  validateLengthConversion,
  type DecimalLengthScaleOperation,
  type DecimalLengthUnit,
  type DecimalMeasurementL1Activity,
  type DecimalMeasurementPublicTask,
} from "@/lib/math/decimals/decimalMeasurementL1";
import {
  createDecimalDiagnosticResult,
  decimalPlaceStateFromInput,
  parseDecimalInput,
} from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode, DecimalPlaceValueState } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalMeasurementL1.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Start",
  core: "Dalej",
  challenge: "Mistrzowskie",
};

const ACTIVITY_TITLES: Record<DecimalMeasurementL1Activity, string> = {
  "realtime-ruler": "Miarka w czasie rzeczywistym",
  "two-part-length": "2 m 35 cm = 2,35 m",
  "unit-scale-length": "Nie przesuwamy przecinka bez sensu",
  "length-story": "Szlak pomiarowy",
  "independent-length": "Praca samodzielna",
};

const LENGTH_UNITS: Array<{ id: DecimalLengthUnit; label: string }> = [
  { id: "mm", label: "mm — milimetry" },
  { id: "cm", label: "cm — centymetry" },
  { id: "m", label: "m — metry" },
  { id: "km", label: "km — kilometry" },
];

const SCALE_OPERATIONS: DecimalLengthScaleOperation[] = ["×10", "×100", "×1000", "÷10", "÷100", "÷1000"];

function placeStateFromAnswer(value: string): DecimalPlaceValueState {
  const parsed = parseDecimalInput(value);
  return parsed.ok ? decimalPlaceStateFromInput(parsed.trace.display) : {};
}

function sourceLabel(task: DecimalMeasurementPublicTask): string {
  return task.parts.map((part) => `${part.value} ${part.unit}`).join(" + ");
}

function RulerModel({ millimeters }: { millimeters: number }) {
  const displays = lengthDisplaysFromMillimeters(millimeters);
  const markerX = 50 + (millimeters / 3000) * 500;
  return (
    <AccessibleMathSvg
      title="Miarka długości od 0 mm do 3000 mm"
      description={`Znacznik pokazuje ${displays.mm} mm, czyli ${displays.cm} cm i ${displays.m} m.`}
      viewBox="0 0 600 190"
      className={styles.rulerSvg}
      columns={[
        { key: "mm", label: "Milimetry" },
        { key: "cm", label: "Centymetry" },
        { key: "m", label: "Metry" },
      ]}
      rows={[{ mm: `${displays.mm} mm`, cm: `${displays.cm} cm`, m: `${displays.m} m` }]}
    >
      <defs>
        <pattern id="ruler-marker-pattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#fef3c7" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#92400e" strokeWidth="3" />
        </pattern>
      </defs>
      <rect x="40" y="75" width="520" height="65" rx="12" fill="#fff" stroke="#334155" strokeWidth="4" />
      {Array.from({ length: 31 }, (_, index) => {
        const x = 50 + (index / 30) * 500;
        const major = index % 5 === 0;
        return <line key={index} x1={x} x2={x} y1="78" y2={major ? "112" : "98"} stroke="#334155" strokeWidth={major ? 3 : 1.5} />;
      })}
      <line x1={markerX} x2={markerX} y1="40" y2="145" stroke="#92400e" strokeWidth="7" data-ruler-marker />
      <circle cx={markerX} cy="40" r="13" fill="url(#ruler-marker-pattern)" stroke="#78350f" strokeWidth="3" />
      <text x={markerX} y="25" textAnchor="middle" fontSize="17" fontWeight="900">{displays.m} m</text>
      <text x="50" y="168" textAnchor="middle" fontWeight="800">0 mm</text>
      <text x="550" y="168" textAnchor="middle" fontWeight="800">3000 mm</text>
    </AccessibleMathSvg>
  );
}

function JoinedSegmentsModel() {
  return (
    <AccessibleMathSvg
      title="Dwa odcinki: 2 metry i 35 centymetrów"
      description="Pierwszy odcinek ma 2 m, a do jego końca dołączono drugi odcinek długości 35 cm. Wzory i etykiety rozróżniają obie części niezależnie od koloru."
      viewBox="0 0 600 170"
      className={styles.segmentSvg}
      columns={[{ key: "part", label: "Część" }, { key: "length", label: "Długość" }]}
      rows={[{ part: "A", length: "2 m" }, { part: "B", length: "35 cm" }]}
    >
      <defs>
        <pattern id="segment-a-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#dbeafe" />
          <circle cx="5" cy="5" r="2" fill="#1d4ed8" />
        </pattern>
        <pattern id="segment-b-pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#fef3c7" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="#b45309" strokeWidth="3" />
        </pattern>
      </defs>
      <rect x="45" y="70" width="410" height="38" rx="8" fill="url(#segment-a-pattern)" stroke="#1e3a8a" strokeWidth="3" />
      <rect x="455" y="70" width="100" height="38" rx="8" fill="url(#segment-b-pattern)" stroke="#78350f" strokeWidth="3" />
      <text x="250" y="58" textAnchor="middle" fontSize="19" fontWeight="900">A · 2 m</text>
      <text x="505" y="58" textAnchor="middle" fontSize="19" fontWeight="900">B · 35 cm</text>
      <line x1="45" x2="555" y1="135" y2="135" stroke="#0f172a" strokeWidth="3" />
      <line x1="45" x2="45" y1="125" y2="145" stroke="#0f172a" strokeWidth="3" />
      <line x1="555" x2="555" y1="125" y2="145" stroke="#0f172a" strokeWidth="3" />
      <text x="300" y="162" textAnchor="middle" fontSize="15" fontWeight="800">połączone bez luki i nakładania</text>
    </AccessibleMathSvg>
  );
}

function UnitScaleTable({ task, operation }: { task: DecimalMeasurementPublicTask; operation: string }) {
  const sourceUnit = task.parts.at(-1)?.unit ?? "m";
  return (
    <div className={styles.unitTableWrap}>
      <table className={styles.unitTable}>
        <caption>Zmiana jednostki i wartości jednej pozycji</caption>
        <thead><tr><th scope="col">Od</th><th scope="col">Zmiana skali</th><th scope="col">Do</th></tr></thead>
        <tbody><tr><td data-unit-source>{sourceUnit}</td><td data-scale-operation>{operation || "wybierz"}</td><td data-unit-target>{task.targetUnit}</td></tr></tbody>
      </table>
      <p className="p-3 text-sm font-bold text-slate-700">Jednostka staje się {sourceUnit === task.targetUnit ? "taka sama" : "inna"}; dlatego wartość cyfr zmienia się o odpowiednią potęgę 10.</p>
    </div>
  );
}

function ScaleSelector({ value, onChange, readOnly }: { value: string; onChange: (value: DecimalLengthScaleOperation) => void; readOnly: boolean }) {
  return (
    <div className={`${styles.controls} grid grid-cols-3 gap-2 sm:grid-cols-6`} role="group" aria-label="Wybierz zmianę skali jednostki">
      {SCALE_OPERATIONS.map((operation) => (
        <button key={operation} type="button" disabled={readOnly} aria-pressed={value === operation} className={styles.scaleButton} onClick={() => onChange(operation)}>{operation}</button>
      ))}
    </div>
  );
}

function MeasurementAnswer({ value, unit, readOnly, onValueChange, onUnitChange }: {
  value: string;
  unit: string;
  readOnly: boolean;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: DecimalLengthUnit | "") => void;
}) {
  return (
    <div className={styles.answerGrid}>
      <DecimalDigitInput value={value} onChange={onValueChange} label="Wynik liczbowy" readOnly={readOnly} showKeypad={!readOnly} />
      <label className="block font-black">Jednostka wyniku
        <select value={unit} disabled={readOnly} aria-label="Jednostka wyniku" className={styles.unitSelect} onChange={(event) => onUnitChange(event.target.value as DecimalLengthUnit | "")}>
          <option value="">Wybierz jednostkę</option>
          {LENGTH_UNITS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
      <div className={styles.placePreview}>
        <p className="mb-2 font-black">Zapis w tabeli pozycyjnej</p>
        <DecimalPlaceValueGrid value={placeStateFromAnswer(value)} onChange={() => undefined} minimumPower={-3} maximumPower={3} readOnly />
      </div>
    </div>
  );
}

export interface DecimalMeasurementL1LabProps {
  activity: DecimalMeasurementL1Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalMeasurementL1Lab({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalMeasurementL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(() => createPublicDecimalMeasurementTask({ seed: effectiveSeed, difficulty: activeDifficulty, activity }), [activeDifficulty, activity, effectiveSeed]);
  const targetMillimeters = Number(task.parts[0]?.value ?? "0");
  const [rulerMillimeters, setRulerMillimeters] = useState(0);
  const [answerValue, setAnswerValue] = useState("");
  const [answerUnit, setAnswerUnit] = useState<DecimalLengthUnit | "">("");
  const [scaleOperation, setScaleOperation] = useState<DecimalLengthScaleOperation | "">("");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [diagnosticReason, setDiagnosticReason] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const revealDemonstration = readOnly && activity !== "independent-length";
  const displayedRuler = readOnly ? targetMillimeters : rulerMillimeters;
  const displayedAnswer = revealDemonstration ? expectedLengthDisplay(task) : answerValue;
  const displayedUnit = revealDemonstration ? task.targetUnit : answerUnit;
  const displayedOperation = revealDemonstration ? taskScaleOperation(task) : scaleOperation;
  const rulerDisplays = lengthDisplaysFromMillimeters(displayedRuler);
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    maxScore: activity === "independent-length" ? 3 : 2,
    partial: activity !== "realtime-ruler",
    memberIds: diagnosticCode === DECIMAL_FEEDBACK_CODES.unitMismatch ? ["unit"] : diagnosticCode === DECIMAL_FEEDBACK_CODES.estimateRange ? ["scale-operation"] : ["decimal-workspace"],
  }) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setDiagnosticReason(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };
  const resetWork = () => {
    setRulerMillimeters(0);
    setAnswerValue("");
    setAnswerUnit("");
    setScaleOperation("");
    clearResult();
  };
  const chooseDifficulty = (next: LessonDifficulty) => {
    setActiveDifficulty(next);
    resetWork();
  };
  const fail = (code: DecimalFeedbackCode, reason: string, answerLabel: string) => {
    setDiagnosticCode(code);
    setDiagnosticReason(reason);
    setSuccessMessage(null);
    onResultChange?.(false, answerLabel);
  };
  const succeed = (message: string, answerLabel: string) => {
    setDiagnosticCode(null);
    setDiagnosticReason(null);
    setSuccessMessage(message);
    onResultChange?.(true, answerLabel);
  };
  const updateRuler = (value: number) => {
    setRulerMillimeters(Math.max(0, Math.min(3000, Math.round(value))));
    clearResult();
  };

  const checkActivity = () => {
    if (activity === "realtime-ruler") {
      if (rulerMillimeters !== targetMillimeters) {
        return fail(DECIMAL_FEEDBACK_CODES.estimateRange, `Miarka ma wskazywać dokładnie ${targetMillimeters} mm. Sprawdź znacznik i jawne jednostki odczytów.`, `${rulerMillimeters} mm`);
      }
      return succeed(`${rulerDisplays.mm} mm = ${rulerDisplays.cm} cm = ${rulerDisplays.m} m.`, `${rulerDisplays.m} m`);
    }
    const result = validateLengthConversion({ task, value: answerValue, unit: answerUnit, scaleOperation });
    if (result.correct) {
      const normalized = result.normalizedDisplay ?? answerValue;
      return succeed(`${sourceLabel(task)} = ${normalized} ${task.targetUnit}. Liczba i jednostka są zgodne.`, `${normalized} ${task.targetUnit}`);
    }
    if (result.code === DECIMAL_FEEDBACK_CODES.estimateRange) {
      return fail(result.code, `Wybrany mnożnik nie pasuje do przejścia ${task.parts.at(-1)?.unit} → ${task.targetUnit}. Nazwij wartość jednej jednostki przed rachunkiem.`, `${answerValue || "□"} ${answerUnit || "bez jednostki"}; ${scaleOperation || "bez mnożnika"}`);
    }
    if (result.code === DECIMAL_FEEDBACK_CODES.unitMismatch) {
      return fail(result.code, `Wartość może być poprawna, ale odpowiedź wymaga jawnej jednostki ${task.targetUnit}.`, `${answerValue || "□"} ${answerUnit || "bez jednostki"}`);
    }
    if (result.code === DECIMAL_FEEDBACK_CODES.empty) {
      return fail(result.code, "Uzupełnij liczbę i nie traktuj pustego pola jak zera.", `${answerValue || "□"} ${answerUnit || "bez jednostki"}`);
    }
    return fail(DECIMAL_FEEDBACK_CODES.placeValue, `Sprawdź pozycję przecinka. Zmiana ${task.parts.at(-1)?.unit} → ${task.targetUnit} zmienia wartość cyfr zgodnie z wybranym mnożnikiem.`, `${answerValue || "□"} ${answerUnit || "bez jednostki"}`);
  };

  const renderConversionWorkspace = (showSegments = false) => (
    <div className="space-y-4">
      {showSegments ? <JoinedSegmentsModel /> : <p className={styles.storyCard}>{task.story}</p>}
      <UnitScaleTable task={task} operation={displayedOperation} />
      <ScaleSelector value={displayedOperation} readOnly={readOnly} onChange={(operation) => { setScaleOperation(operation); clearResult(); }} />
      <MeasurementAnswer
        value={displayedAnswer}
        unit={displayedUnit}
        readOnly={readOnly}
        onValueChange={(value) => { setAnswerValue(value); clearResult(); }}
        onUnitChange={(unit) => { setAnswerUnit(unit); clearResult(); }}
      />
    </div>
  );

  return (
    <article
      className={`${styles.lesson} space-y-4 rounded-[2rem] border-2 border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-amber-50 p-4 text-slate-950 shadow-xl sm:p-6`}
      data-decimal-measurement-l1
      data-decimal-activity={activity}
      data-generator-id={task.generatorId}
      data-generator-version={task.generatorVersion}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-presentation-mode={presentationMode || undefined}
      data-answer-spec="server-only"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-800">Dział 5 · Długość w zapisie dziesiętnym · L1</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{ACTIVITY_TITLES[activity]}</h2>
          <p className="mt-2 max-w-3xl font-semibold leading-relaxed text-slate-700">{task.prompt}</p>
        </div>
        {questionNumber && questionCount ? <b className="rounded-xl bg-indigo-100 px-3 py-2 text-sm text-indigo-950">Zadanie {questionNumber}/{questionCount}</b> : null}
      </header>

      {!onResultChange && !readOnly ? (
        <div className={`${styles.controls} flex flex-wrap gap-2`} aria-label="Wybierz wariant zadania">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button key={level} type="button" aria-pressed={activeDifficulty === level} className={styles.difficultyButton} onClick={() => chooseDifficulty(level)}>{DIFFICULTY_LABELS[level]}</button>
          ))}
        </div>
      ) : <p className="w-fit rounded-xl bg-cyan-100 px-3 py-2 text-sm font-black text-cyan-950">Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p>}

      {activity === "realtime-ruler" ? (
        <section className="space-y-4">
          <p className={styles.storyCard}>{task.story}</p>
          {!readOnly ? <div className={`${styles.controls} grid gap-3 rounded-2xl border-2 border-cyan-100 bg-white p-4`}>
            <label className="font-black">Długość na miarce: {rulerMillimeters} mm
              <input type="range" min={0} max={3000} step={1} value={rulerMillimeters} className="min-h-11 w-full accent-cyan-700" aria-label="Długość na miarce w milimetrach" onChange={(event) => updateRuler(Number(event.target.value))} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={styles.measureButton} onClick={() => updateRuler(rulerMillimeters - 10)}>− 10 mm</button>
              <input type="text" inputMode="numeric" value={String(rulerMillimeters)} className={styles.millimeterInput} aria-label="Wpisz długość w milimetrach" onChange={(event) => updateRuler(Number(event.target.value) || 0)} />
              <button type="button" className={styles.measureButton} onClick={() => updateRuler(rulerMillimeters + 10)}>+ 10 mm</button>
            </div>
          </div> : null}
          <RulerModel millimeters={displayedRuler} />
          <div className={styles.readoutGrid} aria-live="polite">
            <p><b>{rulerDisplays.mm} mm</b><span>milimetry</span></p>
            <p><b>{rulerDisplays.cm} cm</b><span>centymetry</span></p>
            <p><b>{rulerDisplays.m} m</b><span>metry</span></p>
          </div>
        </section>
      ) : null}

      {activity === "two-part-length" ? renderConversionWorkspace(true) : null}
      {activity === "unit-scale-length" ? renderConversionWorkspace() : null}
      {activity === "length-story" ? renderConversionWorkspace() : null}
      {activity === "independent-length" ? renderConversionWorkspace() : null}

      {!readOnly ? <button type="button" className={`${styles.controls} ${styles.checkButton}`} onClick={checkActivity}>Sprawdź wartość i jednostkę</button> : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnosticReason ? <p role="status" className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 font-black text-amber-950">{diagnosticReason}</p> : null}
      {diagnostic ? (
        onResultChange
          ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
          : <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </article>
  );
}
