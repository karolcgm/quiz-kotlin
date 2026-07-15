"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DecimalDigitInput } from "@/components/lessons/decimals/DecimalDigitInput";
import { DecimalPlaceValueGrid } from "@/components/lessons/decimals/DecimalPlaceValueGrid";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  createPublicDecimalMeasurementL2Task,
  expectedMeasurementDisplay,
  isMassClaimRealistic,
  itemScaleOperation,
  massDisplaysFromWeights,
  totalGramsFromWeights,
  validateMeasurementL2Conversion,
  type DecimalMeasurementL2Activity,
  type DecimalMeasurementL2Item,
  type DecimalMeasurementL2Unit,
  type DecimalMeasurementScaleOperation,
  type DecimalRealismChoice,
  type DecimalScaleWeights,
} from "@/lib/math/decimals/decimalMeasurementL2";
import {
  createDecimalDiagnosticResult,
  decimalPlaceStateFromInput,
  parseDecimalInput,
} from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode, DecimalPlaceValueState } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalMeasurementL2.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Start",
  core: "Dalej",
  challenge: "Mistrzowskie",
};

const ACTIVITY_TITLES: Record<DecimalMeasurementL2Activity, string> = {
  "laboratory-scale-mass": "Waga laboratoryjna",
  "unit-scale-mass": "Nie przesuwamy przecinka bez sensu",
  "medicine-packing": "Pakowanie leków dla zwierząt",
  "mixed-measurements": "Mieszane przeliczenia",
  "independent-mixed": "Praca samodzielna",
};

const SCALE_OPERATIONS: DecimalMeasurementScaleOperation[] = ["×10", "×100", "×1000", "÷10", "÷100", "÷1000"];

const LENGTH_UNITS: Array<{ id: DecimalMeasurementL2Unit; label: string }> = [
  { id: "mm", label: "mm — milimetry" },
  { id: "cm", label: "cm — centymetry" },
  { id: "m", label: "m — metry" },
  { id: "km", label: "km — kilometry" },
];

const MASS_UNITS: Array<{ id: DecimalMeasurementL2Unit; label: string }> = [
  { id: "g", label: "g — gramy" },
  { id: "dag", label: "dag — dekagramy" },
  { id: "kg", label: "kg — kilogramy" },
  { id: "t", label: "t — tony" },
];

interface ConversionAnswer {
  value: string;
  unit: DecimalMeasurementL2Unit | "";
  operation: DecimalMeasurementScaleOperation | "";
}

function blankAnswer(): ConversionAnswer {
  return { value: "", unit: "", operation: "" };
}

function placeStateFromAnswer(value: string): DecimalPlaceValueState {
  const parsed = parseDecimalInput(value);
  return parsed.ok ? decimalPlaceStateFromInput(parsed.trace.display) : {};
}

function sourceLabel(conversion: DecimalMeasurementL2Item): string {
  return conversion.parts.map((part) => `${part.value} ${part.unit}`).join(" + ");
}

function LaboratoryScaleModel({ weights }: { weights: DecimalScaleWeights }) {
  const displays = massDisplaysFromWeights(weights);
  return (
    <AccessibleMathSvg
      title="Waga laboratoryjna z odważnikami kilogramowymi, dekagramowymi i gramowymi"
      description={`Na wadze są odważniki ${weights.kg} kg, ${weights.dag} dag i ${weights.g} g. Razem pokazują ${displays.g} g, czyli ${displays.dag} dag i ${displays.kg} kg.`}
      viewBox="0 0 700 300"
      className={styles.scaleSvg}
      columns={[
        { key: "kg", label: "Odważniki kg" },
        { key: "dag", label: "Odważniki dag" },
        { key: "g", label: "Odważniki g" },
        { key: "total", label: "Masa razem" },
      ]}
      rows={[{
        kg: `${weights.kg} kg`,
        dag: `${weights.dag} dag`,
        g: `${weights.g} g`,
        total: `${displays.kg} kg = ${displays.dag} dag = ${displays.g} g`,
      }]}
    >
      <defs>
        <pattern id="mass-kg-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#dbeafe" />
          <circle cx="6" cy="6" r="2" fill="#1d4ed8" />
        </pattern>
        <pattern id="mass-dag-pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="#fef3c7" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="#92400e" strokeWidth="3" />
        </pattern>
        <pattern id="mass-g-pattern" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="#dcfce7" />
          <path d="M0 9 L9 0" stroke="#166534" strokeWidth="2" />
        </pattern>
      </defs>
      <rect x="70" y="185" width="560" height="32" rx="8" fill="#e2e8f0" stroke="#334155" strokeWidth="5" />
      <path d="M245 217 H455 L500 265 H200 Z" fill="#f8fafc" stroke="#334155" strokeWidth="5" />
      <rect x="280" y="235" width="140" height="45" rx="10" fill="#0f172a" />
      <text x="350" y="264" textAnchor="middle" fill="white" fontSize="22" fontWeight="900">{displays.kg} kg</text>
      <rect x="105" y="95" width="145" height="90" rx="14" fill="url(#mass-kg-pattern)" stroke="#1e3a8a" strokeWidth="4" />
      <text x="177" y="132" textAnchor="middle" fontSize="21" fontWeight="900">1 kg × {weights.kg}</text>
      <text x="177" y="160" textAnchor="middle" fontSize="14" fontWeight="800">wzór kropkowany</text>
      <rect x="278" y="110" width="145" height="75" rx="14" fill="url(#mass-dag-pattern)" stroke="#78350f" strokeWidth="4" />
      <text x="350" y="141" textAnchor="middle" fontSize="20" fontWeight="900">1 dag × {weights.dag}</text>
      <text x="350" y="165" textAnchor="middle" fontSize="14" fontWeight="800">wzór ukośny</text>
      <rect x="451" y="125" width="145" height="60" rx="14" fill="url(#mass-g-pattern)" stroke="#14532d" strokeWidth="4" />
      <text x="523" y="151" textAnchor="middle" fontSize="20" fontWeight="900">1 g × {weights.g}</text>
      <text x="523" y="174" textAnchor="middle" fontSize="14" fontWeight="800">wzór krzyżowy</text>
      <text x="350" y="55" textAnchor="middle" fontSize="22" fontWeight="900">{displays.g} g = {displays.dag} dag = {displays.kg} kg</text>
    </AccessibleMathSvg>
  );
}

function WeightControl({ unit, value, onChange }: {
  unit: keyof DecimalScaleWeights;
  value: number;
  onChange: (value: number) => void;
}) {
  const maximum = unit === "kg" ? 3 : 99;
  const update = (next: number) => onChange(Math.max(0, Math.min(maximum, Math.round(next))));
  return (
    <div className={styles.weightControl}>
      <b>Odważniki 1 {unit}</b>
      <div>
        <button type="button" aria-label={`Odejmij odważnik ${unit}`} onClick={() => update(value - 1)}>−</button>
        <input
          type="text"
          inputMode="numeric"
          value={String(value)}
          aria-label={`Liczba odważników ${unit}`}
          onChange={(event) => update(Number(event.target.value) || 0)}
        />
        <button type="button" aria-label={`Dodaj odważnik ${unit}`} onClick={() => update(value + 1)}>+</button>
      </div>
    </div>
  );
}

function MassPositionTable({ conversion, operation }: { conversion: DecimalMeasurementL2Item; operation: string }) {
  const sourceUnit = [...conversion.parts].reverse().find((part) => part.unit !== conversion.targetUnit)?.unit ?? conversion.parts[0]?.unit;
  return (
    <div className={styles.positionWrap}>
      <table className={styles.positionTable}>
        <caption>Jednostka wyznacza zmianę wartości pozycyjnej</caption>
        <thead><tr><th scope="col">Od</th><th scope="col">Zmiana skali</th><th scope="col">Do</th></tr></thead>
        <tbody><tr><td>{sourceUnit}</td><td>{operation || "wybierz"}</td><td>{conversion.targetUnit}</td></tr></tbody>
      </table>
      {conversion.dimension === "mass" ? <p><b>1 kg = 100 dag = 1000 g.</b> Najpierw wskaż relację jednostek, potem odczytaj nowe pozycje cyfr.</p> : <p><b>1 km = 1000 m; 1 m = 100 cm.</b> Długość się nie zmienia — zmienia się jednostka i liczba.</p>}
    </div>
  );
}

function ConversionWorkspace({
  conversion,
  index,
  answer,
  realismChoice,
  readOnly,
  reveal,
  onAnswerChange,
  onRealismChange,
}: {
  conversion: DecimalMeasurementL2Item;
  index: number;
  answer: ConversionAnswer;
  realismChoice: DecimalRealismChoice | "";
  readOnly: boolean;
  reveal: boolean;
  onAnswerChange: (answer: ConversionAnswer) => void;
  onRealismChange: (choice: DecimalRealismChoice) => void;
}) {
  const shownAnswer: ConversionAnswer = reveal
    ? { value: expectedMeasurementDisplay(conversion), unit: conversion.targetUnit, operation: itemScaleOperation(conversion) }
    : answer;
  const shownRealism = reveal && conversion.realismClaim
    ? (isMassClaimRealistic(conversion.realismClaim) ? "realistic" : "absurd")
    : realismChoice;
  const unitOptions = conversion.dimension === "mass" ? MASS_UNITS : LENGTH_UNITS;

  return (
    <section className={styles.workspace} aria-labelledby={`measurement-l2-item-${conversion.id}`}>
      <h3 id={`measurement-l2-item-${conversion.id}`}>Zadanie {index + 1} · {conversion.dimension === "mass" ? "masa" : "długość"}</h3>
      <p className={styles.storyCard}>{conversion.prompt}</p>
      <MassPositionTable conversion={conversion} operation={shownAnswer.operation} />
      <div className={`${styles.controls} ${styles.operationGrid}`} role="group" aria-label={`Wybierz zmianę skali dla zadania ${index + 1}`}>
        {SCALE_OPERATIONS.map((operation) => (
          <button
            key={operation}
            type="button"
            disabled={readOnly}
            aria-label={`${operation} dla zadania ${index + 1}`}
            aria-pressed={shownAnswer.operation === operation}
            onClick={() => onAnswerChange({ ...answer, operation })}
          >{operation}</button>
        ))}
      </div>
      <div className={styles.answerGrid}>
        <DecimalDigitInput
          value={shownAnswer.value}
          onChange={(value) => onAnswerChange({ ...answer, value })}
          label={`Wynik liczbowy zadania ${index + 1}`}
          readOnly={readOnly}
          showKeypad={!readOnly}
        />
        <label>Jednostka wyniku zadania {index + 1}
          <select
            value={shownAnswer.unit}
            disabled={readOnly}
            aria-label={`Jednostka wyniku zadania ${index + 1}`}
            onChange={(event) => onAnswerChange({ ...answer, unit: event.target.value as DecimalMeasurementL2Unit | "" })}
          >
            <option value="">Wybierz jednostkę</option>
            {unitOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <div className={styles.placePreview}>
          <p>Zapis liczby w tabeli pozycyjnej</p>
          <DecimalPlaceValueGrid value={placeStateFromAnswer(shownAnswer.value)} onChange={() => undefined} minimumPower={-3} maximumPower={3} readOnly />
        </div>
      </div>
      {conversion.realismClaim ? (
        <fieldset className={styles.realismBox}>
          <legend>Kontrola realizmu etykiety: {conversion.realismClaim.value} {conversion.realismClaim.unit}</legend>
          <p>Przedmiot: {conversion.realismClaim.objectLabel}. Porównaj wydruk z typowym zakresem, nie tylko z samymi cyframi.</p>
          <div className={`${styles.controls} flex flex-wrap gap-2`}>
            <button type="button" disabled={readOnly} aria-pressed={shownRealism === "realistic"} onClick={() => onRealismChange("realistic")}>Etykieta jest realistyczna</button>
            <button type="button" disabled={readOnly} aria-pressed={shownRealism === "absurd"} onClick={() => onRealismChange("absurd")}>Etykieta jest absurdem</button>
          </div>
        </fieldset>
      ) : null}
    </section>
  );
}

export interface DecimalMeasurementL2LabProps {
  activity: DecimalMeasurementL2Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalMeasurementL2Lab({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalMeasurementL2LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(
    () => createPublicDecimalMeasurementL2Task({ seed: effectiveSeed, difficulty: activeDifficulty, activity }),
    [activeDifficulty, activity, effectiveSeed],
  );
  const [weights, setWeights] = useState<DecimalScaleWeights>({ kg: 0, dag: 0, g: 0 });
  const [answers, setAnswers] = useState<Record<string, ConversionAnswer>>({});
  const [realismChoices, setRealismChoices] = useState<Record<string, DecimalRealismChoice | "">>({});
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [diagnosticReason, setDiagnosticReason] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const reveal = readOnly && activity !== "independent-mixed";
  const shownWeights = reveal && task.scaleTarget ? task.scaleTarget : weights;
  const scaleDisplays = massDisplaysFromWeights(shownWeights);
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    maxScore: Math.max(2, task.items.length * 3),
    partial: activity !== "laboratory-scale-mass",
    memberIds: diagnosticCode === DECIMAL_FEEDBACK_CODES.unitMismatch
      ? ["unit"]
      : diagnosticCode === DECIMAL_FEEDBACK_CODES.estimateRange
        ? [diagnosticReason?.includes("realizm") ? "realism" : "scale-operation"]
        : ["decimal-workspace"],
  }) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setDiagnosticReason(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };
  const resetWork = () => {
    setWeights({ kg: 0, dag: 0, g: 0 });
    setAnswers({});
    setRealismChoices({});
    clearResult();
  };
  const chooseDifficulty = (next: LessonDifficulty) => {
    setActiveDifficulty(next);
    resetWork();
  };
  const updateAnswer = (id: string, answer: ConversionAnswer) => {
    setAnswers((current) => ({ ...current, [id]: answer }));
    clearResult();
  };
  const updateRealism = (id: string, choice: DecimalRealismChoice) => {
    setRealismChoices((current) => ({ ...current, [id]: choice }));
    clearResult();
  };
  const updateWeight = (unit: keyof DecimalScaleWeights, value: number) => {
    setWeights((current) => ({ ...current, [unit]: value }));
    clearResult();
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

  const answerSummary = () => task.items.map((conversion) => {
    const answer = answers[conversion.id] ?? blankAnswer();
    return `${answer.value || "▽"} ${answer.unit || "bez jednostki"}`;
  }).join("; ");

  const checkActivity = () => {
    if (activity === "laboratory-scale-mass") {
      const expectedGrams = task.scaleTarget ? totalGramsFromWeights(task.scaleTarget) : 0;
      const actualGrams = totalGramsFromWeights(weights);
      if (actualGrams !== expectedGrams) {
        return fail(
          DECIMAL_FEEDBACK_CODES.estimateRange,
          `Waga pokazuje ${actualGrams} g, a polecenie wymaga ${expectedGrams} g. Sprawdź osobno odważniki kg, dag i g.`,
          `${actualGrams} g`,
        );
      }
      return succeed(
        `${scaleDisplays.g} g = ${scaleDisplays.dag} dag = ${scaleDisplays.kg} kg. Każdy odczyt ma jawną jednostkę.`,
        `${scaleDisplays.kg} kg`,
      );
    }

    for (const [index, conversion] of task.items.entries()) {
      const answer = answers[conversion.id] ?? blankAnswer();
      const result = validateMeasurementL2Conversion({
        item: conversion,
        value: answer.value,
        unit: answer.unit,
        scaleOperation: answer.operation,
        realismChoice: realismChoices[conversion.id],
      });
      if (result.correct) continue;
      const prefix = task.items.length > 1 ? `Zadanie ${index + 1}. ` : "";
      if (result.issue === "scale") {
        return fail(
          result.code ?? DECIMAL_FEEDBACK_CODES.estimateRange,
          `${prefix}Wybrany mnożnik nie pasuje do przejścia ${conversion.parts.at(-1)?.unit} → ${conversion.targetUnit}. Nazwij relację jednostek przed rachunkiem.`,
          answerSummary(),
        );
      }
      if (result.issue === "unit") {
        return fail(
          result.code ?? DECIMAL_FEEDBACK_CODES.unitMismatch,
          `${prefix}Wartość może być poprawna, ale odpowiedź wymaga jawnej jednostki ${conversion.targetUnit}.`,
          answerSummary(),
        );
      }
      if (result.issue === "realism") {
        return fail(
          result.code ?? DECIMAL_FEEDBACK_CODES.estimateRange,
          `${prefix}${answer.value ? "Sprawdź realizm etykiety i rząd wielkości dla opisanego opakowania." : "Wybierz ocenę realizmu etykiety."}`,
          answerSummary(),
        );
      }
      if (result.issue === "empty") {
        return fail(
          result.code ?? DECIMAL_FEEDBACK_CODES.empty,
          `${prefix}Uzupełnij liczbę; puste pole nie oznacza 0 ${conversion.targetUnit}.`,
          answerSummary(),
        );
      }
      return fail(
        result.code ?? DECIMAL_FEEDBACK_CODES.placeValue,
        `${prefix}Sprawdź pozycję przecinka. Zmiana ${conversion.parts.at(-1)?.unit} → ${conversion.targetUnit} zmienia wartość cyfr zgodnie z mnożnikiem.`,
        answerSummary(),
      );
    }

    const equations = task.items.map((conversion) => {
      const answer = answers[conversion.id] ?? blankAnswer();
      return `${sourceLabel(conversion)} = ${answer.value} ${conversion.targetUnit}`;
    });
    return succeed(`${equations.join("; ")}. Mnożniki, liczby i jednostki są zgodne.`, answerSummary());
  };

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName="space-y-4"
      eyebrow="Dział 5 · Temat 6"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-decimal-measurement-l2
      data-decimal-activity={activity}
      data-generator-id={task.generatorId}
      data-generator-version={task.generatorVersion}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-presentation-mode={presentationMode || undefined}
      data-answer-spec="server-only"
    >
      {!onResultChange && !readOnly ? (
        <div className={`${styles.controls} flex flex-wrap gap-2`} aria-label="Wybierz wariant zadania">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button key={level} type="button" aria-pressed={activeDifficulty === level} className={styles.difficultyButton} onClick={() => chooseDifficulty(level)}>{DIFFICULTY_LABELS[level]}</button>
          ))}
        </div>
      ) : <p className="w-fit rounded-xl bg-violet-100 px-3 py-2 text-sm font-black text-violet-950">Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p>}

      {activity === "laboratory-scale-mass" ? (
        <section className="space-y-4">
          <p className={styles.storyCard}>{task.story}</p>
          {!readOnly ? (
            <div className={`${styles.controls} ${styles.weightGrid}`}>
              {(["kg", "dag", "g"] as const).map((unit) => (
                <WeightControl key={unit} unit={unit} value={weights[unit]} onChange={(value) => updateWeight(unit, value)} />
              ))}
            </div>
          ) : null}
          <div className={styles.modelScroll}>
            <LaboratoryScaleModel weights={shownWeights} />
          </div>
          <div className={styles.readoutGrid} aria-live="polite">
            <p><b>{scaleDisplays.g} g</b><span>gramy</span></p>
            <p><b>{scaleDisplays.dag} dag</b><span>dekagramy</span></p>
            <p><b>{scaleDisplays.kg} kg</b><span>kilogramy</span></p>
          </div>
        </section>
      ) : (
        <div className="space-y-5">
          {task.items.map((conversion, index) => (
            <ConversionWorkspace
              key={conversion.id}
              conversion={conversion}
              index={index}
              answer={answers[conversion.id] ?? blankAnswer()}
              realismChoice={realismChoices[conversion.id] ?? ""}
              readOnly={readOnly}
              reveal={reveal}
              onAnswerChange={(answer) => updateAnswer(conversion.id, answer)}
              onRealismChange={(choice) => updateRealism(conversion.id, choice)}
            />
          ))}
        </div>
      )}

      {!readOnly ? <button type="button" className={`${styles.controls} ${styles.checkButton}`} onClick={checkActivity}>Sprawdź mnożnik, wartość, jednostkę i realizm</button> : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnosticReason ? <p role="status" className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 font-black text-amber-950">{diagnosticReason}</p> : null}
      {diagnostic ? (
        onResultChange
          ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
          : <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
