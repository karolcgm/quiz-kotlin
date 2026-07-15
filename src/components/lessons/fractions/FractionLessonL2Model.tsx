"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { FractionCircleModel } from "@/components/lessons/fractions/FractionCircleModel";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  areEquivalentFractions,
  fractionStackValueFromFraction,
  parseFractionStackValue,
} from "@/lib/math/fractions";
import {
  FRACTION_MIXED_CONVERSION_CODE,
  classifyFraction,
  createFractionLessonL2DiagnosticResult,
  createPublicFractionLessonL2Task,
  mixedConversionEquation,
  type FractionLessonL2Activity,
  type FractionLessonL2DiagnosticCode,
  type FractionLessonL2SourceKind,
} from "@/lib/math/fractions/fractionLessonL2";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type { FractionDigit, FractionStackValue, FractionValue, MixedFractionValue } from "@/types/fractions";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/fractions/fractionLessonL2.module.css";

const ACTIVITY_TITLES: Record<FractionLessonL2Activity, string> = {
  "more-than-one-pizza": "Więcej niż jedna pizza",
  "group-wholes": "Zgrupuj pełne całości",
  "convert-both-ways": "Zamiana w obie strony",
  "mixed-number-line": "Oś liczb mieszanych",
  "class-picnic": "Piknik klasowy",
  "independent-l2": "Samodzielna próba",
};

const SOURCE_LABELS: Record<FractionLessonL2SourceKind, string> = {
  proper: "ułamek właściwy",
  improper: "ułamek niewłaściwy",
  mixed: "liczba mieszana",
};

function blankFractionStack(showWholePart = false): FractionStackValue {
  return {
    wholePart: showWholePart ? [""] : undefined,
    numerator: [""],
    denominator: [""],
  };
}

function digitRowValue(row: FractionDigit[] | undefined): number | null {
  if (!row?.length || row.some((digit) => digit === "")) return null;
  const value = Number(row.join(""));
  return Number.isSafeInteger(value) ? value : null;
}

function stackLabel(value: FractionStackValue): string {
  const whole = value.wholePart?.join("");
  return `${whole ? `${whole} ` : ""}${value.numerator.join("")}/${value.denominator.join("")}`;
}

function StaticFraction({ value, label }: { value: FractionValue; label: string }) {
  return (
    <span className={styles.staticFraction} aria-label={`${label}: ${value.numerator}/${value.denominator}`}>
      <span>{value.numerator}</span><span className={styles.fractionLine} aria-hidden /><span>{value.denominator}</span>
    </span>
  );
}

function StaticMixed({ value, label }: { value: MixedFractionValue; label: string }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`${label}: ${value.wholePart} i ${value.numerator}/${value.denominator}`}>
      <b className="text-2xl">{value.wholePart}</b>
      <StaticFraction value={{ numerator: value.numerator, denominator: value.denominator }} label="część ułamkowa" />
    </span>
  );
}

interface MixedNumberLineProps {
  denominator: number;
  numerator: number;
  onChange: (numerator: number) => void;
  readOnly?: boolean;
}

/** Oś 0–3 z jawnymi granicami 1 i 2 oraz równoważnym sterowaniem dotykiem i klawiaturą. */
export function MixedNumberLine({ denominator, numerator, onChange, readOnly = false }: MixedNumberLineProps) {
  const maximumNumerator = denominator * 3;
  const safeNumerator = Math.max(0, Math.min(maximumNumerator, numerator));
  const xFor = (tick: number) => 30 + tick / maximumNumerator * 540;
  const ticks = Array.from({ length: maximumNumerator + 1 }, (_, index) => index);
  const update = (next: number) => onChange(Math.max(0, Math.min(maximumNumerator, Math.trunc(next))));
  const mixedWhole = Math.floor(safeNumerator / denominator);
  const remainder = safeNumerator % denominator;

  return (
    <section className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3" aria-label="Oś liczb mieszanych od 0 do 3">
      <AccessibleMathSvg
        title="Oś liczb mieszanych"
        description={`Oś od 0 do 3 podzielona na ${denominator} równych części w każdej całości. Punkt wskazuje ${mixedWhole} i ${remainder}/${denominator}. Granice 1 i 2 są wyróżnione.`}
        viewBox="0 0 600 125"
        className="h-auto w-full"
        columns={[{ key: "whole", label: "Całości" }, { key: "remainder", label: "Reszta" }, { key: "value", label: "Wartość" }]}
        rows={[{ whole: mixedWhole, remainder: `${remainder}/${denominator}`, value: `${safeNumerator}/${denominator}` }]}
      >
        <line x1="30" y1="58" x2="570" y2="58" stroke="#0f172a" strokeWidth="4" />
        {ticks.map((tick) => {
          const isWhole = tick % denominator === 0;
          return <g key={tick} data-mixed-axis-tick={tick}>
            <line x1={xFor(tick)} y1={isWhole ? 36 : 46} x2={xFor(tick)} y2="75" stroke={isWhole ? "#6d28d9" : "#475569"} strokeWidth={isWhole ? 5 : 2} />
            {isWhole ? <text x={xFor(tick)} y="104" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0f172a">{tick / denominator}</text> : null}
          </g>;
        })}
        <circle cx={xFor(safeNumerator)} cy="58" r="11" fill="#4f46e5" stroke="#fff" strokeWidth="4" data-mixed-axis-point />
      </AccessibleMathSvg>

      {!readOnly ? <InteractionAlternativePanel title="Sterowanie punktem" instruction="Przesuń suwak, użyj strzałek albo wpisz numer kreski. Punkt zawsze zatrzymuje się na podziałce.">
        <input type="range" min={0} max={maximumNumerator} step={1} value={safeNumerator} aria-label="Przesuń punkt na osi liczb mieszanych" aria-valuetext={`${mixedWhole} i ${remainder}/${denominator}`} className="min-h-11 w-full accent-indigo-700" onChange={(event) => update(Number(event.target.value))} />
        <div className="grid w-full grid-cols-[auto_minmax(7rem,1fr)_auto] gap-2">
          <button type="button" className={styles.secondaryButton} disabled={safeNumerator === 0} onClick={() => update(safeNumerator - 1)}>← lewo</button>
          <label className="grid gap-1 text-center text-xs font-black">Numer kreski
            <input type="number" min={0} max={maximumNumerator} value={safeNumerator} aria-label="Numer kreski osi mieszanej" className="min-h-11 rounded-xl border-2 border-slate-300 px-3 text-center text-lg font-black" onChange={(event) => update(Number(event.target.value))} />
          </label>
          <button type="button" className={styles.secondaryButton} disabled={safeNumerator === maximumNumerator} onClick={() => update(safeNumerator + 1)}>prawo →</button>
        </div>
      </InteractionAlternativePanel> : null}
    </section>
  );
}

export interface FractionLessonL2ModelProps {
  activity: FractionLessonL2Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function FractionLessonL2Model({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: FractionLessonL2ModelProps) {
  const effectiveSeed = taskSeed ?? seed;
  const task = useMemo(() => createPublicFractionLessonL2Task({ seed: effectiveSeed, difficulty, activity }), [activity, difficulty, effectiveSeed]);
  const [classification, setClassification] = useState<FractionLessonL2SourceKind | null>(null);
  const [grouped, setGrouped] = useState(false);
  const [direction, setDirection] = useState<"improper-to-mixed" | "mixed-to-improper">("improper-to-mixed");
  const [response, setResponse] = useState<FractionStackValue>(() => blankFractionStack(true));
  const [axisNumerator, setAxisNumerator] = useState(0);
  const [fullAnswer, setFullAnswer] = useState("");
  const [revealStep, setRevealStep] = useState(0);
  const [diagnosticCode, setDiagnosticCode] = useState<FractionLessonL2DiagnosticCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const controlsLocked = readOnly || presentationMode && activity === "independent-l2";
  const diagnostic = diagnosticCode ? createFractionLessonL2DiagnosticResult(diagnosticCode) : null;
  const equation = mixedConversionEquation(task.mixed);
  const expectedClassification: FractionLessonL2SourceKind = task.sourceKind === "mixed" ? "mixed" : classifyFraction(task.target);

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const chooseClassification = (value: FractionLessonL2SourceKind) => {
    setClassification(value);
    clearResult();
  };

  const responseError = (expectMixed: boolean): FractionLessonL2DiagnosticCode | null => {
    const parsed = parseFractionStackValue({ ...response, wholePart: expectMixed ? response.wholePart ?? [""] : undefined });
    if (!parsed.ok) {
      return parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
        ? FRACTION_FEEDBACK_CODES.zeroDenominator
        : FRACTION_FEEDBACK_CODES.emptyPart;
    }
    if (parsed.value.numerator === task.target.denominator && parsed.value.denominator === task.target.numerator) {
      return FRACTION_FEEDBACK_CODES.numeratorDenominatorSwapped;
    }
    if (!areEquivalentFractions(parsed.value, task.target)) return FRACTION_MIXED_CONVERSION_CODE;
    if (expectMixed) {
      const whole = digitRowValue(response.wholePart);
      const numerator = digitRowValue(response.numerator);
      const denominator = digitRowValue(response.denominator);
      if (whole === null || numerator === null || denominator === null) return FRACTION_FEEDBACK_CODES.emptyPart;
      if (whole < 1 || numerator >= denominator) return FRACTION_MIXED_CONVERSION_CODE;
    }
    return null;
  };

  const checkClassification = () => {
    if (classification !== "improper") {
      setDiagnosticCode(FRACTION_MIXED_CONVERSION_CODE);
      setSuccessMessage(null);
      onResultChange?.(false, classification ?? "brak klasyfikacji");
      return;
    }
    setDiagnosticCode(null);
    setSuccessMessage("7/4 jest poprawnym ułamkiem niewłaściwym: opisuje więcej niż jedną całość.");
    onResultChange?.(true, "7/4 — ułamek niewłaściwy");
  };

  const checkConversion = (expectMixed = direction === "improper-to-mixed") => {
    const error = responseError(expectMixed);
    if (error) {
      setDiagnosticCode(error);
      setSuccessMessage(null);
      onResultChange?.(false, stackLabel(response));
      return false;
    }
    setDiagnosticCode(null);
    setSuccessMessage(expectMixed
      ? "Pełne całości i reszta zachowują wartość ułamka niewłaściwego."
      : "Łącznik całości × mianownik + licznik prowadzi do poprawnego licznika.");
    onResultChange?.(true, stackLabel(response));
    return true;
  };

  const checkAxis = () => {
    if (axisNumerator !== task.target.numerator) {
      setDiagnosticCode(FRACTION_MIXED_CONVERSION_CODE);
      setSuccessMessage(null);
      onResultChange?.(false, `${axisNumerator}/${task.target.denominator}`);
      return;
    }
    setDiagnosticCode(null);
    setSuccessMessage(`Punkt ${task.target.numerator}/${task.target.denominator} leży we właściwym miejscu względem 1 i 2.`);
    onResultChange?.(true, `${axisNumerator}/${task.target.denominator}`);
  };

  const checkPicnic = () => {
    const conversionError = responseError(true);
    if (conversionError) {
      setDiagnosticCode(conversionError);
      setSuccessMessage(null);
      onResultChange?.(false, `${stackLabel(response)}; ${fullAnswer}`);
      return;
    }
    if (!fullAnswer.trim() || !/pizz/iu.test(fullAnswer)) {
      setDiagnosticCode(FRACTION_FEEDBACK_CODES.emptyPart);
      setSuccessMessage(null);
      onResultChange?.(false, `${stackLabel(response)}; brak pełnej odpowiedzi`);
      return;
    }
    setDiagnosticCode(null);
    setSuccessMessage("Pełna odpowiedź: 11 ćwiartek to 2 całe pizze i 3/4 pizzy.");
    onResultChange?.(true, `${stackLabel(response)}; ${fullAnswer.trim()}`);
  };

  const checkIndependent = () => {
    if (classification !== expectedClassification) {
      setDiagnosticCode(FRACTION_MIXED_CONVERSION_CODE);
      setSuccessMessage(null);
      onResultChange?.(false, classification ?? "brak klasyfikacji");
      return;
    }
    const expectsConversion = task.sourceKind !== "proper";
    if (expectsConversion && responseError(task.sourceKind === "improper")) {
      setDiagnosticCode(responseError(task.sourceKind === "improper"));
      setSuccessMessage(null);
      onResultChange?.(false, stackLabel(response));
      return;
    }
    if (axisNumerator !== task.target.numerator) {
      setDiagnosticCode(FRACTION_MIXED_CONVERSION_CODE);
      setSuccessMessage(null);
      onResultChange?.(false, `${stackLabel(response)}; oś ${axisNumerator}/${task.target.denominator}`);
      return;
    }
    setDiagnosticCode(null);
    setSuccessMessage("Rozpoznanie, zamiana i położenie na osi opisują tę samą wartość.");
    onResultChange?.(true, `${SOURCE_LABELS[expectedClassification]}; ${stackLabel(response)}; oś ${axisNumerator}/${task.target.denominator}`);
  };

  const classificationButtons = (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Rozpoznaj zapis">
      {(["proper", "improper", "mixed"] as const).map((kind) => <button key={kind} type="button" aria-pressed={classification === kind} className={classification === kind ? styles.activeButton : styles.secondaryButton} onClick={() => chooseClassification(kind)}>{SOURCE_LABELS[kind]}</button>)}
    </div>
  );

  const sourceDisplay = task.sourceKind === "mixed"
    ? <StaticMixed value={task.mixed} label="Wylosowana liczba mieszana" />
    : <StaticFraction value={task.target} label="Wylosowany ułamek" />;

  return (
    <LessonTaskFrame className={styles.lesson} contentClassName="space-y-4" eyebrow="Dział 3 · Ułamki zwykłe" heading={ACTIVITY_TITLES[activity]} description={task.prompt} questionNumber={questionNumber} questionCount={questionCount} data-fraction-lesson-l2 data-fraction-activity={activity} data-orientation-contract="portrait-landscape" data-generator-id={task.generatorId} data-seed={effectiveSeed} data-difficulty={difficulty}>

      {activity === "more-than-one-pizza" ? <div className="space-y-4">
        <FractionCircleModel value={{ numerator: 7, denominator: 4 }} variant="pizza" label="Siedem ćwiartek na dwóch pizzach" />
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-4 text-center"><StaticFraction value={{ numerator: 7, denominator: 4 }} label="siedem czwartych" /><p className="mt-2 font-bold">Licznik może być większy od mianownika. Taki ułamek opisuje co najmniej jedną całość.</p></div>
        {!controlsLocked ? <InteractionAlternativePanel title="Rozpoznaj ułamek" instruction="Wybierz rodzaj zapisu. Ułamek niewłaściwy jest poprawną reprezentacją wartości.">{classificationButtons}<button type="button" className={styles.primaryButton} onClick={checkClassification}>Sprawdź rozpoznanie</button></InteractionAlternativePanel> : null}
      </div> : null}

      {activity === "group-wholes" ? <div className="space-y-4">
        <div className={grouped ? styles.groupedWorkspace : styles.ungroupedWorkspace} data-grouped={grouped || undefined}>
          {!grouped ? <FractionCircleModel value={{ numerator: 7, denominator: 4 }} variant="pizza" label="Siedem ćwiartek przed grupowaniem" /> : <><div className={styles.wholeCard}><FractionCircleModel value={{ numerator: 4, denominator: 4 }} variant="pizza" label="Jedna pełna całość" /><b>1 całość</b></div><div className={styles.remainderCard}><FractionCircleModel value={{ numerator: 3, denominator: 4 }} variant="pizza" label="Pozostałe trzy ćwiartki" /><b>reszta 3/4</b></div></>}
        </div>
        {grouped ? <div className="rounded-2xl bg-white p-4"><FractionStackInput value={fractionStackValueFromFraction({ numerator: 7, denominator: 4 }, { mixed: true })} onChange={() => undefined} showWholePart readOnly showKeypad={false} stepLabel="Pełna całość w osobnej kratce" /></div> : null}
        {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={() => { setGrouped((value) => !value); clearResult(); }}>{grouped ? "Pokaż ponownie 7 osobnych ćwiartek" : "Połącz 4 kawałki po 1/4 w jedną całą pizzę"}</button> : null}
      </div> : null}

      {activity === "convert-both-ways" ? <div className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2"><button type="button" aria-pressed={direction === "improper-to-mixed"} className={direction === "improper-to-mixed" ? styles.activeButton : styles.secondaryButton} onClick={() => { setDirection("improper-to-mixed"); setResponse(blankFractionStack(true)); clearResult(); }}>7/4 → liczba mieszana</button><button type="button" aria-pressed={direction === "mixed-to-improper"} className={direction === "mixed-to-improper" ? styles.activeButton : styles.secondaryButton} onClick={() => { setDirection("mixed-to-improper"); setResponse(blankFractionStack(false)); clearResult(); }}>1 3/4 → ułamek</button></div>
        <div className={styles.conversionGrid}><div className={styles.sourceCard}>{direction === "improper-to-mixed" ? <StaticFraction value={task.target} label="Ułamek niewłaściwy" /> : <StaticMixed value={task.mixed} label="Liczba mieszana" />}</div><div className={styles.connector} data-conversion-connector><span>całości × mianownik + licznik</span><b>{revealStep >= 1 ? `${task.mixed.wholePart} × ${task.mixed.denominator}` : "□ × □"}</b><b>{revealStep >= 2 ? `+ ${task.mixed.numerator}` : "+ □"}</b><b>{revealStep >= 3 ? `= ${equation.result}` : "= □"}</b></div><div className={styles.responseCard}><FractionStackInput value={response} onChange={(value) => { setResponse(value); clearResult(); }} showWholePart={direction === "improper-to-mixed"} readOnly={controlsLocked} stepLabel="Wpisz równoważną postać" /></div></div>
        <div className="flex flex-wrap justify-center gap-2"><button type="button" className={styles.secondaryButton} disabled={revealStep === 0} onClick={() => setRevealStep((step) => Math.max(0, step - 1))}>← Poprzedni krok</button><button type="button" className={styles.secondaryButton} disabled={revealStep === 3} onClick={() => setRevealStep((step) => Math.min(3, step + 1))}>Następny krok →</button></div>
        {!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={() => checkConversion()}>Sprawdź zamianę</button> : null}
      </div> : null}

      {activity === "mixed-number-line" ? <div className="space-y-4"><div className="flex items-center justify-center gap-3 rounded-2xl bg-violet-50 p-3"><span className="font-black">Ustaw:</span><StaticFraction value={task.target} label="Cel osi" /><span className="font-black">=</span><StaticMixed value={task.mixed} label="Ta sama liczba mieszana" /></div><MixedNumberLine denominator={task.target.denominator} numerator={axisNumerator} onChange={(value) => { setAxisNumerator(value); clearResult(); }} readOnly={controlsLocked} />{!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkAxis}>Sprawdź punkt względem 1 i 2</button> : null}</div> : null}

      {activity === "class-picnic" ? <div className="space-y-4"><FractionCircleModel value={{ numerator: 11, denominator: 4 }} variant="pizza" label="Jedenaście ćwiartek pizzy na piknik" /><div className={styles.workspace}><div className="rounded-2xl bg-white p-4"><p className="mb-3 font-black">Zapisz 11/4 jako liczbę mieszaną</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clearResult(); }} showWholePart readOnly={controlsLocked} stepLabel="Zgrupuj jedenaście ćwiartek" /></div><label className="grid gap-2 rounded-2xl bg-white p-4 font-black">Pełna odpowiedź<textarea value={fullAnswer} readOnly={controlsLocked} rows={4} className="rounded-xl border-2 border-slate-300 p-3 font-semibold" placeholder="Napisz pełnym zdaniem, ile pizzy przygotowano." onChange={(event) => { setFullAnswer(event.target.value); clearResult(); }} /></label></div>{!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkPicnic}>Sprawdź model i pełną odpowiedź</button> : null}</div> : null}

      {activity === "independent-l2" ? <div className="space-y-4"><div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-violet-200 bg-white p-4"><span className="font-black">Wylosowany zapis:</span>{sourceDisplay}</div>{classificationButtons}{task.sourceKind !== "proper" ? <div className="rounded-2xl bg-white p-4"><p className="mb-3 text-center font-black">{task.sourceKind === "improper" ? "Zamień na liczbę mieszaną" : "Zamień na ułamek niewłaściwy"}</p><FractionStackInput value={response} onChange={(value) => { setResponse(value); clearResult(); }} showWholePart={task.sourceKind === "improper"} readOnly={controlsLocked} stepLabel="Samodzielna zamiana" /></div> : <p className="rounded-xl bg-cyan-50 p-3 text-center font-bold">Ułamek właściwy nie zawiera pełnej całości — przejdź do osi.</p>}<MixedNumberLine denominator={task.target.denominator} numerator={axisNumerator} onChange={(value) => { setAxisNumerator(value); clearResult(); }} readOnly={controlsLocked} />{!controlsLocked ? <button type="button" className={styles.primaryButton} onClick={checkIndependent}>Sprawdź samodzielną próbę</button> : null}</div> : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnostic ? (onResultChange
        ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
        : <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
