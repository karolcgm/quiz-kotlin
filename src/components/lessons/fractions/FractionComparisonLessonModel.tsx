"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  commonDenominatorEvidence,
  commonNumeratorEvidence,
  comparisonSign,
  createFractionComparisonDiagnosticResult,
  createPublicFractionComparisonTask,
  evaluateComparisonAttempt,
  evaluateFractionOrderAttempt,
  FRACTION_COMPARISON_JUSTIFICATION_CODE,
  FRACTION_COMPARISON_STRATEGY_CODE,
  type FractionComparisonActivity,
  type FractionComparisonDiagnosticCode,
  type FractionComparisonPublicTask,
  type FractionComparisonSign,
  type FractionComparisonStrategy,
} from "@/lib/math/fractions/fractionComparisonLesson";
import { fractionStackValueFromFraction } from "@/lib/math/fractions/fractionMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import type { FractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionComparisonLesson.module.css";

const ACTIVITY_TITLES: Record<FractionComparisonActivity, string> = {
  "overlay-bars": "Nałóż paski",
  "common-axis": "Wspólna oś",
  "shortest-strategy": "Która strategia jest najkrótsza?",
  "denominator-trap": "Pułapka większego mianownika",
  "drone-race": "Wyścig dronów",
  "independent-comparison": "Samodzielna próba",
};

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Start",
  core: "Dalej",
  challenge: "Mistrzowskie",
};

const STRATEGY_LABELS: Record<FractionComparisonStrategy, string> = {
  "common-denominator": "Wspólny mianownik",
  "common-numerator": "Wspólny licznik",
  "reference-half": "Odniesienie do 1/2",
  "reference-one": "Odniesienie do 1",
};

const STRATEGY_HINTS: Record<FractionComparisonStrategy, string> = {
  "common-denominator": "Sprowadź ułamki do części tej samej wielkości i porównaj pierwsze różne liczniki.",
  "common-numerator": "Gdy licznik jest wspólny, pierwszy rozstrzyga mianownik: mniej części oznacza większe części.",
  "reference-half": "Sprawdź, czy punkty leżą przed 1/2, na 1/2 czy za 1/2.",
  "reference-one": "Sprawdź, który punkt leży bliżej jednej całej.",
};

const ALL_STRATEGIES = Object.keys(STRATEGY_LABELS) as FractionComparisonStrategy[];

function fractionLabel(value: FractionValue): string {
  return `${value.numerator}/${value.denominator}`;
}

function VerticalFraction({
  value,
  id,
  decisivePart,
}: {
  value: FractionValue;
  id: string;
  decisivePart?: "numerator" | "denominator";
}) {
  return (
    <span className={styles.verticalFraction} aria-label={fractionLabel(value)} data-fraction-member={id}>
      <span data-decisive-member={decisivePart === "numerator" || undefined} className={decisivePart === "numerator" ? styles.decisive : undefined}>
        {value.numerator}
      </span>
      <span className={styles.fractionLine} aria-hidden />
      <span data-decisive-member={decisivePart === "denominator" || undefined} className={decisivePart === "denominator" ? styles.decisive : undefined}>
        {value.denominator}
      </span>
    </span>
  );
}

function ComparisonRow({
  left,
  right,
  sign,
  decisivePart,
}: {
  left: FractionValue;
  right: FractionValue;
  sign: FractionComparisonSign | "○";
  decisivePart?: "numerator" | "denominator";
}) {
  return (
    <div className={styles.comparisonRow} data-comparison-row>
      <VerticalFraction value={left} id="comparison-left" decisivePart={decisivePart} />
      <strong className={styles.comparisonSign} aria-label={`znak ${sign}`} data-comparison-sign>{sign}</strong>
      <VerticalFraction value={right} id="comparison-right" decisivePart={decisivePart} />
    </div>
  );
}

function SignChooser({
  value,
  disabled,
  onChange,
}: {
  value: FractionComparisonSign | null;
  disabled: boolean;
  onChange: (value: FractionComparisonSign) => void;
}) {
  return (
    <div className={styles.signTray} role="group" aria-label="Przeciągnij lub wybierz znak porównania">
      {(["<", "=", ">"] as const).map((sign) => (
        <button
          key={sign}
          type="button"
          draggable={!disabled}
          disabled={disabled}
          aria-label={`Wstaw znak ${sign}`}
          aria-pressed={value === sign}
          className={`${styles.touchTarget} ${value === sign ? styles.selectedControl : ""}`}
          onClick={() => onChange(sign)}
          onDragEnd={() => onChange(sign)}
        >
          {sign}
        </button>
      ))}
      <span className={styles.keyboardHint}>Dotyk: stuknij · klawiatura: Tab + Enter · mysz: przeciągnij</span>
    </div>
  );
}

function DecisiveEvidence({
  left,
  right,
  strategy,
}: {
  left: FractionValue;
  right: FractionValue;
  strategy: FractionComparisonStrategy;
}) {
  if (strategy === "common-denominator") {
    const evidence = commonDenominatorEvidence(left, right);
    return (
      <div className={styles.evidence} data-strategy-evidence="common-denominator">
        <p>Wspólny mianownik: {evidence.denominator}. Pierwszy rozstrzygający element ma obrys ciągły i symbol ★.</p>
        <ComparisonRow
          left={{ numerator: evidence.leftNumerator, denominator: evidence.denominator }}
          right={{ numerator: evidence.rightNumerator, denominator: evidence.denominator }}
          sign={comparisonSign(left, right)}
          decisivePart="numerator"
        />
      </div>
    );
  }
  if (strategy === "common-numerator") {
    const evidence = commonNumeratorEvidence(left, right);
    return (
      <div className={styles.evidence} data-strategy-evidence="common-numerator">
        <p>Wspólny licznik: {evidence.numerator}. Przy tej samej liczbie części pierwszy rozstrzyga ich rozmiar.</p>
        <ComparisonRow
          left={{ numerator: evidence.numerator, denominator: evidence.leftDenominator }}
          right={{ numerator: evidence.numerator, denominator: evidence.rightDenominator }}
          sign={comparisonSign(left, right)}
          decisivePart="denominator"
        />
      </div>
    );
  }
  const reference = strategy === "reference-half" ? "1/2" : "1";
  return (
    <div className={styles.evidence} data-strategy-evidence={strategy}>
      <p><span className={styles.decisiveReference} data-decisive-member>★ Punkt odniesienia {reference}</span> rozstrzyga położenie wartości bez metody różnicowej.</p>
      <ComparisonRow left={left} right={right} sign={comparisonSign(left, right)} />
    </div>
  );
}

function CommonAxis({
  values,
  disabled,
  onChange,
}: {
  values: readonly [FractionValue, FractionValue];
  disabled: boolean;
  onChange: (index: 0 | 1, numerator: number) => void;
}) {
  const xFor = (value: FractionValue) => 38 + (value.numerator / value.denominator) * 324;
  return (
    <section className={styles.axisPanel} aria-label="Wspólna oś dwóch ułamków">
      <AccessibleMathSvg
        title="Wspólna oś porównywanych ułamków"
        description={`Punkt A to ${fractionLabel(values[0])}, a punkt B to ${fractionLabel(values[1])}. Oba leżą na osi od 0 do 1.`}
        viewBox="0 0 400 140"
        className="h-auto w-full"
        columns={[{ key: "point", label: "Punkt" }, { key: "value", label: "Wartość" }]}
        rows={[{ point: "A", value: fractionLabel(values[0]) }, { point: "B", value: fractionLabel(values[1]) }]}
      >
        <line x1="38" y1="76" x2="362" y2="76" stroke="#0f172a" strokeWidth="4" />
        {[0, .25, .5, .75, 1].map((tick) => (
          <g key={tick}>
            <line x1={38 + tick * 324} y1="65" x2={38 + tick * 324} y2="87" stroke="#475569" strokeWidth="2" />
            <text x={38 + tick * 324} y="111" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">
              {tick === .5 ? "1/2" : tick === 0 || tick === 1 ? tick : ""}
            </text>
          </g>
        ))}
        <circle cx={xFor(values[0])} cy="64" r="10" fill="#0891b2" stroke="#fff" strokeWidth="3" data-axis-point="A" />
        <text x={xFor(values[0])} y="39" textAnchor="middle" fontSize="14" fontWeight="900" fill="#155e75">A · {fractionLabel(values[0])}</text>
        <circle cx={xFor(values[1])} cy="88" r="10" fill="#7c3aed" stroke="#fff" strokeWidth="3" data-axis-point="B" />
        <text x={xFor(values[1])} y="132" textAnchor="middle" fontSize="14" fontWeight="900" fill="#5b21b6">B · {fractionLabel(values[1])}</text>
      </AccessibleMathSvg>
      {!disabled ? values.map((value, index) => (
        <label key={index} className={styles.sliderLabel}>
          Przeciągnij punkt {index === 0 ? "A" : "B"}: {fractionLabel(value)}
          <input
            type="range"
            min={0}
            max={value.denominator}
            step={1}
            value={value.numerator}
            aria-label={`Przeciągnij punkt ${index === 0 ? "A" : "B"}`}
            aria-valuetext={fractionLabel(value)}
            onChange={(event) => onChange(index as 0 | 1, Number(event.target.value))}
          />
        </label>
      )) : null}
    </section>
  );
}

function StrategyCards({
  selected,
  disabled,
  onSelect,
}: {
  selected: FractionComparisonStrategy | null;
  disabled: boolean;
  onSelect: (strategy: FractionComparisonStrategy) => void;
}) {
  return (
    <div className={styles.strategyGrid} role="group" aria-label="Wybierz strategię porównania">
      {ALL_STRATEGIES.map((strategy) => (
        <button
          key={strategy}
          type="button"
          disabled={disabled}
          aria-pressed={selected === strategy}
          className={`${styles.strategyCard} ${selected === strategy ? styles.selectedControl : ""}`}
          onClick={() => onSelect(strategy)}
        >
          <strong>{STRATEGY_LABELS[strategy]}</strong>
          <span>{STRATEGY_HINTS[strategy]}</span>
        </button>
      ))}
    </div>
  );
}

function OrderedFractions({
  task,
  order,
  disabled,
  onMove,
}: {
  task: FractionComparisonPublicTask;
  order: readonly number[];
  disabled: boolean;
  onMove: (position: number, direction: -1 | 1) => void;
}) {
  return (
    <ol className={styles.orderGrid} aria-label="Porządek rosnący ułamków">
      {order.map((fractionIndex, position) => {
        const value = task.fractions[fractionIndex]!;
        return (
          <li key={fractionIndex} className={styles.orderCard} data-order-position={position + 1}>
            <span className={styles.rank}>{position + 1}</span>
            <FractionStackInput
              value={fractionStackValueFromFraction(value)}
              onChange={() => undefined}
              readOnly
              showKeypad={false}
              stepLabel={`Ułamek na pozycji ${position + 1}`}
            />
            {!disabled ? <div className={styles.moveButtons}>
              <button type="button" disabled={position === 0} aria-label={`Przesuń ${fractionLabel(value)} w lewo`} onClick={() => onMove(position, -1)}>←</button>
              <button type="button" disabled={position === order.length - 1} aria-label={`Przesuń ${fractionLabel(value)} w prawo`} onClick={() => onMove(position, 1)}>→</button>
            </div> : null}
          </li>
        );
      })}
    </ol>
  );
}

export interface FractionComparisonLessonModelProps {
  activity: FractionComparisonActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionComparisonLessonModel({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  ...props
}: FractionComparisonLessonModelProps) {
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicFractionComparisonTask({
    seed: effectiveSeed,
    difficulty: activeDifficulty,
    activity,
  }), [activity, activeDifficulty, effectiveSeed]);

  return (
    <FractionComparisonWorkspace
      key={`${activity}-${effectiveSeed}-${activeDifficulty}`}
      task={task}
      activeDifficulty={activeDifficulty}
      onDifficultyChange={setActiveDifficulty}
      {...props}
    />
  );
}

function FractionComparisonWorkspace({
  task,
  activeDifficulty,
  onDifficultyChange,
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: Omit<FractionComparisonLessonModelProps, "activity" | "seed" | "taskSeed" | "difficulty"> & {
  task: FractionComparisonPublicTask;
  activeDifficulty: LessonDifficulty;
  onDifficultyChange: (difficulty: LessonDifficulty) => void;
}) {
  const pair = [task.fractions[0]!, task.fractions[1]!] as const;
  const [axisValues, setAxisValues] = useState<readonly [FractionValue, FractionValue]>(pair);
  const [sign, setSign] = useState<FractionComparisonSign | null>(null);
  const [sameWhole, setSameWhole] = useState(true);
  const [strategy, setStrategy] = useState<FractionComparisonStrategy | null>(null);
  const [order, setOrder] = useState<number[]>(() => task.fractions.length === 3 ? [2, 0, 1] : task.fractions.map((_, index) => index));
  const [reason, setReason] = useState("");
  const [diagnosticCode, setDiagnosticCode] = useState<FractionComparisonDiagnosticCode | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const controlsLocked = readOnly || presentationMode;
  const diagnostic = diagnosticCode ? createFractionComparisonDiagnosticResult(diagnosticCode) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccess(null);
    onResultChange?.(null);
  };

  const report = (code: FractionComparisonDiagnosticCode | null, answerLabel: string, successMessage: string) => {
    setDiagnosticCode(code);
    setSuccess(code ? null : successMessage);
    onResultChange?.(code === null, answerLabel);
  };

  const chooseSign = (next: FractionComparisonSign) => {
    setSign(next);
    clearResult();
  };

  const checkPair = (values = pair, requireReason = false) => {
    const code = evaluateComparisonAttempt({
      left: values[0],
      right: values[1],
      sign,
      sameWhole,
      reason: requireReason ? reason : undefined,
      strategy: requireReason ? task.recommendedStrategy : undefined,
    });
    report(code, `${fractionLabel(values[0])} ${sign ?? "○"} ${fractionLabel(values[1])}`, "Znak jest poprawny i wskazuje większą wartość tej samej całości.");
  };

  const move = (position: number, direction: -1 | 1) => {
    const destination = position + direction;
    if (destination < 0 || destination >= order.length) return;
    setOrder((current) => {
      const next = [...current];
      [next[position], next[destination]] = [next[destination]!, next[position]!];
      return next;
    });
    clearResult();
  };

  const checkOrder = (requireStrategy: boolean) => {
    const orderCode = evaluateFractionOrderAttempt(task.fractions, order);
    if (orderCode) {
      report(orderCode, order.map((index) => fractionLabel(task.fractions[index]!)).join(" < "), "");
      return;
    }
    if (requireStrategy && strategy !== task.recommendedStrategy) {
      report(FRACTION_COMPARISON_STRATEGY_CODE, strategy ?? "brak strategii", "");
      return;
    }
    const justificationStrategy = requireStrategy ? strategy : task.recommendedStrategy;
    const reasonCode = justificationStrategy && reason.trim().length > 0
      ? evaluateComparisonAttempt({
        left: task.fractions[order[0]]!,
        right: task.fractions[order[1]]!,
        sign: "<",
        sameWhole: true,
        reason,
        strategy: justificationStrategy,
      })
      : FRACTION_COMPARISON_JUSTIFICATION_CODE;
    report(
      reasonCode,
      `${order.map((index) => fractionLabel(task.fractions[index]!)).join(" < ")} · ${reason}`,
      "Porządek i uzasadnienie są spójne z wybraną strategią.",
    );
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
      data-fraction-comparison-l1
      data-fraction-activity={task.activity}
      data-generator-id={task.generatorId}
      data-difficulty={task.difficulty}
      data-orientation-contract="portrait-landscape"
      data-answer-spec="server-only"
    >
      {!onResultChange && !readOnly ? (
        <div className={styles.difficulty} role="group" aria-label="Wybierz wariant zadania">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button key={level} type="button" aria-pressed={activeDifficulty === level} className={activeDifficulty === level ? styles.selectedControl : ""} onClick={() => onDifficultyChange(level)}>
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      ) : <p className={styles.variant}>Wariant: {DIFFICULTY_LABELS[task.difficulty]}</p>}

      {task.activity === "overlay-bars" ? (
        <section className={styles.workspace}>
          <ComparisonRow left={pair[0]} right={pair[1]} sign={sign ?? "○"} />
          <div className={styles.overlayFrame} data-same-whole={sameWhole}>
            <div className={styles.wholeReference} data-whole-size="1">
              <FractionBarModel bars={[{ id: "comparison-left", label: fractionLabel(pair[0]), value: pair[0], accent: "cyan" }]} />
            </div>
            <div className={sameWhole ? styles.sameWhole : styles.differentWhole} data-whole-size={sameWhole ? "1" : ".78"}>
              <FractionBarModel bars={[{ id: "comparison-right", label: fractionLabel(pair[1]), value: pair[1], accent: "violet" }]} />
            </div>
          </div>
          <p className={styles.rule}><b>Warunek 0:</b> najpierw sprawdź tę samą całość. Obrót lub zamiana pasków nie zmienia ich wartości.</p>
          {!controlsLocked ? <InteractionAlternativePanel title="Nałóż i porównaj" instruction="Wyrównaj całości, wybierz znak dotykiem, klawiaturą albo przeciągnięciem i sprawdź wynik.">
            <div className={styles.wholeButtons}>
              <button type="button" aria-pressed={sameWhole} className={sameWhole ? styles.selectedControl : ""} onClick={() => { setSameWhole(true); clearResult(); }}>Ta sama całość</button>
              <button type="button" aria-pressed={!sameWhole} className={!sameWhole ? styles.warningControl : ""} onClick={() => { setSameWhole(false); clearResult(); }}>Inna całość — pułapka</button>
            </div>
            <SignChooser value={sign} disabled={controlsLocked} onChange={chooseSign} />
            <button type="button" className={styles.checkButton} onClick={() => checkPair()}>Sprawdź porównanie pasków</button>
          </InteractionAlternativePanel> : null}
        </section>
      ) : null}

      {task.activity === "common-axis" ? (
        <section className={styles.workspace}>
          <ComparisonRow left={axisValues[0]} right={axisValues[1]} sign={sign ?? "○"} />
          <CommonAxis values={axisValues} disabled={controlsLocked} onChange={(index, numerator) => {
            setAxisValues((current) => {
              const next = [{ ...current[0] }, { ...current[1] }] as [FractionValue, FractionValue];
              next[index].numerator = numerator;
              return next;
            });
            setSign(null);
            clearResult();
          }} />
          {!controlsLocked ? <InteractionAlternativePanel title="Wstaw znak na wspólnej osi" instruction="Przeciągnij punkty albo użyj suwaków klawiaturą. Potem wybierz znak.">
            <SignChooser value={sign} disabled={controlsLocked} onChange={chooseSign} />
            <button type="button" className={styles.checkButton} onClick={() => checkPair(axisValues)}>Sprawdź położenie punktów</button>
          </InteractionAlternativePanel> : null}
        </section>
      ) : null}

      {task.activity === "shortest-strategy" ? (
        <section className={styles.workspace}>
          <ComparisonRow left={pair[0]} right={pair[1]} sign="○" />
          <StrategyCards selected={strategy} disabled={controlsLocked} onSelect={(next) => { setStrategy(next); clearResult(); }} />
          {strategy ? <DecisiveEvidence left={pair[0]} right={pair[1]} strategy={strategy} /> : <p className={styles.rule}>Wybierz kartę. Metoda różnicowa jest rozszerzeniem — nie jest wymagana w bazie.</p>}
          {!controlsLocked ? <button type="button" className={styles.checkButton} onClick={() => report(
            strategy === task.recommendedStrategy ? null : FRACTION_COMPARISON_STRATEGY_CODE,
            strategy ?? "brak strategii",
            "Wybrana strategia pokazuje wynik bez zbędnych kroków.",
          )}>Sprawdź najkrótszą strategię</button> : null}
        </section>
      ) : null}

      {task.activity === "denominator-trap" ? (
        <section className={styles.workspace}>
          <ComparisonRow left={pair[0]} right={pair[1]} sign={sign ?? "○"} decisivePart="denominator" />
          <div className={styles.modelPair}>
            <FractionBarModel bars={[{ id: "trap-left", label: "Jedna z ośmiu równych części", value: pair[0], accent: "amber" }]} />
            <FractionBarModel bars={[{ id: "trap-right", label: "Jedna z sześciu równych części", value: pair[1], accent: "cyan" }]} />
          </div>
          <p className={styles.trapNote}>⚠ Większy mianownik dzieli tę samą całość na więcej, a więc mniejszych części. Przy wspólnym liczniku pierwszy rozstrzyga mianownik.</p>
          <DecisiveEvidence left={pair[0]} right={pair[1]} strategy="common-numerator" />
          {!controlsLocked ? <InteractionAlternativePanel title="Obal pułapkę" instruction="Wybierz znak na podstawie rozmiaru jednej części, nie na podstawie większej cyfry w mianowniku.">
            <SignChooser value={sign} disabled={controlsLocked} onChange={chooseSign} />
            <button type="button" className={styles.checkButton} onClick={() => checkPair()}>Sprawdź kontrprzykład</button>
          </InteractionAlternativePanel> : null}
        </section>
      ) : null}

      {task.activity === "drone-race" || task.activity === "independent-comparison" ? (
        <section className={styles.workspace}>
          {task.activity === "drone-race" ? <p className={styles.droneStory}>🚁 Każdy dron leci po trasie tej samej długości. Ustaw przebyte części od najmniejszej do największej.</p> : null}
          <OrderedFractions task={task} order={order} disabled={controlsLocked} onMove={move} />
          {task.activity === "independent-comparison" ? (
            <>
              <StrategyCards selected={strategy} disabled={controlsLocked} onSelect={(next) => { setStrategy(next); clearResult(); }} />
              {strategy ? <DecisiveEvidence left={task.fractions[order[0]]!} right={task.fractions[order[1]]!} strategy={strategy} /> : null}
            </>
          ) : <DecisiveEvidence left={task.fractions[order[0]]!} right={task.fractions[order[1]]!} strategy={task.recommendedStrategy} />}
          {!controlsLocked ? <label className={styles.reasonField}>
            Uzasadnij pierwszy rozstrzygający krok
            <textarea value={reason} rows={3} onChange={(event) => { setReason(event.target.value); clearResult(); }} placeholder={task.activity === "drone-race" ? "Np. porównuję położenie do 1/2…" : "Nazwij wspólny mianownik/licznik albo odniesienie do 1/2 lub 1…"} />
          </label> : null}
          {!controlsLocked ? <button type="button" className={styles.checkButton} onClick={() => checkOrder(task.activity === "independent-comparison")}>
            {task.activity === "drone-race" ? "Sprawdź kolejność dronów" : "Sprawdź samodzielną próbę"}
          </button> : null}
        </section>
      ) : null}

      {success ? <p role="status" className={styles.success}>✓ {success}</p> : null}
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
    </LessonTaskFrame>
  );
}
