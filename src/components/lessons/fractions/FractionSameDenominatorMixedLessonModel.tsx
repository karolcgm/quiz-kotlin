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
import { parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
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
  "mixed-same-denom-independent": "Samodzielna próba",
};

function blankMixedStack(): FractionStackValue {
  return { wholePart: [""], numerator: [""], denominator: [""] };
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
    <span className={`${styles.mixedNumber} ${className}`} aria-label={mixedLabel(value)} data-operation-member={memberId}>
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
      <div className={styles.denominatorBridge} data-realtime-highlight={step >= 2 || showExchange}>
        <span>{problem.left.denominator}</span>
        <b>jednakowe części — mianownik bez zmiany przed skróceniem</b>
        <span>{problem.right.denominator}</span>
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
}: ProblemEntryProps) {
  const [stack, setStack] = useState<FractionStackValue>(blankMixedStack);
  const exchangeRequired = requiresWholeExchange(problem);
  const check = () => {
    const parsed = parseFractionStackValue(stack);
    if (!parsed.ok) {
      const code = parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
        ? FRACTION_FEEDBACK_CODES.zeroDenominator
        : FRACTION_FEEDBACK_CODES.emptyPart;
      onChecked({ code, submitted: { numerator: 0, denominator: 1 }, submittedLabel: stackLabel(stack) });
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
      submittedLabel: stackLabel(stack),
    });
  };
  return (
    <section className={styles.entryPanel} aria-label={`Odpowiedź do działania ${operationLabel(problem)}`}>
      {exchangeRequired ? (
        <div className={styles.exchangeDecision} data-realtime-highlight={!exchangedWhole}>
          <p>Czy część ułamkowa odjemnej wystarcza do odjęcia?</p>
          {!controlsLocked ? <button type="button" aria-pressed={exchangedWhole} onClick={() => { onExchange(); onEdit(); }}>
            {exchangedWhole ? "✓ Zamiana całości zapisana" : "Zamień jedną całość w zapisie"}
          </button> : null}
        </div>
      ) : null}
      <FractionStackInput
        value={stack}
        onChange={(value) => { setStack(value); onEdit(); }}
        showWholePart
        readOnly={controlsLocked}
        digitLimit={2}
        stepLabel="Wpisz wynik jako liczbę mieszaną"
        ariaLabel="Wynik: osobna kratka części całkowitej oraz pionowe kratki licznika i mianownika"
        onSubmit={() => check()}
      />
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
      {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={check}>{buttonLabel}</button> : null}
    </section>
  );
}

function BorrowPizza({
  problem,
  controlsLocked,
  onSuccess,
  onDiagnostic,
}: {
  problem: MixedSameDenominatorProblem;
  controlsLocked: boolean;
  onSuccess: (message: string) => void;
  onDiagnostic: (code: FractionSameDenominatorMixedDiagnosticCode) => void;
}) {
  const [cutCount, setCutCount] = useState(0);
  const [exchanged, setExchanged] = useState(false);
  const [removed, setRemoved] = useState(0);
  const exchange = exchangeOneWhole(problem.left);
  const readyToExchange = cutCount === problem.left.denominator;
  const complete = exchanged && removed === problem.right.numerator;
  return (
    <div className={styles.borrowWorkspace}>
      <SmartVerticalOperation problem={problem} step={exchanged ? 3 : cutCount > 0 ? 2 : 1} exchanged={exchanged} revealResult={complete} />
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
          <button type="button" disabled={!readyToExchange || exchanged} onClick={() => setExchanged(true)}>Zamień pociętą całość na osiem ósmych</button>
          <button type="button" disabled={exchanged} onClick={() => onDiagnostic(FRA_BORROW_WHOLE)}>Spróbuj odjąć bez zamiany</button>
        </div> : null}
        {exchanged ? <StaticMixed value={problem.left} replacement={exchange} wholeCrossed numeratorCrossed memberId="borrow-live-trace" /> : null}
      </section>
      <section className={styles.pieceTray} aria-label="Odejmowanie pięciu ósmych dopiero po zamianie całości">
        <p><b>Dopiero teraz odejmij <StaticMixed value={{ wholePart: 0, numerator: 5, denominator: 8 }} memberId="pizza-subtract" />:</b> odłożono {removed} z 5 kawałków.</p>
        <div className={styles.pieces} aria-live="polite">
          {Array.from({ length: exchange.numerator }, (_, index) => (
            <span key={index} className={index < removed ? styles.removedPiece : styles.piece}><StaticMixed value={{ wholePart: 0, numerator: 1, denominator: problem.left.denominator }} memberId={`pizza-piece-${index}`} /></span>
          ))}
        </div>
        {!controlsLocked ? <div className={styles.actionButtons}>
          <button type="button" disabled={!exchanged || removed >= problem.right.numerator} onClick={() => {
            const next = Math.min(problem.right.numerator, removed + 1);
            setRemoved(next);
            if (next === problem.right.numerator) onSuccess("Po zamianie całości poprawnie odjęto wskazaną liczbę części. Teraz zapisz i skróć wynik.");
          }}>Odejmij jedną ósmą</button>
          <button type="button" disabled={removed === 0} onClick={() => setRemoved(0)}>Przywróć kawałki</button>
        </div> : null}
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
  const [storyAnswer, setStoryAnswer] = useState("");
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
    const storyComplete = task.activity !== "mixed-same-denom-bakery"
      || storyAnswer.trim().length >= 22 && /piekarn|tac|drożdż/u.test(storyAnswer.toLocaleLowerCase("pl-PL"));
    const finalCode = code ?? (storyComplete ? null : FRACTION_FEEDBACK_CODES.wrongOperationPair);
    setDiagnosticCode(finalCode);
    setSubmittedLabel(label);
    setSuccess(finalCode ? null : task.activity === "mixed-same-denom-bakery"
      ? "Poprawnie obliczono liczbę przygotowanych tac i liczbę tac pozostałych po wydaniu zamówienia."
      : "Działanie, ewentualna zamiana całości, skrócenie i uzasadnienie są poprawne.");
    onResultChange?.(finalCode === null, `${label}${reason ? ` · ${reason}` : ""}${storyAnswer ? ` · ${storyAnswer}` : ""}`);
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
          <SmartVerticalOperation problem={problem} step={step} revealResult={step >= 3} />
          <ol className={styles.liveSteps} aria-live="polite">
            <li data-active={step === 0}>1. Ustaw osobno kolumny części całkowitych i ułamkowych.</li>
            <li data-active={step === 1}>2. Dodaj całości: 2 + 1.</li>
            <li data-active={step === 2}>3. Dodaj liczniki, a mianownik 7 pozostaw bez zmiany.</li>
            <li data-active={step === 3}>4. Odczytaj wynik <StaticMixed value={{ wholePart: 3, numerator: 5, denominator: 7 }} memberId="add-step-result" /> i sprawdź, czy część ułamkowa jest nieskracalna.</li>
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
        <><BorrowPizza
          problem={problem}
          controlsLocked={controlsLocked}
          onSuccess={(message) => { setSuccess(message); setDiagnosticCode(null); }}
          onDiagnostic={(code) => { setDiagnosticCode(code); setSuccess(null); }}
        /><ProblemEntry
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
            <p>Piekarnia przygotowała rano <StaticMixed value={{ wholePart: 2, numerator: 3, denominator: 10 }} memberId="bakery-morning" />, a później jeszcze <StaticMixed value={{ wholePart: 1, numerator: 5, denominator: 10 }} memberId="bakery-later" /> tacy drożdżówek. Następnie wydała <StaticMixed value={{ wholePart: 1, numerator: 9, denominator: 10 }} memberId="bakery-sold" />. Ile przygotowano razem i ile zostało?</p>
          </div>
          <div className={styles.storyProgress}><span data-complete={problemIndex > 0}>1. dodawanie</span><span data-complete={Boolean(success)}>2. odejmowanie</span><span data-complete={Boolean(success)}>3. pełna odpowiedź</span></div>
          <SmartVerticalOperation problem={problem} step={2} exchanged={exchanged} diagnosticCode={diagnosticCode} submittedLabel={submittedLabel} />
          {problemIndex === 1 && !controlsLocked ? <label className={styles.reasonField}>Pełna odpowiedź o tym, ile zostało
            <textarea rows={3} value={storyAnswer} placeholder="Po wydaniu zamówienia piekarni zostało…" onChange={(event) => { setStoryAnswer(event.target.value); clearResult(); }} />
          </label> : null}
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
          <SmartVerticalOperation problem={problem} step={2} exchanged={exchanged} diagnosticCode={diagnosticCode} submittedLabel={submittedLabel} />
          <p className={styles.rule}>Samodzielnie zdecyduj, czy potrzebna jest zamiana całości. Zapisz wynik w osobnej kratce całości i pionowych kratkach ułamka, skróć go, a potem uzasadnij jeden kluczowy krok.</p>
          <ProblemEntry
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
