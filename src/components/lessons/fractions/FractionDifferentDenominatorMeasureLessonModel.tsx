"use client";

import { useMemo, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { FractionGlassModel } from "@/components/lessons/fractions/FractionGlassModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  createFractionDifferentDenominatorMeasureDiagnosticResult,
  createPublicFractionDifferentDenominatorMeasureTask,
  evaluateDifferentDenominatorMeasureAttempt,
  leastCommonDenominator,
  type FractionDifferentDenominatorMeasureActivity,
  type FractionDifferentDenominatorMeasureDiagnosticCode,
  type FractionDifferentDenominatorMeasurePublicTask,
} from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import { parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionStackValue, FractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionDifferentDenominatorMeasureLesson.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Start",
  core: "Dalej",
  challenge: "Mistrzowskie",
};

const ACTIVITY_TITLES: Record<FractionDifferentDenominatorMeasureActivity, string> = {
  "different-denom-glasses-discover": "Szklanki z wodą — różne podziałki",
  "different-denom-glasses-twelfths": "Zmień podziałkę na dwunaste",
  "different-denom-glasses-pour": "Przelej do naczynia wynikowego",
  "different-denom-algorithm": "Algorytm w osobnych wierszach",
  "different-denom-independent": "Samodzielna próba",
};

function blankStack(): FractionStackValue {
  return { numerator: [""], denominator: [""] };
}

function fractionText(value: FractionValue): string {
  return `${value.numerator}/${value.denominator}`;
}

function VerticalFraction({
  value,
  label,
  memberPrefix,
}: {
  value: FractionValue;
  label: string;
  memberPrefix: string;
}) {
  return (
    <span className={styles.verticalFraction} aria-label={`${label}: ${fractionText(value)}`}>
      <span data-member-id={`${memberPrefix}-numerator`}>{value.numerator}</span>
      <span className={styles.fractionBar} aria-hidden />
      <span data-member-id={`${memberPrefix}-denominator`}>{value.denominator}</span>
    </span>
  );
}

interface MultiplierPair {
  numerator: number;
  denominator: number;
}

type StepState = "pending" | "active" | "attention" | "complete";

function factorStepState(pair: MultiplierPair, expected: number): StepState {
  if (pair.numerator === 1 && pair.denominator === 1) return "pending";
  if (pair.numerator !== pair.denominator) return "attention";
  return pair.numerator === expected ? "complete" : "attention";
}

function MultiplierInput({
  label,
  value,
  onChange,
  readOnly,
  memberId,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  readOnly: boolean;
  memberId: string;
}) {
  return (
    <label className={styles.multiplierLabel}>
      <span>{label}</span>
      <span aria-hidden>×</span>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={30}
        value={value}
        readOnly={readOnly}
        data-member-id={memberId}
        onChange={(event) => onChange(Math.max(0, Math.min(30, Number(event.target.value))))}
      />
    </label>
  );
}

function ExtensionRow({
  rowNumber,
  source,
  pair,
  expected,
  label,
  readOnly,
  onChange,
}: {
  rowNumber: number;
  source: FractionValue;
  pair: MultiplierPair;
  expected: number;
  label: string;
  readOnly: boolean;
  onChange: (value: MultiplierPair) => void;
}) {
  const expanded = {
    numerator: source.numerator * pair.numerator,
    denominator: source.denominator * pair.denominator,
  };
  const state = factorStepState(pair, expected);
  return (
    <section className={styles.algorithmRow} data-step-state={state} data-member-id={`${label}-extension`}>
      <b className={styles.rowNumber}>{rowNumber}</b>
      <div className={styles.rowBody}>
        <h4>Rozszerz {label === "left" ? "pierwszy" : "drugi"} ułamek</h4>
        <div className={styles.extensionEquation}>
          <VerticalFraction value={source} label="Ułamek przed rozszerzeniem" memberPrefix={`${label}-source`} />
          <span aria-hidden>=</span>
          <div className={styles.factorStack}>
            <MultiplierInput
              label="licznik"
              value={pair.numerator}
              onChange={(numerator) => onChange({ ...pair, numerator })}
              readOnly={readOnly}
              memberId={`${label}-numerator-multiplier`}
            />
            <span className={styles.factorDivider} aria-hidden />
            <MultiplierInput
              label="mianownik"
              value={pair.denominator}
              onChange={(denominator) => onChange({ ...pair, denominator })}
              readOnly={readOnly}
              memberId={`${label}-denominator-multiplier`}
            />
          </div>
          <span aria-hidden>=</span>
          <VerticalFraction value={expanded} label="Ułamek po rozszerzeniu" memberPrefix={`${label}-expanded`} />
        </div>
        <p className={styles.liveHint} aria-live="polite">
          {state === "pending"
            ? "Wpisz mnożnik nad i pod kreską."
            : state === "complete"
              ? `Ta sama liczba × ${expected} zachowała wartość ułamka.`
              : pair.numerator !== pair.denominator
                ? "Mnożniki w jednym ułamku muszą być identyczne."
                : "Ten mnożnik nie prowadzi do wybranej wspólnej miary."}
        </p>
      </div>
    </section>
  );
}

function OperationHeader({ task }: { task: FractionDifferentDenominatorMeasurePublicTask }) {
  return (
    <div className={styles.operationHeader} aria-label={`${fractionText(task.left)} ${task.operation} ${fractionText(task.right)}`}>
      <VerticalFraction value={task.left} label="Pierwszy ułamek" memberPrefix="operation-left" />
      <strong>{task.operation}</strong>
      <VerticalFraction value={task.right} label="Drugi ułamek" memberPrefix="operation-right" />
    </div>
  );
}

export interface FractionDifferentDenominatorMeasureLessonModelProps {
  activity: FractionDifferentDenominatorMeasureActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionDifferentDenominatorMeasureLessonModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: FractionDifferentDenominatorMeasureLessonModelProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(() => createPublicFractionDifferentDenominatorMeasureTask({
    seed: effectiveSeed,
    difficulty: activeDifficulty,
    activity,
  }), [activeDifficulty, activity, effectiveSeed]);
  const [discoveryAttempted, setDiscoveryAttempted] = useState(false);
  const [twelfths, setTwelfths] = useState(false);
  const [poured, setPoured] = useState(false);
  const [commonDenominator, setCommonDenominator] = useState<number | null>(null);
  const [leftFactors, setLeftFactors] = useState<MultiplierPair>({ numerator: 1, denominator: 1 });
  const [rightFactors, setRightFactors] = useState<MultiplierPair>({ numerator: 1, denominator: 1 });
  const [resultStack, setResultStack] = useState<FractionStackValue>(blankStack);
  const [diagnosticCode, setDiagnosticCode] = useState<FractionDifferentDenominatorMeasureDiagnosticCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const controlsLocked = readOnly || presentationMode && activity === "different-denom-independent";
  const leastCommon = leastCommonDenominator(task.left.denominator, task.right.denominator);
  const selectedCommonIsValid = commonDenominator !== null
    && commonDenominator % task.left.denominator === 0
    && commonDenominator % task.right.denominator === 0;
  const activeCommonDenominator = selectedCommonIsValid && commonDenominator !== null ? commonDenominator : leastCommon;
  const leftExpected = activeCommonDenominator / task.left.denominator;
  const rightExpected = activeCommonDenominator / task.right.denominator;
  const diagnostic = diagnosticCode
    ? createFractionDifferentDenominatorMeasureDiagnosticResult(diagnosticCode)
    : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const resetWork = () => {
    setDiscoveryAttempted(false);
    setTwelfths(false);
    setPoured(false);
    setCommonDenominator(null);
    setLeftFactors({ numerator: 1, denominator: 1 });
    setRightFactors({ numerator: 1, denominator: 1 });
    setResultStack(blankStack());
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const chooseDifficulty = (nextDifficulty: LessonDifficulty) => {
    setActiveDifficulty(nextDifficulty);
    resetWork();
  };

  const checkAttempt = () => {
    const parsed = parseFractionStackValue(resultStack);
    if (!parsed.ok) {
      const code = parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
        ? FRACTION_FEEDBACK_CODES.zeroDenominator
        : FRACTION_FEEDBACK_CODES.emptyPart;
      setDiagnosticCode(code);
      setSuccessMessage(null);
      onResultChange?.(false, `${resultStack.numerator.join("")}/${resultStack.denominator.join("")}`);
      return;
    }
    const code = evaluateDifferentDenominatorMeasureAttempt({
      task,
      attempt: {
        commonDenominator,
        leftNumeratorMultiplier: leftFactors.numerator,
        leftDenominatorMultiplier: leftFactors.denominator,
        rightNumeratorMultiplier: rightFactors.numerator,
        rightDenominatorMultiplier: rightFactors.denominator,
        submitted: parsed.value,
      },
    });
    if (code) {
      setDiagnosticCode(code);
      setSuccessMessage(null);
      onResultChange?.(false, `${fractionText(task.left)} ${task.operation} ${fractionText(task.right)} = ${fractionText(parsed.value)}`);
      return;
    }
    setDiagnosticCode(null);
    setSuccessMessage(`Wspólna miara ${commonDenominator}, poprawne rozszerzenia i wynik ${fractionText(parsed.value)}.`);
    onResultChange?.(true, `${fractionText(task.left)} ${task.operation} ${fractionText(task.right)} = ${fractionText(parsed.value)}`);
  };

  const originalGlasses = [
    { id: "thirds", label: "Pierwsza porcja", value: task.left, unit: "szklanki", accent: "cyan" as const },
    { id: "quarters", label: "Druga porcja", value: task.right, unit: "szklanki", accent: "violet" as const },
  ];
  const commonMeasureGlasses = [
    { id: "thirds", label: "Pierwsza porcja", value: { numerator: 4, denominator: 12 }, unit: "szklanki", accent: "cyan" as const },
    { id: "quarters", label: "Druga porcja", value: { numerator: 3, denominator: 12 }, unit: "szklanki", accent: "violet" as const },
  ];
  const pourGlasses = poured
    ? [
      { id: "thirds", label: "Pierwsza porcja", value: { numerator: 0, denominator: 12 }, unit: "szklanki", accent: "cyan" as const },
      { id: "quarters", label: "Druga porcja", value: { numerator: 0, denominator: 12 }, unit: "szklanki", accent: "violet" as const },
      { id: "result", label: "Razem", value: { numerator: 7, denominator: 12 }, unit: "szklanki", accent: "indigo" as const },
    ]
    : [
      ...commonMeasureGlasses,
      { id: "result", label: "Razem", value: { numerator: 0, denominator: 12 }, unit: "szklanki", accent: "indigo" as const },
    ];

  const renderAlgorithm = () => (
    <div className={styles.algorithm} data-diagnostic-code={diagnosticCode ?? undefined}>
      <OperationHeader task={task} />
      <section
        className={styles.algorithmRow}
        data-step-state={commonDenominator === null ? "pending" : selectedCommonIsValid ? "complete" : "attention"}
        data-member-id="common-denominator"
      >
        <b className={styles.rowNumber}>1</b>
        <div className={styles.rowBody}>
          <h4>Wybierz wspólny mianownik</h4>
          <div className={styles.choiceRow} role="group" aria-label="Wspólny mianownik">
            {task.commonDenominatorOptions.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={commonDenominator === option}
                disabled={controlsLocked}
                data-member-id={`common-denominator-${option}`}
                onClick={() => {
                  setCommonDenominator(option);
                  clearResult();
                }}
              >
                {option}
              </button>
            ))}
          </div>
          <p className={styles.liveHint} aria-live="polite">
            {commonDenominator === null
              ? "Wybierz liczbę podzielną przez oba mianowniki."
              : selectedCommonIsValid
                ? `${commonDenominator} jest wspólną miarą obu ułamków.`
                : `${commonDenominator} nie jest wielokrotnością obu mianowników.`}
          </p>
        </div>
      </section>
      <ExtensionRow
        rowNumber={2}
        source={task.left}
        pair={leftFactors}
        expected={leftExpected}
        label="left"
        readOnly={controlsLocked}
        onChange={(value) => {
          setLeftFactors(value);
          clearResult();
        }}
      />
      <ExtensionRow
        rowNumber={3}
        source={task.right}
        pair={rightFactors}
        expected={rightExpected}
        label="right"
        readOnly={controlsLocked}
        onChange={(value) => {
          setRightFactors(value);
          clearResult();
        }}
      />
      <section className={styles.algorithmRow} data-step-state={resultStack.numerator[0] || resultStack.denominator[0] ? "active" : "pending"} data-member-id="different-denom-operation">
        <b className={styles.rowNumber}>4</b>
        <div className={styles.rowBody}>
          <h4>{task.operation === "+" ? "Dodaj" : "Odejmij"} liczniki, zachowaj wspólny mianownik i skróć, jeśli można</h4>
          <FractionStackInput
            value={resultStack}
            onChange={(value) => {
              setResultStack(value);
              clearResult();
            }}
            readOnly={controlsLocked}
            diagnosticCode={diagnosticCode === FRACTION_FEEDBACK_CODES.emptyPart || diagnosticCode === FRACTION_FEEDBACK_CODES.zeroDenominator ? diagnosticCode : undefined}
            diagnosticMemberIds={["result-numerator", "result-denominator"]}
            stepLabel="Zapisz końcowy wynik"
            ariaLabel="Końcowy wynik działania w pionowych kratkach"
            onSubmit={() => checkAttempt()}
          />
          {!controlsLocked ? (
            <button type="button" className={styles.checkButton} onClick={checkAttempt}>
              Sprawdź wszystkie cztery wiersze
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );

  return (
    <article
      className={styles.lesson}
      data-fraction-different-denominator-measure
      data-fraction-activity={activity}
      data-generator-id={task.generatorId}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-orientation-contract="portrait-landscape"
    >
      <header className={styles.header}>
        <div>
          <p>Dział 3 · Ułamki zwykłe · L1</p>
          <h2>{ACTIVITY_TITLES[activity]}</h2>
          <div className={styles.prompt}>{task.prompt}</div>
        </div>
        {questionNumber && questionCount ? <b className={styles.questionCounter}>Zadanie {questionNumber}/{questionCount}</b> : null}
      </header>

      {activity === "different-denom-independent" && !onResultChange && !readOnly ? (
        <div className={styles.difficultyRow} aria-label="Wybierz wariant zadania">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button
              key={level}
              type="button"
              aria-pressed={activeDifficulty === level}
              onClick={() => chooseDifficulty(level)}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      ) : activity === "different-denom-independent" ? (
        <p className={styles.difficultyBadge}>Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p>
      ) : null}

      {activity === "different-denom-glasses-discover" ? (
        <section className={styles.glassWorkspace} data-identical-capacity="true">
          <FractionGlassModel
            glasses={originalGlasses}
            title="Dwie identyczne szklanki z różnymi podziałkami"
            description="Pierwsza identyczna szklanka ma poziom jednej trzeciej, druga poziom jednej czwartej. Podziałki mają różne wielkości części."
          />
          <div className={styles.denominatorPair} data-combinable="false">
            <span data-member-id="common-denominator-left">trzecie części</span>
            <strong aria-hidden>≠</strong>
            <span data-member-id="common-denominator-right">czwarte części</span>
          </div>
          {!controlsLocked ? (
            <button type="button" className={styles.primaryButton} onClick={() => setDiscoveryAttempted(true)}>
              Spróbuj połączyć porcje
            </button>
          ) : null}
          {discoveryAttempted ? (
            <p className={styles.discoveryMessage} role="status">
              Jeszcze nie można łączyć: trzecie i czwarte części nie są tą samą miarą. Poszukaj podziałki wspólnej dla obu szklanek.
            </p>
          ) : null}
        </section>
      ) : null}

      {activity === "different-denom-glasses-twelfths" ? (
        <section className={styles.glassWorkspace} data-identical-capacity="true">
          <FractionGlassModel
            glasses={twelfths ? commonMeasureGlasses : originalGlasses}
            title="Te same poziomy wody przed i po zagęszczeniu podziałki"
            description={twelfths
              ? "Pierwszy poziom to cztery dwunaste, drugi poziom to trzy dwunaste. Poziomy nie zmieniły się."
              : "Pierwszy poziom to jedna trzecia, drugi poziom to jedna czwarta. Szklanki są identyczne."}
          />
          {!controlsLocked ? (
            <InteractionAlternativePanel
              title="Zagęść podziałkę"
              instruction="Przesuń suwak klawiaturą, dotykiem albo wskaźnikiem. Zmieniają się kreski i zapis, ale nie poziom wody."
            >
              <input
                type="range"
                min={0}
                max={1}
                step={1}
                value={twelfths ? 1 : 0}
                aria-label="Zagęszczenie obu podziałek do dwunastych"
                aria-valuetext={twelfths ? "wspólna podziałka: dwunaste" : "różne podziałki: trzecie i czwarte"}
                onChange={(event) => setTwelfths(event.target.value === "1")}
              />
              <div className={styles.rangeButtons}>
                <button type="button" aria-pressed={!twelfths} onClick={() => setTwelfths(false)}>Różne podziałki</button>
                <button type="button" aria-pressed={twelfths} onClick={() => setTwelfths(true)}>Dwunaste</button>
              </div>
            </InteractionAlternativePanel>
          ) : null}
          <p className={styles.equalityStatement} role="status">
            {twelfths ? "1/3 = 4/12 · 1/4 = 3/12 · poziomy bez zmiany" : "Szukamy wspólnej miary dla 1/3 i 1/4."}
          </p>
        </section>
      ) : null}

      {activity === "different-denom-glasses-pour" ? (
        <section className={styles.glassWorkspace} data-identical-capacity="true" data-poured={poured}>
          <FractionGlassModel
            glasses={pourGlasses}
            pour={{ fromIds: ["thirds", "quarters"], toId: "result", label: "obie porcje do szklanki Razem" }}
            title="Przelewanie dwóch porcji mierzonych w dwunastych"
            description={poured
              ? "Obie szklanki źródłowe są puste, a identyczna szklanka wynikowa zawiera siedem dwunastych pojemności."
              : "Pierwsza szklanka zawiera cztery dwunaste, druga trzy dwunaste, a identyczna szklanka wynikowa jest pusta."}
          />
          {!controlsLocked ? (
            <div className={styles.pourControls}>
              <button type="button" className={styles.primaryButton} disabled={poured} onClick={() => setPoured(true)}>
                Przelej 4/12 i 3/12
              </button>
              <button type="button" className={styles.secondaryButton} disabled={!poured} onClick={() => setPoured(false)}>
                Ustaw od początku
              </button>
            </div>
          ) : null}
          <p className={styles.equalityStatement} role="status">
            {poured ? "4/12 + 3/12 = 7/12" : "Wspólna miara jest gotowa do przelewu."}
          </p>
        </section>
      ) : null}

      {activity === "different-denom-algorithm" || activity === "different-denom-independent"
        ? renderAlgorithm()
        : null}

      {successMessage ? <p className={styles.success} role="status">✓ {successMessage}</p> : null}
      {diagnostic ? onResultChange ? (
        <DiagnosticFeedbackPanel
          result={toPublicLessonGradeResult(diagnostic.result)}
          copy={diagnostic.copy}
          highlights={diagnostic.highlights}
          mode="assessment"
          submitted
        />
      ) : (
        <DiagnosticFeedbackPanel
          result={toPublicLessonGradeResult(diagnostic.result)}
          copy={diagnostic.copy}
          highlights={diagnostic.highlights}
          mode="practice"
          submitted
        />
      ) : null}
    </article>
  );
}
