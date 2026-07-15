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
  "power10-position-shift": "Cyfry zmieniają wartość",
  "power10-predict": "×10, ×100, ×1000",
  "power10-missing-zero": "Zera tworzą potrzebne miejsca",
  "power10-microscope": "Skala mikroskopu",
  "power10-practice": "Ćwiczenia — 5 przykładów",
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
      rows={[{ real: `${task.operand} mm`, scale: `×${task.multiplier}` }]}
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
      <text x="388" y="285" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">obraz ×{task.multiplier}</text>
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
    const message = task.questionKind === "missing-factor"
      ? `Czynnik ${task.multiplier} zmienia wartość każdej cyfry ${task.multiplier} razy.`
      : `${task.operand} × ${task.multiplier} = ${decimalPowerTenExpectedAnswer(task)}${task.requiredUnit ? ` ${task.requiredUnit}` : activity === "power10-microscope" ? " mm" : ""}. Cyfry zajęły pozycje o większej wartości.`;
    setSuccessMessage(message);
    onResultChange?.(true, result.answerLabel);
  };

  const showMovement = () => {
    setRevealed(true);
    setSuccessMessage(`${task.operand} × ${task.multiplier} = ${decimalPowerTenExpectedAnswer(task)}. Przecinek został w prowadnicy, a cyfry zmieniły kolumny.`);
  };

  const showPlaceTable = task.questionKind !== "missing-factor";
  const equation = task.questionKind === "missing-factor"
    ? `${task.operand} × □ = ${task.shownProduct}`
    : task.questionKind === "unit-conversion"
      ? `${task.operand} ${task.sourceUnit}`
      : `${task.operand}${activity === "power10-microscope" ? " mm" : ""} × ${task.multiplier}`;

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
      {(activity === "power10-predict" || activity === "power10-microscope") && !readOnly ? (
        <div className={`${styles.controls} flex flex-wrap gap-2`} role="group" aria-label="Wybierz powiększenie">
          {([1, 2, 3] as const).map((exponent) => (
            <button
              key={exponent}
              type="button"
              aria-pressed={selectedExponent === exponent}
              className={`rounded-xl border-2 px-5 font-black ${selectedExponent === exponent ? "border-violet-700 bg-violet-700 text-white" : "border-violet-200 bg-white text-violet-950"}`}
              onClick={() => chooseExponent(exponent)}
            >
              ×{exponent === 1 ? 10 : exponent === 2 ? 100 : 1000}
            </button>
          ))}
        </div>
      ) : null}

      <p className="rounded-2xl bg-slate-950 p-4 text-center text-2xl font-black text-white" aria-live="polite">
        {task.questionKind === "missing-factor"
          ? equation
          : task.questionKind === "unit-conversion"
            ? `${equation} ${revealed ? `= ${decimalPowerTenExpectedAnswer(task)} ${task.requiredUnit}` : `= ? ${task.requiredUnit}`}`
            : `${equation} ${revealed ? `= ${decimalPowerTenExpectedAnswer(task)}${activity === "power10-microscope" ? " mm" : ""}` : "= ?"}`}
      </p>

      {activity === "power10-microscope" ? <div className={styles.microscopeScene}><MicroscopeScene task={task} /><PlaceValueMovement task={task} revealed={revealed} /></div> : showPlaceTable ? <PlaceValueMovement task={task} revealed={revealed} /> : (
        <section className="rounded-2xl border-2 border-violet-200 bg-white p-5 text-center">
          <p className="text-lg font-black text-violet-950">Ile razy większa jest wartość 34 od 0,34?</p>
          <div className="mt-4 flex items-center justify-center gap-3 text-3xl font-black"><span>0,34</span><span aria-hidden>→</span><span>34</span></div>
          <p className="mt-3 font-bold text-slate-700">Cyfra 3 przechodzi z części dziesiątych do dziesiątek: o dwie pozycje.</p>
        </section>
      )}

      {!readOnly && activity === "power10-position-shift" ? (
        <button type="button" className={`${styles.controls} w-full rounded-xl bg-teal-700 px-5 py-3 text-lg font-black text-white`} onClick={showMovement}>
          Pokaż zmianę wartości cyfr
        </button>
      ) : null}

      {!readOnly && activity !== "power10-position-shift" ? (
        <section className={`${styles.controls} space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4`}>
          <DecimalDigitInput
            value={answer}
            onChange={(value) => { setAnswer(value); setRevealed(false); clearResult(); }}
            onSubmit={checkAnswer}
            label={task.questionKind === "missing-factor" ? "Brakujący czynnik" : "Twój wynik"}
            showKeypad
          />
          {task.requiredUnit ? (
            <label className="block max-w-sm font-black" data-diagnostic-member="power10-unit">
              <span className="mb-2 block">Jednostka wyniku</span>
              <select value={unit} onChange={(event) => { setUnit(event.target.value); setRevealed(false); clearResult(); }} className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4" aria-label="Jednostka wyniku">
                <option value="">Wybierz jednostkę</option>
                <option value="m">m</option>
                <option value="mm">mm</option>
              </select>
            </label>
          ) : null}
          <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkAnswer}>
            Sprawdź wartość cyfr
          </button>
        </section>
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
