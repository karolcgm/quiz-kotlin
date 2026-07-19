"use client";

import type { ReactNode } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { DECIMAL_PLACES, buildDecimalWrittenAddSubModel, createDecimalDiagnosticResult } from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalDigit, DecimalFeedbackCode } from "@/types/decimals";
import styles from "@/components/lessons/decimals/decimals.module.css";

export interface DecimalWrittenAddSubProps {
  left: string;
  right: string;
  operation: "add" | "subtract";
  activePower?: number;
  activeInput?: "carry" | "result";
  resultDigits?: Record<number, DecimalDigit>;
  carryDigits?: Record<number, DecimalDigit>;
  onResultDigitChange?: (power: number, digit: DecimalDigit) => void;
  onActivePowerChange?: (power: number) => void;
  onActiveInputChange?: (input: "carry" | "result") => void;
  commaAligned?: boolean;
  showSolution?: boolean;
  diagnosticCode?: DecimalFeedbackCode;
  showGuidance?: boolean;
  padMissingOperandDigitsWithZero?: boolean;
}

function placeLabel(power: number): string {
  return DECIMAL_PLACES.find((place) => place.power === power)?.label ?? `10 do potęgi ${power}`;
}

export function DecimalWrittenAddSub({
  left,
  right,
  operation,
  activePower,
  activeInput = "result",
  resultDigits = {},
  carryDigits = {},
  onActivePowerChange,
  onActiveInputChange,
  commaAligned = true,
  showSolution = false,
  diagnosticCode,
  showGuidance = true,
  padMissingOperandDigitsWithZero = false,
}: DecimalWrittenAddSubProps) {
  const model = buildDecimalWrittenAddSubModel(left, right, operation);
  const operandDigitsForDisplay = (digits: typeof model.rows[number]) => padMissingOperandDigitsWithZero
    ? digits.map((cell) => ({ ...cell, digit: cell.digit || "0" }))
    : digits;
  const hasDecimalColumns = model.columns.some((power) => power < 0);
  const tableColumnCount = 1 + model.columns.length + (hasDecimalColumns ? 1 : 0);
  const activeDiagnostic = diagnosticCode ?? (!commaAligned ? DECIMAL_FEEDBACK_CODES.commaMisaligned : undefined);
  const presentation = activeDiagnostic
    ? createDecimalDiagnosticResult(activeDiagnostic, { memberIds: activeDiagnostic === DECIMAL_FEEDBACK_CODES.commaMisaligned ? ["comma-left", "comma-right", "comma-result"] : [`column-${activePower ?? 0}`] })
    : null;

  const renderCells = (digits: typeof model.result, rowId: string, editable = false) => (
    <>
      {digits.map((cell) => (
        <td key={cell.id} className={`p-1 ${showGuidance && activePower === cell.placePower ? styles.activeColumn : ""}`} data-column-power={cell.placePower}>
          {editable ? (
            <button
              type="button"
              disabled={showSolution}
              onClick={() => { onActiveInputChange?.("result"); onActivePowerChange?.(cell.placePower); }}
              aria-label={`Wynik, ${placeLabel(cell.placePower)}`}
              className={styles.digitCell}
            >
              {showSolution ? cell.digit : resultDigits[cell.placePower] ?? ""}
            </button>
          ) : <span className={`${styles.digitCell} inline-grid place-items-center`} aria-label={`${rowId}, ${placeLabel(cell.placePower)}: ${cell.digit || "puste"}`}>{cell.digit || <span aria-hidden>□</span>}</span>}
          {cell.placePower === 0 ? <span className="sr-only">Następna jest stała kolumna przecinka.</span> : null}
        </td>
      )).reduce<ReactNode[]>((nodes, cellNode, index) => {
        nodes.push(cellNode);
        if (digits[index].placePower === 0 && digits.some((cell) => cell.placePower < 0)) {
          nodes.push(<td key={`${rowId}-comma`} id={`${rowId}-comma`} className={showGuidance ? styles.commaColumn : "w-6 text-center text-2xl font-black text-slate-950"} data-comma-guide>,</td>);
        }
        return nodes;
      }, [])}
    </>
  );

  const renderCarryCells = () => (
    <>
      {model.columns.map((power) => (
        <td key={`carry-${power}`} className={`p-1 ${activeInput === "carry" && activePower === power ? styles.activeColumn : ""}`}>
          <button
            type="button"
            disabled={showSolution}
            onClick={() => { onActiveInputChange?.("carry"); onActivePowerChange?.(power); }}
            aria-label={`Przeniesienie, ${placeLabel(power)}`}
            className="grid h-9 w-9 place-items-center rounded-md border-2 border-slate-400 bg-white font-mono text-lg font-black text-slate-950 sm:h-10 sm:w-10"
          >
            {carryDigits[power] ?? ""}
          </button>
        </td>
      )).reduce<ReactNode[]>((nodes, cellNode, index) => {
        nodes.push(cellNode);
        if (model.columns[index] === 0 && hasDecimalColumns) nodes.push(<td key="carry-comma" className="w-6" />);
        return nodes;
      }, [])}
    </>
  );

  return (
    <section className="space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-4" aria-label={`${operation === "add" ? "Dodawanie" : "Odejmowanie"} pisemne liczb dziesiętnych`}>
      <div className={styles.workspace}>
        <table className="mx-auto border-separate border-spacing-1 text-center">
          <caption className="sr-only">Jedna cyfra w kratce, przecinki w pionowej linii.</caption>
          {showGuidance ? <thead>
            <tr>
              <th scope="col" className="w-10"><span className="sr-only">Znak działania</span></th>
              {model.columns.map((power) => (
                <th key={power} scope="col" className="max-w-[76px] p-1 text-[10px] font-black leading-tight text-slate-600">{placeLabel(power)}</th>
              )).reduce<ReactNode[]>((nodes, header, index) => {
                nodes.push(header);
                if (model.columns[index] === 0 && model.columns.some((power) => power < 0)) nodes.push(<th key="comma-header" scope="col" className="w-6 text-violet-800">przecinek</th>);
                return nodes;
              }, [])}
            </tr>
          </thead> : null}
          <tbody>
            {!showGuidance ? <tr><th scope="row"><span className="sr-only">Przeniesienia</span></th>{renderCarryCells()}</tr> : null}
            <tr><th scope="row"><span className="sr-only">pierwszy składnik</span></th>{renderCells(operandDigitsForDisplay(model.rows[0]), "comma-left")}</tr>
            <tr><th scope="row" className="font-black">{operation === "add" ? "+" : "−"}</th>{renderCells(operandDigitsForDisplay(model.rows[1]), "comma-right")}</tr>
            <tr><td colSpan={tableColumnCount} className="p-0"><div className="mx-1 my-1 border-t-4 border-solid border-slate-950" aria-hidden /></td></tr>
            <tr><th scope="row"><span className="sr-only">wynik</span></th>{renderCells(model.result, "comma-result", true)}</tr>
          </tbody>
        </table>
      </div>

      {showGuidance ? <section aria-label="Wymiana i pożyczanie" className="rounded-2xl bg-amber-50 p-3">
        <h3 className="font-black text-amber-950">Ślad wymiany i pożyczania</h3>
        {model.exchanges.length ? (
          <ul className="mt-2 space-y-1 text-sm font-semibold text-amber-950">
            {model.exchanges.map((exchange) => <li key={`${exchange.kind}-${exchange.columnPower}`} data-exchange={exchange.kind}>↗ {exchange.label}</li>)}
          </ul>
        ) : <p className="mt-1 text-sm font-semibold text-amber-900">W tym działaniu nie trzeba wymieniać ani pożyczać.</p>}
      </section> : null}

      {showGuidance ? <InteractionAlternativePanel title="Sterowanie kolumnami" instruction="Wpisuj po jednej cyfrze. Aktywną kolumnę można wskazać bez przeciągania; przecinek pozostaje w stałej pionowej prowadnicy.">
        <p className="font-bold">{activePower === undefined ? "Wybierz kolumnę w narzędziu lekcji." : `Aktywna kolumna: ${placeLabel(activePower)}.`}</p>
      </InteractionAlternativePanel> : null}

      {presentation ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(presentation.result)} copy={presentation.copy} highlights={presentation.highlights} mode="practice" submitted /> : null}
    </section>
  );
}
