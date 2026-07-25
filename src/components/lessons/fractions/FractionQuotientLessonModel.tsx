"use client";

import { useMemo, useState } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { FractionCircleModel } from "@/components/lessons/fractions/FractionCircleModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  areEquivalentFractions,
  parseFractionStackValue,
} from "@/lib/math/fractions";
import {
  FRACTION_QUOTIENT_CONTEXT_CODE,
  createFractionQuotientDiagnosticResult,
  createPublicFractionQuotientTask,
  quotientFraction,
  quotientMixedNumber,
  validateFairShare,
  validateQuotientNotation,
} from "@/lib/math/fractions/fractionQuotientLesson";
import type {
  FractionQuotientActivity,
  FractionQuotientDiagnosticCode,
} from "@/lib/math/fractions/fractionQuotientLesson";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  FractionDigit,
  FractionStackValue,
  MixedFractionValue,
} from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionQuotientLesson.module.css";

const ACTIVITY_TITLES: Record<FractionQuotientActivity, string> = {
  "fair-share": "Podziel sprawiedliwie",
  "two-notations": "Dwa zapisy tej samej sytuacji",
  "realtime-quotient": "Ile dostaje jedna osoba?",
  "zero-divisor": "Czy zawsze można dzielić?",
  "zoo-banquet": "Bankiet w zoo",
  "independent-context": "Ułamek jako wynik dzielenia",
};

function blankFractionStack(showWholePart = false): FractionStackValue {
  return {
    wholePart: showWholePart ? [""] : undefined,
    numerator: [""],
    denominator: [""],
  };
}

function stackPartNumber(part: FractionDigit[] | undefined): number | null {
  if (!part?.length || part.some((digit) => digit === "")) return null;
  const value = Number(part.join(""));
  return Number.isSafeInteger(value) ? value : null;
}

function stackLabel(value: FractionStackValue): string {
  const whole = value.wholePart?.join("") ?? "";
  return `${whole ? `${whole} ` : ""}${value.numerator.join("")}/${value.denominator.join("")}`;
}

function mixedLabel(value: MixedFractionValue): string {
  if (value.numerator === 0) return String(value.wholePart);
  return `${value.wholePart} ${value.numerator}/${value.denominator}`;
}

function exactMixedStack(value: FractionStackValue, expected: MixedFractionValue): boolean {
  return stackPartNumber(value.wholePart) === expected.wholePart
    && stackPartNumber(value.numerator) === expected.numerator
    && stackPartNumber(value.denominator) === expected.denominator;
}

function parserDiagnostic(value: FractionStackValue): FractionQuotientDiagnosticCode | null {
  const parsed = parseFractionStackValue(value);
  if (parsed.ok) return null;
  return parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
    ? FRACTION_FEEDBACK_CODES.zeroDenominator
    : FRACTION_FEEDBACK_CODES.emptyPart;
}

function StaticFraction({ numerator, denominator, label }: { numerator: number; denominator: number; label: string }) {
  return (
    <span className={styles.staticFraction} aria-label={`${label}: ${numerator}/${denominator}`}>
      <span data-quotient-numerator>{numerator}</span>
      <span className={styles.fractionBar} aria-hidden />
      <span data-quotient-denominator>{denominator}</span>
    </span>
  );
}

function QuotientEquation({ dividend, divisor }: { dividend: number; divisor: number }) {
  const quotient = quotientFraction(dividend, divisor);
  return (
    <div className={styles.equation} aria-label={quotient
      ? `${dividend} podzielić przez ${divisor} równa się ${dividend}/${divisor}`
      : `${dividend} podzielić przez zero — działanie niewykonalne`}>
      <span data-quotient-dividend>{dividend}</span>
      <span aria-hidden>:</span>
      <span data-quotient-divisor>{divisor}</span>
      <span aria-hidden>=</span>
      {quotient
        ? <StaticFraction numerator={quotient.numerator} denominator={quotient.denominator} label="Iloraz jako ułamek" />
        : <strong className="rounded-xl border-2 border-amber-500 bg-amber-50 px-3 py-2 text-base">brak ilorazu</strong>}
    </div>
  );
}

export interface FractionQuotientLessonModelProps {
  activity: FractionQuotientActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionQuotientLessonModel(props: FractionQuotientLessonModelProps) {
  const effectiveSeed = props.taskSeed ?? props.seed;
  return (
    <FractionQuotientLessonActivityModel
      key={`${props.activity}-${effectiveSeed}-${props.difficulty ?? "core"}`}
      {...props}
    />
  );
}

function FractionQuotientLessonActivityModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: FractionQuotientLessonModelProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicFractionQuotientTask({
    seed: effectiveSeed,
    difficulty,
    activity,
  }), [activity, difficulty, effectiveSeed]);
  const controlsLocked = readOnly || (presentationMode && activity === "independent-context");
  const [diagnosticCode, setDiagnosticCode] = useState<FractionQuotientDiagnosticCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [cutComplete, setCutComplete] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<(number | null)[]>(
    () => Array.from({ length: task.dividend * Math.max(1, task.divisor) }, () => null),
  );

  const [transitionStep, setTransitionStep] = useState(readOnly ? 2 : 0);
  const [motionPaused, setMotionPaused] = useState(false);
  const [notationStack, setNotationStack] = useState<FractionStackValue>(() => blankFractionStack());

  const [liveDividend, setLiveDividend] = useState(task.dividend);
  const [liveDivisor, setLiveDivisor] = useState(Math.max(1, task.divisor));
  const [zeroDivisor, setZeroDivisor] = useState(0);

  const [improperStack, setImproperStack] = useState<FractionStackValue>(() => blankFractionStack());
  const [mixedStack, setMixedStack] = useState<FractionStackValue>(() => blankFractionStack(true));
  const [contextObjects, setContextObjects] = useState("");
  const [contextRecipients, setContextRecipients] = useState("");
  const [contextExplanation, setContextExplanation] = useState("");

  const diagnostic = diagnosticCode
    ? createFractionQuotientDiagnosticResult(diagnosticCode)
    : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const reportFailure = (code: FractionQuotientDiagnosticCode, answerLabel?: string) => {
    setDiagnosticCode(code);
    setSuccessMessage(null);
    onResultChange?.(false, answerLabel);
  };

  const reportSuccess = (message: string, answerLabel: string) => {
    setDiagnosticCode(null);
    setSuccessMessage(message);
    onResultChange?.(true, answerLabel);
  };

  const assignSelectedPiece = (personIndex: number) => {
    if (selectedPiece === null) return;
    setAssignments((current) => current.map((assignment, index) => (
      index === selectedPiece ? personIndex : assignment
    )));
    setSelectedPiece(null);
    clearResult();
  };

  const checkFairShare = () => {
    const validation = validateFairShare(assignments, 2, 5);
    if (validation.status === "incorrect") {
      reportFailure(validation.code, `osoba 1: ${validation.counts[0]}, osoba 2: ${validation.counts[1]}, nierozdane: ${validation.unassigned}`);
      return;
    }
    reportSuccess(
      "Wykorzystano wszystkie części. Każda osoba otrzymała 5 połówek, czyli 5/2 = 2 1/2 placka.",
      "po 5 połówek = 5/2 = 2 1/2 placka",
    );
  };

  const checkNotation = () => {
    const parserCode = parserDiagnostic(notationStack);
    if (parserCode) {
      reportFailure(parserCode, stackLabel(notationStack));
      return;
    }
    const parsed = parseFractionStackValue(notationStack);
    if (!parsed.ok) return;
    const code = validateQuotientNotation(5, 2, parsed.value);
    if (code) {
      reportFailure(code, stackLabel(notationStack));
      return;
    }
    reportSuccess("Dzielna 5 została licznikiem, a dzielnik 2 — mianownikiem.", "5 : 2 = 5/2");
  };

  const updateLiveDividend = (value: number) => {
    setLiveDividend(Math.max(task.controls.dividendMin, Math.min(task.controls.dividendMax, Math.trunc(value))));
    clearResult();
  };

  const updateLiveDivisor = (value: number) => {
    setLiveDivisor(Math.max(task.controls.divisorMin, Math.min(task.controls.divisorMax, Math.trunc(value))));
    clearResult();
  };

  const checkZeroCondition = () => {
    if (zeroDivisor === 0) {
      reportFailure(FRACTION_FEEDBACK_CODES.zeroDenominator, "5 : 0");
      return;
    }
    reportSuccess("Po zmianie liczby osób na dodatnią dzielenie ma określony wynik.", `5 : ${zeroDivisor}`);
  };

  const checkCompoundAnswer = () => {
    const improperParserCode = parserDiagnostic(improperStack);
    if (improperParserCode) {
      reportFailure(improperParserCode, stackLabel(improperStack));
      return;
    }
    const mixedParserCode = parserDiagnostic(mixedStack);
    if (mixedParserCode) {
      reportFailure(mixedParserCode, stackLabel(mixedStack));
      return;
    }
    const improperParsed = parseFractionStackValue(improperStack);
    const mixedParsed = parseFractionStackValue(mixedStack);
    if (!improperParsed.ok || !mixedParsed.ok || !task.quotient || !task.mixed) return;

    const notationCode = validateQuotientNotation(task.dividend, task.divisor, improperParsed.value);
    if (notationCode) {
      reportFailure(notationCode, stackLabel(improperStack));
      return;
    }
    if (!areEquivalentFractions(mixedParsed.value, task.quotient)) {
      reportFailure(FRACTION_FEEDBACK_CODES.notEquivalent, stackLabel(mixedStack));
      return;
    }
    if (!exactMixedStack(mixedStack, task.mixed)) {
      reportFailure(FRACTION_QUOTIENT_CONTEXT_CODE, stackLabel(mixedStack));
      return;
    }

    const contextIsComplete = activity !== "independent-context"
      ? contextExplanation.trim().length >= 12
      : contextObjects.trim().length >= 2
        && contextRecipients.trim().length >= 2
        && contextExplanation.trim().length >= 20;
    if (!contextIsComplete) {
      reportFailure(FRACTION_QUOTIENT_CONTEXT_CODE, contextExplanation);
      return;
    }

    const message = activity === "zoo-banquet"
      ? "Każdy z 4 opiekunów otrzymuje 11/4, czyli 2 3/4 porcji."
      : "Kontekst zachowuje kolejność 13 : 6 i wyjaśnia, że jedna grupa otrzymuje 13/6, czyli 2 1/6 całości.";
    reportSuccess(message, `${task.dividend}:${task.divisor}=${stackLabel(improperStack)}=${stackLabel(mixedStack)}; ${contextExplanation}`);
  };

  const liveQuotient = quotientFraction(liveDividend, liveDivisor)!;
  const liveMixed = quotientMixedNumber(liveDividend, liveDivisor)!;

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName="space-y-4"
      eyebrow="Dział 3 · Ułamek jako iloraz"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-fraction-quotient-lesson
      data-fraction-activity={activity}
      data-orientation-contract="portrait-landscape"
      data-generator-id={task.generatorId}
      data-seed={effectiveSeed}
      data-difficulty={difficulty}
    >
      {activity === "fair-share" ? (
        <div className="space-y-4">
          <div className={styles.wholeGrid} aria-label="Pięć identycznych placków przed podziałem">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={styles.wholeFlatbread} role="img" aria-label={`Placek ${index + 1} z 5`} />
            ))}
          </div>
          {!controlsLocked ? (
            <InteractionAlternativePanel
              title="Wybierz → umieść"
              instruction="Najpierw pokrój każdy placek na pół. Potem wybieraj połówki i umieszczaj je kolejno u wybranej osoby. Ta metoda działa dotykiem i klawiaturą."
            >
              <button
                type="button"
                className={`${styles.touchTarget} rounded-xl bg-teal-800 px-4 font-black text-white`}
                onClick={() => { setCutComplete(true); clearResult(); }}
              >
                Pokrój 5 placków na połówki
              </button>
              {cutComplete ? (
                <div className="w-full space-y-3">
                  <div className={styles.pieceTray} aria-label="Połówki do rozdania">
                    {assignments.map((assignment, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`${styles.piece} ${selectedPiece === index ? styles.selectedPiece : ""}`}
                        aria-pressed={selectedPiece === index}
                        aria-label={`Połówka ${index + 1}: ${assignment === null ? "do umieszczenia" : `u osoby ${assignment + 1}`}`}
                        data-share-piece={index}
                        data-assignment={assignment ?? "unassigned"}
                        onClick={() => setSelectedPiece(index)}
                      >
                        ½ <span>{assignment === null ? "do rozdania" : `os. ${assignment + 1}`}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1].map((personIndex) => (
                      <button
                        key={personIndex}
                        type="button"
                        className={`${styles.personTarget} ${styles.touchTarget}`}
                        disabled={selectedPiece === null}
                        aria-label={`Umieść wybrany kawałek u osoby ${personIndex + 1}`}
                        onClick={() => assignSelectedPiece(personIndex)}
                      >
                        Osoba {personIndex + 1}
                        <strong>{assignments.filter((assignment) => assignment === personIndex).length} połówek</strong>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <button type="button" className={`${styles.touchTarget} w-full rounded-xl bg-slate-950 px-4 font-black text-white`} onClick={checkFairShare}>
                Sprawdź sprawiedliwy podział
              </button>
            </InteractionAlternativePanel>
          ) : null}
          <QuotientEquation dividend={5} divisor={2} />
        </div>
      ) : null}

      {activity === "two-notations" ? (
        <div className="space-y-4">
          <section className={`${styles.transitionBoard} ${motionPaused ? styles.motionPaused : ""}`} aria-label="Przejście z dzielenia do ułamka">
            <div className={styles.divisionNotation}>
              <span data-role="dividend">5<strong>dzielna</strong></span>
              <span aria-hidden>:</span>
              <span data-role="divisor">2<strong>dzielnik</strong></span>
            </div>
            {transitionStep >= 1 ? (
              <div className={styles.animatedFraction} data-transition-fraction>
                <span aria-hidden>=</span>
                <StaticFraction numerator={5} denominator={2} label="Ten sam iloraz" />
                <div className={styles.roleLabels}>
                  <span>5: dzielna → licznik</span>
                  <span>2: dzielnik → mianownik</span>
                </div>
              </div>
            ) : <p className="font-semibold text-slate-600">Najpierw nazwij dzielną i dzielnik.</p>}
            {transitionStep >= 2 ? <p className="rounded-xl bg-teal-50 p-3 font-black text-teal-950">5 : 2 oraz 5/2 opisują ten sam sprawiedliwy podział.</p> : null}
          </section>
          {!controlsLocked ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={`${styles.touchTarget} rounded-xl border-2 border-slate-300 bg-white px-4 font-black`} disabled={transitionStep === 0} onClick={() => setTransitionStep((step) => Math.max(0, step - 1))}>← Poprzedni krok</button>
              <button type="button" className={`${styles.touchTarget} rounded-xl bg-teal-800 px-4 font-black text-white`} disabled={transitionStep === 2} onClick={() => setTransitionStep((step) => Math.min(2, step + 1))}>Pokaż następny krok →</button>
              <button type="button" aria-pressed={motionPaused} className={`${styles.touchTarget} rounded-xl border-2 border-violet-300 bg-violet-50 px-4 font-black`} onClick={() => setMotionPaused((paused) => !paused)}>{motionPaused ? "Włącz ruch" : "Zatrzymaj ruch"}</button>
            </div>
          ) : null}
          <div className={styles.answerCard}>
            <FractionStackInput value={notationStack} onChange={(value) => { setNotationStack(value); clearResult(); }} readOnly={controlsLocked} stepLabel="Zapisz iloraz pionowym ułamkiem" onSubmit={() => checkNotation()} />
            {!controlsLocked ? <button type="button" className={`${styles.touchTarget} mt-3 w-full rounded-xl bg-slate-950 px-4 font-black text-white`} onClick={checkNotation}>Sprawdź kolejność liczb</button> : null}
          </div>
        </div>
      ) : null}

      {activity === "realtime-quotient" ? (
        <div className={styles.workspace}>
          <div className="space-y-4">
            {!controlsLocked ? (
              <InteractionAlternativePanel title="Zmieniaj dane" instruction="Suwaki działają dotykiem, myszą i strzałkami klawiatury. Każda zmiana natychmiast aktualizuje model i oba zapisy.">
                <label className="grid w-full gap-1 font-black">
                  Liczba obiektów: {liveDividend}
                  <input type="range" min={task.controls.dividendMin} max={task.controls.dividendMax} step={1} value={liveDividend} aria-label="Liczba obiektów" className={styles.range} onChange={(event) => updateLiveDividend(Number(event.target.value))} />
                </label>
                <label className="grid w-full gap-1 font-black">
                  Liczba osób: {liveDivisor}
                  <input type="range" min={task.controls.divisorMin} max={task.controls.divisorMax} step={1} value={liveDivisor} aria-label="Liczba osób" className={styles.range} onChange={(event) => updateLiveDivisor(Number(event.target.value))} />
                </label>
              </InteractionAlternativePanel>
            ) : null}
            <div data-live-quotient>
              <QuotientEquation dividend={liveDividend} divisor={liveDivisor} />
              <p className="mt-3 text-center font-black">Jedna osoba dostaje {mixedLabel(liveMixed)} całości.</p>
            </div>
          </div>
          <FractionCircleModel value={liveQuotient} variant="circle" label={`Udział jednej osoby: ${liveDividend}/${liveDivisor}`} />
        </div>
      ) : null}

      {activity === "zero-divisor" ? (
        <div className="space-y-4">
          <QuotientEquation dividend={5} divisor={zeroDivisor} />
          <div className="rounded-2xl border-4 border-amber-400 bg-amber-50 p-4 text-center">
            <p className="text-lg font-black">Warunek: dzielnik i mianownik muszą być większe od 0.</p>
            <p className="mt-2 font-semibold">Przy 0 osobach nie istnieje „udział jednej osoby”, więc nie tworzymy ułamka 5/0.</p>
          </div>
          {!controlsLocked ? (
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" aria-pressed={zeroDivisor === 0} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black`} onClick={() => { setZeroDivisor(0); clearResult(); }}>0 osób</button>
              <button type="button" aria-pressed={zeroDivisor === 1} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black`} onClick={() => { setZeroDivisor(1); clearResult(); }}>1 osoba</button>
              <button type="button" className={`${styles.touchTarget} rounded-xl bg-slate-950 px-4 font-black text-white`} onClick={checkZeroCondition}>Sprawdź warunek</button>
            </div>
          ) : null}
        </div>
      ) : null}

      {activity === "zoo-banquet" || activity === "independent-context" ? (
        <div className="space-y-4">
          {activity === "zoo-banquet" ? (
            <div className={styles.workspace}>
              <div className={styles.portionGrid} aria-label="Jedenaście równych porcji karmy">
                {Array.from({ length: 11 }, (_, index) => <span key={index} aria-label={`Porcja ${index + 1} z 11`}>{index + 1}</span>)}
              </div>
              {task.quotient ? <FractionCircleModel value={task.quotient} variant="circle" label="Udział jednego opiekuna" /> : null}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4">
              <QuotientEquation dividend={13} divisor={6} />
              <p className="mt-3 font-semibold">Podpowiedź kontekstowa dla tego seedu: {task.context.suggestion}</p>
            </div>
          )}
          <div className={styles.stackGrid}>
            <div className={styles.answerCard}>
              <p className="mb-2 text-center font-black">Iloraz jako ułamek</p>
              <FractionStackInput value={improperStack} onChange={(value) => { setImproperStack(value); clearResult(); }} readOnly={controlsLocked} stepLabel={`${task.dividend} : ${task.divisor} jako ułamek`} />
            </div>
            <div className={styles.answerCard}>
              <p className="mb-2 text-center font-black">Wynik jako liczba mieszana</p>
              <FractionStackInput value={mixedStack} onChange={(value) => { setMixedStack(value); clearResult(); }} readOnly={controlsLocked} showWholePart stepLabel="Zapisz udział jednej osoby lub grupy" />
            </div>
          </div>
          <div className={styles.answerCard}>
            {activity === "independent-context" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 font-black">Co dzielisz?
                  <input value={contextObjects} className={styles.textInput} placeholder="np. 13 arbuzów" onChange={(event) => { setContextObjects(event.target.value); clearResult(); }} />
                </label>
                <label className="grid gap-1 font-black">Między kogo lub co?
                  <input value={contextRecipients} className={styles.textInput} placeholder="np. 6 stołów" onChange={(event) => { setContextRecipients(event.target.value); clearResult(); }} />
                </label>
              </div>
            ) : null}
            <label className="mt-3 grid gap-1 font-black">
              {activity === "zoo-banquet" ? "Wyjaśnij wynik dla jednego opiekuna" : "Napisz pełne polecenie i wyjaśnij wynik dla jednej grupy"}
              <textarea value={contextExplanation} className={styles.textArea} rows={3} onChange={(event) => { setContextExplanation(event.target.value); clearResult(); }} />
            </label>
            {!controlsLocked ? <button type="button" className={`${styles.touchTarget} mt-3 w-full rounded-xl bg-teal-800 px-4 font-black text-white`} onClick={checkCompoundAnswer}>{activity === "zoo-banquet" ? "Sprawdź bankiet" : "Sprawdź zapis i interpretację"}</button> : null}
          </div>
        </div>
      ) : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnostic ? (
        onResultChange ? (
          <DiagnosticFeedbackPanel
            result={toPublicLessonGradeResult(diagnostic.result)}
            copy={diagnostic.copy}
            highlights={diagnostic.highlights}
            mode="assessment"
            submitted={false}
          />
        ) : (
          <DiagnosticFeedbackPanel
            result={toPublicLessonGradeResult(diagnostic.result)}
            copy={diagnostic.copy}
            highlights={diagnostic.highlights}
            mode="practice"
            submitted
          />
        )
      ) : null}
    </LessonTaskFrame>
  );
}
