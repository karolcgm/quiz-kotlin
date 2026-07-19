"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DecimalDigitInput } from "@/components/lessons/decimals/DecimalDigitInput";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  createPublicDecimalPowerTenTask,
  decimalDigitMovements,
  decimalPowerTenExpectedAnswer,
  validateDecimalPowerTenAnswer,
  type DecimalPowerTenL1Activity,
  type DecimalPowerTenPublicTask,
} from "@/lib/math/decimals/decimalPowerTenL1";
import { createDecimalDiagnosticResult } from "@/lib/math/decimals/decimalDiagnostics";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalPowerTenL1.module.css";

const ACTIVITY_TITLES: Record<DecimalPowerTenL1Activity, string> = {
  "power10-position-shift": "Mnożenie przez 10, 100 i 1000",
  "power10-predict": "·10, ·100, ·1000",
  "power10-missing-zero": "Zera tworzą potrzebne miejsca",
  "power10-microscope": "Skala mikroskopu",
  "power10-practice": "Ćwiczenia — 10 działań",
  "divide10-position-shift": "Dzielenie przez 10, 100 i 1000",
  "divide10-practice": "Ćwiczenia — 10 działań",
};

const POWERS = [3, 2, 1, 0, -1, -2, -3] as const;
const PLACE_LABELS: Record<number, string> = {
  3: "tysiące",
  2: "setki",
  1: "dziesiątki",
  0: "jedności",
  [-1]: "części dziesiąte",
  [-2]: "części setne",
  [-3]: "części tysięczne",
};

function resultDigitsByPower(display: string): Record<number, string> {
  const [integerPart, fractionPart = ""] = display.split(",");
  const result: Record<number, string> = {};
  [...integerPart].forEach((digit, index) => { result[integerPart.length - index - 1] = digit; });
  [...fractionPart].forEach((digit, index) => { result[-index - 1] = digit; });
  return result;
}

function DecimalCommaShiftExample() {
  const examples = [
    { multiplier: "10", product: "15,0", zeros: "jedno zero", places: "jedno miejsce" },
    { multiplier: "100", product: "150,0", zeros: "dwa zera", places: "dwa miejsca" },
    { multiplier: "1000", product: "1500,0", zeros: "trzy zera", places: "trzy miejsca" },
  ] as const;
  return (
    <section className="space-y-5 rounded-3xl border-2 border-cyan-300 bg-cyan-50 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-black text-cyan-950">Jak mnożymy przez 10, 100 i 1000?</h3>
        <p className="mt-2 text-lg font-bold text-cyan-950">Przesuwamy przecinek w prawo o tyle miejsc, ile zer ma mnożnik.</p>
      </div>
      <div className="space-y-5 rounded-2xl bg-white p-4 shadow-sm" aria-label="Trzy przykłady przesuwania przecinka przy mnożeniu przez potęgi 10">
        {examples.map((example) => <div key={example.multiplier} className="grid grid-cols-[auto_auto_auto_auto_auto] items-start justify-center gap-x-3 gap-y-1 font-mono text-3xl font-black text-slate-950 sm:text-4xl">
          <span>1,5</span><span>·</span><span>{example.multiplier}</span><span>=</span><span>{example.product}</span>
          <span className="text-center font-sans text-sm font-black leading-tight text-rose-600 sm:text-base">⌢<br />· {example.multiplier}</span>
          <span />
          <span className="text-center font-sans text-sm font-black leading-tight text-rose-600 sm:text-base">⌢</span>
          <span />
          <span className="text-center font-sans text-sm font-black leading-tight text-rose-600 sm:text-base">⌢<br />{example.zeros} = {example.places}<br />po przecinku w prawo</span>
        </div>)}
      </div>
      <p className="rounded-2xl bg-amber-100 p-4 text-center text-lg font-black text-amber-950">Wynik zapisujemy z przecinkiem, nawet gdy po nim jest zero.</p>
    </section>
  );
}

function DecimalCommaDivisionExample() {
  const examples = [
    { divisor: "10", quotient: "5,67", zeros: "jedno zero", places: "jedno miejsce" },
    { divisor: "100", quotient: "0,567", zeros: "dwa zera", places: "dwa miejsca" },
    { divisor: "1000", quotient: "0,0567", zeros: "trzy zera", places: "trzy miejsca" },
  ] as const;
  return (
    <section className="space-y-5 rounded-3xl border-2 border-cyan-300 bg-cyan-50 p-5">
      <div className="text-center">
        <h3 className="text-2xl font-black text-cyan-950">Jak dzielimy przez 10, 100 i 1000?</h3>
        <p className="mt-2 text-lg font-bold text-cyan-950">Przesuwamy przecinek w lewo o tyle miejsc, ile zer ma dzielnik.</p>
      </div>
      <div className="space-y-5 rounded-2xl bg-white p-4 shadow-sm" aria-label="Trzy przykłady przesuwania przecinka przy dzieleniu przez potęgi 10">
        {examples.map((example) => <div key={example.divisor} className="grid grid-cols-[auto_auto_auto_auto_auto] items-start justify-center gap-x-3 gap-y-1 font-mono text-3xl font-black text-slate-950 sm:text-4xl">
          <span>56,7</span><span>:</span><span>{example.divisor}</span><span>=</span><span>{example.quotient}</span>
          <span className="text-center font-sans text-sm font-black leading-tight text-rose-600 sm:text-base">⌢<br />: {example.divisor}</span>
          <span />
          <span className="text-center font-sans text-sm font-black leading-tight text-rose-600 sm:text-base">⌢</span>
          <span />
          <span className="text-center font-sans text-sm font-black leading-tight text-rose-600 sm:text-base">⌢<br />{example.zeros} = {example.places}<br />po przecinku w lewo</span>
        </div>)}
      </div>
      <p className="rounded-2xl bg-amber-100 p-4 text-center text-lg font-black text-amber-950">Gdy po przesunięciu brakuje cyfr po lewej stronie, dopisujemy zero.</p>
    </section>
  );
}

function PlaceValueMovement({ task, revealed }: { task: DecimalPowerTenPublicTask; revealed: boolean }) {
  const movements = decimalDigitMovements(task).filter((movement) => movement.digit !== "0");
  const sourceDigits = resultDigitsByPower(task.operand);
  const source = Object.fromEntries(movements.map((movement) => [movement.sourcePower, movement]));
  const expected = decimalPowerTenExpectedAnswer(task);
  const targetDigits = task.questionKind === "missing-factor" ? {} : resultDigitsByPower(expected);
  const targetMovements = Object.fromEntries(movements.map((movement) => [movement.targetPower, movement]));

  const renderRow = (kind: "source" | "target") => (
    <>
      {POWERS.map((power) => {
        const movement = kind === "source" ? source[power] : targetMovements[power];
        const targetDigit = kind === "target" ? targetDigits[power] : undefined;
        const digit = kind === "source" ? sourceDigits[power] : revealed ? targetDigit : undefined;
        const isRequiredZero = kind === "target" && revealed && digit === "0" && !movement;
        return (
          <div
            key={`${kind}-${power}`}
            className={`${styles.placeCell} ${kind === "source" ? styles.sourceCell : ""} ${kind === "target" && revealed ? styles.targetCell : ""} ${isRequiredZero ? styles.zeroCell : ""}`}
            data-place-power={power}
            data-row={kind}
            data-required-zero={isRequiredZero || undefined}
          >
            {digit ?? <span aria-hidden className="text-slate-300">·</span>}
            {movement ? <span className={styles.digitTag}>{kind === "source" ? "start" : `+${task.exponent} poz.`}</span> : null}
          </div>
        );
      }).reduce<React.ReactNode[]>((cells, cell, index) => {
        cells.push(cell);
        if (index === 3) cells.push(<div key={`${kind}-comma`} className={styles.commaGuide} aria-label="Stała prowadnica przecinka">,</div>);
        return cells;
      }, [])}
    </>
  );

  return (
    <section className="space-y-3" aria-label={`Tabela zmiany wartości pozycyjnej dla ${task.operand} razy ${task.multiplier}`}>
      <div className={styles.tableScroller}>
        <div className={styles.placeTable}>
          {POWERS.map((power) => <div key={`header-${power}`} className={styles.placeHeader}>{PLACE_LABELS[power]}</div>).reduce<React.ReactNode[]>((cells, cell, index) => {
            cells.push(cell);
            if (index === 3) cells.push(<div key="header-comma" className={styles.commaGuide} aria-label="Przecinek">,</div>);
            return cells;
          }, [])}
          {renderRow("source")}
          {renderRow("target")}
        </div>
      </div>
      <div className={styles.movementStrip} aria-live="polite">
        {revealed ? movements.map((movement) => (
          <p key={movement.id} className={styles.movementItem}>
            Cyfra {movement.digit}: {PLACE_LABELS[movement.sourcePower]} → {PLACE_LABELS[movement.targetPower]}
          </p>
        )) : <p className="col-span-full rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700">Najpierw przewidź, do której kolumny trafi każda cyfra.</p>}
      </div>
      <p className="rounded-xl border-2 border-teal-300 bg-teal-50 px-4 py-3 font-black text-teal-950">
        Przecinek nie wędruje. To cyfry zajmują pozycje o wartości {task.multiplier} razy większej.
      </p>
    </section>
  );
}

function MicroscopeScene({ task }: { task: DecimalPowerTenPublicTask }) {
  const scale = task.exponent === 1 ? 1 : task.exponent === 2 ? 1.7 : 2.35;
  return (
    <AccessibleMathSvg
      title="Obraz preparatu pod mikroskopem"
      description={`Obiekt długości ${task.operand} milimetra jest oglądany w powiększeniu ${task.multiplier} razy.`}
      viewBox="0 0 520 330"
      className={styles.microscopeSvg}
      columns={[{ key: "real", label: "Długość obiektu" }, { key: "scale", label: "Powiększenie" }]}
      rows={[{ real: `${task.operand} mm`, scale: `·${task.multiplier}` }]}
    >
      <path d="M74 275 H242" stroke="#1e293b" strokeWidth="22" strokeLinecap="round" />
      <path d="M118 262 C118 210 142 170 188 142" fill="none" stroke="#334155" strokeWidth="34" strokeLinecap="round" />
      <path d="M180 142 L250 70" stroke="#475569" strokeWidth="42" strokeLinecap="round" />
      <path d="M231 45 L286 99" stroke="#0f766e" strokeWidth="32" strokeLinecap="round" />
      <rect x="92" y="198" width="190" height="18" rx="9" fill="#94a3b8" />
      <circle cx="388" cy="150" r="104" fill="#ecfeff" stroke="#0891b2" strokeWidth="8" />
      <g className={styles.specimen} style={{ transform: `scale(${scale})` }}>
        <ellipse cx="388" cy="150" rx="26" ry="13" fill="#8b5cf6" stroke="#4c1d95" strokeWidth="4" />
        <path d="M365 150 Q388 124 411 150 Q388 176 365 150" fill="#c4b5fd" stroke="#4c1d95" strokeWidth="3" />
      </g>
      <text x="388" y="285" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">obraz ·{task.multiplier}</text>
    </AccessibleMathSvg>
  );
}

export interface DecimalPowerTenL1LabProps {
  activity: DecimalPowerTenL1Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalPowerTenL1Lab({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalPowerTenL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const generatedTask = useMemo(
    () => createPublicDecimalPowerTenTask({ seed: effectiveSeed, difficulty, activity }),
    [activity, difficulty, effectiveSeed],
  );
  const [selectedExponent, setSelectedExponent] = useState<1 | 2 | 3>(generatedTask.exponent);
  const task = activity === "power10-predict" || activity === "power10-microscope"
    ? {
        ...generatedTask,
        exponent: selectedExponent,
        multiplier: selectedExponent === 1 ? 10 as const : selectedExponent === 2 ? 100 as const : 1000 as const,
        prompt: activity === "power10-microscope"
          ? `Obiekt ma ${generatedTask.operand} mm. Obraz w mikroskopie jest ${selectedExponent === 1 ? 10 : selectedExponent === 2 ? 100 : 1000} razy większy. Oblicz długość obrazu.`
          : generatedTask.prompt,
      }
    : generatedTask;
  const [revealed, setRevealed] = useState(readOnly);
  const [answer, setAnswer] = useState(readOnly ? decimalPowerTenExpectedAnswer(task) : "");
  const [unit, setUnit] = useState("");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    memberIds: diagnosticCode === "DEC_UNIT_MISMATCH" ? ["power10-unit"] : ["power10-target-place"],
  }) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const chooseExponent = (exponent: 1 | 2 | 3) => {
    setSelectedExponent(exponent);
    setRevealed(false);
    setAnswer("");
    clearResult();
  };

  const checkAnswer = () => {
    const result = validateDecimalPowerTenAnswer({ task, answer, unit });
    if (!result.correct) {
      setDiagnosticCode(result.code);
      setSuccessMessage(null);
      setRevealed(false);
      onResultChange?.(false, result.answerLabel);
      return;
    }
    setDiagnosticCode(null);
    setRevealed(true);
    const operationSign = task.operation === "divide" ? ":" : "·";
    const message = task.questionKind === "missing-factor"
      ? `Czynnik ${task.multiplier} zmienia wartość każdej cyfry ${task.multiplier} razy.`
      : `${task.operand} ${operationSign} ${task.multiplier} = ${decimalPowerTenExpectedAnswer(task)}${task.requiredUnit ? ` ${task.requiredUnit}` : activity === "power10-microscope" ? " mm" : ""}. ${task.operation === "divide" ? "Przecinek przesunął się w lewo." : "Cyfry zajęły pozycje o większej wartości."}`;
    setSuccessMessage(message);
    onResultChange?.(true, result.answerLabel);
  };

  const showMovement = () => {
    setRevealed(true);
    const operationSign = task.operation === "divide" ? ":" : "·";
    setSuccessMessage(`${task.operand} ${operationSign} ${task.multiplier} = ${decimalPowerTenExpectedAnswer(task)}. ${task.operation === "divide" ? "Przecinek przesunął się w lewo." : "Przecinek został w prowadnicy, a cyfry zmieniły kolumny."}`);
  };

  const showPlaceTable = task.questionKind !== "missing-factor";
  const equation = task.questionKind === "missing-factor"
    ? `${task.operand} · □ = ${task.shownProduct}`
    : task.questionKind === "unit-conversion"
      ? `${task.operand} ${task.sourceUnit}`
      : `${task.operand}${activity === "power10-microscope" ? " mm" : ""} ${task.operation === "divide" ? ":" : "·"} ${task.multiplier}`;

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName="space-y-5"
      eyebrow="Dział 5 · Temat 5"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-decimal-power-ten-l1
      data-decimal-activity={activity}
      data-generator-id={task.generatorId}
      data-seed={effectiveSeed}
      data-presentation-mode={presentationMode || undefined}
      data-answer-spec="server-only"
    >
      {activity === "power10-position-shift" ? <DecimalCommaShiftExample /> : activity === "divide10-position-shift" ? <DecimalCommaDivisionExample /> : (
        <>
          <p className="rounded-2xl bg-slate-950 p-4 text-center text-3xl font-black text-white" aria-live="polite">
            {task.operand} {task.operation === "divide" ? ":" : "·"} {task.multiplier} =
          </p>
          <section className={`${styles.controls} space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4`}>
            <DecimalDigitInput
              value={readOnly ? decimalPowerTenExpectedAnswer(task) : answer}
              onChange={(value) => { setAnswer(value); setRevealed(false); clearResult(); }}
              onSubmit={checkAnswer}
              label="Wynik"
              readOnly={readOnly}
              showKeypad
            />
            {!readOnly ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkAnswer}>
              Zatwierdź
            </button> : null}
          </section>
        </>
      )}

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
