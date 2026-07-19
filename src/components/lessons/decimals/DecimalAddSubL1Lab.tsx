"use client";

import { useMemo, useState } from "react";
import { DecimalWrittenAddSub } from "@/components/lessons/decimals/DecimalWrittenAddSub";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createPublicDecimalAddSubL1Task,
  decimalAddSubTraceDisplay,
  expectedDecimalAddSubDisplay,
  validateDecimalAddSubWork,
  validateShiftedCommaRepair,
  type DecimalAddSubL1Activity,
  type DecimalAddSubL1PublicTask,
} from "@/lib/math/decimals/decimalAddSubL1";
import { createDecimalDiagnosticResult } from "@/lib/math/decimals/decimalDiagnostics";
import { areEquivalentDecimals, buildDecimalWrittenAddSubModel, parseDecimalInput } from "@/lib/math/decimals/decimalMath";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalDigit, DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalAddSubL1.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Wsparcie",
  core: "Poziom główny",
  challenge: "Wyzwanie",
};

const ACTIVITY_TITLES: Record<DecimalAddSubL1Activity, string> = {
  "mental-add-sub": "Dodawanie i odejmowanie w pamięci",
  "written-add-sub": "Dodawanie i odejmowanie pisemne",
  "story-add-sub": "Zadanie tekstowe",
  "comma-columns": "Kolumny przecinków",
  "column-addition": "Dodawanie kolumna po kolumnie",
  "basic-subtraction": "Odejmowanie bez pożyczania",
  "repair-shifted-comma": "Napraw przesunięty przecinek",
  "independent-add-sub": "Praca samodzielna",
};

function MentalMethodExample() {
  return <section className="grid gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4">
    <h3 className="text-lg font-black text-cyan-950">Jak liczymy w pamięci?</h3>
    <p className="font-bold text-cyan-950">Łączymy cyfry z tych samych miejsc. Przecinek oddziela część całkowitą od części dziesiętnej.</p>
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-xl font-black">3,4 + 1,2</p>
        <p className="mt-2 font-bold"><span className="text-indigo-700">jedności:</span> 3 + 1 = 4</p>
        <p className="font-bold"><span className="text-emerald-700">części dziesiąte:</span> 4 + 2 = 6</p>
        <p className="mt-2 text-xl font-black">3,4 + 1,2 = 4,6</p>
      </div>
      <div className="rounded-xl bg-white p-3 text-center shadow-sm">
        <p className="text-xl font-black">5,8 − 2,3</p>
        <p className="mt-2 font-bold"><span className="text-indigo-700">jedności:</span> 5 − 2 = 3</p>
        <p className="font-bold"><span className="text-emerald-700">części dziesiąte:</span> 8 − 3 = 5</p>
        <p className="mt-2 text-xl font-black">5,8 − 2,3 = 3,5</p>
      </div>
    </div>
  </section>;
}

function WrittenMethodExample() {
  return <section className="grid gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
    <h3 className="text-lg font-black text-amber-950">Przykład poprawnego zapisu</h3>
    <table className="mx-auto border-separate border-spacing-x-2 border-spacing-y-1 font-mono text-3xl font-black" aria-label="Przykład dodawania pisemnego 2,45 i 1,37">
      <tbody>
        <tr><td className="w-8" /><td className="w-10 text-center">2</td><td className="w-4 text-center">,</td><td className="w-10 text-center">4</td><td className="w-10 text-center">5</td></tr>
        <tr><td className="w-8 text-center">+</td><td className="w-10 text-center">1</td><td className="w-4 text-center">,</td><td className="w-10 text-center">3</td><td className="w-10 text-center">7</td></tr>
        <tr><td className="border-t-4 border-slate-900" /><td className="border-t-4 border-slate-900 text-center">3</td><td className="border-t-4 border-slate-900 text-center">,</td><td className="border-t-4 border-slate-900 text-center">8</td><td className="border-t-4 border-slate-900 text-center">2</td></tr>
      </tbody>
    </table>
  </section>;
}

function equivalentDecimal(left: string, right: string): boolean {
  const parsedLeft = parseDecimalInput(left);
  const parsedRight = parseDecimalInput(right);
  return parsedLeft.ok && parsedRight.ok && areEquivalentDecimals(parsedLeft.value, parsedRight.value);
}

function placeLabel(power: number): string {
  const labels: Record<number, string> = {
    2: "setki",
    1: "dziesiątki",
    0: "jedności",
    [-1]: "części dziesiąte",
    [-2]: "części setne",
    [-3]: "części tysięczne",
  };
  return labels[power] ?? `kolumna 10^${power}`;
}

function operationSymbol(task: Pick<DecimalAddSubL1PublicTask, "operation">): "+" | "−" {
  return task.operation === "add" ? "+" : "−";
}

function rightmostPower(task: Pick<DecimalAddSubL1PublicTask, "left" | "right" | "operation">): number {
  return buildDecimalWrittenAddSubModel(task.left, task.right, task.operation).columns.at(-1) ?? 0;
}

function stepCopy(activity: DecimalAddSubL1Activity, power: number): string | null {
  if (activity === "column-addition") {
    if (power === -2) return "★ Setne: 5 + 7 = 12. Zapisz 2 setne, a 10 setnych wymień na 1 dziesiątą.";
    if (power === -1) return "★ Dziesiąte: 4 + 3 + 1 z wymiany = 8 dziesiątych.";
    if (power === 0) return "★ Jedności: 2 + 1 = 3 jedności.";
  }
  if (activity === "basic-subtraction") {
    if (power === -2) return "★ Setne: 6 − 4. W tej kolumnie nie trzeba pożyczać.";
    if (power === -1) return "★ Dziesiąte: 8 − 3. Zachowaj cyfrę w kolumnie dziesiątych.";
    if (power === 0) return "★ Jedności: 5 − 2. Na końcu odczytaj wynik wzdłuż prowadnicy przecinka.";
  }
  return null;
}

function ColumnNavigator({
  powers,
  activePower,
  onChange,
}: {
  powers: number[];
  activePower: number;
  onChange: (power: number) => void;
}) {
  return (
    <div className={`${styles.controls} ${styles.columnBar}`} role="group" aria-label="Wybierz aktywną kolumnę">
      {powers.map((power) => (
        <button
          key={power}
          type="button"
          aria-pressed={activePower === power}
          className={styles.columnButton}
          onClick={() => onChange(power)}
        >
          <span aria-hidden>{activePower === power ? "★" : "○"}</span> {placeLabel(power)}
        </button>
      ))}
    </div>
  );
}

function ColumnKeypad({
  activePower,
  powers,
  onDigit,
  onMove,
  onComma,
  onConfirm,
}: {
  activePower: number;
  powers: number[];
  onDigit: (digit: DecimalDigit) => void;
  onMove: (delta: -1 | 1) => void;
  onComma: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className={`${styles.controls} space-y-2`} aria-label="Klawiatura ekranowa wyniku">
      <p className="text-sm font-black text-slate-700">Aktywna kratka: {placeLabel(activePower)}. Wpisuj cyfry klawiaturą poniżej.</p>
      <div className={styles.keypad}>
        {(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as DecimalDigit[]).map((digit) => (
          <button key={digit} type="button" className={styles.keyButton} onClick={() => onDigit(digit)}>{digit}</button>
        ))}
        <button type="button" className={styles.keyButton} data-key="delete" onClick={() => onDigit("")} aria-label="Usuń cyfrę z aktywnej kratki">⌫ usuń</button>
        <button type="button" className={styles.keyButton} disabled={powers.indexOf(activePower) <= 0} onClick={() => onMove(-1)} aria-label="Przejdź do kolumny po lewej">← lewo</button>
        <button type="button" className={styles.keyButton} disabled={powers.indexOf(activePower) >= powers.length - 1} onClick={() => onMove(1)} aria-label="Przejdź do kolumny po prawej">prawo →</button>
        <button type="button" className={styles.keyButton} data-key="comma" onClick={onComma} aria-label="Potwierdź polski przecinek w pionowej prowadnicy">, przecinek</button>
        <button type="button" className={styles.keyButton} data-key="confirm" onClick={onConfirm}>Zatwierdź zapis</button>
      </div>
    </section>
  );
}

export interface DecimalAddSubL1LabProps {
  activity: DecimalAddSubL1Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalAddSubL1Lab(props: DecimalAddSubL1LabProps) {
  return <DecimalAddSubL1Round key={`${props.activity}-${props.taskSeed ?? props.seed}`} {...props} />;
}

function DecimalAddSubL1Round({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalAddSubL1LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(
    () => createPublicDecimalAddSubL1Task({ seed: effectiveSeed, difficulty: activeDifficulty, activity }),
    [activeDifficulty, activity, effectiveSeed],
  );
  const [auxiliaryZero, setAuxiliaryZero] = useState(false);
  const [activePower, setActivePower] = useState(() => rightmostPower(task));
  const [resultDigits, setResultDigits] = useState<Record<number, DecimalDigit>>({});
  const [estimateOptionId, setEstimateOptionId] = useState("");
  const [repairChoice, setRepairChoice] = useState("");
  const [simpleAnswer, setSimpleAnswer] = useState("");
  const [storyOperation, setStoryOperation] = useState<"add" | "subtract" | "">("");
  const [commaMessage, setCommaMessage] = useState("Przecinek jest stały i leży w pionowej prowadnicy.");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [diagnosticPreservesDigits, setDiagnosticPreservesDigits] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const displayAuxiliaryZero = readOnly || auxiliaryZero;
  const displayedRight = activity === "comma-columns" && displayAuxiliaryZero ? "1,30" : task.right;
  const effectiveStoryOperation = activity === "story-add-sub" ? (readOnly ? task.operation : storyOperation) : task.operation;
  const displayedOperation = effectiveStoryOperation || task.operation;
  const model = buildDecimalWrittenAddSubModel(task.left, displayedRight, displayedOperation);
  const powers = model.columns;
  const expectedDisplay = expectedDecimalAddSubDisplay(task);
  const traceDisplay = readOnly
    ? expectedDisplay
    : decimalAddSubTraceDisplay(task, resultDigits);
  const initialWrongRepair = task.repairChoices.includes("38,2")
    ? "38,2"
    : task.repairChoices.find((choice) => choice !== expectedDisplay) ?? "38,2";
  const displayedRepair = readOnly ? expectedDisplay : repairChoice || initialWrongRepair;
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    maxScore: diagnosticPreservesDigits ? 2 : activity === "independent-add-sub" ? 2 : 1,
    partial: diagnosticPreservesDigits,
    memberIds: diagnosticCode === DECIMAL_FEEDBACK_CODES.commaMisaligned
      ? ["comma-left", "comma-right", "comma-result"]
      : [`column-${activePower}`],
  }) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setDiagnosticPreservesDigits(false);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const enterSimpleAnswer = (key: string) => {
    setSimpleAnswer((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`);
    clearResult();
  };

  const resetWork = (nextDifficulty: LessonDifficulty) => {
    const nextTask = createPublicDecimalAddSubL1Task({ seed: effectiveSeed, difficulty: nextDifficulty, activity });
    setAuxiliaryZero(false);
    setActivePower(rightmostPower(nextTask));
    setResultDigits({});
    setEstimateOptionId("");
    setRepairChoice("");
    setCommaMessage("Przecinek jest stały i leży w pionowej prowadnicy.");
    clearResult();
  };

  const chooseDifficulty = (nextDifficulty: LessonDifficulty) => {
    setActiveDifficulty(nextDifficulty);
    resetWork(nextDifficulty);
  };

  const fail = (code: DecimalFeedbackCode, answerLabel: string, preservesDigits = false) => {
    setDiagnosticCode(code);
    setDiagnosticPreservesDigits(preservesDigits);
    setSuccessMessage(null);
    onResultChange?.(false, answerLabel);
  };

  const succeed = (message: string, answerLabel: string) => {
    setDiagnosticCode(null);
    setDiagnosticPreservesDigits(false);
    setSuccessMessage(message);
    onResultChange?.(true, answerLabel);
  };

  const changeDigit = (power: number, digit: DecimalDigit) => {
    setResultDigits((current) => ({ ...current, [power]: digit }));
    setActivePower(power);
    clearResult();
  };

  const moveActivePower = (delta: -1 | 1) => {
    const index = powers.indexOf(activePower);
    const nextIndex = Math.max(0, Math.min(powers.length - 1, index + delta));
    setActivePower(powers[nextIndex] ?? activePower);
  };

  const checkActivity = () => {
    if (activity === "mental-add-sub") {
      if (!equivalentDecimal(simpleAnswer, expectedDisplay)) return fail(DECIMAL_FEEDBACK_CODES.estimateRange, simpleAnswer);
      return succeed("Wynik jest poprawny. Cyfry z tych samych miejsc zostały połączone.", `${task.left} ${operationSymbol(task)} ${task.right} = ${expectedDisplay}`);
    }
    if (activity === "story-add-sub" && storyOperation !== task.operation && !readOnly) {
      return fail(DECIMAL_FEEDBACK_CODES.placeValue, storyOperation === "add" ? "+" : storyOperation === "subtract" ? "−" : "brak znaku");
    }
    if (activity === "comma-columns") {
      return succeed(
        displayAuxiliaryZero
          ? "2,45 i 1,30 mają przecinki w jednej prowadnicy; zero pomocnicze nie zmieniło wartości 1,3."
          : "2,45 i 1,3 mają przecinki w jednej prowadnicy; pusta kolumna setnych nie została zamieniona w zero.",
        `2,45 ${operationSymbol(task)} ${displayedRight}`,
      );
    }
    if (activity === "repair-shifted-comma") {
      const validation = validateShiftedCommaRepair(task, repairChoice || initialWrongRepair);
      if (!validation.correct) {
        return fail(validation.code ?? DECIMAL_FEEDBACK_CODES.commaMisaligned, repairChoice || initialWrongRepair, validation.digitsCorrect);
      }
      return succeed("Przecinek został naprawiony, a poprawne cyfry 3, 8 i 2 pozostały w toku pracy.", expectedDisplay);
    }
    const validation = validateDecimalAddSubWork({
      task,
      resultDigits,
      commaAligned: true,
      estimateOptionId,
      requireEstimate: activity === "independent-add-sub",
    });
    if (!validation.correct) {
      return fail(validation.code ?? DECIMAL_FEEDBACK_CODES.placeValue, validation.normalizedDisplay ?? traceDisplay, validation.digitsCorrect && !validation.commaCorrect);
    }
    return succeed(
      activity === "story-add-sub"
        ? "Działanie i odpowiedź do zadania tekstowego są poprawne."
        : activity === "written-add-sub"
          ? "Działanie pisemne jest poprawne, a przecinki są zapisane w jednej kolumnie."
          : activity === "independent-add-sub"
        ? "Szacunek i dokładny zapis pisemny są zgodne."
        : activity === "column-addition"
          ? "Dodawanie jest poprawne, a wymiana 10 setnych na 1 dziesiątą została zachowana w śladzie."
          : "Odejmowanie jest poprawne i nie wymagało pożyczania.",
      `${task.left} ${operationSymbol(task)} ${task.right} = ${expectedDisplay}`,
    );
  };

  const handleWorkspaceKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (!target.getAttribute("aria-label")?.startsWith("Wynik")) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveActivePower(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveActivePower(1);
    }
  };

  const writtenActivity = activity === "written-add-sub" || activity === "story-add-sub" || activity === "column-addition" || activity === "basic-subtraction" || activity === "independent-add-sub";
  const activeStep = stepCopy(activity, activePower);

  return (
    <LessonTaskFrame
      className={styles.lesson}
      contentClassName="space-y-4"
      eyebrow="Dział 5 · Temat 4"
      heading={ACTIVITY_TITLES[activity]}
      description={task.prompt}
      questionNumber={questionNumber}
      questionCount={questionCount}
      data-decimal-add-sub-l1
      data-decimal-activity={activity}
      data-generator-id={task.generatorId}
      data-generator-version={task.generatorVersion}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-presentation-mode={presentationMode || undefined}
      data-answer-spec="server-only"
      onKeyDown={handleWorkspaceKeyDown}
    >
      {activity === "independent-add-sub" && !onResultChange && !readOnly ? (
        <div className={`${styles.controls} flex flex-wrap gap-2`} aria-label="Wybierz wariant samodzielnej próby">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button key={level} type="button" aria-pressed={activeDifficulty === level} className={styles.difficultyButton} onClick={() => chooseDifficulty(level)}>
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </div>
      ) : activity === "independent-add-sub" ? <p className="w-fit rounded-xl bg-violet-100 px-3 py-2 text-sm font-black text-violet-950">Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p> : null}

      {activity === "mental-add-sub" ? <>
        <MentalMethodExample />
        <section className="grid gap-4 rounded-2xl border-2 border-indigo-200 bg-white p-4">
          <p className="text-center text-3xl font-black">{task.left} {operationSymbol(task)} {task.right} =</p>
          <input aria-label="Wynik działania pamięciowego" value={readOnly ? expectedDisplay : simpleAnswer} readOnly inputMode="none" className="mx-auto h-14 w-40 rounded-xl border-2 border-indigo-300 bg-white text-center text-2xl font-black focus:border-indigo-700 focus:outline-none" />
        </section>
        {!readOnly ? <LessonNumericKeypad allowSeparator label="Kalkulator do działań w pamięci" helperText="Wpisz wynik z przecinkiem i zatwierdź." onKey={enterSimpleAnswer} onConfirm={checkActivity} /> : null}
      </> : null}

      {activity === "written-add-sub" ? <WrittenMethodExample /> : null}

      {activity === "story-add-sub" ? <section className="grid gap-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <h3 className="text-lg font-black text-emerald-950">Przeczytaj i zdecyduj, jakie działanie wykonać</h3>
        <p className="text-lg font-bold text-emerald-950">{task.story}</p>
        <p className="text-lg font-black text-emerald-950">{task.storyQuestion}</p>
        <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Wybierz znak działania">
          <button type="button" disabled={readOnly} aria-pressed={effectiveStoryOperation === "add"} className="min-h-12 min-w-24 rounded-xl border-2 border-emerald-400 bg-white text-xl font-black aria-pressed:bg-emerald-800 aria-pressed:text-white" onClick={() => { setStoryOperation("add"); clearResult(); }}>+ dodawanie</button>
          <button type="button" disabled={readOnly} aria-pressed={effectiveStoryOperation === "subtract"} className="min-h-12 min-w-24 rounded-xl border-2 border-emerald-400 bg-white text-xl font-black aria-pressed:bg-emerald-800 aria-pressed:text-white" onClick={() => { setStoryOperation("subtract"); clearResult(); }}>− odejmowanie</button>
        </div>
      </section> : null}

      {activity === "comma-columns" ? (
        <section className="space-y-4">
          <p className="rounded-xl bg-violet-50 p-3 font-black text-violet-950">Pionowa prowadnica łączy wszystkie polskie przecinki. Jedności stoją pod jednościami.</p>
          <DecimalWrittenAddSub left="2,45" right={displayedRight} operation="add" activePower={activePower} />
          <ColumnNavigator powers={powers} activePower={activePower} onChange={(power) => { setActivePower(power); clearResult(); }} />
          {!readOnly ? (
            <button
              type="button"
              aria-pressed={auxiliaryZero}
              className={`${styles.controls} ${styles.columnButton} w-full`}
              onClick={() => { setAuxiliaryZero((value) => !value); clearResult(); }}
            >
              {auxiliaryZero ? "Usuń opcjonalne zero z zapisu 1,30" : "Dopisz opcjonalne zero: 1,3 → 1,30"}
            </button>
          ) : null}
          {displayAuxiliaryZero ? <p className={styles.auxiliaryBadge} data-auxiliary-zero="true">0 pomocnicze · 1,30 = 1,3</p> : <p className={styles.tracePanel}>Kolumna setnych w 1,3 jest pusta — to nie jest automatycznie wpisane zero.</p>}
        </section>
      ) : null}

      {writtenActivity && (activity !== "story-add-sub" || effectiveStoryOperation) ? (
        <section className="space-y-4">
          {activity === "written-add-sub" ? (
            <h3 className="pt-1 text-center text-xl font-black text-slate-950">Teraz uzupełnij kolejne działanie</h3>
          ) : null}
          {activity === "independent-add-sub" ? (
            <fieldset className="space-y-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
              <legend className="px-2 font-black text-amber-950">1. Oszacuj przed dokładnym rachunkiem</legend>
              <div className={`${styles.controls} ${styles.estimateChoices}`}>
                {task.estimateOptions.map((option) => (
                  <button key={option.id} type="button" disabled={readOnly} aria-pressed={estimateOptionId === option.id} className={styles.estimateChoice} onClick={() => { setEstimateOptionId(option.id); clearResult(); }}>
                    Wynik jest {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
          {activity !== "written-add-sub" ? <p className="rounded-xl bg-slate-950 p-3 text-center text-xl font-black text-white">
            {task.left} {displayedOperation === "add" ? "+" : "−"} {task.right}
          </p> : null}
          {activity !== "written-add-sub" ? <ColumnNavigator powers={powers} activePower={activePower} onChange={(power) => { setActivePower(power); clearResult(); }} /> : null}
          {activeStep ? <p className={styles.exchangeCallout} aria-live="polite">{activeStep}</p> : null}
          <DecimalWrittenAddSub
            left={task.left}
            right={task.right}
            operation={displayedOperation}
            activePower={activePower}
            resultDigits={resultDigits}
            onResultDigitChange={readOnly ? undefined : changeDigit}
            showSolution={readOnly}
            showGuidance={activity !== "written-add-sub"}
          />
          {activity !== "written-add-sub" ? <p className={styles.tracePanel} aria-live="polite">Zachowany tok pracy: <span className="font-mono text-lg">{traceDisplay}</span>. Pusta kratka ma znak ▽.</p> : null}
          {!readOnly ? (
            <ColumnKeypad
              activePower={activePower}
              powers={powers}
              onDigit={(digit) => changeDigit(activePower, digit)}
              onMove={moveActivePower}
              onComma={() => { setCommaMessage("Polski przecinek potwierdzony w stałej pionowej prowadnicy."); clearResult(); }}
              onConfirm={checkActivity}
            />
          ) : null}
          {activity !== "written-add-sub" ? <p className="rounded-xl bg-violet-50 p-3 font-bold text-violet-950" aria-live="polite">{commaMessage}</p> : null}
          {activity === "story-add-sub" ? <p className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-lg font-black">Odpowiedź: {traceDisplay.includes("▽") ? "…" : traceDisplay} {task.answerUnit}</p> : null}
        </section>
      ) : null}

      {activity === "repair-shifted-comma" ? (
        <section className={`${styles.repairWorkspace} space-y-4`}>
          <p className="text-center text-xl font-black">{task.left} {operationSymbol(task)} {task.right}</p>
          <p className="text-center font-bold">Poprawnie obliczone cyfry zostają:</p>
          <div className={styles.preservedDigits} aria-label="Zachowane poprawne cyfry wyniku">
            {expectedDisplay.replace(",", "").split("").map((digit, index) => <span key={`${digit}-${index}`} className={styles.preservedDigit} data-preserved-digit={digit}>{digit}</span>)}
          </div>
          <p className={styles.tracePanel} aria-live="polite">Aktualny wydruk: <strong className="font-mono text-xl" data-repair-display>{displayedRepair}</strong>. Zmieniasz tylko pozycję przecinka.</p>
          {!readOnly ? (
            <div className={`${styles.controls} ${styles.repairChoices}`} role="group" aria-label="Wybierz pozycję przecinka">
              {task.repairChoices.map((choice) => (
                <button key={choice} type="button" aria-pressed={repairChoice === choice} className={styles.repairChoice} onClick={() => { setRepairChoice(choice); clearResult(); }}>
                  Ustaw zapis {choice}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {!readOnly && activity !== "mental-add-sub" && activity !== "written-add-sub" && activity !== "story-add-sub" ? (
        <button type="button" className={`${styles.controls} ${styles.checkButton}`} onClick={checkActivity}>
          {activity === "repair-shifted-comma" ? "Sprawdź pozycję przecinka" : activity === "comma-columns" ? "Sprawdź prowadnicę" : "Sprawdź zapis pisemny"}
        </button>
      ) : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnostic ? (
        onResultChange
          ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
          : <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />
      ) : null}
    </LessonTaskFrame>
  );
}
