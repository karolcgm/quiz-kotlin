"use client";

import { useMemo, useState } from "react";
import { FractionCircleModel, fractionSectorPath } from "@/components/lessons/fractions/FractionCircleModel";
import { FractionMatchNumberLine3D } from "@/components/lessons/fractions/FractionMatchNumberLine3D";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { parseFractionStackValue } from "@/lib/math/fractions";
import { introPracticeTask, type FractionTopicIntroActivity } from "@/lib/math/fractions/fractionTopicIntro";
import type { FractionStackValue, FractionValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionTopicIntro.module.css";

const TITLES: Record<FractionTopicIntroActivity, string> = {
  "topic1-shade-colors": "Część całości i część zbioru",
  "topic1-axis-labels": "Ułamki na osi liczbowej",
  "topic1-independent-basic": "Ćwiczenia — 5 przykładów",
  "topic1-classify": "Ułamki właściwe i niewłaściwe",
  "topic1-improper-model": "Koła, ułamek niewłaściwy i liczba mieszana",
  "topic1-unit-fractions": "Ułamek jednostki",
  "topic1-mixed-to-improper-example": "Jak zamienić liczbę mieszaną?",
  "topic1-mixed-to-improper": "Liczba mieszana na ułamek niewłaściwy",
  "topic1-independent-advanced": "Ułamki na osi liczbowej",
  "topic2-halves": "Podziel koła na połówki",
  "topic2-quotient-fractions": "Iloraz zapisany ułamkiem",
  "topic2-wholes-as-fractions": "Całości zapisane ułamkiem",
  "topic2-improper-to-mixed": "Ułamek niewłaściwy na liczbę mieszaną",
  "topic2-independent": "Ćwiczenia — 5 przykładów",
};

const PROMPTS: Record<FractionTopicIntroActivity, string> = {
  "topic1-shade-colors": "Zaznacz tyle równych części, ile wskazuje licznik. Potem zapisz, jaką część wszystkich kółek stanowi każdy kolor.",
  "topic1-axis-labels": "Odczytaj punkty A, B, C i D z osi. Wybierz zapis ułamka, a potem przypisz go do właściwej litery.",
  "topic1-independent-basic": "Połącz pionowy zapis z modelem części całości, zbioru albo osi.",
  "topic1-classify": "Dla każdego pionowego zapisu wybierz: ułamek właściwy albo ułamek niewłaściwy.",
  "topic1-improper-model": "Pokolorowane koła opisz najpierw ułamkiem niewłaściwym, a potem liczbą mieszaną.",
  "topic1-unit-fractions": "Porównaj mniejszą jednostkę z jedną pełną większą jednostką i zapisz wynik pionowym ułamkiem.",
  "topic1-mixed-to-improper-example": "Pomnóż liczbę całości przez mianownik, dodaj licznik, a mianownik pozostaw bez zmiany.",
  "topic1-mixed-to-improper": "Zamień każdą liczbę mieszaną na ułamek niewłaściwy.",
  "topic1-independent-advanced": "Wykonaj dwa zadania na osi od 0 do 6: wpisz kilka wartości w puste kratki, a potem przeciągnij zapisy mieszane i niewłaściwe na właściwe punkty.",
  "topic2-halves": "Wybierz liczbę kół, a następnie przetnij każde koło na dwie równe połówki. Udział jednej osoby zapisz pionowo.",
  "topic2-quotient-fractions": "Dzielna trafia nad kreskę ułamkową, a dodatni dzielnik pod kreskę. Model pokazuje tę samą sytuację.",
  "topic2-wholes-as-fractions": "Podziel dwie figury na tyle samo części. Wszystkie części obu figur utworzą licznik.",
  "topic2-improper-to-mixed": "Zgrupuj pełne koła i zapisz pozostałą część. W tym temacie pracujemy tylko w tę stronę.",
  "topic2-independent": "Przedstaw iloraz ułamkiem, zapisz całość jako ułamek albo zamień ułamek niewłaściwy na liczbę mieszaną.",
};

function blankStack(showWhole = false): FractionStackValue {
  return { wholePart: showWhole ? [""] : undefined, numerator: [""], denominator: [""] };
}

function StaticFraction({ value, label }: { value: FractionValue; label: string }) {
  return <span className={styles.fraction} data-stacked-fraction aria-label={`${label}: licznik ${value.numerator}, mianownik ${value.denominator}`}><span>{value.numerator}</span><span className={styles.fractionLine} /><span>{value.denominator}</span></span>;
}

function StaticMixed({ value, label }: { value: MixedFractionValue; label: string }) {
  return <span className="inline-flex items-center gap-2" aria-label={label}><b className="text-2xl">{value.wholePart}</b><StaticFraction value={{ numerator: value.numerator, denominator: value.denominator }} label="część ułamkowa" /></span>;
}

function parsedMatches(stack: FractionStackValue, expected: FractionValue, whole?: number): boolean {
  const parsed = parseFractionStackValue(stack);
  const expectedNumerator = whole === undefined
    ? expected.numerator
    : whole * expected.denominator + expected.numerator;
  return parsed.ok && parsed.value.numerator === expectedNumerator && parsed.value.denominator === expected.denominator;
}

function CircleCollection({ count, cut }: { count: number; cut: boolean }) {
  return <div className={styles.circleRow} aria-label={`${count} kół${cut ? " podzielonych na połówki" : ""}`}>{Array.from({ length: count }, (_, index) => <div key={index} className={styles.wholeCircle} aria-label={`koło ${index + 1}`}>{cut ? <span className={styles.halfLine} aria-hidden /> : null}</div>)}</div>;
}

const CLASSIFY_VALUES = [
  { numerator: 3, denominator: 5 },
  { numerator: 7, denominator: 4 },
  { numerator: 6, denominator: 6 },
  { numerator: 2, denominator: 9 },
  { numerator: 11, denominator: 8 },
  { numerator: 5, denominator: 12 },
] as const;

const AXIS_WRITE_POINTS = [
  { id: "A", position: 0.75, expected: { numerator: 3, denominator: 4 } },
  { id: "B", position: 1.75, expected: { wholePart: 1, numerator: 3, denominator: 4 } },
  { id: "C", position: 2.5, expected: { wholePart: 2, numerator: 1, denominator: 2 } },
  { id: "D", position: 4.25, expected: { wholePart: 4, numerator: 1, denominator: 4 } },
] as const;

const AXIS_DRAG_LABELS = [
  { id: "three-fourths", position: 0.75, label: "3/4", value: { numerator: 3, denominator: 4 } },
  { id: "seven-fourths", position: 1.75, label: "1 3/4", value: { wholePart: 1, numerator: 3, denominator: 4 } },
  { id: "nine-fourths", position: 2.25, label: "9/4", value: { numerator: 9, denominator: 4 } },
  { id: "seven-halves", position: 3.5, label: "3 1/2", value: { wholePart: 3, numerator: 1, denominator: 2 } },
] as const;

const AXIS_MATCH_ITEMS = [
  { id: "A", position: 3 / 8, value: { numerator: 3, denominator: 8 } },
  { id: "B", position: 3 / 4, value: { numerator: 3, denominator: 4 } },
  { id: "C", position: 13 / 8, value: { wholePart: 1, numerator: 5, denominator: 8 } },
  { id: "D", position: 17 / 8, value: { wholePart: 2, numerator: 1, denominator: 8 } },
] as const;

const CLASSIFICATION_CHOICES = ["proper", "improper"] as const;

function seededShuffle<T>(items: readonly T[], seed: number, salt: number, avoidOriginalOrder = false): T[] {
  const shuffled = [...items];
  let state = (Math.imul(Math.trunc(seed), 0x9e3779b1) ^ salt) >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(next() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex]!, shuffled[index]!];
  }

  // Źródła nie mogą zachować tego samego układu co cele — wtedy można je
  // dopasować "pierwsze do pierwszego" bez odczytania wartości.
  if (avoidOriginalOrder && shuffled.length > 1 && shuffled.every((item, index) => item === items[index])) {
    shuffled.push(shuffled.shift()!);
  }

  return shuffled;
}

function FractionNumberLine({ denominator, selected, onSelect, disabled, markers = [] }: { denominator: number; selected: number | null; onSelect: (value: number) => void; disabled: boolean; markers?: ReadonlyArray<{ position: number; label: string }> }) {
  const points = Array.from({ length: denominator * 6 + 1 }, (_, index) => index / denominator);
  return <div className={styles.practiceNumberLine} data-fraction-number-line aria-label="Oś liczbowa od 0 do 6">
    <div className={styles.practiceAxisTrack} />
    {points.map((value) => {
      const isMajor = Number.isInteger(value);
      const active = selected !== null && Math.abs(selected - value) < 0.0001;
      return <button key={value} type="button" disabled={disabled} aria-label={`Punkt ${value}`} className={`${styles.practiceAxisPoint} ${isMajor ? styles.practiceAxisMajor : ""} ${active ? styles.practiceAxisSelected : ""}`} style={{ left: `${(value / 6) * 100}%` }} onClick={() => onSelect(value)}><span>{isMajor ? value : ""}</span></button>;
    })}
    {markers.map((marker) => <span key={`${marker.label}-${marker.position}`} className={styles.practiceAxisMarker} style={{ left: `${(marker.position / 6) * 100}%` }}>{marker.label}</span>)}
    <div className={styles.practiceAxisLabels}><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
  </div>;
}

const IMPROPER_MODEL_EXAMPLES = [
  { id: "quarters", fraction: { numerator: 7, denominator: 4 }, mixed: { wholePart: 1, numerator: 3, denominator: 4 }, label: "7 ćwiartek" },
  { id: "thirds", fraction: { numerator: 8, denominator: 3 }, mixed: { wholePart: 2, numerator: 2, denominator: 3 }, label: "8 trzecich" },
  { id: "fifths", fraction: { numerator: 11, denominator: 5 }, mixed: { wholePart: 2, numerator: 1, denominator: 5 }, label: "11 piątych" },
] as const;

const UNIT_EXAMPLES = [
  { id: "length-mm", label: "7 mm → cm", source: "7 mm", targetUnit: "cm", prompt: "7 mm to jaka część 1 cm?", fact: "1 cm = 10 mm", raw: { numerator: 7, denominator: 10 }, expected: { numerator: 7, denominator: 10 }, parts: 10, selected: 7, icon: "📏" },
  { id: "mass-300", label: "300 g → kg", source: "300 g", targetUnit: "kg", prompt: "Najpierw zapisz 300/1000 kg, potem skróć ułamek.", fact: "1 kg = 1000 g. Skróć przez 100", raw: { numerator: 300, denominator: 1000 }, expected: { numerator: 3, denominator: 10 }, parts: 10, selected: 3, icon: "⚖️" },
  { id: "length-cm", label: "25 cm → m", source: "25 cm", targetUnit: "m", prompt: "Najpierw zapisz 25/100 m, potem skróć ułamek.", fact: "1 m = 100 cm. Skróć przez 25", raw: { numerator: 25, denominator: 100 }, expected: { numerator: 1, denominator: 4 }, parts: 4, selected: 1, icon: "📐" },
  { id: "mass-750", label: "750 g → kg", source: "750 g", targetUnit: "kg", prompt: "Najpierw zapisz 750/1000 kg, potem skróć ułamek.", fact: "1 kg = 1000 g. Skróć przez 250", raw: { numerator: 750, denominator: 1000 }, expected: { numerator: 3, denominator: 4 }, parts: 4, selected: 3, icon: "🥣" },
] as const;

const MIXED_TO_IMPROPER_EXAMPLES = [
  { id: "two-fifths", mixed: { wholePart: 2, numerator: 3, denominator: 5 }, expected: { numerator: 13, denominator: 5 } },
  { id: "one-quarters", mixed: { wholePart: 1, numerator: 3, denominator: 4 }, expected: { numerator: 7, denominator: 4 } },
  { id: "three-thirds", mixed: { wholePart: 3, numerator: 2, denominator: 3 }, expected: { numerator: 11, denominator: 3 } },
  { id: "four-halves", mixed: { wholePart: 4, numerator: 1, denominator: 2 }, expected: { numerator: 9, denominator: 2 } },
  { id: "five-sevenths", mixed: { wholePart: 5, numerator: 4, denominator: 7 }, expected: { numerator: 39, denominator: 7 } },
] as const;

const IMPROPER_TO_MIXED_EXAMPLES = [
  { id: "nine-fourths", fraction: { numerator: 9, denominator: 4 }, expected: { wholePart: 2, numerator: 1, denominator: 4 } },
  { id: "eleven-thirds", fraction: { numerator: 11, denominator: 3 }, expected: { wholePart: 3, numerator: 2, denominator: 3 } },
  { id: "thirteen-fifths", fraction: { numerator: 13, denominator: 5 }, expected: { wholePart: 2, numerator: 3, denominator: 5 } },
  { id: "eight-thirds", fraction: { numerator: 8, denominator: 3 }, expected: { wholePart: 2, numerator: 2, denominator: 3 } },
  { id: "forty-one-twelfths", fraction: { numerator: 41, denominator: 12 }, expected: { wholePart: 3, numerator: 5, denominator: 12 } },
] as const;

const COLLECTION_PAINT_TASKS = [
  { id: "tulips", label: "Tulipany", icon: "🌷", count: 8, first: { key: "red", label: "czerwony", color: "#ef4444", fraction: { numerator: 1, denominator: 4 } }, second: { key: "yellow", label: "żółty", color: "#facc15", fraction: { numerator: 3, denominator: 4 } }, asked: "red", expectedCount: 2 },
  { id: "pears", label: "Gruszki", icon: "🍐", count: 12, first: { key: "green", label: "zielony", color: "#22c55e", fraction: { numerator: 5, denominator: 6 } }, second: { key: "yellow", label: "żółty", color: "#facc15", fraction: { numerator: 1, denominator: 6 } }, asked: "green", expectedCount: 10 },
  { id: "pencils", label: "Ołówki", icon: "✏️", count: 9, first: { key: "blue", label: "niebieski", color: "#38bdf8", fraction: { numerator: 2, denominator: 3 } }, second: { key: "yellow", label: "żółty", color: "#facc15", fraction: { numerator: 1, denominator: 3 } }, asked: "blue", expectedCount: 6 },
  { id: "apples", label: "Jabłka", icon: "🍎", count: 10, first: { key: "red", label: "czerwony", color: "#ef4444", fraction: { numerator: 2, denominator: 5 } }, second: { key: "green", label: "zielony", color: "#22c55e", fraction: { numerator: 3, denominator: 5 } }, asked: "red", expectedCount: 4 },
] as const;

function digitCount(value: number): number {
  return String(Math.abs(value)).length;
}

function FractionBar({ parts, selected, label }: { parts: number; selected: number; label: string }) {
  return <div className="space-y-2" aria-label={label}>
    <div className={styles.interpretationBar}>{Array.from({ length: parts }, (_, index) => <span key={index} className={index < selected ? styles.interpretationPartSelected : styles.interpretationPart} />)}</div>
    <p className="text-center text-sm font-bold text-slate-700">{selected} zaznaczonych części z {parts} równych części</p>
  </div>;
}

function MixedMiniature({ value }: { value: MixedFractionValue }) {
  return <div className={styles.mixedMiniature} aria-label={`${value.wholePart} całe i ${value.numerator} z ${value.denominator} części`}>
    {Array.from({ length: value.wholePart }, (_, whole) => <div key={whole} className={styles.miniWhole}>{Array.from({ length: value.denominator }, (_, part) => <span key={part} />)}</div>)}
    <div className={styles.miniWhole}>{Array.from({ length: value.denominator }, (_, part) => <span key={part} className={part >= value.numerator ? styles.miniEmpty : undefined} />)}</div>
  </div>;
}

function PaintableFractionCircles({ denominator, targetNumerator, painted }: { denominator: number; targetNumerator: number; painted: number }) {
  const circleCount = Math.ceil(targetNumerator / denominator);
  const radius = 54;
  const gap = 18;
  const width = circleCount * radius * 2 + (circleCount - 1) * gap + 24;
  return <svg viewBox={`0 0 ${width} 124`} className="h-auto w-full" role="img" aria-label={`${painted} zamalowanych części; cel ${targetNumerator} części, po ${denominator} w każdym kole`} data-paintable-fraction-circles>
    {Array.from({ length: circleCount }, (_, circleIndex) => {
      const centerX = 12 + radius + circleIndex * (radius * 2 + gap);
      return <g key={circleIndex} data-fraction-circle={circleIndex}>{Array.from({ length: denominator }, (_, partIndex) => {
        const globalIndex = circleIndex * denominator + partIndex;
        const startAngle = -90 + partIndex * 360 / denominator;
        const endAngle = -90 + (partIndex + 1) * 360 / denominator;
        return <path key={partIndex} d={fractionSectorPath(centerX, 62, radius, startAngle, endAngle)} fill={globalIndex < painted ? "#a78bfa" : "#fff"} stroke="#334155" strokeWidth="2.5" data-painted={globalIndex < painted || undefined} />;
      })}</g>;
    })}
  </svg>;
}

interface Props {
  activity: FractionTopicIntroActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionTopicIntroModel(props: Props) {
  const effectiveSeed = props.taskSeed ?? props.seed;
  return <FractionTopicIntroActivityModel key={`${props.activity}-${effectiveSeed}`} {...props} />;
}

function FractionTopicIntroActivityModel({ activity, seed, taskSeed, difficulty = "core", readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: Props) {
  const effectiveSeed = taskSeed ?? seed;
  const practiceTask = useMemo(() => introPracticeTask(activity, effectiveSeed), [activity, effectiveSeed]);
  const practiceMode = activity.includes("independent");
  const responseNeedsWhole = activity === "topic2-improper-to-mixed" || practiceMode && practiceTask.kind === "mixed";
  const locked = readOnly || presentationMode && activity.includes("independent");
  const [selectedParts, setSelectedParts] = useState<boolean[]>(Array.from({ length: 7 }, () => false));
  const colorCounts = { białe: 2, czerwone: 3, zielone: 4, żółte: 3 } as const;
  const colors = Object.keys(colorCounts) as Array<keyof typeof colorCounts>;
  const [activeColor, setActiveColor] = useState<keyof typeof colorCounts>("zielone");
  const [colorAnswers, setColorAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(colors.map((color) => [color, blankStack()])));
  const [collectionTaskIndex, setCollectionTaskIndex] = useState(0);
  const [paintColor, setPaintColor] = useState<string>(COLLECTION_PAINT_TASKS[0].first.key);
  const [collectionPaint, setCollectionPaint] = useState<Record<string, string[]>>(() => Object.fromEntries(COLLECTION_PAINT_TASKS.map((task) => [task.id, Array.from({ length: task.count }, () => "blank")])));
  const [collectionCountAnswers, setCollectionCountAnswers] = useState<Record<string, string>>(() => Object.fromEntries(COLLECTION_PAINT_TASKS.map((task) => [task.id, ""])));
  const [selectedAxisMatchItem, setSelectedAxisMatchItem] = useState<string | null>(null);
  const [axisMatchPlacements, setAxisMatchPlacements] = useState<Record<string, string>>({});
  const [classifications, setClassifications] = useState<Record<number, "proper" | "improper">>({});
  const [classificationRound, setClassificationRound] = useState(0);
  const [axisExercise, setAxisExercise] = useState<"write" | "drag">("write");
  const [axisWriteAnswers, setAxisWriteAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(AXIS_WRITE_POINTS.map((point) => [point.id, blankStack("wholePart" in point.expected)])));
  const [axisWriteChecks, setAxisWriteChecks] = useState<Record<string, boolean>>({});
  const [activeAxisWritePoint, setActiveAxisWritePoint] = useState<typeof AXIS_WRITE_POINTS[number]["id"]>("A");
  const [draggedAxisLabel, setDraggedAxisLabel] = useState<string | null>(null);
  const [axisPlacements, setAxisPlacements] = useState<Record<string, string>>({});
  const [modelExampleIndex, setModelExampleIndex] = useState(0);
  const [improperAnswers, setImproperAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(IMPROPER_MODEL_EXAMPLES.map((example) => [example.id, blankStack()])));
  const [mixedAnswers, setMixedAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(IMPROPER_MODEL_EXAMPLES.map((example) => [example.id, blankStack(true)])));
  const [paintedModelParts, setPaintedModelParts] = useState<Record<string, number>>(() => Object.fromEntries(IMPROPER_MODEL_EXAMPLES.map((example) => [example.id, 0])));
  const [improperModelChecks, setImproperModelChecks] = useState<Record<string, boolean>>({});
  const [unitTask, setUnitTask] = useState<(typeof UNIT_EXAMPLES)[number]["id"]>(UNIT_EXAMPLES[0].id);
  const [unitRawAnswers, setUnitRawAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(UNIT_EXAMPLES.map((example) => [example.id, blankStack()])));
  const [unitAnswers, setUnitAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(UNIT_EXAMPLES.map((example) => [example.id, blankStack()])));
  const [mixedToImproperIndex, setMixedToImproperIndex] = useState(0);
  const [mixedToImproperAnswers, setMixedToImproperAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(MIXED_TO_IMPROPER_EXAMPLES.map((example) => [example.id, blankStack()])));
  const [response, setResponse] = useState<FractionStackValue>(() => blankStack(responseNeedsWhole));
  const [cut, setCut] = useState(false);
  const [circleCount, setCircleCount] = useState<3 | 5 | 7>(3);
  const [quotientExample, setQuotientExample] = useState<0 | 1 | 2>(0);
  const quotientExamples = [{ dividend: 1, divisor: 7 }, { dividend: 13, divisor: 5 }, { dividend: 8, divisor: 3 }] as const;
  const [wholeDenominator, setWholeDenominator] = useState<2 | 4 | 6>(6);
  const [improperToMixedIndex, setImproperToMixedIndex] = useState(0);
  const [improperToMixedAnswers, setImproperToMixedAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(IMPROPER_TO_MIXED_EXAMPLES.map((example) => [example.id, blankStack(true)])));
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const usesSessionProgress = questionNumber !== undefined
    && questionCount !== undefined
    && (activity === "topic1-mixed-to-improper" || activity === "topic2-improper-to-mixed");
  const activeMixedToImproperIndex = usesSessionProgress
    ? Math.max(0, Math.min(MIXED_TO_IMPROPER_EXAMPLES.length - 1, questionNumber - 1))
    : mixedToImproperIndex;
  const activeImproperToMixedIndex = usesSessionProgress
    ? Math.max(0, Math.min(IMPROPER_TO_MIXED_EXAMPLES.length - 1, questionNumber - 1))
    : improperToMixedIndex;
  const classifyIndices = [classificationRound * 2, classificationRound * 2 + 1];
  const improperExample = IMPROPER_MODEL_EXAMPLES[modelExampleIndex]!;
  const collectionTask = COLLECTION_PAINT_TASKS[collectionTaskIndex]!;
  const unitExample = UNIT_EXAMPLES.find((example) => example.id === unitTask) ?? UNIT_EXAMPLES[0];
  const mixedToImproperExample = MIXED_TO_IMPROPER_EXAMPLES[activeMixedToImproperIndex]!;
  const improperToMixedExample = IMPROPER_TO_MIXED_EXAMPLES[activeImproperToMixedIndex]!;
  const practiceQuotient = activity === "topic2-independent" ? practiceTask.prompt.match(/(\d+)\s*:\s*(\d+)/u) : null;
  const practiceFixedDigitCells = practiceTask.expectedMixed
    ? { wholePart: digitCount(practiceTask.expectedMixed.wholePart), numerator: digitCount(practiceTask.expectedMixed.numerator), denominator: digitCount(practiceTask.expectedMixed.denominator) }
    : practiceTask.expectedFraction
      ? { numerator: digitCount(practiceTask.expectedFraction.numerator), denominator: digitCount(practiceTask.expectedFraction.denominator) }
      : undefined;

  const clear = () => { setFeedback(null); onResultChange?.(null); };
  const finish = (correct: boolean, message: string, label: string) => { setFeedback({ correct, message }); onResultChange?.(correct, label); };
  const checkShadeColors = () => {
    const shaded = selectedParts.filter(Boolean).length;
    const colorsCorrect = colors.every((color) => parsedMatches(colorAnswers[color]!, { numerator: colorCounts[color], denominator: 12 }));
    finish(shaded === 4 && colorsCorrect, shaded !== 4 ? `Zaznacz dokładnie 4 z 7 równych części. Teraz zaznaczono ${shaded}.` : colorsCorrect ? "Model i cztery ułamki opisują dokładnie zaznaczone części." : "Policz wszystkie 12 kółek. Licznik zmienia się z kolorem, mianownik pozostaje równy 12.", `${shaded} z 7; kolory`);
  };
  const checkPaintCollection = () => {
    const painted = collectionPaint[collectionTask.id] ?? [];
    const firstCount = painted.filter((color) => color === collectionTask.first.key).length;
    const secondCount = painted.filter((color) => color === collectionTask.second.key).length;
    const expectedFirst = collectionTask.count * collectionTask.first.fraction.numerator / collectionTask.first.fraction.denominator;
    const expectedSecond = collectionTask.count * collectionTask.second.fraction.numerator / collectionTask.second.fraction.denominator;
    const countAnswer = Number(collectionCountAnswers[collectionTask.id]);
    const correct = firstCount === expectedFirst && secondCount === expectedSecond && countAnswer === collectionTask.expectedCount;
    finish(correct, correct ? `Dobrze: ${firstCount} elementów ma kolor ${collectionTask.first.label}, a ${secondCount} — ${collectionTask.second.label}.` : `Cały zbiór ma ${collectionTask.count} elementów. Najpierw oblicz obie części, potem sprawdź, czy pomalowano każdy element i wpisano liczbę.`, collectionTask.label);
  };
  const checkAxis = () => {
    const complete = AXIS_MATCH_ITEMS.every((item) => Boolean(axisMatchPlacements[item.id]));
    const correct = complete && AXIS_MATCH_ITEMS.every((item) => axisMatchPlacements[item.id] === item.id);
    finish(correct, correct ? "Dobrze. Każdy zapis trafił we właściwe miejsce na osi." : !complete ? "Uzupełnij wszystkie cztery pola na osi." : "Porównaj, ile pełnych całości zawiera każdy zapis, a potem jego część ułamkową.", "dopasowanie ułamków do osi");
  };
  const checkClassify = () => {
    const correct = classifyIndices.every((index) => {
      const value = CLASSIFY_VALUES[index]!;
      return classifications[index] === (value.numerator < value.denominator ? "proper" : "improper");
    });
    if (!correct) {
      finish(false, "Sprawdź oba ułamki. Właściwy ma licznik mniejszy od mianownika; równe liczby oznaczają już całą jedność.", `zadanie ${classificationRound + 1}`);
      return;
    }
    if (classificationRound < 2) {
      setClassificationRound((round) => round + 1);
      setFeedback({ correct: true, message: `Zadanie ${classificationRound + 1} poprawne. Otwieram kolejne dwa ułamki.` });
      onResultChange?.(null);
      return;
    }
    finish(true, "Wszystkie trzy zadania wykonane poprawnie — sześć ułamków zostało sklasyfikowanych.", "3 zadania po 2 ułamki");
  };
  const axisWriteCorrect = (point: (typeof AXIS_WRITE_POINTS)[number]) => {
      const expected = point.expected;
      return "wholePart" in expected
        ? parsedMatches(axisWriteAnswers[point.id]!, { numerator: expected.numerator, denominator: expected.denominator }, expected.wholePart)
        : parsedMatches(axisWriteAnswers[point.id]!, expected);
  };
  const checkAxisWritePoint = (pointId: (typeof AXIS_WRITE_POINTS)[number]["id"]) => {
    const point = AXIS_WRITE_POINTS.find((candidate) => candidate.id === pointId)!;
    const correct = axisWriteCorrect(point);
    setAxisWriteChecks((checks) => ({ ...checks, [pointId]: correct }));
    finish(correct, correct ? `Punkt ${pointId} jest podpisany poprawnie.` : `Sprawdź punkt ${pointId}: policz ćwiartki od zera i wydziel pełne całości.`, `punkt ${pointId}`);
  };
  const checkAxisWriting = () => {
    const checks = Object.fromEntries(AXIS_WRITE_POINTS.map((point) => [point.id, axisWriteCorrect(point)]));
    setAxisWriteChecks(checks);
    const correct = Object.values(checks).every(Boolean);
    finish(correct, correct ? "Wszystkie cztery pola opisują właściwe punkty jednej osi." : "Policz ćwiartki od zera. Po przekroczeniu jedności zapisz liczbę mieszaną: całości oraz pozostałe ćwiartki.", "cztery podpisy osi");
  };
  const checkAxisDragging = () => {
    const correct = AXIS_DRAG_LABELS.every((label) => axisPlacements[String(label.position)] === label.id);
    finish(correct, correct ? "Każdy ułamek trafił dokładnie na swoje miejsce na osi." : "Porównaj wartość zapisu mieszanego i niewłaściwego. Najpierw znajdź pełne jedności, potem część odcinka.", "przeciąganie na oś");
  };
  const checkImproperModel = () => {
    const correct = paintedModelParts[improperExample.id] === improperExample.fraction.numerator
      && parsedMatches(improperAnswers[improperExample.id]!, improperExample.fraction)
      && parsedMatches(mixedAnswers[improperExample.id]!, { numerator: improperExample.mixed.numerator, denominator: improperExample.mixed.denominator }, improperExample.mixed.wholePart);
    setImproperModelChecks((checks) => ({ ...checks, [improperExample.id]: correct }));
    if (!correct) {
      finish(false, `Najpierw zamaluj dokładnie ${improperExample.fraction.numerator} części. Potem wydziel pełne grupy po ${improperExample.fraction.denominator}.`, improperExample.label);
      return;
    }
    if (modelExampleIndex < IMPROPER_MODEL_EXAMPLES.length - 1) {
      setModelExampleIndex((index) => index + 1);
      setFeedback({ correct: true, message: "Zamalowanie i oba zapisy są poprawne. Otwieram kolejne zadanie." });
      onResultChange?.(null);
      return;
    }
    finish(true, "Zamalowanie i oba zapisy opisują dokładnie tę samą powierzchnię. To było ostatnie zadanie tego slajdu.", improperExample.label);
  };
  const checkUnits = () => {
    const rawCorrect = parsedMatches(unitRawAnswers[unitExample.id]!, unitExample.raw);
    const simplifiedCorrect = parsedMatches(unitAnswers[unitExample.id]!, unitExample.expected);
    const correct = rawCorrect && simplifiedCorrect;
    finish(correct, correct ? `Dobrze. Najpierw powstał ułamek z zamiany jednostek, a potem jego skrócona postać. ${unitExample.fact}.` : !rawCorrect ? `Najpierw zapisz dokładnie ${unitExample.raw.numerator}/${unitExample.raw.denominator} ${unitExample.targetUnit}. Dopiero później skracaj.` : `Pierwszy zapis jest dobry. Teraz skróć licznik i mianownik przez tę samą liczbę. ${unitExample.fact}.`, unitExample.label);
  };
  const checkMixedToImproper = () => {
    const { mixed, expected, id } = mixedToImproperExample;
    const correct = parsedMatches(mixedToImproperAnswers[id]!, expected);
    if (!correct) {
      finish(false, `Pomnóż ${mixed.wholePart} przez ${mixed.denominator}, a potem dodaj ${mixed.numerator}.`, `zamiana ${activeMixedToImproperIndex + 1}`);
      return;
    }
    if (usesSessionProgress) {
      finish(true, `${mixed.wholePart} · ${mixed.denominator} + ${mixed.numerator} = ${expected.numerator}. Mianownik ${expected.denominator} pozostaje bez zmiany.`, `zamiana ${activeMixedToImproperIndex + 1}`);
      return;
    }
    if (mixedToImproperIndex < MIXED_TO_IMPROPER_EXAMPLES.length - 1) {
      setMixedToImproperIndex((index) => index + 1);
      setFeedback({ correct: true, message: `${mixed.wholePart} · ${mixed.denominator} + ${mixed.numerator} = ${expected.numerator}. Otwieram kolejne zadanie.` });
      onResultChange?.(null);
      return;
    }
    finish(true, `${mixed.wholePart} · ${mixed.denominator} + ${mixed.numerator} = ${expected.numerator}. Mianownik ${expected.denominator} pozostaje bez zmiany. To było ostatnie zadanie tego slajdu.`, `zamiana ${mixedToImproperIndex + 1}`);
  };
  const checkQuotient = (dividend: number, divisor: number) => { const correct = parsedMatches(response, { numerator: dividend, denominator: divisor }); finish(correct, correct ? "Dzielna jest licznikiem, a dzielnik mianownikiem." : "Nie odwracaj liczb: pierwsza liczba działania trafia nad kreskę.", `${dividend} : ${divisor}`); };
  const checkWhole = () => { const correct = parsedMatches(response, { numerator: 2 * wholeDenominator, denominator: wholeDenominator }); finish(correct, correct ? "Dwie pełne figury zawierają dwa razy tyle części, ile wskazuje mianownik." : `Każda z dwóch całości ma ${wholeDenominator} części. Policz części w obu kołach.`, "dwie całości"); };
  const checkImproperToMixed = () => {
    const { id, expected, fraction } = improperToMixedExample;
    const correct = parsedMatches(improperToMixedAnswers[id]!, { numerator: expected.numerator, denominator: expected.denominator }, expected.wholePart);
    if (!correct) {
      finish(false, `Twórz grupy po ${fraction.denominator} części. Liczbę pełnych grup wpisz z lewej, a resztę nad kreską.`, `zamiana ${activeImproperToMixedIndex + 1}`);
      return;
    }
    if (usesSessionProgress) {
      finish(true, `${fraction.numerator} części tworzy ${expected.wholePart} pełne grupy i ${expected.numerator} części reszty.`, `zamiana ${activeImproperToMixedIndex + 1}`);
      return;
    }
    if (improperToMixedIndex < IMPROPER_TO_MIXED_EXAMPLES.length - 1) {
      setImproperToMixedIndex((index) => index + 1);
      setFeedback({ correct: true, message: `${fraction.numerator} części tworzy ${expected.wholePart} pełne grupy i ${expected.numerator} części reszty. Otwieram kolejne zadanie.` });
      onResultChange?.(null);
      return;
    }
    finish(true, `${fraction.numerator} części tworzy ${expected.wholePart} pełne grupy i ${expected.numerator} części reszty. To było ostatnie zadanie tego slajdu.`, `zamiana ${improperToMixedIndex + 1}`);
  };
  const checkPractice = () => {
    if (practiceTask.kind === "classification") { const correct = classifications[0] === practiceTask.expectedClassification; return finish(correct, correct ? "Poprawnie porównałeś licznik z mianownikiem." : "Porównaj licznik i mianownik.", classifications[0] ?? "brak"); }
    if (practiceTask.expectedMixed) { const expected = practiceTask.expectedMixed; const correct = parsedMatches(response, { numerator: expected.numerator, denominator: expected.denominator }, expected.wholePart); return finish(correct, correct ? "Pełne grupy i reszta są zapisane poprawnie." : "Najpierw policz pełne grupy, potem resztę.", "liczba mieszana"); }
    const correct = parsedMatches(response, practiceTask.expectedFraction!); return finish(correct, correct ? "Licznik i mianownik opisują model poprawnie." : "Sprawdź, co opisuje licznik i mianownik.", "ułamek");
  };

  const feedbackPanel = feedback ? <p role="status" className={`rounded-2xl border-2 p-4 font-black ${feedback.correct ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-rose-300 bg-rose-50 text-rose-950"}`}>{feedback.correct ? "✓" : "!"} {feedback.message}</p> : null;
  const activeColorAnswer = colorAnswers[activeColor]!;
  const activeAxisWrite = AXIS_WRITE_POINTS.find((point) => point.id === activeAxisWritePoint)!;
  const activeAxisWriteHasWhole = "wholePart" in activeAxisWrite.expected;
  const axisDragSources = useMemo(() => seededShuffle(AXIS_DRAG_LABELS, effectiveSeed, 0x5a17, true), [effectiveSeed]);

  const frameQuestionNumber = usesSessionProgress
    ? questionNumber
    : activity === "topic1-classify" ? classificationRound + 1
      : activity === "topic1-improper-model" ? modelExampleIndex + 1
        : activity === "topic1-mixed-to-improper" ? mixedToImproperIndex + 1
          : activity === "topic2-improper-to-mixed" ? improperToMixedIndex + 1
            : questionNumber;
  const frameQuestionCount = usesSessionProgress
    ? questionCount
    : activity === "topic1-classify" ? 3
      : activity === "topic1-improper-model" ? IMPROPER_MODEL_EXAMPLES.length
        : activity === "topic1-mixed-to-improper" ? MIXED_TO_IMPROPER_EXAMPLES.length
          : activity === "topic2-improper-to-mixed" ? IMPROPER_TO_MIXED_EXAMPLES.length
            : questionCount;

  return <LessonTaskFrame className={styles.lesson} eyebrow={activity.startsWith("topic2-") ? "Dział 3 · Temat 2" : "Dział 3 · Temat 1"} heading={TITLES[activity]} description={activity === "topic1-independent-advanced" ? PROMPTS[activity] : practiceMode ? practiceTask.prompt : PROMPTS[activity]} questionNumber={frameQuestionNumber} questionCount={frameQuestionCount} data-fraction-topic-intro data-fraction-activity={activity} data-seed={effectiveSeed} data-difficulty={difficulty}>

    {activity === "topic1-shade-colors" ? <div className="space-y-6">
      <section className="space-y-3 rounded-2xl bg-white p-4"><h3 className="text-lg font-black">1. Zaznacz cztery siódme</h3><div className="flex items-center gap-4"><StaticFraction value={{ numerator: 4, denominator: 7 }} label="cztery siódme" /><div className={`${styles.partGrid} flex-1`}>{selectedParts.map((selected, index) => <button key={index} type="button" aria-pressed={selected} aria-label={`część ${index + 1} z 7`} disabled={locked} className={`${styles.partButton} ${selected ? styles.partSelected : ""}`} onClick={() => { setSelectedParts((items) => items.map((item, itemIndex) => itemIndex === index ? !item : item)); clear(); }}>{index + 1}</button>)}</div></div></section>
      <section className="space-y-4 rounded-2xl bg-white p-4"><h3 className="text-lg font-black">2. Jaką część wszystkich kółek stanowi każdy kolor?</h3><div className={styles.circleGrid}>{colors.flatMap((color) => Array.from({ length: colorCounts[color] }, (_, index) => <span key={`${color}-${index}`} className={styles.colorCircle} aria-label={`${color} kółko`} style={{ background: color === "białe" ? "#fff" : color === "czerwone" ? "#ef4444" : color === "zielone" ? "#22c55e" : "#facc15" }} />))}</div><div className={styles.taskTabs}>{colors.map((color) => <button key={color} type="button" className={`${styles.taskTab} ${activeColor === color ? styles.taskTabActive : ""}`} aria-pressed={activeColor === color} onClick={() => setActiveColor(color)}>{color}</button>)}</div><FractionStackInput value={activeColorAnswer} onChange={(value) => { setColorAnswers((answers) => ({ ...answers, [activeColor]: value })); clear(); }} fixedDigitCells={{ numerator: 1, denominator: 2 }} readOnly={locked} stepLabel={`Zapisz część: kółka ${activeColor}`} /></section>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkShadeColors}>Prześlij zadanie</button> : null}
      <section className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4" data-collection-paint-task>
        <h3 className="text-lg font-black">3. Pomaluj zbiór według ułamków</h3>
        <div className={styles.taskTabs}>{COLLECTION_PAINT_TASKS.map((task, index) => <button key={task.id} type="button" className={`${styles.taskTab} ${collectionTaskIndex === index ? styles.taskTabActive : ""}`} onClick={() => { setCollectionTaskIndex(index); setPaintColor(task.first.key); clear(); }}>{task.label}</button>)}</div>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-white p-3 font-bold"><span>Pomaluj</span><StaticFraction value={collectionTask.first.fraction} label={`część w kolorze ${collectionTask.first.label}`} /><span>na {collectionTask.first.label}, a</span><StaticFraction value={collectionTask.second.fraction} label={`część w kolorze ${collectionTask.second.label}`} /><span>na {collectionTask.second.label}.</span></div>
        <div className="flex flex-wrap justify-center gap-2"><button type="button" aria-pressed={paintColor === collectionTask.first.key} className={`${styles.taskTab} ${paintColor === collectionTask.first.key ? styles.taskTabActive : ""}`} style={{ borderColor: collectionTask.first.color }} onClick={() => setPaintColor(collectionTask.first.key)}>Pędzel: {collectionTask.first.label}</button><button type="button" aria-pressed={paintColor === collectionTask.second.key} className={`${styles.taskTab} ${paintColor === collectionTask.second.key ? styles.taskTabActive : ""}`} style={{ borderColor: collectionTask.second.color }} onClick={() => setPaintColor(collectionTask.second.key)}>Pędzel: {collectionTask.second.label}</button></div>
        <div className={styles.objectPaintGrid}>{(collectionPaint[collectionTask.id] ?? []).map((colorKey, index) => { const color = colorKey === collectionTask.first.key ? collectionTask.first.color : colorKey === collectionTask.second.key ? collectionTask.second.color : "#fff"; return <button key={index} type="button" disabled={locked} aria-label={`${collectionTask.label}, element ${index + 1}`} className={styles.objectPaintButton} style={{ backgroundColor: color }} onClick={() => { setCollectionPaint((all) => ({ ...all, [collectionTask.id]: all[collectionTask.id]!.map((current, itemIndex) => itemIndex === index ? paintColor : current) })); clear(); }}><span aria-hidden>{collectionTask.icon}</span></button>; })}</div>
        <label className="mx-auto grid max-w-sm gap-2 text-center font-black">Ile elementów ma kolor {collectionTask.asked === collectionTask.first.key ? collectionTask.first.label : collectionTask.second.label}?<input type="number" min={0} max={collectionTask.count} value={collectionCountAnswers[collectionTask.id]} className="min-h-12 rounded-xl border-2 border-slate-300 px-3 text-center text-xl" onChange={(event) => { setCollectionCountAnswers((answers) => ({ ...answers, [collectionTask.id]: event.target.value })); clear(); }} /></label>
        {!locked ? <button type="button" className="w-full rounded-xl bg-emerald-700 px-5 py-3 text-lg font-black text-white" onClick={checkPaintCollection}>Prześlij zadanie</button> : null}
      </section>
    </div> : null}

    {activity === "topic1-axis-labels" ? <div className="space-y-4"><FractionMatchNumberLine3D points={AXIS_MATCH_ITEMS} /><p className="rounded-2xl bg-violet-50 p-3 text-center font-bold text-violet-950">Wybierz ułamek poniżej, a następnie przypisz go do litery A, B, C albo D.</p><div className="flex flex-wrap justify-center gap-3">{seededShuffle(AXIS_MATCH_ITEMS, effectiveSeed, 0x31af, true).map((item) => <button key={item.id} type="button" disabled={locked} aria-pressed={selectedAxisMatchItem === item.id} className={`${styles.taskTab} ${selectedAxisMatchItem === item.id ? styles.taskTabActive : ""}`} onClick={() => { setSelectedAxisMatchItem(item.id); clear(); }}>{"wholePart" in item.value ? <StaticMixed value={item.value} label="ułamek do dopasowania" /> : <StaticFraction value={item.value} label="ułamek do dopasowania" />}</button>)}</div><div className="grid gap-2 sm:grid-cols-2" aria-label="Przypisz ułamki do punktów na osi">{AXIS_MATCH_ITEMS.map((target) => { const placedId = axisMatchPlacements[target.id]; const placed = AXIS_MATCH_ITEMS.find((item) => item.id === placedId); return <button key={target.id} type="button" disabled={locked} aria-label={`Punkt ${target.id}: wybierz ułamek`} className="flex min-h-16 items-center justify-center gap-3 rounded-xl border-2 border-dashed border-violet-400 bg-white px-4 font-black" onClick={() => { if (!selectedAxisMatchItem) return; setAxisMatchPlacements((placements) => ({ ...placements, [target.id]: selectedAxisMatchItem })); setSelectedAxisMatchItem(null); clear(); }}><span>{target.id} =</span>{placed ? <span>{"wholePart" in placed.value ? <StaticMixed value={placed.value} label={`ułamek przypisany do punktu ${target.id}`} /> : <StaticFraction value={placed.value} label={`ułamek przypisany do punktu ${target.id}`} />}</span> : <span className="text-sm text-violet-800">Wybierz ułamek</span>}</button>; })}</div>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkAxis}>Zatwierdź odpowiedzi</button> : null}{feedbackPanel}</div> : null}

    {activity === "topic1-classify" ? <div className="space-y-4">
      <div className={styles.classifyGrid}>{classifyIndices.map((index) => { const value = CLASSIFY_VALUES[index]!; const choices = seededShuffle(CLASSIFICATION_CHOICES, effectiveSeed, 0x6c31 + index + classificationRound * 31); return <div key={index} className={styles.classifyCard} data-classification-card><StaticFraction value={value} label="ułamek do rozpoznania" /><div className={styles.classifyActions}>{choices.map((choice) => <LessonTaskChoice key={choice} type="button" disabled={locked} data-answer-choice={choice} selected={classifications[index] === choice} onClick={() => { setClassifications((items) => ({ ...items, [index]: choice })); clear(); }}>{choice === "proper" ? "właściwy" : "niewłaściwy"}</LessonTaskChoice>)}</div></div>; })}</div>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkClassify}>Zatwierdź zadanie {classificationRound + 1}</button> : null}
    </div> : null}

    {activity === "topic1-improper-model" ? <div className="space-y-4">
      <div className={styles.modelGrid}>
        <div className="space-y-3 rounded-2xl bg-white p-3"><div className="flex items-center justify-center gap-3 font-black"><span>Zamaluj kolejno:</span><StaticFraction value={improperExample.fraction} label="ułamek do przedstawienia na kołach" /></div><PaintableFractionCircles denominator={improperExample.fraction.denominator} targetNumerator={improperExample.fraction.numerator} painted={paintedModelParts[improperExample.id] ?? 0} /><div className="flex justify-center gap-2"><button type="button" className={styles.taskTab} disabled={locked || (paintedModelParts[improperExample.id] ?? 0) === 0} onClick={() => { setPaintedModelParts((values) => ({ ...values, [improperExample.id]: Math.max(0, values[improperExample.id]! - 1) })); clear(); }}>Cofnij część</button><button type="button" className={styles.taskTab} disabled={locked || (paintedModelParts[improperExample.id] ?? 0) >= Math.ceil(improperExample.fraction.numerator / improperExample.fraction.denominator) * improperExample.fraction.denominator} onClick={() => { setPaintedModelParts((values) => ({ ...values, [improperExample.id]: values[improperExample.id]! + 1 })); clear(); }}>Zamaluj kolejną część</button></div><p className="text-center text-sm font-bold text-slate-700">Zamalowano: {paintedModelParts[improperExample.id] ?? 0}. Pod kołami nie ma podpisu zdradzającego wynik.</p></div>
        <div className={`${styles.modelAnswerPair} rounded-2xl bg-white p-4`}>
          <div className={styles.modelAnswerField}>
            <FractionStackInput value={improperAnswers[improperExample.id]!} onChange={(value) => { setImproperAnswers((answers) => ({ ...answers, [improperExample.id]: value })); clear(); }} fixedDigitCells={{ numerator: digitCount(improperExample.fraction.numerator), denominator: digitCount(improperExample.fraction.denominator) }} readOnly={locked} stepLabel="Policz wszystkie pokolorowane części" />
            <p>ułamek niewłaściwy</p>
          </div>
          <div className={styles.modelAnswerField}>
            <FractionStackInput value={mixedAnswers[improperExample.id]!} onChange={(value) => { setMixedAnswers((answers) => ({ ...answers, [improperExample.id]: value })); clear(); }} showWholePart fixedDigitCells={{ wholePart: digitCount(improperExample.mixed.wholePart), numerator: digitCount(improperExample.mixed.numerator), denominator: digitCount(improperExample.mixed.denominator) }} readOnly={locked} stepLabel="Oddziel pełne koła i resztę" />
            <p>liczba mieszana</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"><FractionBar parts={improperExample.fraction.denominator} selected={improperExample.mixed.numerator} label="Mała interpretacja pozostałej części" /><p className="mt-2 text-center font-bold">Pełne grupy mają po {improperExample.fraction.denominator} części. Ostatni pasek pokazuje tylko resztę.</p></div>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkImproperModel}>Prześlij zadanie</button> : null}
      <nav className={styles.seriesNavigator} aria-label="Nawigacja zadań ułamka niewłaściwego">
        <button type="button" className={styles.seriesNavButton} disabled={modelExampleIndex === 0} onClick={() => { setModelExampleIndex((index) => Math.max(0, index - 1)); clear(); }}>← Poprzednie</button>
        <strong>Zadanie {modelExampleIndex + 1} z {IMPROPER_MODEL_EXAMPLES.length}</strong>
        <button type="button" className={styles.seriesNavButton} disabled={modelExampleIndex === IMPROPER_MODEL_EXAMPLES.length - 1 || !improperModelChecks[improperExample.id]} onClick={() => { setModelExampleIndex((index) => Math.min(IMPROPER_MODEL_EXAMPLES.length - 1, index + 1)); clear(); }}>Następne →</button>
      </nav>
    </div> : null}

    {activity === "topic1-unit-fractions" ? <div className="space-y-4">
      <div className={styles.taskTabs}>{UNIT_EXAMPLES.map((example, index) => <button key={example.id} type="button" className={`${styles.taskTab} ${unitTask === example.id ? styles.taskTabActive : ""}`} onClick={() => { setUnitTask(example.id); clear(); }}>Zadanie {index + 1}: {example.label}</button>)}</div>
      <div className={styles.modelGrid}>
        <div className="space-y-4 rounded-2xl bg-white p-4"><p className="text-center text-4xl" aria-hidden>{unitExample.icon}</p><p className="text-center text-lg font-black">{unitExample.prompt}</p><p className="rounded-xl bg-sky-50 p-3 text-center font-bold">Najpierw ustal całość: {unitExample.fact}</p><FractionBar parts={unitExample.parts} selected={unitExample.selected} label={`Interpretacja graficzna: ${unitExample.label}`} /></div>
        <div className="space-y-5 rounded-2xl bg-white p-4">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black">
            <span>{unitExample.source}</span><span>=</span>
            <div><FractionStackInput value={unitRawAnswers[unitExample.id]!} onChange={(value) => { setUnitRawAnswers((answers) => ({ ...answers, [unitExample.id]: value })); clear(); }} fixedDigitCells={{ numerator: digitCount(unitExample.raw.numerator), denominator: digitCount(unitExample.raw.denominator) }} readOnly={locked} showKeypad={false} stepLabel="Najpierw zapisz ułamek z jednostek" /></div>
            <span>{unitExample.targetUnit}</span><span>=</span>
          </div>
          <div className="mx-auto w-full max-w-md" data-unit-answer-block><p className="mb-3 text-center font-black">Teraz wpisz skróconą część {unitExample.targetUnit}.</p><FractionStackInput value={unitAnswers[unitExample.id]!} onChange={(value) => { setUnitAnswers((answers) => ({ ...answers, [unitExample.id]: value })); clear(); }} fixedDigitCells={{ numerator: digitCount(unitExample.expected.numerator), denominator: digitCount(unitExample.expected.denominator) }} readOnly={locked} stepLabel="Teraz skróć ułamek" /><p className="mt-2 text-center font-bold">{unitExample.targetUnit}</p></div>
          <p className="rounded-xl bg-amber-50 p-3 text-center text-sm font-bold">Pierwszy ułamek wynika bezpośrednio z zamiany jednostek. Drugi jest jego skróconą postacią.</p>
        </div>
      </div>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkUnits}>Prześlij zadanie</button> : null}
    </div> : null}

    {activity === "topic1-mixed-to-improper-example" ? <div className="space-y-5">
      <section className="space-y-4 rounded-2xl bg-white p-5">
        <div className="flex flex-wrap items-center justify-center gap-4 text-3xl font-black">
          <StaticMixed value={{ wholePart: 2, numerator: 3, denominator: 5 }} label="dwa i trzy piąte" />
          <span>=</span>
          <StaticFraction value={{ numerator: 13, denominator: 5 }} label="trzynaście piątych" />
        </div>
        <MixedMiniature value={{ wholePart: 2, numerator: 3, denominator: 5 }} />
      </section>
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Kolejne kroki zamiany">
        <div className={styles.hintStep}><b>1.</b> Pomnóż całości przez mianownik:<br /><strong>2 · 5 = 10</strong></div>
        <div className={styles.hintStep}><b>2.</b> Dodaj licznik:<br /><strong>10 + 3 = 13</strong></div>
        <div className={styles.hintStep}><b>3.</b> Mianownik pozostaje bez zmiany:<br /><strong>5</strong></div>
      </section>
    </div> : null}

    {activity === "topic1-mixed-to-improper" ? <div className="space-y-4">
      <section className="mx-auto max-w-xl space-y-5 rounded-2xl bg-white p-5 text-center">
        <p className="font-black">Zamień liczbę mieszaną na ułamek niewłaściwy.</p>
        <div className="flex items-center justify-center gap-4 text-3xl font-black">
          <StaticMixed value={mixedToImproperExample.mixed} label="liczba mieszana do zamiany" />
          <span>=</span>
          <div className="w-full max-w-48">
            <FractionStackInput
              value={mixedToImproperAnswers[mixedToImproperExample.id]!}
              onChange={(value) => {
                setMixedToImproperAnswers((answers) => ({ ...answers, [mixedToImproperExample.id]: value }));
                clear();
              }}
              fixedDigitCells={{ numerator: digitCount(mixedToImproperExample.expected.numerator), denominator: digitCount(mixedToImproperExample.expected.denominator) }}
              readOnly={locked || presentationMode}
              showKeypadConfirm={false}
              stepLabel="Wpisz ułamek niewłaściwy"
            />
          </div>
        </div>
        {!locked && !presentationMode ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkMixedToImproper}>Prześlij zadanie</button> : null}
      </section>
    </div> : null}

    {activity === "topic2-halves" ? <div className="space-y-4"><div className={styles.taskTabs}>{([3,5,7] as const).map((count) => <button key={count} type="button" className={`${styles.taskTab} ${circleCount === count ? styles.taskTabActive : ""}`} onClick={() => { setCircleCount(count); setCut(false); setResponse(blankStack()); clear(); }}>Zadanie: {count} koła dla 2 osób</button>)}</div><section className="space-y-4 rounded-2xl bg-white p-4"><CircleCollection count={circleCount} cut={cut} />{!locked ? <button type="button" className="w-full rounded-xl bg-amber-600 px-5 py-3 text-lg font-black text-white" onClick={() => { setCut(true); clear(); }}>Podziel koła na połówki</button> : null}{cut ? <div className="mx-auto max-w-md"><p className="mb-3 text-center font-black">Jaki udział otrzyma jedna osoba?</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} fixedDigitCells={{ numerator: digitCount(circleCount), denominator: 1 }} readOnly={locked} stepLabel="Zapisz udział jednej osoby" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={() => checkQuotient(circleCount, 2)}>Sprawdź podział</button> : null}</div> : null}</section></div> : null}

    {activity === "topic2-quotient-fractions" ? <div className="space-y-4">
      <div className={styles.taskTabs}>{quotientExamples.map((example, index) => <button key={index} type="button" className={`${styles.taskTab} ${quotientExample === index ? styles.taskTabActive : ""}`} onClick={() => { setQuotientExample(index as 0|1|2); setResponse(blankStack()); clear(); }}>Zadanie {index + 1}: {example.dividend} : {example.divisor}</button>)}</div>
      <div className={styles.modelGrid}>
        <div className="space-y-4 rounded-2xl bg-white p-4">
          <div className="flex flex-wrap justify-center gap-2" aria-label={quotientExamples[quotientExample].dividend === 1 ? "1 jabłko" : `${quotientExamples[quotientExample].dividend} jabłek`}>{Array.from({ length: quotientExamples[quotientExample].dividend }, (_, index) => <span key={index} className="grid size-12 place-items-center rounded-full border-2 border-rose-300 bg-rose-50 text-3xl" aria-label={`jabłko ${index + 1}`}>🍎</span>)}</div>
          <div className="text-center text-3xl font-black text-violet-700" aria-hidden>↓ dzielimy równo ↓</div>
          <div className="flex flex-wrap justify-center gap-2" aria-label={`${quotientExamples[quotientExample].divisor} osób`}>{Array.from({ length: quotientExamples[quotientExample].divisor }, (_, index) => <span key={index} className="grid min-w-14 place-items-center rounded-xl border-2 border-violet-200 bg-violet-50 px-2 py-2"><span className="text-2xl" aria-hidden>🧒</span><b className="text-xs">osoba {index + 1}</b></span>)}</div>
          <p className="rounded-xl bg-sky-50 p-3 text-center font-bold">{quotientExamples[quotientExample].dividend === 1 ? `Jedno jabłko dzielimy między ${quotientExamples[quotientExample].divisor} osób. Każda osoba otrzymuje jedną z ${quotientExamples[quotientExample].divisor} równych części.` : `${quotientExamples[quotientExample].dividend} jabłek dzielimy równo między ${quotientExamples[quotientExample].divisor} osób.`}</p>
        </div>
        <div className="rounded-2xl bg-white p-4"><div className="mb-3 flex flex-wrap items-center justify-center gap-3 text-2xl font-black"><span>{quotientExamples[quotientExample].dividend} : {quotientExamples[quotientExample].divisor}</span><span>=</span><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} fixedDigitCells={{ numerator: digitCount(quotientExamples[quotientExample].dividend), denominator: digitCount(quotientExamples[quotientExample].divisor) }} readOnly={locked} stepLabel="Dzielna nad kreskę, dzielnik pod kreskę" /></div>{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={() => checkQuotient(quotientExamples[quotientExample].dividend, quotientExamples[quotientExample].divisor)}>Sprawdź zapis ilorazu</button> : null}</div>
      </div>
    </div> : null}

    {activity === "topic2-wholes-as-fractions" ? <div className="space-y-4"><div className={styles.taskTabs}>{([2,4,6] as const).map((denominator, index) => <button key={denominator} type="button" className={`${styles.taskTab} ${wholeDenominator === denominator ? styles.taskTabActive : ""}`} onClick={() => { setWholeDenominator(denominator); setCut(false); setResponse(blankStack()); clear(); }}>Zadanie {index + 1}: mianownik {denominator}</button>)}</div><section className="space-y-4 rounded-2xl bg-white p-4"><div className={styles.circleRow}>{[0,1].map((circle) => <div key={circle} className={styles.wholeCircle}>{cut ? <span className={styles.cutLines}>{Array.from({ length: wholeDenominator / 2 }, (_, index) => <span key={index} className={styles.halfLine} style={{ transform: `rotate(${index * 180 / (wholeDenominator / 2)}deg)` }} />)}</span> : null}</div>)}</div>{!locked ? <button type="button" className="w-full rounded-xl bg-amber-600 px-5 py-3 text-lg font-black text-white" onClick={() => setCut(true)}>Podziel dwie figury na {wholeDenominator} części każdą</button> : null}{cut ? <div className="mx-auto max-w-lg"><div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-black"><span>2</span><span>=</span><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} fixedDigitCells={{ numerator: digitCount(2 * wholeDenominator), denominator: digitCount(wholeDenominator) }} readOnly={locked} stepLabel="Policz części obu figur" /></div>{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkWhole}>Sprawdź ułamek równy 2</button> : null}</div> : null}</section></div> : null}

    {activity === "topic2-improper-to-mixed" ? <div className="space-y-4">
      <div className={styles.modelGrid}>
        <div className="rounded-2xl bg-white p-3"><FractionCircleModel value={improperToMixedExample.fraction} label="pokolorowane części do pogrupowania" showCaption={false} /></div>
        <div className="rounded-2xl bg-white p-4"><div className="mb-4 flex flex-col items-center gap-3"><div className="flex items-center gap-3 text-3xl font-black"><StaticFraction value={improperToMixedExample.fraction} label="ułamek niewłaściwy" /><span>=</span></div><FractionStackInput value={improperToMixedAnswers[improperToMixedExample.id]!} onChange={(value) => { setImproperToMixedAnswers((answers) => ({ ...answers, [improperToMixedExample.id]: value })); clear(); }} showWholePart fixedDigitCells={{ wholePart: digitCount(improperToMixedExample.expected.wholePart), numerator: digitCount(improperToMixedExample.expected.numerator), denominator: digitCount(improperToMixedExample.expected.denominator) }} readOnly={locked} stepLabel="Wpisz pełne grupy i resztę" /></div>{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkImproperToMixed}>Prześlij zadanie</button> : null}</div>
      </div>
    </div> : null}

    {activity === "topic1-independent-advanced" ? <div className="space-y-4">
      <div className={styles.taskTabs}><button type="button" className={`${styles.taskTab} ${axisExercise === "write" ? styles.taskTabActive : ""}`} onClick={() => { setAxisExercise("write"); clear(); }}>Zadanie 1: wpisz liczby</button><button type="button" className={`${styles.taskTab} ${axisExercise === "drag" ? styles.taskTabActive : ""}`} onClick={() => { setAxisExercise("drag"); clear(); }}>Zadanie 2: przeciągnij</button></div>
      {axisExercise === "write" ? <div className="space-y-4">
        <p className="rounded-2xl border-2 border-violet-200 bg-white p-4 text-center font-black">Jedna oś ma kilka zaznaczonych punktów. Wpisz ich wartości w puste kratki.</p>
        <FractionNumberLine denominator={4} selected={null} onSelect={() => undefined} disabled markers={AXIS_WRITE_POINTS.map((point) => ({ position: point.position, label: point.id }))} />
        <div className={styles.axisWriteTabs} role="tablist" aria-label="Wybierz punkt do podpisania">{AXIS_WRITE_POINTS.map((point) => { const check = axisWriteChecks[point.id]; return <button key={point.id} type="button" role="tab" aria-selected={activeAxisWritePoint === point.id} data-axis-write-status={check === undefined ? undefined : check ? "correct" : "incorrect"} className={`${styles.axisWriteTab} ${activeAxisWritePoint === point.id ? styles.axisWriteTabActive : ""} ${check === true ? styles.axisWriteTabCorrect : check === false ? styles.axisWriteTabIncorrect : ""}`} onClick={() => { setActiveAxisWritePoint(point.id); clear(); }}>Punkt {point.id}</button>; })}</div>
        <section className={styles.axisWriteAnswerPanel} role="tabpanel" aria-label={`Odpowiedź dla punktu ${activeAxisWrite.id}`} data-axis-write-answer-panel>
          <p className="text-center font-black">Punkt {activeAxisWrite.id} — wpisz jego wartość.</p>
          <FractionStackInput value={axisWriteAnswers[activeAxisWrite.id]!} onChange={(value) => { setAxisWriteAnswers((answers) => ({ ...answers, [activeAxisWrite.id]: value })); setAxisWriteChecks((checks) => { const next = { ...checks }; delete next[activeAxisWrite.id]; return next; }); clear(); }} showWholePart={activeAxisWriteHasWhole} fixedDigitCells={activeAxisWriteHasWhole ? { wholePart: 1, numerator: 1, denominator: 1 } : { numerator: 1, denominator: 1 }} readOnly={locked} stepLabel={`Podpisz punkt ${activeAxisWrite.id}`} onSubmit={() => checkAxisWritePoint(activeAxisWrite.id)} />
        </section>
        {!locked ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkAxisWriting}>Sprawdź wszystkie podpisy</button> : null}
      </div> : <div className="space-y-4">
        <p className="rounded-2xl border-2 border-violet-200 bg-white p-4 text-center font-black">Przeciągnij każdy zapis na odpowiadający mu punkt osi. Możesz też kliknąć zapis, a potem wybrane pole.</p>
        <div className="flex flex-wrap justify-center gap-3">{axisDragSources.map((label) => <button key={label.id} type="button" draggable={!locked} aria-pressed={draggedAxisLabel === label.id} data-axis-drag-source={label.id} className={`${styles.taskTab} ${draggedAxisLabel === label.id ? styles.taskTabActive : ""}`} onDragStart={(event) => { event.dataTransfer.setData("text/plain", label.id); setDraggedAxisLabel(label.id); }} onClick={() => setDraggedAxisLabel(label.id)}>{"wholePart" in label.value ? <StaticMixed value={label.value} label={label.label} /> : <StaticFraction value={label.value} label={label.label} />}</button>)}</div>
        <FractionNumberLine denominator={4} selected={null} onSelect={() => undefined} disabled markers={AXIS_DRAG_LABELS.map((point, index) => ({ position: point.position, label: String.fromCharCode(65 + index) }))} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{AXIS_DRAG_LABELS.map((target, targetIndex) => { const placedId = axisPlacements[String(target.position)]; const placed = AXIS_DRAG_LABELS.find((label) => label.id === placedId); return <button key={target.position} type="button" disabled={locked} className="min-h-24 rounded-2xl border-2 border-dashed border-violet-300 bg-white p-3 text-center" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { const id = event.dataTransfer.getData("text/plain") || draggedAxisLabel; if (id) setAxisPlacements((items) => ({ ...items, [String(target.position)]: id })); setDraggedAxisLabel(null); clear(); }} onClick={() => { if (draggedAxisLabel) setAxisPlacements((items) => ({ ...items, [String(target.position)]: draggedAxisLabel })); setDraggedAxisLabel(null); clear(); }}><span className="block text-sm font-bold text-slate-600">Punkt {String.fromCharCode(65 + targetIndex)}</span>{placed ? <span className="mt-2 inline-block">{"wholePart" in placed.value ? <StaticMixed value={placed.value} label={placed.label} /> : <StaticFraction value={placed.value} label={placed.label} />}</span> : <span className="mt-2 block font-black text-violet-700">Upuść tutaj</span>}</button>; })}</div>
        {!locked ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkAxisDragging}>Sprawdź rozmieszczenie</button> : null}
      </div>}
    </div> : null}

    {practiceMode && activity !== "topic1-independent-advanced" ? <div className="space-y-4">{practiceTask.kind === "classification" ? <><div className="rounded-2xl bg-white p-4 text-center">{practiceTask.source ? <StaticFraction value={practiceTask.source as FractionValue} label="dany ułamek" /> : null}</div><div className="flex justify-center gap-3">{seededShuffle(CLASSIFICATION_CHOICES, effectiveSeed, 0x8d21).map((choice) => <button key={choice} type="button" data-answer-choice={choice} className={`${styles.taskTab} ${classifications[0] === choice ? styles.taskTabActive : ""}`} onClick={() => { setClassifications({ 0: choice }); clear(); }}>{choice === "proper" ? "ułamek właściwy" : "ułamek niewłaściwy"}</button>)}</div></> : <div className="mx-auto max-w-xl rounded-2xl bg-white p-4"><div className="flex flex-wrap items-center justify-center gap-3 text-2xl font-black">{practiceQuotient ? <span>{practiceQuotient[1]} : {practiceQuotient[2]}</span> : practiceTask.source && "wholePart" in practiceTask.source ? <StaticMixed value={practiceTask.source as MixedFractionValue} label="dana liczba mieszana" /> : practiceTask.source ? <StaticFraction value={practiceTask.source as FractionValue} label="dany ułamek" /> : practiceTask.expectedFraction?.numerator === 12 && practiceTask.expectedFraction.denominator === 6 ? <span>2</span> : null}<span>=</span><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} showWholePart={practiceTask.kind === "mixed"} fixedDigitCells={practiceFixedDigitCells} readOnly={locked} stepLabel="Wpisz odpowiedź" /></div></div>}{!locked ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkPractice}>Prześlij zadanie</button> : null}</div> : null}
    {activity !== "topic1-axis-labels" ? feedbackPanel : null}
  </LessonTaskFrame>;
}
