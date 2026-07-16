"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionCircleModel, fractionSectorPath } from "@/components/lessons/fractions/FractionCircleModel";
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
  "same-denominator": "Jednakowe mianowniki",
  "same-numerator": "Jednakowe liczniki",
  "common-measure": "Różne liczniki i mianowniki",
  "cross-multiplication": "Mnożenie na krzyż",
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

type GuidedComparisonActivity = Extract<
  FractionComparisonActivity,
  "same-denominator" | "same-numerator" | "common-measure" | "cross-multiplication"
>;

interface DisplayFractionValue extends FractionValue {
  wholePart?: number;
}

interface GuidedComparisonTask {
  id: string;
  left: DisplayFractionValue;
  right: DisplayFractionValue;
  visual?: "circle" | "grid" | "triangles" | "honeycomb" | "radial";
}

const GUIDED_ACTIVITIES = new Set<GuidedComparisonActivity>([
  "same-denominator",
  "same-numerator",
  "cross-multiplication",
]);

const GUIDED_TASKS: Record<GuidedComparisonActivity, readonly GuidedComparisonTask[]> = {
  "same-denominator": [
    { id: "den-1", left: { numerator: 4, denominator: 9 }, right: { numerator: 5, denominator: 9 }, visual: "circle" },
    { id: "den-2", left: { numerator: 7, denominator: 10 }, right: { numerator: 4, denominator: 10 }, visual: "triangles" },
    { id: "den-3", left: { numerator: 2, denominator: 9 }, right: { numerator: 8, denominator: 9 }, visual: "grid" },
    { id: "den-4", left: { numerator: 5, denominator: 7 }, right: { numerator: 3, denominator: 7 }, visual: "honeycomb" },
    { id: "den-5", left: { numerator: 7, denominator: 12 }, right: { numerator: 10, denominator: 12 }, visual: "radial" },
  ],
  "same-numerator": [
    { id: "num-1", left: { numerator: 4, denominator: 7 }, right: { numerator: 4, denominator: 9 } },
    { id: "num-2", left: { numerator: 5, denominator: 12 }, right: { numerator: 5, denominator: 8 } },
    { id: "num-3", left: { numerator: 7, denominator: 3 }, right: { numerator: 7, denominator: 5 } },
    { id: "num-4", left: { wholePart: 1, numerator: 2, denominator: 7 }, right: { wholePart: 1, numerator: 2, denominator: 5 } },
    { id: "num-5", left: { wholePart: 2, numerator: 3, denominator: 4 }, right: { wholePart: 2, numerator: 3, denominator: 8 } },
  ],
  "common-measure": [
    { id: "measure-1", left: { numerator: 2, denominator: 3 }, right: { numerator: 3, denominator: 4 } },
    { id: "measure-2", left: { numerator: 3, denominator: 5 }, right: { numerator: 5, denominator: 8 } },
    { id: "measure-3", left: { numerator: 5, denominator: 6 }, right: { numerator: 7, denominator: 9 } },
    { id: "measure-4", left: { numerator: 3, denominator: 10 }, right: { numerator: 2, denominator: 7 } },
    { id: "measure-5", left: { numerator: 7, denominator: 12 }, right: { numerator: 4, denominator: 7 } },
  ],
  "cross-multiplication": [
    { id: "cross-1", left: { numerator: 3, denominator: 5 }, right: { numerator: 4, denominator: 7 } },
    { id: "cross-2", left: { numerator: 2, denominator: 7 }, right: { numerator: 3, denominator: 8 } },
    { id: "cross-3", left: { numerator: 5, denominator: 6 }, right: { numerator: 7, denominator: 9 } },
    { id: "cross-4", left: { numerator: 4, denominator: 11 }, right: { numerator: 3, denominator: 8 } },
    { id: "cross-5", left: { numerator: 7, denominator: 12 }, right: { numerator: 5, denominator: 9 } },
  ],
};

function isGuidedComparisonActivity(activity: FractionComparisonActivity): activity is GuidedComparisonActivity {
  return GUIDED_ACTIVITIES.has(activity as GuidedComparisonActivity);
}

function improperNumerator(value: DisplayFractionValue): number {
  return (value.wholePart ?? 0) * value.denominator + value.numerator;
}

function displayComparisonSign(left: DisplayFractionValue, right: DisplayFractionValue): FractionComparisonSign {
  const leftProduct = BigInt(improperNumerator(left)) * BigInt(right.denominator);
  const rightProduct = BigInt(improperNumerator(right)) * BigInt(left.denominator);
  return leftProduct < rightProduct ? "<" : leftProduct > rightProduct ? ">" : "=";
}

function displayFractionLabel(value: DisplayFractionValue): string {
  const fraction = `${value.numerator}/${value.denominator}`;
  return value.wholePart === undefined ? fraction : `${value.wholePart} ${fraction}`;
}

function StaticLessonFraction({ value, accent }: { value: DisplayFractionValue; accent?: "cyan" | "violet" }) {
  return (
    <span className={styles.staticFractionWrap} aria-label={displayFractionLabel(value)}>
      {value.wholePart !== undefined ? <span className={styles.wholePart}>{value.wholePart}</span> : null}
      <span className={`${styles.staticFraction} ${accent === "cyan" ? styles.cyanFraction : accent === "violet" ? styles.violetFraction : ""}`}>
        <span>{value.numerator}</span>
        <span className={styles.staticFractionLine} aria-hidden />
        <span>{value.denominator}</span>
      </span>
    </span>
  );
}

function pointOnCircle(centerX: number, centerY: number, radius: number, angle: number): { x: number; y: number } {
  const radians = angle * Math.PI / 180;
  return { x: centerX + radius * Math.cos(radians), y: centerY + radius * Math.sin(radians) };
}

function hexagonPoints(centerX: number, centerY: number, radius: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const point = pointOnCircle(centerX, centerY, radius, index * 60 - 30);
    return `${point.x},${point.y}`;
  }).join(" ");
}

function MiniFractionShape({
  value,
  variant,
  accent,
}: {
  value: FractionValue;
  variant: NonNullable<GuidedComparisonTask["visual"]>;
  accent: "cyan" | "violet";
}) {
  const fill = accent === "cyan" ? "#22d3ee" : "#a78bfa";
  const pale = accent === "cyan" ? "#ecfeff" : "#f5f3ff";
  const stroke = "#1e293b";
  const selected = (index: number) => index < value.numerator ? fill : pale;
  const sectors = Array.from({ length: value.denominator }, (_, index) => index);

  return (
    <svg
      viewBox="0 0 140 100"
      className={styles.miniFractionShape}
      role="img"
      aria-label={`${value.numerator} pokolorowanych części z ${value.denominator}`}
      data-fraction-shape={variant}
    >
      {variant === "circle" ? sectors.map((index) => {
        const start = -90 + index * 360 / value.denominator;
        const end = -90 + (index + 1) * 360 / value.denominator;
        return <path key={index} d={fractionSectorPath(70, 50, 40, start, end)} fill={selected(index)} stroke={stroke} strokeWidth="1.8" />;
      }) : null}

      {variant === "grid" ? sectors.map((index) => {
        const columns = value.denominator === 9 ? 3 : Math.ceil(Math.sqrt(value.denominator));
        const rows = Math.ceil(value.denominator / columns);
        const size = Math.min(25, 72 / rows);
        const offsetX = (140 - columns * size) / 2;
        const offsetY = (100 - rows * size) / 2;
        return (
          <rect
            key={index}
            x={offsetX + index % columns * size}
            y={offsetY + Math.floor(index / columns) * size}
            width={size}
            height={size}
            fill={selected(index)}
            stroke={stroke}
            strokeWidth="1.8"
          />
        );
      }) : null}

      {variant === "triangles" ? sectors.map((index) => {
        const pair = Math.floor(index / 2);
        const x = 15 + pair * 22;
        const points = index % 2 === 0
          ? `${x},50 ${x + 11},30 ${x + 22},50`
          : `${x},50 ${x + 11},70 ${x + 22},50`;
        return <polygon key={index} points={points} fill={selected(index)} stroke={stroke} strokeWidth="1.8" />;
      }) : null}

      {variant === "honeycomb" ? sectors.map((index) => {
        const centers = [
          [70, 50], [70, 22], [94, 36], [94, 64], [70, 78], [46, 64], [46, 36],
        ] as const;
        const center = centers[index] ?? [70, 50];
        return <polygon key={index} points={hexagonPoints(center[0], center[1], 16)} fill={selected(index)} stroke={stroke} strokeWidth="1.8" />;
      }) : null}

      {variant === "radial" ? sectors.map((index) => {
        const first = pointOnCircle(70, 50, 42, -90 + index * 360 / value.denominator);
        const second = pointOnCircle(70, 50, 42, -90 + (index + 1) * 360 / value.denominator);
        return <polygon key={index} points={`70,50 ${first.x},${first.y} ${second.x},${second.y}`} fill={selected(index)} stroke={stroke} strokeWidth="1.8" />;
      }) : null}
    </svg>
  );
}

function TaskShapeComparison({ task, sign }: { task: GuidedComparisonTask; sign: FractionComparisonSign | null }) {
  if (!task.visual) return null;
  return (
    <div className={styles.taskShapeComparison}>
      <div className={styles.taskShapeItem}>
        <MiniFractionShape value={task.left} variant={task.visual} accent="cyan" />
        <StaticLessonFraction value={task.left} accent="cyan" />
      </div>
      <strong className={styles.taskShapeSign} aria-hidden>{sign ?? "?"}</strong>
      <div className={styles.taskShapeItem}>
        <MiniFractionShape value={task.right} variant={task.visual} accent="violet" />
        <StaticLessonFraction value={task.right} accent="violet" />
      </div>
    </div>
  );
}

function CircleRuleExample({ activity }: { activity: "same-denominator" | "same-numerator" }) {
  const left = activity === "same-denominator"
    ? { numerator: 3, denominator: 8 }
    : { numerator: 3, denominator: 4 };
  const right = activity === "same-denominator"
    ? { numerator: 7, denominator: 8 }
    : { numerator: 3, denominator: 8 };
  const sign = displayComparisonSign(left, right);
  return (
    <div className={styles.circleExample} aria-label={`Przykład: ${fractionLabel(left)} ${sign} ${fractionLabel(right)}`}>
      <div className={styles.circleExampleItem}>
        <FractionCircleModel value={left} label="Pierwszy ułamek" showCaption={false} />
        <StaticLessonFraction value={left} accent="cyan" />
      </div>
      <strong className={styles.exampleSign} aria-hidden>{sign}</strong>
      <div className={styles.circleExampleItem}>
        <FractionCircleModel value={right} label="Drugi ułamek" showCaption={false} />
        <StaticLessonFraction value={right} accent="violet" />
      </div>
    </div>
  );
}

function CrossFractionOperand({
  numerator,
  denominator,
  numeratorTone,
  denominatorTone,
  side,
}: {
  numerator: number;
  denominator: number;
  numeratorTone?: "cyan" | "violet";
  denominatorTone?: "cyan" | "violet";
  side: "left" | "right";
}) {
  const toneClass = (tone?: "cyan" | "violet") => tone === "cyan"
    ? styles.crossNumberCyan
    : tone === "violet"
      ? styles.crossNumberViolet
      : "";

  return (
    <span className={styles.crossOperand} aria-label={`${numerator}/${denominator}`}>
      <span
        className={`${styles.crossNumber} ${toneClass(numeratorTone)}`}
        data-cross-operand={`${side}-numerator`}
        data-cross-highlight={numeratorTone ?? "muted"}
      >
        {numerator}
      </span>
      <span className={styles.crossOperandLine} aria-hidden />
      <span
        className={`${styles.crossNumber} ${toneClass(denominatorTone)}`}
        data-cross-operand={`${side}-denominator`}
        data-cross-highlight={denominatorTone ?? "muted"}
      >
        {denominator}
      </span>
    </span>
  );
}

function CrossMultiplicationExample({ step, onStepChange, disabled }: {
  step: 0 | 1 | 2;
  onStepChange: (step: 0 | 1 | 2) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.crossLesson}>
      <div className={styles.crossCanvas} aria-label="Mnożenie na krzyż ułamków jedna druga i dwie trzecie">
        <svg className={styles.crossLines} viewBox="0 0 520 220" preserveAspectRatio="none" aria-hidden>
          <defs>
            <marker id="cross-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891b2" />
            </marker>
            <marker id="cross-arrow-violet" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
            </marker>
          </defs>
          <path
            className={step >= 1 ? styles.crossLineCyan : styles.crossLineMuted}
            d="M 146 104 C 220 118, 300 154, 374 174"
            markerEnd={step >= 1 ? "url(#cross-arrow-cyan)" : undefined}
          />
          <path
            className={step >= 2 ? styles.crossLineViolet : styles.crossLineMuted}
            d="M 374 104 C 300 118, 220 154, 146 174"
            markerEnd={step >= 2 ? "url(#cross-arrow-violet)" : undefined}
          />
        </svg>
        <div className={styles.crossFractionGrid}>
          <span className={`${styles.productBadge} ${styles.crossLeftProduct} ${step >= 1 ? styles.productBadgeCyan : ""}`} data-cross-product="left">{step >= 1 ? 3 : "?"}</span>
          <strong className={styles.crossProductRelation} aria-label={step >= 2 ? "trzy jest mniejsze od czterech" : "miejsce na porównanie iloczynów"}>{step >= 2 ? "<" : "?"}</strong>
          <span className={`${styles.productBadge} ${styles.crossRightProduct} ${step >= 2 ? styles.productBadgeViolet : ""}`} data-cross-product="right">{step >= 2 ? 4 : "?"}</span>

          <div className={styles.crossLeftOperand}>
            <CrossFractionOperand
              numerator={1}
              denominator={2}
              numeratorTone={step >= 1 ? "cyan" : undefined}
              denominatorTone={step >= 2 ? "violet" : undefined}
              side="left"
            />
          </div>
          <span className={styles.crossQuestion}>?</span>
          <div className={styles.crossRightOperand}>
            <CrossFractionOperand
              numerator={2}
              denominator={3}
              numeratorTone={step >= 2 ? "violet" : undefined}
              denominatorTone={step >= 1 ? "cyan" : undefined}
              side="right"
            />
          </div>
        </div>
      </div>
      <div className={styles.crossStepButtons} role="group" aria-label="Kroki mnożenia na krzyż">
        <LessonTaskChoice type="button" selected={step >= 1} disabled={disabled} onClick={() => onStepChange(step >= 1 ? 0 : 1)}>
          1 × 3 = 3
        </LessonTaskChoice>
        <LessonTaskChoice type="button" selected={step >= 2} disabled={disabled || step < 1} onClick={() => onStepChange(step >= 2 ? 1 : 2)}>
          2 × 2 = 4
        </LessonTaskChoice>
      </div>
      <p className={styles.crossConclusion} aria-live="polite">
        {step === 0 ? "Najpierw połącz lewy licznik 1 z prawym mianownikiem 3." : step === 1 ? "Pierwszy skos: 1 × 3 = 3. Teraz połącz 2 z 2 drugim kolorem." : (
          <><b>3 &lt; 4</b>, więc <StaticLessonFraction value={{ numerator: 1, denominator: 2 }} /> <b>&lt;</b> <StaticLessonFraction value={{ numerator: 2, denominator: 3 }} />.</>
        )}
      </p>
    </div>
  );
}

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

function GuidedComparisonSlide({
  activity,
  readOnly = false,
  presentationMode = false,
  onResultChange,
}: Pick<FractionComparisonLessonModelProps, "readOnly" | "presentationMode" | "onResultChange"> & { activity: GuidedComparisonActivity }) {
  const tasks = GUIDED_TASKS[activity];
  const [activeTask, setActiveTask] = useState(0);
  const [unlockedThrough, setUnlockedThrough] = useState(0);
  const [answers, setAnswers] = useState<Record<number, FractionComparisonSign>>({});
  const [solved, setSolved] = useState<ReadonlySet<number>>(() => new Set());
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [crossStep, setCrossStep] = useState<0 | 1 | 2>(0);
  const [crossProducts, setCrossProducts] = useState<Record<number, { left: string; right: string }>>({});
  const [activeProduct, setActiveProduct] = useState<"left" | "right">("left");
  const controlsLocked = readOnly || presentationMode;
  const current = tasks[activeTask]!;
  const selectedSign = answers[activeTask] ?? null;
  const expectedSign = displayComparisonSign(current.left, current.right);
  const currentProducts = crossProducts[activeTask] ?? { left: "", right: "" };
  const description = activity === "same-denominator"
    ? "Wstaw znak < albo >. Przy jednakowych mianownikach porównuj liczniki."
    : activity === "same-numerator"
      ? "Wstaw znak < albo >. Przy jednakowych licznikach porównuj rozmiar części."
      : activity === "common-measure"
        ? "Wstaw znak < albo >. Możesz sprowadzić oba ułamki do wspólnego mianownika albo wspólnego licznika."
      : "Pomnóż po skosie, porównaj dwa iloczyny i wstaw znak < albo >.";

  const selectTask = (index: number) => {
    if (index > unlockedThrough) return;
    setActiveTask(index);
    setFeedback(null);
    onResultChange?.(null);
  };

  const selectSign = (next: FractionComparisonSign) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [activeTask]: next }));
    setFeedback(null);
    onResultChange?.(null);
  };

  const editProduct = (key: string) => {
    if (controlsLocked) return;
    setCrossProducts((values) => {
      const value = values[activeTask] ?? { left: "", right: "" };
      return {
        ...values,
        [activeTask]: {
          ...value,
          [activeProduct]: key === "backspace" ? value[activeProduct].slice(0, -1) : `${value[activeProduct]}${key}`.slice(0, 2),
        },
      };
    });
    setFeedback(null);
    onResultChange?.(null);
  };

  const checkAnswer = () => {
    if (activity === "cross-multiplication" && (Number(currentProducts.left) !== leftCrossProduct || Number(currentProducts.right) !== rightCrossProduct)) {
      setFeedback({ correct: false, message: "Wpisz oba iloczyny nad ułamkami: licznik pierwszego razy mianownik drugiego oraz odwrotnie." });
      onResultChange?.(false, "błędne iloczyny motylkowe");
      return;
    }
    if (!selectedSign) {
      setFeedback({ correct: false, message: "Najpierw wybierz znak < albo >." });
      onResultChange?.(false, "brak znaku");
      return;
    }
    if (selectedSign !== expectedSign) {
      const message = activity === "same-denominator"
        ? "Sprawdź liczniki. Większy licznik oznacza więcej takich samych części."
        : activity === "same-numerator"
          ? "Sprawdź mianowniki. Przy tym samym liczniku mniejszy mianownik oznacza większe części."
          : activity === "common-measure"
            ? "Sprowadź oba ułamki do tej samej miary, a dopiero potem porównaj liczby."
          : "Porównaj iloczyny po skosie. Szersza strona znaku ma być przy większym ułamku.";
      setFeedback({ correct: false, message });
      onResultChange?.(false, `${displayFractionLabel(current.left)} ${selectedSign} ${displayFractionLabel(current.right)}`);
      return;
    }
    const nextSolved = new Set(solved);
    nextSolved.add(activeTask);
    setSolved(nextSolved);
    setUnlockedThrough((value) => Math.max(value, Math.min(tasks.length - 1, activeTask + 1)));
    if (activeTask < tasks.length - 1) setActiveTask(activeTask + 1);
    setFeedback({
      correct: true,
      message: activeTask === tasks.length - 1
        ? "Świetnie — wszystkie porównania są poprawne."
        : "Dobrze. Następne zadanie jest już odblokowane.",
    });
    onResultChange?.(
      nextSolved.size === tasks.length ? true : null,
      `${displayFractionLabel(current.left)} ${selectedSign} ${displayFractionLabel(current.right)}`,
    );
  };

  const leftCrossProduct = improperNumerator(current.left) * current.right.denominator;
  const rightCrossProduct = improperNumerator(current.right) * current.left.denominator;

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName={styles.guidedFrameContent}
      eyebrow="Dział 3 · Ułamki zwykłe"
      heading={ACTIVITY_TITLES[activity]}
      description={description}
      questionNumber={activeTask + 1}
      questionCount={tasks.length}
      data-fraction-comparison-l1
      data-fraction-activity={activity}
      data-guided-comparison
    >
      <section className={styles.ruleCard}>
        <p className={styles.ruleLabel}>Zasada</p>
        <h3>
          {activity === "same-denominator"
            ? "Gdy mianowniki są jednakowe, większy jest ułamek z większym licznikiem."
            : activity === "same-numerator"
              ? "Gdy liczniki są jednakowe, większy jest ułamek z mniejszym mianownikiem."
              : activity === "common-measure"
                ? "Gdy liczniki i mianowniki są różne, sprowadź ułamki do wspólnego licznika albo mianownika."
              : "Gdy liczniki i mianowniki są różne, porównaj iloczyny otrzymane po skosie."}
        </h3>
        {activity === "cross-multiplication"
          ? <CrossMultiplicationExample step={crossStep} onStepChange={setCrossStep} disabled={controlsLocked} />
          : activity === "common-measure"
            ? <div className={styles.commonMeasureExample}><StaticLessonFraction value={{ numerator: 2, denominator: 3 }} accent="cyan" /> <strong>&lt;</strong> <StaticLessonFraction value={{ numerator: 3, denominator: 4 }} accent="violet" /><span>6/9 &lt; 6/8</span></div>
            : <CircleRuleExample activity={activity} />}
      </section>

      <div className={styles.guidedTaskTabs} role="tablist" aria-label="Zadania na tym slajdzie">
        {tasks.map((task, index) => (
          <button
            key={task.id}
            type="button"
            role="tab"
            aria-label={`Zadanie ${index + 1}`}
            aria-selected={activeTask === index}
            disabled={index > unlockedThrough}
            className={`${styles.guidedTaskTab} ${activeTask === index ? styles.guidedTaskTabActive : ""} ${solved.has(index) ? styles.guidedTaskTabSolved : ""}`}
            onClick={() => selectTask(index)}
          >
            {solved.has(index) ? "✓" : index + 1}
          </button>
        ))}
      </div>

      <section className={styles.studentTaskCard} role="tabpanel">
        <p className={styles.studentTaskPrompt}>Wstaw właściwy znak.</p>
        {current.visual ? (
          <TaskShapeComparison task={current} sign={selectedSign} />
        ) : (
          <div className={styles.guidedComparisonRow}>
            <StaticLessonFraction value={current.left} accent="cyan" />
            <strong className={styles.guidedSelectedSign} aria-label={selectedSign ? `wybrany znak ${selectedSign}` : "pusta kratka na znak"}>{selectedSign ?? ""}</strong>
            <StaticLessonFraction value={current.right} accent="violet" />
          </div>
        )}

        {activity === "cross-multiplication" ? (
          <div className={styles.taskCrossHelp}>
            <p>Połącz liczby po skosie. Wpisz oba iloczyny nad odpowiednimi ułamkami.</p>
            <div className={styles.productInputRow}>
              <button type="button" className={`${styles.productInput} ${activeProduct === "left" ? styles.productInputActive : ""}`} onClick={() => setActiveProduct("left")} disabled={controlsLocked} aria-label="Iloczyn nad pierwszym ułamkiem">{currentProducts.left || "□"}</button>
              <span aria-hidden>×</span>
              <button type="button" className={`${styles.productInput} ${activeProduct === "right" ? styles.productInputActive : ""}`} onClick={() => setActiveProduct("right")} disabled={controlsLocked} aria-label="Iloczyn nad drugim ułamkiem">{currentProducts.right || "□"}</button>
            </div>
            {!controlsLocked ? <LessonNumericKeypad onKey={editProduct} disabled={controlsLocked} label="Klawiatura do iloczynów motylkowych" helperText="Najpierw wybierz kratkę nad ułamkiem." /> : null}
          </div>
        ) : null}

        <div className={styles.guidedSignChoices} role="group" aria-label="Wybierz znak porównania">
          {(["<", ">"] as const).map((candidate) => (
            <LessonTaskChoice
              key={candidate}
              type="button"
              className={styles.guidedSignButton}
              selected={selectedSign === candidate}
              disabled={controlsLocked}
              aria-label={`Wstaw znak ${candidate}`}
              onClick={() => selectSign(candidate)}
            >
              {candidate}
            </LessonTaskChoice>
          ))}
        </div>
        {!controlsLocked ? (
          <button type="button" className={styles.guidedCheckButton} onClick={checkAnswer}>Prześlij zadanie</button>
        ) : null}
        {feedback ? (
          <p role="status" className={feedback.correct ? styles.guidedSuccess : styles.guidedError}>{feedback.correct ? "✓ " : "↻ "}{feedback.message}</p>
        ) : null}
      </section>
    </LessonTaskFrame>
  );
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

  if (isGuidedComparisonActivity(activity)) {
    return (
      <GuidedComparisonSlide
        key={`${activity}-${effectiveSeed}`}
        activity={activity}
        readOnly={props.readOnly}
        presentationMode={props.presentationMode}
        onResultChange={props.onResultChange}
      />
    );
  }

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
