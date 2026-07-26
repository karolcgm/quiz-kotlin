"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  createFractionDiagnosticResult,
  parseFractionStackValue,
} from "@/lib/math/fractions";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { FRACTION_FEEDBACK_CODES } from "@/types/fractions";
import type {
  FractionDigit,
  FractionFeedbackCode,
  FractionParseResult,
  FractionStackValue,
} from "@/types/fractions";
import styles from "@/components/lessons/fractions/fractions.module.css";

type FractionPart = "wholePart" | "numerator" | "denominator";
type CellKey = `${FractionPart}:${number}`;

const PART_LABELS: Record<FractionPart, string> = {
  wholePart: "część całkowita",
  numerator: "licznik",
  denominator: "mianownik",
};

function isDigit(value: string): value is Exclude<FractionDigit, ""> {
  return /^[0-9]$/u.test(value);
}

function cellKey(part: FractionPart, index: number): CellKey {
  return `${part}:${index}`;
}

function cloneValue(value: FractionStackValue): FractionStackValue {
  return {
    wholePart: value.wholePart ? [...value.wholePart] : undefined,
    numerator: [...value.numerator],
    denominator: [...value.denominator],
  };
}

function row(value: FractionStackValue, part: FractionPart): FractionDigit[] {
  if (part === "wholePart") return value.wholePart ?? [];
  return value[part];
}

function spokenRow(digits: FractionDigit[] | undefined): string {
  if (!digits || digits.length === 0) return "brak";
  return digits.map((digit) => digit || "pusta kratka").join(" ");
}

export interface FractionStackInputProps {
  /** Kontrolowany stan: jedna pozycja tablicy odpowiada jednej kratce. */
  value: FractionStackValue;
  onChange: (value: FractionStackValue) => void;
  /** Włącza osobne kratki części całkowitej po lewej stronie ułamka. */
  showWholePart?: boolean;
  digitLimit?: number;
  initialDigitCells?: number;
  /** Ustala dokładną liczbę kratek w każdym wierszu i wyłącza ich automatyczne dodawanie. */
  fixedDigitCells?: {
    wholePart?: number;
    numerator: number;
    denominator: number;
  };
  readOnly?: boolean;
  /** Blokuje wybrane wiersze, np. podany mianownik przy uzupełnianiu tylko licznika. */
  readOnlyParts?: Array<"wholePart" | "numerator" | "denominator">;
  showKeypad?: boolean;
  /** Opcjonalny kontener, do którego klawiatura jest przenoszona poza linię działania. */
  keypadPortalTarget?: HTMLElement | null;
  /** Pozwala korzystać z cyfr klawiatury ekranowej bez drugiego przycisku zatwierdzania. */
  showKeypadConfirm?: boolean;
  /** Po wpisaniu cyfry przechodzi do kolejnej kratki. Można wyłączyć w wieloetapowych działaniach. */
  autoAdvance?: boolean;
  stepLabel?: string;
  ariaLabel?: string;
  diagnosticCode?: FractionFeedbackCode;
  diagnosticMemberIds?: string[];
  onSubmit?: (result: Extract<FractionParseResult, { ok: true }>) => void;
}

/**
 * Szkolny, pionowy zapis ułamka. Obsługuje klawiaturę fizyczną i ekranową,
 * zachowuje puste kratki oraz nigdy nie zamienia niepełnego wpisu na zero.
 */
export function FractionStackInput({
  value,
  onChange,
  showWholePart = false,
  digitLimit = 3,
  initialDigitCells = 1,
  fixedDigitCells,
  readOnly = false,
  readOnlyParts = [],
  showKeypad = true,
  keypadPortalTarget,
  showKeypadConfirm = true,
  autoAdvance = true,
  stepLabel = "Wpisz ułamek",
  ariaLabel = "Zapis ułamka w kratkach",
  diagnosticCode,
  diagnosticMemberIds,
  onSubmit,
}: FractionStackInputProps) {
  const requestedFixedMaximum = Math.max(
    fixedDigitCells?.wholePart ?? 0,
    fixedDigitCells?.numerator ?? 0,
    fixedDigitCells?.denominator ?? 0,
  );
  const safeDigitLimit = Math.max(1, Math.trunc(digitLimit), requestedFixedMaximum);
  const minimumCells = Math.min(safeDigitLimit, Math.max(1, Math.trunc(initialDigitCells)));
  const [slotCounts] = useState<Record<FractionPart, number>>(() => ({
    wholePart: showWholePart ? Math.min(safeDigitLimit, Math.max(minimumCells, value.wholePart?.length ?? 0)) : 0,
    numerator: Math.min(safeDigitLimit, Math.max(minimumCells, value.numerator.length)),
    denominator: Math.min(safeDigitLimit, Math.max(minimumCells, value.denominator.length)),
  }));
  const firstPart: FractionPart = showWholePart ? "wholePart" : "numerator";
  const [activeCell, setActiveCell] = useState<CellKey>(cellKey(firstPart, 0));
  const activeCellRef = useRef<CellKey>(cellKey(firstPart, 0));
  const [internalDiagnostic, setInternalDiagnostic] = useState<FractionFeedbackCode | null>(null);
  const refs = useRef(new Map<CellKey, HTMLInputElement>());
  const pendingFocusRef = useRef<CellKey | null>(null);
  const readOnlyPartSet = useMemo(() => new Set<FractionPart>(readOnlyParts), [readOnlyParts]);
  const usesOwnKeypad = showKeypad && !readOnly;

  const visibleSlotCounts = useMemo<Record<FractionPart, number>>(() => ({
      wholePart: showWholePart
        ? fixedDigitCells?.wholePart ?? Math.min(safeDigitLimit, Math.max(slotCounts.wholePart, minimumCells, value.wholePart?.length ?? 0))
        : 0,
      numerator: fixedDigitCells?.numerator ?? Math.min(safeDigitLimit, Math.max(slotCounts.numerator, minimumCells, value.numerator.length)),
      denominator: fixedDigitCells?.denominator ?? Math.min(safeDigitLimit, Math.max(slotCounts.denominator, minimumCells, value.denominator.length)),
    }), [fixedDigitCells, minimumCells, safeDigitLimit, showWholePart, slotCounts, value.denominator.length, value.numerator.length, value.wholePart?.length]);

  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (!pendingFocus) return;
    const element = refs.current.get(pendingFocus);
    if (!element) return;
    element.focus();
    pendingFocusRef.current = null;
  }, [activeCell, visibleSlotCounts, value]);

  const cellOrder = useMemo(() => {
    const order: CellKey[] = [];
    (["wholePart", "numerator", "denominator"] as const).forEach((part) => {
      if (readOnlyPartSet.has(part)) return;
      for (let index = 0; index < visibleSlotCounts[part]; index += 1) order.push(cellKey(part, index));
    });
    return order;
  }, [readOnlyPartSet, visibleSlotCounts]);

  const selectCell = (key: CellKey) => {
    // Stan React może zostać zastosowany dopiero po zakończeniu zdarzenia.
    // Referencja zmienia się natychmiast, dlatego szybki dotyk kratki i cyfry
    // na tablecie zawsze kieruje wpis do ostatnio wskazanego pola.
    activeCellRef.current = key;
    setActiveCell(key);
  };

  const focusCell = (key: CellKey) => {
    selectCell(key);
    const element = refs.current.get(key);
    if (element) element.focus();
    else pendingFocusRef.current = key;
  };

  const moveFocus = (key: CellKey, offset: number) => {
    const index = cellOrder.indexOf(key);
    const next = cellOrder[Math.max(0, Math.min(cellOrder.length - 1, index + offset))];
    if (next) focusCell(next);
  };

  const setCellDigit = (part: FractionPart, index: number, digit: FractionDigit) => {
    if (readOnly) return;
    if (readOnlyPartSet.has(part)) {
      const next = cellOrder[0];
      if (!next) return;
      const [nextPart, nextIndex] = next.split(":") as [FractionPart, `${number}`];
      focusCell(next);
      setCellDigit(nextPart, Number(nextIndex), digit);
      return;
    }
    const next = cloneValue(value);
    if (part === "wholePart" && !next.wholePart) next.wholePart = [];
    const targetRow = row(next, part);
    while (targetRow.length < visibleSlotCounts[part]) targetRow.push("");
    targetRow[index] = digit;
    while (targetRow.length > 1 && targetRow.at(-1) === "") targetRow.pop();
    onChange(next);
    setInternalDiagnostic(null);

    if (digit !== "" && autoAdvance) {
      const currentKey = cellKey(part, index);
      moveFocus(currentKey, 1);
    }
  };

  const submit = () => {
    if (readOnly) return;
    const parsed = parseFractionStackValue({
      ...value,
      wholePart: showWholePart ? value.wholePart ?? [""] : undefined,
    });
    if (!parsed.ok) {
      const code = parsed.error.code === FRACTION_FEEDBACK_CODES.zeroDenominator
        ? FRACTION_FEEDBACK_CODES.zeroDenominator
        : FRACTION_FEEDBACK_CODES.emptyPart;
      setInternalDiagnostic(code);
      const part = parsed.error.part === "denominator"
        ? "denominator"
        : parsed.error.part === "whole"
          ? "wholePart"
          : "numerator";
      const missingIndex = row(value, part).findIndex((digit) => digit === "");
      focusCell(cellKey(part, Math.max(0, missingIndex)));
      return;
    }
    setInternalDiagnostic(null);
    onSubmit?.(parsed);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    part: FractionPart,
    index: number,
  ) => {
    const key = cellKey(part, index);
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveFocus(key, -1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveFocus(key, 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextPart = event.key === "ArrowUp" ? "numerator" : "denominator";
      if (part !== nextPart && part !== "wholePart") {
        focusCell(cellKey(nextPart, Math.min(index, visibleSlotCounts[nextPart] - 1)));
      }
    } else if (event.key === "Backspace") {
      event.preventDefault();
      const digits = row(value, part);
      if (digits[index]) setCellDigit(part, index, "");
      else {
        const previousIndex = cellOrder.indexOf(key) - 1;
        const previous = cellOrder[previousIndex];
        if (previous) {
          const [previousPart, previousCellIndex] = previous.split(":") as [FractionPart, `${number}`];
          setCellDigit(previousPart, Number(previousCellIndex), "");
          focusCell(previous);
        }
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (isDigit(event.key)) {
      event.preventDefault();
      setCellDigit(part, index, event.key);
    }
  };

  const changeInput = (
    event: ChangeEvent<HTMLInputElement>,
    part: FractionPart,
    index: number,
  ) => {
    const lastDigit = [...event.target.value].reverse().find(isDigit);
    setCellDigit(part, index, lastDigit ?? "");
  };

  const renderRow = (part: FractionPart) => (
    <div className="flex justify-center gap-2" role="group" aria-label={PART_LABELS[part]}>
      {Array.from({ length: visibleSlotCounts[part] }, (_, index) => {
        const key = cellKey(part, index);
        const digit = row(value, part)[index] ?? "";
        const attention = internalDiagnostic === FRACTION_FEEDBACK_CODES.zeroDenominator && part === "denominator"
          || internalDiagnostic === FRACTION_FEEDBACK_CODES.emptyPart && digit === "";
        return (
          <input
            key={key}
            ref={(element) => {
              if (element) refs.current.set(key, element);
              else refs.current.delete(key);
            }}
            value={digit}
            inputMode={readOnly || readOnlyPartSet.has(part) || usesOwnKeypad ? "none" : "numeric"}
            pattern="[0-9]*"
            maxLength={1}
            readOnly={readOnly || readOnlyPartSet.has(part) || usesOwnKeypad}
            aria-label={`${PART_LABELS[part]}, cyfra ${index + 1} z ${visibleSlotCounts[part]}`}
            aria-invalid={attention || undefined}
            data-fraction-part={part}
            data-fraction-index={index}
            data-system-keyboard-suppressed={readOnly || readOnlyPartSet.has(part) || usesOwnKeypad || undefined}
            className={`${styles.digitCell} ${attention ? styles.digitCellAttention : ""}`}
            onPointerDown={() => selectCell(key)}
            onClick={() => selectCell(key)}
            onFocus={() => selectCell(key)}
            onChange={(event) => changeInput(event, part, index)}
            onKeyDown={(event) => handleKeyDown(event, part, index)}
          />
        );
      })}
    </div>
  );

  const activeDiagnosticCode = diagnosticCode ?? internalDiagnostic;
  const diagnostic = activeDiagnosticCode
    ? createFractionDiagnosticResult(activeDiagnosticCode, { memberIds: diagnosticMemberIds })
    : null;
  const spokenValue = `${showWholePart ? `część całkowita ${spokenRow(value.wholePart)}, ` : ""}licznik ${spokenRow(value.numerator)}, mianownik ${spokenRow(value.denominator)}`;

  return (
    <section className="w-full space-y-4" aria-label={ariaLabel} data-fraction-stack-input>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {spokenValue}. Aktualny krok: {stepLabel}.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 text-slate-950">
        {showWholePart ? (
          <div className="space-y-1 self-center">
            <span className="block text-center text-xs font-bold text-slate-600">część całkowita</span>
            {renderRow("wholePart")}
          </div>
        ) : null}
        <div className="grid justify-items-stretch gap-2">
          <span className="sr-only">Licznik nad kreską ułamkową</span>
          {renderRow("numerator")}
          <div className={styles.fractionLine} aria-hidden />
          <span className="sr-only">Mianownik pod kreską ułamkową</span>
          {renderRow("denominator")}
        </div>
      </div>

      {showKeypad && !readOnly ? (keypadPortalTarget === undefined ? (
        <div className={styles.keypad} data-fraction-keypad>
          <LessonNumericKeypad
            label="Klawiatura ekranowa do ułamków"
            helperText={showKeypadConfirm
              ? "Wybierz kratkę i cyfrę. Strzałki zmieniają kratkę, Backspace cofa, Enter zatwierdza."
              : "Wybierz kratkę i cyfrę. Po uzupełnieniu użyj przycisku „Prześlij zadanie” pod działaniem."}
            onKey={(keyValue) => {
              if (keyValue === "backspace") {
                const [part, index] = activeCellRef.current.split(":") as [FractionPart, `${number}`];
                const key = cellKey(part, Number(index));
                const digits = row(value, part);
                if (digits[Number(index)]) setCellDigit(part, Number(index), "");
                else {
                  const previousIndex = cellOrder.indexOf(key) - 1;
                  const previous = cellOrder[previousIndex];
                  if (previous) {
                    const [previousPart, previousCellIndex] = previous.split(":") as [FractionPart, `${number}`];
                    setCellDigit(previousPart, Number(previousCellIndex), "");
                    focusCell(previous);
                  }
                }
                return;
              }
              const digit = Number(keyValue);
              if (!Number.isInteger(digit) || digit < 0 || digit > 9) return;
              const [part, index] = activeCellRef.current.split(":") as [FractionPart, `${number}`];
              setCellDigit(part, Number(index), keyValue as FractionDigit);
            }}
            onConfirm={showKeypadConfirm ? submit : undefined}
          />
        </div>
      ) : keypadPortalTarget ? createPortal(
        <div className={styles.keypad} data-fraction-keypad>
          <LessonNumericKeypad
            label="Klawiatura ekranowa do ułamków"
            helperText={showKeypadConfirm
              ? "Wybierz kratkę i cyfrę. Strzałki zmieniają kratkę, Backspace cofa, Enter zatwierdza."
              : "Wybierz kratkę i cyfrę. Po uzupełnieniu użyj przycisku „Prześlij zadanie” pod działaniem."}
            onKey={(keyValue) => {
              if (keyValue === "backspace") {
                const [part, index] = activeCellRef.current.split(":") as [FractionPart, `${number}`];
                const key = cellKey(part, Number(index));
                const digits = row(value, part);
                if (digits[Number(index)]) setCellDigit(part, Number(index), "");
                else {
                  const previousIndex = cellOrder.indexOf(key) - 1;
                  const previous = cellOrder[previousIndex];
                  if (previous) {
                    const [previousPart, previousCellIndex] = previous.split(":") as [FractionPart, `${number}`];
                    setCellDigit(previousPart, Number(previousCellIndex), "");
                    focusCell(previous);
                  }
                }
                return;
              }
              const digit = Number(keyValue);
              if (!Number.isInteger(digit) || digit < 0 || digit > 9) return;
              const [part, index] = activeCellRef.current.split(":") as [FractionPart, `${number}`];
              setCellDigit(part, Number(index), keyValue as FractionDigit);
            }}
            onConfirm={showKeypadConfirm ? submit : undefined}
          />
        </div>,
        keypadPortalTarget,
      ) : null) : null}

      {diagnostic ? (
        <DiagnosticFeedbackPanel
          result={toPublicLessonGradeResult(diagnostic.result)}
          copy={diagnostic.copy}
          highlights={diagnostic.highlights}
          mode="practice"
          submitted
        />
      ) : null}
    </section>
  );
}
