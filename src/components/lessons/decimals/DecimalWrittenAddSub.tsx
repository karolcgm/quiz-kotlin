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
  resultDigits?: Record<number, DecimalDigit>;
  onResultDigitChange?: (power: number, digit: DecimalDigit) => void;
  commaAligned?: boolean;
  showSolution?: boolean;
  diagnosticCode?: DecimalFeedbackCode;
}

function placeLabel(power: number): string {
  return DECIMAL_PLACES.find((place) => place.power === power)?.label ?? `10 do potęgi ${power}`;
}

export function DecimalWrittenAddSub({
  left,
  right,
  operation,
  activePower,
  resultDigits = {},
  commaAligned = true,
  showSolution = false,
  diagnosticCode,
}: DecimalWrittenAddSubProps) {
  const model = buildDecimalWrittenAddSubModel(left, right, operation);
  const activeDiagnostic = diagnosticCode ?? (!commaAligned ? DECIMAL_FEEDBACK_CODES.commaMisaligned : undefined);
  const presentation = activeDiagnostic
    ? createDecimalDiagnosticResult(activeDiagnostic, { memberIds: activeDiagnostic === DECIMAL_FEEDBACK_CODES.commaMisaligned ? ["comma-left", "comma-right", "comma-result"] : [`column-${activePower ?? 0}`] })
    : null;

  const renderCells = (digits: typeof model.result, rowId: string, editable = false) => (
    <>
      {digits.map((cell) => (
        <td key={cell.id} className={`p-1 ${activePower === cell.placePower ? styles.activeColumn : ""}`} data-column-power={cell.placePower}>
          {editable ? (
            <input
              value={showSolution ? cell.digit : resultDigits[cell.placePower] ?? ""}
              readOnly
              inputMode="none"
              maxLength={1}
              aria-label={`Wynik, ${placeLabel(cell.placePower)}`}
              className={styles.digitCell}
            />
          ) : <span className={`${styles.digitCell} inline-grid place-items-center`} aria-label={`${rowId}, ${placeLabel(cell.placePower)}: ${cell.digit || "puste"}`}>{cell.digit || <span aria-hidden>□</span>}</span>}
          {cell.placePower === 0 ? <span className="sr-only">Następna jest stała kolumna przecinka.</span> : null}
        </td>
      )).reduce<ReactNode[]>((nodes, cellNode, index) => {
        nodes.push(cellNode);
        if (digits[index].placePower === 0 && digits.some((cell) => cell.placePower < 0)) {
          nodes.push(<td key={`${rowId}-comma`} id={`${rowId}-comma`} className={styles.commaColumn} data-comma-guide>,</td>);
        }
        return nodes;
      }, [])}
    </>
  );

  return (
    <section className="space-y-4 rounded-3xl border-2 border-slate-200 bg-white p-4" aria-label={`${operation === "add" ? "Dodawanie" : "Odejmowanie"} pisemne liczb dziesiętnych`}>
      <div className={styles.workspace}>
        <table className="mx-auto border-separate border-spacing-1 text-center">
          <caption className="sr-only">Jedna cyfra w kratce, przecinki w pionowej linii.</caption>
          <thead>
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
          </thead>
          <tbody>
            <tr><th scope="row" className="font-black">{operation === "add" ? "+" : "−"}</th>{renderCells(model.rows[0], "comma-left")}</tr>
            <tr className="border-b-4 border-slate-900"><th scope="row"><span className="sr-only">drugi składnik</span></th>{renderCells(model.rows[1], "comma-right")}</tr>
            <tr><th scope="row"><span className="sr-only">wynik</span></th>{renderCells(model.result, "comma-result", true)}</tr>
          </tbody>
        </table>
      </div>

      <section aria-label="Wymiana i pożyczanie" className="rounded-2xl bg-amber-50 p-3">
        <h3 className="font-black text-amber-950">Ślad wymiany i pożyczania</h3>
        {model.exchanges.length ? (
          <ul className="mt-2 space-y-1 text-sm font-semibold text-amber-950">
            {model.exchanges.map((exchange) => <li key={`${exchange.kind}-${exchange.columnPower}`} data-exchange={exchange.kind}>↗ {exchange.label}</li>)}
          </ul>
        ) : <p className="mt-1 text-sm font-semibold text-amber-900">W tym działaniu nie trzeba wymieniać ani pożyczać.</p>}
      </section>

      <InteractionAlternativePanel title="Sterowanie kolumnami" instruction="Wpisuj po jednej cyfrze. Aktywną kolumnę można wskazać bez przeciągania; przecinek pozostaje w stałej pionowej prowadnicy.">
        <p className="font-bold">{activePower === undefined ? "Wybierz kolumnę w narzędziu lekcji." : `Aktywna kolumna: ${placeLabel(activePower)}.`}</p>
      </InteractionAlternativePanel>

      {presentation ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(presentation.result)} copy={presentation.copy} highlights={presentation.highlights} mode="practice" submitted /> : null}
    </section>
  );
}
