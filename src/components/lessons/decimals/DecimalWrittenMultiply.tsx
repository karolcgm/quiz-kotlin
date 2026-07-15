"use client";

import { useEffect, useRef, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { buildDecimalWrittenMultiplyModel, createDecimalDiagnosticResult } from "@/lib/math/decimals";
import { toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import styles from "@/components/lessons/decimals/decimals.module.css";

export type DecimalMultiplyPhase = "pairs" | "addition" | "decimal";

export interface DecimalWrittenMultiplyProps {
  top: string;
  bottom: string;
  phase?: DecimalMultiplyPhase;
  activePairIndex?: number;
  activeAdditionColumn?: number;
  partialProducts?: string[];
  onPartialProductChange?: (row: number, value: string) => void;
  placedProductPlaces?: number;
  onPlacedProductPlacesChange?: (places: number) => void;
  partialProductShifts?: number[];
  showSolution?: boolean;
  diagnosticCode?: DecimalFeedbackCode;
  onStepChange?: (step: { phase: DecimalMultiplyPhase; index: number }) => void;
}

function factorTokens(display: string, significantDigits: string): Array<{ character: string; digitIndex?: number }> {
  const normalized = display.replace(/\./gu, ",").replace(/^[+-]/u, "");
  const allDigits = normalized.replace(/[^0-9]/gu, "");
  const ignoredLeadingDigits = Math.max(0, allDigits.length - significantDigits.length);
  let seenDigits = 0;
  return [...normalized].map((character) => {
    if (!/^[0-9]$/u.test(character)) return { character };
    const sourceIndex = seenDigits;
    seenDigits += 1;
    return { character, digitIndex: sourceIndex >= ignoredLeadingDigits ? sourceIndex - ignoredLeadingDigits : undefined };
  });
}

export function DecimalWrittenMultiply({
  top,
  bottom,
  phase: controlledPhase,
  activePairIndex,
  activeAdditionColumn,
  partialProducts = [],
  onPartialProductChange,
  placedProductPlaces,
  onPlacedProductPlacesChange,
  partialProductShifts,
  showSolution = false,
  diagnosticCode,
  onStepChange,
}: DecimalWrittenMultiplyProps) {
  const model = buildDecimalWrittenMultiplyModel(top, bottom);
  const [internalPhase, setInternalPhase] = useState<DecimalMultiplyPhase>("pairs");
  const [internalIndex, setInternalIndex] = useState(0);
  const phase = controlledPhase ?? internalPhase;
  const index = phase === "pairs"
    ? Math.max(0, Math.min(model.pairs.length - 1, activePairIndex ?? internalIndex))
    : phase === "addition"
      ? Math.max(0, Math.min(model.additionColumns.length - 1, activeAdditionColumn ?? internalIndex))
      : 0;
  const activePair = phase === "pairs" ? model.pairs[index] : null;
  const activeColumn = phase === "addition" ? model.additionColumns[index] : null;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [phase, index]);

  const choose = (nextPhase: DecimalMultiplyPhase, nextIndex: number) => {
    if (controlledPhase === undefined) {
      setInternalPhase(nextPhase);
      setInternalIndex(nextIndex);
    }
    onStepChange?.({ phase: nextPhase, index: nextIndex });
  };
  const previous = () => {
    if (phase === "decimal") choose("addition", model.additionColumns.length - 1);
    else if (phase === "addition" && index === 0) choose("pairs", model.pairs.length - 1);
    else choose(phase, Math.max(0, index - 1));
  };
  const next = () => {
    if (phase === "pairs" && index < model.pairs.length - 1) choose("pairs", index + 1);
    else if (phase === "pairs") choose("addition", 0);
    else if (phase === "addition" && index < model.additionColumns.length - 1) choose("addition", index + 1);
    else choose("decimal", 0);
  };

  let activeDiagnostic = diagnosticCode;
  if (!activeDiagnostic && partialProductShifts
    && JSON.stringify(partialProductShifts) !== JSON.stringify(model.partialProducts.map((partial) => partial.shift))) {
    activeDiagnostic = DECIMAL_FEEDBACK_CODES.partialProductShift;
  }
  if (!activeDiagnostic && placedProductPlaces !== undefined && placedProductPlaces !== model.productPlaces) {
    activeDiagnostic = DECIMAL_FEEDBACK_CODES.productPlaces;
  }
  const presentation = activeDiagnostic
    ? createDecimalDiagnosticResult(activeDiagnostic, { memberIds: activeDiagnostic === DECIMAL_FEEDBACK_CODES.productPlaces ? ["factor-top-decimals", "factor-bottom-decimals", "product-decimals"] : [activePair?.id ?? "partial-row"] })
    : null;
  const topTokens = factorTokens(model.top.trace.display, model.integerTop);
  const bottomTokens = factorTokens(model.bottom.trace.display, model.integerBottom);

  return (
    <section className="space-y-5 rounded-3xl border-2 border-slate-200 bg-white p-4" aria-label="Mnożenie pisemne liczb dziesiętnych">
      <header>
        <p className="text-xs font-black uppercase tracking-wider text-indigo-700">
          {phase === "pairs" ? `Para cyfr ${index + 1} z ${model.pairs.length}` : phase === "addition" ? `Kolumna dodawania ${index + 1} z ${model.additionColumns.length}` : "Etap przecinka"}
        </p>
        <h3 ref={headingRef} tabIndex={-1} className="mt-1 text-xl font-black text-slate-950 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-600">
          {phase === "pairs" ? "Oblicz iloczyn aktywnej pary po skosie" : phase === "addition" ? "Dodaj pionową kolumnę iloczynów częściowych" : "Wylicz liczbę miejsc po przecinku"}
        </h3>
      </header>

      <div className={`${styles.workspace} space-y-2 rounded-2xl bg-slate-50 p-4 text-right`}>
        <div className="flex justify-end gap-2" aria-label={`Pierwszy czynnik ${top}`}>
          {topTokens.map((token, tokenIndex) => {
            if (token.character === ",") return <span key={`top-comma-${tokenIndex}`} id="factor-top-decimals" className={styles.commaColumn} aria-label="Przecinek pierwszego czynnika">,</span>;
            const active = token.digitIndex !== undefined && activePair?.topIndex === token.digitIndex;
            return <span key={`top-${tokenIndex}`} data-factor="top" data-digit-index={token.digitIndex} className={`${styles.digitCell} relative inline-grid place-items-center ${active ? styles.activeColumn : ""}`}>{token.character}{active ? <span className="absolute -right-2 -top-3 grid size-7 place-items-center rounded-full border-2 bg-white text-xs">{activePair.symbol}</span> : null}</span>;
          })}
        </div>
        <div className="flex items-center justify-end gap-2 border-b-4 border-slate-900 pb-2" aria-label={`Drugi czynnik ${bottom}`}>
          <span className="mr-2 text-2xl font-black">×</span>
          {bottomTokens.map((token, tokenIndex) => {
            if (token.character === ",") return <span key={`bottom-comma-${tokenIndex}`} id="factor-bottom-decimals" className={styles.commaColumn} aria-label="Przecinek drugiego czynnika">,</span>;
            const active = token.digitIndex !== undefined && activePair?.bottomIndex === token.digitIndex;
            return <span key={`bottom-${tokenIndex}`} data-factor="bottom" data-digit-index={token.digitIndex} className={`${styles.digitCell} relative inline-grid place-items-center ${active ? styles.activeColumn : ""}`}>{token.character}{active ? <span className="absolute -right-2 -top-3 grid size-7 place-items-center rounded-full border-2 bg-white text-xs">{activePair.symbol}</span> : null}</span>;
          })}
        </div>

        <div className="space-y-2" aria-label="Iloczyny częściowe">
          {model.partialProducts.map((partial, row) => (
            <label key={partial.id} className={`flex items-center justify-end gap-2 ${phase === "pairs" && activePair?.bottomPower === partial.shift ? styles.activeColumn : ""}`} data-partial-row={row} data-shift={partial.shift}>
              <span className="text-xs font-bold text-slate-600">wiersz {row + 1}, przesunięcie {partial.shift}</span>
              <input
                type="text"
                inputMode="numeric"
                value={showSolution ? partial.digits : partialProducts[row] ?? ""}
                readOnly={showSolution || !onPartialProductChange}
                aria-label={`Iloczyn częściowy ${row + 1}`}
                className={`${styles.digitCell} w-48 px-3 text-right`}
                onChange={(event) => onPartialProductChange?.(row, event.target.value.replace(/[^0-9]/gu, ""))}
              />
            </label>
          ))}
        </div>
        <div className="flex justify-end border-t-4 border-slate-900 pt-2">
          <span id="product-decimals" className={`${styles.digitCell} inline-grid w-56 place-items-center`} data-product-grid>{showSolution ? model.productDisplay : ""}<span className="sr-only">Docelowa kratka iloczynu</span></span>
        </div>
      </div>

      {activePair ? (
        <AccessibleMathSvg
          title={`Łącznik pary ${activePair.symbol}`}
          description={`Cyfra ${activePair.topDigit} pierwszego czynnika i cyfra ${activePair.bottomDigit} drugiego czynnika prowadzą po skosie do kolumny ${activePair.targetColumn} iloczynu częściowego.`}
          viewBox="0 0 320 150"
          columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }]}
          rows={[
            { element: "górna cyfra", value: activePair.topDigit },
            { element: "dolna cyfra", value: activePair.bottomDigit },
            { element: "docelowa kolumna", value: activePair.targetColumn },
          ]}
          className="h-36 w-full"
        >
          <circle cx="55" cy="35" r="22" fill="#eef2ff" stroke="#4f46e5" strokeWidth="3" />
          <text x="55" y="42" textAnchor="middle" fontWeight="900">{activePair.topDigit}</text>
          <circle cx="130" cy="105" r="22" fill="#eef2ff" stroke="#4f46e5" strokeWidth="3" />
          <text x="130" y="112" textAnchor="middle" fontWeight="900">{activePair.bottomDigit}</text>
          <line x1="72" y1="50" x2="240" y2="105" className={styles.diagonalConnector} data-pair-connector={activePair.id} />
          <rect x="235" y="82" width="55" height="48" rx="8" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" data-target-column={activePair.targetColumn} />
          <text x="262" y="112" textAnchor="middle" fontWeight="900">{activePair.product}</text>
          <text x="155" y="60" textAnchor="middle" fontWeight="900">{activePair.symbol}</text>
        </AccessibleMathSvg>
      ) : null}

      {activeColumn ? (
        <section className="rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4" aria-label={`Aktywna kolumna dodawania ${activeColumn.column}`} data-addition-column={activeColumn.column}>
          <p className="font-black text-cyan-950">Kolumna {activeColumn.column}: {activeColumn.digits.join(" + ")} + przeniesienie {activeColumn.carryIn} = {activeColumn.resultDigit}, dalej {activeColumn.carryOut}.</p>
        </section>
      ) : null}

      {phase === "decimal" ? (
        <section className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-4" aria-label="Ustalanie przecinka w iloczynie">
          <p className="font-black text-violet-950">Miejsca po przecinku: {model.top.trace.fractionDigits.length} + {model.bottom.trace.fractionDigits.length} = {model.productPlaces}.</p>
          <label className="mt-3 block font-bold">Liczba miejsc w wyniku
            <input type="text" inputMode="numeric" value={placedProductPlaces ?? ""} className={`${styles.digitCell} ml-3`} aria-label="Liczba miejsc po przecinku w iloczynie" onChange={(event) => onPlacedProductPlacesChange?.(Number(event.target.value.replace(/[^0-9]/gu, "")))} />
          </label>
        </section>
      ) : null}

      <InteractionAlternativePanel title="Sterowanie etapami mnożenia" instruction="Przyciski przechodzą przez każdą parę po skosie, każdą kolumnę dodawania i osobny etap przecinka.">
        <button type="button" className="min-h-12 rounded-xl border-2 bg-white px-4 font-black" disabled={phase === "pairs" && index === 0} onClick={previous}>← Poprzedni</button>
        <button type="button" className="min-h-12 rounded-xl bg-indigo-700 px-4 font-black text-white" disabled={phase === "decimal"} onClick={next}>Następny →</button>
        <button type="button" className="min-h-12 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 font-black" onClick={() => choose("pairs", 0)}>Resetuj</button>
      </InteractionAlternativePanel>

      {presentation ? <DiagnosticFeedbackPanel result={toPublicLessonGradeResult(presentation.result)} copy={presentation.copy} highlights={presentation.highlights} mode="practice" submitted /> : null}
    </section>
  );
}
