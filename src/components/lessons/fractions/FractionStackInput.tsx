"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
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
  readOnly?: boolean;
  showKeypad?: boolean;
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
  readOnly = false,
  showKeypad = true,
  stepLabel = "Wpisz ułamek",
  ariaLabel = "Zapis ułamka w kratkach",
  diagnosticCode,
  diagnosticMemberIds,
  onSubmit,
}: FractionStackInputProps) {
  const safeDigitLimit = Math.max(1, Math.trunc(digitLimit));
  const minimumCells = Math.min(safeDigitLimit, Math.max(1, Math.trunc(initialDigitCells)));
  const [slotCounts, setSlotCounts] = useState<Record<FractionPart, number>>(() => ({
    wholePart: showWholePart ? Math.min(safeDigitLimit, Math.max(minimumCells, value.wholePart?.length ?? 0)) : 0,
    numerator: Math.min(safeDigitLimit, Math.max(minimumCells, value.numerator.length)),
    denominator: Math.min(safeDigitLimit, Math.max(minimumCells, value.denominator.length)),
  }));
  const firstPart: FractionPart = showWholePart ? "wholePart" : "numerator";
  const [activeCell, setActiveCell] = useState<CellKey>(cellKey(firstPart, 0));
  const [internalDiagnostic, setInternalDiagnostic] = useState<FractionFeedbackCode | null>(null);
  const refs = useRef(new Map<CellKey, HTMLInputElement>());
  const pendingFocusRef = useRef<CellKey | null>(null);

  const visibleSlotCounts = useMemo<Record<FractionPart, number>>(() => ({
      wholePart: showWholePart
        ? Math.min(safeDigitLimit, Math.max(slotCounts.wholePart, minimumCells, value.wholePart?.length ?? 0))
        : 0,
      numerator: Math.min(safeDigitLimit, Math.max(slotCounts.numerator, minimumCells, value.numerator.length)),
      denominator: Math.min(safeDigitLimit, Math.max(slotCounts.denominator, minimumCells, value.denominator.length)),
    }), [minimumCells, safeDigitLimit, showWholePart, slotCounts, value.denominator.length, value.numerator.length, value.wholePart?.length]);

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
      for (let index = 0; index < visibleSlotCounts[part]; index += 1) order.push(cellKey(part, index));
    });
    return order;
  }, [visibleSlotCounts]);

  const focusCell = (key: CellKey) => {
    setActiveCell(key);
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
    const next = cloneValue(value);
    if (part === "wholePart" && !next.wholePart) next.wholePart = [];
    const targetRow = row(next, part);
    while (targetRow.length < visibleSlotCounts[part]) targetRow.push("");
    targetRow[index] = digit;
    while (targetRow.length > 1 && targetRow.at(-1) === "") targetRow.pop();
    onChange(next);
    setInternalDiagnostic(null);

    if (digit !== "") {
      const currentKey = cellKey(part, index);
      if (index === visibleSlotCounts[part] - 1 && visibleSlotCounts[part] < safeDigitLimit) {
        const nextKey = cellKey(part, index + 1);
        setSlotCounts((current) => ({ ...current, [part]: Math.max(current[part], visibleSlotCounts[part] + 1) }));
        pendingFocusRef.current = nextKey;
        setActiveCell(nextKey);
      } else {
        moveFocus(currentKey, 1);
      }
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
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            readOnly={readOnly}
            aria-label={`${PART_LABELS[part]}, cyfra ${index + 1} z ${visibleSlotCounts[part]}`}
            aria-invalid={attention || undefined}
            data-fraction-part={part}
            data-fraction-index={index}
            className={`${styles.digitCell} ${attention ? styles.digitCellAttention : ""}`}
            onFocus={() => setActiveCell(key)}
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
    <section className="space-y-4" aria-label={ariaLabel}>
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

      {showKeypad && !readOnly ? (
        <InteractionAlternativePanel
          title="Klawiatura ekranowa"
          instruction="Wybierz kratkę, a następnie cyfrę. Strzałki zmieniają kratkę, Backspace cofa, Enter zatwierdza."
        >
          <div className={`${styles.keypad} grid w-full grid-cols-5 gap-2`} aria-label="Cyfry do wpisania">
            {Array.from({ length: 10 }, (_, digit) => (
              <button
                key={digit}
                type="button"
                className="min-h-[52px] min-w-[52px] rounded-xl border-2 border-slate-300 bg-white text-lg font-black text-slate-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-600"
                onClick={() => {
                  const [part, index] = activeCell.split(":") as [FractionPart, `${number}`];
                  setCellDigit(part, Number(index), String(digit) as FractionDigit);
                }}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              className="min-h-[52px] rounded-xl border-2 border-slate-300 bg-white px-3 font-black text-slate-800"
              onClick={() => {
                const [part, index] = activeCell.split(":") as [FractionPart, `${number}`];
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
              }}
            >
              Backspace
            </button>
            <button
              type="button"
              className="min-h-[52px] rounded-xl bg-indigo-700 px-4 font-black text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-600"
              onClick={submit}
            >
              Zatwierdź
            </button>
          </div>
        </InteractionAlternativePanel>
      ) : null}

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
