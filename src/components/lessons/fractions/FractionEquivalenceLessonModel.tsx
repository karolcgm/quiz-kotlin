"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionOperationDirector } from "@/components/lessons/fractions/FractionOperationDirector";
import type { FractionOperationStep } from "@/components/lessons/fractions/FractionOperationDirector";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  createFractionEquivalenceDiagnosticResult,
  createPublicFractionEquivalenceTask,
  expandFraction,
  FRACTION_EQUIVALENCE_REASON_CODE,
  parseDivisorPath,
  validateEquivalentChainEntry,
  validateEquivalentTransformation,
  validateSimplificationPath,
} from "@/lib/math/fractions/fractionEquivalenceLesson";
import type {
  FractionEquivalenceActivity,
  FractionEquivalenceDiagnosticCode,
} from "@/lib/math/fractions/fractionEquivalenceLesson";
import { parseFractionStackValue } from "@/lib/math/fractions";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionStackValue, FractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionEquivalenceLesson.module.css";

const ACTIVITY_TITLES: Record<FractionEquivalenceActivity, string> = {
  "denser-partition": "Ta sama część, gęstszy podział",
  "expansion-grid": "Rozszerzanie w kratkach",
  "collapse-partition": "Zwiń podział",
  "cross-out-rewrite": "Przekreśl i zapisz",
  "equivalent-chain": "Łańcuch równoważnych ułamków",
  "paint-lab": "Laboratorium farb",
  "independent-equivalence": "Samodzielna próba",
  "independent-simplification": "Samodzielne skracanie",
};

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Start",
  core: "Dalej",
  challenge: "Mistrzowskie",
};

function blankStack(denominator?: number): FractionStackValue {
  return {
    numerator: [""],
    denominator: denominator === undefined
      ? [""]
      : String(denominator).split("") as FractionStackValue["denominator"],
  };
}

function stackText(value: FractionStackValue): string {
  return `${value.numerator.join("")}/${value.denominator.join("")}`;
}

function parserCode(value: FractionStackValue): FractionEquivalenceDiagnosticCode | null {
  const parsed = parseFractionStackValue(value);
  if (parsed.ok) return null;
  return parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
    ? FRACTION_FEEDBACK_CODES.zeroDenominator
    : FRACTION_FEEDBACK_CODES.emptyPart;
}

function StaticFraction({ value, label }: { value: FractionValue; label: string }) {
  return (
    <span className={styles.staticFraction} aria-label={`${label}: ${value.numerator}/${value.denominator}`}>
      <span>{value.numerator}</span>
      <span className={styles.staticLine} aria-hidden />
      <span>{value.denominator}</span>
    </span>
  );
}

function EquivalentNumberLine({ fractions }: { fractions: FractionValue[] }) {
  const positions = fractions.map((value) => value.numerator / value.denominator);
  const position = positions[0]!;
  const valuesArePreserved = positions.every((value) => Math.abs(value - position) < Number.EPSILON);
  return (
    <div data-equivalent-axis data-value-preserved={valuesArePreserved} data-fraction-position={position.toFixed(6)}>
      <AccessibleMathSvg
        title={valuesArePreserved ? "Równoważne ułamki na wspólnej osi" : "Porównanie wartości ułamków na osi"}
        description={`${fractions.map((value) => `${value.numerator}/${value.denominator}`).join(" i ")} wskazują ${valuesArePreserved ? "ten sam" : "różne"} punkt osi od 0 do 1.`}
        viewBox="0 0 420 150"
        className="h-auto w-full"
        columns={[
          { key: "fraction", label: "Ułamek" },
          { key: "position", label: "Położenie na osi" },
        ]}
        rows={fractions.map((value) => ({
          fraction: `${value.numerator}/${value.denominator}`,
          position: value.numerator / value.denominator,
        }))}
      >
        <line x1="42" y1="82" x2="378" y2="82" stroke="#0f172a" strokeWidth="4" />
        <line x1="42" y1="69" x2="42" y2="96" stroke="#0f172a" strokeWidth="3" />
        <line x1="378" y1="69" x2="378" y2="96" stroke="#0f172a" strokeWidth="3" />
        <text x="42" y="122" textAnchor="middle" fill="#0f172a" fontWeight="800">0</text>
        <text x="378" y="122" textAnchor="middle" fill="#0f172a" fontWeight="800">1</text>
        {fractions.map((value, index) => {
          const x = 42 + (value.numerator / value.denominator) * 336;
          return (
          <g key={`${value.numerator}-${value.denominator}`} data-axis-fraction={`${value.numerator}/${value.denominator}`}>
            <circle cx={x} cy={72 - index * 14} r="8" fill={index % 2 ? "#0891b2" : "#4f46e5"} stroke="#fff" strokeWidth="3" />
            <text x={x + 13} y={68 - index * 14} fill="#0f172a" fontSize="13" fontWeight="900">
              {value.numerator}/{value.denominator}
            </text>
          </g>
          );
        })}
      </AccessibleMathSvg>
    </div>
  );
}

function PairBadge({
  label,
  value,
  symbol,
  pattern,
}: {
  label: string;
  value: number;
  symbol: string;
  pattern: "solid" | "dashed";
}) {
  return (
    <span className={`${styles.pairBadge} ${pattern === "dashed" ? styles.pairDashed : ""}`} data-pair-symbol={symbol}>
      <span className="text-xs font-black uppercase tracking-wide">{label}</span>
      <strong>{symbol}{value}</strong>
    </span>
  );
}

export interface FractionEquivalenceLessonModelProps {
  activity: FractionEquivalenceActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionEquivalenceLessonModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: FractionEquivalenceLessonModelProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(() => createPublicFractionEquivalenceTask({
    seed: effectiveSeed,
    difficulty: activeDifficulty,
    activity,
  }), [activeDifficulty, activity, effectiveSeed]);
  const [denseMultiplier, setDenseMultiplier] = useState(2);
  const [numeratorFactor, setNumeratorFactor] = useState(task.factor);
  const [denominatorFactor, setDenominatorFactor] = useState(task.factor);
  const [expansionStack, setExpansionStack] = useState<FractionStackValue>(() => blankStack());
  const [collapseNumeratorDivisor, setCollapseNumeratorDivisor] = useState(String(task.factor));
  const [collapseDenominatorDivisor, setCollapseDenominatorDivisor] = useState(String(task.factor));
  const [collapseStack, setCollapseStack] = useState<FractionStackValue>(() => blankStack());
  const [chainStack, setChainStack] = useState<FractionStackValue>(() => blankStack(9));
  const [reason, setReason] = useState("");
  const [wallDivision, setWallDivision] = useState(5);
  const [numeratorPath, setNumeratorPath] = useState("");
  const [denominatorPath, setDenominatorPath] = useState("");
  const [finalStack, setFinalStack] = useState<FractionStackValue>(() => blankStack());
  const [diagnosticCode, setDiagnosticCode] = useState<FractionEquivalenceDiagnosticCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);

  const independentActivity = activity === "independent-equivalence" || activity === "independent-simplification";
  const controlsLocked = readOnly || presentationMode && independentActivity;
  const diagnostic = diagnosticCode
    ? createFractionEquivalenceDiagnosticResult(diagnosticCode)
    : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const fail = (code: FractionEquivalenceDiagnosticCode, answerLabel?: string) => {
    setDiagnosticCode(code);
    setSuccessMessage(null);
    onResultChange?.(false, answerLabel);
  };

  const succeed = (message: string, answerLabel?: string) => {
    setDiagnosticCode(null);
    setSuccessMessage(message);
    onResultChange?.(true, answerLabel);
  };

  const chooseDifficulty = (next: LessonDifficulty) => {
    const nextTask = createPublicFractionEquivalenceTask({ seed: effectiveSeed, difficulty: next, activity });
    setActiveDifficulty(next);
    setNumeratorFactor(nextTask.factor);
    setDenominatorFactor(nextTask.factor);
    setExpansionStack(blankStack());
    setNumeratorPath("");
    setDenominatorPath("");
    setFinalStack(blankStack());
    setReason("");
    clearResult();
  };

  const denseResult = expandFraction(task.source, denseMultiplier);
  const collapseNumerator = Number(collapseNumeratorDivisor);
  const collapseDenominator = Number(collapseDenominatorDivisor);
  const collapsePreview = Number.isSafeInteger(collapseNumerator)
      && Number.isSafeInteger(collapseDenominator)
      && collapseNumerator > 0
      && collapseDenominator > 0
      && task.source.numerator % collapseNumerator === 0
      && task.source.denominator % collapseDenominator === 0
    ? {
        numerator: task.source.numerator / collapseNumerator,
        denominator: task.source.denominator / collapseDenominator,
      }
    : task.source;

  const crossOutSteps = useMemo<FractionOperationStep[]>(() => [
    {
      id: "choose-common-divisor",
      label: `Wybierz wspólny dzielnik ${task.factor}`,
      explanation: `Licznik ${task.source.numerator} i mianownik ${task.source.denominator} tworzą jedną aktywną parę. Obie liczby dzielimy przez ${task.factor}.`,
      highlights: [{
        id: "same-divisor-pair",
        kind: "pair",
        memberIds: ["before-numerator", "before-denominator"],
        label: `wspólny dzielnik ${task.factor}`,
        state: "active",
        pattern: "double",
        symbol: `÷${task.factor}`,
        accent: "cyan",
      }],
      connectors: [{
        id: "vertical-divisor-pair",
        fromId: "before-numerator",
        toId: "before-denominator",
        label: `Ta sama liczba ${task.factor} działa na górę i dół ułamka`,
        symbol: `÷${task.factor}`,
        pattern: "double",
        accent: "cyan",
      }],
    },
    {
      id: "cross-out-and-write",
      label: "Przekreśl stare liczby i zapisz nowe obok",
      explanation: "Stary licznik i mianownik pozostają czytelne. Nowe wartości pojawiają się w małych kratkach obok, a wartość ułamka się nie zmienia.",
      crossOuts: [
        { memberId: "before-numerator", oldValue: task.source.numerator, newValue: task.result.numerator, label: `Podzielono przez ${task.factor}` },
        { memberId: "before-denominator", oldValue: task.source.denominator, newValue: task.result.denominator, label: `Podzielono przez ${task.factor}` },
      ],
      connectors: [
        { id: "new-numerator", fromId: "before-numerator", toId: "after-numerator", label: `${task.source.numerator} ÷ ${task.factor} = ${task.result.numerator}`, symbol: "N", pattern: "solid", accent: "indigo" },
        { id: "new-denominator", fromId: "before-denominator", toId: "after-denominator", label: `${task.source.denominator} ÷ ${task.factor} = ${task.result.denominator}`, symbol: "M", pattern: "dashed", accent: "violet" },
      ],
    },
  ], [task.factor, task.result.denominator, task.result.numerator, task.source.denominator, task.source.numerator]);

  const checkExpansion = () => {
    const code = parserCode(expansionStack);
    if (code) return fail(code, stackText(expansionStack));
    const parsed = parseFractionStackValue(expansionStack);
    if (!parsed.ok) return;
    const validation = validateEquivalentTransformation({
      source: task.source,
      result: parsed.value,
      mode: "expand",
      numeratorFactor,
      denominatorFactor,
    });
    if (validation) return fail(validation, stackText(expansionStack));
    succeed("Obie liczby pomnożono przez tę samą liczbę. Pole modelu i punkt na osi pozostały bez zmiany.", stackText(expansionStack));
  };

  const checkCollapse = () => {
    const code = parserCode(collapseStack);
    if (code) return fail(code, stackText(collapseStack));
    const parsed = parseFractionStackValue(collapseStack);
    if (!parsed.ok) return;
    const validation = validateEquivalentTransformation({
      source: task.source,
      result: parsed.value,
      mode: "simplify",
      numeratorFactor: collapseNumerator,
      denominatorFactor: collapseDenominator,
    });
    if (validation) return fail(validation, stackText(collapseStack));
    succeed("Sąsiednie części utworzyły równe grupy, a zaznaczone pole nadal przedstawia tę samą wartość.", stackText(collapseStack));
  };

  const checkChain = () => {
    const code = parserCode(chainStack);
    if (code) return fail(code, stackText(chainStack));
    const parsed = parseFractionStackValue(chainStack);
    if (!parsed.ok) return;
    const validation = validateEquivalentChainEntry(task.source, task.factor, parsed.value);
    if (validation) return fail(validation, stackText(chainStack));
    if (reason.trim().length < 12) return fail(FRACTION_EQUIVALENCE_REASON_CODE, stackText(chainStack));
    succeed("Łańcuch jest poprawny, a uzasadnienie wskazuje niezmienną wartość.", `${stackText(chainStack)}; ${reason.trim()}`);
  };

  const checkIndependent = () => {
    const expansionCode = parserCode(expansionStack);
    if (expansionCode) return fail(expansionCode, stackText(expansionStack));
    const finalCode = parserCode(finalStack);
    if (finalCode) return fail(finalCode, stackText(finalStack));
    const expanded = parseFractionStackValue(expansionStack);
    const final = parseFractionStackValue(finalStack);
    if (!expanded.ok || !final.ok) return;
    const expandValidation = validateEquivalentTransformation({
      source: task.source,
      result: expanded.value,
      mode: "expand",
      numeratorFactor,
      denominatorFactor,
    });
    if (expandValidation) return fail(expandValidation, `${stackText(expansionStack)} → ${stackText(finalStack)}`);
    const simplifyValidation = validateSimplificationPath({
      source: expanded.value,
      result: final.value,
      numeratorDivisors: parseDivisorPath(numeratorPath),
      denominatorDivisors: parseDivisorPath(denominatorPath),
    });
    if (simplifyValidation) return fail(simplifyValidation, `${stackText(expansionStack)} → ${stackText(finalStack)}`);
    if (reason.trim().length < 12) return fail(FRACTION_EQUIVALENCE_REASON_CODE, `${stackText(expansionStack)} → ${stackText(finalStack)}`);
    succeed("Rozszerzenie, dowolna poprawna ścieżka skracania i postać nieskracalna zachowują tę samą wartość.", `${stackText(expansionStack)} → ${stackText(finalStack)}; ${reason.trim()}`);
  };

  const checkIndependentSimplification = () => {
    const finalCode = parserCode(finalStack);
    if (finalCode) return fail(finalCode, stackText(finalStack));
    const final = parseFractionStackValue(finalStack);
    if (!final.ok) return;
    const simplifyValidation = validateSimplificationPath({
      source: task.source,
      result: final.value,
      numeratorDivisors: parseDivisorPath(numeratorPath),
      denominatorDivisors: parseDivisorPath(denominatorPath),
    });
    if (simplifyValidation) return fail(simplifyValidation, `${task.source.numerator}/${task.source.denominator} → ${stackText(finalStack)}`);
    if (reason.trim().length < 12) return fail(FRACTION_EQUIVALENCE_REASON_CODE, stackText(finalStack));
    succeed("Każdy krok używa tego samego wspólnego dzielnika, a końcowy ułamek jest nieskracalny.", `${task.source.numerator}/${task.source.denominator} → ${stackText(finalStack)}; ${reason.trim()}`);
  };

  return (
    <article
      className={styles.lesson}
      data-fraction-equivalence-lesson
      data-fraction-activity={activity}
      data-orientation-contract="portrait-landscape"
      data-generator-id={task.generatorId}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-motion-paused={motionPaused}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Dział 3 · Ułamki zwykłe · L1</p>
          <h2>{ACTIVITY_TITLES[activity]}</h2>
          <p>{task.prompt}</p>
        </div>
        {questionNumber && questionCount ? <b className={styles.questionCount}>Zadanie {questionNumber}/{questionCount}</b> : null}
      </header>

      <div className={styles.topControls}>
        {independentActivity && !onResultChange && !readOnly ? (
          <div className={styles.difficultyControls} aria-label="Wybierz wariant zadania">
            {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
              <button key={level} type="button" aria-pressed={activeDifficulty === level} onClick={() => chooseDifficulty(level)}>
                {DIFFICULTY_LABELS[level]}
              </button>
            ))}
          </div>
        ) : <span className={styles.difficultyLabel}>Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</span>}
        <button type="button" className={styles.motionButton} aria-pressed={motionPaused} onClick={() => setMotionPaused((value) => !value)}>
          {motionPaused ? "Włącz płynne przejścia" : "Zatrzymaj ruch"}
        </button>
      </div>

      {activity === "denser-partition" ? (
        <div className={styles.activityStack}>
          {!controlsLocked ? (
            <InteractionAlternativePanel title="Zagęść podział" instruction="Wybierz 2, 3 albo 4 mniejsze części w każdym dotychczasowym segmencie. Przyciski działają dotykiem i klawiaturą.">
              <div className={styles.choiceRow}>
                {task.controls.multipliers.map((multiplier) => (
                  <button key={multiplier} type="button" aria-pressed={denseMultiplier === multiplier} onClick={() => { setDenseMultiplier(multiplier); clearResult(); }}>
                    Każdy segment × {multiplier}
                  </button>
                ))}
              </div>
            </InteractionAlternativePanel>
          ) : null}
          <div className={styles.modelGrid} data-density-multiplier={denseMultiplier}>
            <FractionBarModel
              bars={[
                { id: "coarse", label: `${task.source.numerator}/${task.source.denominator}`, value: task.source, accent: "indigo" },
                { id: "dense", label: `${denseResult.numerator}/${denseResult.denominator}`, value: denseResult, accent: "cyan" },
              ]}
              overlay
              title="Ta sama część przy gęstszym podziale"
            />
            <EquivalentNumberLine fractions={[task.source, denseResult]} />
          </div>
          <p className={styles.invariant} role="status">{task.source.numerator}/{task.source.denominator} = {denseResult.numerator}/{denseResult.denominator}. Liczba części rośnie, lecz zaznaczone pole i punkt na osi pozostają takie same.</p>
        </div>
      ) : null}

      {activity === "expansion-grid" ? (
        <div className={styles.activityStack}>
          <div className={styles.factorWorkspace}>
            <section className={styles.factorCard} aria-label="Mnożnik licznika">
              <PairBadge label="licznik" value={numeratorFactor} symbol="● ×" pattern="solid" />
              {!controlsLocked ? <div className={styles.compactChoices}>{task.controls.multipliers.map((factor) => <button key={factor} type="button" aria-pressed={numeratorFactor === factor} onClick={() => { setNumeratorFactor(factor); clearResult(); }}>× {factor}</button>)}</div> : null}
            </section>
            <section className={styles.factorCard} aria-label="Mnożnik mianownika">
              <PairBadge label="mianownik" value={denominatorFactor} symbol="● ×" pattern="solid" />
              {!controlsLocked ? <div className={styles.compactChoices}>{task.controls.multipliers.map((factor) => <button key={factor} type="button" aria-pressed={denominatorFactor === factor} onClick={() => { setDenominatorFactor(factor); clearResult(); }}>× {factor}</button>)}</div> : null}
            </section>
            <section className={styles.stackCard}>
              <p>Wpisz wynik w pionowych kratkach</p>
              <FractionStackInput value={expansionStack} onChange={(value) => { setExpansionStack(value); clearResult(); }} readOnly={controlsLocked} stepLabel="Rozszerz licznik i mianownik przez tę samą liczbę" />
              {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkExpansion}>Sprawdź rozszerzenie</button> : null}
            </section>
          </div>
          <FractionOperationDirector
            title="Rozszerzanie licznika i mianownika przez tę samą liczbę"
            operator="="
            items={[
              { id: "source", label: "ułamek początkowy", ...task.source },
              { id: "expanded", label: "ułamek rozszerzony", ...task.result },
            ]}
            steps={[
              {
                id: "numerator-pair",
                label: "Połącz liczniki",
                explanation: `${task.source.numerator} × ${task.factor} = ${task.result.numerator}. Para ma symbol N i linię ciągłą.`,
                connectors: [{ id: "expand-numerator", fromId: "source-numerator", toId: "expanded-numerator", label: `licznik × ${task.factor}`, symbol: "N", pattern: "solid", accent: "indigo" }],
              },
              {
                id: "denominator-pair",
                label: "Połącz mianowniki tą samą liczbą",
                explanation: `${task.source.denominator} × ${task.factor} = ${task.result.denominator}. Ta sama liczba zachowuje wartość ułamka.`,
                connectors: [
                  { id: "expand-numerator-again", fromId: "source-numerator", toId: "expanded-numerator", label: `licznik × ${task.factor}`, symbol: "N", pattern: "solid", accent: "indigo" },
                  { id: "expand-denominator", fromId: "source-denominator", toId: "expanded-denominator", label: `mianownik × ${task.factor}`, symbol: "M", pattern: "dashed", accent: "violet" },
                ],
              },
            ]}
          />
          <div className={styles.modelGrid}><FractionBarModel bars={[{ id: "expand-source", label: "przed", value: task.source, accent: "indigo" }, { id: "expand-result", label: "po", value: task.result, accent: "violet" }]} /><EquivalentNumberLine fractions={[task.source, task.result]} /></div>
        </div>
      ) : null}

      {activity === "collapse-partition" ? (
        <div className={styles.activityStack}>
          <div className={styles.factorWorkspace}>
            <label className={styles.selectCard}>Dzielnik licznika
              <select aria-label="Dzielnik licznika" value={collapseNumeratorDivisor} disabled={controlsLocked} onChange={(event) => { setCollapseNumeratorDivisor(event.target.value); clearResult(); }}>
                {[1, 2, 2.5, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className={styles.selectCard}>Dzielnik mianownika
              <select aria-label="Dzielnik mianownika" value={collapseDenominatorDivisor} disabled={controlsLocked} onChange={(event) => { setCollapseDenominatorDivisor(event.target.value); clearResult(); }}>
                {[1, 2, 2.5, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <section className={styles.stackCard}>
              <p>Zapis po zgrupowaniu części</p>
              <FractionStackInput value={collapseStack} onChange={(value) => { setCollapseStack(value); clearResult(); }} readOnly={controlsLocked} stepLabel="Zapisz ułamek po zwinięciu podziału" />
              {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkCollapse}>Sprawdź grupowanie</button> : null}
            </section>
          </div>
          <div className={styles.groupPreview} data-group-size={`${collapseNumeratorDivisor}:${collapseDenominatorDivisor}`}>
            {Array.from({ length: task.source.denominator }, (_, index) => <span key={index} data-selected={index < task.source.numerator || undefined} />)}
          </div>
          <div className={styles.modelGrid}><FractionBarModel bars={[{ id: "collapse-source", label: "drobne części", value: task.source, accent: "amber" }, { id: "collapse-preview", label: "po grupowaniu", value: collapsePreview, accent: "cyan" }]} /><EquivalentNumberLine fractions={[task.source, collapsePreview]} /></div>
        </div>
      ) : null}

      {activity === "cross-out-rewrite" ? (
        <div className={styles.activityStack}>
          <FractionOperationDirector
            title="Skracanie z czytelnym śladem"
            operator="="
            items={[
              { id: "before", label: "ułamek przed skróceniem", ...task.source },
              { id: "after", label: "ułamek po skróceniu", ...task.result },
            ]}
            steps={crossOutSteps}
          />
          <div className={styles.modelGrid}><FractionBarModel bars={[{ id: "cross-before", label: "24/36", value: task.source, accent: "amber" }, { id: "cross-after", label: "2/3", value: task.result, accent: "cyan" }]} /><EquivalentNumberLine fractions={[task.source, task.result]} /></div>
        </div>
      ) : null}

      {activity === "equivalent-chain" ? (
        <div className={styles.activityStack}>
          <div className={styles.chain} aria-label="Łańcuch ułamków równoważnych">
            <StaticFraction value={task.chain[0]!} label="pierwszy ułamek" /><span>=</span>
            <StaticFraction value={task.chain[1]!} label="drugi ułamek" /><span>=</span>
            <div className={styles.chainInput}><FractionStackInput value={chainStack} onChange={(value) => { setChainStack(value); clearResult(); }} readOnly={controlsLocked} showKeypad={false} stepLabel="Uzupełnij trzeci ułamek" /></div><span>=</span>
            <StaticFraction value={task.chain[3]!} label="czwarty ułamek" />
          </div>
          <EquivalentNumberLine fractions={task.chain} />
          <label className={styles.reasonCard}>Uzasadnij jeden krok
            <textarea value={reason} readOnly={controlsLocked} rows={3} placeholder="Napisz, jak zmieniono licznik i mianownik oraz dlaczego wartość się nie zmieniła." onChange={(event) => { setReason(event.target.value); clearResult(); }} />
          </label>
          {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkChain}>Sprawdź łańcuch i uzasadnienie</button> : null}
        </div>
      ) : null}

      {activity === "paint-lab" ? (
        <div className={styles.activityStack}>
          {!controlsLocked ? <InteractionAlternativePanel title="Podział ściany" instruction="Wybierz liczbę równych pól. Wzór farby zajmuje tę samą część ściany, choć siatka staje się gęstsza."><div className={styles.choiceRow}>{[5, 10, 15].map((division) => <button key={division} type="button" aria-pressed={wallDivision === division} onClick={() => { setWallDivision(division); clearResult(); }}>{division} równych pól</button>)}</div></InteractionAlternativePanel> : null}
          <div className={styles.wall} data-wall-division={wallDivision} style={{ gridTemplateColumns: `repeat(${wallDivision}, minmax(0, 1fr))` }} aria-label={`Ściana podzielona na ${wallDivision} równych pól; pomalowano ${wallDivision * 3 / 5}`}>
            {Array.from({ length: wallDivision }, (_, index) => <span key={index} data-painted={index < wallDivision * 3 / 5 || undefined} />)}
          </div>
          <FractionBarModel bars={task.chain.map((value, index) => ({ id: `paint-${value.denominator}`, label: `${value.numerator}/${value.denominator}`, value, accent: (["indigo", "cyan", "violet"] as const)[index]! }))} />
          <EquivalentNumberLine fractions={task.chain} />
          <p className={styles.invariant} role="status">Ta sama pomalowana część ściany: {wallDivision * 3 / 5}/{wallDivision}. Zmienia się opis i liczba pól, nie powierzchnia farby.</p>
        </div>
      ) : null}

      {activity === "independent-equivalence" ? (
        <div className={styles.activityStack}>
          <div className={styles.independentPrompt}>
            <span>Start</span><StaticFraction value={task.source} label="ułamek początkowy" />
            <strong>rozszerz przez {task.factor}, potem skróć do postaci nieskracalnej</strong>
          </div>
          <div className={styles.independentGrid}>
            <section className={styles.stackCard}>
              <h3>1. Rozszerzenie</h3>
              <div className={styles.numberPair}>
                <label>Mnożnik licznika<input aria-label="Mnożnik licznika w samodzielnej próbie" inputMode="numeric" value={numeratorFactor} readOnly={controlsLocked} onChange={(event) => { setNumeratorFactor(Number(event.target.value)); clearResult(); }} /></label>
                <label>Mnożnik mianownika<input aria-label="Mnożnik mianownika w samodzielnej próbie" inputMode="numeric" value={denominatorFactor} readOnly={controlsLocked} onChange={(event) => { setDenominatorFactor(Number(event.target.value)); clearResult(); }} /></label>
              </div>
              <FractionStackInput value={expansionStack} onChange={(value) => { setExpansionStack(value); clearResult(); }} readOnly={controlsLocked} stepLabel="Wpisz ułamek rozszerzony" />
            </section>
            <section className={styles.stackCard}>
              <h3>2. Dowód skracania</h3>
              <label className={styles.pathField}>Dzielniki licznika kolejno<input aria-label="Ścieżka dzielników licznika" value={numeratorPath} readOnly={controlsLocked} placeholder="np. 2, 2 albo 4" onChange={(event) => { setNumeratorPath(event.target.value); clearResult(); }} /></label>
              <label className={styles.pathField}>Dzielniki mianownika kolejno<input aria-label="Ścieżka dzielników mianownika" value={denominatorPath} readOnly={controlsLocked} placeholder="te same liczby" onChange={(event) => { setDenominatorPath(event.target.value); clearResult(); }} /></label>
              <p className={styles.pathHint}>Możesz użyć jednego wspólnego dzielnika albo kilku poprawnych kroków.</p>
            </section>
            <section className={styles.stackCard}>
              <h3>3. Postać nieskracalna</h3>
              <FractionStackInput value={finalStack} onChange={(value) => { setFinalStack(value); clearResult(); }} readOnly={controlsLocked} stepLabel="Wpisz końcową postać nieskracalną" />
            </section>
          </div>
          <label className={styles.reasonCard}>Dlaczego wartość się nie zmieniła?
            <textarea value={reason} readOnly={controlsLocked} rows={3} placeholder="Odwołaj się do tej samej liczby dla licznika i mianownika oraz do modelu lub osi." onChange={(event) => { setReason(event.target.value); clearResult(); }} />
          </label>
          {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkIndependent}>Sprawdź całą samodzielną próbę</button> : null}
        </div>
      ) : null}

      {activity === "independent-simplification" ? (
        <div className={styles.activityStack}>
          <div className={styles.independentPrompt}>
            <span>Start</span><StaticFraction value={task.source} label="ułamek do skrócenia" />
            <strong>skróć do postaci nieskracalnej i pozostaw pełny ślad</strong>
          </div>
          <div className={styles.independentGrid}>
            <section className={styles.stackCard}>
              <h3>1. Ścieżka skracania</h3>
              <label className={styles.pathField}>Dzielniki licznika kolejno<input aria-label="Ścieżka dzielników licznika" value={numeratorPath} readOnly={controlsLocked} placeholder={`np. ${task.factor} albo kilka kroków`} onChange={(event) => { setNumeratorPath(event.target.value); clearResult(); }} /></label>
              <label className={styles.pathField}>Dzielniki mianownika kolejno<input aria-label="Ścieżka dzielników mianownika" value={denominatorPath} readOnly={controlsLocked} placeholder="dokładnie te same liczby" onChange={(event) => { setDenominatorPath(event.target.value); clearResult(); }} /></label>
              <p className={styles.pathHint}>Stare liczby pozostają widoczne. Każdy dzielnik musi dzielić licznik i mianownik bez reszty.</p>
            </section>
            <section className={styles.stackCard}>
              <h3>2. Postać nieskracalna</h3>
              <FractionStackInput value={finalStack} onChange={(value) => { setFinalStack(value); clearResult(); }} readOnly={controlsLocked} stepLabel="Wpisz postać nieskracalną" />
            </section>
          </div>
          <label className={styles.reasonCard}>Dlaczego wartość się nie zmieniła?
            <textarea value={reason} readOnly={controlsLocked} rows={3} placeholder="Napisz, dlaczego ten sam dzielnik nad i pod kreską zachowuje wartość." onChange={(event) => { setReason(event.target.value); clearResult(); }} />
          </label>
          {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkIndependentSimplification}>Sprawdź skracanie</button> : null}
        </div>
      ) : null}

      {successMessage ? <p className={styles.success} role="status">✓ {successMessage}</p> : null}
      {diagnostic ? onResultChange ? (
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
      ) : null}
    </article>
  );
}
