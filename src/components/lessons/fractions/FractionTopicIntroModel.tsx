"use client";

import { useMemo, useState } from "react";
import { FractionCircleModel } from "@/components/lessons/fractions/FractionCircleModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
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
  "topic1-independent-advanced": "Rozpoznaj rodzaj, odczytaj model, zastosuj jednostkę albo wykonaj zamianę w jednym kierunku.",
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
  const axisTargets = { A: 2, B: 5, C: 7 } as const;
  const [activePoint, setActivePoint] = useState<keyof typeof axisTargets>("A");
  const [axisAnswers, setAxisAnswers] = useState<Record<string, FractionStackValue>>(() => Object.fromEntries(Object.keys(axisTargets).map((point) => [point, blankStack()])));
  const classifyValues = [{ numerator: 3, denominator: 5 }, { numerator: 7, denominator: 4 }, { numerator: 6, denominator: 6 }, { numerator: 2, denominator: 9 }, { numerator: 11, denominator: 8 }, { numerator: 5, denominator: 12 }];
  const [classifications, setClassifications] = useState<Record<number, "proper" | "improper">>({});
  const [modelMode, setModelMode] = useState<"improper" | "mixed">("improper");
  const [improperAnswer, setImproperAnswer] = useState<FractionStackValue>(blankStack());
  const [mixedAnswer, setMixedAnswer] = useState<FractionStackValue>(blankStack(true));
  const [unitTask, setUnitTask] = useState<"length" | "mass">("length");
  const [unitAnswers, setUnitAnswers] = useState<Record<string, FractionStackValue>>({ length: blankStack(), mass: blankStack() });
  const [response, setResponse] = useState<FractionStackValue>(() => blankStack(responseNeedsWhole));
  const [cut, setCut] = useState(false);
  const [circleCount, setCircleCount] = useState<3 | 5 | 7>(3);
  const [quotientExample, setQuotientExample] = useState<0 | 1 | 2>(0);
  const quotientExamples = [{ dividend: 1, divisor: 7 }, { dividend: 13, divisor: 5 }, { dividend: 8, divisor: 3 }] as const;
  const [wholeDenominator, setWholeDenominator] = useState<2 | 4 | 6>(6);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const clear = () => { setFeedback(null); onResultChange?.(null); };
  const finish = (correct: boolean, message: string, label: string) => { setFeedback({ correct, message }); onResultChange?.(correct, label); };
  const checkShadeColors = () => {
    const shaded = selectedParts.filter(Boolean).length;
    const colorsCorrect = colors.every((color) => parsedMatches(colorAnswers[color]!, { numerator: colorCounts[color], denominator: 12 }));
    finish(shaded === 4 && colorsCorrect, shaded !== 4 ? `Zaznacz dokładnie 4 z 7 równych części. Teraz zaznaczono ${shaded}.` : colorsCorrect ? "Model i cztery ułamki opisują dokładnie zaznaczone części." : "Policz wszystkie 12 kółek. Licznik zmienia się z kolorem, mianownik pozostaje równy 12.", `${shaded} z 7; kolory`);
  };
  const checkAxis = () => {
    const correct = (Object.keys(axisTargets) as Array<keyof typeof axisTargets>).every((point) => parsedMatches(axisAnswers[point]!, { numerator: axisTargets[point], denominator: 8 }));
    finish(correct, correct ? "Każdy punkt ma licznik równy numerowi kreski i wspólny mianownik 8." : "Oś ma 8 równych odcinków. Dla wybranego punktu policz kreski od zera.", "punkty A, B, C");
  };
  const checkClassify = () => {
    const correct = classifyValues.every((value, index) => classifications[index] === (value.numerator < value.denominator ? "proper" : "improper"));
    finish(correct, correct ? "W każdym ułamku porównałeś licznik z mianownikiem." : "Ułamek właściwy ma licznik mniejszy od mianownika. Równe liczby tworzą już ułamek niewłaściwy.", "klasyfikacja");
  };
  const checkImproperModel = () => {
    const correct = parsedMatches(improperAnswer, { numerator: 7, denominator: 4 }) && parsedMatches(mixedAnswer, { numerator: 3, denominator: 4 }, 1);
    finish(correct, correct ? "Jedno pełne koło i trzy czwarte drugiego mają oba poprawne zapisy." : "Policz wszystkie pokolorowane ćwiartki, a potem oddziel pełne koło.", "model kół");
  };
  const checkUnits = () => {
    const correct = parsedMatches(unitAnswers.length!, { numerator: 7, denominator: 10 }) && parsedMatches(unitAnswers.mass!, { numerator: 3, denominator: 10 });
    finish(correct, correct ? "Oba ułamki jednostek są poprawne." : "Ustal, ile mniejszych jednostek tworzy jedną większą. Zapis masy skróć do dziesiątych.", "jednostki");
  };
  const checkMixedToImproper = () => { const correct = parsedMatches(response, { numerator: 13, denominator: 5 }); finish(correct, correct ? "Dwie całości dały dziesięć piątych; po dodaniu trzech piątych otrzymujesz trzynaście piątych." : "Pomnóż 2 przez 5, dodaj 3, a mianownik 5 pozostaw bez zmiany.", "zamiana"); };
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

  return <article className={`${styles.lesson} space-y-5 rounded-[2rem] border-2 border-violet-100 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-4 text-slate-950 shadow-xl sm:p-6`} data-fraction-topic-intro data-fraction-activity={activity} data-seed={effectiveSeed} data-difficulty={difficulty}>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-violet-700">Dział 3 · Ułamki zwykłe</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{TITLES[activity]}</h2><p className="mt-2 max-w-3xl font-semibold leading-relaxed text-slate-700">{practiceMode ? practiceTask.prompt : PROMPTS[activity]}</p></div>{questionNumber && questionCount ? <b className="rounded-xl bg-violet-100 px-3 py-2 text-sm text-violet-950">Zadanie {questionNumber}/{questionCount}</b> : null}</header>

    {activity === "topic1-shade-colors" ? <div className="space-y-6"><section className="space-y-3 rounded-2xl bg-white p-4"><h3 className="text-lg font-black">1. Zaznacz cztery siódme</h3><div className="flex items-center gap-4"><StaticFraction value={{ numerator: 4, denominator: 7 }} label="cztery siódme" /><div className={`${styles.partGrid} flex-1`}>{selectedParts.map((selected, index) => <button key={index} type="button" aria-pressed={selected} aria-label={`część ${index + 1} z 7`} disabled={locked} className={`${styles.partButton} ${selected ? styles.partSelected : ""}`} onClick={() => { setSelectedParts((items) => items.map((item, itemIndex) => itemIndex === index ? !item : item)); clear(); }}>{index + 1}</button>)}</div></div></section><section className="space-y-4 rounded-2xl bg-white p-4"><h3 className="text-lg font-black">2. Jaką część wszystkich kółek stanowi każdy kolor?</h3><div className={styles.circleGrid}>{colors.flatMap((color) => Array.from({ length: colorCounts[color] }, (_, index) => <span key={`${color}-${index}`} className={styles.colorCircle} aria-label={`${color} kółko`} style={{ background: color === "białe" ? "#fff" : color === "czerwone" ? "#ef4444" : color === "zielone" ? "#22c55e" : "#facc15" }} />))}</div><div className={styles.taskTabs}>{colors.map((color) => <button key={color} type="button" className={`${styles.taskTab} ${activeColor === color ? styles.taskTabActive : ""}`} aria-pressed={activeColor === color} onClick={() => setActiveColor(color)}>{color}</button>)}</div><FractionStackInput value={activeColorAnswer} onChange={(value) => { setColorAnswers((answers) => ({ ...answers, [activeColor]: value })); clear(); }} readOnly={locked} stepLabel={`Zapisz część: kółka ${activeColor}`} /></section>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkShadeColors}>Sprawdź zaznaczenie i kolory</button> : null}</div> : null}

    {activity === "topic1-axis-labels" ? <div className="space-y-4"><section className={`rounded-2xl bg-white ${styles.axis}`} aria-label="Oś od zera do jedności podzielona na osiem części"><div className={styles.axisLine} /><div className={styles.ticks}>{Array.from({ length: 9 }, (_, index) => { const point = Object.entries(axisTargets).find(([, value]) => value === index)?.[0]; return <div key={index} className={styles.tick}>{index === 0 || index === 8 ? <b>{index / 8}</b> : point ? <span className={styles.point}>{point}</span> : <span className="h-9" />}<span className={styles.tickMark} /></div>; })}</div></section><div className={styles.taskTabs}>{(Object.keys(axisTargets) as Array<keyof typeof axisTargets>).map((point) => <button key={point} type="button" className={`${styles.taskTab} ${activePoint === point ? styles.taskTabActive : ""}`} onClick={() => setActivePoint(point)}>Punkt {point}</button>)}</div><div className="rounded-2xl bg-white p-4"><FractionStackInput value={axisAnswers[activePoint]!} onChange={(value) => { setAxisAnswers((answers) => ({ ...answers, [activePoint]: value })); clear(); }} readOnly={locked} stepLabel={`Podpisz punkt ${activePoint}`} /></div>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkAxis}>Sprawdź podpisy osi</button> : null}</div> : null}

    {activity === "topic1-classify" ? <div className="space-y-4"><div className={styles.classifyGrid}>{classifyValues.map((value, index) => <div key={index} className={styles.classifyCard}><StaticFraction value={value} label="ułamek do rozpoznania" /><div className="flex gap-2"><button type="button" aria-pressed={classifications[index] === "proper"} className={`${styles.taskTab} ${classifications[index] === "proper" ? styles.taskTabActive : ""}`} onClick={() => { setClassifications((items) => ({ ...items, [index]: "proper" })); clear(); }}>właściwy</button><button type="button" aria-pressed={classifications[index] === "improper"} className={`${styles.taskTab} ${classifications[index] === "improper" ? styles.taskTabActive : ""}`} onClick={() => { setClassifications((items) => ({ ...items, [index]: "improper" })); clear(); }}>niewłaściwy</button></div></div>)}</div>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkClassify}>Sprawdź wszystkie ułamki</button> : null}</div> : null}

    {activity === "topic1-improper-model" ? <div className="space-y-4"><div className={styles.modelGrid}><FractionCircleModel value={{ numerator: 7, denominator: 4 }} label="jedno pełne koło i trzy ćwiartki drugiego" /><div className="space-y-3 rounded-2xl bg-white p-4"><div className={styles.taskTabs}><button type="button" className={`${styles.taskTab} ${modelMode === "improper" ? styles.taskTabActive : ""}`} onClick={() => setModelMode("improper")}>ułamek niewłaściwy</button><button type="button" className={`${styles.taskTab} ${modelMode === "mixed" ? styles.taskTabActive : ""}`} onClick={() => setModelMode("mixed")}>liczba mieszana</button></div><FractionStackInput value={modelMode === "improper" ? improperAnswer : mixedAnswer} onChange={(value) => { if (modelMode === "improper") setImproperAnswer(value); else setMixedAnswer(value); clear(); }} showWholePart={modelMode === "mixed"} readOnly={locked} stepLabel={modelMode === "improper" ? "Policz wszystkie pokolorowane ćwiartki" : "Oddziel pełne koło i resztę"} /></div></div>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkImproperModel}>Sprawdź oba zapisy</button> : null}</div> : null}

    {activity === "topic1-unit-fractions" ? <div className="space-y-4"><div className={styles.taskTabs}><button type="button" className={`${styles.taskTab} ${unitTask === "length" ? styles.taskTabActive : ""}`} onClick={() => setUnitTask("length")}>7 mm z 1 cm</button><button type="button" className={`${styles.taskTab} ${unitTask === "mass" ? styles.taskTabActive : ""}`} onClick={() => setUnitTask("mass")}>300 g z 1 kg</button></div><div className="rounded-2xl bg-white p-4"><p className="mb-4 text-center text-lg font-black">{unitTask === "length" ? "7 mm to jaka część 1 cm?" : "300 g to jaka część 1 kg? Zapisz po skróceniu w dziesiątych."}</p><FractionStackInput value={unitAnswers[unitTask]!} onChange={(value) => { setUnitAnswers((answers) => ({ ...answers, [unitTask]: value })); clear(); }} readOnly={locked} stepLabel="Zapisz część większej jednostki" /></div>{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 text-lg font-black text-white" onClick={checkUnits}>Sprawdź oba zadania z jednostkami</button> : null}</div> : null}

    {activity === "topic1-mixed-to-improper" ? <div className={styles.modelGrid}><div className="space-y-4 rounded-2xl bg-white p-5 text-center"><p className="font-black">Zamień:</p><StaticMixed value={{ wholePart: 2, numerator: 3, denominator: 5 }} label="dwie i trzy piąte" /><span className="mx-3 text-3xl font-black">=</span><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} readOnly={locked} stepLabel="Wpisz ułamek niewłaściwy" />{!locked ? <button type="button" className="w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkMixedToImproper}>Sprawdź zamianę</button> : null}</div><aside className="space-y-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4"><h3 className="font-black">Graficzna podpowiedź</h3><div className={styles.hintFlow}><div className={styles.hintStep}>2 całości × 5 części</div><div className={styles.hintStep}>dodaj 3 części</div><div className={styles.hintStep}>mianownik 5 zostaje</div></div></aside></div> : null}

    {activity === "topic2-halves" ? <div className="space-y-4"><div className={styles.taskTabs}>{([3,5,7] as const).map((count) => <button key={count} type="button" className={`${styles.taskTab} ${circleCount === count ? styles.taskTabActive : ""}`} onClick={() => { setCircleCount(count); setCut(false); setResponse(blankStack()); clear(); }}>{count} koła dla 2 osób</button>)}</div><section className="space-y-4 rounded-2xl bg-white p-4"><CircleCollection count={circleCount} cut={cut} />{!locked ? <button type="button" className="w-full rounded-xl bg-amber-600 px-5 py-3 text-lg font-black text-white" onClick={() => { setCut(true); clear(); }}>Podziel koła na połówki</button> : null}{cut ? <div className="mx-auto max-w-md"><p className="mb-3 text-center font-black">Ile całych kół otrzyma jedna osoba?</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} readOnly={locked} stepLabel="Zapisz udział jednej osoby" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={() => checkQuotient(circleCount, 2)}>Sprawdź podział</button> : null}</div> : null}</section></div> : null}

    {activity === "topic2-quotient-fractions" ? <div className="space-y-4"><div className={styles.taskTabs}>{quotientExamples.map((example, index) => <button key={index} type="button" className={`${styles.taskTab} ${quotientExample === index ? styles.taskTabActive : ""}`} onClick={() => { setQuotientExample(index as 0|1|2); setResponse(blankStack()); clear(); }}>{example.dividend} : {example.divisor}</button>)}</div><div className={styles.modelGrid}><div className="rounded-2xl bg-white p-4"><div className="mb-4 flex flex-wrap justify-center gap-2" aria-label={`${quotientExamples[quotientExample].dividend} obiektów`}>{Array.from({ length: quotientExamples[quotientExample].dividend }, (_, index) => <span key={index} className="grid size-10 place-items-center rounded-full border-2 border-violet-500 bg-violet-100 font-black">{index + 1}</span>)}</div><div className="flex flex-wrap justify-center gap-2" aria-label={`${quotientExamples[quotientExample].divisor} grup`}>{Array.from({ length: quotientExamples[quotientExample].divisor }, (_, index) => <span key={index} className="rounded-xl border-2 border-dashed border-slate-400 px-3 py-2 font-bold">grupa {index + 1}</span>)}</div></div><div className="rounded-2xl bg-white p-4"><p className="mb-3 text-center text-2xl font-black">{quotientExamples[quotientExample].dividend} : {quotientExamples[quotientExample].divisor} =</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} readOnly={locked} stepLabel="Dzielna nad kreskę, dzielnik pod kreskę" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={() => checkQuotient(quotientExamples[quotientExample].dividend, quotientExamples[quotientExample].divisor)}>Sprawdź zapis ilorazu</button> : null}</div></div></div> : null}

    {activity === "topic2-wholes-as-fractions" ? <div className="space-y-4"><div className={styles.taskTabs}>{([2,4,6] as const).map((denominator) => <button key={denominator} type="button" className={`${styles.taskTab} ${wholeDenominator === denominator ? styles.taskTabActive : ""}`} onClick={() => { setWholeDenominator(denominator); setCut(false); setResponse(blankStack()); clear(); }}>mianownik {denominator}</button>)}</div><section className="space-y-4 rounded-2xl bg-white p-4"><div className={styles.circleRow}>{[0,1].map((circle) => <div key={circle} className={styles.wholeCircle}>{cut ? <span className={styles.cutLines}>{Array.from({ length: wholeDenominator / 2 }, (_, index) => <span key={index} className={styles.halfLine} style={{ transform: `rotate(${index * 180 / (wholeDenominator / 2)}deg)` }} />)}</span> : null}</div>)}</div>{!locked ? <button type="button" className="w-full rounded-xl bg-amber-600 px-5 py-3 text-lg font-black text-white" onClick={() => setCut(true)}>Pokrój dwie całości na {wholeDenominator} części każdą</button> : null}{cut ? <div className="mx-auto max-w-md"><p className="mb-3 text-center font-black">2 całe =</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} readOnly={locked} stepLabel="Policz części obu całości" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkWhole}>Sprawdź ułamek równy 2</button> : null}</div> : null}</section></div> : null}

    {activity === "topic2-improper-to-mixed" ? <div className={styles.modelGrid}><FractionCircleModel value={{ numerator: 9, denominator: 4 }} label="dziewięć pokolorowanych ćwiartek" /><div className="rounded-2xl bg-white p-4"><div className="mb-4 flex items-center justify-center gap-3"><StaticFraction value={{ numerator: 9, denominator: 4 }} label="dziewięć czwartych" /><span className="text-3xl font-black">=</span></div><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} showWholePart readOnly={locked} stepLabel="Wpisz pełne całości i resztę" />{!locked ? <button type="button" className="mt-3 w-full rounded-xl bg-violet-700 px-5 py-3 font-black text-white" onClick={checkImproperToMixed}>Sprawdź liczbę mieszaną</button> : null}</div></div> : null}

    {practiceMode ? <div className="space-y-4"><div className="rounded-2xl bg-white p-4 text-center">{practiceTask.source && "wholePart" in practiceTask.source ? <StaticMixed value={practiceTask.source as MixedFractionValue} label="dana liczba mieszana" /> : practiceTask.source ? <StaticFraction value={practiceTask.source as FractionValue} label="dany ułamek" /> : null}</div>{practiceTask.kind === "classification" ? <div className="flex justify-center gap-3"><button type="button" className={`${styles.taskTab} ${classifications[0] === "proper" ? styles.taskTabActive : ""}`} onClick={() => { setClassifications({0:"proper"}); clear(); }}>ułamek właściwy</button><button type="button" className={`${styles.taskTab} ${classifications[0] === "improper" ? styles.taskTabActive : ""}`} onClick={() => { setClassifications({0:"improper"}); clear(); }}>ułamek niewłaściwy</button></div> : <div className="mx-auto max-w-md rounded-2xl bg-white p-4"><FractionStackInput value={response} onChange={(value) => { setResponse(value); clear(); }} showWholePart={practiceTask.kind === "mixed"} readOnly={locked} stepLabel="Wpisz odpowiedź pionowo" /></div>}{!locked ? <button type="button" className="w-full rounded-xl bg-slate-950 px-5 py-3 text-lg font-black text-white" onClick={checkPractice}>Sprawdź odpowiedź</button> : null}</div> : null}
    {feedbackPanel}
  </article>;
}
