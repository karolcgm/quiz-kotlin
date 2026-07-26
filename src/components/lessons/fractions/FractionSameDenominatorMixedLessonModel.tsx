"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  FRA_BORROW_WHOLE,
  FRA_UNSIMPLIFIED_RESULT,
  createFractionSameDenominatorMixedDiagnosticResult,
  createPublicFractionSameDenominatorMixedTask,
  evaluateMixedSameDenominatorAttempt,
  exchangeOneWhole,
  mixedResultWithSameDenominator,
  requiresWholeExchange,
  simplifiedMixedResult,
  type FractionSameDenominatorMixedActivity,
  type FractionSameDenominatorMixedDiagnosticCode,
  type MixedSameDenominatorProblem,
} from "@/lib/math/fractions/fractionSameDenominatorMixedLesson";
import { mixedToImproper, parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionStackValue, FractionValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionSameDenominatorMixedLesson.module.css";

const ACTIVITY_TITLES: Record<FractionSameDenominatorMixedActivity, string> = {
  "mixed-same-denom-add": "Działania na liczbach mieszanych",
  "mixed-same-denom-borrow-pizza": "Zamień jedną całość",
  "mixed-same-denom-borrow-notation": "Inteligentny zapis pionowy",
  "mixed-same-denom-bakery": "Piekarnia na festyn",
  "mixed-same-denom-independent": "Dodawanie i odejmowanie liczb mieszanych",
};

function blankMixedStack(): FractionStackValue {
  return { wholePart: [""], numerator: [""], denominator: [""] };
}

function stackMatchesMixed(value: FractionStackValue, expected: MixedFractionValue): boolean {
  const wholePart = Number(value.wholePart?.join("") ?? "");
  const numerator = Number(value.numerator.join(""));
  const denominator = Number(value.denominator.join(""));
  return Number.isInteger(wholePart)
    && Number.isInteger(numerator)
    && Number.isInteger(denominator)
    && wholePart === expected.wholePart
    && numerator === expected.numerator
    && denominator === expected.denominator;
}

function sameMixedValue(left: MixedFractionValue, right: MixedFractionValue): boolean {
  return left.wholePart === right.wholePart
    && left.numerator === right.numerator
    && left.denominator === right.denominator;
}

function mixedLabel(value: MixedFractionValue): string {
  return value.numerator === 0
    ? String(value.wholePart)
    : `${value.wholePart} ${value.numerator}/${value.denominator}`;
}

function operationLabel(problem: MixedSameDenominatorProblem): string {
  return `${mixedLabel(problem.left)} ${problem.operation} ${mixedLabel(problem.right)}`;
}

function stackLabel(value: FractionStackValue): string {
  const whole = value.wholePart?.join("") ?? "";
  return `${whole ? `${whole} ` : ""}${value.numerator.join("")}/${value.denominator.join("")}`;
}

function StaticMixed({
  value,
  memberId,
  className = "",
  wholeCrossed = false,
  numeratorCrossed = false,
  replacement,
}: {
  value: MixedFractionValue;
  memberId: string;
  className?: string;
  wholeCrossed?: boolean;
  numeratorCrossed?: boolean;
  replacement?: MixedFractionValue;
}) {
  const showWholePart = value.wholePart !== 0;
  return (
    <span
      className={`${styles.mixedNumber} ${className}`}
      aria-label={mixedLabel(value)}
      data-operation-member={memberId}
      data-static-mixed-layout="whole-before-fraction"
    >
      {showWholePart ? <span className={`${styles.wholeCell} ${wholeCrossed ? styles.crossedCell : ""}`} data-operation-member={`${memberId}-whole`}>
        {value.wholePart}
      </span> : null}
      {replacement && wholeCrossed ? <span className={styles.newSmallCell} data-new-whole-value>{replacement.wholePart}</span> : null}
      <span className={styles.fractionPart}>
        <span className={`${styles.fractionCell} ${numeratorCrossed ? styles.crossedCell : ""}`} data-operation-member={`${memberId}-numerator`}>{value.numerator}</span>
        <span className={styles.fractionLine} aria-hidden />
        <span className={styles.fractionCell} data-operation-member={`${memberId}-denominator`}>{value.denominator}</span>
      </span>
      {replacement && numeratorCrossed ? (
        <span className={styles.newFractionCells} aria-label={`nowa część ułamkowa ${replacement.numerator}/${replacement.denominator}`}>
          <span className={styles.newSmallCell} data-new-numerator-value>{replacement.numerator}</span>
          <span className={styles.smallLine} aria-hidden />
          <span className={styles.newSmallCell}>{replacement.denominator}</span>
        </span>
      ) : null}
    </span>
  );
}

function SmartVerticalOperation({
  problem,
  step = 0,
  exchanged = false,
  revealResult = false,
  diagnosticCode,
  submittedLabel,
}: {
  problem: MixedSameDenominatorProblem;
  step?: number;
  exchanged?: boolean;
  revealResult?: boolean;
  diagnosticCode?: FractionSameDenominatorMixedDiagnosticCode | null;
  submittedLabel?: string | null;
}) {
  const exchange = requiresWholeExchange(problem) ? exchangeOneWhole(problem.left) : null;
  const raw = mixedResultWithSameDenominator(problem);
  const final = simplifiedMixedResult(problem);
  const showExchange = Boolean(exchange && exchanged);
  const showCorrection = diagnosticCode === FRA_UNSIMPLIFIED_RESULT && submittedLabel;
  return (
    <section className={styles.notationCard} aria-label={`Pionowy zapis: ${operationLabel(problem)}`} data-smart-mixed-notation>
      <div className={styles.verticalOperation}>
        <span className={styles.operatorPlaceholder} aria-hidden />
        <StaticMixed
          value={problem.left}
          memberId="mixed-left"
          className={`${step >= 1 ? styles.activeWholes : ""} ${step >= 2 ? styles.activeFractions : ""}`}
          wholeCrossed={showExchange}
          numeratorCrossed={showExchange}
          replacement={showExchange ? exchange ?? undefined : undefined}
        />
        <span className={styles.operator}>{problem.operation}</span>
        <StaticMixed value={problem.right} memberId="mixed-right" className={step >= 2 ? styles.activeFractions : ""} />
        <span className={styles.operationLine} aria-hidden />
        <span className={styles.operatorPlaceholder} aria-hidden />
        {revealResult ? <StaticMixed value={raw} memberId="mixed-result" className={step >= 3 ? styles.activeResult : ""} /> : <span className={styles.hiddenResult}><span>□</span><span className={styles.blankFraction}><span>□</span><i aria-hidden /><span>□</span></span></span>}
      </div>
      {showExchange && exchange ? (
        <p className={styles.exchangeEquation} role="status">
          1 całość = <StaticMixed value={{ wholePart: 0, numerator: problem.left.denominator, denominator: problem.left.denominator }} memberId="exchange-whole" />, więc <StaticMixed value={problem.left} memberId="exchange-before" /> = <StaticMixed value={exchange} memberId="exchange-after" />.
        </p>
      ) : null}
      {showCorrection ? (
        <div className={styles.correctionTrace} data-cross-out-trace>
          <span className={styles.crossedText}>{submittedLabel}</span>
          <span aria-hidden>→</span>
          <StaticMixed value={final} memberId="mixed-simplified-result" />
          <span>Podziel licznik i mianownik części ułamkowej przez wspólny dzielnik.</span>
        </div>
      ) : null}
    </section>
  );
}

interface ProblemEntryProps {
  problem: MixedSameDenominatorProblem;
  requireJustification?: boolean;
  controlsLocked: boolean;
  reason: string;
  exchangedWhole: boolean;
  onReasonChange: (value: string) => void;
  onExchange: () => void;
  onChecked: (input: {
    code: FractionSameDenominatorMixedDiagnosticCode | null;
    submitted: FractionValue;
    submittedLabel: string;
  }) => void;
  onEdit: () => void;
  buttonLabel?: string;
  showExchangeControl?: boolean;
}

function ProblemEntry({
  problem,
  requireJustification = false,
  controlsLocked,
  reason,
  exchangedWhole,
  onReasonChange,
  onExchange,
  onChecked,
  onEdit,
  buttonLabel = "Prześlij zadanie",
  showExchangeControl = true,
}: ProblemEntryProps) {
  const [exchangeStack, setExchangeStack] = useState<FractionStackValue>(blankMixedStack);
  const [exchangeEntryVisible, setExchangeEntryVisible] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  const [keypadHost, setKeypadHost] = useState<HTMLDivElement | null>(null);
  const exchangeRequired = requiresWholeExchange(problem);
  const exchangedValue = exchangeRequired ? exchangeOneWhole(problem.left) : null;
  const rawResult = mixedResultWithSameDenominator(problem);
  const finalResult = problem.requireSimplifiedFinal ? simplifiedMixedResult(problem) : rawResult;
  const calculationExpectedStages: MixedFractionValue[] = [];
  if (problem.operation === "+") {
    const rawAddition: MixedFractionValue = {
      wholePart: problem.left.wholePart + problem.right.wholePart,
      numerator: problem.left.numerator + problem.right.numerator,
      denominator: problem.left.denominator,
    };
    calculationExpectedStages.push(rawAddition);
    if (!sameMixedValue(rawAddition, rawResult)) calculationExpectedStages.push(rawResult);
  } else {
    calculationExpectedStages.push(rawResult);
  }
  if (!sameMixedValue(calculationExpectedStages.at(-1)!, finalResult)) {
    calculationExpectedStages.push(finalResult);
  }
  const [calculationStacks, setCalculationStacks] = useState<FractionStackValue[]>(() =>
    calculationExpectedStages.map(() => blankMixedStack()));
  const [calculationStep, setCalculationStep] = useState(0);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const check = (candidate: FractionStackValue) => {
    const parsed = parseFractionStackValue(candidate);
    if (!parsed.ok) {
      const code = parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
        ? FRACTION_FEEDBACK_CODES.zeroDenominator
        : FRACTION_FEEDBACK_CODES.emptyPart;
      onChecked({ code, submitted: { numerator: 0, denominator: 1 }, submittedLabel: stackLabel(candidate) });
      return;
    }
    onChecked({
      code: evaluateMixedSameDenominatorAttempt({
        problem,
        submitted: parsed.value,
        exchangedWhole,
        justification: reason,
        requireJustification,
      }),
      submitted: parsed.value,
      submittedLabel: stackLabel(candidate),
    });
  };
  const checkCalculationStage = (index: number) => {
    const candidate = calculationStacks[index];
    const expectedStage = calculationExpectedStages[index];
    if (!candidate || !expectedStage) return;
    if (index === calculationExpectedStages.length - 1) {
      setCalculationError(null);
      check(candidate);
      return;
    }
    if (!stackMatchesMixed(candidate, expectedStage)) {
      setCalculationError(problem.operation === "+"
        ? index === 0
          ? "Najpierw dodaj osobno części całkowite i liczniki. Mianownik pozostaje bez zmiany."
          : "Wyłącz całość z ułamka niewłaściwego i zapisz równoważną liczbę mieszaną."
        : "Odejmij części całkowite i ułamkowe po zamianie jednej całości. Mianownik pozostaje bez zmiany.");
      return;
    }
    setCalculationError(null);
    onEdit();
    setCalculationStep(index + 1);
  };
  const checkExchange = () => {
    if (!exchangedValue) return;
    const parsed = parseFractionStackValue(exchangeStack);
    if (!parsed.ok) return;
    const expectedExchange = mixedToImproper(exchangedValue);
    if (parsed.value.numerator !== expectedExchange.numerator || parsed.value.denominator !== expectedExchange.denominator) {
      setExchangeError("Sprawdź nową część całkowitą i dodaj mianownik do licznika części ułamkowej.");
      return;
    }
    setExchangeError(null);
    onExchange();
    onEdit();
  };
  return (
    <section className={styles.entryPanel} aria-label={`Odpowiedź do działania ${operationLabel(problem)}`}>
      {exchangeRequired && showExchangeControl ? (
        <div className={styles.exchangeDecision} data-realtime-highlight={!exchangedWhole}>
          <p>Czy część ułamkowa odjemnej wystarcza do odjęcia?</p>
          {!controlsLocked ? <button type="button" aria-pressed={exchangeEntryVisible} onClick={() => { setExchangeEntryVisible(true); setExchangeError(null); onEdit(); }}>
            {exchangedWhole ? "✓ Zamiana całości zapisana" : exchangeEntryVisible ? "Uzupełnij zapis zamiany poniżej" : "Zamień jedną całość w zapisie"}
          </button> : null}
        </div>
      ) : null}
      <div className={styles.answerWorkspace}>
        <p className={styles.inlineCalculationHint}>
          {exchangeRequired && exchangeEntryVisible
            ? "Zapisz zamianę jednej całości, a następnie oblicz wynik."
            : "Uzupełnij wynik działania."}
        </p>
        <div className={styles.answerEquationScroller}>
          <div
            className={styles.answerEquation}
            aria-label={`Uzupełnij całe działanie ${operationLabel(problem)}`}
            data-full-mixed-operation
          >
            <div className={styles.answerEquationRow} data-calculation-row="operation">
              <StaticMixed value={problem.left} memberId="answer-left" />
              <span className={styles.operator}>{problem.operation}</span>
              <StaticMixed value={problem.right} memberId="answer-right" />
              {!exchangeRequired ? <span className={styles.answerEquals}>=</span> : null}
              {!exchangeRequired ? (
                <div
                  className={styles.inlineFractionInput}
                  data-calculation-stage="1"
                  data-addition-stage={problem.operation === "+" ? "1" : undefined}
                >
                  <FractionStackInput
                    value={calculationStacks[0]!}
                    onChange={(value) => {
                      setCalculationStacks((current) => current.map((item, itemIndex) => itemIndex === 0 ? value : item));
                      setCalculationError(null);
                      onEdit();
                    }}
                    showWholePart
                    compactMixedLayout
                    readOnly={controlsLocked || calculationStep !== 0}
                    digitLimit={2}
                    fixedDigitCells={{
                      wholePart: String(calculationExpectedStages[0]!.wholePart).length,
                      numerator: String(calculationExpectedStages[0]!.numerator).length,
                      denominator: String(calculationExpectedStages[0]!.denominator).length,
                    }}
                    showKeypad={calculationStep === 0}
                    keypadPortalTarget={keypadHost}
                    showKeypadConfirm={false}
                    autoAdvance={false}
                    stepLabel={problem.operation === "+" ? "Dodaj części całkowite i liczniki" : "Odejmij części całkowite i ułamkowe"}
                    ariaLabel="Etap 1: wynik działania przed skróceniem"
                  />
                </div>
              ) : null}
            </div>
            {exchangeRequired && exchangeEntryVisible && exchangedValue ? (
              <div className={styles.answerEquationRow} data-calculation-row="exchange">
                <div className={styles.inlineFractionInput} data-exchange-entry>
                  <FractionStackInput
                    value={exchangeStack}
                    onChange={(value) => { setExchangeStack(value); setExchangeError(null); onEdit(); }}
                    showWholePart
                    compactMixedLayout
                    readOnly={controlsLocked || exchangedWhole}
                    digitLimit={2}
                    fixedDigitCells={{
                      wholePart: String(exchangedValue.wholePart).length,
                      numerator: String(exchangedValue.numerator).length,
                      denominator: String(exchangedValue.denominator).length,
                    }}
                    showKeypad={!exchangedWhole}
                    keypadPortalTarget={keypadHost}
                    autoAdvance={false}
                    stepLabel="Wpisz zapis po zamianie jednej całości"
                    ariaLabel="Liczba mieszana po zamianie jednej całości"
                    onSubmit={checkExchange}
                  />
                </div>
                <span className={styles.operator}>{problem.operation}</span>
                <StaticMixed value={problem.right} memberId="answer-right-after-exchange" />
                <span className={styles.answerEquals}>=</span>
                <div className={styles.inlineFractionInput} data-calculation-stage="1">
                  <FractionStackInput
                    value={calculationStacks[0]!}
                    onChange={(value) => {
                      setCalculationStacks((current) => current.map((item, itemIndex) => itemIndex === 0 ? value : item));
                      setCalculationError(null);
                      onEdit();
                    }}
                    showWholePart
                    compactMixedLayout
                    readOnly={controlsLocked || !exchangedWhole || calculationStep !== 0}
                    digitLimit={2}
                    fixedDigitCells={{
                      wholePart: String(calculationExpectedStages[0]!.wholePart).length,
                      numerator: String(calculationExpectedStages[0]!.numerator).length,
                      denominator: String(calculationExpectedStages[0]!.denominator).length,
                    }}
                    showKeypad={exchangedWhole && calculationStep === 0}
                    keypadPortalTarget={keypadHost}
                    showKeypadConfirm={false}
                    autoAdvance={false}
                    stepLabel="Odejmij po zamianie jednej całości"
                    ariaLabel="Etap 1: wynik odejmowania przed skróceniem"
                  />
                </div>
              </div>
            ) : null}
            {calculationExpectedStages.slice(1).map((expectedStage, visibleIndex) => {
              const index = visibleIndex + 1;
              const previousStage = calculationExpectedStages[index - 1]!;
              const isFinal = index === calculationExpectedStages.length - 1;
              const stageUnlocked = index <= calculationStep;
              return (
                <div
                  className={styles.answerEquationRow}
                  data-calculation-row={`stage-${index + 1}`}
                  data-stage-locked={stageUnlocked ? undefined : "true"}
                  key={`${problem.id}-stage-${index}`}
                >
                  {stageUnlocked ? (
                    <StaticMixed value={previousStage} memberId={`calculation-stage-${index}-previous`} />
                  ) : (
                    <span className={styles.lockedStageLabel}>
                      {isFinal ? "Po skróceniu" : "Po wyłączeniu całości"}
                    </span>
                  )}
                  <span className={styles.answerEquals}>=</span>
                  <div
                    className={styles.inlineFractionInput}
                    data-calculation-stage={index + 1}
                    data-addition-stage={problem.operation === "+" ? index + 1 : undefined}
                    data-simplified-result={isFinal ? "true" : undefined}
                  >
                    <FractionStackInput
                      value={calculationStacks[index]!}
                      onChange={(value) => {
                        setCalculationStacks((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
                        setCalculationError(null);
                        onEdit();
                      }}
                      showWholePart
                      compactMixedLayout
                      readOnly={controlsLocked || index !== calculationStep}
                      digitLimit={2}
                      fixedDigitCells={{
                        wholePart: String(expectedStage.wholePart).length,
                        numerator: String(expectedStage.numerator).length,
                        denominator: String(expectedStage.denominator).length,
                      }}
                      showKeypad={index === calculationStep}
                      keypadPortalTarget={keypadHost}
                      showKeypadConfirm={false}
                      autoAdvance={false}
                      stepLabel={isFinal ? "Skróć część ułamkową" : "Wyłącz całość z ułamka niewłaściwego"}
                      ariaLabel={`Etap ${index + 1}: ${isFinal ? "wynik po skróceniu" : "wynik po wyłączeniu całości"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div ref={setKeypadHost} className={styles.inlineKeypadHost} data-inline-keypad-host />
        {calculationError ? <p role="status" className={styles.exchangeEntryError}>{calculationError}</p> : null}
        {exchangeError ? <p role="status" className={styles.exchangeEntryError}>{exchangeError}</p> : null}
        {exchangedWhole ? <p role="status" className={styles.exchangeEntrySuccess}>✓ Zamiana jest poprawna. Teraz oblicz wynik po prawej stronie.</p> : null}
      </div>
      {requireJustification && !controlsLocked ? (
        <label className={styles.reasonField}>
          Uzasadnij kluczowy krok jednym zdaniem
          <textarea
            rows={3}
            value={reason}
            placeholder={exchangeRequired ? "Zamieniłem jedną całość na…" : "Mianownik pozostał bez zmian, ponieważ…"}
            onChange={(event) => { onReasonChange(event.target.value); onEdit(); }}
          />
        </label>
      ) : null}
      {!controlsLocked && (!exchangeRequired || exchangedWhole) ? (
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => checkCalculationStage(calculationStep)}
        >
          {calculationStep < calculationExpectedStages.length - 1 ? "Sprawdź etap" : buttonLabel}
        </button>
      ) : null}
    </section>
  );
}

function BorrowPizza({
  problem,
  controlsLocked,
  exchanged,
  onExchange,
  onDiagnostic,
}: {
  problem: MixedSameDenominatorProblem;
  controlsLocked: boolean;
  exchanged: boolean;
  onExchange: () => void;
  onDiagnostic: (code: FractionSameDenominatorMixedDiagnosticCode) => void;
}) {
  const [cutCount, setCutCount] = useState(0);
  const exchange = exchangeOneWhole(problem.left);
  const readyToExchange = cutCount === problem.left.denominator;
  return (
    <div className={styles.borrowWorkspace}>
      <section className={styles.pizzaLab} aria-label="Cięcie pełnej pizzy na osiem równych części">
        <div
          className={styles.borrowPizza}
          style={{ "--visible-cuts": cutCount } as CSSProperties}
          data-cut-count={cutCount}
          aria-label={`Pełna pizza: widocznych granic ósmych części ${cutCount} z 8`}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index} className={index < cutCount ? styles.visibleCut : styles.hiddenCut} style={{ transform: `rotate(${index * 45}deg)` }} aria-hidden />
          ))}
          <span className={styles.pizzaCenter} aria-hidden>🍕</span>
        </div>
        <div className={styles.progress} aria-live="polite"><b>{cutCount}/8</b><span>granic ósmych części zaznaczonych</span></div>
        {!controlsLocked ? <div className={styles.actionButtons}>
          <button type="button" disabled={cutCount >= 8 || exchanged} onClick={() => setCutCount((value) => Math.min(8, value + 1))}>Potnij kolejną ósmą część</button>
          <button type="button" disabled={cutCount === 0 || exchanged} onClick={() => setCutCount(0)}>Zacznij cięcie od nowa</button>
        </div> : null}
        {!readyToExchange ? <p className={styles.lockedStep}>Najpierw wyznacz wszystkie 8 równych części pełnej pizzy.</p> : null}
      </section>
      <section className={styles.exchangePanel} data-realtime-highlight={readyToExchange && !exchanged}>
        <p><b>Zamiana:</b> <StaticMixed value={problem.left} memberId="pizza-before-exchange" /> → <StaticMixed value={exchange} memberId="pizza-after-exchange" /></p>
        {!controlsLocked ? <div className={styles.actionButtons}>
          <button type="button" disabled={!readyToExchange || exchanged} onClick={onExchange}>Zamień pociętą całość na osiem ósmych</button>
          <button type="button" disabled={exchanged} onClick={() => onDiagnostic(FRA_BORROW_WHOLE)}>Spróbuj odjąć bez zamiany</button>
        </div> : null}
        {exchanged ? <p className={styles.exchangeReady}>Zamiana jest gotowa. Uzupełnij wynik w karcie u góry.</p> : null}
      </section>
    </div>
  );
}

export interface FractionSameDenominatorMixedLessonModelProps {
  activity: FractionSameDenominatorMixedActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionSameDenominatorMixedLessonModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: FractionSameDenominatorMixedLessonModelProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicFractionSameDenominatorMixedTask({
    seed: effectiveSeed,
    difficulty,
    activity,
  }), [activity, difficulty, effectiveSeed]);
  return (
    <FractionSameDenominatorMixedWorkspace
      key={`${activity}-${effectiveSeed}-${difficulty}`}
      task={task}
      readOnly={readOnly}
      presentationMode={presentationMode}
      questionNumber={questionNumber}
      questionCount={questionCount}
      onResultChange={onResultChange}
    />
  );
}

function FractionSameDenominatorMixedWorkspace({
  task,
  readOnly,
  presentationMode,
  questionNumber,
  questionCount,
  onResultChange,
}: Omit<FractionSameDenominatorMixedLessonModelProps, "activity" | "seed" | "taskSeed" | "difficulty"> & {
  task: ReturnType<typeof createPublicFractionSameDenominatorMixedTask>;
}) {
  const controlsLocked = Boolean(readOnly || presentationMode && task.activity === "mixed-same-denom-independent");
  const [step, setStep] = useState(0);
  const [exchanged, setExchanged] = useState(false);
  const [reason, setReason] = useState("");
  const [problemIndex, setProblemIndex] = useState(0);
  const [diagnosticCode, setDiagnosticCode] = useState<FractionSameDenominatorMixedDiagnosticCode | null>(null);
  const [submittedLabel, setSubmittedLabel] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const problem = task.problems[Math.min(problemIndex, task.problems.length - 1)]!;
  const diagnostic = diagnosticCode ? createFractionSameDenominatorMixedDiagnosticResult(diagnosticCode) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSubmittedLabel(null);
    setSuccess(null);
    onResultChange?.(null);
  };
  const report = ({ code, submittedLabel: label }: { code: FractionSameDenominatorMixedDiagnosticCode | null; submitted: FractionValue; submittedLabel: string }) => {
    if (!code && task.activity === "mixed-same-denom-bakery" && problemIndex === 0) {
      setProblemIndex(1);
      setDiagnosticCode(null);
      setSubmittedLabel(null);
      setSuccess("Pierwsze działanie poprawne. Teraz odejmij wydane zamówienie.");
      return;
    }
    if (!code && task.activity !== "mixed-same-denom-independent" && problemIndex < task.problems.length - 1) {
      setProblemIndex((value) => value + 1);
      setStep(0);
      setExchanged(false);
      setDiagnosticCode(null);
      setSubmittedLabel(null);
      setSuccess("Dobrze. Otwieram kolejne zadanie w tym samym slajdzie.");
      return;
    }
    const finalCode = code;
    setDiagnosticCode(finalCode);
    setSubmittedLabel(label);
    setSuccess(finalCode ? null : task.activity === "mixed-same-denom-bakery"
      ? "Poprawnie obliczono liczbę przygotowanych tac i liczbę tac pozostałych po wydaniu zamówienia."
      : "Działanie, ewentualna zamiana całości, skrócenie i uzasadnienie są poprawne.");
    onResultChange?.(finalCode === null, `${label}${reason ? ` · ${reason}` : ""}`);
  };

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName={styles.frameContent}
      eyebrow="Dział 3 · Ułamki zwykłe"
      heading={ACTIVITY_TITLES[task.activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-fraction-same-denominator-mixed-l2
      data-fraction-activity={task.activity}
      data-generator-id={task.generatorId}
      data-answer-spec="server-only"
      data-orientation-contract="portrait-landscape"
      data-difficulty={task.difficulty}
    >
      {task.activity === "mixed-same-denom-add" ? (
        <section className={styles.workspace}>
          <ol className={styles.liveSteps} aria-live="polite">
            <li data-active={step === 0}>1. Ustaw osobno kolumny części całkowitych i ułamkowych.</li>
            <li data-active={step === 1}>2. Dodaj całości: {problem.left.wholePart} + {problem.right.wholePart}.</li>
            <li data-active={step === 2}>3. Dodaj liczniki, a mianownik {problem.left.denominator} pozostaw bez zmiany.</li>
            <li data-active={step === 3}>4. Gdy licznik jest większy od mianownika, wyłącz całość, a następnie skróć część ułamkową.</li>
          </ol>
          {!controlsLocked ? <div className={styles.actionButtons}>
            <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>← Poprzedni krok</button>
            <button type="button" disabled={step === 3} onClick={() => setStep((value) => Math.min(3, value + 1))}>Następny krok →</button>
          </div> : null}
          <ProblemEntry
            key={problem.id}
            problem={problem}
            controlsLocked={controlsLocked}
            reason=""
            exchangedWhole={false}
            onReasonChange={() => undefined}
            onExchange={() => undefined}
            onChecked={report}
            onEdit={clearResult}
            buttonLabel="Prześlij zadanie"
          />
        </section>
      ) : null}

      {task.activity === "mixed-same-denom-borrow-pizza" ? (
        <><ProblemEntry
          key={problem.id}
          problem={problem}
          controlsLocked={controlsLocked}
          reason=""
          exchangedWhole={exchanged}
          onReasonChange={() => undefined}
          onExchange={() => setExchanged(true)}
          onChecked={report}
          onEdit={clearResult}
          buttonLabel="Prześlij zadanie"
          showExchangeControl={false}
        /><BorrowPizza
          problem={problem}
          controlsLocked={controlsLocked}
          exchanged={exchanged}
          onExchange={() => { setExchanged(true); clearResult(); }}
          onDiagnostic={(code) => { setDiagnosticCode(code); setSuccess(null); }}
        /></>
      ) : null}

      {task.activity === "mixed-same-denom-borrow-notation" ? (
        <section className={styles.workspace}>
          <SmartVerticalOperation problem={problem} step={step} exchanged={step >= 2} revealResult={step >= 3} diagnosticCode={diagnosticCode} submittedLabel={submittedLabel} />
          <ol className={styles.liveSteps} aria-live="polite">
            <li data-active={step === 0}>1. <StaticMixed value={{ wholePart: 4, numerator: 3, denominator: 8 }} memberId="borrow-step-start" /> ma zbyt małą część ułamkową do odjęcia <StaticMixed value={{ wholePart: 1, numerator: 5, denominator: 8 }} memberId="borrow-step-subtrahend" />.</li>
            <li data-active={step === 1}>2. Jedną całość zamień na <StaticMixed value={{ wholePart: 0, numerator: 8, denominator: 8 }} memberId="borrow-step-whole" />.</li>
            <li data-active={step === 2}>3. Po zamianie otrzymujesz <StaticMixed value={{ wholePart: 3, numerator: 11, denominator: 8 }} memberId="borrow-step-exchanged" />.</li>
            <li data-active={step === 3}>4. Odejmij i skróć wynik do <StaticMixed value={{ wholePart: 2, numerator: 3, denominator: 4 }} memberId="borrow-step-result" />.</li>
          </ol>
          {!controlsLocked ? <div className={styles.actionButtons}>
            <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>← Poprzedni krok</button>
            <button type="button" disabled={step === 3} onClick={() => setStep((value) => Math.min(3, value + 1))}>Następny krok →</button>
          </div> : null}
        </section>
      ) : null}

      {task.activity === "mixed-same-denom-bakery" ? (
        <section className={styles.workspace}>
          <div className={styles.storyCard}>
            <span aria-hidden>🥐</span>
            <p>Rano przygotowano <StaticMixed className={styles.storyFraction} value={{ wholePart: 2, numerator: 3, denominator: 10 }} memberId="bakery-morning" /> tacy, a później <StaticMixed className={styles.storyFraction} value={{ wholePart: 1, numerator: 5, denominator: 10 }} memberId="bakery-later" /> tacy drożdżówek. Sprzedano <StaticMixed className={styles.storyFraction} value={{ wholePart: 1, numerator: 9, denominator: 10 }} memberId="bakery-sold" /> tacy. Oblicz kolejno: przygotowano razem, potem zostało.</p>
          </div>
          <ProblemEntry
            key={problem.id}
            problem={problem}
            controlsLocked={controlsLocked}
            reason=""
            exchangedWhole={exchanged}
            onReasonChange={() => undefined}
            onExchange={() => setExchanged(true)}
            onChecked={report}
            onEdit={clearResult}
            buttonLabel="Prześlij zadanie"
          />
        </section>
      ) : null}

      {task.activity === "mixed-same-denom-independent" ? (
        <section className={styles.workspace}>
          <ProblemEntry
            key={problem.id}
            problem={problem}
            requireJustification
            controlsLocked={controlsLocked}
            reason={reason}
            exchangedWhole={exchanged}
            onReasonChange={setReason}
            onExchange={() => setExchanged(true)}
            onChecked={report}
            onEdit={clearResult}
          />
          {diagnosticCode ? <SmartVerticalOperation problem={problem} step={2} exchanged={exchanged} diagnosticCode={diagnosticCode} submittedLabel={submittedLabel} /> : null}
        </section>
      ) : null}

      {success ? <p role="status" className={styles.success}>✓ {success}</p> : null}
      {diagnostic ? onResultChange ? (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
      ) : (
        <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
