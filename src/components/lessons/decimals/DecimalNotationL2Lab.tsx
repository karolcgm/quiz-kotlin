"use client";

import { useId, useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DecimalDigitInput } from "@/components/lessons/decimals/DecimalDigitInput";
import { DecimalPlaceValueGrid } from "@/components/lessons/decimals/DecimalPlaceValueGrid";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import {
  createDecimalDiagnosticResult,
  parseDecimalInput,
} from "@/lib/math/decimals";
import {
  createPublicDecimalNotationL2Task,
  decimalThousandthsDisplay,
  decimalThousandthsWords,
  type DecimalNotationL2Activity,
} from "@/lib/math/decimals/decimalNotationL2";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode, DecimalPlaceValueState } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalNotationL1.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Wsparcie",
  core: "Poziom główny",
  challenge: "Wyzwanie",
};

const ACTIVITY_TITLES: Record<DecimalNotationL2Activity, string> = {
  "thousandths-table": "Tysięczne w tabeli",
  "zoom-axis": "Powiększana oś liczbowa",
  "representation-bridge": "Zamiana reprezentacji",
  "dye-lab-l2": "Laboratorium barwników",
  "independent-l2": "Praca samodzielna",
};

const AXIS_LEVELS = [
  { label: "Dziesiąte", unit: "części dziesiąte", segment: "0–1", start: 0, step: 100, scale: 1 },
  { label: "Setne", unit: "części setne", segment: "0,3–0,4", start: 300, step: 10, scale: 2 },
  { label: "Tysięczne", unit: "części tysięczne", segment: "0,37–0,38", start: 370, step: 1, scale: 3 },
] as const;

function blankPlaceState(): DecimalPlaceValueState {
  return { ones: "", tenths: "", hundredths: "", thousandths: "" };
}

function expectedPlaceDigits(value: number): Required<Pick<DecimalPlaceValueState, "ones" | "tenths" | "hundredths" | "thousandths">> {
  const digits = String(value).padStart(3, "0");
  return {
    ones: "0",
    tenths: digits[0] as "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9",
    hundredths: digits[1] as "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9",
    thousandths: digits[2] as "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9",
  };
}

function checkPlaceState(value: DecimalPlaceValueState, target: number): DecimalFeedbackCode | null {
  const expected = expectedPlaceDigits(target);
  for (const place of ["ones", "tenths", "hundredths", "thousandths"] as const) {
    const actual = value[place] ?? "";
    if (!actual) return expected[place] === "0" ? DECIMAL_FEEDBACK_CODES.missingZero : DECIMAL_FEEDBACK_CODES.empty;
    if (actual !== expected[place]) return DECIMAL_FEEDBACK_CODES.placeValue;
  }
  return null;
}

function checkDecimal(value: string, target: number): DecimalFeedbackCode | null {
  const trimmed = value.trim();
  if (!trimmed) return DECIMAL_FEEDBACK_CODES.empty;
  if (/^[,.]/u.test(trimmed)) return DECIMAL_FEEDBACK_CODES.missingZero;
  const parsed = parseDecimalInput(trimmed);
  if (!parsed.ok) return parsed.error.code === "DEC_EMPTY" ? DECIMAL_FEEDBACK_CODES.empty : DECIMAL_FEEDBACK_CODES.placeValue;
  const expectedDigits = String(target).padStart(3, "0").replace(/^0+|0+$/gu, "");
  const expectedScale = String(target).padStart(3, "0").replace(/0+$/u, "").length;
  const expectedCoefficient = expectedDigits || "0";
  const normalizedCoefficient = parsed.value.coefficient.replace(/^0+/u, "") || "0";
  if (parsed.value.sign !== 1 || normalizedCoefficient !== expectedCoefficient || parsed.value.scale !== expectedScale) {
    return DECIMAL_FEEDBACK_CODES.placeValue;
  }
  return null;
}

function axisValueDisplay(value: number, scale: number): string {
  if (value === 1000) return "1";
  const digits = String(value).padStart(3, "0").slice(0, scale);
  return `0,${digits}`;
}

function ZoomAxis({ level, tick }: { level: number; tick: number }) {
  const config = AXIS_LEVELS[level]!;
  const rows = Array.from({ length: 11 }, (_, index) => ({
    kreska: index,
    wartość: axisValueDisplay(config.start + index * config.step, config.scale),
  }));
  const selectedValue = config.start + tick * config.step;
  return (
    <div className={styles.axisZoom} data-axis-level={config.label.toLocaleLowerCase("pl-PL")}>
      <AccessibleMathSvg
        title={`Oś liczbowa — ${config.label.toLocaleLowerCase("pl-PL")}`}
        description={`Odcinek ${config.segment} podzielono na 10 równych części. Wybrana kreska ${tick} oznacza ${axisValueDisplay(selectedValue, config.scale)}.`}
        viewBox="0 0 760 170"
        className={styles.axisSvg}
        columns={[{ key: "kreska", label: "Numer kreski" }, { key: "wartość", label: "Wartość" }]}
        rows={rows}
      >
        <line x1="60" y1="85" x2="700" y2="85" stroke="#334155" strokeWidth="6" />
        {rows.map((row, index) => {
          const x = 60 + index * 64;
          const selected = index === tick;
          return (
            <g key={index}>
              <line x1={x} y1={selected ? 52 : 65} x2={x} y2="105" stroke={selected ? "#7c3aed" : "#334155"} strokeWidth={selected ? 8 : 4} />
              {(index === 0 || index === 10 || selected) ? <text x={x} y="135" textAnchor="middle" fill="#0f172a" fontSize="18" fontWeight="800">{row.wartość}</text> : null}
              {selected ? <circle cx={x} cy="45" r="11" fill="#f59e0b" stroke="#713f12" strokeWidth="3" data-axis-point /> : null}
            </g>
          );
        })}
        <text x="380" y="25" textAnchor="middle" fill="#4338ca" fontSize="18" fontWeight="900">{config.label}: odcinek {config.segment}</text>
      </AccessibleMathSvg>
    </div>
  );
}

function DyeGlass({ value, letter }: { value: number; letter: string }) {
  const rawId = useId();
  const patternId = `dye-${rawId.replace(/:/gu, "")}`;
  const safeValue = Math.max(0, Math.min(1000, value));
  const fillHeight = safeValue * 0.16;
  const fillY = 190 - fillHeight;
  const display = decimalThousandthsDisplay(safeValue);
  return (
    <AccessibleMathSvg
      title={`Naczynie ${letter} — ${display} litra`}
      description={`Naczynie ${letter} zawiera ${safeValue} z 1000 równych części litra, czyli ${display} litra. Poziom jest opisany liczbą i wzorem, nie tylko kolorem.`}
      viewBox="0 0 240 235"
      className={styles.dyeGlassSvg}
      columns={[{ key: "tysięczne", label: "Tysięczne litra" }, { key: "litry", label: "Litry" }]}
      rows={[{ tysięczne: `${safeValue}/1000 l`, litry: `${display} l` }]}
    >
      <defs>
        <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill="#bae6fd" />
          <line x1="0" y1="0" x2="0" y2="12" stroke="#0369a1" strokeWidth="4" />
        </pattern>
      </defs>
      <path d="M55 25 L72 195 Q75 210 94 210 H146 Q165 210 168 195 L185 25" fill="white" stroke="#334155" strokeWidth="7" />
      {safeValue > 0 ? (
        <g className={styles.waterFill} data-water-thousandths={safeValue}>
          <rect x="72" y={fillY} width="96" height={Math.max(fillHeight, 1)} fill={`url(#${patternId})`} />
          <path className={styles.waterSurface} d={`M72 ${fillY} Q96 ${fillY - 3} 120 ${fillY} T168 ${fillY}`} fill="none" stroke="#075985" strokeWidth="3" />
        </g>
      ) : null}
      <line x1="55" y1="25" x2="185" y2="25" stroke="#334155" strokeWidth="7" />
      <text x="120" y="230" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">{safeValue}/1000 l = {display} l</text>
    </AccessibleMathSvg>
  );
}

export interface DecimalNotationL2LabProps {
  activity: DecimalNotationL2Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalNotationL2Lab({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalNotationL2LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(() => createPublicDecimalNotationL2Task({ seed: effectiveSeed, difficulty: activeDifficulty, activity }), [activity, activeDifficulty, effectiveSeed]);
  const [placeState, setPlaceState] = useState<DecimalPlaceValueState>(blankPlaceState);
  const [digitInput, setDigitInput] = useState("");
  const [fractionNumerator, setFractionNumerator] = useState("");
  const [fractionDenominator, setFractionDenominator] = useState("");
  const [axisLevel, setAxisLevel] = useState(0);
  const [axisTick, setAxisTick] = useState(0);
  const [dyeValues, setDyeValues] = useState<[number, number, number]>([0, 0, 0]);
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    maxScore: activity === "independent-l2" ? 3 : 1,
    partial: activity === "independent-l2",
  }) : null;
  const displayedAxisLevel = readOnly ? 2 : axisLevel;
  const displayedAxisTick = readOnly ? 5 : axisTick;
  const axisConfig = AXIS_LEVELS[displayedAxisLevel]!;
  const axisValue = axisConfig.start + displayedAxisTick * axisConfig.step;

  const clearResult = () => {
    setDiagnosticCode(null);
    setSuccessMessage(null);
    onResultChange?.(null);
  };
  const resetWork = () => {
    setPlaceState(blankPlaceState());
    setDigitInput("");
    setFractionNumerator("");
    setFractionDenominator("");
    setAxisLevel(0);
    setAxisTick(0);
    setDyeValues([0, 0, 0]);
    clearResult();
  };
  const fail = (code: DecimalFeedbackCode, answerLabel: string) => {
    setDiagnosticCode(code);
    setSuccessMessage(null);
    onResultChange?.(false, answerLabel);
  };
  const succeed = (message: string, answerLabel: string) => {
    setDiagnosticCode(null);
    setSuccessMessage(message);
    onResultChange?.(true, answerLabel);
  };
  const chooseDifficulty = (next: LessonDifficulty) => {
    setActiveDifficulty(next);
    resetWork();
  };
  const updateAxisLevel = (level: number) => {
    setAxisLevel(Math.max(0, Math.min(2, level)));
    setAxisTick(0);
    clearResult();
  };
  const updateAxisTick = (tick: number) => {
    setAxisTick(Math.max(0, Math.min(10, tick)));
    clearResult();
  };
  const updateDye = (index: number, nextValue: number) => {
    const safe = Math.max(0, Math.min(1000, Math.round(nextValue || 0)));
    setDyeValues((current) => current.map((value, currentIndex) => currentIndex === index ? safe : value) as [number, number, number]);
    clearResult();
  };

  const checkFraction = (target: number): DecimalFeedbackCode | null => {
    if (!fractionNumerator.trim() || !fractionDenominator.trim()) return DECIMAL_FEEDBACK_CODES.empty;
    if (!/^\d+$/u.test(fractionNumerator) || !/^\d+$/u.test(fractionDenominator)) return DECIMAL_FEEDBACK_CODES.placeValue;
    return Number(fractionNumerator) === target && Number(fractionDenominator) === 1000 ? null : DECIMAL_FEEDBACK_CODES.placeValue;
  };

  const checkActivity = () => {
    if (activity === "thousandths-table") {
      const code = checkPlaceState(placeState, 375);
      if (code) return fail(code, "tabela wartości pozycyjnych");
      return succeed("Cyfry 3, 7 i 5 są kolejno w częściach dziesiątych, setnych i tysięcznych.", "0,375");
    }
    if (activity === "zoom-axis") {
      if (axisLevel !== 2 || axisTick !== 5) return fail(DECIMAL_FEEDBACK_CODES.placeValue, axisValueDisplay(axisValue, axisConfig.scale));
      return succeed("Po dwóch powiększeniach piąta tysięczna od 0,370 wskazuje 0,375.", "0,375 na osi");
    }
    if (activity === "representation-bridge") {
      const decimalCode = checkDecimal(digitInput, 375);
      if (decimalCode) return fail(decimalCode, digitInput || "pusty zapis dziesiętny");
      const fractionCode = checkFraction(375);
      if (fractionCode) return fail(fractionCode, `${fractionNumerator || "□"}/${fractionDenominator || "□"}`);
      return succeed("Obie zamiany prowadzą do tej samej wartości: 375/1000 = 0,375.", "375/1000 = 0,375");
    }
    if (activity === "dye-lab-l2") {
      if (dyeValues[0] !== 400 || dyeValues[1] !== 40 || dyeValues[2] !== 4) {
        return fail(DECIMAL_FEEDBACK_CODES.placeValue, dyeValues.map((value) => `${value}/1000 l`).join("; "));
      }
      return succeed("Ta sama cyfra 4 ma wartość dziesięć razy mniejszą w każdym kolejnym naczyniu.", "0,4 l; 0,04 l; 0,004 l");
    }
    const placeCode = checkPlaceState(placeState, task.targetThousandths);
    if (placeCode) return fail(placeCode, "tabela wartości pozycyjnych");
    const decimalCode = checkDecimal(digitInput, task.targetThousandths);
    if (decimalCode) return fail(decimalCode, digitInput || "pusty zapis dziesiętny");
    const fractionCode = checkFraction(task.targetThousandths);
    if (fractionCode) return fail(fractionCode, `${fractionNumerator || "□"}/${fractionDenominator || "□"}`);
    return succeed("Tabela, ułamek i zapis dziesiętny są zgodne.", `${task.fractionDisplay} = ${task.decimalDisplay}`);
  };

  const renderPlaceTable = (target: number) => (
    <div className="space-y-3">
      <p className="rounded-xl bg-violet-50 px-4 py-3 font-black text-violet-950">
        Cel: {target}/1000. Wpisz również zera, bo puste miejsce nie jest zerem.
      </p>
      <DecimalPlaceValueGrid
        value={readOnly && activity !== "independent-l2" ? expectedPlaceDigits(target) : placeState}
        onChange={(value) => { setPlaceState(value); clearResult(); }}
        minimumPower={-3}
        maximumPower={0}
        readOnly={readOnly}
      />
      <p className="rounded-xl bg-slate-100 px-4 py-3 font-bold" aria-live="polite">
        Odczyt celu: {target}/1000 = {decimalThousandthsDisplay(target)} — {decimalThousandthsWords(target)}.
      </p>
    </div>
  );

  const renderRepresentationInputs = (target: number) => (
    <div className={styles.representationGrid}>
      <section className="space-y-3 rounded-2xl border-2 border-cyan-100 bg-white p-4">
        <h3 className="text-lg font-black">Ułamek → liczba dziesiętna</h3>
        <p className="font-semibold">Zapisz cyframi: <b>{target}/1000</b></p>
        <DecimalDigitInput value={readOnly && activity !== "independent-l2" ? decimalThousandthsDisplay(target) : digitInput} onChange={(value) => { setDigitInput(value); clearResult(); }} label="Zapis dziesiętny" readOnly={readOnly} showKeypad={!readOnly} />
      </section>
      <section className="space-y-3 rounded-2xl border-2 border-violet-100 bg-white p-4">
        <h3 className="text-lg font-black">Liczba dziesiętna → ułamek</h3>
        <p className="font-semibold">Zapisz jako ułamek o mianowniku 1000: <b>{decimalThousandthsDisplay(target)}</b></p>
        <div className="grid max-w-xs grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-2xl font-black">
          <label><span className="sr-only">Licznik ułamka</span><input type="text" inputMode="numeric" pattern="[0-9]*" value={readOnly && activity !== "independent-l2" ? String(target) : fractionNumerator} readOnly={readOnly} aria-label="Licznik ułamka" className={styles.fractionField} onChange={(event) => { setFractionNumerator(event.target.value.replace(/\D/gu, "")); clearResult(); }} /></label>
          <span aria-hidden="true">/</span>
          <label><span className="sr-only">Mianownik ułamka</span><input type="text" inputMode="numeric" pattern="[0-9]*" value={readOnly && activity !== "independent-l2" ? "1000" : fractionDenominator} readOnly={readOnly} aria-label="Mianownik ułamka" className={styles.fractionField} onChange={(event) => { setFractionDenominator(event.target.value.replace(/\D/gu, "")); clearResult(); }} /></label>
        </div>
      </section>
    </div>
  );

  return (
    <article
      className={`${styles.lesson} space-y-4 rounded-[2rem] border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 text-slate-950 shadow-xl sm:p-6`}
      data-decimal-notation-l2
      data-decimal-activity={activity}
      data-generator-id={task.generatorId}
      data-generator-version={task.generatorVersion}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-presentation-mode={presentationMode || undefined}
      data-answer-spec="server-only"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-800">Dział 5 · Ułamki dziesiętne · L2</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{ACTIVITY_TITLES[activity]}</h2>
          <p className="mt-2 max-w-3xl font-semibold leading-relaxed text-slate-700">{task.prompt}</p>
        </div>
        {questionNumber && questionCount ? <b className="rounded-xl bg-indigo-100 px-3 py-2 text-sm text-indigo-950">Zadanie {questionNumber}/{questionCount}</b> : null}
      </header>

      {!onResultChange && !readOnly ? (
        <div className={`${styles.controls} flex flex-wrap gap-2`} aria-label="Wybierz poziom pracy">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button key={level} type="button" aria-pressed={activeDifficulty === level} onClick={() => chooseDifficulty(level)} className={`${styles.touchTarget} rounded-xl border-2 px-4 text-sm font-black ${activeDifficulty === level ? "border-indigo-700 bg-indigo-700 text-white" : "border-indigo-200 bg-white text-indigo-950"}`}>{DIFFICULTY_LABELS[level]}</button>
          ))}
        </div>
      ) : <p className="w-fit rounded-xl bg-indigo-100 px-3 py-2 text-sm font-black text-indigo-950">Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p>}

      {activity === "thousandths-table" ? renderPlaceTable(375) : null}

      {activity === "zoom-axis" ? (
        <section className="space-y-4" aria-label="Powiększana oś liczbowa">
          <div className={`${styles.controls} flex flex-wrap gap-2`} role="group" aria-label="Poziom powiększenia osi">
            {AXIS_LEVELS.map((config, index) => <button key={config.label} type="button" disabled={readOnly} aria-pressed={displayedAxisLevel === index} className={`${styles.touchTarget} rounded-xl border-2 px-4 font-black aria-pressed:border-violet-700 aria-pressed:bg-violet-700 aria-pressed:text-white`} onClick={() => updateAxisLevel(index)}>{config.label}</button>)}
            <button type="button" disabled={readOnly || axisLevel === 0} className={`${styles.touchTarget} rounded-xl border-2 bg-white px-4 font-black disabled:opacity-40`} onClick={() => updateAxisLevel(axisLevel - 1)}>Pomniejsz</button>
            <button type="button" disabled={readOnly || axisLevel === 2} className={`${styles.touchTarget} rounded-xl bg-indigo-700 px-4 font-black text-white disabled:opacity-40`} onClick={() => updateAxisLevel(axisLevel + 1)}>Powiększ</button>
          </div>
          <ZoomAxis level={displayedAxisLevel} tick={displayedAxisTick} />
          {!readOnly ? (
            <div className={`${styles.controls} space-y-3 rounded-2xl bg-white p-4`}>
              <label className="block font-black">Punkt osi — {axisConfig.unit}: {axisValueDisplay(axisValue, axisConfig.scale)}
                <input type="range" min={0} max={10} step={1} value={displayedAxisTick} aria-label={`Punkt osi — ${axisConfig.label.toLocaleLowerCase("pl-PL")}`} aria-valuetext={axisValueDisplay(axisValue, axisConfig.scale)} className="min-h-11 w-full accent-violet-700" onChange={(event) => updateAxisTick(Number(event.target.value))} />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={axisTick === 0} className={`${styles.touchTarget} rounded-xl border-2 bg-white px-4 font-black disabled:opacity-40`} onClick={() => updateAxisTick(axisTick - 1)}>Poprzednia kreska</button>
                <button type="button" disabled={axisTick === 10} className={`${styles.touchTarget} rounded-xl border-2 bg-white px-4 font-black disabled:opacity-40`} onClick={() => updateAxisTick(axisTick + 1)}>Następna kreska</button>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {activity === "representation-bridge" ? renderRepresentationInputs(375) : null}

      {activity === "dye-lab-l2" ? (
        <section className={styles.dyeGrid} aria-label="Trzy naczynia laboratorium barwników">
          {([400, 40, 4] as const).map((target, index) => {
            const letter = ["A", "B", "C"][index]!;
            const step = [100, 10, 1][index]!;
            return (
              <div key={target} className="space-y-3 rounded-2xl border-2 border-cyan-100 bg-white p-4">
                <h3 className="text-center text-lg font-black">Naczynie {letter} · {decimalThousandthsDisplay(target)} l</h3>
                <DyeGlass value={readOnly ? target : dyeValues[index]} letter={letter} />
                {!readOnly ? <div className={`${styles.controls} space-y-2`}>
                  <label className="block font-bold">Poziom naczynia {letter}: {dyeValues[index]}/1000 l<input type="range" min={0} max={1000} step={step} value={dyeValues[index]} aria-label={`Poziom barwnika w naczyniu ${letter}`} className="min-h-11 w-full accent-cyan-700" onChange={(event) => updateDye(index, Number(event.target.value))} /></label>
                  <label className="block font-bold">Liczba tysięcznych w naczyniu {letter}<input type="text" inputMode="numeric" pattern="[0-9]*" value={dyeValues[index]} aria-label={`Liczba tysięcznych w naczyniu ${letter}`} className={styles.smallNumberField} onChange={(event) => updateDye(index, Number(event.target.value.replace(/\D/gu, "")))} /></label>
                </div> : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {activity === "independent-l2" ? (
        <section className="space-y-5">
          <p className="rounded-2xl bg-indigo-800 p-4 text-center text-lg font-black text-white">Wariant {DIFFICULTY_LABELS[activeDifficulty]} · cel {task.fractionDisplay}</p>
          {activeDifficulty === "support" ? <p className="rounded-xl bg-amber-50 p-3 font-bold text-amber-950">Wsparcie: 100 tysięcznych to jedna dziesiąta. Uzupełnij każdą pozycję, także zerami.</p> : null}
          {activeDifficulty === "challenge" ? <p className="rounded-xl bg-violet-50 p-3 font-bold text-violet-950">Wyzwanie: cyfra może stać dopiero na miejscu tysięcznych; dwóch wcześniejszych zer nie wolno pominąć.</p> : null}
          {renderPlaceTable(task.targetThousandths)}
          {renderRepresentationInputs(task.targetThousandths)}
        </section>
      ) : null}

      {!readOnly ? <button type="button" className={`${styles.controls} ${styles.touchTarget} w-full rounded-xl bg-slate-950 px-5 text-lg font-black text-white`} onClick={checkActivity}>Sprawdź pozycje i zapis</button> : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnostic ? (
        onResultChange
          ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
          : <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </article>
  );
}
