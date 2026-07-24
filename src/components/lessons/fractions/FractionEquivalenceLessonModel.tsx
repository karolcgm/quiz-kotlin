"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskChoice, LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { FractionBarModel } from "@/components/lessons/fractions/FractionBarModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  createFractionEquivalenceDiagnosticResult,
  createPublicFractionEquivalenceTask,
  expandFraction,
  FRACTION_EQUIVALENCE_REASON_CODE,
  FRACTION_NON_INTEGER_DIVISOR_CODE,
  parseDivisorPath,
  simplifyFractionBy,
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
  "equivalence-theory-check": "Sprawdź, co już wiesz",
  "denser-partition": "Ta sama część, gęstszy podział",
  "expansion-grid": "Rozszerz do wskazanej liczby",
  "common-denominator-pair": "Rozszerz do wspólnego mianownika",
  "collapse-partition": "Zwiń podział",
  "cross-out-rewrite": "Przekreśl i zapisz",
  "equivalent-chain": "Do postaci nieskracalnej",
  "equivalence-review": "Ćwiczenia — 5 przykładów",
  "paint-lab": "Laboratorium mozaiki",
  "independent-equivalence": "Samodzielna próba",
  "independent-simplification": "Samodzielne skracanie",
};

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Zadanie 1",
  core: "Zadanie 2",
  challenge: "Zadanie 3",
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

function StaticFraction({ value, label, crossed = false }: { value: FractionValue; label: string; crossed?: boolean }) {
  return (
    <span className={styles.staticFraction} aria-label={`${label}: ${value.numerator}/${value.denominator}`}>
      <span className={crossed ? styles.crossedNumber : undefined}>{value.numerator}</span>
      <span className={styles.staticLine} aria-hidden />
      <span className={crossed ? styles.crossedNumber : undefined}>{value.denominator}</span>
    </span>
  );
}

interface TheoryOption {
  id: string;
  label?: string;
  fraction?: FractionValue;
}

interface TheoryTask {
  id: string;
  prompt: string;
  options: TheoryOption[];
  correct: string;
  explanation: string;
}

const THEORY_TASKS: TheoryTask[] = [
  {
    id: "irreducible",
    prompt: "Który ułamek jest nieskracalny?",
    options: [
      { id: "five-eighths", fraction: { numerator: 5, denominator: 8 } },
      { id: "six-ninths", fraction: { numerator: 6, denominator: 9 } },
      { id: "eight-twelfths", fraction: { numerator: 8, denominator: 12 } },
    ],
    correct: "five-eighths",
    explanation: "Liczby 5 i 8 nie mają wspólnego dzielnika większego od 1.",
  },
  {
    id: "reducible",
    prompt: "Który ułamek jest skracalny?",
    options: [
      { id: "seven-elevenths", fraction: { numerator: 7, denominator: 11 } },
      { id: "nine-fifteenths", fraction: { numerator: 9, denominator: 15 } },
      { id: "five-twelfths", fraction: { numerator: 5, denominator: 12 } },
    ],
    correct: "nine-fifteenths",
    explanation: "Licznik 9 i mianownik 15 można podzielić przez 3.",
  },
  {
    id: "expansion-definition",
    prompt: "Co oznacza rozszerzyć ułamek?",
    options: [
      { id: "same-factor", label: "Pomnożyć licznik i mianownik przez tę samą liczbę większą od 1." },
      { id: "numerator-only", label: "Pomnożyć tylko licznik." },
      { id: "different-factors", label: "Pomnożyć licznik i mianownik przez różne liczby." },
    ],
    correct: "same-factor",
    explanation: "Ta sama liczba nad i pod kreską zmienia zapis, ale nie zmienia wartości ułamka.",
  },
];

const CROSS_OUT_TASKS = [
  { id: "three-sixths", source: { numerator: 3, denominator: 6 }, divisors: [2, 3] },
  { id: "eight-twelfths", source: { numerator: 8, denominator: 12 }, divisors: [2, 3, 4] },
  { id: "fifteen-twenty-fifths", source: { numerator: 15, denominator: 25 }, divisors: [3, 5] },
  { id: "eighteen-twenty-fourths", source: { numerator: 18, denominator: 24 }, divisors: [2, 3, 6] },
] as const;

const CHAIN_TASKS = [
  { source: { numerator: 18, denominator: 24 }, result: { numerator: 3, denominator: 4 }, factor: 6 },
  { source: { numerator: 10, denominator: 15 }, result: { numerator: 2, denominator: 3 }, factor: 5 },
  { source: { numerator: 14, denominator: 21 }, result: { numerator: 2, denominator: 3 }, factor: 7 },
  { source: { numerator: 32, denominator: 48 }, result: { numerator: 2, denominator: 3 }, factor: 16 },
  { source: { numerator: 35, denominator: 49 }, result: { numerator: 5, denominator: 7 }, factor: 7 },
] as const;

const EXPANSION_TASKS = [
  { id: "five-sevenths", source: { numerator: 5, denominator: 7 }, expected: { numerator: 40, denominator: 56 }, lockedPart: "denominator" as const, targetText: "mianownika 56" },
  { id: "seven-twelfths", source: { numerator: 7, denominator: 12 }, expected: { numerator: 35, denominator: 60 }, lockedPart: "numerator" as const, targetText: "licznika 35" },
  { id: "eleven-fifteenths", source: { numerator: 11, denominator: 15 }, expected: { numerator: 33, denominator: 45 }, lockedPart: "denominator" as const, targetText: "mianownika 45" },
  { id: "nine-fourteenths", source: { numerator: 9, denominator: 14 }, expected: { numerator: 72, denominator: 112 }, lockedPart: "numerator" as const, targetText: "licznika 72" },
] as const;

const COMMON_DENOMINATOR_TASKS = [
  { id: "third-fourth", target: 12, first: { source: { numerator: 1, denominator: 3 }, expected: { numerator: 4, denominator: 12 } }, second: { source: { numerator: 1, denominator: 4 }, expected: { numerator: 3, denominator: 12 } } },
  { id: "fifths-fourths", target: 20, first: { source: { numerator: 2, denominator: 5 }, expected: { numerator: 8, denominator: 20 } }, second: { source: { numerator: 3, denominator: 4 }, expected: { numerator: 15, denominator: 20 } } },
  { id: "eighths-sixths", target: 24, first: { source: { numerator: 3, denominator: 8 }, expected: { numerator: 9, denominator: 24 } }, second: { source: { numerator: 5, denominator: 6 }, expected: { numerator: 20, denominator: 24 } } },
  { id: "thirds-fifths", target: 15, first: { source: { numerator: 2, denominator: 3 }, expected: { numerator: 10, denominator: 15 } }, second: { source: { numerator: 3, denominator: 5 }, expected: { numerator: 9, denominator: 15 } } },
] as const;

const REVIEW_TASKS = [
  { id: "review-simplify-one", kind: "single" as const, mode: "simplify" as const, source: { numerator: 12, denominator: 18 }, expected: { numerator: 2, denominator: 3 }, factor: 6, prompt: "Skróć ułamek do postaci nieskracalnej." },
  { id: "review-expand-one", kind: "single" as const, mode: "expand" as const, source: { numerator: 2, denominator: 7 }, expected: { numerator: 6, denominator: 21 }, factor: 3, prompt: "Rozszerz ułamek do mianownika 21." },
  { id: "review-expand-two", kind: "single" as const, mode: "expand" as const, source: { numerator: 3, denominator: 5 }, expected: { numerator: 12, denominator: 20 }, factor: 4, prompt: "Rozszerz ułamek do licznika 12." },
  { id: "review-simplify-two", kind: "single" as const, mode: "simplify" as const, source: { numerator: 21, denominator: 28 }, expected: { numerator: 3, denominator: 4 }, factor: 7, prompt: "Skróć ułamek do postaci nieskracalnej." },
  { id: "review-common", kind: "pair" as const, target: 12, first: { source: { numerator: 1, denominator: 3 }, expected: { numerator: 4, denominator: 12 }, factor: 4 }, second: { source: { numerator: 3, denominator: 4 }, expected: { numerator: 9, denominator: 12 }, factor: 3 }, prompt: "Rozszerz oba ułamki do wspólnego mianownika 12." },
] as const;

function digitCells(value: number): number {
  return String(value).length;
}

function fractionDigits(value: number): FractionStackValue["numerator"] {
  return String(value).split("") as FractionStackValue["numerator"];
}

function initialExpansionAnswer(task: (typeof EXPANSION_TASKS)[number]): FractionStackValue {
  return {
    numerator: task.lockedPart === "numerator" ? fractionDigits(task.expected.numerator) : [""],
    denominator: task.lockedPart === "denominator" ? fractionDigits(task.expected.denominator) : Array.from({ length: digitCells(task.expected.denominator) }, () => ""),
  };
}

function TaskTabs({
  count,
  active,
  solved,
  onSelect,
}: {
  count: number;
  active: number;
  solved: boolean[];
  onSelect: (index: number) => void;
}) {
  return (
    <LessonTaskNavigator
      currentIndex={active}
      taskCount={count}
      completed={solved[active] ?? false}
      completedCount={solved.filter(Boolean).length}
      onPrevious={() => onSelect(Math.max(0, active - 1))}
      onNext={() => onSelect(Math.min(count - 1, active + 1))}
      previousDisabled={active === 0}
      nextDisabled={active === count - 1 || !solved[active]}
    />
  );
}

function EquivalentAreaInterpretation({
  source,
  result,
  action,
}: {
  source: FractionValue;
  result: FractionValue;
  action: "expand" | "simplify";
}) {
  const factor = action === "expand"
    ? result.denominator / source.denominator
    : source.denominator / result.denominator;
  const operation = action === "expand" ? `× ${factor}` : `÷ ${factor}`;
  const renderModel = (value: FractionValue, label: string) => (
    <figure className={styles.areaFigure}>
      <div
        className={styles.areaModel}
        style={{ gridTemplateColumns: `repeat(${value.denominator}, minmax(0, 1fr))` }}
        aria-label={`${label}: zaznaczono ${value.numerator} z ${value.denominator} równych części`}
      >
        {Array.from({ length: value.denominator }, (_, index) => (
          <span key={index} data-painted={index < value.numerator || undefined} />
        ))}
      </div>
      <figcaption><StaticFraction value={value} label={label} /></figcaption>
    </figure>
  );

  return (
    <section className={styles.interpretationCard} data-equivalent-area-interpretation>
      <div className={styles.interpretationHeading}>
        <strong>Interpretacja: ta sama powierzchnia</strong>
        <span>Granice części się zmieniają, ale kolor kończy się dokładnie w tym samym miejscu.</span>
      </div>
      <div className={styles.areaComparison}>
        {renderModel(source, action === "expand" ? "rzadszy podział" : "gęstszy podział")}
        <div className={styles.operationBridge} aria-label={`${operation} dla licznika i mianownika`}>
          <span>Licznik {operation}</span>
          <b>=</b>
          <span>Mianownik {operation}</span>
        </div>
        {renderModel(result, action === "expand" ? "gęstszy podział" : "rzadszy podział")}
      </div>
      <p><b>Wniosek:</b> wykonujemy to samo działanie nad i pod kreską, więc opis części się zmienia, a jej wielkość nie.</p>
    </section>
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
  const chainIndex = Math.max(0, Math.min(CHAIN_TASKS.length - 1, (questionNumber ?? 1) - 1));
  const chainTask = CHAIN_TASKS[chainIndex]!;
  const [denseMultiplier, setDenseMultiplier] = useState(2);
  const [numeratorFactor, setNumeratorFactor] = useState(task.factor);
  const [denominatorFactor, setDenominatorFactor] = useState(task.factor);
  const [expansionStack, setExpansionStack] = useState<FractionStackValue>(() => blankStack());
  const [collapseNumeratorDivisor, setCollapseNumeratorDivisor] = useState(String(task.factor));
  const [collapseDenominatorDivisor, setCollapseDenominatorDivisor] = useState(String(task.factor));
  const [collapseStack, setCollapseStack] = useState<FractionStackValue>(() => blankStack());
  const [chainStack, setChainStack] = useState<FractionStackValue>(() => blankStack(task.chain[2]?.denominator));
  const [reason, setReason] = useState("");
  const [wallDivision, setWallDivision] = useState(task.source.denominator);
  const [numeratorPath, setNumeratorPath] = useState("");
  const [denominatorPath, setDenominatorPath] = useState("");
  const [finalStack, setFinalStack] = useState<FractionStackValue>(() => blankStack());
  const [diagnosticCode, setDiagnosticCode] = useState<FractionEquivalenceDiagnosticCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [theoryIndex, setTheoryIndex] = useState(0);
  const [theoryChoices, setTheoryChoices] = useState<Record<string, string>>({});
  const [theorySolved, setTheorySolved] = useState<boolean[]>(() => THEORY_TASKS.map(() => false));
  const [crossOutIndex, setCrossOutIndex] = useState(0);
  const [crossOutSolved, setCrossOutSolved] = useState<boolean[]>(() => CROSS_OUT_TASKS.map(() => false));
  const [crossOutDivisors, setCrossOutDivisors] = useState<Record<string, number | null>>(() => Object.fromEntries(CROSS_OUT_TASKS.map((item) => [item.id, null])));
  const [crossOutAnswers, setCrossOutAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(CROSS_OUT_TASKS.map((item) => [item.id, blankStack()])));
  const [expansionIndex, setExpansionIndex] = useState(0);
  const [expansionSolved, setExpansionSolved] = useState<boolean[]>(() => EXPANSION_TASKS.map(() => false));
  const [expansionAnswers, setExpansionAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(EXPANSION_TASKS.map((item) => [item.id, initialExpansionAnswer(item)])));
  const [commonIndex, setCommonIndex] = useState(0);
  const [commonSolved, setCommonSolved] = useState<boolean[]>(() => COMMON_DENOMINATOR_TASKS.map(() => false));
  const [commonAnswers, setCommonAnswers] = useState<Record<string, { first: FractionStackValue; second: FractionStackValue }>>(() => Object.fromEntries(COMMON_DENOMINATOR_TASKS.map((item) => [item.id, { first: blankStack(), second: blankStack() }])));
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, { first: FractionStackValue; second?: FractionStackValue }>>(() => Object.fromEntries(REVIEW_TASKS.map((item) => [item.id, { first: blankStack(), second: item.kind === "pair" ? blankStack() : undefined }])));

  const independentActivity = activity === "independent-equivalence" || activity === "independent-simplification";
  const controlsLocked = readOnly || presentationMode && independentActivity;
  const legacyControls = activity === "denser-partition" || activity === "collapse-partition" || activity === "paint-lab" || independentActivity;
  const internalProgress = activity === "equivalence-theory-check"
    ? { index: theoryIndex, count: THEORY_TASKS.length }
    : activity === "cross-out-rewrite"
      ? { index: crossOutIndex, count: CROSS_OUT_TASKS.length }
      : activity === "expansion-grid"
        ? { index: expansionIndex, count: EXPANSION_TASKS.length }
        : activity === "common-denominator-pair"
          ? { index: commonIndex, count: COMMON_DENOMINATOR_TASKS.length }
          : activity === "equivalence-review"
            ? { index: Math.max(0, Math.min(REVIEW_TASKS.length - 1, (questionNumber ?? 1) - 1)), count: REVIEW_TASKS.length }
          : activity === "equivalent-chain"
            ? { index: chainIndex, count: CHAIN_TASKS.length }
            : null;
  const diagnostic = diagnosticCode
    ? createFractionEquivalenceDiagnosticResult(diagnosticCode)
    : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    setErrorMessage(null);
    onResultChange?.(null);
  };

  const fail = (code: FractionEquivalenceDiagnosticCode, answerLabel?: string) => {
    setDiagnosticCode(code);
    setSuccessMessage(null);
    setErrorMessage(null);
    onResultChange?.(false, answerLabel);
  };

  const failMessage = (message: string, answerLabel?: string) => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    setErrorMessage(message);
    onResultChange?.(false, answerLabel);
  };

  const succeed = (message: string, answerLabel?: string) => {
    setDiagnosticCode(null);
    setSuccessMessage(message);
    setErrorMessage(null);
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

  const checkExpansion = () => {
    const example = EXPANSION_TASKS[expansionIndex]!;
    const answer = expansionAnswers[example.id]!;
    const code = parserCode(answer);
    if (code) return fail(code, stackText(answer));
    const parsed = parseFractionStackValue(answer);
    if (!parsed.ok) return;
    const factor = example.expected.denominator / example.source.denominator;
    const validation = validateEquivalentTransformation({
      source: example.source,
      result: parsed.value,
      mode: "expand",
      numeratorFactor: factor,
      denominatorFactor: factor,
    });
    if (validation) return fail(validation, stackText(answer));
    setExpansionSolved((current) => current.map((value, index) => index === expansionIndex ? true : value));
    succeed("Dobrze. Licznik i mianownik zostały pomnożone przez tę samą liczbę.", stackText(answer));
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
    const validation = validateSimplificationPath({
      source: chainTask.source,
      result: parsed.value,
      numeratorDivisors: [chainTask.factor],
      denominatorDivisors: [chainTask.factor],
    });
    if (validation) return fail(validation, stackText(chainStack));
    succeed("Ułamek został skrócony do postaci nieskracalnej.", stackText(chainStack));
  };

  const checkTheory = () => {
    const example = THEORY_TASKS[theoryIndex]!;
    const choice = theoryChoices[example.id];
    if (!choice) return failMessage("Najpierw wybierz jedną odpowiedź.");
    if (choice !== example.correct) return failMessage("To jeszcze nie ta odpowiedź. Sprawdź wspólne dzielniki licznika i mianownika albo przypomnij sobie zasadę tej samej liczby nad i pod kreską.", choice);
    setTheorySolved((current) => current.map((value, index) => index === theoryIndex ? true : value));
    succeed(example.explanation, choice);
  };

  const checkCrossOut = () => {
    const example = CROSS_OUT_TASKS[crossOutIndex]!;
    const divisor = crossOutDivisors[example.id];
    if (!divisor) return failMessage("Najpierw wybierz dzielnik.");
    const expected = simplifyFractionBy(example.source, divisor);
    if (!expected) return fail(FRACTION_NON_INTEGER_DIVISOR_CODE, String(divisor));
    const answer = crossOutAnswers[example.id]!;
    const code = parserCode(answer);
    if (code) return fail(code, stackText(answer));
    const parsed = parseFractionStackValue(answer);
    if (!parsed.ok) return;
    if (parsed.value.numerator !== expected.numerator || parsed.value.denominator !== expected.denominator) {
      return fail(FRACTION_FEEDBACK_CODES.wrongOperationPair, stackText(answer));
    }
    setCrossOutSolved((current) => current.map((value, index) => index === crossOutIndex ? true : value));
    succeed("Poprawnie: licznik i mianownik podzielono przez ten sam wspólny dzielnik.", stackText(answer));
  };

  const checkCommonDenominator = () => {
    const example = COMMON_DENOMINATOR_TASKS[commonIndex]!;
    const answers = commonAnswers[example.id]!;
    const firstCode = parserCode(answers.first);
    if (firstCode) return fail(firstCode, stackText(answers.first));
    const secondCode = parserCode(answers.second);
    if (secondCode) return fail(secondCode, stackText(answers.second));
    const first = parseFractionStackValue(answers.first);
    const second = parseFractionStackValue(answers.second);
    if (!first.ok || !second.ok) return;
    const firstFactor = example.target / example.first.source.denominator;
    const secondFactor = example.target / example.second.source.denominator;
    const firstValidation = validateEquivalentTransformation({ source: example.first.source, result: first.value, mode: "expand", numeratorFactor: firstFactor, denominatorFactor: firstFactor });
    if (firstValidation) return fail(firstValidation, stackText(answers.first));
    const secondValidation = validateEquivalentTransformation({ source: example.second.source, result: second.value, mode: "expand", numeratorFactor: secondFactor, denominatorFactor: secondFactor });
    if (secondValidation) return fail(secondValidation, stackText(answers.second));
    if (first.value.denominator !== second.value.denominator) return failMessage("Oba wyniki muszą mieć dokładnie ten sam mianownik.");
    setCommonSolved((current) => current.map((value, index) => index === commonIndex ? true : value));
    succeed(`Dobrze. Oba ułamki mają teraz wspólny mianownik ${example.target}.`, `${stackText(answers.first)}, ${stackText(answers.second)}`);
  };

  const checkReview = () => {
    const index = Math.max(0, Math.min(REVIEW_TASKS.length - 1, (questionNumber ?? 1) - 1));
    const example = REVIEW_TASKS[index]!;
    const answers = reviewAnswers[example.id]!;
    const firstCode = parserCode(answers.first);
    if (firstCode) return fail(firstCode, stackText(answers.first));
    const first = parseFractionStackValue(answers.first);
    if (!first.ok) return;
    if (example.kind === "single") {
      const validation = validateEquivalentTransformation({
        source: example.source,
        result: first.value,
        mode: example.mode,
        numeratorFactor: example.factor,
        denominatorFactor: example.factor,
      });
      if (validation) return fail(validation, stackText(answers.first));
      succeed("Poprawny wynik. Możesz przejść do następnego przykładu.", stackText(answers.first));
      return;
    }
    if (!answers.second) return failMessage("Uzupełnij oba ułamki.");
    const secondCode = parserCode(answers.second);
    if (secondCode) return fail(secondCode, stackText(answers.second));
    const second = parseFractionStackValue(answers.second);
    if (!second.ok) return;
    const firstValidation = validateEquivalentTransformation({ source: example.first.source, result: first.value, mode: "expand", numeratorFactor: example.first.factor, denominatorFactor: example.first.factor });
    if (firstValidation) return fail(firstValidation, stackText(answers.first));
    const secondValidation = validateEquivalentTransformation({ source: example.second.source, result: second.value, mode: "expand", numeratorFactor: example.second.factor, denominatorFactor: example.second.factor });
    if (secondValidation) return fail(secondValidation, stackText(answers.second));
    succeed("Oba ułamki mają poprawny wspólny mianownik.", `${stackText(answers.first)}, ${stackText(answers.second)}`);
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
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName={styles.activityFrameContent}
      eyebrow="Dział 3 · Ułamki zwykłe"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber ?? (internalProgress ? internalProgress.index + 1 : undefined)}
      questionCount={questionCount ?? internalProgress?.count}
      data-fraction-equivalence-lesson
      data-fraction-activity={activity}
      data-orientation-contract="portrait-landscape"
      data-generator-id={task.generatorId}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-motion-paused={motionPaused}
    >
      {legacyControls ? <div className={styles.topControls}>
        {independentActivity && !onResultChange && !readOnly ? (
          <LessonTaskNavigator
            currentIndex={activeDifficulty === "support" ? 0 : activeDifficulty === "core" ? 1 : 2}
            taskCount={3}
            onPrevious={() => chooseDifficulty(activeDifficulty === "challenge" ? "core" : "support")}
            onNext={() => chooseDifficulty(activeDifficulty === "support" ? "core" : "challenge")}
            previousDisabled={activeDifficulty === "support"}
            nextDisabled={activeDifficulty === "challenge"}
          />
        ) : <span className={styles.difficultyLabel}>Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</span>}
        <button type="button" className={styles.motionButton} aria-pressed={motionPaused} onClick={() => setMotionPaused((value) => !value)}>
          {motionPaused ? "Włącz płynne przejścia" : "Zatrzymaj ruch"}
        </button>
      </div> : null}

      {activity === "equivalence-theory-check" ? (() => {
        const example = THEORY_TASKS[theoryIndex]!;
        const selected = theoryChoices[example.id];
        return (
          <div className={styles.activityStack}>
            <TaskTabs count={THEORY_TASKS.length} active={theoryIndex} solved={theorySolved} onSelect={(index) => { setTheoryIndex(index); clearResult(); }} />
            <section className={styles.taskCard} role="tabpanel">
              <h3>{example.prompt}</h3>
              <div className={styles.theoryChoices}>
                {example.options.map((option) => (
                  <LessonTaskChoice
                    key={option.id}
                    type="button"
                    disabled={controlsLocked}
                    selected={selected === option.id}
                    onClick={() => { setTheoryChoices((current) => ({ ...current, [example.id]: option.id })); clearResult(); }}
                  >
                    {option.fraction ? <StaticFraction value={option.fraction} label="ułamek do wyboru" /> : option.label}
                  </LessonTaskChoice>
                ))}
              </div>
              {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkTheory}>Sprawdź odpowiedź</button> : null}
            </section>
          </div>
        );
      })() : null}

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
          <EquivalentAreaInterpretation source={task.source} result={denseResult} action="expand" />
          <p className={styles.invariant} role="status">{task.source.numerator}/{task.source.denominator} = {denseResult.numerator}/{denseResult.denominator}. Liczba części rośnie, lecz zaznaczone pole i punkt na osi pozostają takie same.</p>
        </div>
      ) : null}

      {activity === "expansion-grid" ? (
        (() => {
          const example = EXPANSION_TASKS[expansionIndex]!;
          const answer = expansionAnswers[example.id]!;
          return (
            <div className={styles.activityStack}>
              <TaskTabs count={EXPANSION_TASKS.length} active={expansionIndex} solved={expansionSolved} onSelect={(index) => { setExpansionIndex(index); clearResult(); }} />
              <section className={styles.taskCard} role="tabpanel">
                <h3>Rozszerz ułamek do {example.targetText}.</h3>
                <div className={`${styles.equationRow} ${styles.expansionEquation}`}>
                  <StaticFraction value={example.source} label="ułamek przed rozszerzeniem" />
                  <span>=</span>
                  <div className={styles.answerFraction}>
                    <FractionStackInput
                      value={answer}
                      onChange={(value) => { setExpansionAnswers((current) => ({ ...current, [example.id]: value })); clearResult(); }}
                      readOnly={controlsLocked}
                      readOnlyParts={[example.lockedPart]}
                      showKeypad={!controlsLocked}
                      fixedDigitCells={{ numerator: digitCells(example.expected.numerator), denominator: digitCells(example.expected.denominator) }}
                      onSubmit={() => checkExpansion()}
                      stepLabel={example.lockedPart === "denominator" ? "Wpisz brakujący licznik" : "Wpisz brakujący mianownik"}
                    />
                  </div>
                </div>
                <p className={styles.hint}>Najpierw ustal, przez ile pomnożono podaną część ułamka. Tę samą liczbę zastosuj po drugiej stronie kreski.</p>
                <EquivalentAreaInterpretation source={example.source} result={example.expected} action="expand" />
              </section>
            </div>
          );
        })()
      ) : null}

      {activity === "collapse-partition" ? (
        <div className={styles.activityStack}>
          <section className={styles.taskCard}>
            <h3>Rozszerzanie: zapis się zmienia, zaznaczona część zostaje ta sama.</h3>
            <div className={styles.theoryEquation}><StaticFraction value={{ numerator: 4, denominator: 7 }} label="cztery siódme" /><span>=</span><StaticFraction value={{ numerator: 16, denominator: 28 }} label="szesnaście dwudziestych ósmych" /></div>
            <p className={styles.theoryRule}>Rozszerzamy ułamek: licznik i mianownik mnożymy przez 4.</p>
            <EquivalentAreaInterpretation source={{ numerator: 4, denominator: 7 }} result={{ numerator: 16, denominator: 28 }} action="expand" />
          </section>
          <section className={styles.taskCard}>
            <h3>Skracanie: łączymy równe części bez zmiany wartości.</h3>
            <div className={styles.theoryEquation}><StaticFraction value={{ numerator: 12, denominator: 36 }} label="dwanaście trzydziestych szóstych" /><span>=</span><StaticFraction value={{ numerator: 1, denominator: 3 }} label="jedna trzecia" /></div>
            <p className={styles.theoryRule}>Skracamy ułamek: licznik i mianownik dzielimy przez 12.</p>
            <EquivalentAreaInterpretation source={{ numerator: 12, denominator: 36 }} result={{ numerator: 1, denominator: 3 }} action="simplify" />
          </section>
          {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={() => succeed("Rozszerzanie mnoży, a skracanie dzieli licznik i mianownik przez tę samą liczbę.", "4/7 = 16/28; 12/36 = 1/3")}>Prześlij zadanie</button> : null}
        </div>
      ) : null}

      {activity === "cross-out-rewrite" ? (
        (() => {
          const example = CROSS_OUT_TASKS[crossOutIndex]!;
          const divisor = crossOutDivisors[example.id];
          const preview = divisor ? simplifyFractionBy(example.source, divisor) : null;
          const answer = crossOutAnswers[example.id]!;
          return (
            <div className={styles.activityStack}>
              <TaskTabs count={CROSS_OUT_TASKS.length} active={crossOutIndex} solved={crossOutSolved} onSelect={(index) => { setCrossOutIndex(index); clearResult(); }} />
              <section className={styles.taskCard} role="tabpanel">
                <h3>Wybierz wspólny dzielnik i skróć ułamek.</h3>
                <div className={styles.crossOutWorkspace}>
                  <StaticFraction value={example.source} label="ułamek przed skróceniem" crossed={Boolean(divisor)} />
                  <div className={styles.factorPicker} aria-label="Wybierz wspólny dzielnik">
                    <strong>Wybierz liczbę, przez którą dzielisz oba pola</strong>
                    <div className={styles.divisorChoices}>
                      {example.divisors.map((option) => (
                        <LessonTaskChoice
                          key={option}
                          type="button"
                          disabled={controlsLocked}
                          selected={divisor === option}
                          onClick={() => {
                            setCrossOutDivisors((current) => ({ ...current, [example.id]: option }));
                            setCrossOutAnswers((current) => ({ ...current, [example.id]: blankStack() }));
                            clearResult();
                          }}
                        >
                          ÷ {option}
                        </LessonTaskChoice>
                      ))}
                    </div>
                    <span>Ten sam dzielnik działa na licznik i mianownik.</span>
                  </div>
                  <span>=</span>
                  <div className={styles.answerFraction}>
                    <FractionStackInput
                      value={answer}
                      onChange={(value) => { setCrossOutAnswers((current) => ({ ...current, [example.id]: value })); clearResult(); }}
                      readOnly={controlsLocked}
                      showKeypad={!controlsLocked}
                      fixedDigitCells={{ numerator: digitCells(preview?.numerator ?? 1), denominator: digitCells(preview?.denominator ?? 1) }}
                      stepLabel="Wpisz ułamek po skróceniu"
                    />
                  </div>
                </div>
                {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkCrossOut}>Prześlij zadanie</button> : null}
              </section>
            </div>
          );
        })()
      ) : null}

      {activity === "equivalent-chain" ? (
        <div className={styles.activityStack}>
          <section className={styles.taskCard}>
            <h3>Skróć jeden ułamek do postaci nieskracalnej.</h3>
            <div className={styles.equationRow}>
              <StaticFraction value={chainTask.source} label="ułamek do skrócenia" />
              <span>=</span>
              <div className={styles.answerFraction}>
                <FractionStackInput value={chainStack} onChange={(value) => { setChainStack(value); clearResult(); }} readOnly={controlsLocked} showKeypad={false} fixedDigitCells={{ numerator: digitCells(chainTask.result.numerator), denominator: digitCells(chainTask.result.denominator) }} stepLabel="Wpisz postać nieskracalną" />
              </div>
            </div>
            {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkChain}>Prześlij zadanie</button> : null}
          </section>
        </div>
      ) : null}

      {activity === "common-denominator-pair" ? (() => {
        const example = COMMON_DENOMINATOR_TASKS[commonIndex]!;
        const answers = commonAnswers[example.id]!;
        const renderEquation = (which: "first" | "second") => {
          const row = example[which];
          const answer = answers[which];
          return (
            <div className={styles.commonEquation}>
              <StaticFraction value={row.source} label={which === "first" ? "pierwszy ułamek" : "drugi ułamek"} />
              <span>=</span>
              <div className={styles.answerFraction}>
                <FractionStackInput
                  value={answer}
                  onChange={(value) => { setCommonAnswers((current) => ({ ...current, [example.id]: { ...current[example.id]!, [which]: value } })); clearResult(); }}
                  readOnly={controlsLocked}
                  showKeypad={false}
                  fixedDigitCells={{ numerator: digitCells(row.expected.numerator), denominator: digitCells(row.expected.denominator) }}
                  stepLabel={which === "first" ? "Rozszerz pierwszy ułamek" : "Rozszerz drugi ułamek"}
                />
              </div>
            </div>
          );
        };
        return (
          <div className={styles.activityStack}>
            <TaskTabs count={COMMON_DENOMINATOR_TASKS.length} active={commonIndex} solved={commonSolved} onSelect={(index) => { setCommonIndex(index); clearResult(); }} />
            <section className={styles.taskCard} role="tabpanel">
              <h3>Rozszerz oba ułamki do mianownika {example.target}.</h3>
              <div className={styles.commonPair}>
                {renderEquation("first")}
                {renderEquation("second")}
              </div>
              <div className={styles.modelGrid}>
                <EquivalentAreaInterpretation source={example.first.source} result={example.first.expected} action="expand" />
                <EquivalentAreaInterpretation source={example.second.source} result={example.second.expected} action="expand" />
              </div>
              {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkCommonDenominator}>Prześlij zadanie</button> : null}
            </section>
          </div>
        );
      })() : null}

      {activity === "equivalence-review" ? (() => {
        const index = Math.max(0, Math.min(REVIEW_TASKS.length - 1, (questionNumber ?? 1) - 1));
        const example = REVIEW_TASKS[index]!;
        const answers = reviewAnswers[example.id]!;
        const renderReviewRow = (source: FractionValue, expected: FractionValue, which: "first" | "second") => (
          <div className={styles.commonEquation}>
            <StaticFraction value={source} label={which === "first" ? "dany ułamek" : "drugi dany ułamek"} />
            <span>=</span>
            <div className={styles.answerFraction}>
              <FractionStackInput
                value={which === "first" ? answers.first : answers.second ?? blankStack()}
                onChange={(value) => { setReviewAnswers((current) => ({ ...current, [example.id]: { ...current[example.id]!, [which]: value } })); clearResult(); }}
                readOnly={controlsLocked}
                showKeypad={false}
                fixedDigitCells={{ numerator: digitCells(expected.numerator), denominator: digitCells(expected.denominator) }}
                stepLabel="Wpisz ułamek wynikowy"
              />
            </div>
          </div>
        );
        return (
          <div className={styles.activityStack}>
            <section className={styles.taskCard}>
              <h3>{example.prompt}</h3>
              {example.kind === "single" ? renderReviewRow(example.source, example.expected, "first") : (
                <div className={styles.commonPair}>
                  {renderReviewRow(example.first.source, example.first.expected, "first")}
                  {renderReviewRow(example.second.source, example.second.expected, "second")}
                </div>
              )}
              {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkReview}>Sprawdź odpowiedź</button> : null}
            </section>
          </div>
        );
      })() : null}

      {activity === "paint-lab" ? (
        <div className={styles.activityStack}>
          {!controlsLocked ? <InteractionAlternativePanel title="Podział mozaiki" instruction="Wybierz liczbę równych pól. Ten sam pas koloru zajmuje identyczną część mozaiki, choć granic jest coraz więcej."><div className={styles.choiceRow}>{task.chain.map((value) => <button key={value.denominator} type="button" aria-pressed={wallDivision === value.denominator} onClick={() => { setWallDivision(value.denominator); clearResult(); }}>{value.denominator} równych pól</button>)}</div></InteractionAlternativePanel> : null}
          <div className={styles.wall} data-wall-division={wallDivision} style={{ gridTemplateColumns: `repeat(${wallDivision}, minmax(0, 1fr))` }} aria-label={`Mozaika podzielona na ${wallDivision} równych pól; pomalowano ${wallDivision * task.source.numerator / task.source.denominator}`}>
            {Array.from({ length: wallDivision }, (_, index) => <span key={index} data-painted={index < wallDivision * task.source.numerator / task.source.denominator || undefined} />)}
          </div>
          <FractionBarModel bars={task.chain.map((value, index) => ({ id: `paint-${value.denominator}`, label: `${value.numerator}/${value.denominator}`, value, accent: (["indigo", "cyan", "violet"] as const)[index]! }))} />
          <EquivalentNumberLine fractions={task.chain} />
          <EquivalentAreaInterpretation source={task.chain[0]!} result={task.chain.at(-1)!} action="expand" />
          <p className={styles.invariant} role="status">Ta sama pomalowana część mozaiki: {wallDivision * task.source.numerator / task.source.denominator}/{wallDivision}. Zmienia się opis i liczba pól, nie powierzchnia koloru.</p>
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
              <FractionStackInput value={expansionStack} onChange={(value) => { setExpansionStack(value); clearResult(); }} readOnly={controlsLocked} fixedDigitCells={{ numerator: digitCells(task.source.numerator * task.factor), denominator: digitCells(task.source.denominator * task.factor) }} stepLabel="Wpisz ułamek rozszerzony" />
            </section>
            <section className={styles.stackCard}>
              <h3>2. Dowód skracania</h3>
              <label className={styles.pathField}>Dzielniki licznika kolejno<input aria-label="Ścieżka dzielników licznika" value={numeratorPath} readOnly={controlsLocked} placeholder="np. 2, 2 albo 4" onChange={(event) => { setNumeratorPath(event.target.value); clearResult(); }} /></label>
              <label className={styles.pathField}>Dzielniki mianownika kolejno<input aria-label="Ścieżka dzielników mianownika" value={denominatorPath} readOnly={controlsLocked} placeholder="te same liczby" onChange={(event) => { setDenominatorPath(event.target.value); clearResult(); }} /></label>
              <p className={styles.pathHint}>Możesz użyć jednego wspólnego dzielnika albo kilku poprawnych kroków.</p>
            </section>
            <section className={styles.stackCard}>
              <h3>3. Postać nieskracalna</h3>
              <FractionStackInput value={finalStack} onChange={(value) => { setFinalStack(value); clearResult(); }} readOnly={controlsLocked} fixedDigitCells={{ numerator: digitCells(task.source.numerator), denominator: digitCells(task.source.denominator) }} stepLabel="Wpisz końcową postać nieskracalną" />
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
      {errorMessage ? <p className={styles.error} role="alert">{errorMessage}</p> : null}
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
