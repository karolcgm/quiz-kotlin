"use client";

import { useMemo, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { FractionCircleModel } from "@/components/lessons/fractions/FractionCircleModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  applySameDenominatorOperation,
  createFractionSameDenominatorDiagnosticResult,
  createPublicFractionSameDenominatorTask,
  evaluateSameDenominatorAttempt,
  FRA_DENOM_ADDED,
  FRA_UNSIMPLIFIED_RESULT,
  simplifiedSameDenominatorResult,
  type FractionSameDenominatorActivity,
  type FractionSameDenominatorDiagnosticCode,
  type FractionSameDenominatorPublicTask,
} from "@/lib/math/fractions/fractionSameDenominatorLesson";
import {
  parseFractionStackValue,
} from "@/lib/math/fractions/fractionMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionStackValue, FractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionSameDenominatorLesson.module.css";

const ACTIVITY_TITLES: Record<FractionSameDenominatorActivity, string> = {
  "same-denom-pizza-add": "Pizza — łączymy takie same kawałki",
  "same-denom-rule": "Dlaczego mianownik się nie zmienia?",
  "same-denom-take-away": "Odejmij, odkładając kawałki",
  "same-denom-bakery": "Piekarnia na festyn",
  "same-denom-independent": "Samodzielna próba",
};

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Zadanie 1",
  core: "Zadanie 2",
  challenge: "Zadanie 3",
};

function blankStack(): FractionStackValue {
  return { numerator: [""], denominator: [""] };
}

function fractionLabel(value: FractionValue): string {
  return `${value.numerator}/${value.denominator}`;
}

function StaticFraction({ value, memberId }: { value: FractionValue; memberId: string }) {
  return (
    <span className={styles.staticFraction} aria-label={fractionLabel(value)} data-fraction-member={memberId}>
      <span data-operation-member={`${memberId}-numerator`}>{value.numerator}</span>
      <span className={styles.fractionLine} aria-hidden />
      <span data-operation-member={`${memberId}-denominator`}>{value.denominator}</span>
    </span>
  );
}

function SmartSameDenominatorNotation({
  task,
  result,
  revealResult,
  showNumeratorConnector = false,
  diagnosticCode,
  submitted,
}: {
  task: FractionSameDenominatorPublicTask;
  result?: FractionValue;
  revealResult: boolean;
  showNumeratorConnector?: boolean;
  diagnosticCode?: FractionSameDenominatorDiagnosticCode | null;
  submitted?: FractionValue | null;
}) {
  const raw = applySameDenominatorOperation(task);
  const final = simplifiedSameDenominatorResult(task);
  const crossed = diagnosticCode === FRA_DENOM_ADDED || diagnosticCode === FRA_UNSIMPLIFIED_RESULT;
  return (
    <section
      className={styles.notationCard}
      aria-label={`${fractionLabel(task.left)} ${task.operation} ${fractionLabel(task.right)}`}
      data-smart-fraction-notation
      data-denominator-invariant
    >
      <div className={styles.operationRow}>
        <StaticFraction value={task.left} memberId="same-denom-left" />
        <span className={styles.operator} aria-label={`operator ${task.operation}`}>{task.operation}</span>
        <StaticFraction value={task.right} memberId="same-denom-right" />
        <span className={styles.operator} aria-hidden>=</span>
        {revealResult && result ? (
          <StaticFraction value={result} memberId="same-denom-result" />
        ) : (
          <span className={styles.hiddenResult} aria-label="wynik ukryty do próby">?/ ?</span>
        )}
      </div>

      <div className={styles.denominatorOutline} data-common-denominator-outline>
        <span aria-hidden>⟦</span>
        <b>{task.left.denominator}</b>
        <span>części tej samej wielkości</span>
        <b>{task.right.denominator}</b>
        <span aria-hidden>⟧</span>
      </div>

      {showNumeratorConnector ? (
        <div
          className={styles.numeratorConnector}
          data-connector-from="same-denom-left-numerator"
          data-connector-to="same-denom-right-numerator"
          aria-label={`Łączymy tylko liczniki: ${task.left.numerator} ${task.operation} ${task.right.numerator}`}
        >
          <b>{task.left.numerator}</b>
          <span className={styles.connectorLine} aria-hidden />
          <span className={styles.connectorSymbol} aria-hidden>{task.operation}</span>
          <span className={styles.connectorLine} aria-hidden />
          <b>{task.right.numerator}</b>
          <span>łącznik tylko liczników</span>
        </div>
      ) : null}

      {crossed && submitted ? (
        <div className={styles.correctionTrace} data-cross-out-trace>
          <span className={styles.crossedValue}>{fractionLabel(submitted)}</span>
          <span aria-hidden>→</span>
          <StaticFraction
            value={diagnosticCode === FRA_UNSIMPLIFIED_RESULT ? final : raw}
            memberId="same-denom-correction"
          />
          <span>
            {diagnosticCode === FRA_DENOM_ADDED
              ? "mianownik działania pozostaje bez zmian"
              : "licznik i mianownik dzielimy przez ten sam wspólny dzielnik"}
          </span>
        </div>
      ) : null}
    </section>
  );
}

function ResultEntry({
  task,
  reason,
  requireReason,
  disabled,
  onReasonChange,
  onChecked,
}: {
  task: FractionSameDenominatorPublicTask;
  reason: string;
  requireReason: boolean;
  disabled: boolean;
  onReasonChange: (value: string) => void;
  onChecked: (code: FractionSameDenominatorDiagnosticCode | null, submitted: FractionValue) => void;
}) {
  const [stack, setStack] = useState<FractionStackValue>(blankStack);
  return (
    <section className={styles.entryPanel} aria-label="Pionowy zapis wyniku">
      <FractionStackInput
        value={stack}
        onChange={setStack}
        readOnly={disabled}
        showKeypad={!disabled}
        digitLimit={2}
        stepLabel="Wpisz wynik i zatwierdź"
        ariaLabel="Wynik działania w pionowych kratkach ułamka"
        onSubmit={(parsed) => {
          onChecked(evaluateSameDenominatorAttempt({
            task,
            submitted: parsed.value,
            justification: reason,
            requireJustification: requireReason,
          }), parsed.value);
        }}
      />
      {requireReason && !disabled ? (
        <label className={styles.reasonField}>
          Dlaczego mianownik działania się nie zmienia?
          <textarea
            rows={3}
            value={reason}
            placeholder="Napisz o częściach tej samej wielkości…"
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </label>
      ) : null}
      {!disabled ? (
        <button
          type="button"
          className={styles.checkButton}
          onClick={() => {
            const parsed = parseFractionStackValue(stack);
            if (!parsed.ok) return;
            onChecked(evaluateSameDenominatorAttempt({
              task,
              submitted: parsed.value,
              justification: reason,
              requireJustification: requireReason,
            }), parsed.value);
          }}
        >
          Sprawdź wynik i uzasadnienie
        </button>
      ) : null}
    </section>
  );
}

function RemovedPieces({
  total,
  removed,
  target,
  disabled,
  onRemove,
  onRestore,
}: {
  total: number;
  removed: number;
  target: number;
  disabled: boolean;
  onRemove: () => void;
  onRestore: () => void;
}) {
  return (
    <section className={styles.takeAwayBoard} aria-label="Fizyczne odkładanie kawałków pizzy">
      <div className={styles.pieceTray} aria-label="Kawałki przy pizzy">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={index < removed ? styles.pieceMoved : styles.piece} aria-label={`Kawałek ${index + 1}: ${index < removed ? "odłożony" : "przy pizzy"}`}>🍕</span>
        ))}
      </div>
      <div className={styles.setAsideTray} aria-live="polite">
        <b>Odłożone kawałki</b>
        <span>{removed === 0 ? "Jeszcze żadnego" : Array.from({ length: removed }, () => "🍕").join(" ")}</span>
      </div>
      {!disabled ? (
        <div className={styles.actionButtons}>
          <button type="button" disabled={removed >= target} onClick={onRemove}>Odłóż jeden kawałek</button>
          <button type="button" disabled={removed <= 0} onClick={onRestore}>Przywróć kawałek</button>
        </div>
      ) : null}
      <p>Cel ruchu: odłóż {target} kawałki. Wynik liczbowy pozostaje ukryty, dopóki samodzielnie go nie wpiszesz.</p>
    </section>
  );
}

export interface FractionSameDenominatorLessonModelProps {
  activity: FractionSameDenominatorActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionSameDenominatorLessonModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  ...props
}: FractionSameDenominatorLessonModelProps) {
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicFractionSameDenominatorTask({
    seed: effectiveSeed,
    difficulty: activeDifficulty,
    activity,
  }), [activity, activeDifficulty, effectiveSeed]);
  return (
    <FractionSameDenominatorWorkspace
      key={`${activity}-${effectiveSeed}-${activeDifficulty}`}
      task={task}
      activeDifficulty={activeDifficulty}
      onDifficultyChange={setActiveDifficulty}
      {...props}
    />
  );
}

function FractionSameDenominatorWorkspace({
  task,
  activeDifficulty,
  onDifficultyChange,
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: Omit<FractionSameDenominatorLessonModelProps, "activity" | "seed" | "taskSeed" | "difficulty"> & {
  task: FractionSameDenominatorPublicTask;
  activeDifficulty: LessonDifficulty;
  onDifficultyChange: (difficulty: LessonDifficulty) => void;
}) {
  const controlsLocked = readOnly || presentationMode;
  const [moved, setMoved] = useState(0);
  const [removed, setRemoved] = useState(0);
  const [ruleStep, setRuleStep] = useState(0);
  const [reason, setReason] = useState("");
  const [storyAnswer, setStoryAnswer] = useState("");
  const [diagnosticCode, setDiagnosticCode] = useState<FractionSameDenominatorDiagnosticCode | null>(null);
  const [submitted, setSubmitted] = useState<FractionValue | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const rawResult = applySameDenominatorOperation(task);
  const diagnostic = diagnosticCode
    ? createFractionSameDenominatorDiagnosticResult(diagnosticCode)
    : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSubmitted(null);
    setSuccess(null);
    onResultChange?.(null);
  };

  const report = (code: FractionSameDenominatorDiagnosticCode | null, value: FractionValue, message: string) => {
    setDiagnosticCode(code);
    setSubmitted(value);
    setSuccess(code ? null : message);
    onResultChange?.(code === null, `${fractionLabel(value)}${reason ? ` · ${reason}` : ""}`);
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
      data-fraction-same-denominator-l1
      data-fraction-activity={task.activity}
      data-generator-id={task.generatorId}
      data-difficulty={task.difficulty}
      data-answer-spec="server-only"
      data-no-mixed-numbers
      data-no-borrowing
      data-orientation-contract="portrait-landscape"
    >
      {!onResultChange && !readOnly ? (
        <LessonTaskNavigator
          currentIndex={activeDifficulty === "support" ? 0 : activeDifficulty === "core" ? 1 : 2}
          taskCount={3}
          onPrevious={() => onDifficultyChange(activeDifficulty === "challenge" ? "core" : "support")}
          onNext={() => onDifficultyChange(activeDifficulty === "support" ? "core" : "challenge")}
          previousDisabled={activeDifficulty === "support"}
          nextDisabled={activeDifficulty === "challenge"}
        />
      ) : <p className={styles.variant}>Wariant: {DIFFICULTY_LABELS[task.difficulty]}</p>}

      {task.activity === "same-denom-pizza-add" ? (
        <section className={styles.workspace}>
          <div className={styles.pizzaGrid}>
            <div><b>Na pierwszej pizzy: 2/8</b><FractionCircleModel value={task.left} variant="pizza" label="Pierwsza pizza" /></div>
            <div><b>Do przeniesienia: 3/8</b><FractionCircleModel value={task.right} variant="pizza" label="Druga pizza" /></div>
            <div aria-live="polite"><b>Wspólna pizza po ruchu</b><FractionCircleModel value={{ numerator: task.left.numerator + moved, denominator: 8 }} variant="pizza" label="Połączone kawałki" /></div>
          </div>
          <SmartSameDenominatorNotation task={task} result={{ numerator: task.left.numerator + moved, denominator: 8 }} revealResult={moved === task.right.numerator} showNumeratorConnector={moved === task.right.numerator} />
          {!controlsLocked ? <div className={styles.actionButtons}>
            <button type="button" disabled={moved >= task.right.numerator} onClick={() => { setMoved((value) => Math.min(task.right.numerator, value + 1)); clearResult(); }}>Przenieś jeden kawałek</button>
            <button type="button" disabled={moved === 0} onClick={() => { setMoved(0); clearResult(); }}>Zacznij od nowa</button>
          </div> : null}
          {moved === task.right.numerator ? <p role="status" className={styles.success}>✓ 2/8 + 3/8 = 5/8. Nadal liczymy ósme części.</p> : null}
        </section>
      ) : null}

      {task.activity === "same-denom-rule" ? (
        <section className={styles.workspace}>
          <SmartSameDenominatorNotation task={task} result={rawResult} revealResult={ruleStep >= 2} showNumeratorConnector={ruleStep >= 1} diagnosticCode={diagnosticCode} submitted={submitted} />
          <ol className={styles.ruleSteps} aria-live="polite">
            <li data-active={ruleStep === 0}>1. Obrysuj oba mianowniki: oznaczają ósme części tej samej wielkości.</li>
            <li data-active={ruleStep === 1}>2. Połącz tylko liczniki: 2 + 3.</li>
            <li data-active={ruleStep === 2}>3. Odczytaj 5 ósmych i sprawdź, czy wynik wymaga skrócenia.</li>
          </ol>
          {!controlsLocked ? <div className={styles.actionButtons}>
            <button type="button" disabled={ruleStep === 0} onClick={() => setRuleStep((value) => Math.max(0, value - 1))}>← Poprzedni krok</button>
            <button type="button" disabled={ruleStep === 2} onClick={() => setRuleStep((value) => Math.min(2, value + 1))}>Następny krok →</button>
          </div> : null}
          {!controlsLocked && ruleStep === 2 ? <ResultEntry task={task} reason={reason} requireReason disabled={controlsLocked} onReasonChange={(value) => { setReason(value); clearResult(); }} onChecked={(code, value) => report(code, value, "Wynik i wyjaśnienie niezmiennego mianownika są poprawne.")} /> : null}
        </section>
      ) : null}

      {task.activity === "same-denom-take-away" ? (
        <section className={styles.workspace}>
          <div className={styles.sourcePizza}><FractionCircleModel value={task.left} variant="pizza" label="Pizza przed odkładaniem" /></div>
          <RemovedPieces total={task.left.numerator} removed={removed} target={task.right.numerator} disabled={controlsLocked} onRemove={() => { setRemoved((value) => Math.min(task.right.numerator, value + 1)); clearResult(); }} onRestore={() => { setRemoved((value) => Math.max(0, value - 1)); clearResult(); }} />
          <SmartSameDenominatorNotation task={task} result={submitted ?? undefined} revealResult={submitted !== null} showNumeratorConnector={submitted !== null} diagnosticCode={diagnosticCode} submitted={submitted} />
          {removed === task.right.numerator ? (
            <ResultEntry task={task} reason="" requireReason={false} disabled={controlsLocked} onReasonChange={() => undefined} onChecked={(code, value) => report(code, value, "Odłożono trzy kawałki, a zapis poprawnie opisuje pozostałą część.")} />
          ) : <p className={styles.hiddenPrompt}>Najpierw odłóż wszystkie wskazane kawałki. Pole wyniku pojawi się dopiero wtedy.</p>}
        </section>
      ) : null}

      {task.activity === "same-denom-bakery" ? (
        <section className={styles.workspace}>
          <div className={styles.storyCard}>
            <span aria-hidden>🥐</span>
            <p>Na festyn piekarnia przygotowała rano <b>3/10 tacy</b> drożdżówek, a po południu jeszcze <b>4/10 tacy</b>. Jaką część tacy przygotowano razem?</p>
          </div>
          <SmartSameDenominatorNotation task={task} result={rawResult} revealResult={false} />
          {!controlsLocked ? <label className={styles.reasonField}>Odpowiedź pełnym zdaniem
            <textarea rows={3} value={storyAnswer} placeholder="Piekarnia przygotowała razem…" onChange={(event) => { setStoryAnswer(event.target.value); clearResult(); }} />
          </label> : null}
          <ResultEntry task={task} reason="" requireReason={false} disabled={controlsLocked} onReasonChange={() => undefined} onChecked={(code, value) => {
            const hasSentence = storyAnswer.trim().length >= 18 && /piekarn|tac|drożdż/u.test(storyAnswer.toLocaleLowerCase("pl-PL"));
            report(code ?? (hasSentence ? null : FRACTION_FEEDBACK_CODES.wrongOperationPair), value, "Piekarnia przygotowała razem 7/10 tacy drożdżówek.");
          }} />
        </section>
      ) : null}

      {task.activity === "same-denom-independent" ? (
        <section className={styles.workspace}>
          <SmartSameDenominatorNotation task={task} result={submitted ?? undefined} revealResult={submitted !== null} showNumeratorConnector={submitted !== null} diagnosticCode={diagnosticCode} submitted={submitted} />
          <p className={styles.rule}>Najpierw wykonaj działanie na licznikach przy niezmiennym mianowniku. Potem osobno sprawdź, czy wynik można skrócić.</p>
          <ResultEntry task={task} reason={reason} requireReason disabled={controlsLocked} onReasonChange={(value) => { setReason(value); clearResult(); }} onChecked={(code, value) => report(code, value, "Działanie, skrócenie i uzasadnienie są poprawne.")} />
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
