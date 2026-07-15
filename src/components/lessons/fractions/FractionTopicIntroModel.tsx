"use client";

import { useMemo, useState } from "react";
import { FractionCircleModel, fractionSectorPath } from "@/components/lessons/fractions/FractionCircleModel";
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
  "topic1-mixed-to-improper": "Liczba mieszana na ułamek niewłaściwy",
  "topic1-independent-advanced": "Ćwiczenia — 5 przykładów",
  "topic2-halves": "Podziel koła na połówki",
  "topic2-quotient-fractions": "Iloraz zapisany ułamkiem",
  "topic2-wholes-as-fractions": "Całości zapisane ułamkiem",
  "topic2-improper-to-mixed": "Ułamek niewłaściwy na liczbę mieszaną",
  "topic2-independent": "Ćwiczenia — 5 przykładów",
};

const PROMPTS: Record<FractionTopicIntroActivity, string> = {
  "topic1-shade-colors": "Zaznacz tyle równych części, ile wskazuje licznik. Potem zapisz, jaką część wszystkich kółek stanowi każdy kolor.",
  "topic1-axis-labels": "Odczytaj położenie punktów A, B i C na osi podzielonej na osiem równych części.",
  "topic1-independent-basic": "Połącz pionowy zapis z modelem części całości, zbioru albo osi.",
  "topic1-classify": "Dla każdego pionowego zapisu wybierz: ułamek właściwy albo ułamek niewłaściwy.",
  "topic1-improper-model": "Pokolorowane koła opisz najpierw ułamkiem niewłaściwym, a potem liczbą mieszaną.",
  "topic1-unit-fractions": "Porównaj mniejszą jednostkę z jedną pełną większą jednostką i zapisz wynik pionowym ułamkiem.",
  "topic1-mixed-to-improper": "Zamień liczbę mieszaną tylko w stronę ułamka niewłaściwego. Podpowiedź pokazuje mnożenie i dodawanie.",
  "topic1-independent-advanced": "Zaznaczaj kolejne ułamki na osi od 0 do 6. W serii są ułamki właściwe i niewłaściwe.",
  "topic2-halves": "Wybierz liczbę kół, a następnie przetnij każde koło na dwie równe połówki. Udział jednej osoby zapisz pionowo.",
  "topic2-quotient-fractions": "Dzielna trafia nad kreskę ułamkową, a dodatni dzielnik pod kreskę. Model pokazuje tę samą sytuację.",
  "topic2-wholes-as-fractions": "Pokrój dwie całe figury na tyle samo części. Wszystkie części obu figur utworzą licznik.",
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

const ADVANCED_AXIS_TASKS = [
  { numerator: 3, denominator: 4 },
  { numerator: 7, denominator: 4 },
  { numerator: 9, denominator: 2 },
  { numerator: 11, denominator: 3 },
  { numerator: 13, denominator: 6 },
] as const;

function FractionNumberLine({ denominator, selected, onSelect, disabled }: { denominator: number; selected: number | null; onSelect: (value: number) => void; disabled: boolean }) {
  const points = Array.from({ length: denominator * 6 + 1 }, (_, index) => index / denominator);
  return <div className={styles.practiceNumberLine} data-fraction-number-line aria-label="Oś liczbowa od 0 do 6">
    <div className={styles.practiceAxisTrack} />
    {points.map((value) => {
      const isMajor = Number.isInteger(value);
      const active = selected !== null && Math.abs(selected - value) < 0.0001;
      return <button key={value} type="button" disabled={disabled} aria-label={`Punkt ${value}`} className={`${styles.practiceAxisPoint} ${isMajor ? styles.practiceAxisMajor : ""} ${active ? styles.practiceAxisSelected : ""}`} style={{ left: `${(value / 6) * 100}%` }} onClick={() => onSelect(value)}><span>{isMajor ? value : ""}</span></button>;
    })}
    <div className={styles.practiceAxisLabels}><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
  </div>;
}

const IMPROPER_MODEL_EXAMPLES = [
  { id: "quarters", fraction: { numerator: 7, denominator: 4 }, mixed: { wholePart: 1, numerator: 3, denominator: 4 }, label: "7 ćwiartek" },
  { id: "thirds", fraction: { numerator: 8, denominator: 3 }, mixed: { wholePart: 2, numerator: 2, denominator: 3 }, label: "8 trzecich" },
  { id: "fifths", fraction: { numerator: 11, denominator: 5 }, mixed: { wholePart: 2, numerator: 1, denominator: 5 }, label: "11 piątych" },
] as const;

const UNIT_EXAMPLES = [
  { id: "length-mm", label: "7 mm z 1 cm", prompt: "7 mm to jaka część 1 cm?", fact: "1 cm = 10 mm", expected: { numerator: 7, denominator: 10 }, parts: 10, selected: 7, icon: "📏" },
  { id: "mass-300", label: "300 g z 1 kg", prompt: "300 g to jaka część 1 kg? Zapisz po skróceniu.", fact: "1 kg = 1000 g. Obie liczby można podzielić przez 100", expected: { numerator: 3, denominator: 10 }, parts: 10, selected: 3, icon: "⚖️" },
  { id: "length-cm", label: "25 cm z 1 m", prompt: "25 cm to jaka część 1 m? Zapisz po skróceniu.", fact: "1 m = 100 cm. Obie liczby można podzielić przez 25", expected: { numerator: 1, denominator: 4 }, parts: 4, selected: 1, icon: "📐" },
  { id: "mass-750", label: "750 g z 1 kg", prompt: "750 g to jaka część 1 kg? Zapisz po skróceniu.", fact: "1 kg = 1000 g. Obie liczby można podzielić przez 250", expected: { numerator: 3, denominator: 4 }, parts: 4, selected: 3, icon: "🥣" },
] as const;

const MIXED_TO_IMPROPER_EXAMPLES = [
  { id: "two-fifths", mixed: { wholePart: 2, numerator: 3, denominator: 5 }, expected: { numerator: 13, denominator: 5 } },
  { id: "one-quarters", mixed: { wholePart: 1, numerator: 3, denominator: 4 }, expected: { numerator: 7, denominator: 4 } },
  { id: "three-thirds", mixed: { wholePart: 3, numerator: 2, denominator: 3 }, expected: { numerator: 11, denominator: 3 } },
  { id: "four-halves", mixed: { wholePart: 4, numerator: 1, denominator: 2 }, expected: { numerator: 9, denominator: 2 } },
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
  const axisTargets = { A: 2, B: 5, C: 7 } as const;
  const [activePoint, setActivePoint] = useState<keyof typeof axisTargets>("A");
  const [axisAnswers, setAxisAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(Object.keys(axisTargets).map((point) => [point, blankStack()])));
  const [classifications, setClassifications] = useState<Record<number, "proper" | "improper">>({});
  const [classificationRound, setClassificationRound] = useState(0);
  const [advancedAxisAnswer, setAdvancedAxisAnswer] = useState<number | null>(null);
  const [modelMode, setModelMode] = useState<"improper" | "mixed">("improper");
  const [modelExampleIndex, setModelExampleIndex] = useState(0);
  const [improperAnswers, setImproperAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(IMPROPER_MODEL_EXAMPLES.map((example) => [example.id, blankStack()])));
  const [mixedAnswers, setMixedAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(IMPROPER_MODEL_EXAMPLES.map((example) => [example.id, blankStack(true)])));
  const [paintedModelParts, setPaintedModelParts] = useState<Record<string, number>>(() => Object.fromEntries(IMPROPER_MODEL_EXAMPLES.map((example) => [example.id, 0])));
  const [unitTask, setUnitTask] = useState<(typeof UNIT_EXAMPLES)[number]["id"]>(UNIT_EXAMPLES[0].id);
  const [unitAnswers, setUnitAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(UNIT_EXAMPLES.map((example) => [example.id, blankStack()])));
  const [mixedToImproperIndex, setMixedToImproperIndex] = useState(0);
  const [mixedToImproperAnswers, setMixedToImproperAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(MIXED_TO_IMPROPER_EXAMPLES.map((example) => [example.id, blankStack()])));
  const [response, setResponse] = useState<FractionStackValue>(() => blankStack(responseNeedsWhole));
  const [cut, setCut] = useState(false);
  const [circleCount, setCircleCount] = useState<3 | 5 | 7>(3);
  const [quotientExample, setQuotientExample] = useState<0 | 1 | 2>(0);
  const quotientExamples = [{ dividend: 1, divisor: 7 }, { dividend: 13, divisor: 5 }, { dividend: 8, divisor: 3 }] as const;
  const [wholeDenominator, setWholeDenominator] = useState<2 | 4 | 6>(6);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const classifyIndices = [classificationRound * 2, classificationRound * 2 + 1];
  const improperExample = IMPROPER_MODEL_EXAMPLES[modelExampleIndex]!;
  const collectionTask = COLLECTION_PAINT_TASKS[collectionTaskIndex]!;
  const unitExample = UNIT_EXAMPLES.find((example) => example.id === unitTask) ?? UNIT_EXAMPLES[0];
  const mixedToImproperExample = MIXED_TO_IMPROPER_EXAMPLES[mixedToImproperIndex]!;
  const advancedAxisTask = ADVANCED_AXIS_TASKS[Math.max(0, Math.min(ADVANCED_AXIS_TASKS.length - 1, (questionNumber ?? 1) - 1))]!;

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
    const correct = (Object.keys(axisTargets) as Array<keyof typeof axisTargets>).every((point) => parsedMatches(axisAnswers[point]!, { numerator: axisTargets[point], denominator: 8 }));
    finish(correct, correct ? "Każdy punkt ma licznik równy numerowi kreski i wspólny mianownik 8." : "Oś ma 8 równych odcinków. Dla wybranego punktu policz kreski od zera.", "punkty A, B, C");
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
  const checkAdvancedAxis = () => {
    const expected = advancedAxisTask.numerator / advancedAxisTask.denominator;
    const correct = advancedAxisAnswer !== null && Math.abs(advancedAxisAnswer - expected) < 0.0001;
    finish(correct, correct ? `Dobrze: ${advancedAxisTask.numerator}/${advancedAxisTask.denominator} leży dokładnie w punkcie ${expected}.` : `Ustaw punkt na ${advancedAxisTask.numerator}/${advancedAxisTask.denominator}. Policz ${advancedAxisTask.denominator} równych części między kolejnymi liczbami.`, `${advancedAxisTask.numerator}/${advancedAxisTask.denominator} na osi`);
  };
  const checkImproperModel = () => {
    const correct = paintedModelParts[improperExample.id] === improperExample.fraction.numerator
      && parsedMatches(improperAnswers[improperExample.id]!, improperExample.fraction)
      && parsedMatches(mixedAnswers[improperExample.id]!, { numerator: improperExample.mixed.numerator, denominator: improperExample.mixed.denominator }, improperExample.mixed.wholePart);
    finish(correct, correct ? "Zamalowanie i oba zapisy opisują dokładnie tę samą powierzchnię." : `Najpierw zamaluj dokładnie ${improperExample.fraction.numerator} części. Potem wydziel pełne grupy po ${improperExample.fraction.denominator}.`, improperExample.label);
  };
  const checkUnits = () => {
    const correct = parsedMatches(unitAnswers[unitExample.id]!, unitExample.expected);
    finish(correct, correct ? `Dobrze. ${unitExample.fact}. Pasek pokazuje tę samą część całości.` : `Skorzystaj z interpretacji: ${unitExample.fact}. Kolorowe pola pokazują licznik, a wszystkie pola — mianownik.`, unitExample.label);
  };
  const checkMixedToImproper = () => {
    const { mixed, expected, id } = mixedToImproperExample;
    const correct = parsedMatches(mixedToImproperAnswers[id]!, expected);
    finish(correct, correct ? `${mixed.wholePart} × ${mixed.denominator} + ${mixed.numerator} = ${expected.numerator}. Mianownik ${expected.denominator} pozostaje bez zmiany.` : `Policz części na małych grafikach: ${mixed.wholePart} pełnych grup po ${mixed.denominator} i jeszcze ${mixed.numerator}.`, `zamiana ${mixedToImproperIndex + 1}`);
  };
  const checkQuotient = (dividend: number, divisor: number) => { const correct = parsedMatches(response, { numerator: dividend, denominator: divisor }); finish(correct, correct ? "Dzielna jest licznikiem, a dzielnik mianownikiem." : "Nie odwracaj liczb: pierwsza liczba działania trafia nad kreskę.", `${dividend} : ${divisor}`); };
  const checkWhole = () => { const correct = parsedMatches(response, { numerator: 2 * wholeDenominator, denominator: wholeDenominator }); finish(correct, correct ? "Dwie pełne figury zawierają dwa razy tyle części, ile wskazuje mianownik." : `Każda z dwóch całości ma ${wholeDenominator} części. Policz części w obu kołach.`, "dwie całości"); };
  const checkImproperToMixed = () => { const correct = parsedMatches(response, { numerator: 1, denominator: 4 }, 2); finish(correct, correct ? "Dziewięć ćwiartek tworzy dwie pełne grupy i jedną ćwiartkę reszty." : "Otocz dwie pełne grupy po cztery ćwiartki. Jedna ćwiartka pozostaje.", "zamiana"); };
  const checkPractice = () => {
    if (practiceTask.kind === "classification") { const correct = classifications[0] === practiceTask.expectedClassification; return finish(correct, correct ? "Poprawnie porównałeś licznik z mianownikiem." : "Porównaj licznik i mianownik.", classifications[0] ?? "brak"); }
    if (practiceTask.expectedMixed) { const expected = practiceTask.expectedMixed; const correct = parsedMatches(response, { numerator: expected.numerator, denominator: expected.denominator }, expected.wholePart); return finish(correct, correct ? "Pełne grupy i reszta są zapisane poprawnie." : "Najpierw policz pełne grupy, potem resztę.", "liczba mieszana"); }
    const correct = parsedMatches(response, practiceTask.expectedFraction!); return finish(correct, correct ? "Licznik i mianownik opisują model poprawnie." : "Sprawdź, co opisuje licznik i mianownik.", "ułamek");
  };

  const feedbackPanel = feedback ? <p role="status" className={`rounded-2xl border-2 p-4 font-black ${feedback.correct ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-rose-300 bg-rose-50 text-rose-950"}`}>{feedback.correct ? "✓" : "!"} {feedback.message}</p> : null;
  const activeColorAnswer = colorAnswers[activeColor]!;

  const frameQuestionNumber = activity === "topic1-classify" ? classificationRound + 1 : questionNumber;
  const frameQuestionCount = activity === "topic1-classify" ? 3 : questionCount;

  return <LessonTaskFrame className={styles.lesson} eyebrow={activity.startsWith("topic2-") ? "Dział 3 · Temat 2" : "Dział 3 · Temat 1"} heading={TITLES[activity]} description={activity === "topic1-independent-advanced" ? PROMPTS[activity] : practiceMode ? practiceTask.prompt : PROMPTS[activity]} questionNumber={frameQuestionNumber} questionCount={frameQuestionCount} data-fraction-topic-intro data-fraction-activity={activity} data-seed={effectiveSeed} data-difficulty={difficulty}>

    {activity === "topic1-shade-colors" ? <div className="space-y-6">
      <section className="space-y-3 rounded-2xl bg-white p-4"><h3 className="text-lg font-black">1. Zaznacz cztery siódme</h3><div className="flex items-center gap-4"><StaticFraction value={{ numerator: 4, denominator: 7 }} label="cztery siódme" /><div className={`${styles.partGrid} flex-1`}>{selectedParts.map((selected, index) => <button key={index} type="button" aria-pressed={selected} aria-label={`część ${index + 1} z 7`} disabled={locked} className={`${styles.partButton} ${selected ? styles.partSelected : ""}`} onClick={() => { setSelectedParts((items) => items.map((item, itemIndex) => itemIndex === index ? !item : item)); clear(); }}>{index + 1}</button>)}</div></div></section>
      <section className="space-y-4 rounded-2xl bg-white p-4"><h3 className="text-lg font-black">2. Jaką część wszystkich kółek stanowi każdy kolor?</h3><div className={styles.circleGrid}>{colors.flatMap((color) => Array.from({ length: colorCounts[color] }, (_, index) => <span key={`${color}-${index}`} className={styles.colorCircle} aria-label={`${color} kółko`} style={{ background: color === "białe" ? "#fff" : color === "czerwone" ? "#ef4444" : color === "zielone" ? "#22c55e" : "#facc15" }} />))}</div><div className={styles.taskTabs}>{colors.map((color) => <button key={color} type="button" className={`${styles.taskTab} ${activeColor === color ? styles.taskTabActive : ""}`} aria-pressed={activeColor === color} onClick={() => setActiveColor(color)}>{color}</button>)}</div><FractionStackInput value={activeColorAnswer} onChange={(value) => { setColorAnswers((answers) => ({ ...answers, [activeColor]: value })); clear(); }} fixedDigitCells={{ numerator: 1, denominator: 2 }} readOnly={locked} stepLabel={`Zapisz część: kółka ${activeColor}`} /></section>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkShadeColors}>Sprawdź zaznaczenie i kolorowe kółka</button> : null}
      <section className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4" data-collection-paint-task>
        <h3 className="text-lg font-black">3. Pomaluj zbiór według ułamków</h3>
        <div className={styles.taskTabs}>{COLLECTION_PAINT_TASKS.map((task, index) => <button key={task.id} type="button" className={`${styles.taskTab} ${collectionTaskIndex === index ? styles.taskTabActive : ""}`} onClick={() => { setCollectionTaskIndex(index); setPaintColor(task.first.key); clear(); }}>{task.label}</button>)}</div>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-white p-3 font-bold"><span>Pomaluj</span><StaticFraction value={collectionTask.first.fraction} label={`część w kolorze ${collectionTask.first.label}`} /><span>na {collectionTask.first.label}, a</span><StaticFraction value={collectionTask.second.fraction} label={`część w kolorze ${collectionTask.second.label}`} /><span>na {collectionTask.second.label}.</span></div>
        <div className="flex flex-wrap justify-center gap-2"><button type="button" aria-pressed={paintColor === collectionTask.first.key} className={`${styles.taskTab} ${paintColor === collectionTask.first.key ? styles.taskTabActive : ""}`} style={{ borderColor: collectionTask.first.color }} onClick={() => setPaintColor(collectionTask.first.key)}>Pędzel: {collectionTask.first.label}</button><button type="button" aria-pressed={paintColor === collectionTask.second.key} className={`${styles.taskTab} ${paintColor === collectionTask.second.key ? styles.taskTabActive : ""}`} style={{ borderColor: collectionTask.second.color }} onClick={() => setPaintColor(collectionTask.second.key)}>Pędzel: {collectionTask.second.label}</button></div>
        <div className={styles.objectPaintGrid}>{(collectionPaint[collectionTask.id] ?? []).map((colorKey, index) => { const color = colorKey === collectionTask.first.key ? collectionTask.first.color : colorKey === collectionTask.second.key ? collectionTask.second.color : "#fff"; return <button key={index} type="button" disabled={locked} aria-label={`${collectionTask.label}, element ${index + 1}`} className={styles.objectPaintButton} style={{ backgroundColor: color }} onClick={() => { setCollectionPaint((all) => ({ ...all, [collectionTask.id]: all[collectionTask.id]!.map((current, itemIndex) => itemIndex === index ? paintColor : current) })); clear(); }}><span aria-hidden>{collectionTask.icon}</span></button>; })}</div>
        <label className="mx-auto grid max-w-sm gap-2 text-center font-black">Ile elementów ma kolor {collectionTask.asked === collectionTask.first.key ? collectionTask.first.label : collectionTask.second.label}?<input type="number" min={0} max={collectionTask.count} value={collectionCountAnswers[collectionTask.id]} className="min-h-12 rounded-xl border-2 border-slate-300 px-3 text-center text-xl" onChange={(event) => { setCollectionCountAnswers((answers) => ({ ...answers, [collectionTask.id]: event.target.value })); clear(); }} /></label>
        {!locked ? <button type="button" className="w-full rounded-xl bg-emerald-700 px-5 py-3 text-lg font-black text-white" onClick={checkPaintCollection}>Sprawdź malowanie: {collectionTask.label}</button> : null}
      </section>
    </div> : null}

    {activity === "topic1-axis-labels" ? <div className="space-y-4"><section className={`rounded-2xl bg-white ${styles.axis}`} aria-label="Oś od zera do jedności podzielona na osiem części"><div className={styles.axisLine} /><div className={styles.ticks}>{Array.from({ length: 9 }, (_, index) => { const point = Object.entries(axisTargets).find(([, value]) => value === index)?.[0]; return <div key={index} className={styles.tick}>{index === 0 || index === 8 ? <b>{index / 8}</b> : point ? <span className={styles.point}>{point}</span> : <span className="h-9" />}<span className={styles.tickMark} /></div>; })}</div></section><div className={styles.taskTabs}>{(Object.keys(axisTargets) as Array<keyof typeof axisTargets>).map((point) => <button key={point} type="button" className={`${styles.taskTab} ${activePoint === point ? styles.taskTabActive : ""}`} onClick={() => setActivePoint(point)}>Punkt {point}</button>)}</div><div className="rounded-2xl bg-white p-4"><FractionStackInput value={axisAnswers[activePoint]!} onChange={(value) => { setAxisAnswers((answers) => ({ ...answers, [activePoint]: value })); clear(); }} readOnly={locked} stepLabel={`Podpisz punkt ${activePoint}`} /></div>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkAxis}>Sprawdź podpisy osi</button> : null}</div> : null}

    {activity === "topic1-classify" ? <div className="space-y-4">
      <div className={styles.classifyGrid}>{classifyIndices.map((index) => { const value = CLASSIFY_VALUES[index]!; return <div key={index} className={styles.classifyCard}><StaticFraction value={value} label="ułamek do rozpoznania" /><div className={styles.classifyActions}><LessonTaskChoice type="button" disabled={locked} selected={classifications[index] === "proper"} onClick={() => { setClassifications((items) => ({ ...items, [index]: "proper" })); clear(); }}>właściwy</LessonTaskChoice><LessonTaskChoice type="button" disabled={locked} selected={classifications[index] === "improper"} onClick={() => { setClassifications((items) => ({ ...items, [index]: "improper" })); clear(); }}>niewłaściwy</LessonTaskChoice></div></div>; })}</div>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkClassify}>Zatwierdź zadanie {classificationRound + 1}</button> : null}
    </div> : null}

    {activity === "topic1-improper-model" ? <div className="space-y-4">
      <div className={styles.taskTabs}>{IMPROPER_MODEL_EXAMPLES.map((example, index) => <button key={example.id} type="button" className={`${styles.taskTab} ${modelExampleIndex === index ? styles.taskTabActive : ""}`} onClick={() => { setModelExampleIndex(index); setModelMode("improper"); clear(); }}>Zadanie {index + 1}</button>)}</div>
      <div className={styles.modelGrid}>
        <div className="space-y-3 rounded-2xl bg-white p-3"><div className="flex items-center justify-center gap-3 font-black"><span>Zamaluj kolejno:</span><StaticFraction value={improperExample.fraction} label="ułamek do przedstawienia na kołach" /></div><PaintableFractionCircles denominator={improperExample.fraction.denominator} targetNumerator={improperExample.fraction.numerator} painted={paintedModelParts[improperExample.id] ?? 0} /><div className="flex justify-center gap-2"><button type="button" className={styles.taskTab} disabled={locked || (paintedModelParts[improperExample.id] ?? 0) === 0} onClick={() => { setPaintedModelParts((values) => ({ ...values, [improperExample.id]: Math.max(0, values[improperExample.id]! - 1) })); clear(); }}>Cofnij część</button><button type="button" className={styles.taskTab} disabled={locked || (paintedModelParts[improperExample.id] ?? 0) >= Math.ceil(improperExample.fraction.numerator / improperExample.fraction.denominator) * improperExample.fraction.denominator} onClick={() => { setPaintedModelParts((values) => ({ ...values, [improperExample.id]: values[improperExample.id]! + 1 })); clear(); }}>Zamaluj kolejną część</button></div><p className="text-center text-sm font-bold text-slate-700">Zamalowano: {paintedModelParts[improperExample.id] ?? 0}. Pod kołami nie ma podpisu zdradzającego wynik.</p></div>
        <div className="space-y-3 rounded-2xl bg-white p-4"><div className={styles.taskTabs}><button type="button" className={`${styles.taskTab} ${modelMode === "improper" ? styles.taskTabActive : ""}`} onClick={() => setModelMode("improper")}>ułamek niewłaściwy</button><button type="button" className={`${styles.taskTab} ${modelMode === "mixed" ? styles.taskTabActive : ""}`} onClick={() => setModelMode("mixed")}>liczba mieszana</button></div><FractionStackInput value={modelMode === "improper" ? improperAnswers[improperExample.id]! : mixedAnswers[improperExample.id]!} onChange={(value) => { if (modelMode === "improper") setImproperAnswers((answers) => ({ ...answers, [improperExample.id]: value })); else setMixedAnswers((answers) => ({ ...answers, [improperExample.id]: value })); clear(); }} showWholePart={modelMode === "mixed"} fixedDigitCells={modelMode === "improper" ? { numerator: digitCount(improperExample.fraction.numerator), denominator: digitCount(improperExample.fraction.denominator) } : { wholePart: digitCount(improperExample.mixed.wholePart), numerator: digitCount(improperExample.mixed.numerator), denominator: digitCount(improperExample.mixed.denominator) }} readOnly={locked} stepLabel={modelMode === "improper" ? "Policz wszystkie pokolorowane części" : "Oddziel pełne koła i resztę"} /></div>
      </div>
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4"><FractionBar parts={improperExample.fraction.denominator} selected={improperExample.mixed.numerator} label="Mała interpretacja pozostałej części" /><p className="mt-2 text-center font-bold">Pełne grupy mają po {improperExample.fraction.denominator} części. Ostatni pasek pokazuje tylko resztę.</p></div>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkImproperModel}>Sprawdź oba zapisy zadania {modelExampleIndex + 1}</button> : null}
    </div> : null}

    {activity === "topic1-unit-fractions" ? <div className="space-y-4">
      <div className={styles.taskTabs}>{UNIT_EXAMPLES.map((example, index) => <button key={example.id} type="button" className={`${styles.taskTab} ${unitTask === example.id ? styles.taskTabActive : ""}`} onClick={() => { setUnitTask(example.id); clear(); }}>Zadanie {index + 1}: {example.label}</button>)}</div>
      <div className={styles.modelGrid}>
        <div className="space-y-4 rounded-2xl bg-white p-4"><p className="text-center text-4xl" aria-hidden>{unitExample.icon}</p><p className="text-center text-lg font-black">{unitExample.prompt}</p><p className="rounded-xl bg-sky-50 p-3 text-center font-bold">Najpierw ustal całość: {unitExample.fact}</p><FractionBar parts={unitExample.parts} selected={unitExample.selected} label={`Interpretacja graficzna: ${unitExample.label}`} /></div>
        <div className="rounded-2xl bg-white p-4"><FractionStackInput value={unitAnswers[unitExample.id]!} onChange={(value) => { setUnitAnswers((answers) => ({ ...answers, [unitExample.id]: value })); clear(); }} fixedDigitCells={{ numerator: digitCount(unitExample.expected.numerator), denominator: digitCount(unitExample.expected.denominator) }} readOnly={locked} stepLabel="Zapisz część większej jednostki" /></div>
      </div>
      {!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkUnits}>Sprawdź zadanie: {unitExample.label}</button> : null}
    </div> : null}

    {activity === "topic1-mixed-to-improper" ? <div className="space-y-4">
      <div className={styles.taskTabs}>{MIXED_TO_IMPROPER_EXAMPLES.map((example, index) => <button key={example.id} type="button" className={`${styles.taskTab} ${mixedToImproperIndex === index ? styles.taskTabActive : ""}`} onClick={() => { setMixedToImproperIndex(index); clear(); }}>Zadanie {index + 1}</button>)}</div>
      <div className={styles.modelGrid}>
        <div className="space-y-4 rounded-2xl bg-white p-5 text-center"><p className="font-black">Zamień:</p><div className="flex flex-wrap items-center justify-center gap-3"><StaticMixed value={mixedToImproperExample.mixed} label="liczba mieszana do zamiany" /><span className="text-3xl font-black">=</span><FractionStackInput value={mixedToImproperAnswers[mixedToImproperExample.id]!} onChange={(value) => { setMixedToImproperAnswers((answers) => ({ ...answers, [mixedToImproperExample.id]: value })); clear(); }} fixedDigitCells={{ numerator: digitCount(mixedToImproperExample.expected.numerator), denominator: digitCount(mixedToImproperExample.expected.denominator) }} readOnly={locked} stepLabel="Wpisz ułamek niewłaściwy" /></div>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkMixedToImproper}>Sprawdź zadanie {mixedToImproperIndex + 1}</button> : null}</div>
        <aside className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4"><h3 className="font-black">Interpretacja na małych grafikach</h3><MixedMiniature value={mixedToImproperExample.mixed} /><div className="mx-auto max-w-md rounded-xl bg-white p-2"><FractionCircleModel value={mixedToImproperExample.expected} label="pełne koła i pozostała część" showCaption={false} /></div><p className="text-center text-sm font-bold">Każde pełne pole i koło ma {mixedToImproperExample.mixed.denominator} części. Ostatnie ma zaznaczone {mixedToImproperExample.mixed.numerator}.</p><div className={styles.hintFlow}><div className={styles.hintStep}>{mixedToImproperExample.mixed.wholePart} całości × {mixedToImproperExample.mixed.denominator} części</div><div className={styles.hintStep}>dodaj {mixedToImproperExample.mixed.numerator} części</div><div className={styles.hintStep}>mianownik {mixedToImproperExample.mixed.denominator} zostaje</div></div></aside>
      </div>
    </div> : null}

    {activity === "topic2-halves" ? <div className="space-y-4"><div className={styles.taskTabs}>{([3,5,7] as const).map((count) => <button key={count} type="button" className={`${styles.taskTab} ${circleCount === count ? styles.taskTabActive : ""}`} onClick={() => { setCircleCount(count); setCut(false); setResponse(blankStack()); clear(); }}>{count} koła dla 2 osób</button>)}</div><section className="space-y-4 rounded-2xl bg-white p-4"><CircleCollection count={circleCount} cut={cut} />{!locked ? <button type="button" className="w-full rounded-xl bg-amber-600 px-5 py-3 text-lg font-black text-white" onClick={() => { setCut(true); clear(); }}>Podziel koła na połówki</button> : null}{cut ? <div className="mx-auto max-w-md"><p className="mb-3 text-center font-black">Ile całych kół otrzyma jedna osoba?</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} readOnly={locked} stepLabel="Zapisz udział jednej osoby" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={() => checkQuotient(circleCount, 2)}>Sprawdź podział</button> : null}</div> : null}</section></div> : null}

    {activity === "topic2-quotient-fractions" ? <div className="space-y-4"><div className={styles.taskTabs}>{quotientExamples.map((example, index) => <button key={index} type="button" className={`${styles.taskTab} ${quotientExample === index ? styles.taskTabActive : ""}`} onClick={() => { setQuotientExample(index as 0|1|2); setResponse(blankStack()); clear(); }}>{example.dividend} : {example.divisor}</button>)}</div><div className={styles.modelGrid}><div className="rounded-2xl bg-white p-4"><div className="mb-4 flex flex-wrap justify-center gap-2" aria-label={`${quotientExamples[quotientExample].dividend} obiektów`}>{Array.from({ length: quotientExamples[quotientExample].dividend }, (_, index) => <span key={index} className="grid size-10 place-items-center rounded-full border-2 border-violet-500 bg-violet-100 font-black">{index + 1}</span>)}</div><div className="flex flex-wrap justify-center gap-2" aria-label={`${quotientExamples[quotientExample].divisor} grup`}>{Array.from({ length: quotientExamples[quotientExample].divisor }, (_, index) => <span key={index} className="rounded-xl border-2 border-dashed border-slate-400 px-3 py-2 font-bold">grupa {index + 1}</span>)}</div></div><div className="rounded-2xl bg-white p-4"><p className="mb-3 text-center text-2xl font-black">{quotientExamples[quotientExample].dividend} : {quotientExamples[quotientExample].divisor} =</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} readOnly={locked} stepLabel="Dzielna nad kreskę, dzielnik pod kreskę" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={() => checkQuotient(quotientExamples[quotientExample].dividend, quotientExamples[quotientExample].divisor)}>Sprawdź zapis ilorazu</button> : null}</div></div></div> : null}

    {activity === "topic2-wholes-as-fractions" ? <div className="space-y-4"><div className={styles.taskTabs}>{([2,4,6] as const).map((denominator) => <button key={denominator} type="button" className={`${styles.taskTab} ${wholeDenominator === denominator ? styles.taskTabActive : ""}`} onClick={() => { setWholeDenominator(denominator); setCut(false); setResponse(blankStack()); clear(); }}>mianownik {denominator}</button>)}</div><section className="space-y-4 rounded-2xl bg-white p-4"><div className={styles.circleRow}>{[0,1].map((circle) => <div key={circle} className={styles.wholeCircle}>{cut ? <span className={styles.cutLines}>{Array.from({ length: wholeDenominator / 2 }, (_, index) => <span key={index} className={styles.halfLine} style={{ transform: `rotate(${index * 180 / (wholeDenominator / 2)}deg)` }} />)}</span> : null}</div>)}</div>{!locked ? <button type="button" className="w-full rounded-xl bg-amber-600 px-5 py-3 text-lg font-black text-white" onClick={() => setCut(true)}>Pokrój dwie całości na {wholeDenominator} części każdą</button> : null}{cut ? <div className="mx-auto max-w-md"><p className="mb-3 text-center font-black">2 całe =</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} readOnly={locked} stepLabel="Policz części obu całości" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkWhole}>Sprawdź ułamek równy 2</button> : null}</div> : null}</section></div> : null}

    {activity === "topic2-improper-to-mixed" ? <div className={styles.modelGrid}><FractionCircleModel value={{ numerator: 9, denominator: 4 }} label="dziewięć pokolorowanych ćwiartek" /><div className="rounded-2xl bg-white p-4"><div className="mb-4 flex items-center justify-center gap-3"><StaticFraction value={{ numerator: 9, denominator: 4 }} label="dziewięć czwartych" /><span className="text-3xl font-black">=</span></div><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} showWholePart readOnly={locked} stepLabel="Wpisz pełne całości i resztę" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkImproperToMixed}>Sprawdź liczbę mieszaną</button> : null}</div></div> : null}

    {activity === "topic1-independent-advanced" ? <div className="space-y-4">
      <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 text-center"><p className="mb-3 text-lg font-black">Zaznacz na osi ułamek:</p><StaticFraction value={advancedAxisTask} label="ułamek do zaznaczenia" /></div>
      <FractionNumberLine denominator={advancedAxisTask.denominator} selected={advancedAxisAnswer} onSelect={(value) => { setAdvancedAxisAnswer(value); clear(); }} disabled={locked} />
      <p className="text-center text-sm font-bold text-slate-600">Oś obejmuje liczby od 0 do 6. Każdy odcinek między kolejnymi liczbami podzielono na {advancedAxisTask.denominator} równych części.</p>
      {!locked ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkAdvancedAxis}>Sprawdź zaznaczenie</button> : null}
    </div> : null}

    {practiceMode && activity !== "topic1-independent-advanced" ? <div className="space-y-4"><div className="rounded-2xl bg-white p-4 text-center">{practiceTask.source && "wholePart" in practiceTask.source ? <StaticMixed value={practiceTask.source as MixedFractionValue} label="dana liczba mieszana" /> : practiceTask.source ? <StaticFraction value={practiceTask.source as FractionValue} label="dany ułamek" /> : null}</div>{practiceTask.kind === "classification" ? <div className="flex justify-center gap-3"><button type="button" className={`${styles.taskTab} ${classifications[0] === "proper" ? styles.taskTabActive : ""}`} onClick={() => { setClassifications({0:"proper"}); clear(); }}>ułamek właściwy</button><button type="button" className={`${styles.taskTab} ${classifications[0] === "improper" ? styles.taskTabActive : ""}`} onClick={() => { setClassifications({0:"improper"}); clear(); }}>ułamek niewłaściwy</button></div> : <div className="mx-auto max-w-md rounded-2xl bg-white p-4"><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} showWholePart={practiceTask.kind === "mixed"} readOnly={locked} stepLabel="Wpisz odpowiedź pionowo" /></div>}{!locked ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkPractice}>Sprawdź odpowiedź</button> : null}</div> : null}
    {feedbackPanel}
  </LessonTaskFrame>;
}
