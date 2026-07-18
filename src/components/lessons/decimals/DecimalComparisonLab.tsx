"use client";

import { useMemo, useState } from "react";
import { DecimalNumberLine } from "@/components/lessons/decimals/DecimalNumberLine";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  alignedDecimalColumns,
  compareDecimalStrings,
  comparisonSign,
  createPublicDecimalComparisonTask,
  firstDifferentDecimalPlace,
  validateComparisonSign,
  validateDecimalOrder,
  type DecimalComparisonActivity,
  type DecimalComparisonPlace,
  type DecimalComparisonRobot,
  type DecimalComparisonSign,
} from "@/lib/math/decimals/decimalComparisonL1";
import { createDecimalDiagnosticResult } from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalNotationL1.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Start",
  core: "Dalej",
  challenge: "Mistrzowskie",
};

const ACTIVITY_TITLES: Record<DecimalComparisonActivity, string> = {
  "pair-comparison": "Porównaj ułamki dziesiętne",
  "ascending-order": "Od najmniejszego do największego",
  "open-inequality": "Wpisz liczbę spełniającą nierówność",
  "align-places": "Wyrównaj miejsca",
  "compare-left": "Porównuj od lewej",
  "shared-axis": "Ta sama oś",
  "digit-traps": "Pułapka liczby cyfr",
  "robot-ranking": "Ranking skoków robotów",
};

const PLACE_LABELS: Record<DecimalComparisonPlace, string> = {
  ones: "jedności",
  tenths: "części dziesiąte",
  hundredths: "części setne",
  thousandths: "części tysięczne",
};

const AXIS_LEVELS = [
  { label: "Widok szeroki", minimum: "1", maximum: "1,3", subdivisions: 10 as const },
  { label: "Powiększenie setnych", minimum: "1,17", maximum: "1,21", subdivisions: 100 as const },
  { label: "Powiększenie tysięcznych", minimum: "1,175", maximum: "1,210", subdivisions: 100 as const },
] as const;

const AXIS_ORDER_OPTIONS = [
  { id: "correct", label: "1,18 < 1,2 < 1,205" },
  { id: "digits", label: "1,2 < 1,18 < 1,205" },
  { id: "reverse", label: "1,205 < 1,2 < 1,18" },
] as const;

const SIGN_NAMES: Record<DecimalComparisonSign, string> = {
  "<": "mniejszości",
  "=": "równości",
  ">": "większości",
};

function SignSelector({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: DecimalComparisonSign | "";
  onChange: (sign: DecimalComparisonSign) => void;
  readOnly: boolean;
}) {
  return (
    <div className={`${styles.controls} flex flex-wrap justify-center gap-2`} role="group" aria-label={`Wybierz znak dla ${label}`}>
      {(["<", "=", ">"] as const).map((sign) => (
        <button
          key={sign}
          type="button"
          disabled={readOnly}
          aria-pressed={value === sign}
          aria-label={`${label}: znak ${SIGN_NAMES[sign]}`}
          className={`${styles.touchTarget} ${styles.signButton}`}
          onClick={() => onChange(sign)}
        >{sign}</button>
      ))}
    </div>
  );
}

function AlignedComparisonTable({
  left,
  right,
  minimumScale = 3,
  revealedCount,
  auxiliaryLeftZero = false,
}: {
  left: string;
  right: string;
  minimumScale?: number;
  revealedCount?: number;
  auxiliaryLeftZero?: boolean;
}) {
  const aligned = alignedDecimalColumns(left, right, minimumScale);
  const firstDifferent = firstDifferentDecimalPlace(left, right);
  const revealLimit = revealedCount ?? aligned.columns.length;
  return (
    <div className={styles.comparisonTableWrap}>
      <table className={styles.comparisonTable}>
        <caption className="sr-only">Liczby wyrównane według wartości pozycyjnych; porównujemy kolumny od lewej.</caption>
        <thead>
          <tr>
            <th scope="col">Liczba</th>
            {aligned.columns.map((column) => <th key={column.id} scope="col">{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {(["left", "right"] as const).map((side) => (
            <tr key={side}>
              <th scope="row">{side === "left" ? left : right}</th>
              {aligned.columns.map((column, index) => {
                const isRevealed = index < revealLimit;
                const isAuxiliary = side === "left" && column.id === "hundredths" && left === "0,5";
                const shouldMaskAuxiliary = isAuxiliary && !auxiliaryLeftZero;
                const isFirstDifferent = isRevealed && column.id === firstDifferent;
                const digit = side === "left" ? column.leftDigit : column.rightDigit;
                return (
                  <td
                    key={column.id}
                    className={`${styles.compareCell} ${isFirstDifferent ? styles.firstDifference : ""}`}
                    data-comparison-column={column.id}
                    data-first-difference={isFirstDifferent || undefined}
                    data-auxiliary-zero={isAuxiliary && auxiliaryLeftZero || undefined}
                  >
                    {isRevealed && !shouldMaskAuxiliary ? digit : <span aria-label="ukryta albo pusta pozycja">□</span>}
                    {isAuxiliary && auxiliaryLeftZero ? <small>0 pomocnicze</small> : null}
                    {isFirstDifferent ? <small>★ pierwsza różna para</small> : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RobotRanking({
  robots,
  order,
  onMove,
  readOnly,
}: {
  robots: DecimalComparisonRobot[];
  order: string[];
  onMove: (robotId: string, delta: -1 | 1) => void;
  readOnly: boolean;
}) {
  const byId = new Map(robots.map((robot) => [robot.id, robot] as const));
  return (
    <ol className="space-y-3" aria-label="Ranking robotów od najdłuższego skoku">
      {order.map((robotId, index) => {
        const robot = byId.get(robotId)!;
        return (
          <li key={robot.id} className={styles.robotRow} data-robot-id={robot.id}>
            <b className={styles.rankBadge}>{index + 1}</b>
            <span className="min-w-0 flex-1"><strong>{robot.name}</strong><span className="block font-mono text-lg font-black">{robot.distance} m</span></span>
            {!readOnly ? <div className={`${styles.controls} flex gap-2`}>
              <button type="button" disabled={index === 0} className={`${styles.touchTarget} rounded-xl border-2 bg-white px-3 font-black disabled:opacity-30`} aria-label={`Przesuń robota ${robot.name} wyżej`} onClick={() => onMove(robot.id, -1)}>↑</button>
              <button type="button" disabled={index === order.length - 1} className={`${styles.touchTarget} rounded-xl border-2 bg-white px-3 font-black disabled:opacity-30`} aria-label={`Przesuń robota ${robot.name} niżej`} onClick={() => onMove(robot.id, 1)}>↓</button>
            </div> : null}
          </li>
        );
      })}
    </ol>
  );
}

export interface DecimalComparisonLabProps {
  activity: DecimalComparisonActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalComparisonLab({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalComparisonLabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(() => createPublicDecimalComparisonTask({ seed: effectiveSeed, difficulty: activeDifficulty, activity }), [activeDifficulty, activity, effectiveSeed]);
  const [auxiliaryZero, setAuxiliaryZero] = useState(false);
  const [primarySign, setPrimarySign] = useState<DecimalComparisonSign | "">("");
  const [revealedCount, setRevealedCount] = useState(0);
  const [axisLevel, setAxisLevel] = useState(0);
  const [axisOrder, setAxisOrder] = useState("");
  const [trapSigns, setTrapSigns] = useState<[DecimalComparisonSign | "", DecimalComparisonSign | ""]>(["", ""]);
  const [robotOrder, setRobotOrder] = useState<string[]>(() => task.robots.map((robot) => robot.id));
  const [reasonPlace, setReasonPlace] = useState<DecimalComparisonPlace | "">("");
  const [explanation, setExplanation] = useState("");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const displayedAxisLevel = readOnly ? 2 : axisLevel;
  const displayedAxisOrder = readOnly ? "correct" : axisOrder;
  const axisConfig = AXIS_LEVELS[displayedAxisLevel]!;
  const alignedPair = alignedDecimalColumns(task.pair.left, task.pair.right, 3);
  const firstDifference = firstDifferentDecimalPlace(task.pair.left, task.pair.right);
  const firstDifferenceIndex = alignedPair.columns.findIndex((column) => column.id === firstDifference);
  const sortedRobots = [...task.robots].sort((left, right) => -compareDecimalStrings(left.distance, right.distance));
  const expectedReasonPlace = sortedRobots.length >= 2 ? firstDifferentDecimalPlace(sortedRobots[0]!.distance, sortedRobots[1]!.distance) : null;
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    maxScore: activity === "robot-ranking" ? 3 : activity === "digit-traps" ? 2 : 1,
    partial: activity === "robot-ranking" || activity === "digit-traps",
  }) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };
  const resetWork = (nextDifficulty = activeDifficulty) => {
    const nextTask = createPublicDecimalComparisonTask({ seed: effectiveSeed, difficulty: nextDifficulty, activity });
    setAuxiliaryZero(false);
    setPrimarySign("");
    setRevealedCount(0);
    setAxisLevel(0);
    setAxisOrder("");
    setTrapSigns(["", ""]);
    setRobotOrder(nextTask.robots.map((robot) => robot.id));
    setReasonPlace("");
    setExplanation("");
    clearResult();
  };
  const chooseDifficulty = (next: LessonDifficulty) => {
    setActiveDifficulty(next);
    resetWork(next);
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
  const chooseSign = (sign: DecimalComparisonSign) => {
    setPrimarySign(sign);
    clearResult();
  };
  const moveRobot = (robotId: string, delta: -1 | 1) => {
    setRobotOrder((current) => {
      const index = current.indexOf(robotId);
      const nextIndex = Math.max(0, Math.min(current.length - 1, index + delta));
      if (index === nextIndex) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex]!, next[index]!];
      return next;
    });
    clearResult();
  };

  const checkActivity = () => {
    if (activity === "align-places") {
      if (!auxiliaryZero) return fail(DECIMAL_FEEDBACK_CODES.missingZero, "brak zera pomocniczego");
      if (!primarySign) return fail(DECIMAL_FEEDBACK_CODES.empty, "brak znaku porównania");
      if (!validateComparisonSign("0,5", "0,50", primarySign)) return fail(DECIMAL_FEEDBACK_CODES.trailingZeroValue, `0,5 ${primarySign} 0,50`);
      return succeed("Zero końcowe wyrównuje zapis, ale 0,5 i 0,50 nadal oznaczają ten sam punkt.", "0,5 = 0,50");
    }
    if (activity === "compare-left") {
      if (firstDifferenceIndex >= 0 && revealedCount <= firstDifferenceIndex) return fail(DECIMAL_FEEDBACK_CODES.empty, "nieodsłonięta pierwsza różna para");
      if (!primarySign) return fail(DECIMAL_FEEDBACK_CODES.empty, "brak znaku porównania");
      if (!validateComparisonSign(task.pair.left, task.pair.right, primarySign)) return fail(DECIMAL_FEEDBACK_CODES.placeValue, `${task.pair.left} ${primarySign} ${task.pair.right}`);
      return succeed(`Pierwsza różnica jest w kolumnie: ${firstDifference ? PLACE_LABELS[firstDifference] : "brak — liczby są równe"}.`, `${task.pair.left} ${primarySign} ${task.pair.right}`);
    }
    if (activity === "shared-axis") {
      if (axisLevel !== 2) return fail(DECIMAL_FEEDBACK_CODES.empty, "oś niepowiększona do tysięcznych");
      if (!axisOrder) return fail(DECIMAL_FEEDBACK_CODES.empty, "brak kolejności z osi");
      if (axisOrder !== "correct") return fail(DECIMAL_FEEDBACK_CODES.placeValue, AXIS_ORDER_OPTIONS.find((option) => option.id === axisOrder)?.label ?? axisOrder);
      return succeed("Wspólna oś pokazuje kolejność 1,18 < 1,2 < 1,205.", "1,18 < 1,2 < 1,205");
    }
    if (activity === "digit-traps") {
      if (!trapSigns[0] || !trapSigns[1]) return fail(DECIMAL_FEEDBACK_CODES.empty, "niepełne dwa porównania");
      if (!validateComparisonSign("0,9", "0,899", trapSigns[0]) || !validateComparisonSign("3,04", "3,4", trapSigns[1])) {
        return fail(DECIMAL_FEEDBACK_CODES.placeValue, `0,9 ${trapSigns[0]} 0,899; 3,04 ${trapSigns[1]} 3,4`);
      }
      return succeed("Liczba cyfr nie rozstrzyga: 0,9 > 0,899, a 3,04 < 3,4.", "0,9 > 0,899; 3,04 < 3,4");
    }
    const orderIsCorrect = validateDecimalOrder(task.robots.map((robot) => ({ id: robot.id, value: robot.distance })), robotOrder, "descending");
    if (!orderIsCorrect) return fail(DECIMAL_FEEDBACK_CODES.placeValue, robotOrder.join(" → "));
    if (!reasonPlace) return fail(DECIMAL_FEEDBACK_CODES.empty, "brak wskazanej pierwszej różnej pozycji");
    if (reasonPlace !== expectedReasonPlace) return fail(DECIMAL_FEEDBACK_CODES.placeValue, PLACE_LABELS[reasonPlace]);
    if (explanation.trim().length < 10) return fail(DECIMAL_FEEDBACK_CODES.empty, explanation || "brak uzasadnienia");
    return succeed("Ranking jest malejący, a uzasadnienie wskazuje pierwszą różną pozycję.", robotOrder.join(" → "));
  };

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName="space-y-4"
      eyebrow="Dział 5 · Temat 2"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-decimal-comparison-l1
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
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => <button key={level} type="button" aria-pressed={activeDifficulty === level} onClick={() => chooseDifficulty(level)} className={`${styles.touchTarget} rounded-xl border-2 px-4 text-sm font-black ${activeDifficulty === level ? "border-amber-700 bg-amber-700 text-white" : "border-amber-200 bg-white text-amber-950"}`}>{DIFFICULTY_LABELS[level]}</button>)}
        </div>
      ) : <p className="w-fit rounded-xl bg-amber-100 px-3 py-2 text-sm font-black text-amber-950">Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p>}

      {activity === "align-places" ? (
        <section className="space-y-4">
          <AlignedComparisonTable left="0,5" right="0,50" minimumScale={2} auxiliaryLeftZero={readOnly || auxiliaryZero} />
          {!readOnly ? <button type="button" aria-pressed={auxiliaryZero} className={`${styles.controls} ${styles.touchTarget} w-full rounded-xl border-2 border-indigo-300 bg-white px-4 font-black`} onClick={() => { setAuxiliaryZero((value) => !value); clearResult(); }}>{auxiliaryZero ? "Usuń zero pomocnicze" : "Dodaj zero pomocnicze do 0,5"}</button> : null}
          <p className="rounded-xl bg-indigo-50 p-3 font-bold" aria-live="polite">{readOnly || auxiliaryZero ? "0,5 → 0,50: zapis ma teraz tyle samo miejsc; wartość się nie zmieniła." : "Setne w zapisie 0,5 pozostają puste. Dodaj zero pomocnicze, aby wyrównać miejsca."}</p>
          <SignSelector label="0,5 i 0,50" value={readOnly ? "=" : primarySign} onChange={chooseSign} readOnly={readOnly} />
        </section>
      ) : null}

      {activity === "compare-left" ? (
        <section className="space-y-4">
          <AlignedComparisonTable left={task.pair.left} right={task.pair.right} revealedCount={readOnly ? alignedPair.columns.length : revealedCount} />
          {!readOnly ? <div className={`${styles.controls} flex flex-wrap gap-2`}>
            <button type="button" disabled={revealedCount === 0} className={`${styles.touchTarget} rounded-xl border-2 bg-white px-4 font-black disabled:opacity-30`} onClick={() => { setRevealedCount((value) => Math.max(0, value - 1)); clearResult(); }}>Cofnij kolumnę</button>
            <button type="button" disabled={revealedCount === alignedPair.columns.length} className={`${styles.touchTarget} rounded-xl bg-indigo-700 px-4 font-black text-white disabled:opacity-30`} onClick={() => { setRevealedCount((value) => Math.min(alignedPair.columns.length, value + 1)); clearResult(); }}>Odsłoń następną kolumnę</button>
          </div> : null}
          <p className="rounded-xl bg-slate-100 p-3 font-bold" aria-live="polite">Odsłonięto {readOnly ? alignedPair.columns.length : revealedCount} z {alignedPair.columns.length} kolumn. Porównywanie kończy pierwsza różna para, nie liczba cyfr.</p>
          <SignSelector label={`${task.pair.left} i ${task.pair.right}`} value={readOnly ? comparisonSign(task.pair.left, task.pair.right) : primarySign} onChange={chooseSign} readOnly={readOnly} />
        </section>
      ) : null}

      {activity === "shared-axis" ? (
        <section className="space-y-4">
          <div className={`${styles.controls} flex flex-wrap gap-2`} role="group" aria-label="Powiększenie wspólnej osi">
            {AXIS_LEVELS.map((level, index) => <button key={level.label} type="button" disabled={readOnly} aria-pressed={displayedAxisLevel === index} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black aria-pressed:border-indigo-700 aria-pressed:bg-indigo-700 aria-pressed:text-white`} onClick={() => { setAxisLevel(index); clearResult(); }}>{level.label}</button>)}
            <button type="button" disabled={readOnly || axisLevel === 2} className={`${styles.touchTarget} rounded-xl bg-amber-700 px-4 font-black text-white disabled:opacity-30`} onClick={() => { setAxisLevel((value) => Math.min(2, value + 1)); clearResult(); }}>Powiększ oś</button>
          </div>
          <DecimalNumberLine minimum={axisConfig.minimum} maximum={axisConfig.maximum} subdivisions={axisConfig.subdivisions} title={`${axisConfig.label}: 1,2, 1,18 i 1,205`} points={[
            { id: "one-two", value: "1,2", label: "1,2", symbol: "A" },
            { id: "one-eighteen", value: "1,18", label: "1,18", symbol: "B" },
            { id: "one-two-zero-five", value: "1,205", label: "1,205", symbol: "C" },
          ]} />
          <div className="grid gap-2" role="group" aria-label="Wybierz kolejność rosnącą z osi">
            {AXIS_ORDER_OPTIONS.map((option) => <button key={option.id} type="button" disabled={readOnly} aria-pressed={displayedAxisOrder === option.id} className={`${styles.touchTarget} rounded-xl border-2 bg-white px-4 py-2 text-left font-mono font-black aria-pressed:border-violet-700 aria-pressed:bg-violet-50`} onClick={() => { setAxisOrder(option.id); clearResult(); }}>{option.label}</button>)}
          </div>
        </section>
      ) : null}

      {activity === "digit-traps" ? (
        <section className={styles.trapGrid}>
          {([
            { left: "0,9", right: "0,899", index: 0 as const },
            { left: "3,04", right: "3,4", index: 1 as const },
          ]).map((trap) => (
            <div key={trap.left} className="space-y-3 rounded-2xl border-2 border-amber-100 bg-white p-4">
              <h3 className="text-center text-xl font-black">{trap.left} ○ {trap.right}</h3>
              <AlignedComparisonTable left={trap.left} right={trap.right} />
              <SignSelector label={`${trap.left} i ${trap.right}`} value={readOnly ? comparisonSign(trap.left, trap.right) : trapSigns[trap.index]} readOnly={readOnly} onChange={(sign) => { setTrapSigns((current) => current.map((value, index) => index === trap.index ? sign : value) as [DecimalComparisonSign | "", DecimalComparisonSign | ""]); clearResult(); }} />
            </div>
          ))}
        </section>
      ) : null}

      {activity === "robot-ranking" ? (
        <section className="space-y-5">
          <p className="rounded-2xl bg-slate-950 p-4 text-center text-lg font-black text-white">Najdłuższy skok ma być na miejscu 1.</p>
          <RobotRanking robots={task.robots} order={robotOrder} onMove={moveRobot} readOnly={readOnly} />
          <p className="rounded-xl bg-indigo-50 p-3 font-bold" aria-live="polite">
            Aktualny ranking: {robotOrder.map((id) => {
              const robot = task.robots.find((candidate) => candidate.id === id)!;
              return `${robot.name} ${robot.distance} m`;
            }).join(" → ")}.
          </p>
          {!readOnly ? <div className="space-y-4 rounded-2xl border-2 border-indigo-100 bg-white p-4">
            <fieldset>
              <legend className="mb-2 font-black">W której kolumnie po raz pierwszy różnią się dwa najlepsze wyniki?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["ones", "tenths", "hundredths", "thousandths"] as const).map((place) => <label key={place} className={`${styles.touchTarget} flex items-center gap-2 rounded-xl border-2 p-3 font-bold`}><input type="radio" name="reason-place" value={place} checked={reasonPlace === place} onChange={() => { setReasonPlace(place); clearResult(); }} />{PLACE_LABELS[place]}</label>)}
              </div>
            </fieldset>
            <label className="block font-black">Uzasadnij własnymi słowami
              <textarea value={explanation} className={styles.reasonField} aria-label="Uzasadnienie rankingu robotów" onChange={(event) => { setExplanation(event.target.value); clearResult(); }} placeholder="Porównuję od lewej i zatrzymuję się przy…" />
            </label>
          </div> : null}
        </section>
      ) : null}

      {!readOnly ? <button type="button" className={`${styles.controls} ${styles.touchTarget} w-full rounded-xl bg-slate-950 px-5 text-lg font-black text-white`} onClick={checkActivity}>Sprawdź porównanie</button> : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnostic ? (
        onResultChange
          ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
          : <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
