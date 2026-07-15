"use client";

import { useMemo, useState } from "react";
import { DecimalWrittenAddSub } from "@/components/lessons/decimals/DecimalWrittenAddSub";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import {
  buildDecimalBorrowMarks,
  createPublicDecimalAddSubL2Task,
  decimalAddSubL2ResultPowers,
  decimalAddSubL2TraceDisplay,
  expectedDecimalAddSubL2Digits,
  expectedDecimalAddSubL2Display,
  validateDecimalAddSubL2Repair,
  validateDecimalAddSubL2Work,
  validateDecimalChangeMethods,
  validateWorkshopReceipt,
  type DecimalAddSubL2Activity,
  type DecimalAddSubL2PublicTask,
  type DecimalAddSubL2Validation,
} from "@/lib/math/decimals/decimalAddSubL2";
import { createDecimalDiagnosticResult } from "@/lib/math/decimals/decimalDiagnostics";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalDigit, DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/decimals/decimalAddSubL2.module.css";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Wsparcie",
  core: "Poziom główny",
  challenge: "Wyzwanie",
};

const ACTIVITY_TITLES: Record<DecimalAddSubL2Activity, string> = {
  "borrowing-subtraction": "Odejmowanie z pożyczaniem",
  "change-two-methods": "Reszta dwiema metodami",
  "workshop-receipt": "Paragon pracowni",
  "repair-context-comma": "Napraw przesunięty przecinek",
  "independent-add-sub-l2": "Praca samodzielna",
};

function placeLabel(power: number): string {
  return ({
    2: "setki",
    1: "dziesiątki",
    0: "jedności",
    [-1]: "części dziesiąte",
    [-2]: "części setne",
    [-3]: "części tysięczne",
  } as Record<number, string>)[power] ?? `kolumna 10^${power}`;
}

function inputDigit(value: string): DecimalDigit {
  return ([...value].reverse().find((character) => /^[0-9]$/u.test(character)) ?? "") as DecimalDigit;
}

function ColumnNavigator({ powers, activePower, onChange }: { powers: number[]; activePower: number; onChange: (power: number) => void }) {
  return (
    <div className={`${styles.controls} ${styles.columnBar}`} role="group" aria-label="Wybierz aktywną kolumnę L2">
      {powers.map((power) => (
        <button key={power} type="button" aria-pressed={power === activePower} className={styles.columnButton} onClick={() => onChange(power)}>
          <span aria-hidden>{power === activePower ? "★" : "○"}</span> {placeLabel(power)}
        </button>
      ))}
    </div>
  );
}

function DigitKeypad({ label, powers, activePower, onDigit, onMove, onComma, onConfirm }: {
  label: string;
  powers: number[];
  activePower: number;
  onDigit: (digit: DecimalDigit) => void;
  onMove: (delta: -1 | 1) => void;
  onComma: () => void;
  onConfirm: () => void;
}) {
  const index = powers.indexOf(activePower);
  return (
    <section className={`${styles.controls} ${styles.keypadPanel}`} aria-label={`Klawiatura ekranowa: ${label}`}>
      <p className="font-black">{label}: aktywna kolumna — {placeLabel(activePower)}.</p>
      <div className={styles.keypad}>
        {(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as DecimalDigit[]).map((digit) => (
          <button key={digit} type="button" className={styles.keyButton} aria-label={`${label}: wpisz ${digit}`} onClick={() => onDigit(digit)}>{digit}</button>
        ))}
        <button type="button" className={styles.keyButton} aria-label={`${label}: usuń cyfrę`} onClick={() => onDigit("")}>⌫ usuń</button>
        <button type="button" className={styles.keyButton} disabled={index <= 0} aria-label={`${label}: kolumna po lewej`} onClick={() => onMove(-1)}>← lewo</button>
        <button type="button" className={styles.keyButton} disabled={index >= powers.length - 1} aria-label={`${label}: kolumna po prawej`} onClick={() => onMove(1)}>prawo →</button>
        <button type="button" className={styles.commaButton} aria-label={`${label}: potwierdź polski przecinek`} onClick={onComma}>, przecinek</button>
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>Zatwierdź ten zapis</button>
      </div>
    </section>
  );
}

function LocalDigitGrid({ label, powers, digits, activePower, readOnly, solution, onDigit, onActive }: {
  label: string;
  powers: number[];
  digits: Readonly<Record<number, DecimalDigit>>;
  activePower: number;
  readOnly: boolean;
  solution?: Readonly<Record<number, DecimalDigit>>;
  onDigit: (power: number, digit: DecimalDigit) => void;
  onActive: (power: number) => void;
}) {
  return (
    <section className={styles.localGrid} aria-label={label}>
      <p className="sr-only">Jedna cyfra w kratce; pusta kratka nie jest zerem.</p>
      <div className={styles.localGridRow}>
        {powers.map((power) => (
          <span key={power} className={styles.localGridMember}>
            <small>{placeLabel(power)}</small>
            <input
              value={solution?.[power] ?? digits[power] ?? ""}
              readOnly={readOnly}
              inputMode="numeric"
              maxLength={1}
              aria-label={`${label}, ${placeLabel(power)}`}
              className={power === activePower ? styles.activeDigit : styles.digit}
              data-column-power={power}
              onFocus={() => onActive(power)}
              onChange={(event) => onDigit(power, inputDigit(event.target.value))}
            />
            {power === 0 && powers.some((candidate) => candidate < 0) ? <b className={styles.commaGuide} data-comma-guide>,</b> : null}
          </span>
        ))}
      </div>
    </section>
  );
}

function BorrowTrace({ task, activePower }: { task: DecimalAddSubL2PublicTask; activePower: number }) {
  const marks = buildDecimalBorrowMarks(task.left, task.right);
  return (
    <section className={styles.borrowTrace} data-borrow-trace aria-label="Ślad przekreślenia i nowych wartości po pożyczaniu">
      <h3 className="font-black">Ślad pożyczania — stara cyfra zostaje widoczna</h3>
      <ol className="mt-3 grid gap-3 md:grid-cols-2">
        {marks.map((mark, index) => (
          <li key={mark.targetPower} className={mark.targetPower === activePower ? styles.activeBorrow : styles.borrowStep} data-borrow-power={mark.targetPower}>
            <b>Krok {index + 1}: {placeLabel(mark.targetPower)}</b>
            <span className={styles.borrowEquation}>
              <span>{placeLabel(mark.sourcePower)}: <del data-crossed-old-digit={mark.sourceOld}>{mark.sourceOld}</del></span>
              <small data-borrow-new-value={mark.sourceNew}>{mark.sourceNew}</small>
              <span aria-hidden>→</span>
              <span>{placeLabel(mark.targetPower)}: <del data-crossed-old-digit={mark.targetOld}>{mark.targetOld}</del></span>
              <small data-borrow-new-value={mark.targetNew}>{mark.targetNew}</small>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EstimateChoices({ task, value, readOnly, onChange }: { task: DecimalAddSubL2PublicTask; value: string; readOnly: boolean; onChange: (id: string) => void }) {
  return (
    <fieldset className={styles.estimateBox}>
      <legend className="px-2 font-black">1. Oszacuj przed dokładnym rachunkiem</legend>
      <div className={`${styles.controls} ${styles.choiceGrid}`}>
        {task.estimateOptions.map((option) => (
          <button key={option.id} type="button" disabled={readOnly} aria-pressed={value === option.id} className={styles.choiceButton} onClick={() => onChange(option.id)}>
            Wynik jest {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export interface DecimalAddSubL2LabProps {
  activity: DecimalAddSubL2Activity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalAddSubL2Lab({
  activity,
  seed,
  taskSeed,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  questionNumber,
  questionCount,
  onResultChange,
}: DecimalAddSubL2LabProps) {
  const effectiveSeed = taskSeed ?? seed;
  const [activeDifficulty, setActiveDifficulty] = useState<LessonDifficulty>(difficulty);
  const task = useMemo(() => createPublicDecimalAddSubL2Task({ seed: effectiveSeed, difficulty: activeDifficulty, activity }), [activity, activeDifficulty, effectiveSeed]);
  const powers = decimalAddSubL2ResultPowers(task);
  const expectedDisplay = expectedDecimalAddSubL2Display(task);
  const expectedDigits = expectedDecimalAddSubL2Digits(task);
  const [activePower, setActivePower] = useState(() => powers.at(-1) ?? 0);
  const [complementPower, setComplementPower] = useState(() => powers.at(-1) ?? 0);
  const [resultDigits, setResultDigits] = useState<Record<number, DecimalDigit>>({});
  const [complementDigits, setComplementDigits] = useState<Record<number, DecimalDigit>>({});
  const [estimateOptionId, setEstimateOptionId] = useState("");
  const [irrelevantLineId, setIrrelevantLineId] = useState("");
  const [complementStepIds, setComplementStepIds] = useState<string[]>([]);
  const [repairChoice, setRepairChoice] = useState("");
  const [commaMessage, setCommaMessage] = useState("Polski przecinek pozostaje w stałej pionowej prowadnicy.");
  const [diagnosticCode, setDiagnosticCode] = useState<DecimalFeedbackCode | null>(null);
  const [diagnosticPower, setDiagnosticPower] = useState<number | undefined>();
  const [diagnosticMethod, setDiagnosticMethod] = useState<DecimalAddSubL2Validation["method"]>();
  const [preservesDigits, setPreservesDigits] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const traceDisplay = readOnly ? expectedDisplay : decimalAddSubL2TraceDisplay(task, resultDigits);
  const complementTrace = readOnly ? expectedDisplay : decimalAddSubL2TraceDisplay(task, complementDigits);
  const initialRepair = task.repairChoices.find((choice) => choice !== expectedDisplay) ?? "62,5";
  const displayedRepair = readOnly ? expectedDisplay : repairChoice || initialRepair;
  const exactUnlocked = readOnly || !["workshop-receipt", "independent-add-sub-l2"].includes(activity) || Boolean(estimateOptionId);
  const diagnostic = diagnosticCode ? createDecimalDiagnosticResult(diagnosticCode, {
    maxScore: preservesDigits ? 2 : activity === "independent-add-sub-l2" ? 2 : 1,
    partial: preservesDigits,
    memberIds: diagnosticCode === DECIMAL_FEEDBACK_CODES.commaMisaligned
      ? ["comma-result"]
      : diagnosticPower === undefined ? [diagnosticMethod ?? "decimal-workspace"] : [`column-${diagnosticPower}`],
  }) : null;

  const clearResult = () => {
    setDiagnosticCode(null);
    setDiagnosticPower(undefined);
    setDiagnosticMethod(undefined);
    setPreservesDigits(false);
    setSuccessMessage(null);
    onResultChange?.(null);
  };

  const movePower = (current: number, delta: -1 | 1, setter: (power: number) => void) => {
    const index = powers.indexOf(current);
    setter(powers[Math.max(0, Math.min(powers.length - 1, index + delta))] ?? current);
  };

  const changeMainDigit = (power: number, digit: DecimalDigit) => {
    setResultDigits((current) => ({ ...current, [power]: digit }));
    setActivePower(power);
    clearResult();
  };

  const changeComplementDigit = (power: number, digit: DecimalDigit) => {
    setComplementDigits((current) => ({ ...current, [power]: digit }));
    setComplementPower(power);
    clearResult();
  };

  const fail = (validation: DecimalAddSubL2Validation, answerLabel: string) => {
    setDiagnosticCode(validation.code ?? DECIMAL_FEEDBACK_CODES.placeValue);
    setDiagnosticPower(validation.activePower);
    setDiagnosticMethod(validation.method);
    setPreservesDigits(validation.digitsCorrect && !validation.commaCorrect);
    setSuccessMessage(null);
    if (validation.activePower !== undefined) {
      if (validation.method === "complement") setComplementPower(validation.activePower);
      else setActivePower(validation.activePower);
    }
    onResultChange?.(false, answerLabel);
  };

  const succeed = (message: string, answerLabel: string) => {
    setDiagnosticCode(null);
    setDiagnosticPower(undefined);
    setDiagnosticMethod(undefined);
    setPreservesDigits(false);
    setSuccessMessage(message);
    onResultChange?.(true, answerLabel);
  };

  const checkActivity = () => {
    if (activity === "change-two-methods") {
      const validation = validateDecimalChangeMethods({ task, writtenDigits: resultDigits, complementDigits, complementStepIds });
      if (!validation.correct) return fail(validation, `${traceDisplay}; dopełnianie ${complementTrace}`);
      return succeed("Obie metody dają tę samą resztę 3,65 zł, a ich zapisy pozostały osobno.", `pisemnie ${expectedDisplay}; dopełnianiem ${expectedDisplay}`);
    }
    if (activity === "workshop-receipt") {
      const validation = validateWorkshopReceipt({ task, estimateOptionId, irrelevantLineId, resultDigits });
      if (!validation.correct) return fail(validation, `paragon ${traceDisplay}`);
      return succeed("Szacunek, wybór zbędnej informacji i dokładna suma paragonu są zgodne.", `Paragon pracowni: ${expectedDisplay} zł`);
    }
    if (activity === "repair-context-comma") {
      const validation = validateDecimalAddSubL2Repair(task, repairChoice || initialRepair);
      if (!validation.correct) return fail(validation, repairChoice || initialRepair);
      return succeed("Naprawiono tylko przecinek; cyfry 6, 2 i 5 oraz wcześniejszy tok zostały zachowane.", `${expectedDisplay} zł`);
    }
    const validation = validateDecimalAddSubL2Work({
      task,
      resultDigits,
      estimateOptionId,
      requireEstimate: activity === "independent-add-sub-l2",
    });
    if (!validation.correct) return fail(validation, traceDisplay);
    return succeed(
      activity === "borrowing-subtraction"
        ? "Wynik jest poprawny, a oba pożyczania mają zachowane stare i nowe wartości cyfr."
        : "Szacunek, pożyczanie i odpowiedź w kontekście są zgodne.",
      `${task.left} − ${task.right} = ${expectedDisplay} ${task.unit}`,
    );
  };

  const chooseDifficulty = (next: LessonDifficulty) => {
    const nextTask = createPublicDecimalAddSubL2Task({ seed: effectiveSeed, difficulty: next, activity });
    const nextPowers = decimalAddSubL2ResultPowers(nextTask);
    setActiveDifficulty(next);
    setActivePower(nextPowers.at(-1) ?? 0);
    setComplementPower(nextPowers.at(-1) ?? 0);
    setResultDigits({});
    setComplementDigits({});
    setEstimateOptionId("");
    setIrrelevantLineId("");
    setComplementStepIds([]);
    setRepairChoice("");
    clearResult();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    const label = target.getAttribute("aria-label") ?? "";
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && target.tagName === "INPUT") {
      event.preventDefault();
      const delta = event.key === "ArrowLeft" ? -1 : 1;
      if (label.startsWith("Wynik dopełniania")) movePower(complementPower, delta, setComplementPower);
      else movePower(activePower, delta, setActivePower);
    }
    if (event.key === "," || event.key === ".") {
      setCommaMessage("Polski przecinek potwierdzony z klawiatury w stałej prowadnicy.");
    }
    if (event.key === "Enter" && target.tagName === "INPUT") checkActivity();
  };

  const renderMainWritten = (label: string) => (
    <section className="space-y-4" data-method={label}>
      <ColumnNavigator powers={powers} activePower={activePower} onChange={(power) => { setActivePower(power); clearResult(); }} />
      {activity === "borrowing-subtraction" ? <BorrowTrace task={task} activePower={activePower} /> : null}
      <DecimalWrittenAddSub
        left={task.left}
        right={task.right}
        operation="subtract"
        activePower={activePower}
        resultDigits={resultDigits}
        onResultDigitChange={!readOnly && exactUnlocked ? changeMainDigit : undefined}
        showSolution={readOnly}
      />
      <p className={styles.tracePanel} aria-live="polite">Zachowany tok {label}: <strong className="font-mono">{traceDisplay}</strong>. Pusta kratka ma znak ▽.</p>
      {!readOnly && exactUnlocked ? (
        <DigitKeypad
          label={label}
          powers={powers}
          activePower={activePower}
          onDigit={(digit) => changeMainDigit(activePower, digit)}
          onMove={(delta) => movePower(activePower, delta, setActivePower)}
          onComma={() => { setCommaMessage("Polski przecinek potwierdzony dotykiem w stałej prowadnicy."); clearResult(); }}
          onConfirm={checkActivity}
        />
      ) : null}
    </section>
  );

  return (
    <article
      className={`${styles.lesson} space-y-5 rounded-[2rem] border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-4 text-slate-950 shadow-xl sm:p-6`}
      data-decimal-add-sub-l2
      data-decimal-activity={activity}
      data-generator-id={task.generatorId}
      data-generator-version={task.generatorVersion}
      data-seed={effectiveSeed}
      data-difficulty={activeDifficulty}
      data-presentation-mode={presentationMode || undefined}
      data-answer-spec="server-only"
      onKeyDown={handleKeyDown}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-amber-800">Dział 5 · Dodawanie i odejmowanie ułamków dziesiętnych · L2</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{ACTIVITY_TITLES[activity]}</h2>
          <p className="mt-2 max-w-3xl font-semibold leading-relaxed text-slate-700">{task.prompt}</p>
        </div>
        {questionNumber && questionCount ? <b className="rounded-xl bg-cyan-100 px-3 py-2 text-sm text-cyan-950">Zadanie {questionNumber}/{questionCount}</b> : null}
      </header>

      {activity === "independent-add-sub-l2" && !onResultChange && !readOnly ? (
        <div className={`${styles.controls} flex flex-wrap gap-2`} aria-label="Wybierz wariant samodzielnej próby L2">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => (
            <button key={level} type="button" aria-pressed={activeDifficulty === level} className={styles.difficultyButton} onClick={() => chooseDifficulty(level)}>{DIFFICULTY_LABELS[level]}</button>
          ))}
        </div>
      ) : activity === "independent-add-sub-l2" ? <p className="w-fit rounded-xl bg-violet-100 px-3 py-2 text-sm font-black text-violet-950">Wariant: {DIFFICULTY_LABELS[activeDifficulty]}</p> : null}

      <p className={styles.contextCard}>{task.context}</p>

      {activity === "borrowing-subtraction" ? renderMainWritten("odejmowanie z pożyczaniem") : null}

      {activity === "change-two-methods" ? (
        <div className={styles.methodGrid}>
          <section className={styles.methodCard} data-method="written">
            <h3 className="text-xl font-black">Metoda 1 · odejmowanie pisemne</h3>
            {renderMainWritten("metoda pisemna")}
          </section>
          <section className={styles.methodCard} data-method="complement">
            <h3 className="text-xl font-black">Metoda 2 · dopełnianie</h3>
            <p className="font-bold">Zapisz dwa skoki osobno, a potem ich sumę.</p>
            <div className={`${styles.controls} ${styles.complementChoices}`}>
              {task.complementOptions.map((option) => (
                <button key={option.id} type="button" disabled={readOnly} aria-pressed={readOnly ? ["0,65", "3,00"].includes(option.id) : complementStepIds.includes(option.id)} className={styles.choiceButton} onClick={() => { setComplementStepIds((current) => current.includes(option.id) ? current.filter((id) => id !== option.id) : [...current, option.id]); clearResult(); }}>{option.label}</button>
              ))}
            </div>
            <LocalDigitGrid label="Wynik dopełniania" powers={powers} digits={complementDigits} activePower={complementPower} readOnly={readOnly} solution={readOnly ? expectedDigits : undefined} onDigit={changeComplementDigit} onActive={setComplementPower} />
            <p className={styles.tracePanel} aria-live="polite">Osobny zapis dopełniania: <strong className="font-mono">{complementTrace}</strong>.</p>
            {!readOnly ? <DigitKeypad label="dopełnianie" powers={powers} activePower={complementPower} onDigit={(digit) => changeComplementDigit(complementPower, digit)} onMove={(delta) => movePower(complementPower, delta, setComplementPower)} onComma={() => setCommaMessage("Przecinek dopełniania potwierdzony.")} onConfirm={checkActivity} /> : null}
          </section>
        </div>
      ) : null}

      {activity === "workshop-receipt" ? (
        <section className="space-y-4" data-workshop-receipt>
          <EstimateChoices task={task} value={estimateOptionId} readOnly={readOnly} onChange={(id) => { setEstimateOptionId(id); clearResult(); }} />
          <div className={styles.receipt}>
            <h3 className="text-center text-xl font-black">PARAGON PRACOWNI</h3>
            <ul className="mt-3 space-y-2">
              {task.receiptLines.map((line) => <li key={line.id}><span>{line.label}</span><b>{line.value ? `${line.value} zł` : "—"}</b></li>)}
            </ul>
          </div>
          <fieldset>
            <legend className="font-black">2. Której informacji nie używasz w rachunku?</legend>
            <div className={`${styles.controls} ${styles.choiceGrid}`}>
              {task.receiptLines.map((line) => <button key={line.id} type="button" disabled={readOnly} aria-pressed={irrelevantLineId === line.id} className={styles.choiceButton} onClick={() => { setIrrelevantLineId(line.id); clearResult(); }}>{line.label}{line.value ? ` — ${line.value} zł` : ""}</button>)}
            </div>
          </fieldset>
          {!exactUnlocked ? <p className={styles.lockNote}>Najpierw wybierz oszacowanie. Dokładne kratki odblokują się bez ujawniania wyniku.</p> : null}
          <LocalDigitGrid label="Suma paragonu" powers={powers} digits={resultDigits} activePower={activePower} readOnly={readOnly || !exactUnlocked} solution={readOnly ? expectedDigits : undefined} onDigit={changeMainDigit} onActive={setActivePower} />
          <p className={styles.tracePanel} aria-live="polite">Suma w czasie rzeczywistym: <strong className="font-mono">{traceDisplay} zł</strong>.</p>
          {!readOnly && exactUnlocked ? <DigitKeypad label="suma paragonu" powers={powers} activePower={activePower} onDigit={(digit) => changeMainDigit(activePower, digit)} onMove={(delta) => movePower(activePower, delta, setActivePower)} onComma={() => setCommaMessage("Polski przecinek sumy potwierdzony.")} onConfirm={checkActivity} /> : null}
        </section>
      ) : null}

      {activity === "repair-context-comma" ? (
        <section className={styles.repairCard}>
          <p className="text-center font-black">20,00 zł − 13,75 zł · wydruk: 62,5 zł</p>
          <div className={styles.preservedDigits} aria-label="Zachowane poprawne cyfry kwoty">
            {["6", "2", "5"].map((digit) => <span key={digit} data-preserved-digit={digit}>{digit}</span>)}
          </div>
          <p className={styles.tracePanel}>Aktualny zapis: <strong data-repair-display>{displayedRepair} zł</strong>. Zmieniasz tylko przecinek.</p>
          {!readOnly ? <div className={`${styles.controls} ${styles.choiceGrid}`}>{task.repairChoices.map((choice) => <button key={choice} type="button" aria-pressed={repairChoice === choice} className={styles.choiceButton} onClick={() => { setRepairChoice(choice); clearResult(); }}>Ustaw {choice} zł</button>)}</div> : null}
        </section>
      ) : null}

      {activity === "independent-add-sub-l2" ? (
        <section className="space-y-4">
          <EstimateChoices task={task} value={estimateOptionId} readOnly={readOnly} onChange={(id) => { setEstimateOptionId(id); clearResult(); }} />
          {!exactUnlocked ? <p className={styles.lockNote}>Najpierw oszacuj. Potem odblokuje się samodzielny zapis w kratkach.</p> : null}
          {renderMainWritten("samodzielna próba")}
        </section>
      ) : null}

      <p className="rounded-xl bg-violet-50 p-3 font-bold text-violet-950" aria-live="polite">{commaMessage}</p>
      {!readOnly ? <button type="button" className={`${styles.controls} ${styles.checkButton}`} onClick={checkActivity}>{activity === "repair-context-comma" ? "Sprawdź tylko przecinek" : activity === "change-two-methods" ? "Sprawdź oba osobne zapisy" : "Sprawdź rozwiązanie"}</button> : null}

      {successMessage ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 font-black text-emerald-950">✓ {successMessage}</p> : null}
      {diagnosticPower !== undefined ? <p role="alert" className={styles.columnFeedback} data-feedback-column={diagnosticPower}>Sprawdź konkretnie kolumnę: {placeLabel(diagnosticPower)}. Pozostałe cyfry i tok zostają na miejscu.</p> : null}
      {diagnosticMethod && diagnosticPower === undefined ? <p role="alert" className={styles.columnFeedback}>Sprawdź część: {diagnosticMethod === "written" ? "metoda pisemna" : diagnosticMethod === "complement" ? "dopełnianie i jego dwa skoki" : diagnosticMethod === "estimate" ? "oszacowanie przed rachunkiem" : "wybór informacji z kontekstu"}. Dotychczasowy zapis pozostaje.</p> : null}
      {diagnostic ? (onResultChange
        ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
        : <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(diagnostic.result)} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted />) : null}
    </article>
  );
}
